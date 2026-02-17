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
import { Plus, Trash2, Edit2, Upload, Eye, EyeOff, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { isHEIFFile, convertHEIFToPNG, convertToWebP, ConvertedImages } from '@/utils/imageConverter';
import OptimizedImage from '@/components/OptimizedImage';
import BlogManagement from '@/components/admin/BlogManagement';
import ImpactMetricsEditor from '@/components/admin/ImpactMetricsEditor';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

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

  // Form states
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!session) {
          navigate('/auth');
          return;
        }
        // Check admin role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin');
        
        if (!roles || roles.length === 0) {
          toast.error('Access denied. Admin role required.');
          await supabase.auth.signOut();
          navigate('/auth');
          return;
        }
        setIsAdmin(true);
        setAuthChecked(true);
        loadAllData();
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin');
      
      if (!roles || roles.length === 0) {
        toast.error('Access denied. Admin role required.');
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }
      setIsAdmin(true);
      setAuthChecked(true);
      loadAllData();

      return () => subscription.unsubscribe();
    };
    checkAuth();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      const [heroRes, aboutRes, techRes, projectsRes, blogRes, socialRes, resumeRes, recommendationsRes, galleryRes, wallRes] = await Promise.all([
        supabase.from('hero_images').select('*').eq('is_active', true),
        supabase.from('about_content').select('*').single(),
        supabase.from('tech_stack').select('*').eq('is_active', true),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('social_links').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('resume_files').select('*').order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('gallery').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('wall_messages').select('*').order('created_at', { ascending: false })
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
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    }
  };

  const handleFileUpload = async (file, bucket = 'portfolio-assets') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

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
      loadAllData();
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
      loadAllData();
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
      loadAllData();
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
      loadAllData();
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
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete tech stack item');
    }
  };

  // Projects Management
  const handleAddProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as 'Robotics' | 'Web app' | 'Mobile app' | 'AI';
    const project_url = formData.get('project_url') as string;
    const github_url = formData.get('github_url') as string;
    const technologies = (formData.get('technologies') as string).split(',').map(t => t.trim());
    const image = formData.get('image') as File;

    try {
      let image_url = null;
      if (image && image.size > 0) {
        image_url = await handleFileUpload(image);
      }

      const projectData = {
        title, description, category, project_url, github_url, technologies, image_url
      };

      const { error } = isEditing
        ? await supabase.from('projects').update(projectData).eq('id', editingId)
        : await supabase.from('projects').insert([projectData]);

      if (error) throw error;
      
      toast.success(`Project ${isEditing ? 'updated' : 'added'} successfully`);
      loadAllData();
      e.target.reset();
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} project`);
      console.error(error);
    }
  };

  const handleEditProject = (project) => {
    setFormData(project);
    setIsEditing(true);
    setEditingId(project.id);
  };

  const handleDeleteProject = async (id) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Project deleted successfully');
      loadAllData();
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
      loadAllData();
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
      loadAllData();
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
      loadAllData();
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
      loadAllData();
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
      loadAllData();
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
      loadAllData();
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
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Recommendation deleted successfully');
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete recommendation');
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
    const formData = new FormData(e.target);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const mediaFile = formData.get('image') as File;

    if (!mediaFile) return;

    try {
      // Check if it's a video file
      const isVideo = isVideoFile(mediaFile);
      
      if (isVideo) {
        // Validate video file size (limit to ~100MB for short clips)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (mediaFile.size > maxSize) {
          toast.error('Video file is too large. Please keep videos under 100MB (approximately 30-60 seconds).');
          return;
        }

        // Upload video directly
        const videoUrl = await handleFileUpload(mediaFile);
        
        const { error } = await supabase
          .from('gallery')
          .insert([{ 
            title, 
            description, 
            category, 
            image_url: videoUrl, // Use as fallback
            video_url: videoUrl,
            media_type: 'video',
            sort_order: galleryItems.length 
          }]);

        if (error) throw error;
        toast.success('Video added successfully to gallery');
      } else {
        // Handle image upload with optimization
        const { pngUrl, webpUrl } = await handleGalleryFileUpload(mediaFile);
        
        const { error } = await supabase
          .from('gallery')
          .insert([{ 
            title, 
            description, 
            category, 
            image_url: pngUrl,
            webp_url: webpUrl,
            media_type: 'image',
            sort_order: galleryItems.length 
          }]);

        if (error) throw error;
        toast.success('Image added successfully with optimized formats');
      }
      
      loadAllData();
      e.target.reset();
    } catch (error) {
      toast.error('Failed to add gallery item');
      console.error(error);
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
      loadAllData();
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
      loadAllData();
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
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="recommendations">Testimonials</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="wall">Wall</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                  <Select name="category" required>
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
                    <Button type="submit">
                      {isEditing ? 'Update Project' : 'Add Project'}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={() => {
                        setIsEditing(false);
                        setEditingId(null);
                        setFormData({});
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
            <Card>
              <CardHeader>
                <CardTitle>Add Recommendation</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Current Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="flex items-start justify-between p-4 border rounded">
                      <div className="flex items-start space-x-4">
                        {rec.recommender_image_url && (
                          <img src={rec.recommender_image_url} alt={rec.name} className="w-12 h-12 object-cover rounded-full" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{rec.name}</h3>
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
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteRecommendation(rec.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  <Select name="category" required>
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
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Media
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

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;