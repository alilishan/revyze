import { describe, it, expect } from 'vitest'
import { sanitize, stripHtml } from './html'

describe('sanitize', () => {
  it('keeps allowed block tags', () => {
    expect(sanitize('<p>Hello</p>')).toBe('<p>Hello</p>')
  })

  it('keeps list tags', () => {
    expect(sanitize('<ul><li>A</li><li>B</li></ul>')).toBe('<ul><li>A</li><li>B</li></ul>')
  })

  it('keeps inline formatting', () => {
    expect(sanitize('<strong>bold</strong>')).toBe('<strong>bold</strong>')
    expect(sanitize('<em>italic</em>')).toBe('<em>italic</em>')
  })

  it('strips script tags', () => {
    expect(sanitize('<script>alert(1)</script>Hello')).toBe('Hello')
  })

  it('strips event handler attributes', () => {
    expect(sanitize('<p onclick="alert(1)">text</p>')).toBe('<p>text</p>')
  })

  it('strips disallowed tags but keeps text', () => {
    expect(sanitize('<iframe src="x"></iframe>text')).toBe('text')
  })
})

describe('stripHtml', () => {
  it('removes all tags and returns plain text', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('flattens list items into plain text', () => {
    expect(stripHtml('<ul><li>A</li><li>B</li></ul>')).toBe('AB')
  })

  it('passes plain text through unchanged', () => {
    expect(stripHtml('plain text')).toBe('plain text')
  })
})
