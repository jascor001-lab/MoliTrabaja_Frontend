import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20",
  secondary:
    "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50",
  ghost: "bg-transparent text-emerald-700 hover:bg-emerald-50",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5
        text-sm font-semibold transition-all duration-200 active:scale-[0.98]
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
