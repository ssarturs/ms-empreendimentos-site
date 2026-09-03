# MS Empreendimentos

Código do site institucional, com preparação para hospedagem na Vercel.

## Estado

- Migração em preparação; este repositório não confirma uma publicação na Vercel.
- Confirmar Artur como Owner na Vercel e configurar a proteção de acesso antes da primeira publicação.
- Não alterar o domínio nem excluir o site atual antes de validar a nova hospedagem.

Consulte `docs/VERCEL-MIGRATION.md` para os requisitos e a validação.

## Comandos

- `npm ci`: instalar dependências pelo arquivo de versões.
- `npm run test:vercel`: testes da configuração de migração.
- `npm run build:vercel`: preparar o pacote Vercel, com `MS_SITE_ORIGIN` ou `VERCEL_URL` definidos; não publica.

O site continua sendo institucional, sem banco de clientes ou painel administrativo interno.
