import { render, screen, fireEvent, act } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import Markdown from '@/components/Markdown';
import React from 'react';

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('Markdown Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders basic markdown elements', () => {
    const content = '# Header\n**Bold**\n- List Item';
    render(<Markdown content={content} />);
    
    expect(screen.getByText('Header')).toBeDefined();
    expect(screen.getByText('Bold')).toBeDefined();
    expect(screen.getByText('List Item')).toBeDefined();
  });

  test('renders GFM tables', () => {
    const content = '| col1 | col2 |\n|---|---|\n| val1 | val2 |';
    render(<Markdown content={content} />);
    
    expect(screen.getByText('col1')).toBeDefined();
    expect(screen.getByText('val1')).toBeDefined();
  });

  test('renders code blocks with highlighting and copy button', async () => {
    const content = '```typescript\nconst x = 1;\n```';
    render(<Markdown content={content} />);
    
    const codeElement = screen.getByText('const');
    expect(codeElement).toBeDefined();

    // Copy button should be in the DOM
    const copyButton = screen.getByTitle('Copy code');
    expect(copyButton).toBeDefined();

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(mockWriteText).toHaveBeenCalledWith('const x = 1;');
  });

  test('links open in new tab', () => {
    const content = '[Link](https://google.com)';
    render(<Markdown content={content} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
