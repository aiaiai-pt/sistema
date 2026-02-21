# aiaiai Design System — Component Reference

Last updated: 2026-02-20

Component specifications as decision trees. For each component: when to use each variant, all states, token usage, do/don't rules, and accessibility requirements.

---

## Component: Button

### Variant Selection

```
Is this the primary action on the page?
├─ YES → Primary
└─ NO
   ├─ Is this a destructive action (delete, remove, cancel)?
   │  └─ YES → Destructive
   └─ NO
      ├─ Is this a secondary action with equal visual weight to primary?
      │  └─ YES → Secondary (bordered)
      └─ NO → Ghost (minimal, tertiary actions)
```

### Variants

| Variant | Background | Text | Border | Use When |
|---------|-----------|------|--------|----------|
| Primary | `--button-primary-bg` (#ff6b35) | `--button-primary-text` (#faf9f7) | none | Main CTA. One per section maximum. |
| Secondary | transparent | `--button-secondary-text` (#2c2825) | `--button-secondary-border` (1px solid) | Alternative actions alongside primary. |
| Ghost | transparent | `--button-ghost-text` (#78716c) | none | Tertiary actions, toolbar items, compact UI. |
| Destructive | `--button-destructive-bg` (#dc2626) | `--button-destructive-text` (#faf9f7) | none | Delete, remove, destroy. Requires confirmation for irreversible actions. |

### Sizes

| Size | Height | Padding-X | Font Size | Use When |
|------|--------|-----------|-----------|----------|
| Small | `--button-sm-height` (28px) | `--button-sm-padding-x` (8px) | 11px | Compact UI, toolbars, inline actions. NOT for mobile touch. |
| Medium | `--button-md-height` (36px) | `--button-md-padding-x` (16px) | 12px | Default. Most contexts. |
| Large | `--button-lg-height` (44px) | `--button-lg-padding-x` (24px) | 13px | Prominent actions, mobile touch targets, forms. |

### Shared Properties

| Property | Token | Value |
|----------|-------|-------|
| Font | `--button-font` | Berkeley Mono |
| Letter spacing | `--button-tracking` | 0.04em |
| Border radius | `--button-radius` | 4px |
| Transition | `--button-transition` | 100ms ease |

### States

| State | Visual Change | Notes |
|-------|--------------|-------|
| Default | As defined per variant | |
| Hover | Background shifts to `*-bg-hover` token | 100ms transition. |
| Active/Pressed | Background darkens slightly beyond hover | Scale to 0.98 via transform. |
| Focused | Focus ring: 2px `--focus-ring-color`, 2px offset | Keyboard navigation. Must be visible. |
| Disabled | Opacity: 0.5, cursor: not-allowed | No hover effect. `aria-disabled="true"`. |
| Loading | Text replaced with spinner, button width preserved | `aria-busy="true"`. Not clickable. |
| With Icon | Phosphor icon 16px, `--space-xs` (4px) gap | Icon inherits button text color. |
| Icon Only | Square aspect (height = width), centered icon | MUST have `aria-label`. |

### Do / Don't

| Do | Don't |
|----|-------|
| Use one Primary button per section | Use multiple Primary buttons in one section |
| Use Destructive for irreversible actions | Use Destructive for "Cancel" or "Close" |
| Use Ghost for tertiary/compact actions | Use Ghost for the primary action |
| Use Large (44px) on touch devices | Use Small (28px) as a touch target |
| Include loading state for async actions | Let buttons remain clickable during loading |
| Write labels in sentence case | Use ALL CAPS (the mono font + tracking handles this) |

### Accessibility

- Focus ring: `--focus-ring-width` (2px), `--focus-ring-offset` (2px), `--focus-ring-color` (accent)
- Disabled: `aria-disabled="true"` (not `disabled` attribute if you need to explain why)
- Loading: `aria-busy="true"`, visually replace text with spinner
- Icon-only: `aria-label="[action description]"` required
- Primary text on accent bg: 2.69:1 contrast (known exception -- see color.md Known Exception section)
- Keyboard: activated with Enter and Space

---

## Component: Input

### Variant Selection

```
What type of data is being entered?
├─ Free text (name, email, description) → Text Input
├─ Selection from predefined options → Select
├─ Binary on/off toggle → Toggle
└─ Multiple boolean options → Checkbox
```

### Text Input

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Font | `--input-font` | Berkeley Mono |
| Font size | `--input-font-size` | 14px |
| Radius | `--input-radius` | 2px |
| Border | `--input-border` | 1px solid #e0d9d1 |
| Focus border | `--input-border-focus` | 1px solid #c4bbb0 |
| Background | `--input-bg` | #f7f5f3 |
| Text color | `--input-text` | #2c2825 |
| Placeholder | `--input-placeholder` | #a8a29e |
| Transition | `--input-transition` | 100ms ease |

#### Sizes

| Size | Height | Padding-X | Use When |
|------|--------|-----------|----------|
| Small | `--input-sm-height` (28px) | 8px | Compact UI, filters, toolbars |
| Medium | `--input-md-height` (36px) | 8px | Default. Most forms. |
| Large | `--input-lg-height` (44px) | 16px | Prominent forms, mobile |

#### Label and Help Text

| Element | Font | Size | Color | Spacing |
|---------|------|------|-------|---------|
| Label | `--input-label-font` (Berkeley Mono) | 12px | `--input-label-color` (#78716c) | `--input-label-gap` (4px) below label |
| Help text | `--input-help-font` (Instrument Sans) | 13px | `--input-help-color` (#a8a29e) | `--input-help-gap` (4px) above help text |
| Error text | `--input-help-font` (Instrument Sans) | 13px | `--input-error-text` (#dc2626) | Replaces help text on error |

#### States

| State | Visual Change | Notes |
|-------|--------------|-------|
| Empty | Placeholder text in `--input-placeholder` color | |
| Placeholder | Muted text visible | Disappears on focus or input |
| Filled | Input text in `--input-text` color | |
| Focused | Border changes to `--input-border-focus` + focus ring | |
| Error | Border: `--input-error-border-color` (#dc2626). Error message below. | `aria-invalid="true"`, `aria-describedby` pointing to error message |
| Disabled | Opacity: 0.5, cursor: not-allowed | `aria-disabled="true"` |
| Read-only | No border change, cursor: default | `readonly` attribute. Visually distinct from disabled. |
| With icon | Icon 16px, positioned inside left/right padding | Reduce text padding to accommodate icon |
| With label | Label above input, Berkeley Mono, 12px, 0.04em tracking | `<label>` with `for` attribute |

### Select

#### States

| State | Visual Change |
|-------|--------------|
| Closed | Displays selected option or placeholder. Chevron-down icon right-aligned. |
| Open/Expanded | Dropdown list visible. `--elevation-raised` shadow. |
| Option Hover | `--color-surface-secondary` background on hovered option |
| Selected | Checkmark icon on selected option |
| Disabled | Opacity: 0.5, not openable |
| Error | Same as text input error state |

### Toggle

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Width | `--toggle-width` | 36px |
| Height | `--toggle-height` | 20px |
| Radius | `--toggle-radius` | 999px (pill) |
| Off background | `--toggle-bg-off` | #e8e2dc |
| On background | `--toggle-bg-on` | #ff6b35 |
| Knob size | `--toggle-knob-size` | 16px |
| Knob color | `--toggle-knob-color` | #f7f5f3 |

#### States

| State | Visual Change |
|-------|--------------|
| Off | Background: `--toggle-bg-off`. Knob left. |
| On | Background: `--toggle-bg-on` (accent). Knob right. |
| Off Hover | Background slightly darker |
| On Hover | Background slightly darker |
| Disabled Off | Opacity: 0.5 |
| Disabled On | Opacity: 0.5 |

#### Accessibility
- Role: `switch`. `aria-checked="true/false"`.
- Keyboard: Space to toggle.
- Must have associated label.

### Checkbox

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Size | `--checkbox-size` | 16px |
| Radius | `--checkbox-radius` | 2px |
| Border | `--checkbox-border` | 1px solid #c4bbb0 |
| Checked bg | `--checkbox-bg-checked` | #ff6b35 |
| Check color | `--checkbox-check-color` | #faf9f7 |

#### States

| State | Visual Change |
|-------|--------------|
| Unchecked | Empty box with border |
| Checked | Accent background with white checkmark |
| Indeterminate | Accent background with horizontal dash |
| Hover (unchecked) | Border darkens |
| Hover (checked) | Background darkens |
| Disabled unchecked | Opacity: 0.5 |
| Disabled checked | Opacity: 0.5 |

#### Accessibility
- Native `<input type="checkbox">` or `role="checkbox"`.
- `aria-checked="true/false/mixed"` for indeterminate.
- Keyboard: Space to toggle.

### Input Do / Don't

| Do | Don't |
|----|-------|
| Always pair inputs with visible labels | Use placeholder as the only label |
| Show error messages below the field | Show errors only in a toast or alert |
| Use Berkeley Mono for input text (data entry) | Use sans-serif for data input |
| Use `aria-describedby` for error messages | Rely on color alone to indicate errors |
| Use Large inputs on mobile/touch | Use Small inputs as touch targets |

---

## Component: Card

### Variant Selection

```
Does this card need visual separation from the page?
├─ NO → Flat (no border, no shadow)
├─ YES
│  ├─ Is this the default "exposed mechanism" style?
│  │  └─ YES → Bordered (default)
│  └─ Does this card float above the page (overlays, elevated content)?
│     └─ YES → Elevated
```

### Variants

| Variant | Border | Shadow | Use When |
|---------|--------|--------|----------|
| Flat | `--card-flat-border` (none) | `--card-flat-shadow` (none) | Content grouping without visual separation |
| Bordered | `--card-bordered-border` (1px solid) | none | Default. "Exposed mechanism" aesthetic. Most cards. |
| Elevated | none | `--card-elevated-shadow` (raised) | Floating content, feature highlights |

### Shared Properties

| Property | Token | Value |
|----------|-------|-------|
| Radius | `--card-radius` | 4px |
| Padding | `--card-padding` | 24px |
| Background | `--card-bg` | #f7f5f3 |
| Transition | `--card-transition` | 100ms ease |

### States

| State | Visual Change | Notes |
|-------|--------------|-------|
| Default | As defined per variant | |
| Interactive Hover | Border: `--card-interactive-hover-border` (stronger border) | Only for clickable cards. Cursor: pointer. |
| Interactive Active | Background: `--card-interactive-active-bg` (#f0ece8) | |
| Selected | Border color: `--card-selected-border-color` (accent) | For selection patterns (e.g., plan picker) |
| Loading | Skeleton placeholder replaces content | Use `--skeleton-*` tokens |

### Do / Don't

| Do | Don't |
|----|-------|
| Use Bordered as the default variant | Default to Elevated (shadows are for floating) |
| Use Flat when cards are nested inside another card | Nest bordered cards inside bordered cards |
| Use `--card-padding` (24px) for internal spacing | Use custom padding values |
| Keep card content aligned to the internal grid | Mix alignment within cards |
| Use interactive states only for clickable cards | Add hover effects to non-interactive cards |

### Accessibility
- Clickable cards: wrap in `<a>` or `<button>`, or use `role="link"` / `role="button"`
- If entire card is clickable, the click target must cover the full card area
- Selected state: `aria-selected="true"`
- Card heading should be a semantic heading level (`h2`, `h3`, etc.)

---

## Component: Navigation

### Sidebar Navigation

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Width (expanded) | `--nav-sidebar-width` | 240px |
| Width (collapsed) | `--nav-sidebar-width-collapsed` | 48px |
| Background | `--nav-sidebar-bg` | #f0ece8 |
| Border | `--nav-sidebar-border` | 1px solid #e0d9d1 |
| Padding | `--nav-sidebar-padding` | 8px |

#### Nav Item Tokens

| Property | Token | Value |
|----------|-------|-------|
| Height | `--nav-item-height` | 32px |
| Padding-X | `--nav-item-padding-x` | 8px |
| Radius | `--nav-item-radius` | 2px |
| Font | `--nav-item-font` | Berkeley Mono |
| Font size | `--nav-item-font-size` | 12px |
| Tracking | `--nav-item-tracking` | 0.04em |
| Default color | `--nav-item-color` | #78716c |
| Hover color | `--nav-item-color-hover` | #2c2825 |
| Active color | `--nav-item-color-active` | #2c2825 |
| Hover bg | `--nav-item-bg-hover` | #e8e2dc |
| Active bg | `--nav-item-bg-active` | #f7f5f3 |

#### Section Header Tokens

| Property | Token | Value |
|----------|-------|-------|
| Font | `--nav-section-font` | Instrument Sans |
| Size | `--nav-section-size` | 11px |
| Tracking | `--nav-section-tracking` | 0.02em |
| Color | `--nav-section-color` | #a8a29e |
| Margin top | `--nav-section-margin-top` | 16px |

#### Sidebar States

| State | Visual Change |
|-------|--------------|
| Expanded | Full width (240px), text labels visible |
| Collapsed | Icon-only (48px), tooltips on hover |
| Item Default | `--nav-item-color` (#78716c), no background |
| Item Hover | `--nav-item-color-hover` (#2c2825), `--nav-item-bg-hover` (#e8e2dc) |
| Item Active | `--nav-item-color-active` (#2c2825), `--nav-item-bg-active` (#f7f5f3) |
| Item with Badge | Badge aligned right within item row |
| Section Header | Muted, smaller, acts as group label |

### Bottom Navigation

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Height | `--nav-bottom-height` | 56px |
| Background | `--nav-bottom-bg` | #f7f5f3 |
| Border top | `--nav-bottom-border-top` | 1px solid #e0d9d1 |
| Item color | `--nav-bottom-item-color` | #a8a29e |
| Active color | `--nav-bottom-item-color-active` | #ff6b35 |
| Item font | `--nav-bottom-item-font` | Instrument Sans |
| Item size | `--nav-bottom-item-size` | 11px |

#### Bottom Nav States

| State | Visual Change |
|-------|--------------|
| Item Default | Icon + label in `--nav-bottom-item-color` (#a8a29e) |
| Item Active | Icon + label in `--nav-bottom-item-color-active` (accent) |
| Item with Badge | Dot indicator on icon |
| Item Disabled | Opacity: 0.5, not tappable |

### Navigation Selection

```
Is this a desktop/tablet application?
├─ YES → Sidebar Navigation
│  ├─ Persistent sidebar for apps with many sections
│  └─ Collapsible sidebar when content area needs maximum space
└─ Is this a mobile application?
   └─ YES → Bottom Navigation
      └─ Maximum 5 items
```

### Navigation Do / Don't

| Do | Don't |
|----|-------|
| Use sidebar for desktop/tablet apps | Use bottom nav on desktop |
| Use bottom nav for mobile apps | Use sidebar on small mobile screens |
| Limit bottom nav to 5 items | Exceed 5 items in bottom nav |
| Use Phosphor icons in nav items | Use text-only nav items |
| Show active state clearly (color + background) | Rely on subtle differences for active state |
| Use section headers to group related nav items | Put all items in a flat unsorted list |

### Navigation Accessibility
- Use `<nav>` element with `aria-label`
- Active item: `aria-current="page"`
- Collapsed sidebar: tooltip on hover/focus for icon-only items
- Bottom nav: ensure 44x44px touch targets
- Keyboard: arrow keys navigate between items, Enter activates

---

## Component: Data Display

### Badge

**Use when:** Showing status, count, or category as a small inline indicator.

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Font | `--badge-font` | Berkeley Mono |
| Size | `--badge-size` | 12px |
| Tracking | `--badge-tracking` | 0.04em |
| Radius | `--badge-radius` | 999px (pill) |
| Padding-X | `--badge-padding-x` | 8px |
| Padding-Y | `--badge-padding-y` | 2px |

#### Variants

| Variant | Background | Text | Use When |
|---------|-----------|------|----------|
| Neutral | `--badge-neutral-bg` (#e8e2dc) | `--badge-neutral-text` (#78716c) | Default counts, categories |
| Info | `--color-info-subtle` (#eff6ff) | `--color-info` (#2563eb) | Information |
| Success | `--color-success-subtle` (#f0fdf4) | `--color-success` (#16a34a) | Positive status |
| Warning | `--color-warning-subtle` (#fffbeb) | `--color-warning` (#ca8a04) | Caution |
| Error | `--color-destructive-subtle` (#fef2f2) | `--color-destructive` (#dc2626) | Error/failure status |

#### States
- With dot: 8px colored dot left of text
- With icon: Phosphor icon 12px left of text

### Tag

**Use when:** Labeling items with user-defined or system categories. Optionally removable.

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Font | `--tag-font` | Berkeley Mono |
| Size | `--tag-size` | 12px |
| Radius | `--tag-radius` | 2px |
| Padding-X | `--tag-padding-x` | 8px |
| Padding-Y | `--tag-padding-y` | 2px |
| Border | `--tag-border` | 1px solid #e0d9d1 |
| Background | `--tag-bg` | #f7f5f3 |
| Text | `--tag-text` | #78716c |

#### States

| State | Visual Change |
|-------|--------------|
| Default | Border + background, text in `--tag-text` |
| Removable | X icon right-aligned, same style |
| Removable Hover | X icon becomes `--color-destructive` on hover |

### Key-Value Pair

**Use when:** Displaying labeled data (metadata, details panels, settings).

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Key font | `--kv-key-font` | Berkeley Mono |
| Key size | `--kv-key-size` | 12px |
| Key color | `--kv-key-color` | #a8a29e |
| Value font | `--kv-value-font` | Berkeley Mono |
| Value size | `--kv-value-size` | 14px |
| Value color | `--kv-value-color` | #2c2825 |
| Gap | `--kv-gap` | 4px |

#### Layout Options
- **Stacked:** Key above value (default for narrow spaces)
- **Inline:** Key and value on same line (wide layouts, settings)

#### States

| State | Visual Change |
|-------|--------------|
| Default | Key label muted, value prominent |
| Truncated value | Ellipsis with title attribute for full value |
| Empty value | Dash (--) in muted color |

### Status Indicator

**Use when:** Showing live/dynamic status (online/offline, active/inactive, pending).

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Dot size | `--status-dot-size` | 8px |
| Font | `--status-font` | Berkeley Mono |
| Size | `--status-size` | 12px |
| Gap | `--status-gap` | 4px |

#### Variants

| Status | Dot Color | Shape | Use When |
|--------|-----------|-------|----------|
| Active | `--color-success` (#16a34a) | Circle (filled) | Online, running, healthy |
| Inactive | `--color-text-muted` (#a8a29e) | Hollow ring (stroke only) | Offline, stopped |
| Pending | `--color-warning` (#ca8a04) | Triangle-up (filled) | Processing, waiting |
| Error | `--color-destructive` (#dc2626) | Diamond (filled, rotated square) | Failed, unhealthy |

#### Shape as Progressive Enhancement

Shapes are a **progressive enhancement** layer -- color remains the primary signal, shapes add a second channel for accessibility. This benefits users who have difficulty distinguishing colors (color vision deficiency) by encoding status in geometry as well.

- **Circle** = stable/positive (complete, whole)
- **Triangle-up** = attention/caution (warning sign convention)
- **Diamond** = critical/error (sharp, angular = urgency)
- **Hollow ring** = absence/inactive (empty, no fill)

Implementations that cannot render shapes (e.g., plain text fallback, very small sizes) should fall back to color-only dots. The text label beside the indicator already provides the primary accessible signal.

### Data Display Do / Don't

| Do | Don't |
|----|-------|
| Use Berkeley Mono for all data display text | Use sans-serif for data/metrics |
| Use semantic badge colors (success = green, error = red) | Use colors decoratively in badges |
| Use tags for user/system categories | Use tags for status (use badges or status indicators) |
| Use key-value pairs for structured metadata | Use key-value pairs for prose content |
| Use status indicators for live/dynamic status | Use badges for dynamic status (badges are static labels) |

### Data Display Accessibility
- Badges: use `aria-label` if the badge color carries meaning not expressed in text
- Tags: removable tags need `aria-label="Remove [tag name]"` on the X button
- Status indicators: the dot color must not be the only way to convey status; text label is required
- Key-value: use `<dl>`, `<dt>`, `<dd>` for semantic structure

---

## Component: Feedback

### Toast / Notification

**Use when:** Providing brief, non-blocking feedback about an action (saved, error, copied).

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Radius | `--toast-radius` | 4px |
| Padding | `--toast-padding` | 16px |
| Shadow | `--toast-shadow` | overlay shadow |
| Background | `--toast-bg` | #f7f5f3 |
| Border | `--toast-border` | 1px solid #e0d9d1 |
| Font | `--toast-font` | Instrument Sans |
| Font size | `--toast-font-size` | 13px |
| Max width | `--toast-max-width` | 360px |

#### Variants

| Variant | Left Accent | Use When |
|---------|-------------|----------|
| Info | `--color-info` (#2563eb) | General information |
| Success | `--color-success` (#16a34a) | Action completed successfully |
| Warning | `--color-warning` (#ca8a04) | Action completed with caveats |
| Error | `--color-destructive` (#dc2626) | Action failed |

#### States

| State | Behavior |
|-------|----------|
| Auto-dismiss | Disappears after 5 seconds. Default for success/info. |
| Persistent | Stays until dismissed. Required for errors and warnings. |
| With action | CTA button (Ghost variant) right-aligned. "Undo", "Retry", etc. |

#### Animation
- Enter: slide in from right/bottom, `--duration-normal` (250ms), `--easing-enter`
- Exit: fade + slide out, `--duration-fast` (150ms), `--easing-exit`

### Empty State

**Use when:** A view has no content to display.

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Icon size | `--empty-icon-size` | 48px |
| Icon color | `--empty-icon-color` | #a8a29e |
| Heading font | `--empty-heading-font` | Instrument Sans |
| Heading size | `--empty-heading-size` | 18px |
| Body font | `--empty-body-font` | Instrument Sans |
| Body size | `--empty-body-size` | 13px |
| Body color | `--empty-body-color` | #78716c |
| Gap | `--empty-gap` | 16px |

#### Variants

| Variant | Content | Use When |
|---------|---------|----------|
| First use | Icon + heading + description + CTA button | User has never created content here |
| No results | Icon + "No results" + suggestion | Search/filter returned nothing |
| No data | Icon + "No [items] yet" + CTA | Data exists in the system but not here |
| Error recovery | Icon + error message + "Retry" button | Data failed to load |
| Permission | Icon + "No access" + explanation | User lacks permission |

### Loading Skeleton

**Use when:** Content is loading and you want to show a structural preview.

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `--skeleton-bg` | #e8e2dc |
| Shimmer | `--skeleton-shine` | #f0ece8 |
| Radius | `--skeleton-radius` | 2px |
| Duration | `--skeleton-duration` | 1.5s |

#### Shapes

| Shape | Dimensions | Use When |
|-------|-----------|----------|
| Text line | Height: 12px, width: 60-100% | Loading text content |
| Text block | 3-4 text lines with varying widths | Loading paragraphs |
| Card | Full card dimensions | Loading card grid |
| Avatar | Circle, 32-48px | Loading user content |
| Button | `--button-md-height` (36px) width | Loading action area |
| Table row | Full width, `--nav-item-height` (32px) | Loading table/list data |

### Feedback Do / Don't

| Do | Don't |
|----|-------|
| Auto-dismiss success toasts after 5s | Auto-dismiss error toasts (user needs to read them) |
| Position toasts consistently (bottom-right desktop, bottom-center mobile) | Stack more than 3 toasts |
| Show skeleton during loading | Show a blank page during loading |
| Match skeleton shapes to expected content | Use generic rectangles that don't match content shape |
| Include a CTA in empty states | Show an empty state with no guidance on what to do |
| Make error toasts persistent and dismissible | Auto-dismiss an error before the user reads it |

### Feedback Accessibility
- Toasts: use `role="status"` for info/success, `role="alert"` for error/warning
- Toasts: provide `aria-live="polite"` for info, `aria-live="assertive"` for errors
- Skeleton: use `aria-busy="true"` on the loading container, `aria-label="Loading"`
- Empty state: heading should be a semantic heading element
- Error recovery: "Retry" button must be keyboard accessible
