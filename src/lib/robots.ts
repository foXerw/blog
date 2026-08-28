export function robotsTxt(site: string, base: string): string {
  const siteTrimmed = site.replace(/\/+$/, '');
  const baseNormalized = base.endsWith('/') ? base : `${base}/`;
  const sitemap = `${siteTrimmed}${baseNormalized}sitemap-index.xml`;
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
}
