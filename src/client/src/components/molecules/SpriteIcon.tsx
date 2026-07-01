type TSpriteIconProps = {
  /** Symbol id inside /icons.svg, e.g. "github-icon". */
  name: string;
  className?: string;
};

/**
 * Render a custom icon from the SVG sprite in `public/icons.svg`. Use this for
 * brand/custom glyphs not covered by lucide-react.
 */
export function SpriteIcon({ name, className }: TSpriteIconProps) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
}
