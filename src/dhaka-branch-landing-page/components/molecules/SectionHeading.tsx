/** Section title used across the public site, with the govt-style underline. */
export function SectionHeading({
  title,
  subtitle,
  align = "left",
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <h2 className="text-2xl font-bold tracking-tight text-govt-green sm:text-3xl">
        {title}
      </h2>
      <span
        className={`mt-3 block h-1 w-20 rounded bg-govt-red ${
          align === "center" ? "mx-auto" : ""
        }`}
      />
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm text-slate-600">{subtitle}</p>
      ) : null}
    </div>
  );
}
