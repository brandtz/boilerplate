import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParsedPrompt, ParsedHandoff, PromptStatus } from '@/types';
import { PromptDetailDrawer } from '@/components/prompts/PromptDetailDrawer';
import { createRef } from 'react';

// Mock react-markdown to avoid ESM issues in jest
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="mock-markdown">{children}</div>;
  };
});

jest.mock('remark-gfm', () => () => {});

const mockCopy = jest.fn().mockResolvedValue(undefined);
let mockCopied = false;

jest.mock('@/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copied: mockCopied,
    copy: mockCopy,
  }),
}));

function makePrompt(overrides?: Partial<ParsedPrompt>): ParsedPrompt {
  return {
    promptId: '3.0.1',
    title: 'UX Wireframes',
    phase: 'product-definition',
    status: 'ready' as PromptStatus,
    epicId: 'E2',
    storyId: 'E2-S1',
    taskIds: ['E2-S1-T1', 'E2-S1-T2'],
    role: 'Product Designer UX',
    prerequisites: ['2.0.1'],
    requiredReading: ['docs/prd.md', 'docs/wireframes.md'],
    downstreamPrompts: ['4.0.1'],
    insertedAfter: null,
    affectsPrompts: [],
    reviewRequired: [],
    createdAt: '2026-04-03T00:00:00Z',
    updatedAt: '2026-04-03T00:00:00Z',
    sessionHandoff: '',
    supersedes: '',
    supersededBy: '',
    insertReason: '',
    completedAt: '',
    archivedAt: '',
    body: '# Prompt Body\n\nSome content here.',
    sourcePath: 'prompts/active/3.0.1.md',
    ...overrides,
  };
}

function makeHandoff(overrides?: Partial<ParsedHandoff>): ParsedHandoff {
  return {
    sessionId: 'S-001',
    promptId: '3.0.1',
    role: 'Designer',
    statusOutcome: 'completed',
    completionPercent: 100,
    startedAt: '2026-04-03T10:00:00Z',
    endedAt: '2026-04-03T12:00:00Z',
    changedFiles: ['file1.ts', 'file2.ts'],
    blockers: [],
    nextRecommendedPrompts: [],
    summary: 'Created all wireframes',
    sourcePath: 'agents/handoffs/S-001.md',
    ...overrides,
  };
}

const defaultProps = {
  prompt: makePrompt(),
  handoffs: [] as ParsedHandoff[],
  prerequisiteStatuses: [{ promptId: '2.0.1', status: 'done' as PromptStatus }],
  isOpen: true,
  onClose: jest.fn(),
  onPromptNavigate: jest.fn(),
  drawerRef: createRef<HTMLDivElement>(),
};

describe('PromptDetailDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCopied = false;
  });

  it('renders all metadata fields when open', () => {
    render(<PromptDetailDrawer {...defaultProps} />);

    expect(screen.getByTestId('drawer-title')).toHaveTextContent('Prompt 3.0.1');
    const metadata = screen.getByTestId('drawer-metadata');
    expect(metadata).toHaveTextContent('E2');
    expect(metadata).toHaveTextContent('E2-S1');
    expect(metadata).toHaveTextContent('Product Designer UX');
    expect(metadata).toHaveTextContent('product-definition');
  });

  it('does not render when closed', () => {
    render(<PromptDetailDrawer {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('prompt-detail-drawer')).not.toBeInTheDocument();
  });

  it('does not render when prompt is null', () => {
    render(<PromptDetailDrawer {...defaultProps} prompt={null} />);
    expect(screen.queryByTestId('prompt-detail-drawer')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<PromptDetailDrawer {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByTestId('drawer-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<PromptDetailDrawer {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByTestId('drawer-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows met prerequisites with ✅', () => {
    render(<PromptDetailDrawer {...defaultProps} />);
    const prereqs = screen.getByTestId('drawer-prerequisites');
    expect(prereqs).toHaveTextContent('✅');
    expect(prereqs).toHaveTextContent('2.0.1');
  });

  it('shows unmet prerequisites with ❌', () => {
    render(
      <PromptDetailDrawer
        {...defaultProps}
        prerequisiteStatuses={[{ promptId: '2.0.1', status: 'ready' }]}
      />,
    );
    const prereqs = screen.getByTestId('drawer-prerequisites');
    expect(prereqs).toHaveTextContent('❌');
  });

  it('calls onPromptNavigate when prerequisite link is clicked', async () => {
    const user = userEvent.setup();
    const onPromptNavigate = jest.fn();
    render(
      <PromptDetailDrawer
        {...defaultProps}
        onPromptNavigate={onPromptNavigate}
      />,
    );

    await user.click(screen.getByTestId('prereq-link-2.0.1'));
    expect(onPromptNavigate).toHaveBeenCalledWith('2.0.1');
  });

  it('renders required reading list', () => {
    render(<PromptDetailDrawer {...defaultProps} />);
    const reading = screen.getByTestId('drawer-required-reading');
    expect(reading).toHaveTextContent('docs/prd.md');
    expect(reading).toHaveTextContent('docs/wireframes.md');
  });

  it('renders downstream prompt links', () => {
    render(<PromptDetailDrawer {...defaultProps} />);
    expect(screen.getByTestId('downstream-link-4.0.1')).toHaveTextContent('→ 4.0.1');
  });

  it('shows handoff section when handoffs exist', () => {
    render(
      <PromptDetailDrawer
        {...defaultProps}
        handoffs={[makeHandoff()]}
      />,
    );
    const handoff = screen.getByTestId('drawer-handoff');
    expect(handoff).toHaveTextContent('Created all wireframes');
    expect(handoff).toHaveTextContent('Changed files (2):');
  });

  it('shows changed file paths in handoff card', () => {
    render(
      <PromptDetailDrawer
        {...defaultProps}
        handoffs={[makeHandoff({ changedFiles: ['src/a.ts', 'src/b.ts', 'src/c.ts'] })]}
      />,
    );
    const filesList = screen.getByTestId('changed-files-S-001');
    expect(filesList.children).toHaveLength(3);
    expect(filesList).toHaveTextContent('src/a.ts');
  });

  it('shows multiple handoffs sorted newest first', () => {
    const h1 = makeHandoff({ sessionId: 'S-OLD', endedAt: '2026-04-01T12:00:00Z', summary: 'Old session' });
    const h2 = makeHandoff({ sessionId: 'S-NEW', endedAt: '2026-04-03T12:00:00Z', summary: 'New session' });
    render(
      <PromptDetailDrawer
        {...defaultProps}
        handoffs={[h1, h2]}
      />,
    );
    expect(screen.getByTestId('drawer-handoff')).toHaveTextContent('Session Handoffs');
    const cards = screen.getAllByText(/^Session S-/);
    expect(cards[0]).toHaveTextContent('S-NEW');
    expect(cards[1]).toHaveTextContent('S-OLD');
  });

  it('shows handoff source path in handoff card', () => {
    render(
      <PromptDetailDrawer
        {...defaultProps}
        handoffs={[makeHandoff()]}
      />,
    );
    expect(screen.getByTestId('handoff-card-S-001')).toHaveTextContent('agents/handoffs/S-001.md');
  });

  it('shows missing handoff warning for done prompt without handoff', () => {
    render(
      <PromptDetailDrawer
        {...defaultProps}
        prompt={makePrompt({ status: 'done', completedAt: '2026-04-04' })}
        handoffs={[]}
      />,
    );
    expect(screen.getByTestId('missing-handoff-warning')).toHaveTextContent(
      'Handoff missing',
    );
  });

  it('shows superseded notice with link', async () => {
    const user = userEvent.setup();
    const onPromptNavigate = jest.fn();
    render(
      <PromptDetailDrawer
        {...defaultProps}
        prompt={makePrompt({ status: 'superseded', supersededBy: '3.0.2' })}
        onPromptNavigate={onPromptNavigate}
      />,
    );

    expect(screen.getByTestId('superseded-notice')).toHaveTextContent('Superseded by:');
    await user.click(screen.getByTestId('superseded-link'));
    expect(onPromptNavigate).toHaveBeenCalledWith('3.0.2');
  });

  it('shows archived notice with date', () => {
    render(
      <PromptDetailDrawer
        {...defaultProps}
        prompt={makePrompt({ archivedAt: '2026-04-05' })}
      />,
    );
    expect(screen.getByTestId('archived-notice')).toHaveTextContent('Archived: 2026-04-05');
  });

  it('renders prompt body as markdown', () => {
    render(<PromptDetailDrawer {...defaultProps} />);
    expect(screen.getByTestId('drawer-body')).toBeInTheDocument();
    expect(screen.getByTestId('mock-markdown')).toHaveTextContent(
      '# Prompt Body',
    );
  });

  it('renders source path', () => {
    render(<PromptDetailDrawer {...defaultProps} />);
    expect(screen.getByTestId('drawer-source')).toHaveTextContent(
      'prompts/active/3.0.1.md',
    );
  });

  it('has dialog role and aria-modal', () => {
    render(<PromptDetailDrawer {...defaultProps} />);
    const drawer = screen.getByTestId('prompt-detail-drawer');
    expect(drawer).toHaveAttribute('role', 'dialog');
    expect(drawer).toHaveAttribute('aria-modal', 'true');
  });

  it('shows task IDs in metadata', () => {
    render(<PromptDetailDrawer {...defaultProps} />);
    expect(screen.getByTestId('drawer-metadata')).toHaveTextContent(
      'E2-S1-T1, E2-S1-T2',
    );
  });
});
