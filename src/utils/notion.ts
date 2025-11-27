// Use Notion REST API directly instead of SDK
function getNotionToken() {
  return import.meta.env.NOTION_STORY_KEY || process.env.NOTION_STORY_KEY;
}

function getStoriesDbId() {
  return import.meta.env.NOTION_STORIES_DB_ID || process.env.NOTION_STORIES_DB_ID;
}

// Query Notion database using REST API
async function queryNotionDatabase(databaseId: string, options: any = {}) {
  const token = getNotionToken();
  if (!token) {
    throw new Error('NOTION_STORY_KEY environment variable is not set');
  }

  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Fetch page content blocks from Notion
async function getPageContent(pageId: string): Promise<string> {
  const token = getNotionToken();
  if (!token) {
    return '';
  }

  const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch page content');
    return '';
  }

  const data = await response.json();

  // Convert blocks to simple HTML
  let html = '';
  for (const block of data.results) {
    html += blockToHtml(block);
  }

  return html;
}

// Convert Notion block to HTML
function blockToHtml(block: any): string {
  const type = block.type;

  switch (type) {
    case 'paragraph':
      const text = block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
      return text ? `<p>${text}</p>` : '';

    case 'heading_1':
      const h1Text = block.heading_1.rich_text.map((t: any) => t.plain_text).join('');
      return `<h2>${h1Text}</h2>`;

    case 'heading_2':
      const h2Text = block.heading_2.rich_text.map((t: any) => t.plain_text).join('');
      return `<h3>${h2Text}</h3>`;

    case 'heading_3':
      const h3Text = block.heading_3.rich_text.map((t: any) => t.plain_text).join('');
      return `<h4>${h3Text}</h4>`;

    case 'bulleted_list_item':
      const liText = block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join('');
      return `<ul><li>${liText}</li></ul>`;

    case 'numbered_list_item':
      const numText = block.numbered_list_item.rich_text.map((t: any) => t.plain_text).join('');
      return `<ol><li>${numText}</li></ol>`;

    case 'image':
      const imageUrl = block.image.type === 'external'
        ? block.image.external.url
        : block.image.file.url;
      const caption = block.image.caption?.map((t: any) => t.plain_text).join('') || '';
      return `<img src="${imageUrl}" alt="${caption}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />`;

    case 'video':
      const videoUrl = block.video.type === 'external'
        ? block.video.external.url
        : block.video.file.url;
      return `<video src="${videoUrl}" controls style="max-width: 100%; border-radius: 8px; margin: 20px 0;"></video>`;

    case 'quote':
      const quoteText = block.quote.rich_text.map((t: any) => t.plain_text).join('');
      return `<blockquote style="border-left: 4px solid #D45A1D; padding-left: 20px; margin: 20px 0; font-style: italic; color: #666;">${quoteText}</blockquote>`;

    case 'code':
      const codeText = block.code.rich_text.map((t: any) => t.plain_text).join('');
      const language = block.code.language || 'text';
      return `<pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; margin: 20px 0;"><code>${codeText}</code></pre>`;

    case 'divider':
      return `<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />`;

    default:
      return '';
  }
}

export interface Story {
  slug: string;
  data: {
    title: string;
    type: 'Data Story' | 'Data Tool';
    tag: 'Science' | 'Society' | 'Culture';
    date: string;
    description: string;
    image: string;
    standaloneUrl: string; // Always required now
    hasLandingPage: boolean; // Only option: show landing page or auto-redirect
    featured: boolean;
    content?: string; // Landing page content from Notion
  };
}

/**
 * Get all stories from Notion database
 */
export async function getAllStories(): Promise<Story[]> {
  const STORIES_DB_ID = getStoriesDbId();

  if (!STORIES_DB_ID) {
    console.warn('NOTION_STORIES_DB_ID not set, returning empty array');
    return [];
  }

  const response = await queryNotionDatabase(STORIES_DB_ID, {
    sorts: [{
      property: 'Date',
      direction: 'descending'
    }]
  });

  return response.results.map(transformNotionPage);
}

/**
 * Get a single story by slug
 */
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const STORIES_DB_ID = getStoriesDbId();

  if (!STORIES_DB_ID) {
    console.warn('NOTION_STORIES_DB_ID not set');
    return null;
  }

  const response = await queryNotionDatabase(STORIES_DB_ID, {
    filter: {
      property: 'Slug',
      title: {
        equals: slug
      }
    }
  });

  if (response.results.length === 0) {
    return null;
  }

  const page = response.results[0];

  // Fetch page content blocks
  const content = await getPageContent(page.id);

  return transformNotionPage(page, content);
}

/**
 * Get all featured stories
 */
export async function getFeaturedStories(): Promise<Story[]> {
  const STORIES_DB_ID = getStoriesDbId();

  if (!STORIES_DB_ID) {
    console.warn('NOTION_STORIES_DB_ID not set, returning empty array');
    return [];
  }

  const response = await queryNotionDatabase(STORIES_DB_ID, {
    filter: {
      property: 'Featured',
      checkbox: {
        equals: true
      }
    },
    sorts: [{
      property: 'Date',
      direction: 'descending'
    }]
  });

  return response.results.map(transformNotionPage);
}

/**
 * Transform Notion page object to Story type
 */
function transformNotionPage(page: any, content?: string): Story {
  const props = page.properties;

  return {
    slug: getPropertyValue(props.Slug, 'rich_text') || '',
    data: {
      title: getPropertyValue(props.Title, 'title') || '',
      type: getPropertyValue(props.Type, 'select') as 'Data Story' | 'Data Tool',
      tag: getPropertyValue(props.Tag, 'select') as 'Science' | 'Society' | 'Culture',
      date: getPropertyValue(props.Date, 'date') || '',
      description: getPropertyValue(props.Description, 'rich_text') || '',
      image: getPropertyValue(props.Image, 'url') || '',
      standaloneUrl: getPropertyValue(props.StandaloneURL, 'url') || '',
      hasLandingPage: getPropertyValue(props.hasLandingPage, 'checkbox') || false,
      featured: getPropertyValue(props.Featured, 'checkbox') || false,
      content: content || undefined
    }
  };
}

/**
 * Extract value from Notion property
 */
function getPropertyValue(property: any, type: string): any {
  if (!property) return null;

  switch (type) {
    case 'title':
      return property.title?.[0]?.plain_text || null;

    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || null;

    case 'select':
      return property.select?.name || null;

    case 'multi_select':
      return property.multi_select?.map((item: any) => item.name) || [];

    case 'date':
      return property.date?.start || null;

    case 'url':
      return property.url || null;

    case 'checkbox':
      return property.checkbox || false;

    default:
      return null;
  }
}
