"use client";

type AuthPageHeadingProps = {
  title: string;
  subtitle: string;
  className?: string;
};

export function AuthPageHeading({ title, subtitle, className }: AuthPageHeadingProps) {
  return (
    <div className={className ?? "mb-10 text-center"}>
      <h2 className="text-3xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/50">{subtitle}</p>
    </div>
  );
}
