
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { MouseEvent } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function FeatureCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      variants={item}
      className={`group relative rounded-3xl bg-card border border-border/50 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              var(--color-primary) 0%,
              transparent 80%
            )
          `,
          opacity: 0.15,
        }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}

export const Features = () => {
  return (
    <section
      id="features"
      className="relative py-32 bg-background overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8"
          >
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60">Scale</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Enterprise-grade infrastructure designed for high-performance media delivery.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]"
        >
          {/* Feature 1: Multipart S3 Uploads (Large Card) */}
          <FeatureCard className="md:col-span-2">
            <div className="p-8 h-full flex flex-col relative z-10">
              <h3 className="text-2xl font-bold mb-2">Multipart S3 File Uploads</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Accelerated data transfer using parallel chunk processing. Handle gigabytes of data with resume capability.
              </p>

              {/* Mini UI: Upload Visualization */}
              <div className="mt-auto w-full bg-background/40 rounded-xl border border-border/50 p-6 backdrop-blur-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center">
                      <div className="h-4 w-4 bg-primary rounded-sm" />
                    </div>
                    <div>
                      <div className="text-foreground font-medium">4k_footage_raw.mov</div>
                      <div className="text-xs text-muted-foreground">12.4 GB • 3s remaining</div>
                    </div>
                  </div>
                  <span className="text-primary font-mono font-bold">92%</span>
                </div>

                {/* Progress Bar with Flying Chunks */}
                <div className="relative h-3 w-full bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "92%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  {/* Flying Particles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-0 bottom-0 w-1 bg-white/50"
                      initial={{ left: "0%", opacity: 0 }}
                      animate={{ left: "100%", opacity: [0, 1, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "linear"
                      }}
                    />
                  ))}
                </div>

                {/* Chunk Grid Animation */}
                <div className="mt-4 grid grid-cols-8 gap-1">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 rounded-full bg-primary/30"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <motion.div
                        className="h-full w-full bg-primary rounded-full"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* Feature 2: CloudFront CDN (Tall Card) */}
          <FeatureCard className="md:row-span-2">
            <div className="p-8 h-full flex flex-col relative z-10">
              <h3 className="text-2xl font-bold mb-2">CloudFront CDN</h3>
              <p className="text-muted-foreground mb-8">
                Global edge network delivery.
              </p>

              {/* Mini UI: Globe Visualization */}
              <div className="flex-1 w-full relative min-h-[300px] flex items-center justify-center overflow-hidden rounded-full">
                {/* Dotted Globe Background */}
                <div className="absolute inset-0 rounded-full border border-primary/10 bg-primary/5"
                  style={{
                    backgroundImage: 'radial-gradient(circle, var(--color-primary) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.3
                  }}
                />

                {/* Scanning Radar */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "center" }}
                />

                {/* Central Server */}
                <div className="relative z-10">
                  <div className="h-24 w-24 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center shadow-[0_0_30px_var(--color-primary)]">
                    <div className="h-12 w-12 bg-primary rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Active Nodes */}
                {[0, 72, 144, 216, 288].map((deg, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                    animate={{
                      transform: [
                        `translate(-50%, -50%) rotate(${deg}deg) translateX(60px)`,
                        `translate(-50%, -50%) rotate(${deg + 360}deg) translateX(60px)`
                      ]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-background/40 border border-border/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Global Latency</span>
                  <span className="text-xs font-mono text-primary">14ms</span>
                </div>
                <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{ width: ["20%", "40%", "30%", "60%", "20%"] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* Feature 3: Adaptive HLS Streaming (Large Card) */}
          <FeatureCard className="md:col-span-2">
            <div className="p-8 h-full flex flex-col relative z-10">
              <h3 className="text-2xl font-bold mb-2">Adaptive HLS Streaming</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Dynamic bitrate adaptation ensures smooth playback across all network conditions.
              </p>

              {/* Mini UI: Video Player Controls */}
              <div className="mt-auto w-full bg-background/40 rounded-xl border border-border/50 overflow-hidden backdrop-blur-sm relative flex flex-col justify-end min-h-[200px]">
                {/* Fake Video Content (Abstract) */}
                <div className="absolute inset-0 w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />

                  {/* Animated Waveform */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-30">
                    {[...Array(40)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 bg-primary rounded-full"
                        animate={{ height: ["20%", "80%", "40%", "90%", "30%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.05
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="p-6 relative z-20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-transform cursor-pointer">
                      <motion.div
                        className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"
                      />
                    </div>
                    <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden cursor-pointer group/timeline">
                      <div className="h-full w-1/3 bg-primary relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow opacity-0 group-hover/timeline:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {["Auto", "4K", "1080p", "720p"].map((quality, i) => (
                      <motion.div
                        key={quality}
                        className={`px-4 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${i === 0 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-background/50 border-border/50 text-muted-foreground hover:border-primary/30'}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {quality}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>
        </motion.div>
      </div>
    </section>
  );
};
