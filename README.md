# Salient Studio

REST API serving 470+ pre-built Salient theme WPBakery page builder section templates. Built for AI assistants (Claude Code, MCP clients) to browse, search, and compose WordPress pages from Salient's template library.

## What This Does

The Salient WordPress theme ships with ~470 section templates (hero sections, about blocks, pricing tables, CTAs, etc.) inside WPBakery Page Builder. This project extracts all of them into a JSON catalog and serves them through a fast API.

An AI assistant can query this API to:
1. See what sections are available
2. Get the raw WPBakery shortcode content for any section
3. Combine multiple sections into a full page layout
4. Push that content to any WordPress site via WordPress MCP

## API Reference

Base URL: `https://your-deployment.vercel.app`

### List All Templates

```
GET /api/templates
```

Returns lightweight index (no shortcode content) for fast browsing.

**Query Parameters:**
| Param | Description | Example |
|-------|-------------|---------|
| `category` | Filter by category slug | `?category=hero_section` |
| `search` | Search by name, category, or shortcode type | `?search=pricing` |
| `page` | Page number | `?page=1` |
| `per_page` | Items per page | `?per_page=20` |

**Response:**
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
      "shortcodesUsed": ["vc_section", "vc_row", "vc_column", "split_line_heading"]
    }
  ],
  "meta": { "total": 470, "page": 1, "perPage": 470, "totalPages": 1 }
}
```

### List Categories

```
GET /api/templates?list=categories
```

**Response:**
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
    { "slug": "testimonials", "name": "Testimonials", "count": 31 },
    { "slug": "icons", "name": "Icons", "count": 27 },
    { "slug": "shop", "name": "Shop", "count": 15 },
    { "slug": "pricing", "name": "Pricing", "count": 12 },
    { "slug": "counters", "name": "Counters", "count": 11 },
    { "slug": "lottie", "name": "Lottie", "count": 9 },
    { "slug": "team", "name": "Team", "count": 8 },
    { "slug": "map", "name": "Map", "count": 7 },
    { "slug": "portfolio", "name": "Project", "count": 39 },
    { "slug": "gallery", "name": "Gallery", "count": 4 }
  ]
}
```

### Get Single Template

```
GET /api/templates/{slug}
```

Returns full template data including the WPBakery shortcode content.

**Example:** `GET /api/templates/harbor-hero`

**Response:**
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
    "shortcodesUsed": ["vc_section", "vc_row", "vc_column", "split_line_heading"],
    "content": "[vc_section type=\"full_width_background\" ...][/vc_section]"
  }
}
```

### Compose Page from Multiple Templates

```
POST /api/compose
Content-Type: application/json
```

Combines multiple templates into a single page layout.

**Request Body:**
```json
{
  "templateSlugs": [
    "harbor-hero",
    "harbor-intro",
    "horizontal-services",
    "harbor-cta"
  ]
}
```

**Response:**
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

## How It Works with WordPress

WPBakery stores page content as shortcode strings in the WordPress `post_content` field. The flow:

1. **AI queries this API** to browse available sections
2. **AI picks templates** based on the page requirements
3. **AI calls `/api/compose`** to combine selected sections
4. **AI pushes the composed content** to WordPress via MCP (`wp_update_post` with the shortcode string as `post_content`)

The shortcode content is the design. No rendering needed — WordPress + Salient + WPBakery handle that on the frontend.

## AI Usage Example

When working with Claude Code + WordPress MCP:

```
"Build me a landing page for a consulting firm with:
- A hero section with parallax background
- An about/intro section
- Services section
- Testimonials
- Call to action"
```

The AI would:
1. `GET /api/templates?category=hero_section` → pick a hero
2. `GET /api/templates?category=about` → pick an about section
3. `GET /api/templates?category=services` → pick a services section
4. `GET /api/templates?category=testimonials` → pick testimonials
5. `GET /api/templates?category=cta` → pick a CTA
6. `POST /api/compose` with the selected slugs
7. Push the composed `content` to WordPress as `post_content`

## Template Data Structure

Each template contains:
- **name**: Display name (e.g., "Harbor Hero")
- **slug**: URL-safe identifier (e.g., "harbor-hero")
- **categories**: Array of category slugs (e.g., ["hero_section"])
- **shortcodesUsed**: WPBakery shortcode types in this template
- **content**: Raw WPBakery shortcode markup (the actual design)
- **image**: Preview thumbnail filename
- **date**: When the template was added to Salient

## Development

```bash
npm install
npm run dev
```

## Re-extract Templates

When Salient theme updates with new templates:

```bash
php scripts/extract-templates.php /path/to/salient-core/includes/salient-studio-templates.php
# Then copy the output data/ files into app/data/
```

## Deploy

Push to GitHub, connect to Vercel. Zero config needed — it's a standard Next.js app.

## Tech Stack

- Next.js (App Router) + TypeScript
- Static JSON data (no database)
- Vercel Edge-ready
- CORS enabled for cross-origin API access
