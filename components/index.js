/*
 * aiaiai Design System — Component Library
 *
 * Svelte 5 components consuming tokens from components.css.
 * Import tokens (base.css → semantic.css → components.css) before using.
 *
 * Usage:
 *   import { Button, Card, Badge } from '$lib/ui';
 */

// Atoms
export { default as Badge } from "./Badge.svelte";
export { default as Tag } from "./Tag.svelte";
export { default as Status } from "./Status.svelte";
export { default as Skeleton } from "./Skeleton.svelte";
export { default as KeyValue } from "./KeyValue.svelte";

// Form controls
export { default as Button } from "./Button.svelte";
export { default as Input } from "./Input.svelte";
export { default as Select } from "./Select.svelte";
export { default as Toggle } from "./Toggle.svelte";
export { default as Checkbox } from "./Checkbox.svelte";

// Containers
export { default as Card } from "./Card.svelte";
export { default as Panel } from "./Panel.svelte";

// Feedback
export { default as Toast } from "./Toast.svelte";
export { default as EmptyState } from "./EmptyState.svelte";

// Complex
export { default as Stepper } from "./Stepper.svelte";
export { default as CodeBlock } from "./CodeBlock.svelte";
