import { ORGANIZATION } from "@/lib/data";
import Image from "next/image";

/**
 * Masthead: national emblem on the left, organization name (Bangla + English)
 * in the centre, and the national flag on the right — the standard Bangladesh
 * government portal header composition.
 */
export function SiteHeader() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <Image
          src="/assets/govt-seal.svg"
          alt="বাংলাদেশ সরকারের জাতীয় প্রতীক"
          width={64}
          height={64}
          className="size-14 shrink-0 sm:size-16"
          priority
        />

        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-lg font-bold text-govt-green sm:text-2xl">
            {ORGANIZATION.nameBn}
          </h1>
          <p className="truncate text-sm font-semibold text-govt-red sm:text-base">
            {ORGANIZATION.branchBn}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
            {ORGANIZATION.nameEn}, {ORGANIZATION.branchEn}
          </p>
        </div>

        <Image
          src="/assets/flag.svg"
          alt="বাংলাদেশের জাতীয় পতাকা"
          width={64}
          height={40}
          className="hidden h-10 w-16 shrink-0 rounded-sm border border-slate-200 object-cover sm:block"
        />
      </div>
    </header>
  );
}
