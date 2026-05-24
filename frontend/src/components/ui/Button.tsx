import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-purple/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-luxury-black text-white hover:bg-luxury-black/90 shadow-lg",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-luxury-purple/10 bg-white text-luxury-black hover:bg-luxury-gray hover:border-luxury-purple/30",
        secondary: "bg-luxury-purple-light text-luxury-purple hover:bg-luxury-purple/10",
        ghost: "hover:bg-luxury-purple/5 text-luxury-black/60 hover:text-luxury-black",
        link: "text-luxury-purple underline-offset-4 hover:underline",
        premium: "bg-luxury-purple text-white font-bold hover:brightness-110 shadow-lg shadow-luxury-purple/20",
        glass: "bg-white/50 backdrop-blur-xl border border-white/20 text-luxury-black hover:bg-white/80"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base uppercase tracking-widest",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
