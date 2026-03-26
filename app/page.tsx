import { getCategories, getTemplateIndex } from "@/lib/templates";
import { TemplateBrowser } from "@/components/template-browser";

export default function Home() {
  const categories = getCategories();
  const { items: templates } = getTemplateIndex();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            Salient Studio
          </h1>
          <p className="mt-2 text-zinc-400">
            {templates.length} templates across {categories.length} categories —
            browse, search, and compose WPBakery sections.
          </p>
          <div className="mt-4 flex gap-4 text-sm text-zinc-500">
            <code className="rounded bg-zinc-900 px-2 py-1">
              GET /api/templates
            </code>
            <code className="rounded bg-zinc-900 px-2 py-1">
              GET /api/templates/[slug]
            </code>
            <code className="rounded bg-zinc-900 px-2 py-1">
              POST /api/compose
            </code>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <TemplateBrowser
          initialTemplates={templates}
          categories={categories}
        />
      </div>
    </main>
  );
}
