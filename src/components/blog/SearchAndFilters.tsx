import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, FileText, Video, LayoutGrid } from 'lucide-react';

interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onContentTypeChange: (type: string) => void;
  categories: string[];
  selectedCategory: string;
  selectedContentType: string;
  searchQuery: string;
  hideContentTypeToggle?: boolean;
}

export const SearchAndFilters = ({ 
  onSearch, 
  onCategoryChange, 
  onContentTypeChange,
  categories, 
  selectedCategory, 
  selectedContentType,
  searchQuery,
  hideContentTypeToggle = false,
}: SearchAndFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const clearSearch = () => {
    setLocalSearch('');
    onSearch('');
  };

  const contentTypes = [
    { value: '', label: 'All', icon: LayoutGrid },
    { value: 'blog', label: 'Blog', icon: FileText },
    { value: 'vlog', label: 'Vlog', icon: Video },
  ];

  return (
    <div className="glass-card p-6 mb-8">
      {/* Content Type Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex rounded-full bg-muted/50 p-1 gap-1">
          {contentTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onContentTypeChange(value)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedContentType === value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${selectedContentType === 'vlog' ? 'vlogs' : selectedContentType === 'blog' ? 'blog posts' : 'posts'}...`}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-10 bg-surface border-primary/20 focus:border-primary"
          />
          {localSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === '' ? 'default' : 'secondary'}
            className={`cursor-pointer transition-colors ${
              selectedCategory === '' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-surface hover:bg-primary/20'
            }`}
            onClick={() => onCategoryChange('')}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'secondary'}
              className={`cursor-pointer transition-colors ${
                selectedCategory === category 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-surface hover:bg-primary/20'
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
