import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NextPromptInfo } from '@/types';
import { NextPromptWidget } from '@/components/overview/NextPromptWidget';

const mockCopy = jest.fn().mockResolvedValue(undefined);
let mockCopied = false;

jest.mock('@/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copied: mockCopied,
    copy: mockCopy,
  }),
}));

function makeNextPrompt(overrides?: Partial<NextPromptInfo>): NextPromptInfo {
  return {
    promptId: '16.0.1',
    title: 'App Shell and Navigation',
    ownerRole: 'Senior Software Engineer',
    epicId: 'E2',
    storyId: 'E2-S1',
    sourcePath: 'prompts/active/16.0.1-test.md',
    prerequisitesMet: 2,
    totalPrerequisites: 2,
    eligibleCount: 3,
    downstreamCount: 1,
    rationale: 'Prompt 16.0.1 is next because: all 2 prerequisites are met.',
    body: '# Prompt 16.0.1\n\nBuild the app shell.',
    ...overrides,
  };
}

describe('NextPromptWidget', () => {
  beforeEach(() => {
    mockCopy.mockClear();
    mockCopied = false;
  });

  it('renders eligible prompt header, role, and rationale', () => {
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt()}
        noEligibleRationale={null}
      />,
    );

    expect(screen.getByTestId('next-prompt-header')).toHaveTextContent(
      '▶ Next: 16.0.1 — App Shell and Navigation',
    );
    expect(screen.getByTestId('next-prompt-role')).toHaveTextContent(
      'Role: Senior Software Engineer',
    );
    expect(screen.getByTestId('next-prompt-rationale')).toHaveTextContent(
      'all 2 prerequisites are met',
    );
  });

  it('renders prompt body in scrollable area', () => {
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt()}
        noEligibleRationale={null}
      />,
    );

    const bodyArea = screen.getByTestId('next-prompt-body');
    expect(bodyArea).toHaveTextContent('# Prompt 16.0.1');
    expect(bodyArea).toHaveAttribute('role', 'region');
    expect(bodyArea).toHaveAttribute('aria-label', 'Prompt content');
    expect(bodyArea).toHaveAttribute('tabindex', '0');
  });

  it('shows all prerequisites met message', () => {
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt({ prerequisitesMet: 3, totalPrerequisites: 3 })}
        noEligibleRationale={null}
      />,
    );

    expect(screen.getByTestId('next-prompt-prerequisites')).toHaveTextContent(
      'All 3 prerequisites met',
    );
  });

  it('shows partial prerequisites message', () => {
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt({ prerequisitesMet: 1, totalPrerequisites: 3 })}
        noEligibleRationale={null}
      />,
    );

    expect(screen.getByTestId('next-prompt-prerequisites')).toHaveTextContent(
      '1 met, 2 pending',
    );
  });

  it('shows no prerequisites message', () => {
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt({ prerequisitesMet: 0, totalPrerequisites: 0 })}
        noEligibleRationale={null}
      />,
    );

    expect(screen.getByTestId('next-prompt-prerequisites')).toHaveTextContent(
      'No prerequisites',
    );
  });

  it('renders no-eligible message when nextPrompt is null', () => {
    render(
      <NextPromptWidget
        nextPrompt={null}
        noEligibleRationale="No prompts are currently eligible. 2 blocked, 3 awaiting."
      />,
    );

    expect(screen.getByTestId('no-eligible-message')).toHaveTextContent(
      'No prompts are currently eligible. 2 blocked, 3 awaiting.',
    );
    expect(screen.queryByTestId('next-prompt-header')).not.toBeInTheDocument();
  });

  it('renders default no-eligible message when rationale is null', () => {
    render(
      <NextPromptWidget nextPrompt={null} noEligibleRationale={null} />,
    );

    expect(screen.getByTestId('no-eligible-message')).toHaveTextContent(
      'No eligible prompts at this time.',
    );
  });

  it('calls copy with prompt body on copy button click', async () => {
    const user = userEvent.setup();
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt()}
        noEligibleRationale={null}
      />,
    );

    const copyButton = screen.getByTestId('copy-button');
    await user.click(copyButton);

    expect(mockCopy).toHaveBeenCalledWith('# Prompt 16.0.1\n\nBuild the app shell.');
  });

  it('shows "Copied!" feedback when copied state is true', () => {
    mockCopied = true;
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt()}
        noEligibleRationale={null}
      />,
    );

    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('calls onViewSource when view source button is clicked', async () => {
    const user = userEvent.setup();
    const onViewSource = jest.fn();
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt()}
        noEligibleRationale={null}
        onViewSource={onViewSource}
      />,
    );

    await user.click(screen.getByTestId('view-source-button'));
    expect(onViewSource).toHaveBeenCalledWith('16.0.1');
  });

  it('displays source path on view source button', () => {
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt()}
        noEligibleRationale={null}
      />,
    );

    expect(screen.getByTestId('view-source-button')).toHaveTextContent(
      'prompts/active/16.0.1-test.md',
    );
  });

  it('has correct aria-label on widget section', () => {
    render(
      <NextPromptWidget
        nextPrompt={makeNextPrompt()}
        noEligibleRationale={null}
      />,
    );

    expect(screen.getByTestId('next-prompt-widget')).toHaveAttribute(
      'aria-label',
      'Next prompt',
    );
  });
});
