import { ROUTES } from "../constants/routes";

/** Ensures only one sidebar item is active — avoids /properties matching /properties/highlighted */
export function isSidebarNavActive(pathname: string, to: string): boolean {
  if (to === ROUTES.HIGHLIGHTED_PROPERTIES) {
    return pathname === ROUTES.HIGHLIGHTED_PROPERTIES;
  }

  if (to === ROUTES.PROPERTIES) {
    if (pathname === ROUTES.HIGHLIGHTED_PROPERTIES) return false;
    return pathname === ROUTES.PROPERTIES || pathname.startsWith(`${ROUTES.PROPERTIES}/`);
  }

  return pathname === to;
}
