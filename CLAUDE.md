# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Norte Rios institutional site: a Django REST backend (`norterios_site_backend/`) for a blog API, paired with a Vite+React frontend (`New-site-Norte/`). **These are two independently git-tracked projects** (each has its own `.git`) living side by side under this ungit-tracked parent directory — not a true monorepo. There is no root package.json/Makefile; the only thing that ties them together is the root `docker-compose.yml` + `.env`. The frontend has its own `New-site-Norte/CLAUDE.md` — read that when working there; this file covers the backend and the root-level orchestration.

`docs/` holds ad-hoc Portuguese planning notes for the blog feature (`blog-norte-rios-contexto-tecnico.md` is the original design doc; `ideias.md`/`observações.md` are open questions/TODOs, not settled facts).

## Running the stack

```
docker compose up -d          # db (Postgres 16, :5442), minio+minio-init (:9002/:9003), web (Django, :8001->8000)
```

`web` runs `python manage.py runserver` in the container (see `norterios_site_backend/Dockerfile`) — a dev server, not gunicorn, even though gunicorn/whitenoise are in requirements.txt. There's no production entrypoint wired up yet.

**Two `.env` files exist and are easy to confuse:**
- Root `.env` (next to `docker-compose.yml`) — this is the one Docker actually loads (`env_file: .env` in `docker-compose.yml` resolves relative to the compose file, i.e. repo root).
- `norterios_site_backend/.env` — only read if Django is run locally outside Docker (`BASE_DIR/.env`); ignored by the dockerized `web` service.

Keep both in sync manually if you touch shared values (e.g. `CORS_ALLOWED_ORIGINS`) — Django settings fall back to it only when the corresponding OS env var isn't already set.

**Env var changes require recreating the container, not just restarting it** — `env_file` values are baked in at container creation:

```
docker compose up -d --force-recreate web
```

There's also a stray Python 3.14 `venv/` at the repo root with the backend's dependencies installed into it, but no root-level `requirements.txt` and nothing references it — it doesn't match the Dockerfile's `python:3.12-slim` base and isn't part of the real dev flow. Use `norterios_site_backend/requirements.txt` with a venv created *inside* `norterios_site_backend/` if you need to run Django outside Docker.

Frontend dev server: `npm run dev` in `New-site-Norte/` (port 5173, Vite default). It reads `VITE_API_BASE_URL` from `New-site-Norte/.env.development` (currently `http://localhost:8001/api`, matching the Docker-mapped backend port). Root `.env`'s `CORS_ALLOWED_ORIGINS` must match wherever the frontend actually runs, or `/api/*` fetches fail with a CORS error in the browser despite the backend returning 200.

## Backend architecture (`norterios_site_backend/`)

Django 6.1 + DRF project, single app: `blog`.

- **Models** (`blog/models.py`): `Categoria` (nome, slug) and `Post` (titulo, slug — auto-generated from titulo with collision suffixing in `save()`, resumo, `conteudo` as a `CKEditor5Field`, `imagem_capa` uploading to `blog/capas/%Y/%m/`, `autor` FK to the user model (`PROTECT`), `categoria` FK (`SET_NULL`), `status` rascunho/publicado, `data_criacao`/`data_atualizacao` auto timestamps, `data_publicacao` auto-set to now on first publish). Default ordering `-data_publicacao, -data_criacao`.
- **Views** (`blog/views.py`): `PostViewSet` and `CategoriaViewSet`, both `ReadOnlyModelViewSet` (list/retrieve only — no write API; all authoring happens via Django Admin). `PostViewSet` filters the public queryset to `status=publicado` AND `data_publicacao <= now` (drafts and future-scheduled posts are hidden), supports `?categoria=<slug>`, and swaps in `PostDetailSerializer` (adds `conteudo`) vs `PostListSerializer` (summary only) based on action.
- **Pagination**: global `PageNumberPagination`, `PAGE_SIZE=10`, set in `settings.py` `REST_FRAMEWORK` — not per-view.
- **URLs**: DRF `DefaultRouter` in `blog/urls.py`, mounted at `/api/` → `GET /api/posts/`, `GET /api/posts/<slug>/`, `GET /api/categorias/`, `GET /api/categorias/<pk>/`, plus the DRF browsable root at `/api/`. Project-level `urls.py` also wires `/admin/` and `/ckeditor5/` (CKEditor's own upload endpoint).
- **Admin** (`blog/admin.py`): prepopulated slugs, list filters on status/categoria, and `PostAdmin.save_model` auto-assigns `request.user` as `autor` when unset. This is the only content-authoring surface right now (no write API).
- **File storage**: `django-storages` + MinIO (S3-compatible) for both `imagem_capa` and CKEditor inline images — nothing is written to local disk/`MEDIA_ROOT` in this setup.
- **CORS**: `django-cors-headers`, `CORS_ALLOWED_ORIGINS` read from env (see the `.env` gotcha above).
- **Migrations**: only `blog/migrations/0001_initial.py` exists so far — the models above are the entire current schema.
- **Tests**: `blog/tests.py` is empty Django boilerplate; no tests exist yet. Standard Django test runner applies: `python manage.py test` / `python manage.py test blog` / `python manage.py test blog.tests.SomeTestCase.test_method` (no pytest-django in requirements.txt).

Common commands (inside the `web` container, e.g. `docker compose exec web <cmd>`, or locally with a venv in `norterios_site_backend/`):

```
python manage.py migrate
python manage.py createsuperuser
python manage.py test
```

Django admin: `http://localhost:8001/admin/` (via Docker).
