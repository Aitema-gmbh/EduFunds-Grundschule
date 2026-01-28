# TODO - EduFunds-Grundschule

Hier sind die nächsten wichtigen Schritte für das Projekt:

1.  **Berechtigungskonflikte in `node_modules` lösen**: Aktuell schlagen Tests und Builds fehl (EACCES), da das System keine temporären Dateien in `node_modules/.vite-temp` schreiben kann. Die Verzeichnisberechtigungen müssen korrigiert werden, um die lokale Entwicklung und CI-Testläufe zu ermöglichen.
2.  **API-Key Management & Backend-Sicherung**: Sicherstellen, dass der `GEMINI_API_KEY` nicht im Frontend exponiert wird. Der aktuelle `backend/`-Ordner und die `functions/api` sollten auf eine robuste Serverless-Struktur oder einen Proxy umgestellt werden, um die AI-Aufrufe sicher zu tunneln.
3.  **Vollständige Testabdeckung erreichen**: Die vorhandenen `.test.ts`-Dateien in `services/` und `utils/` müssen erfolgreich durchlaufen. Sobald die Berechtigungsprobleme gelöst sind, sollte eine 100%ige Abdeckung der Kernlogik (Förderprogrammlogik und Export-Service) sichergestellt werden.
