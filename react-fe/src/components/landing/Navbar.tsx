import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ModeToggle } from "../mode-toggle";
import Logo from "@/assets/Logo.svg";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { GlassButton } from "../ui/glass-button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{
        y: -100,
        opacity: 0,
        width: "95%",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        backgroundColor: "rgba(0, 0, 0, 0)",
      }}
      animate={{
        y: 16,
        opacity: 1,
        width: "95%",
        borderRadius: "16px",
        border: isScrolled
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(255, 255, 255, 0.05)",
        backgroundColor: isScrolled
          ? "rgba(0, 0, 0, 0.7)"
          : "rgba(0, 0, 0, 0)",
        backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.5,
      }}
      className="fixed left-1/2 -translate-x-1/2 z-50 max-w-5xl"
      style={{
        maxWidth: "1024px",
      }}
    >
      <div className="px-4 h-14 md:h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            src={Logo}
            alt="Streamly Logo"
            className="h-8 md:h-9 w-auto object-contain rounded-md bg-background/40 backdrop-blur-sm p-1"
          />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col leading-none"
          >
            <div className="flex items-baseline">
              <span className="font-semibold text-lg tracking-tight">Streamly</span>
              <span className="text-[10px] text-muted-foreground ml-1 relative top-[1px]">
                AI
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-full border border-white/5">
          {["Features", "Pricing", "About"].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-medium px-4 py-1.5 rounded-full hover:bg-background/80 hover:text-primary transition-all duration-200"
            >
              {item}
            </motion.a>
          ))}
        </div>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* <ModeToggle /> */}
          <Link to="/signin">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="font-medium hover:bg-secondary/80 rounded-full px-4">
                Sign In
              </Button>
            </motion.div>
          </Link>
          <Link to="/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full"
              animate={{
                boxShadow: [
                  "0px 0px 0px rgba(16, 185, 129, 0)",
                  "0px 0px 20px rgba(16, 185, 129, 0.5)",
                  "0px 0px 0px rgba(16, 185, 129, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Button size="sm" className="font-medium bg-emerald-600 hover:bg-emerald-700 rounded-full px-5 shadow-md hover:shadow-lg transition-all">
                Get Started
              </Button>
            </motion.div>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-secondary/80 transition-colors"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full border-t border-white/10 bg-background/95 backdrop-blur-xl"
          >
            <div className="p-4 flex flex-col space-y-2">
              {["Features", "Pricing", "About"].map((item, i) => (
                <motion.a
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium p-3 rounded-xl hover:bg-secondary/50 transition-colors block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </motion.a>
              ))}

              <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-border/50">
                {/* <div className="flex items-center justify-between px-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ModeToggle />
                </div> */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full rounded-xl font-medium border-white/10">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full rounded-xl font-medium bg-emerald-600 hover:bg-emerald-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
