import type { TBoardOfDirector } from "@/lib/types";
import Image from "next/image";

/** Initials fallback when a member has no avatar (matches admin client). */
function initials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Board-member profile tile. Inspired by the admin client's `BoardMemberCard`
 * but laid out vertically, as Bangladesh govt portals present officials.
 */
export function DirectorCard({ member }: { member: TBoardOfDirector }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full bg-slate-100">
        {member.avatar ? (
          <Image
            src={member.avatar}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-govt-green/10 text-5xl font-bold text-govt-green">
            {initials(member.name)}
          </div>
        )}
      </div>
      <div className="border-t-4 border-govt-green px-3 py-4">
        <h3 className="font-bold leading-tight text-slate-800">
          {member.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-govt-red">
          {member.designation}
        </p>
      </div>
    </article>
  );
}
