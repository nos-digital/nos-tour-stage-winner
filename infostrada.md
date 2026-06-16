# Infostrada API

Login staat in LastPass.
Docs: http://nos.api.infostradasports.com/ → Cycling

## IDs

|      | classificationID | phaseID |
| ---- | ---------------- | ------- |
| Giro | 3490908          | 2944498 |
| Tour | 3490948          | 2944542 |

In de app: `INFOSTRADA_GC_CLASSIFICATION_ID` en `INFOSTRADA_PHASE_ID` (zie `backend/.env`).

## Endpoints

Races (om de juiste IDs op te zoeken):
http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetRaceList?season=2026&languageCode=1

Uitslag / klassement (ClassificationID):
http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetResult?ClassificationID=3490908&LanguageCode=1

Etappes (PhaseId):
http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetStageList?PhaseId=2944498&LanguageCode=1

Deelnemers (EventPhaseID):
http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetParticipantList?EventPhaseID=2944498&LanguageCode=1

Race info (PhaseId):
http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetRaceInfo?PhaseId=2944498&LanguageCode=1
