import type { Template, TemplateIndex, Category } from "./types";
import templatesData from "@/data/templates.json";
import indexData from "@/data/templates-index.json";
import categoriesData from "@/data/categories.json";

// Type-cast the imported JSON
const templates: Template[] = templatesData as Template[];
const templateIndex: TemplateIndex[] = indexData as TemplateIndex[];
const categories: Category[] = (categoriesData as Category[]).filter(
  (c) => c.slug !== ""
);

// Build lookup maps once at module load (cached across requests in serverless)
const slugMap = new Map<string, Template>();
const idMap = new Map<number, Template>();
for (const t of templates) {
  slugMap.set(t.slug, t);
  idMap.set(t.id, t);
}

export function getCategories(): Category[] {
  return categories;
}

export function getTemplateIndex(filters?: {
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): { items: TemplateIndex[]; total: number } {
  let items = templateIndex;

  if (filters?.category) {
    const cat = filters.category.toLowerCase();
    items = items.filter((t) => t.categories.includes(cat));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.categories.some((c) => c.includes(q)) ||
        t.shortcodesUsed.some((s) => s.includes(q))
    );
  }

  const total = items.length;

  if (filters?.page && filters?.perPage) {
    const start = (filters.page - 1) * filters.perPage;
    items = items.slice(start, start + filters.perPage);
  }

  return { items, total };
}

export function getTemplateBySlug(slug: string): Template | undefined {
  return slugMap.get(slug);
}

export function getTemplateById(id: number): Template | undefined {
  return idMap.get(id);
}

export function getTemplatesByCategory(category: string): TemplateIndex[] {
  return templateIndex.filter((t) =>
    t.categories.includes(category.toLowerCase())
  );
}

export function composeTemplates(
  slugs: string[],
  separator: string = "\n\n"
): { content: string; found: string[]; missing: string[] } {
  const found: string[] = [];
  const missing: string[] = [];
  const parts: string[] = [];

  for (const slug of slugs) {
    const t = slugMap.get(slug);
    if (t) {
      parts.push(t.content);
      found.push(t.name);
    } else {
      missing.push(slug);
    }
  }

  return { content: parts.join(separator), found, missing };
}
