// 把站点内路径拼到部署前缀（Astro 的 BASE_URL）后面。
// 兼容 base 有无尾斜杠、path 有无前导斜杠，根路径部署不会产生双斜杠。
export function withBase(base: string, path: string): string {
  const prefix = base === '' ? '/' : base.endsWith('/') ? base : `${base}/`;
  return prefix + path.replace(/^\/+/, '');
}
