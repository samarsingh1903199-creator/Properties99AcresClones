import { Landmark, Github, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-luxury-black border-t border-white/5 pt-20 pb-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center shadow-lg">
              <Landmark className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-display font-bold tracking-tighter text-white">
              AETHERIA
            </span>
          </Link>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Redefining luxury real estate with futuristic AI integration and seamless digital experiences across the meta-landscape.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-luxury-purple/20 hover:text-luxury-purple transition-all border border-white/10">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-luxury-purple/20 hover:text-luxury-purple transition-all border border-white/10">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-luxury-purple/20 hover:text-luxury-purple transition-all border border-white/10">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><Link to="/properties" className="hover:text-luxury-purple transition-colors">Luxury Listings</Link></li>
            <li><Link to="/agents" className="hover:text-luxury-purple transition-colors">Specialist Agents</Link></li>
            <li><Link to="/about" className="hover:text-luxury-purple transition-colors">Our Vision</Link></li>
            <li><Link to="/contact" className="hover:text-luxury-purple transition-colors">Concierge Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><a href="#" className="hover:text-luxury-purple transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-luxury-purple transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-luxury-purple transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-luxury-purple transition-colors">Press Kit</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Newsletter</h4>
          <p className="text-white/50 text-sm mb-4">Get exclusive updates on new futuristic properties.</p>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-luxury-purple transition-all"
            />
            <Button size="sm" variant="premium" className="absolute right-1 top-1">
              Join
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30">
        <p>© {currentYear} Aetheria Reality Group. All rights reserved.</p>
        <div className="flex gap-8">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Neo-Tokyo, Sector 7</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> concierge@aetheria.is</span>
        </div>
      </div>
    </footer>
  );
};
