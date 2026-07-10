import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Priya Sharma",
    role: "Rented in Bangalore",
    rating: 5,
    text: "Found a fully furnished 2BHK in Indiranagar within a week. The verified badge gave me confidence, and visit booking was seamless.",
  },
  {
    name: "Rahul Mehta",
    role: "Bought in Mumbai",
    rating: 5,
    text: "Aetheria's filters saved hours of browsing. We compared three properties, booked visits the same day, and closed the deal in 3 weeks.",
  },
  {
    name: "Ananya Reddy",
    role: "Leased in Hyderabad",
    rating: 5,
    text: "The loan calculator helped us plan our budget before we even started looking. Premium experience from start to finish.",
  },
];

export const Testimonials = () => (
  <section className="home-testimonials-section">
    <div className="page-container">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-eyebrow mb-2">Happy homeowners</p>
        <h2 className="text-display-lg text-ink mb-4">Trusted by thousands across India</h2>
        <p className="text-body-md text-body">
          Real stories from renters and buyers who found their perfect home through Aetheria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map(({ name, role, rating, text }, i) => (
          <motion.article
            key={name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="home-testimonial-card"
          >
            <Quote className="w-8 h-8 text-accent/20 mb-4" />
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: rating }).map((_, j) => (
                <Star key={j} className="w-4 h-4 text-amber-500 fill-amber-500" />
              ))}
            </div>
            <p className="text-body-md text-body leading-relaxed mb-6 font-sans">&ldquo;{text}&rdquo;</p>
            <div className="flex items-center gap-3 pt-4 border-t border-hairline">
              <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-sm font-bold text-accent-deep font-sans">
                {name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink font-sans">{name}</p>
                <p className="text-xs text-mute font-sans">{role}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);
