import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, X, Upload, Video, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { lazy, Suspense } from 'react';
import { compressImage } from '@/utils/imageOptimizer';

// Dynamically import ReactQuill
const ReactQuill = lazy(() => import('react-quill'));
import 'react-quill/dist/quill.snow.css';

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: string;
  tags: string[];
  featured_image_url?: string;
  featured_video_url?: string;
  is_published: boolean;
  published_at?: string;
  read_time_minutes: number;
}

interface BlogEditorProps {
  post?: BlogPost;
  categories: string[];
  onSave: (post: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
  onFileUpload: (file: File) => Promise<string>;
}

const BlogEditor = ({ post, categories, onSave, onCancel, onFileUpload }: BlogEditorProps) => {
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    excerpt: '',
    category: 'General',
    tags: [],
    is_published: false,
    read_time_minutes: 5,
    ...post
  });
  
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const quillRef = useRef<any>(null);

  // Image handler for ReactQuill - uploads images instead of base64
  const imageHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        toast.info('Uploading image...');
        
        // Compress image before upload
        const compressedFile = await compressImage(file, 1920, 0.85);
        
        // Upload to storage
        const imageUrl = await onFileUpload(compressedFile);
        
        // Insert image URL into editor
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', imageUrl);
          quill.setSelection(range.index + 1);
        }
        
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
    };
  };

  // Rich text editor configuration with custom image handler
  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'image', 'code-block'
  ];

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !post?.id) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, post?.id]);

  // Calculate read time from content
  useEffect(() => {
    if (formData.content) {
      const words = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(words / 200));
      setFormData(prev => ({ ...prev, read_time_minutes: readTime }));
    }
  }, [formData.content]);

  const handleInputChange = (field: keyof BlogPost, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      const newTags = [...(formData.tags || []), tagInput.trim()];
      handleInputChange('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = formData.tags?.filter(tag => tag !== tagToRemove) || [];
    handleInputChange('tags', newTags);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress image before upload
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file, 1920, 0.85);
      }
      
      const url = await onFileUpload(fileToUpload);
      if (mediaType === 'image') {
        handleInputChange('featured_image_url', url);
        handleInputChange('featured_video_url', '');
      } else {
        handleInputChange('featured_video_url', url);
        handleInputChange('featured_image_url', '');
      }
      toast.success(`${mediaType === 'image' ? 'Image' : 'Video'} uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      await onSave({
        ...formData,
        published_at: formData.is_published && !post?.published_at 
          ? new Date().toISOString() 
          : formData.published_at
      });
      toast.success(`Blog post ${post ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${post ? 'update' : 'create'} blog post`);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {post ? 'Edit Blog Post' : 'Create New Blog Post'}
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter blog post title"
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="url-friendly-slug"
                required
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || 'General'}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)} 
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt || ''}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Brief description of the blog post"
              rows={3}
            />
          </div>

          {/* Featured Media */}
          <div>
            <Label>Featured Media</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="image"
                    name="mediaType"
                    checked={mediaType === 'image'}
                    onChange={() => setMediaType('image')}
                  />
                  <Label htmlFor="image" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="video"
                    name="mediaType"
                    checked={mediaType === 'video'}
                    onChange={() => setMediaType('video')}
                  />
                  <Label htmlFor="video" className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video URL
                  </Label>
                </div>
              </div>

              {mediaType === 'image' ? (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {formData.featured_image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.featured_image_url} 
                        alt="Featured" 
                        className="w-32 h-20 object-cover rounded" 
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  value={formData.featured_video_url || ''}
                  onChange={(e) => handleInputChange('featured_video_url', e.target.value)}
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                />
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <Label htmlFor="content">Content *</Label>
            <div className="mt-2">
              <Suspense fallback={<div>Loading editor...</div>}>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.content || ''}
                  onChange={(content) => handleInputChange('content', content)}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: '300px', marginBottom: '50px' }}
                />
              </Suspense>
            </div>
          </div>

          {/* Publishing Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published || false}
                onCheckedChange={(checked) => handleInputChange('is_published', checked)}
              />
              <Label htmlFor="is_published">
                {formData.is_published ? 'Published' : 'Draft'}
              </Label>
            </div>
            <div>
              <Label htmlFor="read_time">Read Time (minutes)</Label>
              <Input
                id="read_time"
                type="number"
                min="1"
                value={formData.read_time_minutes || 5}
                onChange={(e) => handleInputChange('read_time_minutes', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label>Estimated: {formData.read_time_minutes} min read</Label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {post ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BlogEditor;