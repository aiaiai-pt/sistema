/**
 * calculatePopoverPosition — pure positioning algorithm for Popover.svelte.
 *
 * Returns the fixed-position coordinate (x, y) for the popover, plus an
 * optional maxHeight cap (in px) when neither the preferred nor the
 * opposite side fits and we must scroll the popover content in-place.
 *
 * Preference order:
 *   1. Preferred side (from `placement`) if it fits.
 *   2. Opposite side if that fits.
 *   3. Side with more room — capped to that room, overflow-y scrollable.
 *
 * @param {{ top: number, bottom: number, left: number, right: number, width: number }} anchorRect
 * @param {{ width: number, height: number }} popRect
 * @param {number} viewportH
 * @param {number} viewportW
 * @param {string} placement  — 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
 * @param {number} offset  — gap between anchor and popover (px)
 * @param {boolean} [matchWidth]
 * @returns {{ x: number, y: number, maxHeight: number | undefined }}
 */
export function calculatePopoverPosition(
  anchorRect,
  popRect,
  viewportH,
  viewportW,
  placement,
  offset,
  matchWidth = false,
) {
  const isTop = placement.startsWith("top");
  const isEnd = placement.endsWith("end");

  // Horizontal: preserve matchWidth behaviour for end-aligned placement
  let x = isEnd
    ? anchorRect.right - (matchWidth ? anchorRect.width : popRect.width)
    : anchorRect.left;

  // Available room on each side (gap to viewport edge after the offset)
  const roomAbove = anchorRect.top - offset;
  const roomBelow = viewportH - anchorRect.bottom - offset;

  const fitsAbove = popRect.height <= roomAbove;
  const fitsBelow = popRect.height <= roomBelow;

  let y;
  let maxHeight = undefined;

  if (isTop) {
    if (fitsAbove) {
      // Preferred side fits
      y = anchorRect.top - popRect.height - offset;
    } else if (fitsBelow) {
      // Flip to below
      y = anchorRect.bottom + offset;
    } else {
      // Neither fits: open on the side with more room and cap
      if (roomAbove >= roomBelow) {
        maxHeight = roomAbove;
        y = anchorRect.top - maxHeight - offset; // = anchorRect.top - (anchorRect.top - offset) - offset = 0
      } else {
        y = anchorRect.bottom + offset;
        maxHeight = roomBelow;
      }
    }
  } else {
    // Bottom placement
    if (fitsBelow) {
      // Preferred side fits
      y = anchorRect.bottom + offset;
    } else if (fitsAbove) {
      // Flip to above
      y = anchorRect.top - popRect.height - offset;
    } else {
      // Neither fits: open on the side with more room and cap
      if (roomBelow >= roomAbove) {
        y = anchorRect.bottom + offset;
        maxHeight = roomBelow;
      } else {
        maxHeight = roomAbove;
        y = anchorRect.top - maxHeight - offset; // = 0
      }
    }
  }

  // Clamp horizontal
  if (x + popRect.width > viewportW) {
    x = viewportW - popRect.width - offset;
  }
  if (x < 0) x = offset;

  return { x, y, maxHeight };
}
