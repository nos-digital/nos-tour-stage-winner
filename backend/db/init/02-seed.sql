-- Seed: the official 2026 Tour route.
-- Riders and GC come from Infostrada via the hourly cron job.
-- Stage favorites can be added manually after the first rider sync.

INSERT INTO stages (`number`, `date`, start, finish, distance_km, stage_type) VALUES
  (1,  '2026-07-04', 'Barcelona',          'Barcelona',              19,  'ploegentijdrit'),
  (2,  '2026-07-05', 'Tarragona',          'Barcelona',             182,  'heuvelrit'),
  (3,  '2026-07-06', 'Granollers',         'Les Angles',            196,  'bergrit'),
  (4,  '2026-07-07', 'Carcassonne',        'Foix',                  182,  'heuvelrit'),
  (5,  '2026-07-08', 'Lannemezan',         'Pau',                   158,  'vlakke rit'),
  (6,  '2026-07-09', 'Pau',                'Gavarnie-Cèdre',        186,  'bergrit'),
  (7,  '2026-07-10', 'Hagetmau',           'Bordeaux',              175,  'vlakke rit'),
  (8,  '2026-07-11', 'Périgueux',          'Bergerac',              182,  'vlakke rit'),
  (9,  '2026-07-12', 'Malemort',           'Ussel',                 185,  'heuvelrit'),
  (10, '2026-07-14', 'Aurillac',           'Le Lioran',             167,  'heuvelrit'),
  (11, '2026-07-15', 'Vichy',              'Nevers',                161,  'vlakke rit'),
  (12, '2026-07-16', 'Magny-Cours',        'Châlon-sur-Saône',      181,  'vlakke rit'),
  (13, '2026-07-17', 'Dole',               'Belfort',               205,  'heuvelrit'),
  (14, '2026-07-18', 'Mulhouse',           'Le Markstein',          155,  'bergrit'),
  (15, '2026-07-19', 'Champagnole',        'Plateau de Solaison',   184,  'bergrit'),
  (16, '2026-07-21', 'Évian-les-Bains',    'Thonon-les-Bains',       26,  'tijdrit'),
  (17, '2026-07-22', 'Chambéry',           'Voiron',                175,  'vlakke rit'),
  (18, '2026-07-23', 'Voiron',             'Orcières-Merlette',     185,  'bergrit'),
  (19, '2026-07-24', 'Gap',                'Alpe d''Huez',          128,  'bergrit'),
  (20, '2026-07-25', 'Le Bourg-d''Oisans', 'Alpe d''Huez',          171,  'bergrit'),
  (21, '2026-07-26', 'Thoiry',             'Parijs',                130,  'vlakke rit');
