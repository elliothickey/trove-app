import { cn } from "@/components/ui/cn";

// Quiet, low-chroma tints so a grid of people doesn't read as a wall of gray.
const TINTS = [
  "bg-[#efe9e1] text-[#6d5a45]", // sand
  "bg-[#e6ebe3] text-[#4f6149]", // sage
  "bg-[#f0e5e0] text-[#7a5446]", // clay
  "bg-[#e5e8ec] text-[#4d5866]", // slate
  "bg-[#ece6ee] text-[#65526b]", // heather
];

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function tintFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return TINTS[Math.abs(hash) % TINTS.length];
}

export default function Avatar({
  name,
  seed,
  className,
}: {
  name: string;
  // Keeps the tint stable if the name is edited; defaults to the name.
  seed?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-10 shrink-0 select-none items-center justify-center rounded-full text-[13px] font-medium tracking-wide",
        tintFor(seed ?? name),
        className
      )}
    >
      {initialsFor(name)}
    </span>
  );
}
