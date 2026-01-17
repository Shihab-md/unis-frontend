import { useEffect, useRef, useState } from "react";

/**
 * Keyboard avoidance for mobile browsers:
 * - Adds bottom padding equal to keyboard height (approx) using visualViewport
 * - Scrolls focused input into view after keyboard opens
 */
export function useKeyboardAvoidance(options = {}) {
  const {
    extraOffset = 16, // extra space above keyboard
    scrollDelay = 250, // wait keyboard animation
    behavior = "smooth", // "smooth" | "auto"
    enabled = true,
  } = options;

  const containerRef = useRef(null);
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // innerHeight - visualViewport height ≈ keyboard/URL bar overlays
      const raw = window.innerHeight - vv.height - vv.offsetTop;
      const keyboardHeight = Math.max(0, raw);
      setKeyboardPadding(keyboardHeight > 0 ? keyboardHeight + extraOffset : 0);
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [enabled, extraOffset]);

  useEffect(() => {
    if (!enabled) return;

    const onFocusIn = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLElement)) return;

      const isEditable =
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable;

      if (!isEditable) return;

      // Scroll the focused element into view after keyboard opens
      setTimeout(() => {
        try {
          el.scrollIntoView({ block: "center", inline: "nearest", behavior });
        } catch {
          // ignore
        }
      }, scrollDelay);
    };

    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [enabled, behavior, scrollDelay]);

  return { containerRef, keyboardPadding };
}