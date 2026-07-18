import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Borderless: separation comes from whitespace, not a box.
export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div>
      <span className="inline-flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="mt-4 font-medium tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
