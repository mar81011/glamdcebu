export function DiamondDivider() {
  return (
    <div className="flex items-center gap-3 py-5" aria-hidden>
      <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,rgba(107,76,59,0.28))]" />
      <span className="text-[10px] text-brand-brown/70">◆</span>
      <div className="h-px flex-1 bg-[linear-gradient(to_left,transparent,rgba(107,76,59,0.28))]" />
    </div>
  );
}
