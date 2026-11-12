import { describe, it, expect } from 'vitest';
import { tagSlug } from './tags';

describe('tagSlug', () => {
  it('普通标签保持不变', () => {
    expect(tagSlug('JavaScript')).toBe('JavaScript');
  });

  it('中文标签保持不变', () => {
    expect(tagSlug('前端')).toBe('前端');
  });

  it('斜杠转为连字符', () => {
    expect(tagSlug('UI/UX')).toBe('UI-UX');
  });

  it('空白与连续非法字符折叠为一个连字符', () => {
    expect(tagSlug('Node  js')).toBe('Node-js');
  });

  it('去掉标点符号', () => {
    expect(tagSlug('C++')).toBe('C');
  });

  it('全是非法字符时回退为 tag', () => {
    expect(tagSlug('..')).toBe('tag');
  });

  it('去掉首尾连字符', () => {
    expect(tagSlug(' #CSS# ')).toBe('CSS');
  });
});
