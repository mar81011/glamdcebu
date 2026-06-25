import { DEFAULT_BRAND_TAGLINE } from "@/lib/branding/defaults";

const sizeClasses = {
  sm: { title: "text-2xl", tagline: "text-[9px] tracking-[0.18em]" },
  md: { title: "text-3xl md:text-4xl", tagline: "text-[10px] tracking-[0.2em]" },
  lg: { title: "text-4xl md:text-5xl", tagline: "text-[10px] tracking-[0.2em]" },
  xl: { title: "text-5xl md:text-6xl", tagline: "text-xs tracking-[0.22em]" },
};

interface BrandTitleProps {
  title: string;
  size?: keyof typeof sizeClasses;
  showTagline?: boolean;
  tagline?: string;
  light?: boolean;
  className?: string;
}

export function BrandTitle({
  title,
  size = "md",
  showTagline = true,
  tagline = DEFAULT_BRAND_TAGLINE,
  light = false,
  className = "",
}: BrandTitleProps) {
  const { title: titleSize, tagline: taglineSize } = sizeClasses[size];
  const titleColor = light ? "text-white" : "text-brand-ink";
  const taglineColor = light ? "text-brand-cream/90" : "text-brand-subtle";

  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span
        className={`font-brand-script ${titleSize} ${titleColor} lowercase drop-shadow-sm`}
      >
        {title.trim()}
      </span>
      {showTagline && (
        <span
          className={`mt-2 font-sans font-light uppercase ${taglineSize} ${taglineColor}`}
        >
          {tagline}
        </span>
      )}
    </span>
  );
}
