# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Institutional website for **Norte Rios** (educational management & training consultancy, Belém-PA, Brazil), in Portuguese (`pt-BR`). It is a **Vite + React 19 + TypeScript** single-page app, converted from three hand-authored static HTML pages. The originals are kept under `legacy/` for reference during the port (safe to delete once parity is confirmed).

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173).
- `npm run build` — `tsc -b` (typecheck) → `vite build` → `postbuild` copies `dist/index.html` to `dist/404.html` (SPA fallback for GitHub-Pages-style hosts).
- `npm run typecheck` — `tsc -b` only.
- `npm run preview` — serve the production build.
- No test runner and no ESLint config. Type errors are the only automated gate.
- **First install / CI:** npm 11 blocks esbuild's postinstall by default (it's pinned in `package.json` `allowScripts`). If a fresh `npm install` warns and Vite then fails to start, run `npm approve-scripts esbuild` and reinstall.

## Deploy

`dist/` is fully static. `vite.config.ts` uses `base: '/'` (domain root, `norterios.com.br`). Client routes need the host to fall back to `index.html` (or `404.html`, which `postbuild` creates). Remote: `github.com/NORTERIOS-DEV/New-site-Norte`, branch `main` — historically updated via GitHub's web upload UI, so pull before pushing. No CI workflow exists yet.

## Encoding

All source is UTF-8 with Portuguese accents (`Publicações`, `Nº`). Preserve UTF-8 on save. Windows PowerShell 5.1 misrenders these as mojibake in the terminal (`PublicaÃ§Ãµes`) — a display artifact, not corruption; use the Read tool for true content.

## Architecture

`src/main.tsx` renders `<RouterProvider>`, imports the global stylesheets, and adds the `js` class to `<html>` unless `prefers-reduced-motion` is set (this class gates the reveal animation, mirroring the legacy behavior where no-JS visitors saw all content).

`src/router.tsx` — routes plus a permanent-style redirect from the legacy `/index.html` URL. `src/components/Layout.tsx` is the shared shell: `<Header>` + `<ScrollManager>` + `<Outlet>` + `<Footer>`.

Routes: `/` (`HomePage`), `/blog` (`BlogPage`), `/blog/:slug` (`BlogPostPage`), `*` (`NotFoundPage`).

### Styling — global CSS, ported near-verbatim (do not convert to CSS Modules)

- `src/styles/tokens.css` — the brand `:root` custom properties (`--paper`, `--green-*`, `--teal-*`, `--orange-*`, `--forest`, `--ink*`, `--maxw`, `--r*`, `--shadow*`, font stacks), copied verbatim from the legacy `<style>`. Restyle by editing these, not literals.
- `src/styles/global.css` — every other rule from the legacy global `<style>` (header, hero, sections, footer, reveal, media queries). The dead `.blog`/`.post` block and the Fraunces font were dropped.
- **Class names in JSX match this stylesheet exactly** (`.pub .pcover img`, `.panel .pside h3`, `.sec-head`, `.reveal`, …). That coupling is deliberate — keep using the legacy class names when editing markup; the CSS is not scoped.

### Legacy inline `<script>` → React

The single IIFE that every legacy page ran is now split into:
- `hooks/useHeaderShadow.ts` — toggles `header.scrolled` past 8px scroll.
- `Header.tsx` — mobile-menu `useState` that toggles `body.nav-open` (+ `aria-expanded`); closes on route change and link click.
- `components/ServiceTabs.tsx` — the `.serv-tabs`/`.panel` tabs (keeps `aria-selected` + `.panel.active`; adds arrow-key navigation).
- `hooks/useRevealRef.ts` + `components/Reveal.tsx` — IntersectionObserver adds `.in` to `.reveal` (same threshold/rootMargin; adds `.in` immediately under reduced motion). `Reveal` is polymorphic via `as=` so the DOM tag matches the legacy markup.
- `components/Marquee.tsx` — renders its `items` twice for the seamless loop (once under reduced motion).
- Footer year is `new Date().getFullYear()` inline.
- `hooks/usePrefersReducedMotion.ts` backs the motion checks.

### Content model — `src/data/`

- `services.ts` — the 4 service areas (`adm`/`ped`/`fin`/`sis`) rendered by `ServiceTabs`.
- `contact.ts` — phone, WhatsApp message presets, `waLink(msg)`, emails, Instagram, Maps URL, `formadoresUrl`.
- `site.ts` — brand strings, `navItems`, `siteUrl`.
- Marketing copy for the other home sections is inline in `src/sections/*` (not repeated, so not worth a data file).

### SEO / head

`components/Seo.tsx` sets `<title>`, `<meta name="description">` and `<link rel="canonical">` per route via an effect (no helmet dependency). The root `index.html` carries the defaults plus favicon and the Google Fonts link (Quicksand + Nunito Sans).

### Assets / SVG

- `components/LogoWordmark.tsx` (header) and `components/LogoMark.tsx` (footer, was `<symbol id="nr-mark">`) hold the logo SVG as JSX.
- `components/icons.tsx` — the small 24×24 stroke icons that recurred throughout the legacy markup.

### Navigation / anchors

Nav links resolve to `#anchor` on the home route and `/#anchor` elsewhere; `ScrollManager` scrolls to the hash target (or top) on every navigation. Preserved element ids: `top`, `sobre`, `servicos`, `contato`, `adm`/`ped`/`fin`/`sis`.

### External integrations

All client-side links, no backend: WhatsApp (`wa.me/5591993354210` with prefilled `text=`), Instagram (`@norterios.oficial`), Google Maps (office address). The formador application form is a separate host (`formadores.norterios.com.br`).
