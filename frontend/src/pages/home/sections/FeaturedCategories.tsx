import { motion } from "framer-motion";
import { KeyRound, Home, Building2, Calculator, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";
import { useHomeCategoryStore } from "@/src/store/useHomeCategoryStore";
import type { HomeCategoryId } from "@/src/components/home/CategoryTabs";

const CATEGORIES = [
  {
    icon: KeyRound,
    title: "Rentals",
    desc: "Furnished flats, PGs & independent homes",
    category: "rent" as HomeCategoryId,
    scrollTo: "properties-listing",
  },
  {
    icon: Home,
    title: "Buy property",
    desc: "Apartments, villas & plots for sale",
    category: "sale" as HomeCategoryId,
    scrollTo: "properties-listing",
  },
  {
    icon: Building2,
    title: "New projects",
    desc: "Under-construction & upcoming launches",
    category: "projects" as HomeCategoryId,
    href: "/projects",
  },
  {
    icon: Calculator,
    title: "Home loans",
    desc: "EMI calculator & bank comparison",
    category: null,
    scrollTo: "loan-calculator",
  },
];

export const FeaturedCategories = () => {
  const navigate = useNavigate();
  const { setPendingCategory } = useHomeCategoryStore();

  const handleClick = (item: (typeof CATEGORIES)[number]) => {
    if (item.href) {
      navigate(item.href);
      return;
    }
    if (item.category) setPendingCategory(item.category);
    document.getElementById(item.scrollTo ?? "properties-listing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="home-featured-section">
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-eyebrow mb-2">Explore by intent</p>
            <h2 className="text-display-md text-ink">Start with what you need</h2>
          </div>
          <button
            onClick={() => navigate(ROUTES.PROPERTIES)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-deep transition-colors"
          >
            View all listings
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {CATEGORIES.map(({ icon: Icon, title, desc, ...item }, i) => (
            <motion.button
              key={title}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              onClick={() => handleClick({ icon: Icon, title, desc, ...item })}
              className="home-featured-card text-left group"
            >
              <span className="relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 mb-4">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="relative z-10 text-lg font-medium text-on-primary mb-1.5">{title}</h3>
              <p className="relative z-10 text-sm text-on-primary/75 leading-relaxed">{desc}</p>
              <span className="relative z-10 inline-flex items-center gap-1 mt-4 text-xs font-medium text-on-primary/90 group-hover:gap-2 transition-all">
                Explore <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
