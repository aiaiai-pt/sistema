/**
 * Dev-time type for the design-system `Badge`, imported by name from
 * `@aiaiai-pt/design-system/components/Badge.svelte` exactly as SealChip and
 * EChart are.
 *
 * Why it exists: the design system's `components/*.svelte.d.ts` are generated
 * only by its `build:types` at publish and are gitignored, so inside this
 * monorepo the import would resolve to an untyped `.svelte` file and
 * svelte-check would report an implicit-`any` module. This declaration is
 * picked up only by THIS package's tsconfig (`src/**\/*.ts`); consumers resolve
 * the published declaration. Mirrors Badge's JSDoc props — keep them in step.
 */
declare module "@aiaiai-pt/design-system/components/Badge.svelte" {
  import type { Component, Snippet } from "svelte";

  export interface BadgeProps {
    variant?: "neutral" | "info" | "success" | "warning" | "error" | "outline";
    dot?: boolean;
    class?: string;
    icon?: Snippet;
    children?: Snippet;
    /** Rest attributes are spread onto the badge's root `<span>`. */
    [attribute: string]: unknown;
  }

  const Badge: Component<BadgeProps>;
  export default Badge;
}
