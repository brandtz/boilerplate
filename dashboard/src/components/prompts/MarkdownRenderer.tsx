'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Renders markdown safely. Never uses rehype-raw (HIGH-002).
 * Sanitizes link protocols to prevent javascript: XSS.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className="prose prose-sm max-w-none" data-testid="markdown-renderer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            // Only allow safe protocols; reject protocol-relative URLs (//evil.com)
            const isSafe =
              !!href &&
              (/^(https?:|mailto:|#)/i.test(href) ||
               (href.startsWith('/') && !href.startsWith('//')));
            return (
              <a
                {...props}
                href={isSafe ? href : undefined}
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
