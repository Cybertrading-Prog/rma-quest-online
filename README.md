# RMA Quest Online – Frank Demo

Diese Version ist der Online-MVP **plus Demo-Frank**.

Enthalten:
- gemeinsamer Spielstand via Supabase
- Login
- Spieler- und Quest-Verwaltung
- Frank Observer random oben rechts
- Frank Boss-Event bei Bossfeld / Boss-Quest
- seltene Bildschirmübernahme
- deine hochgeladenen Frank-Voices als statische Assets

## Deployment
Wie beim ersten Paket:
- Repo-Inhalt ersetzen
- auf GitHub pushen
- Vercel redeployen

## Environment Variables
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SESSION_SECRET


## Frank Level 2
- seltene große Frank-Events alle ca. 30–45 Minuten
- kleine Namens-Kommentare mit echten Spielernamen
- Rage Mode
- Audit
- Jackpot
- Boss-Events bleiben aktiv

- Frank-Stimmungsbilder je Event sind wieder drin
- Admin kann Frank-Bilder je Stimmung hochladen und auf Standard zurücksetzen

- Live Sync für alle eingeloggten Spieler per automatischem 5-Sekunden-Abgleich

- Vorgegebene Frank-Standardbilder sind jetzt direkt eingebaut
- Dropdowns haben dunklen Hintergrund und helle Schrift
- Kategorie bei Quest-Erstellung und -Bearbeitung ist jetzt ein Dropdown aus bestehenden Kategorien

- Titel und Startscreen-Texte auf 'LevelUp statt Meckern!' angepasst
- Frank-Defaultbilder sauber auf die gelieferten PNGs verdrahtet
- Quest-Kategorien sind nur noch per Dropdown auswählbar
- Dropdown-Menüs kontrastreicher
- Schnellbuchung gegen Doppelauslösung abgesichert

- Schnellbuchungen nutzen jetzt sauber die Punkte/Kategorie der geklickten Quest
- Frank-Events werden nach dem Eintragen asynchron ausgelöst, damit Schritte und UI sofort reagieren
