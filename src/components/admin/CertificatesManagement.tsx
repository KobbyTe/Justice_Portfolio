import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Loader2, Pencil, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/utils/imageOptimizer';
import { convertHEIFToPNG, isHEIFFile } from '@/utils/imageConverter';

interface Certificate {
  id: string;
  title: string;
  issuer: string | null;
  description: string | null;
  category: string;
  file_url: string | null;
  credential_url: string | null;
  issued_on: string | null;
  is_active: boolean;
}

type CertificateForm = {
  title: string;
  issuer: string;
  description: string;
  category: string;
  credential_url: string;
  issued_on: string;
};

const BUCKET = 'portfolio-assets';
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`;
const MAX_FILE_MB = 20;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const CATEGORIES = ['Robotics', 'STEM', 'Space / STEM', 'AI', 'Leadership', 'Other'];
const ALLOWED_EXT = ['jpg', 'jpeg', 'jfif', 'png', 'webp', 'heic', 'heif'];
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];

const emptyForm: CertificateForm = {
  title: '',
  issuer: '',
  description: '',
  category: 'Robotics',
  credential_url: '',
  issued_on: '',
};

/** Error with a safe admin-facing message; technical details stay in the console. */
class CertificateError extends Error {}

const logError = (stage: string, err: unknown, extra: Record<string, unknown> = {}) => {
  const e = err as { message?: string; name?: string; statusCode?: string | number; status?: number; code?: string } | null;
  console.error(`[Certificates] ${stage}`, {
    message: e?.message,
    name: e?.name,
    statusCode: e?.statusCode ?? e?.status,
    code: e?.code,
    ...extra,
  });
};

/** Returns the storage path for files we own in portfolio-assets; null for anything else (e.g. /uploads/...). */
const storagePathFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  const idx = url.indexOf(PUBLIC_MARKER);
  if (idx === -1) return null;
  const path = decodeURIComponent(url.slice(idx + PUBLIC_MARKER.length).split('?')[0]);
  return path.startsWith('certificates/') ? path : null;
};

const getExtension = (name: string) => (name.split('.').pop() || '').toLowerCase();

// 1. Authentication — refresh the session if it is missing or about to expire.
const ensureAdminSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  let session = data.session;
  const expiresSoon = session?.expires_at ? session.expires_at * 1000 - Date.now() < 60_000 : false;
  if (error || !session || expiresSoon) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
    if (refreshed.error || !session) {
      logError('Authentication failed', refreshed.error ?? error);
      throw new CertificateError('Your admin session has expired. Please sign in again, then retry.');
    }
  }
  return session;
};

// 2. Validation
const validateCertificateFile = (file: File) => {
  const ext = getExtension(file.name);
  const type = (file.type || '').toLowerCase();
  if (!ALLOWED_MIME.includes(type) && !ALLOWED_EXT.includes(ext)) {
    throw new CertificateError('Unsupported certificate format. Please upload JPG, PNG, WEBP or HEIC.');
  }
  if (file.size === 0) throw new CertificateError('The selected file is empty. Please choose another image.');
  if (file.size > MAX_FILE_BYTES) {
    throw new CertificateError(`Certificate image is too large. Maximum size is ${MAX_FILE_MB} MB.`);
  }
};

const canDecode = async (file: Blob): Promise<boolean> => {
  try {
    if (typeof createImageBitmap === 'function') {
      const bmp = await createImageBitmap(file);
      const ok = bmp.width > 0 && bmp.height > 0;
      bmp.close();
      return ok;
    }
  } catch {
    return false;
  }
  return true;
};

// 3. Processing — HEIC→PNG, then compress to JPEG; fall back to original only if it decodes.
const processCertificateImage = async (file: File): Promise<{ blob: File; contentType: string; extension: string }> => {
  let working = file;
  if (isHEIFFile(file)) {
    try {
      working = await convertHEIFToPNG(file);
    } catch (err) {
      logError('Image processing failed', err, { stage: 'heic-conversion', fileName: file.name });
      throw new CertificateError('Could not convert this HEIC/HEIF photo. Please export it as JPG or PNG and retry.');
    }
  }

  try {
    const compressed = await compressImage(working, 1920, 0.86);
    if (compressed.size > 0) return { blob: compressed, contentType: 'image/jpeg', extension: 'jpg' };
  } catch (err) {
    logError('Image processing failed', err, { stage: 'compression', fileName: working.name });
  }

  if (!(await canDecode(working))) {
    throw new CertificateError('This image could not be read. It may be damaged — please export it again as JPG or PNG.');
  }
  const ext = getExtension(working.name);
  const extension = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const contentType = working.type.startsWith('image/') ? working.type : extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  return { blob: working, contentType, extension };
};

// 4–6. Upload and resolve the public URL only after storage confirms success.
const uploadCertificateFile = async (original: File) => {
  const { blob, contentType, extension } = await processCertificateImage(original);
  const safeBase = original.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 80) || 'certificate';
  const path = `certificates/${crypto.randomUUID()}-${safeBase}.${extension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { cacheControl: '31536000', contentType, upsert: false });
  if (error || !data?.path) {
    logError('Storage upload failed', error, { path });
    throw new CertificateError('The image could not be uploaded. Please check your connection and retry.');
  }

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(data.path).data.publicUrl;
  if (!publicUrl) {
    logError('Public URL generation failed', null, { path: data.path });
    await cleanupUploadedCertificate(data.path);
    throw new CertificateError('The image uploaded but its link could not be created. Please retry.');
  }
  return { path: data.path, publicUrl };
};

const cleanupUploadedCertificate = async (path: string | null): Promise<boolean> => {
  if (!path) return true;
  const { data, error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error || !data || data.length === 0) {
    logError('Storage cleanup failed', error, { path });
    return false;
  }
  return true;
};

const toPayload = (form: CertificateForm) => ({
  title: form.title.trim(),
  issuer: form.issuer.trim() || null,
  description: form.description.trim() || null,
  category: form.category,
  credential_url: form.credential_url.trim() || null,
  issued_on: form.issued_on || null,
});

const CertificatesManagement = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Certificate[]>([]);
  const [form, setForm] = useState<CertificateForm>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      logError('Loading certificates failed', error);
      return;
    }
    setItems((data as Certificate[]) || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditing(null);
    setFormError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (cert: Certificate) => {
    setEditing(cert);
    setFile(null);
    setFormError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setForm({
      title: cert.title,
      issuer: cert.issuer || '',
      description: cert.description || '',
      category: CATEGORIES.includes(cert.category) ? cert.category : 'Other',
      credential_url: cert.credential_url || '',
      issued_on: cert.issued_on || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return; // guards double-clicks before React re-renders
    if (!form.title.trim()) {
      setFormError('Please enter a certificate title.');
      return;
    }
    if (file) {
      try {
        validateCertificateFile(file);
      } catch (err) {
        setFormError((err as Error).message);
        return;
      }
    }

    submittingRef.current = true;
    setSaving(true);
    setFormError('');
    let uploadedPath: string | null = null;

    try {
      await ensureAdminSession();

      let fileUrl: string | null | undefined;
      if (file) {
        const uploaded = await uploadCertificateFile(file);
        uploadedPath = uploaded.path;
        fileUrl = uploaded.publicUrl;
      }

      const payload = { ...toPayload(form), ...(fileUrl !== undefined ? { file_url: fileUrl } : {}) };

      if (editing) {
        const { error } = await supabase.from('certificates').update(payload).eq('id', editing.id);
        if (error) {
          logError('Database update failed', error, { certificateId: editing.id, path: uploadedPath });
          throw new CertificateError('The certificate could not be updated. Please retry.');
        }
        uploadedPath = null; // committed
        // Replace image: remove the previous file only after the new one is saved.
        if (fileUrl) {
          const oldPath = storagePathFromUrl(editing.file_url);
          if (oldPath && oldPath !== storagePathFromUrl(fileUrl)) await cleanupUploadedCertificate(oldPath);
        }
        toast({ title: 'Certificate updated' });
      } else {
        const { data, error } = await supabase.from('certificates').insert(payload).select('id').single();
        if (error || !data) {
          logError('Database insert failed', error, { path: uploadedPath });
          throw new CertificateError('The certificate could not be saved. Please retry.');
        }
        uploadedPath = null; // committed
        toast({ title: 'Certificate added' });
      }

      resetForm();
      await load(); // a refresh failure does not mean the save failed
    } catch (err: unknown) {
      if (uploadedPath) await cleanupUploadedCertificate(uploadedPath);
      if (!(err instanceof CertificateError)) logError('Unexpected error', err);
      const message = err instanceof CertificateError ? err.message : 'Something went wrong. Please retry.';
      setFormError(message);
      toast({ title: editing ? 'Could not update certificate' : 'Could not add certificate', description: message, variant: 'destructive' });
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const toggleActive = async (cert: Certificate) => {
    setBusyId(cert.id);
    const { error } = await supabase.from('certificates').update({ is_active: !cert.is_active }).eq('id', cert.id);
    setBusyId(null);
    if (error) {
      logError('Database update failed', error, { certificateId: cert.id });
      toast({ title: 'Update failed', description: 'Please retry.', variant: 'destructive' });
      return;
    }
    load();
  };

  const remove = async (cert: Certificate) => {
    if (!window.confirm(`Delete "${cert.title}"? This cannot be undone.`)) return;
    setBusyId(cert.id);
    const { error } = await supabase.from('certificates').delete().eq('id', cert.id);
    if (error) {
      setBusyId(null);
      logError('Database delete failed', error, { certificateId: cert.id });
      toast({ title: 'Delete failed', description: 'Please retry.', variant: 'destructive' });
      return;
    }
    const path = storagePathFromUrl(cert.file_url);
    const cleaned = await cleanupUploadedCertificate(path);
    setBusyId(null);
    if (editing?.id === cert.id) resetForm();
    toast(
      cleaned
        ? { title: 'Certificate deleted' }
        : { title: 'Certificate deleted', description: 'Its image file could not be removed from storage.', variant: 'destructive' }
    );
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Certificate' : 'Add Certificate'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              placeholder="Title"
              value={form.title}
              maxLength={140}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              placeholder="Issuing organization"
              value={form.issuer}
              maxLength={140}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
            />
            <Textarea
              placeholder="Brief description"
              value={form.description}
              maxLength={500}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cert-category">Category</Label>
                <select
                  id="cert-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-date">Issued on</Label>
                <Input
                  id="cert-date"
                  type="date"
                  value={form.issued_on}
                  onChange={(e) => setForm({ ...form, issued_on: e.target.value })}
                />
              </div>
            </div>
            <Input
              placeholder="Credential/verification URL (optional)"
              value={form.credential_url}
              maxLength={500}
              onChange={(e) => setForm({ ...form, credential_url: e.target.value })}
            />
            <div className="space-y-2">
              <Label htmlFor="cert-file">
                {editing ? 'Replace certificate image (optional)' : 'Certificate image (optional)'}
              </Label>
              <Input
                ref={fileInputRef}
                id="cert-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                onChange={(e) => {
                  setFormError('');
                  const selected = e.target.files?.[0] || null;
                  if (selected) {
                    try {
                      validateCertificateFile(selected);
                    } catch (err) {
                      setFormError((err as Error).message);
                    }
                  }
                  setFile(selected);
                }}
              />
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP, HEIC or HEIF, up to {MAX_FILE_MB} MB.</p>
            </div>
            {formError && (
              <p id="certificate-save-error" role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving} aria-busy={saving} aria-describedby={formError ? 'certificate-save-error' : undefined}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : editing ? (
                  <Save className="w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {saving ? (file ? 'Uploading…' : 'Saving…') : editing ? 'Save Changes' : 'Add Certificate'}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certificates ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && <p className="text-sm text-muted-foreground">No certificates yet.</p>}
          {items.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                {cert.file_url && <img src={cert.file_url} alt="" className="w-12 h-12 rounded object-cover" />}
                <div className="min-w-0">
                  <p className="font-medium truncate">{cert.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {[cert.category, cert.issuer].filter(Boolean).join(' • ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => startEdit(cert)} disabled={saving} aria-label={`Edit ${cert.title}`}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleActive(cert)} disabled={busyId === cert.id}>
                  {cert.is_active ? 'Hide' : 'Show'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(cert)}
                  disabled={busyId === cert.id}
                  aria-label={`Delete ${cert.title}`}
                >
                  {busyId === cert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificatesManagement;
