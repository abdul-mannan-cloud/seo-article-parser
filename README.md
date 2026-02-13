# SEO Article QA Dashboard

A Next.js app for parsing Google Doc articles, running SEO quality checks, editing content in a WYSIWYG editor, and previewing a publish-ready view.

## What This System Does
- Fetches a Google Doc by ID or URL and extracts article content.
- Parses metadata, headings, links, images, alt tags, and basic formatting.
- Runs SEO quality checks (images, product links, meta lengths, formatting).
- Provides a clean overview dashboard with pass/fail highlights.
- Lets editors update content in a rich WYSIWYG editor.
- Supports meta title/description editing via a modal.
- Shows a full-page publish preview (bottom sheet) before confirming publish.
- Recomputes SEO stats from the edited HTML.

## Key Features
- **Google Doc intake**: paste a full URL or ID.
- **Metadata extraction**: meta title + description, article title, headings.
- **Image parsing**: detects Drive image links and alt tags.
- **Product link checks**: detects unique product/collection URLs.
- **Formatting checks**: headings, lists/emphasis, tables.
- **Editor**: WYSIWYG (Tiptap Simple Editor).
- **Publish preview**: full-page, formatted HTML preview.
- **Update Stats**: re-run checks on edited HTML.

## Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- Cheerio
- Motion (motion.dev)
- Tiptap (Simple Editor)

## Install & Run

### 1) Install dependencies
```bash
npm install
```

### 2) Run the dev server
```bash
npm run dev
```

Open:
```
http://localhost:3000
```

## How To Use
1. Paste a Google Doc link or ID in the search bar.
2. Press Enter or click **Analyze**.
3. Review the Overview dashboard (SEO checklist, headings, links, media).
4. Click **Edit & Review Article** to open the WYSIWYG editor.
5. Click **Edit Meta Tags** to update meta title/description.
6. Make content edits in the editor.
7. Click **Update Stats** to re-run SEO checks on edited content.
8. Click **Publish to WordPress** to open the publish preview.
9. Confirm publish (placeholder action shows a toast).

## API Routes
- `POST /api/parse-article`
  - Body: `{ docId: string }`
  - Fetches the doc HTML, parses data, returns article + quality.

- `POST /api/parse-html`
  - Body: `{ html: string }`
  - Parses edited HTML and returns updated article + quality.

## Notes
- Publishing is a placeholder (toast only).
- The app assumes public access to Google Doc and Drive links.

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
```
