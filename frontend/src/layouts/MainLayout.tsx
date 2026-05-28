import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/src/components/shared/Navbar";
import { Footer } from "@/src/components/shared/Footer";
import { Lenis } from "lenis/react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/src/components/shared/BottomNav";

import { ErrorBoundary } from "@/src/components/ui/ErrorBoundary";

export const MainLayout = () => {
  const location = useLocation();

  return (
    <Lenis root>
      <div className="min-h-screen bg-luxury-gray text-luxury-black selection:bg-luxury-purple/20 selection:text-luxury-purple">
        <Navbar />
        <main className="pb-20 md:pb-0">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
        <BottomNav />
        <Footer />
      </div>
    </Lenis>
  );
};
