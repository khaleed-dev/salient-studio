"use client";

import { useState, useMemo } from "react";
import type { TemplateIndex, Category } from "@/lib/types";

export function TemplateBrowser({
  initialTemplates,
  categories,
}: {
  initialTemplates: TemplateIndex[];
  categories: Category[];
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = initialTemplates;
    if (activeCategory !== "all") {
      items = items.filter((t) => t.categories.includes(activeCategory));
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.categories.some((c) => c.includes(q)) ||
          t.shortcodesUsed.some((s) => s.includes(q))
      );
    }
    return items;
  }, [initialTemplates, activeCategory, search]);

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-600 sm:w-80"
          aria-label="Search templates"
        />
        <span className="text-sm text-zinc-500">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            activeCategory === "all"
              ? "bg-zinc-100 text-zinc-900"
              : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          All ({initialTemplates.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              activeCategory === cat.slug
                ? "bg-zinc-100 text-zinc-900"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
          >
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-sm font-medium text-zinc-200">{t.name}</h3>
              <button
                onClick={() => copySlug(t.slug)}
                className="shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                title="Copy slug"
              >
                {copiedSlug === t.slug ? "✓" : "copy"}
              </button>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              {t.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500"
                >
                  {cat}
                </span>
              ))}
            </div>
            <code className="block text-xs text-zinc-600">{t.slug}</code>
            {t.date && (
              <span className="mt-1 block text-xs text-zinc-700">
                {t.date}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
