'use client';

import { useState, useCallback, useRef } from 'react';

export interface UseCopyToClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

/**
 * Hook for copying text to clipboard with visual feedback.
 * Falls back to textarea selection when Clipboard API is unavailable.
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: create temporary textarea for selection
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
        setCopied(true);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      } catch {
        // execCommand failed too — inform user
        setCopied(false);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }, []);

  return { copied, copy };
}
