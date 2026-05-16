'use client'

import { sanitize } from '@/lib/html'

export function HtmlContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  )
}
