export const PREFERRED_TENANT_TYPES = [
  "Family",
  "Couples",
  "Girls",
  "Boys",
  "Independent",
  "Working Professionals",
] as const;

export type PreferredTenantType = (typeof PREFERRED_TENANT_TYPES)[number];
