# Valtor — TODO

## Fase 1 — Identidade Visual e Estrutura Base
- [x] Configurar tema global (cores, tipografia Montserrat, variáveis CSS)
- [x] Fazer upload dos logos para CDN e configurar no projeto
- [x] Criar componentes base: Navbar, Footer, LotteryBall, LotteryCard
- [x] Configurar rotas principais no App.tsx
- [x] Configurar integração com API da Caixa (resultados)
- [x] Criar schema do banco de dados (loterias, concursos, usuários, assinaturas, jogos)
- [x] Aplicar migrations no banco de dados

## Fase 2 — Home Page
- [x] Hero section com globo animado e bolas das 3 loterias
- [x] Seção de próximos sorteios (dia, horário, prêmio estimado)
- [x] Seção de últimos resultados (Mega-Sena, Lotofácil, Quina)
- [x] Seção de ferramentas (Gerador, Conferidor, Simulador, Estatísticas)
- [x] Seção Clube Valtor (CTA para assinatura)
- [x] Footer completo com links e informações

## Fase 3 — Páginas de Resultados
- [x] Página resultado Mega-Sena (/mega-sena)
- [x] Página resultado Lotofácil (/lotofacil)
- [x] Página resultado Quina (/quina)
- [x] Componente de resultado com bolas coloridas por loteria
- [x] Histórico de concursos com paginação
- [x] Links para páginas individuais de concursos

## Fase 4 — Ferramentas
- [x] Gerador de jogos unificado (/gerador?loteria=mega-sena|lotofacil|quina)
- [x] Motor de geração com indicadores estatísticos (soma, pares, ímpares, primos, score)
- [x] Controle de camadas de acesso (público: 5 jogos / premium: 100 + filtros)
- [x] Conferidor de apostas (/conferidor)
- [x] Simulador histórico (/simulador)
- [x] Gerador premium com filtros avançados (protectedProcedure)

## Fase 5 — Estatísticas
- [x] Página estatísticas por loteria (/mega-sena/estatisticas, /lotofacil/estatisticas, /quina/estatisticas)
- [x] Números mais sorteados (ranking de frequência)
- [x] Números atrasados (dezenas sem sair)
- [x] Gráficos interativos com Recharts (barras, top 10, bottom 10)

## Fase 6 — Autenticação e Área de Membros
- [x] Login com OAuth Manus (integrado via Navbar)
- [x] Sessão persistente com cookie seguro
- [x] Logout com limpeza de sessão
- [x] Página de planos e preços (/planos)
- [x] Dashboard do clube (/clube)
- [x] Carteira de jogos (/clube/meus-jogos)
- [x] Gerador premium com filtros avançados
- [x] Perfil do usuário (/clube/perfil)
- [x] Gestão de assinatura (/clube/assinatura)
- [ ] Sistema de alertas de resultados por e-mail (Fase 2)

## Fase 7 — Páginas Automáticas e Institucionais
- [x] Páginas individuais de concursos (/mega-sena/concurso/:numero)
- [x] Páginas individuais de concursos (/lotofacil/concurso/:numero)
- [x] Páginas individuais de concursos (/quina/concurso/:numero)
- [x] Página Sobre (/sobre)
- [x] Página de Planos (/planos)
- [x] Termos de Uso (/termos)
- [x] Política de Privacidade (/privacidade)

## Fase 8 — Qualidade e Entrega
- [x] Testes Vitest dos sistemas principais (13 testes passando)
- [x] Responsividade mobile em todas as páginas
- [ ] SEO meta tags dinâmicas em páginas de concursos — pendente
- [ ] Checkpoint final e publicação

## Fase 2 do Produto (Futuro)
- [ ] Sistema de alertas de resultados por e-mail/push
- [ ] Termos de Uso e Política de Privacidade
- [ ] Blog com análises de concursos
- [ ] Bolões online (requer autorização SPA)
- [ ] App Mobile (React Native)
- [ ] Outras loterias (Dupla Sena, Timemania, Dia de Sorte)

## Correções Reportadas
- [x] Logo muito pequeno na Home — aumentar tamanho na Navbar
- [x] Globo de loterias não está funcionando na Home — corrigir componente
- [x] Seção de premiação exclusiva para assinantes na Home (R$ 1.000/semana + R$ 50.000 agosto + R$ 50.000 dezembro)
- [x] Corrigir número de bolas exibidas: Mega-Sena (6), Lotofácil (15), Quina (5) — atualmente mostra apenas 5 em todas
- [x] Logo Valtor real (SVG) na Navbar — atualmente aparece apenas ícone genérico
- [x] Globo de sorteio realista e animado na Home — atualmente mostra bola de bilhar genérica
- [x] Aplicar logo real Valtor (V duplo branco+dourado, texto azul navy) na Navbar usando PNG original via CDN
- [x] Corrigir nome do site de "Clube Loterias" para "Valtor" (título da aba, metadados, package.json, index.html)
- [x] Substituir globo animado por cards de loterias no Hero (nome, acumulado, valor próximo sorteio)
- [x] Seed das 9 loterias no banco (Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete, +Milionária)
- [x] Ajustar slugs para corresponder à API (megasena, lotofacil, quina, lotomania, timemania, duplasena, diadesorte, supersete, maismilionaria)
- [x] LotteryHeroCards exibindo todas as 9 loterias com cores e ícones distintos
- [x] Páginas individuais para Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete e +Milionária
- [x] Navegação atualizada com todas as 9 loterias
- [x] Aumentar logo Valtor na Navbar e adicionar tagline "Onde a matemática encontra a sorte." abaixo
- [x] Corrigir tagline do logo para ficar dentro da Navbar (não vazar abaixo da borda)
- [x] Cards das loterias: mostrar valor previsto próximo sorteio + data/hora do próximo sorteio
- [x] Aumentar logo Valtor na Navbar (maior que o atual)
- [x] Alinhar topo do texto hero "A sorte é aleatória..." com o primeiro card de loteria
- [x] Remover cards da lateral direita do Hero e colocar todos os 9 cards abaixo do texto hero em grid
- [x] Remover LotteryHeroCards do Hero e expandir seção Últimos Resultados para todas as 9 loterias
- [x] Carrossel automático no Hero com cards grandes de cada loteria (valor, concurso, horário, contagem regressiva ao vivo)
- [x] Página institucional /sobre com Missão, Visão, O Inimigo, Proposta de Valor, Transformação e Valores do Valtor
- [x] Adicionar texto manifesto do Valtor no início da página /sobre (antes de Missão e Visão)
- [x] Remover seção "O Inimigo / Posicionamento" da página /sobre
- [x] Remover bloco O Inimigo que ainda aparece na página /sobre e colocar Valores no lugar
- [x] Melhorar página /planos com seção de benefícios, comparativo e CTA final
- [x] Substituir botão "Clube" por "Planos" na Navbar (link para /planos)
- [x] Remover botão "Assinar" da Navbar, manter apenas "Entrar"
- [x] Rota /clube redirecionar para /planos (conteúdo de planos dentro de /clube)
- [x] Criar página /analise com análises estatísticas das loterias (404 atualmente)
- [x] Adicionar campos de perfil ao usuário: telefone, bio, preferências de loteria, opt-in e-mail
- [x] Criar página /perfil com formulário de dados pessoais (nome, e-mail, telefone)
- [x] Criar preferências de notificação por e-mail (quais loterias, horário)
- [x] Implementar sistema de e-mail diário com resultados das loterias (cron job)
- [x] Template de e-mail HTML com resultados do dia
- [x] Adicionar horário 22:00 nas opções de envio de e-mail no perfil (após sorteios das 20h)
- [x] Adicionar todas as 9 loterias no Footer (só tinha Mega-Sena, Lotofácil e Quina)
- [x] Renomear "Mais Saídos" → "Mais Sorteados" e "Mais Frios" → "Menos Sorteados" nos cards de análise
- [ ] Atualizar nome do app para "Valtor" na tela de login do Manus OAuth (VITE_APP_TITLE)
- [x] Botão "Desbloquear Premium" no Gerador deve ficar sempre aceso/ativo e levar para /planos ao clicar
- [x] Bloquear salvamento de jogos na carteira para usuários não-Premium (backend + frontend)
- [x] Corrigir erro "toLocaleDateString of undefined" no Dashboard ao exibir jogos da carteira
- [x] Criar página /ao-vivo com player YouTube (canal Loterias CAIXA) e cronograma de sorteios
- [x] Badge "AO VIVO" pulsante nos cards da homepage quando sorteio estiver acontecendo
- [x] Botão "Assistir ao vivo" substitui "Ver análise" durante o horário do sorteio
- [x] Criar landing page Home completa com hero, resultados, ferramentas, planos e CTA
- [x] Adicionar link "Home" como primeiro item na Navbar
- [x] Criar ferramenta Importador de Jogos: parser de texto/txt com múltiplos jogos da Caixa
- [x] Procedure tRPC para conferir jogos importados contra últimos resultados em lote
- [x] Página /importar com UI de cola/upload, exibição formatada e resultado da conferência
- [x] CTA premium no importador (salvar na carteira requer assinatura)
- [x] Link "Importar Jogos" na Navbar (menu Ferramentas) e no Footer
- [x] API de importação de jogos no Valtor (endpoint REST + procedure tRPC)
- [x] Extensão Chrome Manifest V3: content script para ler jogos da Caixa
- [x] Popup da extensão com botão "Importar para o Valtor" e status de login
- [x] Página /importar como fallback (cola texto / upload .txt)
- [x] Link "Importar Jogos" no menu Ferramentas da Navbar
- [x] Criar página /extensao com gate de assinatura (download só para assinantes do Clube)
- [x] Botão "Baixar Extensão" redireciona para /planos se usuário não for assinante
- [x] Adicionar link da extensão no Footer e na Navbar
- [x] Seção de destaque da extensão Chrome na Home com visual impactante e botão CTA
- [x] Integrar Stripe para pagamentos de R$ 39,90/mês (checkout, webhook, ativar assinatura)
- [x] Criar página /termos com Termos de Uso completos (LGPD)
- [x] Criar página /privacidade com Política de Privacidade completa (LGPD)
- [x] Testes Vitest para Stripe e validações de perfil (25 testes passando)

## Bugs Reportados
- [x] Link "Últimos resultados" no menu de próximos sorteios retorna 404 — corrigido para /megasena
- [x] Links /mega-sena e /resultados no Footer e Home corrigidos para slugs corretos
- [x] Último resultado desatualizado — procedure ultimo agora sincroniza automaticamente com a API quando há concurso mais recente
- [x] Erro "Cannot read properties of undefined (reading 'color')" ao clicar em "Conferir aposta" no /conferidor — corrigido: normalização de slugs (megasena/mega-sena) + suporte a todas as 9 loterias
- [x] Corrigir badge ACUMULADO no card hero — só mostrar quando realmente acumulado
- [x] Transformar card hero em carrossel manual com todas as 9 loterias (setas de navegação + dots)
- [x] Logo do Valtor no Footer aparecendo cortado/quebrado — corrigido usando ValtorLogo component
- [x] Adicionar swipe touch no carrossel do hero para mobile
- [x] Criar página /resultados unificada com último resultado de todas as 9 loterias
- [x] Link "Últimos resultados" na Home agora aponta para /resultados
- [x] Dashboard mostra todas as 9 loterias nos "Últimos Sorteios" + link "Ver todos" para /resultados
- [x] Links do Dashboard corrigidos: /megasena e /megasena/estatisticas (sem hífen)
- [x] Conferidor: modo "Conferir Carteira" adicionado — confere todos os jogos salvos de uma vez
- [x] Rota /mega-sena corrigida em todo o site (Dashboard, Quick Actions, Sidebar)
- [x] Cifrão R$ do valor sobrepõe seta esquerda do carrossel no hero — corrigido: setas movidas para fora do card + padding interno aumentado
- [x] Filtros avançados do Gerador bloqueados mesmo para usuário Premium — corrigido: verifica assinatura via trpc.assinatura.status + filtros funcionais + todas as 9 loterias
- [x] Gerador Premium não retorna jogos quando filtros avançados são aplicados — causa raiz: slugs com hífens (mega-sena) não encontravam loteria no DB (slug canônico: megasena). Corrigido com normalizeSlug() em todas as funções do backend
- [x] Normalização de slugs implementada em todo o backend (db.ts, caixaApi.ts, routers.ts) — remove hífens antes de buscar no banco
- [x] Dados duplicados com hífens na tabela concursos limpos via SQL
- [x] 30 testes Vitest passando (incluindo 5 novos testes de normalização de slugs)

## Carteira de Jogos — Reformulação Completa
- [x] Organizar carteira por loteria com abas/tabs (não misturar loterias)
- [x] Adicionar campo "apostado no próximo sorteio" (toggle) em cada jogo
- [x] Adicionar campo valor da aposta (R$) e concurso apostado
- [x] Adicionar campo valor ganho (R$) para registrar prêmios recebidos
- [x] Gráfico de ROI por loteria (valor investido vs valor ganho)
- [x] Resumo financeiro por loteria (total apostado, total ganho, ROI %)
- [x] Integrar gerador com opção de marcar aposta no próximo sorteio ao salvar
- [x] Preparar dados de apostas ativas para conferência automática por e-mail
- [x] Testes Vitest para novas funcionalidades da carteira (38 testes passando)

## Bugs Reportados (Sessão 4)
- [x] Perfil mostra "Plano: Explorador", "Acesso: Gratuito" e botão "Assinar Premium" mesmo para usuário premium — corrigido: verifica assinatura ativa + campo layer, exibe "Clube Valtor", "✓ Premium Ativo", card "Assinante Premium" com validade

## Estatísticas — Correção de Dados e UI
- [x] Dados de frequência incorretos — corrigido: agora busca histórico completo da API (ex: 2985 concursos Mega-Sena) com cache de 6h
- [x] Exibir quantidade de vezes que cada número foi sorteado ao lado de cada bola (Nx abaixo de cada bola)
- [x] Usar API completa para frequência real (getFullFrequencia com cache no servidor)
- [x] Gerador também atualizado para usar frequências da API completa

## Estatísticas — Validação e Correção (Sessão 5)
- [x] Validar ranking "Menos Sorteados" da Mega-Sena contra dados oficiais — confirmado: dados batem com Valor Investe, InfoMoney e Banda B
- [x] Verificar se estatísticas funcionam para todas as 9 loterias — todas OK (Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete, +Milionária)
- [x] Dados de frequência corretos — baseados no histórico completo da API (sem necessidade de correção)

## Horários de Sorteio — Correção (Sessão 5)
- [x] Verificar horários oficiais de cada loteria no site da Caixa — desde 03/11/2025 todos os sorteios são às 21h
- [x] Corrigir horários em todo o site (AoVivo.tsx, LotteryGlobe.tsx, LotteryHeroCards.tsx, LotteryCarousel.tsx, caixaApi.ts) — todos de 20h para 21h

## Bugs Reportados (Sessão 6)
- [x] "Painel" no menu do usuário leva para /clube que mostra página de planos — corrigido: /clube agora mostra Dashboard, links Carteira e Configurações também corrigidos
- [ ] Dashboard mobile: sidebar ocupa tela inteira, conteúdo principal não aparece — corrigir layout responsivo
- [ ] Cards do carrossel Hero: falta data do último sorteio, valor do prêmio, número do concurso
- [ ] Contagem regressiva do carrossel mostra mesmo tempo para todas as loterias — deve ser individual por loteria (dias de sorteio diferentes)
- [x] Cards do carrossel Hero: adicionado data do último sorteio ("Último: #2985 (17/03/2026)") e número do próximo concurso
- [x] Contagem regressiva individual por loteria — cada card mostra countdown baseado na data real do próximo sorteio da API

## Política de Privacidade e Aceite (Sessão 7)
- [x] Atualizar página de Política de Privacidade com texto completo LGPD (12 seções + cláusula de aceite)
- [x] Adicionar checkbox obrigatório de aceite (Termos + Privacidade) antes do pagamento no card Premium
- [x] Linkar Termos de Uso e Política de Privacidade no checkbox com target="_blank"
- [x] Não permitir continuar sem marcar o checkbox (botão desabilitado + toast de erro)
- [x] CTA final da página de Planos também exige aceite (botão desabilitado + aviso)
- [x] Declaração de maior de 18 anos incluída no texto do checkbox

## Bug Lotofácil — data.map is not a function (Sessão 7)
- [x] Corrigido fetchAllConcursos: validação de tipo (Array.isArray) antes de .map()
- [x] Adicionado fallback para API da Caixa quando API primária falha
- [x] Tratamento de resposta como objeto único (quando API retorna apenas último concurso)
- [x] 45 testes Vitest passando (7 novos testes para fetchAllConcursos, concursos e estatísticas)

## Cards Grandes do Carrossel Hero (Sessão 8)
- [x] Mostrar data do próximo sorteio no card grande do carrossel (ex: "Sexta-feira, 19/03 às 21h")
- [x] Mostrar número do próximo concurso no card grande do carrossel (ex: "Concurso #2986")
- [x] Contagem regressiva individual por loteria (fiel à data e horário real de cada sorteio, baseada na API)
- [x] Barra de contagem regressiva integrada ao card (não separada abaixo)
- [x] Removido NextDrawBanner genérico (horário fixo 20h) — substituído por countdown individual dentro do card
- [x] Último concurso exibido no card (ex: "Último: #2985 (17/03/2026)")
- [x] Horário corrigido de 20h para 21h

## Score do Gerador — Explicação para o Usuário (Sessão 8)
- [x] Popover no badge Score (click no desktop, toque no mobile) com barra de progresso e critérios
- [x] Explicação dos critérios: pares/ímpares, frequência histórica, soma das dezenas, números primos
- [x] Seção explicativa permanente "Como funciona o Score?" com 4 cards + faixas de score (0-49, 50-74, 75-100)
- [x] Funciona em mobile (Popover do Radix abre como modal em toque)
- [x] Ícone Info (i) adicionado ao badge Score para indicar interatividade
- [x] Disclaimer: "Não é previsão de acerto. Loterias são jogos de azar."

## Bug: Banner Premium visível para assinantes (Sessão 8)
- [x] Esconder banner "Análise Premium" em LotteryStats.tsx para usuários premium
- [x] Esconder banner "Análise Premium" em ConcursoPage.tsx para usuários premium
- [x] Esconder banner "Análise Premium" em Simulador.tsx para usuários premium

## Integração Mercado Pago — Substituir Stripe (Sessão 9)
- [x] Configurar credenciais Mercado Pago (Access Token teste e produção) via webdev_request_secrets
- [x] Instalar SDK mercadopago v2 no backend
- [x] Criar endpoint de checkout (Checkout Pro) com Preference API
- [x] Plano Mensal: R$ 47,80 (pagamento único mensal)
- [x] Plano Anual: R$ 429,60 à vista (economia de R$ 144,00 = 25%)
- [x] Webhook /api/mercadopago/webhook para confirmação automática de pagamento
- [x] Ativar assinatura premium após pagamento aprovado (createMPSubscription no db.ts)
- [x] Redesenhar página de Planos: 3 cards (Gratuito, Mensal, Anual destaque), badges Pix/Cartão/Boleto, seção economia 25%
- [x] Aceitar Pix, cartão de crédito/débito e boleto via Mercado Pago
- [x] Checkout Stripe substituído por Mercado Pago no routers.ts
- [x] 49 testes Vitest passando (16 testes de checkout/assinatura/perfil/importar + webhook)
- [x] FAQ atualizado com informações sobre Pix e planos mensal/anual
- [x] Checkbox de aceite centralizado abaixo dos 3 cards
- [x] CTA final com botões para plano anual (destaque) e mensal

## Reestruturar Planos — 2 Produtos (Sessão 10)
- [x] Redesenhar página: 2 cards (Explorador gratuito + Clube Valtor premium)
- [x] Clube Valtor com toggle interno: Parcelado 12x R$47,80 (R$573,60) vs À Vista R$429,60 (25% OFF)
- [x] Marketing: seção economia verde, badge 25% OFF, preço riscado R$573,60
- [x] Backend atualizado: planos "parcelado" e "avista" com installments no Mercado Pago
- [x] Card "Mensal" removido — toggle dentro do Clube Valtor
- [x] FAQ atualizado com informações sobre parcelamento vs à vista
- [x] CTA final com botões para à vista (destaque) e parcelado
- [x] 49 testes Vitest passando

## Logo maior na Navbar (Sessão 11)
- [x] Logo recortada (removido espaço em branco de 2528x1696 para 1958x536px)
- [x] Upload da imagem recortada para CDN
- [x] ValtorLogo com prop size (sm/md/lg) — Navbar usa md (48px)
- [x] Logo visivelmente maior com tagline legível

## SEO Completo — www.valtor.com.br (Sessão 11)
- [x] Hook useSEO para meta tags dinâmicas por página (title, description, OG, Twitter)
- [x] Open Graph tags (og:title, og:description, og:image) para compartilhamento social
- [x] Twitter Card tags (summary_large_image)
- [x] robots.txt com sitemap apontando para www.valtor.com.br
- [x] sitemap.xml dinâmico com todas as 30+ rotas (loterias, estatísticas, concursos, ferramentas)
- [x] Dados estruturados Schema.org (WebSite + Organization + SearchAction)
- [x] Títulos dinâmicos em 13 páginas: Home, Resultados, LotteryResults, LotteryStats, ConcursoPage, Gerador, Conferidor, Simulador, Analise, AoVivo, Planos, Sobre, Extensao, Termos, Privacidade
- [x] Canonical URLs com domínio www.valtor.com.br
- [x] Endpoint /sitemap.xml no servidor Express
- [x] index.html com meta tags padrão (fallback para páginas sem SEO específico)
- [x] HelmetProvider configurado no main.tsx
- [x] 49 testes Vitest passando

## Webhook Mercado Pago — Erro 500 (Sessão 12)
- [x] Corrigir erro 500 no webhook do Mercado Pago (teste de notificação falha)
- [ ] Corrigir loop de login OAuth — ao tentar logar com outra conta, fica em loop e volta para a mesma tela

## Homologação Mercado Pago — Plano Teste R$ 1,00 (Sessão 13)
- [x] Criar plano temporário "teste" no backend (R$ 1,00, 1 mês de acesso)
- [x] Adicionar botão "Pagar R$ 1,00 (Teste)" na página de Planos (visível apenas para logados não-assinantes)
- [x] Atualizar webhook para tratar planType "teste" corretamente (1 mês, preço R$ 1,00)
- [x] Adicionar teste Vitest para plano "teste" (52 testes passando)
- [x] Remover plano teste após homologação concluída

## Menu Mobile — Correções (Sessão 14)
- [x] Resultados e Estatísticas como accordion colapsável no menu mobile (abre/fecha ao tocar)
- [x] Adicionar botão "Entrar" no menu mobile (para usuários não logados)
- [x] Adicionar botão WhatsApp (14) 99109-6186 no menu mobile
- [x] Ferramentas como accordion colapsável no menu mobile

## SEO e Estatísticas — Correções (Sessão 15)
- [x] Reduzir palavras-chave da Home de 11 para 5 focadas
- [x] Encurtar meta description da Home para 116 caracteres
- [x] Corrigir estatísticas: retry com 3 tentativas, timeout 2min, não cachear dados incompletos (<50 concursos)

## Correção Lógica de Atraso (Sessão 16)
- [x] Corrigir cálculo de atraso: contar concursos consecutivos sem aparecer a partir do mais recente

## Ajuste Texto Home (Sessão 17)
- [x] Trocar título principal da Home para "Gerador e análise estatística para Lotofácil, Mega-Sena e todas loterias da Caixa."
- [x] Trocar subtítulo para "Gere jogos inteligentes com base em dados reais e aumente suas chances."

## Nova Home + Acesso Parcial (Sessão 18)
- [x] Reescrever Home.tsx — Hero com H1 keywords + subtítulo descritivo
- [x] Reescrever Home.tsx — Bloco de Loterias com 3 links por card (mais sorteados, atrasados, frequência)
- [x] Reescrever Home.tsx — Bloco "O que você quer analisar?" com links buscáveis
- [x] Reescrever Home.tsx — Bloco explicativo "Como a análise funciona"
- [x] Reescrever Home.tsx — Bloco diferenciais reformulado (Carteira, Histórico, Controle Gastos, E-mail)
- [x] Reescrever Home.tsx — Bloco automação "Receba resultados automaticamente"
- [x] Reescrever Home.tsx — FAQ com accordion
- [x] Adicionar FAQ Schema JSON-LD para SEO
- [x] Gate visual em LotteryStats.tsx — top 5 mais sorteados visível sem login (Lotofácil/Mega-Sena)
- [x] Gate visual em LotteryStats.tsx — top 5 mais atrasados visível sem login
- [x] Gate visual em LotteryStats.tsx — amostra frequência (5 números) visível sem login
- [x] Gate visual em LotteryStats.tsx — blur + CTA "Ver análise completa → criar conta grátis" no restante
- [x] Testar mobile e executar Vitest (52 testes passando)

## 4 Páginas SEO Lotofácil (Sessão 19)
- [x] Criar componente reutilizável SEOLandingPage.tsx
- [x] Criar /numeros-atrasados-lotofacil — top 5 público, blur no restante
- [x] Criar /numeros-mais-sorteados-lotofacil — top 5 público, blur no restante
- [x] Criar /frequencia-lotofacil — amostra 5 números, blur no restante
- [x] Criar /resultado-lotofacil-hoje — 100% público sem gate
- [x] CTA ajustado: "Ver todos os números e análise completa → criar conta grátis"
- [x] Registrar 4 rotas no App.tsx
- [x] Adicionar SEO components (title, description, schema) para cada página
- [x] Adicionar URLs ao sitemap
- [x] Executar testes Vitest (52 testes passando)

## E-mails Automáticos — Configuração SMTP Zoho (Sessão 20)
- [x] Configurar variáveis SMTP Zoho Mail (resultados@valtor.com.br)
- [x] Implementar cron job para disparo automático diário (21:30 BRT / 00:30 UTC)
- [x] Testar conexão SMTP (vitest verify) — 54 testes passando

## Correção E-mail (Sessão 21)
- [x] Substituir ícone "V" pelo logo real da Valtor no header do e-mail
- [x] Corrigir "Invalid Date" na data do concurso (formatDate helper com fallback)

## Sitemap Index Organizado por Categoria (Sessão 22)
- [x] Criar sitemap_index.xml dinâmico com sitemaps por categoria
- [x] Sitemap: páginas estáticas (home, sobre, planos, termos, privacidade, etc.)
- [x] Sitemap: loterias (resultados de cada loteria)
- [x] Sitemap: estatísticas (estatísticas de cada loteria)
- [x] Sitemap: ferramentas (gerador, conferidor, simulador, importar, extensão)
- [x] Sitemap: páginas SEO landing (números atrasados, mais sorteados, frequência, resultado hoje)
- [x] Atualizar robots.txt para referenciar sitemap_index.xml

## 32 Landing Pages SEO — Todas as Loterias (Sessão 23)
- [x] Landing pages Mega-Sena: /numeros-atrasados-megasena, /numeros-mais-sorteados-megasena, /frequencia-megasena, /resultado-megasena-hoje
- [x] Landing pages Quina: /numeros-atrasados-quina, /numeros-mais-sorteados-quina, /frequencia-quina, /resultado-quina-hoje
- [x] Landing pages Lotomania: /numeros-atrasados-lotomania, /numeros-mais-sorteados-lotomania, /frequencia-lotomania, /resultado-lotomania-hoje
- [x] Landing pages Timemania: /numeros-atrasados-timemania, /numeros-mais-sorteados-timemania, /frequencia-timemania, /resultado-timemania-hoje
- [x] Landing pages Dupla Sena: /numeros-atrasados-duplasena, /numeros-mais-sorteados-duplasena, /frequencia-duplasena, /resultado-duplasena-hoje
- [x] Landing pages Dia de Sorte: /numeros-atrasados-diadesorte, /numeros-mais-sorteados-diadesorte, /frequencia-diadesorte, /resultado-diadesorte-hoje
- [x] Landing pages Super Sete: /numeros-atrasados-supersete, /numeros-mais-sorteados-supersete, /frequencia-supersete, /resultado-supersete-hoje
- [x] Landing pages +Milionária: /numeros-atrasados-maismilionaria, /numeros-mais-sorteados-maismilionaria, /frequencia-maismilionaria, /resultado-maismilionaria-hoje
- [x] Registrar 32 novas rotas no App.tsx
- [x] Atualizar sitemap-seo.xml com todas as 36 landing pages
- [x] Criar sitemap-concursos.xml dinâmico com últimos 30 concursos por loteria
- [x] Atualizar sitemap_index.xml para incluir sitemap-concursos.xml

## Dashboard Mobile — Correção Layout (Sessão 24)
- [x] Corrigir sidebar que ocupa tela inteira no mobile — overlay com backdrop escuro
- [x] Conteúdo principal do Dashboard visível no mobile
- [x] Testar responsividade em viewport mobile

## Conferidor Automático com Notificação (Sessão 24)
- [x] Backend: autoChecker.ts com lógica de conferência (getAllPendingBets → compare → batchUpdate)
- [x] Backend: identificar acertos (quantos números bateram) por aposta
- [x] Backend: atualizar campo conferido=true e acertos no banco em lote
- [x] Template de e-mail HTML com números destacados (acertos em cor da loteria, resultado do sorteio)
- [x] Cron job às 22:30 BRT (01:30 UTC) — 1h30 após sorteios das 21h
- [x] Enviar e-mail individual para cada usuário com apostas conferidas (respeita emailOptIn)
- [x] Endpoint admin trpc.autoChecker.executar para disparar manualmente
- [x] 5 testes Vitest para conferidor automático (59 testes passando)

## Painel Admin (Sessão 25)
- [ ] Criar endpoints tRPC admin: métricas gerais (total usuários, assinantes, apostas)
- [ ] Criar endpoint admin: lista de usuários com filtros e busca
- [ ] Criar endpoint admin: cadastros por dia (gráfico de crescimento)
- [ ] Criar endpoint admin: apostas e conferências recentes
- [ ] Criar endpoint admin: receita e assinaturas ativas
- [ ] Criar página AdminDashboard com cards de métricas (KPIs)
- [ ] Criar tabela de usuários com busca, filtro por role/plano
- [ ] Criar gráfico de crescimento de cadastros (últimos 30 dias)
- [ ] Criar seção de apostas/conferências recentes
- [ ] Criar seção de receita e assinaturas
- [ ] Registrar rota /admin no App.tsx (protegida por role=admin)
- [ ] Testes Vitest para endpoints admin

## Painel Admin (Sessão 26)
- [x] Criar endpoints tRPC admin-only: overview, users, signupsByDay, recentActivity, revenue
- [x] Criar funções de banco: getAdminOverview, getAdminUsersList, getAdminSignupsByDay, getAdminRecentActivity, getAdminRevenue
- [x] Criar página /admin com 5 KPI cards (Total Usuários, Assinantes Ativos, Apostas, Concursos, Receita Mensal)
- [x] Gráfico de barras de cadastros nos últimos 30 dias
- [x] Seção de receita e assinaturas (Receita Total, MRR, assinaturas recentes)
- [x] Tabela de usuários com busca, paginação, badges de plano/role
- [x] Lista de últimos cadastros com avatar e dados
- [x] Lista de apostas recentes com status de conferência
- [x] Botões admin: "Conferir Apostas" e "Disparar E-mails" com feedback via toast
- [x] Proteção admin-only em todos os endpoints (ctx.user.role !== "admin" → FORBIDDEN)
- [x] Rota /admin registrada no App.tsx
- [x] Testes Vitest para todos os 5 endpoints admin (10 testes: 5 positivos + 5 de rejeição para não-admin)
- [x] 70 testes Vitest passando (59 anteriores + 11 novos)

## Correção SEO Completa — Auditoria (Sessão 27)
- [x] CRÍTICO: Corrigir robots.txt para apontar para /sitemap.xml (não sitemap_index.xml que retorna 404)
- [x] CRÍTICO: Corrigir canonical URL nas landing pages (aponta para / em vez da própria página)
- [x] CRÍTICO: Corrigir hook useSEO para atualizar description, canonical e OG tags corretamente em cada página
- [x] MÉDIO: Remover meta tags duplicadas do index.html (estáticas conflitam com dinâmicas do useSEO)
- [x] MÉDIO: Corrigir URLs no sitemap para usar www.valtor.com.br (consistência com canonical)
- [x] MENOR: Remover /admin do sitemap (página privada)
- [x] MENOR: Remover páginas bloqueadas no robots.txt do sitemap (/clube, /perfil, /importar)
- [x] MENOR: Adicionar schemas WebSite e Organization (JSON-LD) na Home
- [x] Verificar e testar todas as correções no navegador

## Blog + Análise de Primos (Sessão 28)
- [x] Adicionar seção "Primos vs Não-Primos" nas páginas de estatísticas de cada loteria
- [x] Calcular distribuição de primos por concurso (média, frequência de cada primo)
- [x] Criar infraestrutura do blog (rota /blog, página de listagem, página de artigo)
- [x] Criar 5 artigos SEO focados em Mega-Sena e Lotofácil
- [x] Adicionar blog na navegação (Navbar) e no sitemap
- [x] SEO completo para cada artigo (meta tags, canonical, schema Article)
- [x] Testes Vitest para blog e primos (85 testes passando)

## Blog — Artigos das 7 Loterias Restantes (Sessão 29)
- [x] Artigo: Quina — números mais sorteados e estratégias
- [x] Artigo: Lotomania — como funciona e dicas estatísticas
- [x] Artigo: Timemania — análise completa e time do coração
- [x] Artigo: Dupla Sena — duas chances de ganhar, vale a pena?
- [x] Artigo: Dia de Sorte — mês da sorte e números frequentes
- [x] Artigo: Super Sete — a mais nova loteria da Caixa
- [x] Artigo: +Milionária — a loteria dos milhões, como jogar
- [x] Atualizar sitemap-blog.xml com novos artigos (automático via shared/blogArticles.ts)
- [x] Testes Vitest atualizados (mínimo 12 artigos, 85 testes passando)

## Blog — Maiores Prêmios Históricos (Sessão 30)
- [x] Pesquisar maiores prêmios de cada loteria (Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete, +Milionária)
- [x] Adicionar seção "Maiores Prêmios da História" no final de cada artigo
- [x] Testes e verificação (85 testes passando)

## Bug: E-mail com resultado desatualizado (Sessão 31)
- [x] BUG: E-mail enviado em 20/03 mostra Mega-Sena concurso #2985 (17/03) em vez do resultado sorteado hoje (20/03)
- [x] Investigar lógica de busca de resultados no cron de e-mails
- [x] Corrigir para buscar sempre o resultado mais recente da API da Caixa (syncUltimoConcurso antes de enviar)
- [x] Testar e verificar (85 testes passando)

## Bug CRÍTICO: Sitemap retorna HTML em vez de XML (Sessão 32)
- [x] BUG: Google Search Console indica sitemap em HTML — 0 páginas indexadas
- [x] Investigar por que o sitemap está sendo servido como HTML (require() não funciona em ESM, causava erro 500 no sitemap-blog.xml)
- [x] Rotas de sitemap já retornam XML puro com content-type: application/xml (corrigido import ESM)
- [x] Incluir todas as rotas públicas: 144 URLs (8 páginas + 9 loterias + 9 estatísticas + 4 ferramentas + 36 SEO + 65 concursos + 13 blog)
- [x] Gerar sitemap dinamicamente (concursos do DB, artigos do shared/blogArticles)
- [x] Garantir sem autenticação, status 200, sem redirecionamento
- [x] Validar via curl — todos 9 endpoints retornam HTTP 200 + application/xml
- [x] Testes vitest (85 testes passando)

## Sitemap Estático — Correção Definitiva para Produção (Sessão 33)
- [x] Criar script generate-sitemaps.mjs para gerar XMLs estáticos em client/public/ durante o build
- [x] Gerar sitemap.xml, sitemap_index.xml e 7 sub-sitemaps como arquivos estáticos
- [x] Integrar script no build pipeline (roda antes do vite build)
- [x] Verificar que express.static serve os XMLs com content-type application/xml
- [x] Testar build de produção: todos 9 endpoints retornam HTTP 200 + application/xml
- [x] Total: 144 URLs (8 páginas + 9 loterias + 9 estatísticas + 4 ferramentas + 36 SEO + 65 concursos + 13 blog)
- [x] Rotas Express dinâmicas mantidas como fallback (servem dados atualizados do DB para concursos)
- [x] 85 testes Vitest passando

## Sitemap Concursos Dinâmico — Indexação Automática (Sessão 34)
- [x] Remover sitemap-concursos.xml estático do script de build (deixar rota Express dinâmica servir)
- [x] Garantir que rota Express /sitemap-concursos.xml tem prioridade sobre arquivo estático
- [x] Cada novo concurso importado gera automaticamente uma URL no sitemap (sem limit, todos os concursos do DB)
- [x] Implementar ping automático ao Google (sitemap ping) quando novos concursos são sincronizados (cooldown 10min)
- [x] Testar em produção: 144 URLs (8+9+9+4+36+13+65 concursos dinâmicos), todos HTTP 200 + application/xml

## BUG FIX: sitemap-concursos.xml retornava HTML em produção (Sessão 34b)
- [x] Causa: plataforma Manus serve arquivos estáticos via CDN antes das rotas Express; sem arquivo estático, o catch-all SPA retornava index.html
- [x] Solução: criar script generate-sitemap-concursos.mjs que consulta o banco no build e gera XML estático
- [x] Script integrado ao build pipeline (roda após generate-sitemaps.mjs, antes do vite build)
- [x] Testado: 25 URLs únicas do banco + fallback com 450 URLs se DB indisponível
- [x] Todos os 9 sitemaps retornam HTTP 200 + application/xml em produção (144 URLs total)

## BUG CRÍTICO: "Concurso NaN" nas páginas de resultado (Sessão 35)
- [x] Investigar causa do NaN no título, H1 e meta description das páginas de resultado — parseInt(params.numero) retornava NaN quando undefined
- [x] Garantir que número do concurso sempre tenha valor válido — validação isValidNumero antes de usar
- [x] Adicionar fallback: "Último concurso" quando número inválido + mensagem "Número de concurso inválido"
- [x] Corrigir title (SEO), heading (H1) e meta description — ConcursoSEO aceita numero opcional
- [x] Validar que nenhuma página exibe "NaN" — testado em dev com concurso válido e inválido

## BUG CRÍTICO: /:loteria/concurso/ultimo não funciona (Sessão 36)
- [x] Implementar lógica para "ultimo" no ConcursoPage — buscar último concurso via tRPC e redirecionar com replace:true
- [x] Redirecionar /lotofacil/concurso/ultimo → /lotofacil/concurso/3640 (número real do banco)
- [x] Funcionar para todas as 9 loterias — testado lotofacil→3640, megasena→2986, quina→6980
- [x] Title, H1 e conteúdo sempre com dados reais (nunca "inválido" ou NaN)
- [x] Sitemap já usa números reais (gerado do banco) — nenhuma URL com /concurso/ultimo

## Atualização de Preço: R$ 39,90 → R$ 47,80 (Sessão 37)
- [x] Encontrar todas as ocorrências de R$ 39,90 / 39.90 / 3990 no código
- [x] Substituir por R$ 47,80 / 47.80 / 4780 em todos os arquivos (Extensao.tsx, LotteryResults.tsx, stripeProducts.ts)
- [x] Verificar também o preço no Stripe (products.ts) — atualizado de 3990 para 4780 centavos
- [x] Testar que nenhuma página exibe o preço antigo — grep confirmou zero ocorrências de 39,90
- [x] 85 testes passando após atualização

## Engine Americana MVP — Mega Millions + Powerball (Sessão 38)

### Banco de Dados
- [x] Criar tabela us_draws (lottery, draw_date, numbers_main, number_special, jackpot, next_jackpot, next_draw_date)
- [x] Criar tabela us_stats_number_main (lottery, number, frequency, last_drawn, delay)
- [x] Criar tabela us_stats_number_special (lottery, number, frequency, last_drawn, delay)
- [x] Gerar migration SQL e aplicar via webdev_execute_sql

### Ingestão de Dados
- [x] Implementar fetch de dados do Powerball via NY Open Data API (gratuita)
- [x] Implementar fetch de dados do Mega Millions via NY Open Data API (gratuita)
- [x] Salvar resultados na tabela us_draws (PB: 1916, MM: 2485)
- [x] Calcular e salvar estatísticas nas tabelas us_stats_number_main e us_stats_number_special
- [x] Criar rota admin para trigger manual de sync

### Backend (tRPC)
- [x] Rota pública: último resultado de cada loteria
- [x] Rota pública: histórico de resultados (paginado)
- [x] Rota pública: estatísticas (mais sorteados, menos sorteados, mais atrasados, frequência completa)
- [x] Rota pública: gerador simples (Mega Millions: 5 de 1-70 + 1 de 1-25, Powerball: 5 de 1-69 + 1 de 1-26)

### Páginas Frontend (SEO)
- [x] /mega-millions — página principal com resultado, explicação, top números, gerador
- [x] /powerball — página principal com resultado, explicação, top números, gerador
- [x] /numeros-mais-sorteados-mega-millions — estatísticas detalhadas
- [x] /numeros-atrasados-mega-millions — números atrasados detalhados
- [x] /frequencia-mega-millions — frequência completa
- [x] /numeros-mais-sorteados-powerball — estatísticas detalhadas
- [x] /numeros-atrasados-powerball — números atrasados detalhados
- [x] /frequencia-powerball — frequência completa

### Gerador Simples
- [x] Gerador funcional para Mega Millions (5 números 1-70 + 1 Mega Ball 1-25)
- [x] Gerador funcional para Powerball (5 números 1-69 + 1 Powerball 1-26)
- [x] Sem lógica avançada, apenas aleatório válido

### Integração
- [x] Adicionar rotas no App.tsx
- [x] Adicionar links na Navbar (dropdown US Lotteries)
- [ ] Adicionar ao sitemap
- [x] SEO meta tags em todas as páginas

### Testes
- [x] Testes vitest para rotas de resultados e estatísticas (20 testes passando)
- [x] Testes vitest para gerador
- [x] Verificar que nenhuma página exibe NaN ou erro

### Regras
- NÃO implementar carteira
- NÃO implementar login obrigatório
- NÃO implementar ROI
- Tudo aberto (acesso livre)
- Nunca prometer previsão
- Tratar estatísticas como histórico

## Ajustes SEO e Conversão — Páginas US Lotteries (20/03/2026)

### Layout e Conteúdo
- [x] Resultado mais recente logo no topo da página (inline no hero)
- [x] Explicação rápida de como funciona cada loteria (abaixo do resultado)
- [x] Botão "Gerar jogo agora" bem visível e destacado (hero + seção gerador)
- [x] Blocos resumidos reforçados: mais sorteados, mais atrasados, frequência bola especial (com barras de progresso)
- [x] CTAs diretos: Gerar jogo agora, Ver números mais sorteados, Ver números atrasados, Ver frequência completa

### SEO
- [x] Revisar title tags para /mega-millions e /powerball ("Resultado X Hoje — Números Sorteados, Estatísticas e Gerador")
- [x] Revisar meta description com palavras-chave relevantes
- [x] Revisar H1 para clareza e SEO ("Resultado X — Último Sorteio e Estatísticas")
- [x] Keywords meta tag adicionada

### Qualidade
- [x] Garantir que nunca exibe NaN ou erro técnico (guard isNaN em NumberBall e formatDate)
- [x] Manter tudo em português
- [x] Não criar funcionalidades novas complexas

## Blog — Posts Loterias Americanas (20/03/2026)

- [x] Analisar padrão existente dos posts de blog brasileiros
- [x] Criar post de blog sobre Mega Millions (7 seções, 10 min leitura)
- [x] Criar post de blog sobre Powerball (8 seções, 10 min leitura)
- [x] Criar post comparativo Mega Millions vs Powerball (7 seções, 8 min leitura)
- [x] Incluir maiores prêmios da história em cada post (top 5 de cada loteria)
- [x] Adicionar categoria "Loterias Americanas" com cor vermelha (#dc2626)
- [x] Registrar novos posts no sistema de blog (automático via blogArticles.ts)
- [x] Adicionar sitemap-us-lotteries.xml com 8 URLs (2 principais + 6 SEO)
- [x] Testar renderização dos novos posts no browser
- [x] 105 testes passando

## TV Valtor (20/03/2026)

- [x] Analisar página Ao Vivo existente e entender estrutura
- [x] Pesquisar canais/streams oficiais das loterias americanas (Mega Millions, Powerball)
- [x] Criar página TV Valtor com dois displays (BR + US)
- [x] Player 1: Loterias CAIXA (canal oficial YouTube)
- [x] Player 2: Powerball & Mega Millions (canal oficial YouTube)
- [x] Cronograma completo de horários brasileiros (21:00 BRT)
- [x] Cronograma completo de horários americanos (PB: 22:59 ET, MM: 23:00 ET) com conversão BRT
- [x] Seção "Sorteios de hoje" com loterias do dia
- [x] Cronograma semanal completo com filtro por país (Todas, Brasil, EUA)
- [x] Cards informativos (BR + US) com horários e links
- [x] Substituir "Ao Vivo" por "TV Valtor" na Navbar
- [x] Redirecionar /ao-vivo para /tv-valtor
- [x] Atualizar LotteryHeroCards para linkar /tv-valtor
- [x] Disclaimer sobre transmissões
- [x] SEO meta tags
- [x] Testar renderização e responsividade — OK
- [x] 105 testes passando

## Ajuste Navbar — Espaçamento (20/03/2026)

- [x] Ajustar espaçamento entre botões Planos e Entrar na Navbar (gap-3 + ml-3)
- [x] Organizar espaço entre todos os itens do menu (gap-0.5 nos itens, rounded-full nos botões)

## Bug Fix — Rota /mega-millions/estatisticas 404 (20/03/2026)

- [x] Adicionar rota /mega-millions/estatisticas (mostra números mais sorteados)
- [x] Adicionar rota /powerball/estatisticas (mostra números mais sorteados)

## Filtros Avançados — Ajustes (20/03/2026)

- [x] Adicionar filtro "Qtd. ímpares" (Mín/Máx) nos filtros avançados do gerador
- [x] Alterar "Qtd. números primos" de Mín/Máx para campo único de quantidade exata ("Ex: 3")
- [x] Atualizar lógica backend para suportar imparesMin, imparesMax e primosExato
- [x] 105 testes passando

## Melhorias Gerador e Carteira (20/03/2026)

### Valores corretos das apostas
- [x] Pesquisar valores atualizados de todas as loterias no site da Caixa
- [x] Criar tabela de preços por loteria e quantidade de números (shared/lotteryPricing.ts)
- [x] Atualizar sistema para usar valores corretos

### Custo automático na carteira
- [x] Ao marcar "Vou apostar este jogo no próximo sorteio" + salvar → inserir custo automaticamente na carteira
- [x] Sistema identifica automaticamente o próximo sorteio (número do concurso + data)
- [x] Inserir na carteira com custo correto, número do próximo concurso e data
- [x] Se só salvar sem marcar aposta → não alimentar carteira/ROI
- [x] Custo baseado na quantidade de números do jogo e loteria selecionada

### ROI automático
- [ ] Se o usuário ganhou algo, sistema calcula retorno automaticamente
- [ ] Calcular ROI = (valor ganho - valor apostado) / valor apostado
- [ ] Exibir ROI na carteira/dashboard

### Sistema de pastas para jogos
- [x] Criar tabela de pastas no banco de dados (user_id, nome, criado_em, cor)
- [x] Permitir criar pastas com nomes personalizados (ex: "Jogos 6 números", "Acima de 50 milhões")
- [x] Ao salvar jogo, permitir escolher em qual pasta salvar
- [x] Listar jogos organizados por pasta na carteira
- [x] Permitir renomear e excluir pastas

### Frontend Gerador — Integração completa (20/03/2026)
- [x] Exibir "Próximo Sorteio" no painel lateral (concurso + data + preço base)
- [x] Preço da aposta muda automaticamente ao trocar de loteria
- [x] Dropdown de seleção de pasta ao salvar jogo
- [x] Botão "Criar Nova Pasta" com dialog (nome + cor)
- [x] Checkbox "Vou apostar" exibe custo e concurso quando marcado
- [x] Custo dinâmico baseado na quantidade de números do jogo gerado
- [x] 136 testes passando (10 arquivos)

## Conferência Automática de Apostas (20/03/2026)

- [x] Remover botão "Registrar resultado" manual da carteira
- [x] Substituir por status "Aguardando resultado" para apostas pendentes
- [x] Integrar auto-checker para conferir apostas automaticamente quando resultado sair
- [x] Registrar acertos e valor ganho automaticamente no ROI
- [x] Exibir status conferido (acertos + ganho) quando resultado já saiu
- [x] Notificar usuário por e-mail em caso de acertos (já implementado no autoChecker)

## Backtest Valtor — Nova Ferramenta (20/03/2026)

- [x] Criar rota tRPC backtest.analisar (pública) para consultar histórico de sorteios
- [x] Criar função backtestGame no db.ts que verifica jogo contra todos os concursos
- [x] Criar página Backtest.tsx com seletor de loteria (9 loterias)
- [x] Grid de seleção de números manual
- [x] Slider de mínimo de acertos
- [x] Exibir resumo (total encontrados, máximo de acertos, distribuição)
- [x] Exibir lista de concursos com acertos (números destacados)
- [x] Adicionar ao menu Ferramentas no Navbar
- [x] Adicionar rota /backtest no App.tsx

## Reutilizar Jogos na Carteira (20/03/2026)

- [x] Criar função reuseGame no db.ts (copia jogo com nova aposta)
- [x] Criar rota tRPC carteira.reutilizar (protegida)
- [x] Botão "Jogar novamente" para jogos conferidos e não apostados
- [x] Calcula automaticamente próximo concurso e valor da aposta
- [x] 138 testes passando (10 arquivos)

## Dashboard Sidebar — Backtest (20/03/2026)

- [x] Adicionar link do Backtest Valtor no menu lateral do Dashboard/Clube

## Backtest — Melhorias (20/03/2026)

- [x] Usar API da Caixa (fetchAllConcursos) ao invés do banco local para ter histórico completo (2986+ concursos)
- [x] Mostrar todas as faixas de premiação (quadra, quina, terno, etc.) com badges coloridos
- [x] Exibir distribuição por faixa de premiação no resumo
- [x] Mostrar faixa de premiação em cada concurso encontrado

## Dashboard — Remover card Análises (20/03/2026)

- [x] Remover card "∞ Análises" do Dashboard

## Gerador — Quantidade Variável de Números (20/03/2026)

- [x] Adicionar seletor de quantidade de números no Gerador (ex: 6-20 na Mega-Sena)
- [x] Exibir preço dinâmico conforme quantidade selecionada (tabela LOTTERY_PRICING)
- [x] Atualizar backend gerador.gerar para aceitar qtdNumeros variável
- [x] Atualizar backend gerador.gerarPremium para aceitar qtdNumeros variável
- [x] Garantir que o custo na carteira reflita a quantidade de números escolhida

## Carteira — Filtro por Pasta (20/03/2026)

- [x] Adicionar dropdown de filtro por pasta na Carteira
- [x] Mostrar contagem de jogos por pasta no dropdown
- [x] Exibir ícone/cor da pasta no filtro

## Exportar PDF — Cola para Lotérica (20/03/2026)

- [x] Criar rota backend para gerar PDF com jogos formatados (pdfkit)
- [x] Layout bonito com logo Valtor, jogos organizados por loteria, números destacados
- [x] Incluir concurso alvo, data e custo total no PDF
- [x] Adicionar botão "Baixar PDF" no Gerador após gerar jogos
- [x] Adicionar botão "Exportar PDF" na Carteira para jogos filtrados

## Compartilhar via WhatsApp (21/03/2026)

- [x] Formatar jogos como texto para WhatsApp (loteria, números, concurso, custo)
- [x] Adicionar botão "Compartilhar WhatsApp" no Gerador após gerar jogos
- [x] Adicionar botão "Compartilhar WhatsApp" na Carteira para jogos filtrados

## Gráfico Visual de ROI (21/03/2026)

- [x] Adicionar gráfico de barras verticais (investido vs ganho) por loteria no painel de ROI
- [x] Exibir ROI percentual por loteria no gráfico
- [x] Usar cores das loterias no gráfico
- [x] Tabela detalhada abaixo do gráfico com investido, ganho e ROI% por loteria

## Notificação Push de Resultados (21/03/2026)

- [x] Integrar com notifyOwner para enviar notificação quando resultado sair
- [x] Notificar usuário sobre acertos nas apostas (in-app notifications)
- [x] Incluir detalhes dos acertos na notificação (loteria, concurso, números acertados)
- [x] Tabela notifications no banco de dados
- [x] Rotas tRPC: listar, contarNaoLidas, marcarLida, marcarTodasLidas
- [x] Componente NotificationBell com dropdown na Navbar (desktop + mobile)
- [x] Polling automático a cada 60s para novas notificações
- [x] Testes vitest para notificações e timezone (145 testes passando)

## Bugs Reportados (21/03/2026)

- [x] BUG: E-mail de resultados mostra data posterior (UTC ao invés de BRT) — corrigido com timeZone: America/Sao_Paulo
- [x] Completar integração do NotificationBell no Navbar (desktop + mobile)

## Notificação Sonora e Visual (21/03/2026)

- [x] Criar som de notificação elegante exclusivo Valtor (crystal chime WAV)
- [x] Animação de "shake" no sino quando nova notificação chega
- [x] Detectar mudança no contador de não-lidas e disparar som + animação
- [x] Respeitar preferência do usuário (toggle som on/off com localStorage)
- [x] Botão de toggle som no dropdown de notificações
- [x] BUG: Conferidor mostra "Erro" quando resultado ainda não saiu — corrigido para "Aguardando resultado" com visual âmbar
- [x] BUG: Abas de filtro/pastas cortadas na Carteira em mobile — adicionado shrink-0 e scroll touch nos botões
- [x] BUG: Pastas duplicadas "Meus Jogos" no banco — limpas 16 duplicatas, adicionada validação de nome único por usuário
- [x] Reorganizar carteira: jogos "Aguardando resultado" no topo, conferidos no meio, salvos abaixo — com seções visuais separadas
- [x] Criar posts no blog sobre todas as ferramentas implementadas no sistema
- [x] Trocar "A Valtor" por "Valtor" (sem artigo feminino) em todo o site
- [x] Adicionar novas funcionalidades na seção de features da Home e Clube Premium (12 features)
- [x] Criar posts no blog sobre cada ferramenta (Gerador, Conferidor, Simulador, Backtest, Carteira, TV Valtor, Análise IA, PDF/WhatsApp, Notificações)
- [x] Incluir no blog/features: Exportar PDF, Compartilhar WhatsApp, Notificações popup in-app
- [x] BUG: Ao navegar entre páginas, scroll fica no final ao invés de ir para o topo — adicionado ScrollToTop no Router
- [x] Alterar texto do footer para incluir loterias do Brasil e dos EUA
- [x] Adicionar Mega Millions e Powerball na seção "Próximos Sorteios" da Home, abaixo das loterias brasileiras

## Otimização de Conversão/UX/SEO (21/03/2026)
- [x] 1. Hero: título fixo SEO + subtítulo com loterias + botões "Ver resultado" e "Gerar jogo" + badge 11 loterias
- [x] 9. SEO: meta description com termos buscáveis
- [x] 2. Bloco resultado visível imediatamente abaixo do hero (Mega-Sena + Lotofácil)
- [x] 3. Bloco de ação "O que você quer fazer agora?" com 4 cards grandes
- [x] 7. Mobile: botões h-12 (48px), resultado na primeira tela
- [x] 4. CTAs distribuídos nas páginas principais com textos específicos
- [x] 6. Limpeza visual: hero simplificado, seção busca removida
- [x] 5. Páginas de loteria: resultado no topo + explicação curta + botão
- [x] 8. Performance: skeleton loading, conteúdo principal primeiro
- [x] 10. Banner discreto monetização EUA antes do CTA Premium

## Refinamento de Conversão v2 (21/03/2026)
- [x] R1. Hero: título "Resultado da Lotofácil e Mega-Sena hoje..." + subtítulo orientado à ação
- [x] R2. Resultado destaque: bolas maiores, mais contraste, fundo colorido, impossível ignorar
- [x] R3. CTAs: textos mais específicos ("Gerar jogo inteligente", "Ver números mais atrasados agora", etc.)
- [x] R4. Micro-ganchos: frases de curiosidade nos blocos ("Veja quais números estão devendo", etc.)
- [x] R5. Bloco de ação reforçado: mais padding, sombra, borda colorida, ícones maiores
- [x] R6. Loterias EUA: bloco dedicado com botões "Ver Mega Millions" e "Ver Powerball"
- [x] R7. Mobile: bolas maiores, espaçamento entre blocos, botões h-12/h-14
- [x] R8. Fadiga visual: removido "Como a análise funciona", features condensados de 12 para 8
- [x] R9. CTA final: "Pronto para montar seu jogo?" + botão "Gerar jogo agora" (roxo)
- [x] R10. Validação: 145 testes passando, zero NaN, zero erros console, visual verificado

## Bug Fix (21/03/2026)
- [x] Link "Saiba como jogar nos EUA com segurança" corrigido para /blog/mega-millions-vs-powerball-comparativo-completo

## Aposta Rápida Valtor - Extensão Chrome (21/03/2026)
- [x] Analisar estrutura do site Lotéricas Online da Caixa (seletores dos volantes)
- [x] Backend: endpoints apostaRapida.listar e apostaRapida.todos
- [x] Carteira: jogos com aposta ativa são listados automaticamente na extensão
- [x] Extensão Chrome: manifest.json v3
- [x] Extensão Chrome: popup com carrinho (listar jogos, preencher todos/escolher)
- [x] Extensão Chrome: content script para preencher volantes no site da Caixa
- [x] Página /aposta-rapida no Valtor com explicação, download e tutorial
- [x] Testes e validação (152 testes passando, incluindo 7 novos para apostaRapida)

## Bug Fix - Pastas fantasma na carteira (21/03/2026)
- [x] Pastas "Jogos Numeros" e "Meus Jogos" deletadas do banco (eram registros reais criados durante testes)

## Aposta Rápida - Melhorias (21/03/2026)
- [x] BUG: Extensão não encontra jogos salvos (resolvido com Token de API + endpoint REST /api/aposta-rapida/jogos)
- [x] Prompt "Enviar para Aposta Rápida?" ao salvar jogos no gerador (toast com link, 6s)
- [x] Importação de TXT na extensão (colar números, selecionar loteria, preview antes de preencher)
- [ ] Avaliar modelo de venda avulsa: R$ 20/mês com validade 30 dias (fora do Premium) — pendente decisão

## Bug Fix - Content Script não preenche volantes (21/03/2026)
- [x] Erro de comunicação: corrigido com injeção programática (scripting API), ping/pong, seletores robustos e validação de URL

## Bug Fix - Extensão + Botão Salvar (21/03/2026)
- [x] Extensão mostra "Nenhum jogo pendente" mesmo com jogos salvos com aposta ativa — corrigido: removida tela not-caixa bloqueante, carrinho sempre visível com aviso para abrir Caixa
- [x] Botão "Salvar" no gerador não muda de cor após salvar — corrigido: estado savedIndexes rastreia jogos salvos, botão muda para verde "Salvo ✓"
- [x] Importação TXT não abre na extensão — corrigido: event listeners do botão 📄 no header e "Importar TXT" na tela no-games agora funcionam corretamente

## Bug Fix - Extensão ainda não puxa jogos (21/03/2026)
- [x] Extensão mostra "Nenhum jogo pendente" mesmo com status verde — resolvido: usuário precisava reinstalar v1.3
- [x] Tratar jogos de loterias diferentes na extensão (Mega-Sena + Lotofácil + Quina ao mesmo tempo) — content.js já agrupa por loteria e navega entre páginas
- [x] Extensão precisa agrupar jogos por loteria e navegar entre páginas no site da Caixa — já implementado no content.js
- [x] Extensão exige aba ativa da Caixa — v1.4: usa chrome.tabs.query com URL filter para buscar TODAS as abas
- [x] Ao clicar "Preencher", focar na aba da Caixa automaticamente — v1.4: chrome.tabs.update + chrome.windows.update

## Otimização Extensão v1.5 (21/03/2026)
- [x] Reduzir tempos de espera (sleep) no content.js para preencher mais rápido — v1.5: sleeps reduzidos ~60% (click 150→60ms, cart 1000→400ms, between games 1200→400ms)
- [x] Separar preenchimento por loteria — v1.5: botão individual colorido por loteria no carrinho (ex: "⚡ Preencher Mega-Sena [10 jogos]")
- [x] Usuário não deveria precisar desmarcar jogos de outra loteria manualmente — v1.5: cada loteria tem seu próprio botão de preencher

## Bug Fix - Duplicatas e Concursos Sorteados (21/03/2026)
- [x] Gerador não pode gerar apostas duplicadas — checkDuplicateGame verifica se já existe na carteira antes de salvar + dedup dentro do lote gerado
- [x] Aposta Rápida não deve importar jogos de concursos já sorteados — getActiveBetsForExtension filtra concursos já sorteados comparando com último concurso no DB

## Bug Fix - Dia da semana errado + Verificação autoChecker (21/03/2026)
- [x] Carrossel hero mostra "Domingo" mas 21/03/2026 é Sábado — investigado: lógica JS retorna "sábado" corretamente, possível cache do navegador
- [x] Verificar que autoChecker cron job está rodando — confirmado: roda às 22:30 BRT (01:30 UTC), 1h30 após sorteios
- [x] Verificar notificações (popup + e-mail) — confirmado: autoChecker envia e-mail + cria notificação in-app + notifica owner
- [x] Corrigir ordem dos crons — email dispatch movido para 23:00 BRT (após auto-checker às 22:30)

## Bug Fix - Página Aposta Rápida sem menus (21/03/2026)
- [x] Página /aposta-rapida (Extensao.tsx) está sem header/navbar — adicionado Navbar e Footer

## Feature - Excluir pastas na carteira (21/03/2026)
- [x] Adicionar endpoint para excluir pasta (com opção de excluir jogos internos) — deleteFolder com excluirJogos param + countGamesInFolder
- [x] Adicionar botão de excluir pasta na UI da carteira — botão X em cada chip de pasta no filtro
- [x] Mostrar diálogo de confirmação com aviso quando pasta tiver jogos dentro — modal com 3 opções: excluir tudo, manter jogos, cancelar
