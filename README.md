# RMA Quest Online

## Enthalten
- gemeinsamer Login
- gemeinsamer Spielstand
- gemeinsames Board
- Spieler- und Quest-Verwaltung
- Observer-Schalter

## Deployment
1. Diese Dateien in dein GitHub-Repo `rma-quest-online` hochladen.
2. In Vercel neues Projekt aus dem Repo anlegen.
3. In Vercel unter **Environment Variables** setzen:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`

## Werte
- `SUPABASE_URL`: deine Supabase Projekt-URL
- `SUPABASE_SERVICE_ROLE_KEY`: den **service_role** Key aus Supabase
- `SESSION_SECRET`: irgendein langes eigenes Geheimnis (z. B. 40 Zeichen)

## Login
- Benutzername: `admin`
- Passwort: `admin123`

## Hinweis
Das ist bewusst der erste **saubere Online-MVP**.
Die ganz wilden lokalen Frank-Spezialeffekte können danach schrittweise online nachgezogen werden.
