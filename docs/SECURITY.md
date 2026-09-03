# Segurança da MS Empreendimentos

Revisão: 02/09/2026. Escopo: site institucional atual e requisitos para as futuras áreas de clientes e parceiros. Não é uma certificação nem um teste de invasão.

## Situação atual

- Sites em acesso privado: somente o proprietário; nenhum grupo ou visitante externo autorizado. Convites externos indisponíveis nesta conta, conforme configuração consultada em 02/09/2026.
- Página estática Next.js, sem cadastro, senha própria, banco de clientes, recebimento de arquivos ou API de escrita. O formulário monta uma mensagem que o visitante revisa no WhatsApp.
- A versão produz um Worker ESM pequeno que aplica a CSP por cabeçalho HTTP, bloqueia métodos de escrita e serve somente os caminhos gerados pelo site institucional. Não executa o servidor Next/OpenNext.
- A hospedagem entrega arquivos estáticos antes do Worker. Para garantir os cabeçalhos, o pacote institucional contém seus recursos no próprio Worker, sem diretório estático público que contorne as regras. A compilação verifica a integridade de cada recurso e impõe um limite de tamanho; uma expansão grande exige reavaliar essa distribuição.
- CSP permite scripts locais, hashes exatos do JavaScript gerado e um nonce criptográfico novo por resposta HTML para compatibilidade com a detecção de robôs da Cloudflare. Não permite `unsafe-inline` em scripts nem `unsafe-eval`. Estilos inline são necessários para Framer Motion e Swiper. Frames ficam limitados à própria origem e ao Google Maps.
- Cabeçalhos: `nosniff`, `no-referrer`, política de permissões restritiva, `private, no-store`, HSTS e `noindex, nofollow`. A diretiva `frame-ancestors` permite apenas o próprio site e o ChatGPT. O export em disco possui CSP meta para uso estático; a resposta publicada remove essa meta e aplica a política por cabeçalho, evitando conflito com o nonce usado pela CDN.
- Testes de segurança integram a compilação. A inspeção de segredos é heurística; não substitui investigação do histórico completo ou rotação de credenciais quando houver vazamento.
- A compilação limpa os diretórios gerados antes de produzir o pacote, evitando republicar scripts antigos deixados por uma versão anterior.
- Códigos de erro no Worker não incluem nome, URL, IP, cookies, credenciais ou pilha de erro. Os logs da infraestrutura são administrados pelo provedor.
- `npm audit` em 02/09/2026 retornou zero vulnerabilidades conhecidas, considerando a árvore instalada e a base consultada.
- Um lembrete de revisão já existe no ChatGPT. Lembrete não equivale a monitoramento automático de disponibilidade, invasões ou dependências.

## Proteção administrativa que depende do proprietário

Ativar MFA na conta usada para administrar o Sites, guardar os meios de recuperação em local seguro e revisar sessões/dispositivos autorizados. A integração disponível não permite ativar MFA, visualizar códigos de recuperação ou certificar essa configuração. Não colocar códigos ou senhas neste repositório.

WAF, mitigação de DDoS, limites globais por IP/conta, alertas contínuos e a retenção de logs dependem dos recursos do provedor. Não foram configurados por este código; não apresentar proteção de hospedagem não verificada como concluída.

## Futuras áreas: requisitos de acesso

Os perfis abaixo são a especificação para a próxima fase, não funcionalidades ativas. Não criar login ilustrativo, guardar senha no navegador ou usar uma seleção de perfil como autorização.

| Perfil | Leitura autorizada | Alterações autorizadas | Restrição |
| --- | --- | --- | --- |
| Cliente | Seus próprios contratos, documentos e obras vinculadas | Seus dados permitidos e solicitações | Nunca consultar dados de outro cliente |
| Corretor | Imóveis liberados e leads explicitamente atribuídos | Acompanhamento desses leads e propostas permitidas | Sem acesso geral a clientes, documentos ou financeiro |
| Prestador de serviço | Ordens de serviço e obras explicitamente atribuídas | Andamento e comprovantes do serviço autorizado | Sem acesso à carteira de clientes ou contratos comerciais |
| Administração | Recursos necessários à gestão, com atribuição explícita | Aprovar/revogar acessos e administrar vínculos | MFA obrigatório, auditoria e menor privilégio |

Antes de ativar qualquer área:

1. Definir e conectar um provedor de autenticação compatível com usuários externos. Reavaliar o acesso da hospedagem, mantendo o site privado até decisão explícita do proprietário. O login sozinho não libera convites atualmente indisponíveis.
2. Persistir identidade, situação ativa/revogada, perfil e vínculos em banco no servidor. Negar acesso por padrão. Validar a permissão e o vínculo em **cada** consulta, alteração e download. Nunca confiar em parâmetros ou cabeçalhos enviados pelo navegador para atribuir perfil.
3. Exigir MFA para administração, prever recuperação de conta, expiração/revogação de sessões e limitação de tentativas. Usar cookies `HttpOnly`, `Secure` e `SameSite` adequados à integração; não armazenar tokens de longa duração no navegador.
4. Validar todos os dados no servidor, usar consultas parametrizadas, verificar origem/CSRF para escrita e impedir elevação de privilégio. Limites devem ser duráveis/geridos pelo provedor, não contadores apenas em memória.
5. Guardar documentos em armazenamento privado, nunca em `public/`, no export estático ou em URLs permanentes públicas. Autorizar cada download; validar tamanho, tipo real e finalidade de uploads; realizar verificação de arquivos antes da disponibilização.
6. Criar trilha de auditoria de acesso, alteração de permissões e downloads sem registrar conteúdo sigiloso. Definir retenção, revisão e alerta de eventos relevantes.
7. Implementar cópias independentes e criptografadas de banco/documentos, acesso restrito, prazo de retenção e ensaio real de restauração. O histórico do código não é backup de dados futuros.
8. Testar duas contas de clientes, um corretor, um prestador e um administrador: acesso cruzado por ID/URL, revogação, sessão expirada, CSRF, arquivo não autorizado, recuperação e limites. Publicar as áreas apenas com esses testes aprovados.

## Recuperação do site institucional

O repositório do Sites e as versões publicadas conservam código, logo e imagens. Antes de cada publicação, salvar a fonte exata e conservar a versão funcional anterior. Para voltar ao serviço, selecionar uma versão anteriormente validada, confirmar novamente o acesso privado e republicar essa versão via Sites.

Para reconstruir em um diretório vazio: obter a revisão desejada do repositório, executar `npm ci`, `npm run security:audit`, `npm run build` e empacotar pelo fluxo do Sites. Não copiar `.env`, tokens, diretórios de dependências ou arquivos pessoais para o pacote público. O ensaio de recuperação verifica os arquivos restaurados e reconstrói a aplicação em checkout isolado; a publicação anterior não é alterada durante o ensaio.

Ensaio executado em 02/09/2026: checkout isolado, instalação pelo lockfile e reconstrução concluídos; 13 testes passaram e todos os arquivos da pasta de imagens/logo coincidiram por SHA-256. Restauração da aplicação verificada sem alterar a versão publicada durante o ensaio.

## Referências

- [OWASP — autorização e menor privilégio](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP — autenticação](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP — proteção contra CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Cloudflare — cabeçalhos de conteúdo estático](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Cloudflare — detecção JavaScript e CSP com nonce](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/)
