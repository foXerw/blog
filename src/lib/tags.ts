// 标签名 → URL 路径段。只保留 Unicode 字母、数字、下划线与连字符，
// 其余字符（斜杠、空白、标点等）折叠为单个连字符，避免生成嵌套路由或非法路径。
export function tagSlug(name: string): string {
  const slug = name
    .trim()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'tag';
}
