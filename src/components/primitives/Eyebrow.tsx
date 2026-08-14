type EyebrowColor = "red" | "pink" | "cream";

const TEXT_COLOR: Record<EyebrowColor, string> = {
  red: "text-red",
  pink: "text-pink",
  cream: "text-cream",
};

const DOT_COLOR: Record<EyebrowColor, string> = {
  red: "text-red/50",
  pink: "text-pink/50",
  cream: "text-cream/50",
};

// The "देवनागरी • English" label used at the top of most sections/heroes.
// Previously hand-copy-pasted per section with drifted separators ("·" vs
// "•"), sizes (text-base md:text-lg vs text-[15px] md:text-base) and gaps —
// now one shared shape everywhere. `inline-flex` (not `flex`) is deliberate:
// it lets the label shrink to its own content width so a `text-center`
// ancestor (Ingredients, ShopDecisionBanner) can center it, while inside a
// flex row (ContactHero, FaqHero, AboutHero) it still sizes purely by
// content same as before. Layout/position concerns — whitespace-nowrap,
// margins, order, justify-end, etc. — stay with each caller via
// `className`, since those are legitimately different per section.
export default function Eyebrow({
  devanagari,
  english,
  color = "red",
  className = "",
}: {
  devanagari: string;
  english: string;
  color?: EyebrowColor;
  className?: string;
}) {
  return (
    <p
      className={`font-sura ${TEXT_COLOR[color]} text-base md:text-lg inline-flex items-center gap-2.5 ${className}`}
    >
      <span>{devanagari}</span>
      <span aria-hidden="true" className={`text-sm ${DOT_COLOR[color]}`}>
        •
      </span>
      <span>{english}</span>
    </p>
  );
}
