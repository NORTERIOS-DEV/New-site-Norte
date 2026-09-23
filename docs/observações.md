## dúvidas

A página do blog e publicações são paginas diferentes com propósitos diferentes ou a página de publicações é a página de blog mas precisa ser modificada?

A Página "/edital-002-2026.html" ainda deve continuar nessa nova versão

O blog "Edu Norte" com aqueles 3 posts deve ser criado do zero, separado de "Publicações"?

Ou "Publicações" deveria ser expandido/renomeado para acumular as duas funções (editais + posts de blog)?

Você tem o conteúdo completo dos 3 posts (só os títulos aparecem na copy) ou isso também precisa ser levantado?

qual é o espaço de armazenamento do servidor?

vai ser publicado muitos posts do blog?

## estrutura do projeto

Um app blog com modelos Post, Categoria, Tag (se precisar), com campos tipo título, slug, conteúdo (rich text), imagem de capa, autor, data de publicação, status (rascunho/publicado).

Use o Django Admin como CMS — isso é o maior ganho aqui. Você não precisa construir um painel de gerenciamento de conteúdo do zero; o admin do Django já resolve create/edit/delete/publish com autenticação pronta. Adicione um editor rich text tipo django-ckeditor ou django-tinymce pra quem for escrever os posts não precisar mexer em HTML.

Banco de dados: PostgreSQL (via Docker, já que vocês usam Docker).

Armazenamento de arquivos (imagens dos posts):

S3 via django-storages. MinIO é uma boa pedida se vocês querem manter tudo self-hosted em Docker, sem depender de conta AWS.

Docker: container separado pra Django+Gunicorn, container pra Postgres, container opcional pra Nginx servindo estático/proxy reverso pro Django. Um docker-compose.yml simples já cobre isso pra começar.

### páginas a adicionar

galeria de fotos