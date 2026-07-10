import { Landmark, Twitter, Instagram, Github, Mail, MapPin, Building2, Briefcase, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const exploreLinks = [
    { to: "/properties", label: "Property listings", icon: Building2 },
    { to: "/agents", label: "Dealers", icon: Compass },
    { to: "/about", label: "Our approach", icon: Briefcase },
    { to: "/contact", label: "Concierge", icon: Mail },
  ];

  return (
    <footer className="bg-canvas border-t border-hairline section-band !pt-16 !pb-10">
      <div className="page-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div className="space-y-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 logo-gradient rounded-md flex items-center justify-center">
              <Landmark className="text-on-primary w-4 h-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-ink">
              Aetheria
            </span>
          </Link>
          <p className="text-body-sm text-body leading-relaxed max-w-xs">
            A premium property platform for discovering rentals and sales with clarity, large imagery, and a search experience built for serious buyers.
          </p>
          <div className="flex gap-2">
            {[
              { Icon: Twitter, color: "icon-pill-blue" },
              { Icon: Instagram, color: "icon-pill-violet" },
              { Icon: Github, color: "icon-pill-violet" },
            ].map(({ Icon, color }, i) => (
              <a
                key={i}
                href="#"
                className={`icon-pill ${color} w-9 h-9 rounded-full hover:opacity-80 transition-opacity`}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-eyebrow mb-4 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-accent" />
            Explore
          </h4>
          <ul className="space-y-3 text-body-sm text-body">
            {exploreLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link to={to} className="hover:text-accent transition-colors flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-mute" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-eyebrow mb-4 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-violet" />
            Company
          </h4>
          <ul className="space-y-3 text-body-sm text-body">
            <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Privacy policy</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Terms of service</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Press kit</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-eyebrow mb-4 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-warm" />
            Stay updated
          </h4>
          <p className="text-body-sm text-body mb-4">Get new listings and market insights in your inbox.</p>
          <div className="relative">
            <input
              type="email"
              placeholder="Email address"
              className="form-input pr-24"
            />
            <Button size="sm" variant="default" className="absolute right-1 top-1 h-8">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      <div className="page-container pt-8 border-t border-hairline flex flex-col md:flex-row justify-between items-center gap-4 text-caption-mono text-mute">
        <p>© {currentYear} Aetheria. All rights reserved.</p>
        <div className="flex flex-wrap gap-6 justify-center">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" /> Mumbai, India</span>
          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-violet" /> concierge@aetheria.is</span>
        </div>
      </div>
    </footer>
  );
};
