import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from './button';
import { apiUpload } from '../../services/api';
import { toast } from 'sonner';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
}

export function FileUpload({ value, onChange, accept = "image/*,audio/*,video/*", placeholder = "أو أدخل الرابط مباشرة" }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await apiUpload(file);
      onChange(res.url);
      toast.success('تم الرفع بنجاح');
    } catch (err) {
      toast.error('فشل رفع الملف');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // reset
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 outline-none pr-10"
          dir="ltr"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={isUploading}
        />
        <Button type="button" variant="secondary" className="shrink-0" disabled={isUploading}>
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 ml-2" />}
          {isUploading ? 'جاري الرفع...' : 'رفع ملف'}
        </Button>
      </div>
    </div>
  );
}
