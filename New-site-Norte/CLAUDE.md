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

Public routes (inside `<Layout>`): `/` (`HomePage`), `/blog` (`BlogPage`), `/blog/:slug` (`BlogPostPage`, lazy — see below), `/galeria` (`GaleriaPage`), `/galeria/:slug` (`GaleriaAlbumPage`), `*` (`NotFoundPage`). Painel routes (outside `<Layout>` — no public header/footer): `/painel/login` and everything under `/painel/*` — see "Painel de gerenciamento de conteúdo" below.

**Code-splitting via router `lazy`**: `blog/:slug` and every `/painel/*` route are registered with `lazy: () => import(...)` instead of a static `element`. This is deliberate, not cosmetic — `BlogPostPage` is the only public page that renders TipTap JSON (via `SafeContent`/`generateHTML`), and the whole `/painel` tree pulls in TipTap's editor, `@dnd-kit/*`, and `react-hook-form`. Keeping those `element`-based imports would put all of that in the main chunk every public page loads (home, blog list, etc.). Adding a new heavy dependency to a page always warrants checking whether it should stay behind a `lazy` route.

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

### Painel de gerenciamento de conteúdo (`/painel/*`)

An authenticated CMS area for editing posts/categorias/autores/galeria without touching Django Admin. Talks to the backend's JWT-authenticated `/api/painel/...` API (see the root `CLAUDE.md`'s "Painel de gerenciamento de conteúdo" section for the endpoints). Everything here is behind `lazy` router imports (see above), so none of it reaches the public bundle.

- **Auth**: `src/context/AuthContext.tsx` wraps the whole app in `main.tsx` (alongside `@tanstack/react-query`'s `QueryClientProvider`). On mount it tries a silent token refresh from a stored refresh token, then loads `/painel/auth/me/`. Exposes `user`, `isAuthenticated`, `isLoading`, `login`, `logout`, and `hasPerm(perm)` (checks `user.permissions`, the Django `app_label.codename` strings from `/me/`) for permission-gated UI.
- **Token storage**: `services/painel/tokenStore.ts`. **HTTP client**: `services/painel/httpClient.ts` — `painelFetch`/`painelFetchJson` inject the Bearer access token and, on a 401, attempt one silent refresh + retry before giving up; `PainelApiError` carries `status` + the parsed JSON error body (DRF field-error shape, e.g. `{"slug": ["..."]}`) so form pages can map it to per-field errors.
- **Per-resource API clients**: `services/painel/{authApi,postsApi,categoriasApi,autoresApi,galeriaApi,uploadsApi}.ts`.
- **Route guarding**: `components/painel/ProtectedRoute.tsx` (redirects to `/painel/login` when unauthenticated) wraps `components/painel/PainelLayout.tsx` (sidebar nav + topbar with the logged-in user's name and a logout button) in the router tree.
- **Pages** (`pages/painel/`): `LoginPage`, `PostsListPage` + `PostFormPage` (react-hook-form + the TipTap editor), `CategoriasListPage`, `AutoresListPage`, `GaleriaListPage` + `AlbumFormPage` (cover/metadata form + bulk photo upload + drag-and-drop reorder).
- **Rich text editor** (`src/tiptap/`, `components/painel/TipTapEditor.tsx` + `TipTapToolbar.tsx`): TipTap v3, schema in `tiptap/extensions.ts` (StarterKit + Image, TextAlign, Placeholder, Table*, and a custom `VideoEmbedEditor` node for YouTube/Vimeo). Content is persisted as TipTap JSON in `Post.conteudo_json` — not HTML. `tiptap/renderExtensions.ts` mirrors the same node schema *without* the React NodeViews, so `@tiptap/react` never has to load on the public site; `SafeContent.tsx` (replaces the old `SafeHtml.tsx`) uses it with `generateHTML()` to render `conteudo_json` to HTML for `BlogPostPage`, falling back to the legacy `conteudo` HTML string when a post predates the editor. `tiptap/videoUrl.ts` parses pasted YouTube/Vimeo URLs into `{provider, videoId}`. **Sanitization**: `SafeContent` runs the generated HTML through DOMPurify with `ADD_TAGS: ['iframe']` (needed for video embeds) but registers a `uponSanitizeElement` hook that strips any `<iframe>` whose `src` doesn't start with `https://www.youtube-nocookie.com/` or `https://player.vimeo.com/` — don't widen `ADD_TAGS`/`ADD_ATTR` for iframes without keeping that origin allowlist, or arbitrary iframe content becomes injectable via post content.
- **Image insertion inside the editor** goes through `POST /api/painel/uploads/imagem/` (generic upload endpoint), not through the resource's own cover-image field.
- **Gallery photo management**: `components/painel/GalleryUploader.tsx` (multi-file upload) and `SortablePhotoGrid.tsx` (`@dnd-kit/core` + `@dnd-kit/sortable` drag-to-reorder, persisted via the album's `fotos/reordenar/` action).
- **Styling**: `src/styles/painel.css` (painel-only chrome — sidebar, topbar, forms, tables) and `src/styles/tiptap.css` (editor content styles) are separate from the public site's `global.css`/`tokens.css` — the "don't convert to CSS Modules, match legacy class names" rule above is specific to the public site's ported stylesheets and doesn't apply to these.
- **New dependencies** for this area: `@tanstack/react-query`, `react-hook-form`, `@dnd-kit/{core,sortable,utilities}`, `@tiptap/{core,react,starter-kit,html,pm,extension-image,extension-placeholder,extension-table,extension-table-row,extension-table-header,extension-table-cell,extension-text-align}`.
