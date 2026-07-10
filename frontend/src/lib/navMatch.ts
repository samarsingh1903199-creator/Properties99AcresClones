import { ROUTES } from "@/src/constants/routes";

/** Returns true for exactly one main nav item per route — no overlapping prefix matches */
export function isMainNavActive(pathname: string, href: string): boolean {
  if (href === ROUTES.HOME) {
    return pathname === ROUTES.HOME;
  }

  if (href === ROUTES.PROPERTIES) {
    return pathname === ROUTES.PROPERTIES || /^\/properties\/[^/]+$/.test(pathname);
  }

  if (href === ROUTES.AGENTS) {
    return pathname === ROUTES.AGENTS || pathname.startsWith("/specialists/");
  }

  return pathname === href;
}
