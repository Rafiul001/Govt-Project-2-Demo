"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { pickLang } from "@/lib/i18n";
import type { TNavMenu } from "@/lib/types";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/** Path to a dynamic page, with each slug segment percent-encoded. */
function pagePath(menuSlug: string, submenuSlug?: string): string {
  const menuPath = `/${encodeURIComponent(menuSlug)}`;
  return submenuSlug
    ? `${menuPath}/${encodeURIComponent(submenuSlug)}`
    : menuPath;
}

/**
 * Primary green navigation bar. Renders the fixed site sections plus any
 * dynamic menus (each a dropdown of its published sub-menu pages) passed in
 * from the server. Collapses to a toggle menu on small screens.
 */
export function NavBar({ menus = [] }: { menus?: TNavMenu[] }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);

  // Section anchors are root-relative so they also work from other routes;
  // "Notice Board" and "Board of Directors" link to their full pages.
  const navItems = [
    { label: t.nav.home, href: "/#home" },
    { label: t.nav.about, href: "/#about" },
    { label: t.nav.notices, href: "/notices" },
    { label: t.nav.board, href: "/board" },
    { label: t.nav.contact, href: "/#contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-govt-green text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
        <ul className="hidden items-center md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-3 text-sm font-medium transition-colors hover:bg-govt-green-dark"
              >
                {item.label}
              </Link>
            </li>
          ))}

          {menus.map((menu) =>
            // A menu whose page is attached directly is a plain link.
            menu.hasPage && menu.submenus.length === 0 ? (
              <li key={menu.id}>
                <Link
                  href={pagePath(menu.slug)}
                  className="block px-4 py-3 text-sm font-medium transition-colors hover:bg-govt-green-dark"
                >
                  {pickLang(lang, menu.titleBn, menu.titleEn)}
                </Link>
              </li>
            ) : (
              <li key={menu.id} className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors hover:bg-govt-green-dark"
                >
                  {pickLang(lang, menu.titleBn, menu.titleEn)}
                  <ChevronDown className="size-3.5" />
                </button>
                {/* Hover-revealed dropdown of the menu's published pages. */}
                <ul className="invisible absolute left-0 top-full z-10 min-w-52 border-t-2 border-govt-red bg-white text-slate-800 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
                  {menu.submenus.map((submenu) => (
                    <li key={submenu.id}>
                      <Link
                        href={pagePath(menu.slug, submenu.slug)}
                        className="block px-4 py-2.5 text-sm transition-colors hover:bg-slate-100"
                      >
                        {pickLang(lang, submenu.titleBn, submenu.titleEn)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ),
          )}
        </ul>

        <span className="py-3 text-sm font-semibold md:hidden">
          {t.nav.menu}
        </span>
        <button
          type="button"
          className="my-1.5 rounded p-2 hover:bg-govt-green-dark md:hidden"
          aria-label={t.nav.openMenu}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <ul className="border-t border-white/10 md:hidden">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-3 text-sm font-medium transition-colors hover:bg-govt-green-dark"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {menus.map((menu) =>
            menu.hasPage && menu.submenus.length === 0 ? (
              <li key={menu.id} className="border-t border-white/10">
                <Link
                  href={pagePath(menu.slug)}
                  className="block px-4 py-3 text-sm font-medium transition-colors hover:bg-govt-green-dark"
                  onClick={() => setOpen(false)}
                >
                  {pickLang(lang, menu.titleBn, menu.titleEn)}
                </Link>
              </li>
            ) : (
              <li key={menu.id} className="border-t border-white/10">
                <span className="block px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                  {pickLang(lang, menu.titleBn, menu.titleEn)}
                </span>
                {menu.submenus.map((submenu) => (
                  <Link
                    key={submenu.id}
                    href={pagePath(menu.slug, submenu.slug)}
                    className="block px-6 py-2.5 text-sm font-medium transition-colors hover:bg-govt-green-dark"
                    onClick={() => setOpen(false)}
                  >
                    {pickLang(lang, submenu.titleBn, submenu.titleEn)}
                  </Link>
                ))}
              </li>
            ),
          )}
        </ul>
      ) : null}
    </nav>
  );
}
