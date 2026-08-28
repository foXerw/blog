import type { APIContext } from 'astro';
import { robotsTxt } from '../lib/robots';

export function GET(context: APIContext) {
  const siteUrl = context.site?.toString() ?? 'http://localhost:4321';
  return new Response(robotsTxt(siteUrl, import.meta.env.BASE_URL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
