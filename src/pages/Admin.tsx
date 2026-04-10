import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Upload, Eye, EyeOff, LogOut, Link, Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { isHEIFFile, convertHEIFToPNG, convertToWebP, ConvertedImages } from '@/utils/imageConverter';
import OptimizedImage from '@/components/OptimizedImage';
import BlogManagement from '@/components/admin/BlogManagement';
import ImpactMetricsEditor from '@/components/admin/ImpactMetricsEditor';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import AppointmentManagement from '@/components/admin/AppointmentManagement';
import SkillsEditor from '@/components/admin/SkillsEditor';

const Admin = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // State for all content types
  const [heroImages, setHeroImages] = useState([]);
  const [aboutContent, setAboutContent] = useState(null);
  const [techStack, setTechStack] = useState([]);
  const [projects, setProjects] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [wallMessages, setWallMessages] = useState([]);
  const [partnerLogos, setPartnerLogos] = useState([]);
  const [recommendationTokens, setRecommendationTokens] = useState([]);
  const [tokenName, setTokenName] = useState('');
  const [tokenEmail, setTokenEmail] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [editingRec, setEditingRec] = useState<any>(null);
  const [recForm, setRecForm] = useState<any>({});

  // Form states
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [projectCategory, setProjectCategory] = useState<string>('');
  const [galleryCategory, setGalleryCategory] = useState<string>('All');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let initialCheckDone = false;

    const checkAdminRole = async (userId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });
      return !error && data === true;
    };

    const handleSession = async (session: any) => {
      if (!session) {
        setAuthChecked(true);
        navigate('/auth');
        return;
      }
      const admin = await checkAdminRole(session.user.id);
      if (!admin) {
        toast.error('Access denied. Admin role required.');
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }
      setIsAdmin(true);
      setAuthChecked(true);
      loadAllData();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip INITIAL_SESSION since getSession handles it
      if (event === 'INITIAL_SESSION') return;
      // Handle sign out, sign in, token refresh
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setAuthChecked(true);
        navigate('/auth');
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!initialCheckDone) return; // Let getSession handle first check
        await handleSession(session);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      initialCheckDone = true;
      await handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      const [heroRes, aboutRes, techRes, projectsRes, blogRes, socialRes, resumeRes, recommendationsRes, galleryRes, wallRes, logosRes, tokensRes] = await Promise.all([
        supabase.from('hero_images').select('*').eq('is_active', true),
        supabase.from('about_content').select('*').single(),
        supabase.from('tech_stack').select('*').eq('is_active', true),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('social_links').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('resume_files').select('*').order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').order('is_active', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('gallery').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('wall_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('partner_logos').select('*').order('sort_order'),
        supabase.from('recommendation_tokens').select('*').order('created_at', { ascending: false }),
      ]);

      setHeroImages(heroRes.data || []);
      setAboutContent(aboutRes.data);
      setTechStack(techRes.data || []);
      setProjects(projectsRes.data || []);
      setBlogPosts(blogRes.data || []);
      setSocialLinks(socialRes.data || []);
      setResumeFiles(resumeRes.data || []);
      setRecommendations(recommendationsRes.data || []);
      setGalleryItems(galleryRes.data || []);
      setWallMessages(wallRes.data || []);
      setPartnerLogos(logosRes.data || []);
      setRecommendationTokens(tokensRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    }
  };

  // Targeted reload functions for performance
  const reloadHeroImages = async () => {
    const { data } = await supabase.from('hero_images').select('*').eq('is_active', true);
    setHeroImages(data || []);
  };
  const reloadAbout = async () => {
    const { data } = await supabase.from('about_content').select('*').single();
    setAboutContent(data);
  };
  const reloadTechStack = async () => {
    const { data } = await supabase.from('tech_stack').select('*').eq('is_active', true);
    setTechStack(data || []);
  };
  const reloadProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
  };
  const reloadSocialLinks = async () => {
    const { data } = await supabase.from('social_links').select('*').eq('is_active', true).order('sort_order');
    setSocialLinks(data || []);
  };
  const reloadResumes = async () => {
    const { data } = await supabase.from('resume_files').select('*').order('created_at', { ascending: false });
    setResumeFiles(data || []);
  };
  const reloadRecommendations = async () => {
    const [recRes, tokRes] = await Promise.all([
      supabase.from('recommendations').select('*').order('is_active', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('recommendation_tokens').select('*').order('created_at', { ascending: false }),
    ]);
    setRecommendations(recRes.data || []);
    setRecommendationTokens(tokRes.data || []);
  };
  const reloadGallery = async () => {
    const { data } = await supabase.from('gallery').select('*').eq('is_active', true).order('sort_order');
    setGalleryItems(data || []);
  };
  const reloadWallMessages = async () => {
    const { data } = await supabase.from('wall_messages').select('*').order('created_at', { ascending: false });
    setWallMessages(data || []);
  };
  const reloadPartnerLogos = async () => {
    const { data } = await supabase.from('partner_logos').select('*').order('sort_order');
    setPartnerLogos(data || []);
  };

  const handleFileUpload = async (file, bucket = 'portfolio-assets') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Uploading file:', filePath, 'size:', file.size, 'type:', file.type);

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    console.log('Upload successful:', uploadData);
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Hero Images Management
  const handleAddHeroImage = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('image') as File;
    const alt_text = formData.get('alt_text') as string;

    if (!file) return;

    try {
      const imageUrl = await handleFileUpload(file);
      
      const { error } = await supabase
        .from('hero_images')
        .insert([{ image_url: imageUrl, alt_text }]);

      if (error) throw error;
      
      toast.success('Hero image added successfully');
      reloadHeroImages();
      e.target.reset();
    } catch (error) {
      toast.error('Failed to add hero image');
      console.error(error);
    }
  };

  const handleDeleteHeroImage = async (id) => {
    try {
      const { error } = await supabase
        .from('hero_images')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Hero image deleted successfully');
      reloadHeroImages();
    } catch (error) {
      toast.error('Failed to delete hero image');
    }
  };

  // About Content Management
  const handleUpdateAbout = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profile_image = formData.get('profile_image') as File;
    const hero_description = formData.get('hero_description') as string;
    const about_description = formData.get('about_description') as string;
    const location = formData.get('location') as string;

    try {
      let profile_image_url = aboutContent?.profile_image_url;
      
      if (profile_image && profile_image.size > 0) {
        profile_image_url = await handleFileUpload(profile_image);
      }

      const updateData = { hero_description, about_description, location, profile_image_url };

      const { error } = aboutContent 
        ? await supabase.from('about_content').update(updateData).eq('id', aboutContent.id)
        : await supabase.from('about_content').insert([updateData]);

      if (error) throw error;
      
      toast.success('About content updated successfully');
      reloadAbout();
    } catch (error) {
      toast.error('Failed to update about content');
      console.error(error);
    }
  };

  // Tech Stack Management
  const handleAddTechStack = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;

    try {
      // Generate icon URL based on name (simplified approach)
      const icon_url = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name.toLowerCase()}/${name.toLowerCase()}-original.svg`;
      
      const { error } = await supabase
        .from('tech_stack')
        .insert([{ name, category, icon_url }]);

      if (error) throw error;
      
      toast.success('Tech stack item added successfully');
      reloadTechStack();
      e.target.reset();
    } catch (error) {
      toast.error('Failed to add tech stack item');
      console.error(error);
    }
  };

  const handleDeleteTechStack = async (id) => {
    try {
      const { error } = await supabase
        .from('tech_stack')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Tech stack item deleted successfully');
      reloadTechStack();
    } catch (error) {
      toast.error('Failed to delete tech stack item');
    }
  };

  // Projects Management
  const handleAddProject = async (e) => {
    e.preventDefault();

    if (isUploading) return;

    const formData = new FormData(e.target);
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || null;
    const category = projectCategory as 'Robotics' | 'Web app' | 'Mobile app' | 'AI';

    if (!title) {
      toast.error('Please enter a project title');
      return;
    }
    if (!category) {
      toast.error('Please select a project category');
      return;
    }

    const project_url = (formData.get('project_url') as string)?.trim() || null;
    const github_url = (formData.get('github_url') as string)?.trim() || null;
    const techRaw = (formData.get('technologies') as string)?.trim();
    const technologies = techRaw ? techRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
    const image = formData.get('image') as File;

    setIsUploading(true);
    toast.info(image && image.size > 0 ? 'Uploading image and saving project...' : 'Saving project...');

    try {
      let image_url = null;
      if (image && image.size > 0) {
        image_url = await handleFileUpload(image);
      }

      const projectData = {
        title,
        description,
        category,
        project_url,
        github_url,
        technologies,
        image_url,
      };

      const { error } = isEditing
        ? await supabase.from('projects').update(projectData).eq('id', editingId)
        : await supabase.from('projects').insert([projectData]);

      if (error) throw error;

      toast.success(`Project ${isEditing ? 'updated' : 'added'} successfully!`);
      reloadProjects();
      e.target.reset();
      setIsEditing(false);
      setEditingId(null);
      setProjectCategory('');
    } catch (error) {
      const msg = (error as Error).message || 'Unknown error';
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} project: ${msg}`);
      console.error('Project upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProject = (project) => {
    setFormData(project);
    setIsEditing(true);
    setEditingId(project.id);
    setProjectCategory(project.category);
  };

  const handleDeleteProject = async (id) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Project deleted successfully');
      reloadProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  // Social Links Management
  const handleAddSocialLink = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const platform = formData.get('platform') as string;
    const url = formData.get('url') as string;
    const icon_name = formData.get('icon_name') as string;

    try {
      const { error } = await supabase
        .from('social_links')
        .insert([{ platform, url, icon_name, sort_order: socialLinks.length }]);

      if (error) throw error;
      
      toast.success('Social link added successfully');
      reloadSocialLinks();
      e.target.reset();
    } catch (error) {
      toast.error('Failed to add social link');
      console.error(error);
    }
  };

  const handleDeleteSocialLink = async (id) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Social link deleted successfully');
      reloadSocialLinks();
    } catch (error) {
      toast.error('Failed to delete social link');
    }
  };

  // Resume Files Management
  const handleAddResume = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('resume_file') as File;
    const file_name = formData.get('file_name') as string;
    const is_current = formData.get('is_current') === 'on';

    if (!file) return;

    try {
      const file_url = await handleFileUpload(file);
      
      // If this is set as current, update all others to not be current
      if (is_current) {
        await supabase.from('resume_files').update({ is_current: false });
      }

      const { error } = await supabase
        .from('resume_files')
        .insert([{ file_url, file_name, is_current }]);

      if (error) throw error;
      
      toast.success('Resume file added successfully');
      reloadResumes();
      e.target.reset();
    } catch (error) {
      toast.error('Failed to add resume file');
      console.error(error);
    }
  };

  const handleSetCurrentResume = async (id) => {
    try {
      // Set all to not current
      await supabase.from('resume_files').update({ is_current: false });
      
      // Set selected as current
      const { error } = await supabase
        .from('resume_files')
        .update({ is_current: true })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Resume set as current');
      reloadResumes();
    } catch (error) {
      toast.error('Failed to set current resume');
    }
  };

  const handleDeleteResume = async (id) => {
    try {
      const { error } = await supabase
        .from('resume_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Resume file deleted successfully');
      reloadResumes();
    } catch (error) {
      toast.error('Failed to delete resume file');
    }
  };

  // Recommendations Management
  const handleAddRecommendation = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name') as string;
    const position = formData.get('position') as string;
    const company = formData.get('company') as string;
    const message = formData.get('message') as string;
    const linkedin_url = formData.get('linkedin_url') as string;
    const twitter_url = formData.get('twitter_url') as string;
    const image = formData.get('image') as File;

    try {
      let recommender_image_url = null;
      if (image && image.size > 0) {
        recommender_image_url = await handleFileUpload(image);
      }

      const { error } = await supabase
        .from('recommendations')
        .insert([{ 
          name, 
          position, 
          company, 
          message, 
          linkedin_url, 
          twitter_url, 
          recommender_image_url,
          sort_order: recommendations.length 
        }]);

      if (error) throw error;
      
      toast.success('Recommendation added successfully');
      reloadRecommendations();
      e.target.reset();
    } catch (error) {
      toast.error('Failed to add recommendation');
      console.error(error);
    }
  };

  const handleDeleteRecommendation = async (id) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Recommendation deleted');
      reloadRecommendations();
    } catch (error) {
      toast.error('Failed to delete recommendation');
    }
  };

  const startEditRec = (rec: any) => {
    setEditingRec(rec);
    setRecForm({
      name: rec.name || '',
      position: rec.position || '',
      company: rec.company || '',
      message: rec.message || '',
      linkedin_url: rec.linkedin_url || '',
      twitter_url: rec.twitter_url || '',
    });
  };

  const handleUpdateRecommendation = async () => {
    if (!editingRec) return;
    try {
      const fileInput = document.getElementById('rec-edit-image') as HTMLInputElement;
      let recommender_image_url = editingRec.recommender_image_url;

      if (fileInput?.files?.[0]) {
        recommender_image_url = await handleFileUpload(fileInput.files[0]);
      }

      const { error } = await supabase
        .from('recommendations')
        .update({
          name: recForm.name?.trim(),
          position: recForm.position?.trim() || null,
          company: recForm.company?.trim() || null,
          message: recForm.message?.trim(),
          linkedin_url: recForm.linkedin_url?.trim() || null,
          twitter_url: recForm.twitter_url?.trim() || null,
          recommender_image_url,
        })
        .eq('id', editingRec.id);

      if (error) throw error;
      toast.success('Recommendation updated');
      setEditingRec(null);
      reloadRecommendations();
    } catch (error) {
      toast.error('Failed to update recommendation');
      console.error(error);
    }
  };

  const handleToggleRecommendation = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentActive ? 'Recommendation hidden' : 'Recommendation approved');
      reloadRecommendations();
    } catch (error) {
      toast.error('Failed to update recommendation');
    }
  };

  const handleGenerateToken = async () => {
    if (!tokenName.trim()) {
      toast.error('Please enter a recommender name');
      return;
    }

    const newToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      const { error } = await supabase
        .from('recommendation_tokens')
        .insert([{
          token: newToken,
          recommender_name: tokenName.trim(),
          recommender_email: tokenEmail.trim() || null,
          expires_at: expiresAt.toISOString(),
        }]);

      if (error) throw error;

      toast.success('Recommendation link generated!');
      setTokenName('');
      setTokenEmail('');
      reloadRecommendations();
    } catch (error) {
      toast.error('Failed to generate link');
      console.error(error);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/recommend/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDeleteToken = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recommendation_tokens')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Token deleted');
      reloadRecommendations();
    } catch (error) {
      toast.error('Failed to delete token');
    }
  };

  // Gallery Management
  const isVideoFile = (file: File): boolean => {
    return file.type.startsWith('video/');
  };

  const handleGalleryFileUpload = async (file: File): Promise<ConvertedImages> => {
    let processedFile = file;
    
    // Convert HEIF/HEIC to PNG first
    if (isHEIFFile(file)) {
      processedFile = await convertHEIFToPNG(file);
      toast.info('HEIF/HEIC file converted to PNG');
    }
    
    // Generate WebP version
    const webpFile = await convertToWebP(processedFile);
    
    // Upload both PNG and WebP versions
    const [pngUrl, webpUrl] = await Promise.all([
      handleFileUpload(processedFile),
      handleFileUpload(webpFile)
    ]);
    
    return {
      png: processedFile,
      webp: webpFile,
      pngUrl,
      webpUrl
    };
  };

  const handleAddGalleryItem = async (e) => {
    e.preventDefault();

    if (isUploading) return;

    const formData = new FormData(e.target);
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || null;
    const category = galleryCategory;
    const mediaFile = formData.get('image') as File;

    if (!title) {
      toast.error('Please enter a media title');
      return;
    }
    if (!mediaFile || mediaFile.size === 0) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    toast.info('Uploading media, please wait...');
    try {
      // Check if it's a video file
      const isVideo = isVideoFile(mediaFile);
      
      if (isVideo) {
        // Validate video file size (limit to ~100MB for short clips)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (mediaFile.size > maxSize) {
          toast.error('Video file is too large. Please keep videos under 100MB.');
          setIsUploading(false);
          return;
        }

        const videoUrl = await handleFileUpload(mediaFile);
        
        const { error } = await supabase
          .from('gallery')
          .insert([{ 
            title, 
            description, 
            category, 
            image_url: videoUrl,
            video_url: videoUrl,
            media_type: 'video',
            sort_order: galleryItems.length 
          }]);

        if (error) throw error;
        toast.success('Video added successfully to gallery');
      } else {
        // Upload the image directly (skip heavy WebP conversion for speed)
        let processedFile = mediaFile;
        if (isHEIFFile(mediaFile)) {
          processedFile = await convertHEIFToPNG(mediaFile);
          toast.info('HEIF/HEIC file converted to PNG');
        }
        
        const imageUrl = await handleFileUpload(processedFile);
        
        const { error } = await supabase
          .from('gallery')
          .insert([{ 
            title, 
            description, 
            category, 
            image_url: imageUrl,
            media_type: 'image',
            sort_order: galleryItems.length 
          }]);

        if (error) throw error;
        toast.success('Image added successfully to gallery');
      }
      
      reloadGallery();
      e.target.reset();
      setGalleryCategory('All');
    } catch (error) {
      toast.error('Failed to add gallery item: ' + (error as Error).message);
      console.error('Gallery upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    try {
      const { error } = await supabase
        .from('gallery')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Gallery item deleted successfully');
      reloadGallery();
    } catch (error) {
      toast.error('Failed to delete gallery item');
    }
  };

  // Wall Management
  const handleDeleteWallMessage = async (id) => {
    try {
      const { error } = await supabase
        .from('wall_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Wall message deleted successfully');
      reloadWallMessages();
    } catch (error) {
      toast.error('Failed to delete wall message');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (!authChecked || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Portfolio Admin Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1.5 bg-muted/60 rounded-xl">
            <TabsTrigger value="hero" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Hero</TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">About</TabsTrigger>
            <TabsTrigger value="impact" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Impact</TabsTrigger>
            <TabsTrigger value="tech" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Tech Stack</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Skills</TabsTrigger>
            <TabsTrigger value="projects" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Projects</TabsTrigger>
            <TabsTrigger value="blog" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Blog</TabsTrigger>
            <TabsTrigger value="social" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Social</TabsTrigger>
            <TabsTrigger value="resume" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Resume</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Testimonials</TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Gallery</TabsTrigger>
            <TabsTrigger value="wall" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Wall</TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Bookings</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Analytics</TabsTrigger>
            <TabsTrigger value="logos" className="text-xs sm:text-sm px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Logos</TabsTrigger>
          </TabsList>

          {/* Hero Images Tab */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Hero Image</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddHeroImage} className="space-y-4">
                  <Input type="file" name="image" accept="image/*" required />
                  <Input name="alt_text" placeholder="Alt text for image" />
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Hero Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroImages.map((image) => (
                    <div key={image.id} className="space-y-2">
                      <img src={image.image_url} alt={image.alt_text} className="w-full h-32 object-cover rounded" />
                      <p className="text-sm text-muted-foreground">{image.alt_text}</p>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteHeroImage(image.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Content</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateAbout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Profile Image</label>
                    <Input type="file" name="profile_image" accept="image/*" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Description (Homepage)</label>
                    <Textarea 
                      name="hero_description" 
                      defaultValue={aboutContent?.hero_description} 
                      placeholder="Self-Taught Robotics Engineer & IoT Developer | STE(A)M & STEM Instructor | Innovator | Agriculture Enthusiast | Aspiring Estate Developer"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">About Description (About Page)</label>
                    <Textarea 
                      name="about_description" 
                      defaultValue={aboutContent?.about_description} 
                      placeholder="I am Justice Ansah, a young innovator who grew up in a farming community with no background in technology..."
                      rows={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input 
                      name="location" 
                      defaultValue={aboutContent?.location} 
                      placeholder="Accra, Ghana"
                      required
                    />
                  </div>
                  <Button type="submit">Update About Content</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Impact Metrics Tab */}
          <TabsContent value="impact">
            <ImpactMetricsEditor />
          </TabsContent>

          {/* Tech Stack Tab */}
          <TabsContent value="tech" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTechStack} className="space-y-4">
                  <Input name="name" placeholder="Technology name (e.g., React)" required />
                  <Input name="category" placeholder="Category (e.g., Frontend)" />
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Technology
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {techStack.map((tech) => (
                    <div key={tech.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <img src={tech.icon_url} alt={tech.name} className="w-8 h-8" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                        <div>
                          <p className="font-medium">{tech.name}</p>
                          <p className="text-sm text-muted-foreground">{tech.category}</p>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteTechStack(tech.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <SkillsEditor />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Project' : 'Add Project'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <Input 
                    name="title" 
                    placeholder="Project title" 
                    defaultValue={isEditing ? formData.title : ''}
                    required 
                  />
                  <Textarea 
                    name="description" 
                    placeholder="Project description" 
                    defaultValue={isEditing ? formData.description : ''}
                    rows={3}
                  />
                  <Select value={projectCategory} onValueChange={setProjectCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Robotics">Robotics</SelectItem>
                      <SelectItem value="Web app">Web app</SelectItem>
                      <SelectItem value="Mobile app">Mobile app</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    name="project_url" 
                    placeholder="Project URL" 
                    defaultValue={isEditing ? formData.project_url : ''}
                  />
                  <Input 
                    name="github_url" 
                    placeholder="GitHub URL" 
                    defaultValue={isEditing ? formData.github_url : ''}
                  />
                  <Input 
                    name="technologies" 
                    placeholder="Technologies (comma separated)" 
                    defaultValue={isEditing ? formData.technologies?.join(', ') : ''}
                  />
                  <Input type="file" name="image" accept="image/*" />
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? 'Uploading...' : (isEditing ? 'Update Project' : 'Add Project')}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={() => {
                        setIsEditing(false);
                        setEditingId(null);
                        setFormData({});
                        setProjectCategory('');
                      }}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center space-x-4">
                        {project.image_url && (
                          <img src={project.image_url} alt={project.title} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div>
                          <h3 className="font-medium">{project.title}</h3>
                          <Badge variant="secondary">{project.category}</Badge>
                          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <BlogManagement onFileUpload={handleFileUpload} />
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Social Link</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSocialLink} className="space-y-4">
                  <Input name="platform" placeholder="Platform name (e.g., GitHub)" required />
                  <Input name="url" placeholder="Profile URL" type="url" required />
                  <Input name="icon_name" placeholder="Icon name (e.g., github)" />
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Social Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{link.platform}</h3>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          {link.url}
                        </a>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteSocialLink(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Resume File</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddResume} className="space-y-4">
                  <Input name="file_name" placeholder="File name (e.g., Resume_2024)" required />
                  <Input type="file" name="resume_file" accept=".pdf,.doc,.docx" required />
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="is_current" id="is_current" />
                    <label htmlFor="is_current">Set as current resume</label>
                  </div>
                  <Button type="submit">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Resume
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resumeFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{file.file_name}</h3>
                        {file.is_current && (
                          <Badge variant="default">Current</Badge>
                        )}
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block mt-1">
                          Download File
                        </a>
                      </div>
                      <div className="flex space-x-2">
                        {!file.is_current && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSetCurrentResume(file.id)}
                          >
                            Set Current
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteResume(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {/* Generate Recommendation Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Send Recommendation Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      placeholder="Recommender's name *"
                      maxLength={100}
                    />
                    <Input
                      value={tokenEmail}
                      onChange={(e) => setTokenEmail(e.target.value)}
                      placeholder="Email (optional, for your reference)"
                      type="email"
                      maxLength={255}
                    />
                  </div>
                  <Button onClick={handleGenerateToken} disabled={!tokenName.trim()}>
                    <Link className="w-4 h-4 mr-2" />
                    Generate Link
                  </Button>
                </div>

                {/* Active tokens */}
                {recommendationTokens.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Generated Links</h4>
                    {recommendationTokens.map((t: any) => {
                      const isExpired = new Date(t.expires_at) < new Date();
                      return (
                        <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{t.recommender_name}</span>
                            {t.recommender_email && (
                              <span className="text-muted-foreground ml-2">({t.recommender_email})</span>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {t.is_used ? (
                                <Badge variant="default" className="text-xs">Used</Badge>
                              ) : isExpired ? (
                                <Badge variant="destructive" className="text-xs">Expired</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Pending</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Expires {new Date(t.expires_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {!t.is_used && !isExpired && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyLink(t.token)}
                              >
                                {copiedToken === t.token ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteToken(t.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manual Add */}
            <Card>
              <CardHeader>
                <CardTitle>Add Recommendation Manually</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddRecommendation} className="space-y-4">
                  <Input name="name" placeholder="Recommender name" required />
                  <Input name="position" placeholder="Position/Title" />
                  <Input name="company" placeholder="Company/Organization" />
                  <Textarea name="message" placeholder="Recommendation message" rows={4} required />
                  <Input name="linkedin_url" placeholder="LinkedIn URL" type="url" />
                  <Input name="twitter_url" placeholder="Twitter URL" type="url" />
                  <Input type="file" name="image" accept="image/*" />
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Recommendation
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* All Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>All Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className={`flex items-start justify-between p-4 border rounded-lg ${!rec.is_active ? 'border-dashed bg-muted/30' : ''}`}>
                      <div className="flex items-start space-x-4">
                        {rec.recommender_image_url && (
                          <img src={rec.recommender_image_url} alt={rec.name} className="w-12 h-12 object-cover rounded-full" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{rec.name}</h3>
                            {rec.is_active ? (
                              <Badge variant="default" className="text-xs">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            )}
                          </div>
                          {rec.position && (
                            <p className="text-sm text-muted-foreground">
                              {rec.position}{rec.company && ` at ${rec.company}`}
                            </p>
                          )}
                          <p className="text-sm mt-2">{rec.message}</p>
                          <div className="flex space-x-2 mt-2">
                            {rec.linkedin_url && (
                              <a href={rec.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                LinkedIn
                              </a>
                            )}
                            {rec.twitter_url && (
                              <a href={rec.twitter_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                Twitter
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditRec(rec)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={rec.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleRecommendation(rec.id, rec.is_active)}
                          title={rec.is_active ? 'Hide' : 'Approve'}
                        >
                          {rec.is_active ? <EyeOff className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteRecommendation(rec.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {recommendations.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No recommendations yet. Generate a link above to request one!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Edit Recommendation Dialog */}
            {editingRec && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Edit Recommendation</span>
                    <Button variant="ghost" size="sm" onClick={() => setEditingRec(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {(editingRec.recommender_image_url) && (
                      <img src={editingRec.recommender_image_url} alt={recForm.name} className="w-16 h-16 object-cover rounded-full border-2 border-muted" />
                    )}
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground">Change Photo</label>
                      <Input type="file" id="rec-edit-image" accept="image/*" className="mt-1" />
                    </div>
                  </div>
                  <Input
                    placeholder="Name"
                    value={recForm.name}
                    onChange={(e) => setRecForm({ ...recForm, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Position/Title"
                    value={recForm.position}
                    onChange={(e) => setRecForm({ ...recForm, position: e.target.value })}
                  />
                  <Input
                    placeholder="Company/Organization"
                    value={recForm.company}
                    onChange={(e) => setRecForm({ ...recForm, company: e.target.value })}
                  />
                  <Textarea
                    placeholder="Recommendation message"
                    value={recForm.message}
                    onChange={(e) => setRecForm({ ...recForm, message: e.target.value })}
                    rows={4}
                    required
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    type="url"
                    value={recForm.linkedin_url}
                    onChange={(e) => setRecForm({ ...recForm, linkedin_url: e.target.value })}
                  />
                  <Input
                    placeholder="Twitter URL"
                    type="url"
                    value={recForm.twitter_url}
                    onChange={(e) => setRecForm({ ...recForm, twitter_url: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateRecommendation}>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingRec(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Gallery Media</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Upload images or short videos (MP4, max 100MB)</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddGalleryItem} className="space-y-4">
                  <Input name="title" placeholder="Media title" required />
                  <Textarea name="description" placeholder="Media description/story" rows={3} />
                  <Select value={galleryCategory} onValueChange={setGalleryCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Robotics">Robotics</SelectItem>
                      <SelectItem value="STEM Education">STEM Education</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Events">Events</SelectItem>
                      <SelectItem value="Personal Journey">Personal Journey</SelectItem>
                    </SelectContent>
                  </Select>
                  <div>
                    <Input 
                      type="file" 
                      name="image" 
                      accept="image/*,.heic,.heif,video/mp4,video/webm,.mp4,.webm" 
                      required 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported: Images (JPG, PNG, WEBP, HEIC) or Videos (MP4, WebM)
                    </p>
                  </div>
                  <Button type="submit" disabled={isUploading}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Add Media'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gallery Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryItems.map((item) => (
                    <div key={item.id} className="space-y-2">
                      {item.media_type === 'video' && item.video_url ? (
                        <video
                          src={item.video_url}
                          className="w-full h-32 object-cover rounded"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <OptimizedImage 
                          src={item.image_url} 
                          webpSrc={item.webp_url}
                          alt={item.title} 
                          className="w-full h-32 object-cover rounded" 
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.media_type === 'video' ? '🎥 Video' : '🖼️ Image'}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wall Tab */}
          <TabsContent value="wall" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wall Messages</CardTitle>
                <p className="text-sm text-muted-foreground">Moderate and delete inappropriate messages from the wall</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wallMessages.map((message) => (
                    <div key={message.id} className="flex items-start justify-between p-4 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">@{message.name}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(message.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteWallMessage(message.id)}
                        className="ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {wallMessages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No wall messages yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <AppointmentManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          {/* Partner Logos Tab */}
          <TabsContent value="logos">
            <Card>
              <CardHeader>
                <CardTitle>Partner Logos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const name = (form.elements.namedItem('logoName') as HTMLInputElement).value.trim();
                  const fileInput = form.elements.namedItem('logoFile') as HTMLInputElement;
                  const logoUrl = (form.elements.namedItem('logoUrl') as HTMLInputElement).value.trim();
                  const category = (form.elements.namedItem('logoCategory') as HTMLInputElement).value.trim() || 'organization';
                  const sortOrder = parseInt((form.elements.namedItem('logoSort') as HTMLInputElement).value) || 0;

                  if (!name) { toast.error('Organization name is required'); return; }

                  let finalLogoUrl = logoUrl;
                  const file = fileInput?.files?.[0];

                  if (file) {
                    setIsUploading(true);
                    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
                    const filePath = `partner-logos/${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}.${ext}`;
                    const { error: uploadError } = await supabase.storage.from('portfolio-assets').upload(filePath, file, {
                      contentType: file.type,
                      cacheControl: '3600',
                      upsert: false,
                    });
                    if (uploadError) { toast.error('Failed to upload logo: ' + uploadError.message); console.error('Upload error:', uploadError); setIsUploading(false); return; }
                    const { data: urlData } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
                    finalLogoUrl = urlData.publicUrl;
                    setIsUploading(false);
                  }

                  if (!finalLogoUrl) { toast.error('Please upload an image or provide a URL'); return; }

                  const { error } = await supabase.from('partner_logos').insert({ name, logo_url: finalLogoUrl, category, sort_order: sortOrder });
                  if (error) { toast.error('Failed to add logo'); console.error(error); return; }
                  toast.success('Logo added!');
                  form.reset();
                  reloadPartnerLogos();
                }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input name="logoName" placeholder="Organization name" required />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Upload logo image</label>
                    <Input name="logoFile" type="file" accept="image/*" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Or paste a URL</label>
                    <Input name="logoUrl" placeholder="https://..." />
                  </div>
                  <Input name="logoCategory" placeholder="Category (e.g. company, exhibition)" />
                  <Input name="logoSort" type="number" placeholder="Sort order" defaultValue="0" />
                  <Button type="submit" disabled={isUploading} className="sm:col-span-2">
                    {isUploading ? <><Upload className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Plus className="w-4 h-4 mr-2" />Add Logo</>}
                  </Button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partnerLogos.map((logo: any) => (
                    <div key={logo.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                      <img src={logo.logo_url} alt={logo.name} className="h-10 w-16 object-contain" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{logo.name}</p>
                        <p className="text-xs text-muted-foreground">{logo.category}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={async () => {
                        await supabase.from('partner_logos').delete().eq('id', logo.id);
                        toast.success('Logo deleted');
                        reloadPartnerLogos();
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {partnerLogos.length === 0 && (
                    <p className="text-muted-foreground text-center col-span-full py-8">No partner logos yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;