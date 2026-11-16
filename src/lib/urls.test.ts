import { describe, it, expect } from 'vitest';
import { withBase } from './urls';

describe('withBase', () => {
  it('子路径部署时拼接前缀', () => {
    expect(withBase('/blog/', '/tags/')).toBe('/blog/tags/');
  });

  it('base 缺少尾斜杠时补齐', () => {
    expect(withBase('/blog', 'posts/x')).toBe('/blog/posts/x');
  });

  it('根路径部署不产生双斜杠', () => {
    expect(withBase('/', '/posts/x/')).toBe('/posts/x/');
  });

  it('base 为空时按根路径处理', () => {
    expect(withBase('', '/posts/x/')).toBe('/posts/x/');
  });
});
