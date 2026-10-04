# EduCashPro Channel

Publicador independente e sem servidor para o Canal Oficial do EduCashPro.

## Como funciona

- 1 publicação por dia.
- 90 publicações prontas, de 04/10/2026 a 01/01/2027.
- GitHub Actions executa diariamente às 08:05 no fuso America/Belem (UTC-3).
- A publicação é enviada diretamente pela Telegram Bot API.
- Não usa Render, MongoDB, Redis nem API da OpenAI.
- `published.json` registra as mensagens já enviadas para reduzir risco de duplicação.
- Os textos são originais e foram elaborados a partir de princípios gerais dos livros de educação financeira fornecidos pelo responsável do projeto. Nenhum PDF ou trecho integral dos livros é armazenado neste repositório.

## Secrets necessários

Em **Settings → Secrets and variables → Actions**, criar:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHANNEL_ID`

O token nunca deve ser colocado em arquivo público.

## Publicação

O workflow `.github/workflows/publish.yml` roda automaticamente uma vez ao dia.
Também pode ser executado manualmente com `dry_run=true` para pré-visualizar uma data sem publicar.

## Conteúdo

Os posts ficam em:

- `posts/2026-10.json`
- `posts/2026-11.json`
- `posts/2026-12.json`
- `posts/2027-01.json`

Cada post tem ID único, data, texto, botão opcional e referência editorial interna da obra-base.

## Custos

A arquitetura não mantém servidor ligado. Em repositório público, o workflow usa runner padrão do GitHub Actions; a Telegram Bot API não cobra pelo envio dessas mensagens.
