import Link from "next/link";
import { ReactNode } from "react";

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4 md:p-5",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

export function ContentCard({
  children,
  className = "",
  padding = "md",
}: ContentCardProps) {
  return (
    <div
      className={`rounded-3xl border border-brand-brown/10 bg-white shadow-[0_8px_30px_rgba(44,31,23,0.08)] ${paddingMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
