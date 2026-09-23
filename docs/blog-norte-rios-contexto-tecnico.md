# Blog Dinâmico — Norte Rios: Documento de Contexto Técnico

## 1. Contexto do projeto

O site institucional da Norte Rios (norterios.com.br) já teve seu frontend migrado para **React**. A copy original do site previa uma seção de **Blog** ("Edu Norte") com posts editoriais, que hoje não existe implementada — o que existe atualmente (`/publicacoes.html`, na versão anterior estática) é uma seção de **editais e comunicados oficiais**, com propósito diferente.

Esta é a próxima etapa: implementar um **sistema de blog dinâmico**, com backend próprio para gerenciamento de conteúdo, separado da seção de publicações/editais.

## 2. Stack definida

| Camada | Tecnologia |
|---|---|
| Backend / API | Django + Django REST Framework (DRF) |
| Frontend | React (já migrado) |
| Banco de dados | PostgreSQL |
| Armazenamento de arquivos | S3/MinIO via `django-storages` |
| Editor de conteúdo | django-ckeditor ou django-tinymce (rich text no Admin) |
| Infraestrutura | Docker / docker-compose |

## 3. Conceito geral de como o blog funciona

Um blog é essencialmente um sistema de CRUD de conteúdo com dois públicos distintos:

- **Quem escreve/gerencia** → acessa uma área administrativa (Django Admin)
- **Quem visita o site** → acessa uma área pública (React, consumindo API)

### Fluxo completo

```
[Quem escreve] → acessa /admin (Django Admin)
              → cria um Post no banco (PostgreSQL)
              → faz upload da imagem (vai pro storage: disco/S3)

[Visitante]   → acessa norterios.com.br/blog (React)
              → React faz fetch em /api/posts/
              → Django responde com JSON: [{titulo, slug, resumo, imagem_url, ...}, ...]
              → React renderiza a lista de cards

[Visitante]   → clica num post → vai pra /blog/a-gestacao
              → React faz fetch em /api/posts/a-gestacao/
              → Django responde com o post completo em JSON
              → React renderiza o conteúdo
```

## 4. Peças do sistema

### 4.1. Modelo de dados (o "quê" é armazenado)

Campos esperados para o modelo `Post`:

- `titulo`
- `slug` (URL amigável, ex: `/blog/a-gestacao`, gerado a partir do título)
- `resumo` (usado na listagem, tipo preview)
- `conteudo` (rich text / HTML, editado via CKEditor/TinyMCE)
- `imagem_capa`
- `autor`
- `categoria` / `tags` (opcional, avaliar necessidade)
- `status` (rascunho / publicado)
- `data_criacao`
- `data_publicacao`

### 4.2. Banco de dados

PostgreSQL guarda os dados estruturados do post (texto, metadados, referências). **Não guarda os arquivos de imagem em si** — apenas o caminho/URL para onde eles estão armazenados.

### 4.3. Armazenamento de arquivos

Duas opções, a decidir conforme necessidade de escala:

- **Docker volume + `MEDIA_ROOT`**: mais simples, adequado se o volume de imagens for pequeno/médio e o servidor tiver disco persistente.
- **S3 / MinIO via `django-storages`**: mais escalável, não depende do disco do servidor, facilita backup e uso de CDN. MinIO é uma opção self-hosted (sem depender de conta AWS), compatível com Docker.

### 4.4. CMS / Admin

O **Django Admin** cobre a interface de gerenciamento sem necessidade de construir telas do zero. Com um editor rich text plugado (CKEditor/TinyMCE), quem escreve os posts consegue formatar texto, inserir imagens no meio do conteúdo, etc., sem mexer em código.

### 4.5. API (ponte entre backend e frontend)

Como o frontend (React) e o backend (Django) são desacoplados, a comunicação acontece via API REST (DRF), retornando JSON.

Endpoints esperados:

- `GET /api/posts/` — lista de posts publicados (paginada)
- `GET /api/posts/<slug>/` — detalhe de um post
- (opcional) `GET /api/posts/?categoria=<x>` — filtro por categoria

**Importante:** a API pública deve retornar **apenas posts com status "publicado"** — rascunhos não devem ser expostos.

### 4.6. Frontend público (React)

- Rota de listagem: `/blog` — cards com título, resumo, imagem de capa e data
- Rota de post individual: `/blog/:slug` — conteúdo completo
- Consumo dos endpoints da API via fetch/axios
- Renderização do conteúdo rich text (HTML vindo do backend) com sanitização adequada

## 5. Pontos de atenção

- **Slug vs ID**: usar slug nas URLs (`/blog/a-gestacao`) em vez de ID numérico, por SEO e legibilidade. Django tem `SlugField` pronto para isso.
- **SEO**: se o React estiver rodando como SPA pura (client-side rendering), a indexação de conteúdo de blog pode ficar prejudicada. Alternativas a avaliar:
  - Migrar a parte do blog para Next.js (SSR/SSG)
  - Configurar meta tags dinâmicas (`react-helmet`)
  - Pré-renderização das páginas de blog (ex: `react-snap`)
  - Se SEO não for prioridade imediata, seguir com SPA simples por ora
- **Paginação**: a listagem de posts não deve trazer tudo de uma vez — implementar paginação na API (ex: 10 posts por página).
- **Sanitização de HTML**: ao renderizar o conteúdo rich text no React (`dangerouslySetInnerHTML` ou equivalente), garantir sanitização para evitar XSS.
- **Separação de contexto**: o blog "Edu Norte" é conceitualmente diferente da seção de "Publicações" (editais/comunicados) — avaliar com o time se ambos devem coexistir como seções distintas ou se um substitui o outro.

## 6. Infraestrutura (Docker)

Containers sugeridos:

- `web` — Django + Gunicorn + DRF
- `db` — PostgreSQL
- `frontend` — build do React servido via Nginx (ou dev server, dependendo do ambiente)
- `nginx` — proxy reverso na frente de backend e frontend
- (opcional) `minio` — se optar por armazenamento de objeto self-hosted

## 7. Próximos passos técnicos

1. Validar com o time se "Blog" e "Publicações" serão seções separadas ou uma vai substituir a outra
2. Definir o modelo de dados final do `Post` (confirmar campos como categoria/tags)
3. Criar o app Django `blog` com os models
4. Configurar Django Admin com editor rich text
5. Implementar serializers e views do DRF
6. Implementar rotas e componentes de listagem/detalhe no React
7. Decidir estratégia de storage de arquivos (volume Docker vs S3/MinIO)
8. Decidir estratégia de SEO (SPA simples vs SSR/pré-renderização)
9. Montar `docker-compose.yml` integrando os serviços
