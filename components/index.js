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
export { default as MultiSelectCombobox } from "./MultiSelectCombobox.svelte";
export { default as MoneyInput } from "./MoneyInput.svelte";
export { default as JsonEditor } from "./JsonEditor.svelte";

// Layout
export { default as Separator } from "./Separator.svelte";
export { default as Progress } from "./Progress.svelte";
export { default as List } from "./List.svelte";
export { default as ListItem } from "./ListItem.svelte";
export { default as PageContainer } from "./PageContainer.svelte";

// Public site shell (locked a11y chrome — citizen portal, #7/#71)
export { default as AppFrame } from "./AppFrame.svelte";
export { default as SiteHeader } from "./SiteHeader.svelte";
export { default as MegaMenu } from "./MegaMenu.svelte";
export { default as SiteFooter } from "./SiteFooter.svelte";
export { default as SkipLink } from "./SkipLink.svelte";
export { default as TextSizeAdjuster } from "./TextSizeAdjuster.svelte";
export { default as ContrastToggle } from "./ContrastToggle.svelte";
export { default as LinkHighlightToggle } from "./LinkHighlightToggle.svelte";
export { default as ServiceNavigation } from "./ServiceNavigation.svelte";
export { default as SectionNavigation } from "./SectionNavigation.svelte";
export { default as Link } from "./Link.svelte";
export { default as Hero } from "./Hero.svelte";
export { default as ContentBlock } from "./ContentBlock.svelte";
export { default as StatusTimeline } from "./StatusTimeline.svelte";
export { default as WidgetGrid } from "./WidgetGrid.svelte";
export { default as VotingWidget } from "./VotingWidget.svelte";

// Landing & content surface (#105 Phase 7) — presentational, marketing-grade,
// config-driven sections for landing / campaign / about / faq / contact pages.
// Each renders purely from props (zero fetch); copy + media are tenant DATA.
export { default as FeatureGrid } from "./FeatureGrid.svelte";
export { default as CallToAction } from "./CallToAction.svelte";
export { default as MediaText } from "./MediaText.svelte";
export { default as Steps } from "./Steps.svelte";
export { default as Testimonial } from "./Testimonial.svelte";
export { default as FaqList } from "./FaqList.svelte";
export { default as LogoStrip } from "./LogoStrip.svelte";
export { default as MediaGallery } from "./MediaGallery.svelte";

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
export { default as DatePicker } from "./DatePicker.svelte";
export { default as DateTimePicker } from "./DateTimePicker.svelte";
export { default as DateRangePicker } from "./DateRangePicker.svelte";

// Search
export { default as SearchInput } from "./SearchInput.svelte";
export { default as FilterBar } from "./FilterBar.svelte";
export { default as FilterPanel } from "./FilterPanel.svelte";
export { default as CommandPalette } from "./CommandPalette.svelte";

// Tabs
export { default as Tabs } from "./Tabs.svelte";
export { default as TabList } from "./TabList.svelte";
export { default as Tab } from "./Tab.svelte";
export { default as TabPanel } from "./TabPanel.svelte";
export { default as FeedView } from "./FeedView.svelte";

// Entity ficha (#105 Phase 2)
export { default as ActionPanel } from "./ActionPanel.svelte";
export { default as RecordList } from "./RecordList.svelte";

// Process awareness (#105 Phase 3)
export { default as PhaseTimeline } from "./PhaseTimeline.svelte";

// Results / aggregates (#105 Phase 4) — citizen-facing outcomes over a public
// aggregate VIEW. ResultsChart ships its data table (a chart is never the only
// encoding of its data); RankingBoard is a semantic ordered leaderboard.
export { default as RankingBoard } from "./RankingBoard.svelte";
export { default as ResultsChart } from "./ResultsChart.svelte";
// EChart (#498) — the ECharts-backed sibling of ResultsChart: same data-table
// a11y contract, lazy-loads echarts into its own async chunk.
export { default as EChart } from "./EChart.svelte";

// Account / preferences (#105 Phase 5) — the citizen account area's
// notification-preferences panel: a toggle list over a citizen's subscriptions.
export { default as NotificationPrefs } from "./NotificationPrefs.svelte";
// Account / RGPD (#105 Phase 5 slice 2) — consent purposes toggle list +
// data portability (export) + type-to-confirm account erasure.
export { default as ConsentManager } from "./ConsentManager.svelte";

// Service-flow steps (#105 Phase 6) — the multi-step submit journey: a wizard
// shell (step nav + progress + focus mgmt + error summary), the review-before-
// submit answer list (WCAG 3.3.4 change links), and the success receipt.
export { default as ServiceFlow } from "./ServiceFlow.svelte";
export { default as CheckAnswers } from "./CheckAnswers.svelte";
export { default as Confirmation } from "./Confirmation.svelte";

// Feedback
export { default as Alert } from "./Alert.svelte";
export { default as Toast } from "./Toast.svelte";
export { default as ToastManager } from "./ToastManager.svelte";
export { default as EmptyState } from "./EmptyState.svelte";
export { default as NotificationBell } from "./NotificationBell.svelte";

// Navigation
export { default as Sidebar } from "./Sidebar.svelte";
export { default as SidebarItem } from "./SidebarItem.svelte";
export { default as SidebarSection } from "./SidebarSection.svelte";
export { default as BottomNav } from "./BottomNav.svelte";
export { default as BottomNavItem } from "./BottomNavItem.svelte";

// Complex
export { default as Stepper } from "./Stepper.svelte";
export { default as ValueSourcePicker } from "./ValueSourcePicker.svelte";
export {
  serializeValueSource,
  parseValueSource,
} from "./ValueSourcePicker.helpers.js";
export { default as CodeBlock } from "./CodeBlock.svelte";
export { default as CodeEditor } from "./CodeEditor.svelte";
export { default as CollapsibleSection } from "./CollapsibleSection.svelte";
export { default as OptionGrid } from "./OptionGrid.svelte";
export { default as ConditionTable } from "./ConditionTable.svelte";
export { default as LogViewer } from "./LogViewer.svelte";
export { default as Tree } from "./Tree.svelte";
export { default as TreeNode } from "./TreeNode.svelte";

// Data & navigation
export { default as DataTable } from "./DataTable.svelte";
export { default as Pagination } from "./Pagination.svelte";
export { default as Breadcrumb } from "./Breadcrumb.svelte";

// Stats
export { default as StatCard } from "./StatCard.svelte";
export { default as StatGrid } from "./StatGrid.svelte";

// Maps (OpenLayers)
export { default as MapDisplay } from "./MapDisplay.svelte";
export { default as MapPicker } from "./MapPicker.svelte";
export { default as MapCluster } from "./MapCluster.svelte";
export { default as MapHeatmap } from "./MapHeatmap.svelte";
export { default as MapPopup } from "./MapPopup.svelte";
export { default as GeoSearch } from "./GeoSearch.svelte";

// Scheduling
export { default as Calendar } from "./Calendar.svelte";

// Action form renderer (placement-aware; admin preview + portal runtime, #73)
export { default as ActionFormRenderer } from "./ActionFormRenderer.svelte";
// #634 S4 — pure client-side `visible_when` evaluation (section show/hide).
// Exported at the root so host step-models (wizard rails) share the exact
// evaluator the renderer applies internally.
export {
  evaluateVisibleWhen,
  isBlankFormValue,
  sectionVisible,
} from "./action-form-visibility";
