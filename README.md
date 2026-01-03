//PRD (Product Requirements Document)

# Nextep - Hub Inteligente de Entretenimento

## 🎯 Visão Geral
O Nextep é um SaaS (Software as a Service) projetado para centralizar a experiência de consumo de mídia. O foco é resolver a fragmentação do mercado de streaming, unindo rastreio de progresso, indicação de disponibilidade (onde assistir) e gestão financeira de assinaturas em uma interface única, moderna e multiplataforma (Web/PWA).

## 🚀 Propostas de Valor
- **Centralização:** Interface única para múltiplos catálogos de streaming.
- **Continuidade:** Integração bidirecional com a API do Trakt.tv (Sincronização de progresso).
- **Economia:** Dashboard financeiro para monitoramento e otimização de gastos com assinaturas.
- **Deep Linking:** Atalhos diretos que abrem os players oficiais no conteúdo exato.

## 🛠️ Stack Técnica
- **Framework:** Next.js 15 (App Router).
- **Linguagem:** TypeScript (Tipagem rigorosa).
- **Estilização:** Tailwind CSS (Design Dark Mode nativo).
- **Backend/Auth:** Supabase (Auth, Banco de Dados Relacional e Edge Functions).
- **Desenvolvimento:** Gemini CLI (Vibe Coding focado em contexto de arquivos).
- **Hospedagem:** Netlify com Deploy Contínuo (CI/CD via GitHub).

## 📊 Arquitetura de Dados (Fluxo de Informação)
- **TMDB API:** Fonte primária de metadados (Posters, sinopses, trailers, elencos).
- **Trakt.tv API:** Fonte da verdade para o progresso do usuário (Histórico, Watchlist, Check-ins).
- **Supabase DB:** Armazena dados de personalização do Nextep:
    - Configurações de Assinaturas (Nome do serviço, valor pago, vencimento).
    - Preferências de UI (Filtros de episódios filler, temas).
    - Tokens de sessão e perfis.

## 📋 Roadmap do MVP
- [x] **Fase 1:** Setup inicial com Next.js 15, Tailwind e configuração de chaves de API.
- [x] **Fase 2:** Busca Universal via TMDB com filtros para Filmes e Séries.
- [ ] **Fase 3:** Autenticação via Supabase integrada ao Login do Trakt.tv.
- [ ] **Fase 4:** Dashboard de "Assinaturas" (Gestão Financeira e Cálculo de Gasto Mensal).
- [ ] **Fase 5:** Implementação de Deep Linking para Netflix, Disney+, Crunchyroll e Prime Video.
- [ ] **Fase 6:** Configuração de PWA para instalação em iOS e Android.

## 🤖 Regras para o Gemini CLI (Vibe Coding)
1. **Prioridade de Performance:** Utilize Server Components sempre que possível.
2. **Segurança:** Nunca exponha chaves de API no frontend sem o prefixo `NEXT_PUBLIC_`.
3. **Resiliência:** Trate falhas de API (TMDB/Trakt) com estados de erro ou skeleton screens amigáveis.
4. **Git Flow:** Após concluir cada funcionalidade do Roadmap, sugira um comando de commit descritivo.
5. **Contexto:** Antes de gerar novos arquivos, leia os arquivos de `/services` e `/lib` para manter a consistência.

---
*Nextep - O próximo passo do seu entretenimento.*