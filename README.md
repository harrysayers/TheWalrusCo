# The Walrus Co

A data storytelling website built with Astro, featuring interactive stories and tools powered by Notion CMS and Vercel Blob storage.

## Architecture Overview

This project uses a scalable architecture where:
- **Main site**: Built with Astro (this repo)
- **Stories/Tools**: Separate React apps deployed to Vercel Blob storage
- **Content Management**: Notion database for metadata and landing page content
- **Performance**: ISR caching with 1-hour expiration

## Setup

### 1. Install Dependencies

```sh
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```
NOTION_API_KEY=our_notion_integration_token (for Mailing list)
NOTION_STORY_KEY=our_notion_integration_token (for stories)
NOTION_DATABASE_ID=your_notion_database_id (for Mailing list)
NOTION_STORIES_DB_ID=your_notion_database_id
```

**Getting tokens:**
- **Notion**: Create an integration at [notion.so/my-integrations](https://www.notion.so/my-integrations) and share your database with it

### 3. Notion Database Setup

Your Notion database needs these properties:

| Property | Type | Description |
|----------|------|-------------|
| Title | Title | Story/tool title |
| Slug | Rich Text | URL slug (e.g., "my-story") |
| Type | Select | "Data Story" or "Data Tool" |
| Tag | Select | "Science", "Society", or "Culture" |
| Description | Rich Text | Short description |
| Image | URL | Cover image URL |
| Date | Date | Publication date |
| StandaloneURL | URL | Vercel Blob URL where the built story is hosted |
| hasLandingPage | Checkbox | Show landing page (true) or redirect directly (false) |
| Featured | Checkbox | Show in featured section on homepage |

**Page Content**: The actual Notion page content (text, images, etc.) is automatically used for landing pages when `hasLandingPage` is checked.

## Development

```sh
npm run dev
```

Visit `localhost:4321`

## Building Stories/Tools

Stories are built separately using the [twc-story-template](../twc-story-template):

1. Create new story from template
2. Develop your interactive story/tool
3. Run deployment script to upload to Vercel Blob
4. Script automatically updates Notion with the Blob URL

## How It Works

1. **Homepage**: Queries Notion database for all stories, displays featured stories and grid
2. **Landing Pages** (`/stories/[slug]`): If `hasLandingPage` is true, shows Notion page content with "Launch Tool" button
3. **Story Viewer** (`/story/[slug]`): Fetches and serves the built HTML from Vercel Blob storage
4. **Caching**: ISR caching reduces Notion API calls and improves performance

## Project Structure

```
/
├── src/
│   ├── components/        # Astro components
│   │   ├── feature-story.astro
│   │   └── story-grid.astro
│   ├── pages/
│   │   ├── story/[slug].astro    # Story viewer
│   │   └── stories/[slug].astro  # Landing pages
│   └── utils/
│       ├── notion.ts             # Notion API integration
│       └── notion-utils.js       # Utility functions
├── public/                # Static assets
└── astro.config.mjs       # Astro config with Vercel adapter

```

## Deployment

The site deploys automatically to Vercel on push to main branch.

**Important**: Story build outputs are NOT committed to git. They are stored in Vercel Blob and served from there.
