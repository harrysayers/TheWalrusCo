# Story Management System - Implementation Guide

## Overview

Your site now supports **both text-based stories and complex interactive data tools** through a unified Content Collections system.

---

## ✅ What's Been Implemented

### 1. **Astro Content Collections**
- Schema defined in `src/content/config.ts`
- Supports both text stories (MDX) and standalone React apps
- Single source of truth for all story metadata

### 2. **Dynamic Story Pages**
- Route: `/stories/[slug]` handles all stories
- Auto-detects story type (text vs. standalone tool)
- Full SEO support with meta tags and OpenGraph

### 3. **SEO Protection**
- Standalone React apps now have `noindex, nofollow` meta tags
- Landing pages (SEO-friendly) appear in search results
- React apps blocked from indexing via robots.txt

### 4. **Updated Components**
- `feature-story.astro` - Uses Content Collections
- `story-grid.astro` - Uses Content Collections
- Both support sorting by featured status

---

## 📝 How to Add Stories

### **Option A: Text-Based Story**

1. Create a new MDX file in `src/content/stories/`:

```mdx
---
title: "Your Story Title"
type: "Data Story"
date: "14th Nov 2025"
description: "A brief description of your story"
image: "/path/to/preview-image.png"
isStandalone: false
featured: false
---

# Your Story Content

Write your story here using Markdown. You can include:

- **Bold text**
- Lists
- Images
- Links

## Subheadings

More content here...
```

2. Save the file as `src/content/stories/my-story-name.mdx`
3. It will automatically appear on your homepage and be accessible at `/stories/my-story-name/`

---

### **Option B: Complex Data Tool (React App)**

1. **Build your React app** and place it in `public/stories/[tool-name]/`
   ```
   public/stories/
     my-tool/
       index.html
       static/
         js/
         css/
   ```

2. **Create a landing page** MDX file in `src/content/stories/`:

```mdx
---
title: "My Interactive Data Tool"
type: "Data Tool"
date: "14th Nov 2025"
description: "Explore complex data through interactive visualization"
image: "/stories/my-tool/preview.png"
isStandalone: true
standaloneUrl: "/stories/my-tool/"
hasLandingPage: true
techStack: ['React', 'D3.js', 'MapBox']
featured: false
---

This tool lets you explore XYZ data through an immersive interface.

## Features
- Feature 1
- Feature 2
- Feature 3

## How to Use
1. Click "Launch Tool" below
2. Select your parameters
3. Explore the data

Ready to dive in?
```

3. **Update the React app's meta tags** (in `public/stories/my-tool/index.html`):
   ```html
   <meta name="robots" content="noindex, nofollow"/>
   <meta name="description" content="Your tool description"/>
   <title>Your Tool Name | The Walrus Co</title>
   ```

4. **Update robots.txt** in the tool directory:
   ```
   User-agent: *
   Disallow: /
   ```

---

## 🎯 User Journey

### For Text Stories:
1. Homepage → Click story → View story content directly

### For Data Tools:
1. Homepage → Click tool
2. **Landing page** appears (SEO-friendly, server-rendered)
   - Shows description, features, tech stack
   - Has "Launch Tool" button
3. Click "Launch Tool" → React app loads in full screen

---

## 📊 Schema Reference

```typescript
{
  title: string                    // Story title
  type: 'Data Story' | 'Data Tool' // Type badge
  date: string                     // Display date
  description: string              // Short description
  image: string                    // Preview image path

  // For standalone React apps only:
  isStandalone: boolean            // Is this a React app?
  standaloneUrl: string            // Path to React app
  hasLandingPage: boolean          // Show intro page first?
  techStack: string[]              // Tech used (optional)

  // Display options:
  featured: boolean                // Show first on homepage
}
```

---

## 🔍 SEO Strategy

### **Text Stories:**
- Fully server-rendered
- Complete content in HTML
- Meta tags, OpenGraph, Twitter cards
- Indexed by search engines ✅

### **Data Tools:**
- **Landing page** (server-rendered) → Indexed ✅
- **React app** (client-rendered) → Not indexed ❌
- Search engines see the landing page with full context
- Users get SEO-friendly intro, then launch the tool

---

## 📁 File Structure

```
the-walrus-co/
├── src/
│   ├── content/
│   │   ├── config.ts              # Schema definition
│   │   └── stories/
│   │       ├── a-test-story.mdx   # Standalone tool (landing page)
│   │       └── example-text.mdx   # Text story
│   ├── pages/
│   │   └── stories/
│   │       └── [slug].astro       # Dynamic route
│   └── components/
│       ├── feature-story.astro    # Homepage featured stories
│       └── story-grid.astro       # Homepage story grid
│
└── public/
    └── stories/
        └── a-test-story/          # React app build
            ├── index.html
            ├── robots.txt
            └── static/
```

---

## 🚀 Next Steps

1. **Remove old `stories.js`** file (no longer needed)
2. **Add more stories** using the templates above
3. **Migrate existing React apps** to the new structure
4. **Consider adding**:
   - Author field
   - Categories/tags
   - Reading time estimation
   - Related stories

---

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ❓ Common Tasks

### Make a story featured:
```mdx
---
featured: true
---
```

### Skip landing page (auto-redirect to tool):
```mdx
---
isStandalone: true
hasLandingPage: false
standaloneUrl: "/stories/my-tool/"
---
```

### Add custom OG image:
```mdx
---
image: "/custom-og-image.png"
---
```

---

## 📈 Benefits of This System

✅ **Unified management** - All stories in one place
✅ **SEO-friendly** - Server-rendered landing pages
✅ **Flexible** - Supports text and complex tools
✅ **Type-safe** - Schema validation via Zod
✅ **Git-based** - Content lives in your repo
✅ **No CMS needed** - Edit files directly
✅ **Performance** - Static generation where possible

---

## 🐛 Troubleshooting

**Story not appearing?**
- Check frontmatter syntax (YAML format)
- Ensure file is in `src/content/stories/`
- Restart dev server

**React app not loading?**
- Verify `standaloneUrl` matches folder in `public/stories/`
- Check browser console for errors
- Ensure all assets use relative paths

**SEO issues?**
- Landing page should have `isStandalone: true` and `hasLandingPage: true`
- React app should have `<meta name="robots" content="noindex, nofollow"/>`
- Check robots.txt in the React app folder
