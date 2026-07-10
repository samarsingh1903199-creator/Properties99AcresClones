import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-accent-deep to-accent text-on-primary rounded-full shadow-elevated-2 hover:opacity-90",
        destructive: "bg-error text-on-primary rounded-md hover:opacity-90",
        outline: "border border-accent/25 bg-canvas text-accent rounded-full hover:bg-accent-soft",
        secondary: "bg-accent-soft text-accent-deep border border-accent/25 rounded-full hover:bg-accent-soft/80",
        ghost: "text-body hover:text-accent hover:bg-accent-soft/50 rounded-md",
        link: "text-link underline-offset-4 hover:underline rounded-none px-0 h-auto",
        premium: "bg-gradient-to-r from-accent-deep to-accent text-on-primary rounded-full shadow-elevated-2 hover:opacity-90",
        glass: "bg-canvas/80 backdrop-blur-md border border-hairline text-ink rounded-full hover:bg-canvas",
      },
      size: {
        default: "h-12 px-6 text-base",
        sm: "h-9 px-4 text-sm rounded-full",
        lg: "h-12 px-8 text-base rounded-full",
        nav: "h-7 px-3 text-sm rounded-md",
        icon: "h-10 w-10 rounded-full",
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
