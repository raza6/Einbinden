import type { ReactNode } from 'react';

export interface BookFormData {
  title: string;
  subtitle: string;
  authors: string[];
  publisher: string;
}

export interface BookFormInit {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  tags?: string[];
  coverSrc?: string;
}

export interface BookFormProps {
  isbn?: string;
  isbnEditable?: boolean;
  book?: BookFormInit;
  onSave: (isbn: string, data: BookFormData) => Promise<{ error?: string; success?: string }>;
  onSaveSuccess?: (isbn: string, data: BookFormData) => void;
  submitLabel: string;
  submitIcon: ReactNode;
  hideSubmit?: boolean;
  extraActions?: ReactNode;
}
