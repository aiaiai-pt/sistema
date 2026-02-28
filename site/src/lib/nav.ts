export interface NavItem {
  label: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Home", href: "/" },
      { label: "Getting Started", href: "/system/getting-started" },
    ],
  },
  {
    title: "Foundations",
    items: [
      { label: "Color", href: "/foundations/color" },
      { label: "Typography", href: "/foundations/typography" },
      { label: "Spacing", href: "/foundations/spacing" },
      { label: "Grid", href: "/foundations/grid" },
      { label: "Elevation", href: "/foundations/elevation" },
      { label: "Radius", href: "/foundations/radius" },
      { label: "Motion", href: "/foundations/motion" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "Button", href: "/components/button" },
      { label: "Input", href: "/components/input" },
      { label: "Card", href: "/components/card" },
      { label: "Layout", href: "/components/layout" },
      { label: "Navigation", href: "/components/navigation" },
      { label: "Data Display", href: "/components/data-display" },
      { label: "Tabs", href: "/components/tabs" },
      { label: "Overlay", href: "/components/overlay" },
      { label: "Feedback", href: "/components/feedback" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Principles", href: "/system/principles" },
      { label: "Theming", href: "/system/theming" },
    ],
  },
];
