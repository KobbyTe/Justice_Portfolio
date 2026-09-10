import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { compressImage, validateImage } from '@/utils/imageOptimizer';
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

const CATEGORIES = ['Robotics', 'STEM', 'Space / STEM', 'AI', 'Leadership', 'Other'];

const emptyForm = {
  title: '',
  issuer: '',
  description: '',
  category: 'Robotics',
  credential_url: '',
  issued_on: '',
};

const CertificatesManagement = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Certificate[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setItems((data as Certificate[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setFormError('');
    setSaving(true);
    let uploadedPath: string | null = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('Your admin session has expired. Sign in again, then retry.');
      }

      let fileUrl: string | null = null;
      if (file) {
        const validation = validateImage(file);
        if (!validation.valid) throw new Error(validation.error || 'Choose a valid certificate image.');

        const convertedFile = isHEIFFile(file) ? await convertHEIFToPNG(file) : file;
        const uploadFile = await compressImage(convertedFile, 1920, 0.86);
        const safeBaseName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 80);
        const path = `certificates/${crypto.randomUUID()}-${safeBaseName || 'certificate'}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('portfolio-assets')
          .upload(path, uploadFile, { cacheControl: '31536000', contentType: 'image/jpeg', upsert: false });
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        uploadedPath = path;
        fileUrl = supabase.storage.from('portfolio-assets').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from('certificates').insert({
        title: form.title.trim(),
        issuer: form.issuer.trim() || null,
        description: form.description.trim() || null,
        category: form.category,
        credential_url: form.credential_url.trim() || null,
        issued_on: form.issued_on || null,
        file_url: fileUrl,
      });
      if (error) throw new Error(`Certificate save failed: ${error.message}`);

      toast({ title: 'Certificate added' });
      setForm(emptyForm);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
    } catch (err: unknown) {
      if (uploadedPath) {
        await supabase.storage.from('portfolio-assets').remove([uploadedPath]);
      }
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please retry.';
      setFormError(message);
      toast({ title: 'Could not add certificate', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cert: Certificate) => {
    const { error } = await supabase
      .from('certificates')
      .update({ is_active: !cert.is_active })
      .eq('id', cert.id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Certificate deleted' });
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(e) => setForm({ ...form, credential_url: e.target.value })}
            />
            <div className="space-y-2">
              <Label htmlFor="cert-file">Certificate image (optional)</Label>
              <Input
                ref={fileInputRef}
                id="cert-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                onChange={(e) => {
                  setFormError('');
                  setFile(e.target.files?.[0] || null);
                }}
              />
              <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, HEIC or HEIF, up to 20 MB.</p>
            </div>
            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <Button type="submit" disabled={saving} aria-describedby={formError ? 'certificate-save-error' : undefined}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Certificate
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certificates ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No certificates yet.</p>
          )}
          {items.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center justify-between gap-4 p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                {cert.file_url && (
                  <img src={cert.file_url} alt="" className="w-12 h-12 rounded object-cover" />
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{cert.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {[cert.category, cert.issuer].filter(Boolean).join(' • ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => toggleActive(cert)}>
                  {cert.is_active ? 'Hide' : 'Show'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => remove(cert.id)}>
                  <Trash2 className="w-4 h-4" />
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
