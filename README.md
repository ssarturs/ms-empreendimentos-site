# MS Empreendimentos

Código do site institucional, com build para Cloudflare Workers e Assets.

## Estado

- O build gera os arquivos estáticos em `out/` e o Worker de segurança em `dist/server/index.js`.
- O `wrangler.jsonc` configura o binding `ASSETS` e a execução do Worker antes de servir os arquivos estáticos.

## Comandos

- `npm ci`: instalar dependências pelo arquivo de versões.
- `npm run build`: gerar a exportação estática e o Worker, incluindo as verificações de segurança; não publica.
- `npm run security:check`: executar os testes de segurança e verificar a exportação gerada pelo build.

O site continua sendo institucional, sem banco de clientes ou painel administrativo interno.
