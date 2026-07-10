import { motion } from "framer-motion";
import { Search, CalendarCheck, KeyRound } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Discover homes",
    desc: "Search by city, budget, or lifestyle. Smart filters narrow thousands of listings in seconds.",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Book a visit",
    desc: "Schedule a tour with verified owners and dealers. No hidden fees, no guesswork.",
  },
  {
    icon: KeyRound,
    step: "03",
    title: "Move in with confidence",
    desc: "Every listing is checked. Rent or buy knowing the details are clear and accurate.",
  },
];

export const HowItWorks = () => (
  <section id="how-it-works" className="home-how-section">
    <div className="page-container">
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <p className="text-eyebrow mb-3">How it works</p>
        <h2 className="text-display-lg text-ink mb-4">
          Your journey to a new home
        </h2>
        <p className="text-body-lg text-body">
          Three simple steps from browsing to moving in — designed to be fast, transparent, and stress-free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {STEPS.map(({ icon: Icon, step, title, desc }, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="home-step-card"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="home-step-icon">
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-caption-mono text-accent/60">{step}</span>
            </div>
            <h3 className="text-lg font-medium text-ink mb-2 font-sans">{title}</h3>
            <p className="text-body-sm text-body leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
