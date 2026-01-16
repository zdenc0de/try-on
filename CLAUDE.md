# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Try-On is an AI-powered secondhand fashion marketplace built with Next.js 15, React 19, Tailwind CSS v4, and Supabase. It uses Google Gemini API for intelligent product discovery and image analysis.

## Commands

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No testing framework is configured.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
GEMINI_API_KEY=<gemini_api_key>
```

## Architecture

### Directory Structure
- `app/actions/` - Server Actions for Gemini API calls and database operations
- `app/components/` - React components (mix of `.tsx` and `.jsx`)
- `app/*/page.tsx` - Route pages using Next.js App Router
- `lib/supabase/` - Supabase client factories

### Key Patterns

**Server vs Client Supabase:**
- Server actions/components: `import { createClient } from '@/lib/supabase/server'` (async, uses cookies)
- Client components: `import { createClient } from '@/lib/supabase/client'` (sync, browser client)

**Server Actions:** All AI and database operations use `'use server'` directive in `app/actions/`. Key actions:
- `smart-search.ts` - Gemini-powered search with term expansion and relevance filtering
- `analyze-image.js` - Multimodal image analysis for product auto-tagging
- `save-product.js` - Upload to Supabase Storage + DB insert
- `enrich-tags.ts` - Tag enrichment for products

**Database:** Supabase PostgreSQL with tables `profiles` and `products`. Products use tags array field with `.overlaps()` for search matching.

**Image Handling:** Client-side compression for images >1MB (canvas resize to 1920px, 70% JPEG quality) before upload.

### Gemini API Usage
- Model: `gemini-2.5-flash`
- Two-pass search: (1) expand query to fashion terms, (2) filter irrelevant results
- Image analysis: generates title, description, category, price estimate, and 15-20 semantic tags

## Design System

- Dark mode brutalista theme
- Colors: Black (#0a0a0a), Orange accent (#ff4d00)
- Typography: Geist Sans + Geist Mono
- Style: No rounded corners, uppercase text, tight letter-spacing
