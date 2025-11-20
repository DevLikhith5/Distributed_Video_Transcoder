import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 backdrop-blur-xl border border-white/20 shadow-md",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-foreground hover:bg-white/20 hover:shadow-lg dark:bg-white/5 dark:hover:bg-white/10",
        primary:
          "bg-primary/20 text-primary-foreground hover:bg-primary/30 border-primary/30 dark:bg-primary/10 dark:hover:bg-primary/20",
        secondary:
          "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 border-secondary/30 dark:bg-secondary/10 dark:hover:bg-secondary/20",
        destructive:
          "bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/30 dark:bg-destructive/10 dark:hover:bg-destructive/20",
        outline:
          "bg-transparent border-white/30 text-foreground hover:bg-white/10 hover:border-white/50 dark:border-white/20",
        ghost:
          "bg-transparent hover:bg-white/10 text-foreground dark:hover:bg-white/5",
        link: "bg-transparent underline text-primary hover:text-primary/80",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function GlassButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof glassButtonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="glass-button"
      className={cn(glassButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { GlassButton, glassButtonVariants }
