import type { APIRoute } from 'astro';
import { Client } from '@notionhq/client';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const email = data.email;

    console.log('Received email:', email);
    console.log('Notion API Key exists:', !!import.meta.env.NOTION_API_KEY);
    console.log('Notion Database ID exists:', !!import.meta.env.NOTION_DATABASE_ID);

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!import.meta.env.NOTION_API_KEY || !import.meta.env.NOTION_DATABASE_ID) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const notion = new Client({ auth: import.meta.env.NOTION_API_KEY });

    await notion.pages.create({
      parent: { database_id: import.meta.env.NOTION_DATABASE_ID },
      properties: {
        Email: {
          title: [
            {
              text: {
                content: email
              }
            }
          ]
        }
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Notion API error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to subscribe',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
