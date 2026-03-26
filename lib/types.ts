export interface Template {
  id: number;
  name: string;
  slug: string;
  categories: string[];
  categoryDisplay: string;
  image: string;
  date: string;
  shortcodesUsed: string[];
  content: string;
}

export interface TemplateIndex {
  id: number;
  name: string;
  slug: string;
  categories: string[];
  categoryDisplay: string;
  image: string;
  date: string;
  shortcodesUsed: string[];
}

export interface Category {
  slug: string;
  name: string;
  count: number;
}

export interface ComposeRequest {
  templateSlugs: string[];
  separator?: string;
}

export interface ComposeResponse {
  content: string;
  templates: string[];
  totalSections: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
