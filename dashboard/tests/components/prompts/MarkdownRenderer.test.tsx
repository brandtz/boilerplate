import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/prompts/MarkdownRenderer';

// Mock react-markdown to avoid ESM issues in jest
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({
    children,
    components,
  }: {
    children: string;
    components?: Record<string, unknown>;
  }) {
    // Simulate link component resolution for XSS tests
    const LinkComponent = (components?.a as React.ComponentType<{
      href?: string;
      children: React.ReactNode;
    }>) ?? 'a';

    // Parse out links from markdown for testing
    const linkMatch = children.match(/\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      return (
        <div data-testid="mock-markdown">
          <LinkComponent href={linkMatch[2]}>
            {linkMatch[1]}
          </LinkComponent>
        </div>
      );
    }

    return <div data-testid="mock-markdown">{children}</div>;
  };
});

jest.mock('remark-gfm', () => () => {});

describe('MarkdownRenderer', () => {
  it('renders content', () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('Hello world');
  });

  it('renders nothing for empty content', () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container.firstChild).toBeNull();
  });

  it('blocks javascript: URIs in links', () => {
    render(
      <MarkdownRenderer content="[click](javascript:alert(1))" />,
    );
    const link = screen.getByText('click');
    expect(link).not.toHaveAttribute('href');
  });

  it('allows https: URIs in links', () => {
    render(
      <MarkdownRenderer content="[click](https://example.com)" />,
    );
    const link = screen.getByText('click');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('allows mailto: URIs in links', () => {
    render(
      <MarkdownRenderer content="[email](mailto:test@example.com)" />,
    );
    const link = screen.getByText('email');
    expect(link).toHaveAttribute('href', 'mailto:test@example.com');
  });

  it('blocks data: URIs in links', () => {
    render(
      <MarkdownRenderer content="[click](data:text/html,<script>alert(1)</script>)" />,
    );
    const link = screen.getByText('click');
    expect(link).not.toHaveAttribute('href');
  });

  it('has prose styling wrapper', () => {
    render(<MarkdownRenderer content="test" />);
    expect(screen.getByTestId('markdown-renderer').className).toContain('prose');
  });
});
