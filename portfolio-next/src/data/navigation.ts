export interface NavigationItem {
  label: string;
  href: string;
}

export const navigation: NavigationItem[] = [
  { label: "Projects", href: "/projects/" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];