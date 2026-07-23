"use client";

export function HeartButton({
  selected,
  onClick,
  label,
  size = "sm",
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "lg" ? 22 : 18;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${label} from selection` : `Add ${label} to selection`}
      className={`pointer-events-auto grid ${dim} shrink-0 place-items-center rounded-full border backdrop-blur-sm transition-all duration-200 active:scale-90 ${
        selected
          ? "border-energy bg-energy/15 text-energy"
          : "border-hairline bg-void/60 text-ink-soft hover:border-energy hover:text-energy"
      }`}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill={selected ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.3 5c2 0 3.4 1.1 4.2 2.4L12 10l2.5-2.6C15.3 6.1 16.7 5 18.7 5 22 5 23.6 8.4 22 11.7 19.5 16.4 12 21 12 21Z" />
      </svg>
    </button>
  );
}
