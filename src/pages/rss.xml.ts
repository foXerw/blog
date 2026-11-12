import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts', p => !p.data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, 20);
  return rss({
    title: 'foxerw 的博客',
    description: '技术与生活记录',
    // 频道主页链接必须包含部署前缀；item 链接已是绝对地址，不会重复拼接
    site: new URL(import.meta.env.BASE_URL, context.site!),
    items: posts.map(p => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.date,
      link: `${import.meta.env.BASE_URL}posts/${p.slug}/`,
    })),
  });
}
