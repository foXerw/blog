import { createHash } from 'node:crypto';
import MarkdownIt from 'markdown-it';

// 正文列宽 38rem = 608px；D2 图按这个宽度决定是否需要横向或纵向布局。
export const D2_COLUMN_WIDTH = 608;
export const D2_MAX_HEIGHT = 900;
export const D2_MIN_HORIZONTAL_SCALE = 0.75;
// 比正文列宽就允许借用两边留白，避免 700px 的图被硬缩到 608px。
export const D2_WIDE_THRESHOLD = D2_COLUMN_WIDTH;

// 明暗两套主题；颜色由主题 ID 决定，布局不变。
export const D2_RENDER_OPTIONS = {
  layout: 'tala',
  sketch: true,
  pad: 16,
  themeID: 0,
};
export const D2_DARK_THEME_ID = 200;

const markdown = new MarkdownIt('commonmark');

// 按 CommonMark 解析围栏，避免自己写状态机时漏掉引用块/缩进等写法。
export function extractD2Blocks(source) {
  return markdown
    .parse(source, {})
    .filter(token => token.type === 'fence' && /^d2(?:\s|\{|$)/i.test(token.info.trim()))
    .map(token => token.content);
}

// 哈希同时包含源码、渲染参数和自动布局阈值：
// 改主题/布局/列宽都会生成新文件名，天然绕过 CDN 旧缓存。
export function hashD2(source) {
  return createHash('md5')
    .update(source.trim())
    .update('\n')
    .update(
      JSON.stringify({
        ...D2_RENDER_OPTIONS,
        darkThemeID: D2_DARK_THEME_ID,
        columnWidth: D2_COLUMN_WIDTH,
        maxHeight: D2_MAX_HEIGHT,
        minHorizontalScale: D2_MIN_HORIZONTAL_SCALE,
      }),
    )
    .digest('hex');
}

export function svgDimensions(svg) {
  const match = /viewBox="[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)"/.exec(svg);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

export function displayScale(width, height) {
  if (!(width > 0) || !(height > 0)) return 0;
  return Math.min(1, D2_COLUMN_WIDTH / width, D2_MAX_HEIGHT / height);
}

// 只认顶层 direction；容器内部的 direction 不影响整张图的朝向。
export function hasTopLevelDirection(source) {
  return /^direction\s*:/m.test(source);
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function basePrefix(base) {
  if (base === '') return '/';
  return base.endsWith('/') ? base : `${base}/`;
}

export function figureMarkup({ key, alt = '', width = 0, height = 0, base = '/' }) {
  const prefix = basePrefix(base);
  const light = `${prefix}d2/${key}.light.svg`;
  const dark = `${prefix}d2/${key}.dark.svg`;
  const wide = width > D2_WIDE_THRESHOLD ? ' is-wide' : '';
  const size = width > 0 && height > 0 ? ` width="${width}" height="${height}"` : '';
  const caption = alt
    ? `\n  <figcaption>${escapeHtml(alt)}</figcaption>`
    : '';
  return `<figure class="d2-diagram${wide}">
  <img class="d2-svg" src="${light}" data-light="${light}" data-dark="${dark}" alt="${escapeHtml(alt || 'D2 示意图')}" loading="lazy" decoding="async"${size}>${caption}
</figure>`;
}

export function fallbackMarkup(source) {
  return `<figure class="d2-diagram d2-missing"><pre><code class="language-d2">${escapeHtml(source.trim())}</code></pre></figure>`;
}
