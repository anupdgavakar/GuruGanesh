import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-500",
  secondary: "bg-accent-600 text-white hover:bg-accent-700 focus-visible:outline-accent-600",
  outline: "border border-ink-300 text-ink-900 hover:bg-ink-100 focus-visible:outline-ink-500",
  ghost: "text-ink-900 hover:bg-ink-100 focus-visible:outline-ink-500",
  white: "bg-white text-brand-700 shadow-sm hover:bg-brand-50 focus-visible:outline-white",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
} as const;

type ButtonBaseProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(baseClasses, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: ButtonBaseProps & React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={cn(baseClasses, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
