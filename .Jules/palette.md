## 2026-09-29 - [Added ARIA Labels to Icon-Only Buttons]
**Learning:** Icon-only buttons using Material Icons ligatures require `aria-label` on the parent `<button>` and `aria-hidden="true"` on the icon `<span>` to be accessible to screen readers, preventing them from just reading the icon name (e.g., 'fast rewind').
**Action:** Always check icon-only buttons for these attributes when adding or modifying them.
