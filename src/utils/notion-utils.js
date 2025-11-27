import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_STORY_KEY});
const STORIES_DB_ID = process.env.NOTION_STORIES_DB_ID;

/**
 * Get all stories from Notion database
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results
 * @param {string} options.sortBy - Property to sort by (default: 'Date')
 * @param {string} options.sortDirection - Sort direction ('ascending' or 'descending')
 * @returns {Promise<Array>} Array of story objects
 */
export async function getAllStories(options = {}) {
  const {
    limit,
    sortBy = 'Date',
    sortDirection = 'descending'
  } = options;

  const response = await notion.databases.query({
    database_id: STORIES_DB_ID,
    sorts: [{
      property: sortBy,
      direction: sortDirection
    }],
    ...(limit && { page_size: limit })
  });

  return response.results.map(transformNotionPage);
}

/**
 * Get a single story by slug
 * @param {string} slug - Story slug
 * @returns {Promise<Object|null>} Story object or null if not found
 */
export async function getStoryBySlug(slug) {
  const response = await notion.databases.query({
    database_id: STORIES_DB_ID,
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

  return transformNotionPage(response.results[0]);
}

/**
 * Get all featured stories
 * @returns {Promise<Array>} Array of featured story objects
 */
export async function getFeaturedStories() {
  const response = await notion.databases.query({
    database_id: STORIES_DB_ID,
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
 * Create or update a story in Notion
 * @param {string} slug - Story slug
 * @param {Object} data - Story data
 * @returns {Promise<Object>} Created/updated story object
 */
export async function upsertStory(slug, data) {
  // Check if story exists
  const existing = await getStoryBySlug(slug);

  if (existing) {
    // Update existing story
    const response = await notion.pages.update({
      page_id: existing.id,
      properties: buildNotionProperties(slug, data)
    });
    return transformNotionPage(response);
  } else {
    // Create new story
    const response = await notion.pages.create({
      parent: { database_id: STORIES_DB_ID },
      properties: buildNotionProperties(slug, data)
    });
    return transformNotionPage(response);
  }
}

/**
 * Transform Notion page object to simplified story object
 * @param {Object} page - Notion page object
 * @returns {Object} Simplified story object
 */
function transformNotionPage(page) {
  const props = page.properties;

  return {
    id: page.id,
    slug: getPropertyValue(props.Slug, 'title'),
    data: {
      title: getPropertyValue(props.Title, 'rich_text'),
      type: getPropertyValue(props.Type, 'select'),
      tag: getPropertyValue(props.Tag, 'select'),
      date: getPropertyValue(props.Date, 'date'),
      description: getPropertyValue(props.Description, 'rich_text'),
      image: getPropertyValue(props.Image, 'url'),
      standaloneUrl: getPropertyValue(props.StandaloneURL, 'url'),
      isStandalone: getPropertyValue(props.isStandalone, 'checkbox') || false,
      hasLandingPage: getPropertyValue(props.hasLandingPage, 'checkbox') || false,
      featured: getPropertyValue(props.Featured, 'checkbox') || false,
      techStack: getPropertyValue(props.TechStack, 'multi_select') || []
    }
  };
}

/**
 * Build Notion properties object from story data
 * @param {string} slug - Story slug
 * @param {Object} data - Story data
 * @returns {Object} Notion properties object
 */
function buildNotionProperties(slug, data) {
  const properties = {
    Slug: {
      title: [{ text: { content: slug } }]
    }
  };

  if (data.title) {
    properties.Title = {
      rich_text: [{ text: { content: data.title } }]
    };
  }

  if (data.type) {
    properties.Type = {
      select: { name: data.type }
    };
  }

  if (data.tag) {
    properties.Tag = {
      select: { name: data.tag }
    };
  }

  if (data.date) {
    properties.Date = {
      date: { start: data.date }
    };
  }

  if (data.description) {
    properties.Description = {
      rich_text: [{ text: { content: data.description } }]
    };
  }

  if (data.image) {
    properties.Image = {
      url: data.image
    };
  }

  if (data.standaloneUrl) {
    properties.StandaloneURL = {
      url: data.standaloneUrl
    };
  }

  if (data.isStandalone !== undefined) {
    properties.isStandalone = {
      checkbox: data.isStandalone
    };
  }

  if (data.hasLandingPage !== undefined) {
    properties.hasLandingPage = {
      checkbox: data.hasLandingPage
    };
  }

  if (data.featured !== undefined) {
    properties.Featured = {
      checkbox: data.featured
    };
  }

  if (data.techStack && data.techStack.length > 0) {
    properties.TechStack = {
      multi_select: data.techStack.map(tech => ({ name: tech }))
    };
  }

  return properties;
}

/**
 * Extract value from Notion property
 * @param {Object} property - Notion property object
 * @param {string} type - Property type
 * @returns {any} Extracted value
 */
function getPropertyValue(property, type) {
  if (!property) return null;

  switch (type) {
    case 'title':
      return property.title?.[0]?.plain_text || null;

    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || null;

    case 'select':
      return property.select?.name || null;

    case 'multi_select':
      return property.multi_select?.map(item => item.name) || [];

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
