import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, Clock, Headphones, IndianRupee, LayoutGrid } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% verified listings",
    desc: "Every property is checked for authenticity before it goes live on our platform.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted dealers & owners",
    desc: "Work directly with verified sellers — no fake profiles or duplicate listings.",
  },
  {
    icon: LayoutGrid,
    title: "Smart search & filters",
    desc: "Narrow results by budget, location, BHK, tenant type, and distance in seconds.",
  },
  {
    icon: Clock,
    title: "Instant visit booking",
    desc: "Schedule property tours online and get confirmation without endless phone calls.",
  },
  {
    icon: IndianRupee,
    title: "Transparent pricing",
    desc: "Clear rent, sale price, and deposit details — no hidden charges or surprises.",
  },
  {
    icon: Headphones,
    title: "Dedicated support",
    desc: "Our concierge team helps you from first search to keys in hand.",
  },
];

export const WhyAetheria = () => (
  <section className="home-why-section">
    <div className="page-container">
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
        <p className="text-eyebrow mb-2">Why Aetheria</p>
        <h2 className="text-display-lg text-ink mb-4">Built for serious home seekers</h2>
        <p className="text-body-lg text-body">
          We combine premium design with rigorous verification — so you spend less time searching and more time finding the right home.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.45 }}
            className="home-why-card"
          >
            <span className="icon-pill icon-pill-teal w-11 h-11 rounded-xl mb-4">
              <Icon className="w-5 h-5" />
            </span>
            <h3 className="text-base font-semibold text-ink mb-2 font-sans">{title}</h3>
            <p className="text-body-sm text-body leading-relaxed font-sans">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
