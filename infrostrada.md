Infostrada api login staat in lastpass

Docs
http://nos.api.infostradasports.com/ > Cyclcing

Get race list
http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetRaceList?season=2026&languageCode=1

Vervolgens kun je dan de result ophalen
GIRO: http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetResult?ClassificationID=3490908&LanguageCode=1
TOUR: http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetResult?ClassificationID=3490948&LanguageCode=1

Of race info
GIRO: http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetRaceInfo?PhaseId=2944498&LanguageCode=1
TOUR: http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetRaceInfo?PhaseId=2944542&LanguageCode=1

OF deelnemers
GIRO: http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetParticipantList?EventPhaseID=2944498&LanguageCode=1
TOUR: http://nos.api.infostradasports.com/svc/Cycling.svc/json/GetParticipantList?EventPhaseID=2944542&LanguageCode=1

giro phasid: 2944498
