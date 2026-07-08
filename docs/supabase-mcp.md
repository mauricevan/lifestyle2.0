# Supabase MCP — Cursor setup

De Supabase MCP-server is geconfigureerd in [`.cursor/mcp.json`](../.cursor/mcp.json).

## Configuratie

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=nsfdmrctapcdfwgtsjnj&read_only=true"
    }
  }
}
```

### Aanbevolen: project scope toevoegen

Zodra je een Supabase-project hebt, vervang de URL door:

```
https://mcp.supabase.com/mcp?project_ref=<JOUW_PROJECT_REF>&read_only=true
```

Project-ref vind je in het Supabase-dashboard onder **Project Settings → General**.

Of gebruik de **MCP**-tab onder **Connect** in je project voor een kant-en-klare URL.

## Authenticatie (eenmalig)

1. Herstart Cursor (of open dit project opnieuw).
2. Ga naar **Settings → Cursor Settings → Tools & MCP**.
3. Controleer dat **supabase** zichtbaar is en klik **Authenticate** / **Connect**.
4. Log in via de browser en kies de juiste organisatie.

Geen personal access token meer nodig — OAuth via dynamic client registration.

## Verificatie

Vraag in de chat bijvoorbeeld:

> Welke tabellen staan in mijn database? Gebruik MCP tools.

## Beveiliging

- `read_only=true` — geen schrijfacties via MCP (migrations handmatig of via CI)
- Gebruik een **development**-project, geen productie
- Beoordeel elke MCP tool call voordat je die goedkeurt

## CI / headless (optioneel)

Voor CI zonder browser, gebruik een PAT in headers — zie [Supabase MCP docs](https://supabase.com/docs/guides/getting-started/mcp).
