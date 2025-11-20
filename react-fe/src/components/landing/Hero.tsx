
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="relative pt-64 pb-32 px-4 overflow-hidden min-h-screen flex flex-col items-center justify-center">
      {/* Professional Background */}
      <div className="absolute inset-0 h-full w-full bg-background">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 -z-10 h-[500px] w-full bg-primary/5 blur-[100px] rounded-full opacity-50 pointer-events-none" />

      <div className="container mx-auto text-center max-w-6xl relative z-10">


        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-[1.1]"
        >
          Video infrastructure
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/50">
            for the internet
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light tracking-wide"
        >
          Effortless video transcoding, storage, and delivery. <br className="hidden md:block" />
          Built for developers who care about <span className="text-foreground font-medium">quality and speed</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24"
        >
          <Link to="/signup">
            <Button size="lg" className="h-14 px-8 text-base rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-primary/30">
              Start Building
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-border/50 bg-background/50 backdrop-blur-sm hover:bg-secondary/80 transition-all duration-300 hover:scale-105 text-foreground">
            <Play className="mr-2 h-4 w-4 fill-current" />
            View Documentation
          </Button>
        </motion.div>

        {/* Dashboard Preview (Glass Card) */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="relative mx-auto max-w-5xl perspective-1000"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-xl bg-[#0A0A0A]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl overflow-hidden flex"
          >
            {/* Sidebar */}
            <div className="w-16 border-r border-white/[0.08] bg-white/[0.02] flex flex-col items-center py-6 gap-6 hidden md:flex">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-sm bg-emerald-500" />
              </div>
              <div className="flex flex-col gap-4 w-full px-4">
                <div className="h-8 w-8 rounded-lg bg-white/10" />
                <div className="h-8 w-8 rounded-lg bg-white/5" />
                <div className="h-8 w-8 rounded-lg bg-white/5" />
                <div className="h-8 w-8 rounded-lg bg-white/5" />
              </div>
              <div className="mt-auto flex flex-col gap-4 w-full px-4">
                <div className="h-8 w-8 rounded-full bg-white/10" />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="h-14 border-b border-white/[0.08] flex items-center justify-between px-6 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Dashboard</div>
                  <div className="text-muted-foreground/20">/</div>
                  <div className="text-sm font-medium text-foreground">Overview</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-8 rounded-md bg-white/5" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300" />
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stat 1 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Streams</div>
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12.5%</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground tracking-tight">1,284</div>
                  </div>

                  {/* Stat 2 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bandwidth</div>
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+8.2%</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground tracking-tight">4.2 TB</div>
                  </div>

                  {/* Stat 3 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Success Rate</div>
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+0.1%</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground tracking-tight">99.9%</div>
                  </div>
                </div>

                {/* Main Chart Area */}
                <div className="h-64 rounded-xl border border-white/[0.05] bg-white/[0.02] relative overflow-hidden group">
                  <div className="absolute inset-0 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-foreground">Traffic Overview</div>
                      <div className="flex gap-2">
                        <div className="px-2 py-1 rounded-md bg-white/10 text-xs text-foreground">24h</div>
                        <div className="px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-white/5 cursor-pointer">7d</div>
                        <div className="px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-white/5 cursor-pointer">30d</div>
                      </div>
                    </div>

                    {/* Chart Visualization */}
                    <div className="flex-1 relative w-full">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between opacity-10">
                        <div className="w-full h-px bg-white" />
                        <div className="w-full h-px bg-white" />
                        <div className="w-full h-px bg-white" />
                        <div className="w-full h-px bg-white" />
                      </div>

                      {/* Area Chart Path (SVG) */}
                      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,100 C100,80 200,120 300,60 C400,0 500,80 600,40 C700,0 800,60 900,20 L900,200 L0,200 Z"
                          fill="url(#chartGradient)"
                          className="text-emerald-500"
                        />
                        <path
                          d="M0,100 C100,80 200,120 300,60 C400,0 500,80 600,40 C700,0 800,60 900,20"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>

                      {/* Interactive Cursor Line (Mock) */}
                      <div className="absolute top-0 bottom-0 left-[60%] w-px bg-emerald-500/50 border-l border-dashed border-emerald-500/50">
                        <div className="absolute top-[40px] left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                        <div className="absolute top-[10px] left-2 bg-[#0A0A0A] border border-white/10 px-2 py-1 rounded text-xs text-emerald-500 whitespace-nowrap shadow-xl">
                          2.4 GB/s
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Decorative Glow behind card */}
          <div className="absolute -inset-4 -z-10 bg-primary/10 blur-2xl rounded-[2rem] opacity-50" />
        </motion.div>

      </div>
    </section>
  );
};

