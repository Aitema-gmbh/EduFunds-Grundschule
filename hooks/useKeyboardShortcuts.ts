import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  category: 'navigation' | 'actions' | 'global';
  action: () => void;
}

interface ShortcutSequence {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'global';
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  sequences?: ShortcutSequence[];
  enabled?: boolean;
}

// Keys that should not trigger shortcuts when focused on input elements
const INPUT_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT'];

export function useKeyboardShortcuts({
  shortcuts,
  sequences = [],
  enabled = true
}: UseKeyboardShortcutsOptions) {
  const sequenceBuffer = useRef<string[]>([]);
  const sequenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (INPUT_ELEMENTS.includes(target.tagName) || target.isContentEditable) {
      // Allow Escape to blur input fields
      if (event.key === 'Escape') {
        target.blur();
      }
      return;
    }

    // Check for modifier key shortcuts (Ctrl+K, etc.)
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        altMatch
      ) {
        // Prevent default for shortcuts that might conflict with browser
        event.preventDefault();
        shortcut.action();
        return;
      }
    }

    // Handle key sequences (e.g., g then d for dashboard)
    if (sequences.length > 0) {
      // Clear previous timeout
      if (sequenceTimeout.current) {
        clearTimeout(sequenceTimeout.current);
      }

      // Add key to buffer
      sequenceBuffer.current.push(event.key.toLowerCase());

      // Check for matching sequences
      for (const seq of sequences) {
        const bufferStr = sequenceBuffer.current.join('');
        const seqStr = seq.keys.join('');

        if (bufferStr === seqStr) {
          event.preventDefault();
          seq.action();
          sequenceBuffer.current = [];
          return;
        }
      }

      // Reset buffer after 1 second of inactivity
      sequenceTimeout.current = setTimeout(() => {
        sequenceBuffer.current = [];
      }, 1000);

      // If buffer is longer than any sequence, reset
      const maxSeqLength = Math.max(...sequences.map(s => s.keys.length));
      if (sequenceBuffer.current.length >= maxSeqLength) {
        sequenceBuffer.current = [];
      }
    }
  }, [enabled, shortcuts, sequences]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeout.current) {
        clearTimeout(sequenceTimeout.current);
      }
    };
  }, [handleKeyDown]);
}

// Helper to format shortcut for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('⌘');

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

export function formatSequence(keys: string[]): string {
  return keys.join(' then ');
}
