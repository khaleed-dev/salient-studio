# Salient Studio — AI Reference Guide

You have access to a REST API at `https://salient-studio.vercel.app` that serves 470+ pre-built WPBakery Page Builder section templates from the Salient WordPress theme.

## What This Is

Salient is a premium WordPress theme that uses WPBakery Page Builder. It ships with ~470 ready-made section templates (hero sections, about blocks, pricing tables, testimonials, CTAs, etc.) called "Salient Studio" templates.

This API extracts all of those templates and serves them as JSON. Each template's `content` field is a raw WPBakery shortcode string — this is the actual design. When you write this string into a WordPress page's `post_content` field, WPBakery + Salient render it as a fully designed section.

## How WordPress + WPBakery Stores Pages

WPBakery pages are stored as shortcode strings in the `post_content` database field. Example:

```
[vc_row][vc_column width="1/2"][vc_column_text]Hello world[/vc_column_text][/vc_column][/vc_row]
```

This is not HTML. It's WPBakery shortcode markup. WordPress parses and renders it on the frontend. To build a page, you write shortcode content into `post_content` via the WordPress REST API or MCP.

## API Endpoints

Base URL: `https://salient-studio.vercel.app`

### 1. List Categories

```
GET https://salient-studio.vercel.app/api/templates?list=categories
```

Returns all available categories with template counts:

```json
{
  "success": true,
  "data": [
    { "slug": "hero_section", "name": "Hero Section", "count": 66 },
    { "slug": "general", "name": "General", "count": 209 },
    { "slug": "services", "name": "Services", "count": 50 },
    { "slug": "about", "name": "About", "count": 76 },
    { "slug": "blog", "name": "Blog", "count": 44 },
    { "slug": "cta", "name": "Call To Action", "count": 35 },
    { "slug": "portfolio", "name": "Project", "count": 39 },
    { "slug": "testimonials", "name": "Testimonials", "count": 31 },
    { "slug": "icons", "name": "Icons", "count": 27 },
    { "slug": "shop", "name": "Shop", "count": 15 },
    { "slug": "pricing", "name": "Pricing", "count": 12 },
    { "slug": "counters", "name": "Counters", "count": 11 },
    { "slug": "lottie", "name": "Lottie", "count": 9 },
    { "slug": "team", "name": "Team", "count": 8 },
    { "slug": "map", "name": "Map", "count": 7 },
    { "slug": "gallery", "name": "Gallery", "count": 4 }
  ]
}
```

### 2. List Templates (Lightweight Index)

```
GET https://salient-studio.vercel.app/api/templates
GET https://salient-studio.vercel.app/api/templates?category=hero_section
GET https://salient-studio.vercel.app/api/templates?search=pricing
GET https://salient-studio.vercel.app/api/templates?category=services&page=1&per_page=10
```

Query parameters:
- `category` — filter by category slug (e.g. `hero_section`, `about`, `cta`, `services`)
- `search` — search by name, category, or shortcode type
- `page` — page number for pagination
- `per_page` — items per page

Response returns template metadata WITHOUT the shortcode content (for fast browsing):

```json
{
  "success": true,
  "data": [
    {
      "id": 0,
      "name": "Harbor Hero",
      "slug": "harbor-hero",
      "categories": ["hero_section"],
      "categoryDisplay": "Hero Section",
      "image": "harbor-hero.webp",
      "date": "10-Oct-2025",
      "shortcodesUsed": ["vc_section", "vc_row", "vc_column", "split_line_heading", "image_with_animation", "nectar_responsive_text", "nectar_cta"]
    }
  ],
  "meta": { "total": 66, "page": 1, "perPage": 66, "totalPages": 1 }
}
```

### 3. Get Single Template (Full Content)

```
GET https://salient-studio.vercel.app/api/templates/{slug}
```

Example: `GET https://salient-studio.vercel.app/api/templates/harbor-hero`

This returns the full template including the `content` field with the raw WPBakery shortcode string:

```json
{
  "success": true,
  "data": {
    "id": 0,
    "name": "Harbor Hero",
    "slug": "harbor-hero",
    "categories": ["hero_section"],
    "categoryDisplay": "Hero Section",
    "image": "harbor-hero.webp",
    "date": "10-Oct-2025",
    "shortcodesUsed": ["vc_section", "vc_row", "vc_column"],
    "content": "[vc_section type=\"full_width_background\" ...][vc_row ...][/vc_row][/vc_section]"
  }
}
```

The `content` field is what you write into WordPress `post_content`.

### 4. Compose Multiple Templates Into a Page

```
POST https://salient-studio.vercel.app/api/compose
Content-Type: application/json

{
  "templateSlugs": ["harbor-hero", "harbor-intro", "horizontal-services", "harbor-cta"]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "content": "[vc_section ...][/vc_section]\n\n[vc_row ...][/vc_row]\n\n...",
    "templates": ["Harbor Hero", "Harbor Intro", "Horizontal Services", "Harbor CTA"],
    "totalSections": 4
  }
}
```

The `data.content` field is the full page shortcode content — all selected sections concatenated. Write this directly into a WordPress page's `post_content`.

## Workflow: Building a WordPress Page

When a user asks you to build a page on a WordPress site that has Salient theme + WPBakery:

### Step 1 — Understand what sections the page needs

Break the request into section types. A typical landing page might need:
- Hero section
- About/intro section
- Services section
- Testimonials
- Call to action

### Step 2 — Browse available templates

Fetch templates by category to find good matches:

```
GET https://salient-studio.vercel.app/api/templates?category=hero_section
GET https://salient-studio.vercel.app/api/templates?category=about
GET https://salient-studio.vercel.app/api/templates?category=services
GET https://salient-studio.vercel.app/api/templates?category=testimonials
GET https://salient-studio.vercel.app/api/templates?category=cta
```

Look at the `name` and `shortcodesUsed` fields to pick the best match. Template names are descriptive (e.g. "Harbor Hero", "Minimal Pricing", "Dark Testimonials", "Gradient CTA").

### Step 3 — Compose the page

Once you've picked templates, compose them:

```
POST https://salient-studio.vercel.app/api/compose
{
  "templateSlugs": ["harbor-hero", "harbor-intro", "horizontal-services", "harbor-testimonials", "harbor-cta"]
}
```

### Step 4 — Customize the content

The composed `content` string contains placeholder text and demo images from themenectar.com. Before pushing to WordPress, you should modify:

- Text content (headings, paragraphs, button labels)
- URLs (links, button URLs)
- Image URLs (replace themenectar.com demo images with the client's images)
- Colors if needed (look for `background_color`, `text_color`, `font_color` attributes)

The shortcode format is `[shortcode_name attr="value"]content[/shortcode_name]`. You can find-and-replace text within the shortcode string.

### Step 5 — Push to WordPress

Use the WordPress REST API or WordPress MCP to update the page:

```
POST /wp-json/wp/v2/pages/{page_id}
{
  "content": "<the composed shortcode string>"
}
```

Or if using WordPress MCP, call the appropriate tool to update `post_content`.

## Important Notes

- Templates are sections, not full pages. A page is composed of multiple sections stacked together.
- The `content` field is WPBakery shortcode markup, not HTML. Do not wrap it in HTML tags.
- Demo images use `https://themenectar.com/img/demo-media/` URLs. These work but should be replaced with actual project images.
- The `shortcodesUsed` field tells you what WPBakery elements a template uses. This helps you pick templates that match the desired design complexity.
- Some templates use Salient-specific shortcodes like `nectar_cta`, `nectar_responsive_text`, `split_line_heading`, `nectar_sticky_media_sections`. These only work on sites with the Salient theme + Salient Core plugin active.
- Category slugs for filtering: `hero_section`, `general`, `services`, `team`, `counters`, `testimonials`, `pricing`, `cta`, `portfolio`, `about`, `blog`, `lottie`, `shop`, `icons`, `map`, `gallery`.

## Template Naming Patterns

Templates are often grouped by demo site name. Common prefixes:
- `harbor-*` — Modern consulting/business style
- `architect-*` — Architecture/portfolio style
- `quantum-*` — Bold creative agency style
- `signal-*` — Minimal portfolio style
- `tether-*` — SaaS/tech style
- `resort-*` — Hospitality/travel style
- `saas-*` — Software/SaaS style
- `ecom-robust-*` — E-commerce style
- `freelance-*` — Personal portfolio style
- `npo-*` — Non-profit style
- `promo-*` — Promotional/marketing style
- `layered-*` — Layered design style

Picking templates with the same prefix gives a cohesive design since they share the same visual language.

## Quick Example

User asks: "Build me a consulting firm landing page"

```
1. GET /api/templates?category=hero_section&search=harbor     → pick "harbor-hero"
2. GET /api/templates?category=about&search=harbor             → pick "harbor-intro"  
3. GET /api/templates?category=services&search=harbor           → pick "horizontal-services"
4. GET /api/templates?category=testimonials&search=harbor       → pick "harbor-testimonials"
5. GET /api/templates?category=cta&search=harbor               → pick "harbor-cta"
6. POST /api/compose with those 5 slugs
7. Customize text in the returned content
8. Push to WordPress via MCP or REST API
```

The result is a fully designed, responsive, animated landing page built from Salient's professional templates.
