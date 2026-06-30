"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "প্রচ্ছদ", href: "#home" },
  { label: "আমাদের সম্পর্কে", href: "#about" },
  { label: "নোটিশ বোর্ড", href: "#notices" },
  { label: "পরিচালনা পর্ষদ", href: "#board" },
  { label: "যোগাযোগ", href: "#contact" },
];

/** Primary green navigation bar with a collapsible menu on small screens. */
export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-govt-green text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
        <ul className="hidden items-center md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block px-4 py-3 text-sm font-medium transition-colors hover:bg-govt-green-dark"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <span className="py-3 text-sm font-semibold md:hidden">মেনু</span>
        <button
          type="button"
          className="my-1.5 rounded p-2 hover:bg-govt-green-dark md:hidden"
          aria-label="মেনু খুলুন"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <ul className="border-t border-white/10 md:hidden">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block px-4 py-3 text-sm font-medium transition-colors hover:bg-govt-green-dark"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
