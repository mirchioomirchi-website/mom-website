"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared accessibility behavior for the site's overlay/dialog patterns —
 * MiniCart drawer, PromoPopup, the Bulk Orders popup. Each one used to
 * hand-roll its own (partial — Bulk Orders had none at all) Escape handler
 * with no focus trapping and no focus management, so a keyboard or
 * screen-reader user could tab straight through to the dimmed page behind
 * an "open" dialog. Consolidated once here rather than three separate,
 * inevitably-drifting implementations.
 *
 * Usage: attach the returned ref to the dialog's outer panel element (the
 * actual dialog box, not the click-to-dismiss overlay behind it), and pair
 * it with `role="dialog" aria-modal="true"` on that same element.
 */
export function useModalA11y(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember what had focus before the dialog opened (the button that
    // triggered it, typically) so it can be restored on close instead of
    // silently dropping focus back to <body>.
    triggerRef.current = document.activeElement;

    // Move focus into the dialog. motion's enter transition animates
    // opacity/transform, not `display`, so the node is already focusable
    // the instant it's in the DOM — no extra delay needed.
    const container = containerRef.current;
    const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable?.[0] ?? container)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !container) return;

      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
    // onClose is intentionally excluded — callers pass stable setters
    // (setVisible(false), closeMini, etc.) and re-subscribing every render
    // would be wasted work, not a correctness issue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return containerRef;
}
