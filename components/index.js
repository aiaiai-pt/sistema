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
export { default as Textarea } from "./Textarea.svelte";
export { default as Select } from "./Select.svelte";
export { default as Toggle } from "./Toggle.svelte";
export { default as Checkbox } from "./Checkbox.svelte";
export { default as Label } from "./Label.svelte";
export { default as FileUpload } from "./FileUpload.svelte";
export { default as FileUploadItem } from "./FileUploadItem.svelte";

// Layout
export { default as Separator } from "./Separator.svelte";
export { default as Progress } from "./Progress.svelte";
export { default as List } from "./List.svelte";
export { default as ListItem } from "./ListItem.svelte";

// Containers
export { default as Card } from "./Card.svelte";
export { default as Panel } from "./Panel.svelte";
export { default as Modal } from "./Modal.svelte";
export { default as Popover } from "./Popover.svelte";
export { default as Menu } from "./Menu.svelte";
export { default as MenuItem } from "./MenuItem.svelte";
export { default as MenuSeparator } from "./MenuSeparator.svelte";

// Form controls — composite
export { default as Combobox } from "./Combobox.svelte";

// Tabs
export { default as Tabs } from "./Tabs.svelte";
export { default as TabList } from "./TabList.svelte";
export { default as Tab } from "./Tab.svelte";
export { default as TabPanel } from "./TabPanel.svelte";

// Feedback
export { default as Alert } from "./Alert.svelte";
export { default as Toast } from "./Toast.svelte";
export { default as EmptyState } from "./EmptyState.svelte";

// Navigation
export { default as Sidebar } from "./Sidebar.svelte";
export { default as SidebarItem } from "./SidebarItem.svelte";
export { default as SidebarSection } from "./SidebarSection.svelte";
export { default as BottomNav } from "./BottomNav.svelte";
export { default as BottomNavItem } from "./BottomNavItem.svelte";

// Complex
export { default as Stepper } from "./Stepper.svelte";
export { default as CodeBlock } from "./CodeBlock.svelte";
