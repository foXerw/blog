import { describe, it, expect } from 'vitest';
import { robotsTxt } from './robots';

describe('robotsTxt', () => {
  it('子路径部署时 sitemap 带 base 前缀', () => {
    const out = robotsTxt('https://foxerw.github.io', '/personal-blog/');
    expect(out).toContain('Sitemap: https://foxerw.github.io/personal-blog/sitemap-index.xml');
  });

  it('根路径部署时 sitemap 不带前缀', () => {
    const out = robotsTxt('https://foxerw.github.io', '/');
    expect(out).toContain('Sitemap: https://foxerw.github.io/sitemap-index.xml');
  });

  it('site 尾斜杠被规范化', () => {
    const out = robotsTxt('https://foo.com/', '/');
    expect(out).toContain('Sitemap: https://foo.com/sitemap-index.xml');
  });

  it('包含 User-agent 与 Allow', () => {
    const out = robotsTxt('https://foo.com', '/');
    expect(out).toContain('User-agent: *');
    expect(out).toContain('Allow: /');
  });
});
