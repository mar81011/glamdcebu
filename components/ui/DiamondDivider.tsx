export function DiamondDivider() {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-px flex-1 bg-brand-brown/25" />
      <span className="text-brand-muted text-xs">◆</span>
      <div className="h-px flex-1 bg-brand-brown/25" />
    </div>
  );
}
