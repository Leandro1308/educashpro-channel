# EduCashPro Channel

Publicador independente e sem servidor para o Canal Oficial do EduCashPro.

## Como funciona

- 1 publicação por dia.
- 90 publicações prontas, de 04/10/2026 a 01/01/2027.
- GitHub Actions executa diariamente às 08:05 no fuso America/Belem (UTC-3).
- A publicação é enviada diretamente pela Telegram Bot API.
- Não usa Render, MongoDB, Redis nem API da OpenAI.
- `published.json` registra as mensagens já enviadas para evitar republicação.
- O script valida automaticamente que existem exatamente 90 posts, sem IDs ou datas duplicadas.
- Os textos são originais e foram elaborados a partir de princípios gerais dos livros fornecidos pelo responsável do projeto. Nenhum PDF ou trecho integral das obras é armazenado aqui.

## Secrets necessários

Em **Settings → Secrets and variables → Actions**, criar:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHANNEL_ID`

O token nunca deve ser colocado em arquivo público.

## Publicação

O workflow `.github/workflows/publish.yml` roda automaticamente uma vez ao dia.
Também pode ser executado manualmente pela aba **Actions**, com `dry_run=true`, para pré-visualizar uma data sem publicar.

## Conteúdo

As 90 mensagens ficam compactadas nos arquivos:

- `posts/posts90.part1.b64`
- `posts/posts90.part2.b64`
- `posts/posts90.part3.b64`
- `posts/posts90.part4.b64`

O script recompõe e valida o conjunto antes de cada execução.

## Período

Primeiro post automático: **04/10/2026**  
Último post da sequência: **01/01/2027**

## Custos

A arquitetura não mantém servidor ligado. O repositório é público, o workflow usa runner padrão do GitHub Actions e a Telegram Bot API não cobra pelo envio das mensagens.
