import { useEffect, useState } from "react";
import { categoriesApi, type ApiCategory } from "@/src/services/api";

export function useListingCategories() {
  const [listingCategories, setListingCategories] = useState<ApiCategory[]>([]);
  const [propertyCategories, setPropertyCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.list()
      .then(res => {
        setListingCategories(
          res.data
            .filter(c => c.categoryType === "listing" && c.isActive !== false)
            .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
        );
        setPropertyCategories(
          res.data.filter(c => c.categoryType === "property" && c.matchValues.length > 0),
        );
      })
      .catch(() => {
        setListingCategories([]);
        setPropertyCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { listingCategories, propertyCategories, loading };
}
