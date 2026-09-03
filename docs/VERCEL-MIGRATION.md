# Preparação para Vercel — MS Empreendimentos

Estado: configuração de publicação separada. Não migra, publica, altera DNS,
contrata plano nem cria uma conta administrativa automaticamente.
O site atual no Sites continua com sua identidade e configuração preservadas.

## Verificação realizada em 03/09/2026

- Build Vercel local concluído, com domínio de teste reservado e sem publicação.
- 20 testes locais passaram; os 37 arquivos do pacote foram comparados com a
  exportação original, sem perda de imagens, scripts ou modelo 3D.
- Build Sites também concluído, com seus 14 testes e verificação do Worker.
- Nenhum deploy, mudança de domínio, contratação de plano ou mudança de acesso.
- A integração Vercel aparece instalada, mas não expõe operações nesta sessão;
  proprietário, plano e proteção do projeto Vercel ainda não foram verificados.

## Antes da primeira publicação

1. Confirmar a conta/equipe Vercel correta, com Artur como **Owner**, e um plano
   compatível com uso comercial. Não contratar ou aceitar cobranças sem autorização.
2. Confirmar o repositório GitHub privado correto, sob controle de Artur.
3. Configurar Deployment Protection para cobrir todas as URLs que serão usadas,
   inclusive produção/domínio principal se houver. Proteção somente de previews
   não basta. Revisar membros, visitantes e exceções de acesso.
4. Só publicar depois dessas verificações. `noindex`, repositório privado e CSP
   **não são autenticação**. A proteção do ChatGPT não é exportada com o código.
5. Validar acesso com o proprietário autenticado e com uma sessão sem login;
   verificar HTML, JavaScript, imagens e modelo 3D diretamente.

## Preparação técnica

- Next.js continua usando exportação estática; não há banco ou painel administrativo.
- `npm run build` e `npm run build:sites` mantêm o caminho atual de Cloudflare/Sites.
- `npm run build:vercel` gera `.vercel/output` pelo Build Output API v3, sem Worker
  Cloudflare. `vercel.json` seleciona **Other** (`framework: null`) intencionalmente:
  o Next gera as páginas, e o empacotador local gera rotas e cabeçalhos de segurança.
- Não substituir o preset por Next.js nem apontar o Output Directory para `out`:
  isso contornaria a configuração de segurança do pacote preparado.
- `npm run test:vercel` testa a configuração local; não comprova o comportamento
  da plataforma nem suas permissões. A verificação hospedada permanece obrigatória.
- A instalação usa o `package-lock.json` existente com `npm ci`.
- `.vercel` é ignorado pelo Git; não versionar credenciais nem arquivos `.env`.

## Endereço

`MS_SITE_ORIGIN` é opcional na Vercel quando `VERCEL_URL` está disponível.
Deve conter apenas a origem HTTPS, sem caminho, senha ou parâmetros.
Sem endereço próprio, o build usa a URL atribuída à publicação. Para o domínio
definitivo, definir `MS_SITE_ORIGIN` com o domínio confirmado e reconstruir.

Para um teste local sem publicação (o endereço abaixo não é um site real):

```bash
MS_SITE_ORIGIN=https://ms-migration.example.invalid npm run build:vercel
```

O comando não publica. Sem endereço de destino, o build Vercel para antes de
gerar arquivos, para não levar metadados da hospedagem antiga inadvertidamente.

## Validação antes da mudança de domínio

- Testar `/`, `/quem-somos`, links do WhatsApp, carrossel, mapa e planta 3D.
- Conferir CSP, `nosniff`, HSTS, política de referência, `no-store` e `noindex` nas
  respostas; testar 404 e métodos diferentes de GET/HEAD. A Vercel pode tratar
  certas requisições reservadas antes das regras da aplicação.
- Não liberar scripts de terceiros para corrigir a barra de ferramentas Vercel;
  desativar a barra no projeto se ela conflitar com a CSP restritiva.
- Conferir as imagens sociais no endereço novo, sem dependência do domínio antigo.
- Somente depois apontar os registros de DNS indicados pela Vercel; preservar
  registros de e-mail e outros serviços. Manter o Sites privado para reversão.
- Não excluir o projeto antigo nem abrir o novo ao público sem pedido explícito.

## Futuro painel administrativo

Owner na Vercel administra a hospedagem; não administra cadastros dentro do site.
Login próprio, perfis de clientes/parceiros, dados e documentos privados exigem
uma implementação separada com autorização no servidor.

## Referências oficiais

- https://vercel.com/docs/build-output-api/configuration
- https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication
- https://vercel.com/docs/rbac/access-roles
- https://vercel.com/docs/limits/fair-use-guidelines
