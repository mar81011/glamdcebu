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
      className={`surface-card rounded-[1.75rem] ${paddingMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
