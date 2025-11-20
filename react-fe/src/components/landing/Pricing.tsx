import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Hobby",
    price: "0",
    description: "Perfect for side projects and learning.",
    features: [
      "Up to 100 minutes/month",
      "720p transcoding",
      "Community support",
      "1 project",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "For serious creators and growing startups.",
    features: [
      "Up to 1,000 minutes/month",
      "4K transcoding",
      "Priority support",
      "Unlimited projects",
      "Custom domains",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Dedicated infrastructure for scale.",
    features: [
      "Unlimited minutes",
      "8K & HDR support",
      "24/7 dedicated support",
      "SLA guarantee",
      "On-premise deployment",
    ],
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section
      id="pricing"
      className="relative py-32 bg-background overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            <p className="text-center text-xl font-semibold">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary/90 to-primary/70">
                Plans built for every stage — from indie creators to global teams.
              </span>
            </p>




          </motion.p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group rounded-3xl transition-all duration-300 ${plan.popular
                ? "border-2 border-primary shadow-lg shadow-primary/10 scale-105 z-10 bg-card"
                : "border border-border/50 hover:border-border bg-card/50 mt-4"
                }`}
            >
              <div className="p-8 flex flex-col h-full">
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-sm tracking-wide">
                    MOST POPULAR
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-bold tracking-tight text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Feature List */}
                <ul className="space-y-4 text-sm mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-foreground/80">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to="/signup" className="mt-auto">
                  <Button
                    className={`w-full h-12 rounded-xl text-base font-medium transition-all duration-300 ${plan.popular
                      ? "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    variant={plan.popular ? "default" : "ghost"}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
