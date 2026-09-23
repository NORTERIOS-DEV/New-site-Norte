# Norte Rios — Site institucional

Site institucional da **Norte Rios · Gestão e Treinamentos em Educação** (Belém-PA),
em português (`pt-BR`). Aplicação **SPA (single-page application)** construída com
React + Vite, convertida a partir de três páginas HTML estáticas (preservadas em
`legacy/` como referência).

## Tecnologias

| Camada | Ferramenta |
|---|---|
| Build / dev server | [Vite](https://vite.dev/) 6 |
| Biblioteca de UI | [React](https://react.dev/) 19 |
| Rotas | [React Router](https://reactrouter.com/) 7 |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) 5.8 |
| Estilos | CSS puro (variáveis CSS com os tokens da marca em `src/styles/`) |
| Fontes | Google Fonts — Quicksand e Nunito Sans |

Não há framework de back-end: todo o conteúdo é estático e os formulários/contatos
apontam para serviços externos (WhatsApp, Instagram, Google Maps e o site de
inscrição `formadores.norterios.com.br`).

## Pré-requisitos

- **Node.js 20 ou superior** (testado com Node 24) e **npm 10+**.
  Verifique com `node --version` e `npm --version`.

## Passo a passo

### 1. Instalar as dependências

```bash
npm install
```

> **npm 11+:** a instalação pode avisar que o script de pós-instalação do
> `esbuild` foi bloqueado. Se o `npm run dev` falhar em seguida, rode uma vez:
>
> ```bash
> npm approve-scripts esbuild
> npm install
> ```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

Abre o servidor de desenvolvimento em **http://localhost:5173** com recarga
automática (HMR).

### 3. Gerar o build de produção

```bash
npm run build
```

Executa a checagem de tipos (`tsc -b`), gera os arquivos estáticos em `dist/` e
cria `dist/404.html` (cópia do `index.html`) para o *fallback* de rotas em
hospedagens estáticas.

### 4. Pré-visualizar o build

```bash
npm run preview
```

Sobe um servidor local servindo o conteúdo de `dist/` (por padrão em
http://localhost:4173), útil para conferir o resultado final antes de publicar.

## Scripts do `package.json`

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Checagem de tipos + build de produção em `dist/` + `404.html` |
| `npm run typecheck` | Apenas a checagem de tipos (`tsc -b`) |
| `npm run preview` | Serve o build de `dist/` localmente |

## Estrutura do projeto

```
index.html            Entrada do Vite (metatags, favicon, fontes)
public/               Arquivos servidos como estão
  docs/              PDFs do edital
src/
  main.tsx           Bootstrap do React + RouterProvider
  router.tsx         Definição das rotas (+ redirects das URLs antigas .html)
  styles/            CSS global: tokens.css (marca), global.css, edital.css
  components/         Layout, Header, Footer, Btn, Reveal, ServiceTabs, ícones...
  hooks/             useHeaderShadow, usePrefersReducedMotion, useRevealRef
  sections/          Seções da home (Hero, Problemas, Sobre, Serviços...)
  pages/             HomePage, PublicacoesPage, EditalPage, NotFoundPage
  data/              Conteúdo em dados: publications.ts, editais.ts, services.ts,
                     contact.ts, site.ts
  assets/            Imagens importadas (capa do edital)
legacy/              Os 3 HTML originais, mantidos só para referência
```

### Rotas

| Caminho | Página |
|---|---|
| `/` | Home |
| `/publicacoes` | Lista de editais e comunicados |
| `/publicacoes/edital-002-2026` | Página do edital (gerada a partir de `src/data/editais.ts`) |

As URLs antigas (`/index.html`, `/publicacoes.html`, `/edital-002-2026.html`)
redirecionam para as novas.

## Como adicionar uma nova publicação

1. Adicione um item ao array em `src/data/publications.ts` (selo, título,
   descrição, datas, imagens de capa e slug).
2. Se a publicação tiver página de detalhe própria, adicione o conteúdo
   estruturado em `src/data/editais.ts` (cronograma, eixos, requisitos,
   documentos etc.) usando o mesmo `slug`.

A listagem em `/publicacoes` e o destaque na home são gerados automaticamente a
partir desses dados.

## Publicação (deploy)

O `dist/` é totalmente estático e pode ser hospedado em qualquer servidor de
arquivos ou CDN. A hospedagem precisa redirecionar rotas desconhecidas para
`index.html` (ou `404.html`, gerado no build) para que as rotas do cliente
funcionem ao acessar uma URL diretamente. `vite.config.ts` usa `base: '/'`
(domínio na raiz).
