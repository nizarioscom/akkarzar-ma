import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 text-[var(--ink)] shadow-sm ${className}`}>
      {children}
    </section>
  );
}

const buttonVariants = {
  primary: "bg-[var(--flag-green)] text-white hover:bg-[#004d28]",
  secondary: "bg-[var(--flag-red)] text-white hover:bg-[#9e1f24]",
  outline: "border border-[#c4b8a4] bg-white text-[#1a1712] hover:bg-[#f3efe4]",
  danger: "bg-[var(--flag-red)] text-white hover:bg-[#9e1f24]",
  ghost: "border border-[#c4b8a4] bg-transparent text-[#1a1712] hover:bg-white",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export function Button({
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
      {...rest}
    />
  );
}

export function Field(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className = "", id, ...rest } = props;
  const fieldId = id ?? rest.name;
  return (
    <label className="grid gap-1 text-sm text-[var(--ink)]" htmlFor={fieldId}>
      <span className="font-medium text-[#3f3a33]">{label}</span>
      <input
        id={fieldId}
        className={`rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-[#1a1712] ${className}`}
        {...rest}
      />
    </label>
  );
}
