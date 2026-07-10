import { motion } from "framer-motion";

const STATS = [
  { val: "50K+", label: "Properties" },
  { val: "25K+", label: "Happy Buyers" },
  { val: "500+", label: "Real Estate Agents" },
  { val: "100+", label: "Cities Covered" },
];

export const HomeStats = () => (
  <section className="home-stats-band">
    <div className="page-container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {STATS.map(({ val, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="home-stat-item text-center md:text-left"
          >
            <p className="val">{val}</p>
            <p className="lbl">{label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
