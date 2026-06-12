-- Seed: the official 2026 Tour route, favorites riders, and stage favorites.
-- Rider names must match exactly what Infostrada returns in c_Person.
-- The hourly sync will fill in person_id, team and out_of_race automatically.

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

-- Pre-seed riders used as favorites. team/person_id filled in by Infostrada sync.
INSERT IGNORE INTO riders (name) VALUES
  ('Tadej Pogacar'),
  ('Jonas Vingegaard'),
  ('Remco Evenepoel'),
  ('Wout van Aert'),
  ('Mathieu van der Poel'),
  ('Jasper Philipsen'),
  ('Biniam Girmay'),
  ('Primoz Roglic'),
  ('Enric Mas'),
  ('Ben O''Connor'),
  ('Sepp Kuss'),
  ('Adam Yates'),
  ('Felix Gall'),
  ('Filippo Ganna'),
  ('Rémi Cavagna'),
  ('Victor Campenaerts'),
  ('Kaden Groves'),
  ('Jonathan Milan'),
  ('Dylan Groenewegen'),
  ('Arnaud De Lie'),
  ('Rasmus Pedersen');

-- Stage favorites (6 per stage, ordered by position).
INSERT INTO stage_favorites (stage_id, rider_id, position)
SELECT s.id, r.id, fav.pos
FROM (
  SELECT  1 AS num, 'Tadej Pogacar'        AS name, 1 AS pos UNION ALL
  SELECT  1, 'Remco Evenepoel',      2 UNION ALL
  SELECT  1, 'Jonas Vingegaard',     3 UNION ALL
  SELECT  1, 'Wout van Aert',        4 UNION ALL
  SELECT  1, 'Filippo Ganna',        5 UNION ALL
  SELECT  1, 'Victor Campenaerts',   6 UNION ALL

  SELECT  2, 'Mathieu van der Poel', 1 UNION ALL
  SELECT  2, 'Wout van Aert',        2 UNION ALL
  SELECT  2, 'Jasper Philipsen',     3 UNION ALL
  SELECT  2, 'Kaden Groves',         4 UNION ALL
  SELECT  2, 'Biniam Girmay',        5 UNION ALL
  SELECT  2, 'Rasmus Pedersen',      6 UNION ALL

  SELECT  3, 'Tadej Pogacar',        1 UNION ALL
  SELECT  3, 'Jonas Vingegaard',     2 UNION ALL
  SELECT  3, 'Remco Evenepoel',      3 UNION ALL
  SELECT  3, 'Enric Mas',            4 UNION ALL
  SELECT  3, 'Ben O''Connor',        5 UNION ALL
  SELECT  3, 'Sepp Kuss',            6 UNION ALL

  SELECT  4, 'Tadej Pogacar',        1 UNION ALL
  SELECT  4, 'Jonas Vingegaard',     2 UNION ALL
  SELECT  4, 'Remco Evenepoel',      3 UNION ALL
  SELECT  4, 'Mathieu van der Poel', 4 UNION ALL
  SELECT  4, 'Wout van Aert',        5 UNION ALL
  SELECT  4, 'Ben O''Connor',        6 UNION ALL

  SELECT  5, 'Jasper Philipsen',     1 UNION ALL
  SELECT  5, 'Biniam Girmay',        2 UNION ALL
  SELECT  5, 'Jonathan Milan',       3 UNION ALL
  SELECT  5, 'Kaden Groves',         4 UNION ALL
  SELECT  5, 'Dylan Groenewegen',    5 UNION ALL
  SELECT  5, 'Wout van Aert',        6 UNION ALL

  SELECT  6, 'Tadej Pogacar',        1 UNION ALL
  SELECT  6, 'Jonas Vingegaard',     2 UNION ALL
  SELECT  6, 'Remco Evenepoel',      3 UNION ALL
  SELECT  6, 'Primoz Roglic',        4 UNION ALL
  SELECT  6, 'Enric Mas',            5 UNION ALL
  SELECT  6, 'Ben O''Connor',        6 UNION ALL

  SELECT  7, 'Jasper Philipsen',     1 UNION ALL
  SELECT  7, 'Biniam Girmay',        2 UNION ALL
  SELECT  7, 'Jonathan Milan',       3 UNION ALL
  SELECT  7, 'Kaden Groves',         4 UNION ALL
  SELECT  7, 'Dylan Groenewegen',    5 UNION ALL
  SELECT  7, 'Arnaud De Lie',        6 UNION ALL

  SELECT  8, 'Jasper Philipsen',     1 UNION ALL
  SELECT  8, 'Biniam Girmay',        2 UNION ALL
  SELECT  8, 'Jonathan Milan',       3 UNION ALL
  SELECT  8, 'Kaden Groves',         4 UNION ALL
  SELECT  8, 'Dylan Groenewegen',    5 UNION ALL
  SELECT  8, 'Wout van Aert',        6 UNION ALL

  SELECT  9, 'Mathieu van der Poel', 1 UNION ALL
  SELECT  9, 'Wout van Aert',        2 UNION ALL
  SELECT  9, 'Tadej Pogacar',        3 UNION ALL
  SELECT  9, 'Remco Evenepoel',      4 UNION ALL
  SELECT  9, 'Rasmus Pedersen',      5 UNION ALL
  SELECT  9, 'Ben O''Connor',        6 UNION ALL

  SELECT 10, 'Tadej Pogacar',        1 UNION ALL
  SELECT 10, 'Jonas Vingegaard',     2 UNION ALL
  SELECT 10, 'Remco Evenepoel',      3 UNION ALL
  SELECT 10, 'Wout van Aert',        4 UNION ALL
  SELECT 10, 'Ben O''Connor',        5 UNION ALL
  SELECT 10, 'Enric Mas',            6 UNION ALL

  SELECT 11, 'Jasper Philipsen',     1 UNION ALL
  SELECT 11, 'Biniam Girmay',        2 UNION ALL
  SELECT 11, 'Jonathan Milan',       3 UNION ALL
  SELECT 11, 'Kaden Groves',         4 UNION ALL
  SELECT 11, 'Dylan Groenewegen',    5 UNION ALL
  SELECT 11, 'Wout van Aert',        6 UNION ALL

  SELECT 12, 'Jasper Philipsen',     1 UNION ALL
  SELECT 12, 'Biniam Girmay',        2 UNION ALL
  SELECT 12, 'Jonathan Milan',       3 UNION ALL
  SELECT 12, 'Kaden Groves',         4 UNION ALL
  SELECT 12, 'Dylan Groenewegen',    5 UNION ALL
  SELECT 12, 'Arnaud De Lie',        6 UNION ALL

  SELECT 13, 'Mathieu van der Poel', 1 UNION ALL
  SELECT 13, 'Wout van Aert',        2 UNION ALL
  SELECT 13, 'Tadej Pogacar',        3 UNION ALL
  SELECT 13, 'Remco Evenepoel',      4 UNION ALL
  SELECT 13, 'Rasmus Pedersen',      5 UNION ALL
  SELECT 13, 'Kaden Groves',         6 UNION ALL

  SELECT 14, 'Tadej Pogacar',        1 UNION ALL
  SELECT 14, 'Jonas Vingegaard',     2 UNION ALL
  SELECT 14, 'Remco Evenepoel',      3 UNION ALL
  SELECT 14, 'Enric Mas',            4 UNION ALL
  SELECT 14, 'Felix Gall',           5 UNION ALL
  SELECT 14, 'Ben O''Connor',        6 UNION ALL

  SELECT 15, 'Tadej Pogacar',        1 UNION ALL
  SELECT 15, 'Jonas Vingegaard',     2 UNION ALL
  SELECT 15, 'Remco Evenepoel',      3 UNION ALL
  SELECT 15, 'Primoz Roglic',        4 UNION ALL
  SELECT 15, 'Enric Mas',            5 UNION ALL
  SELECT 15, 'Ben O''Connor',        6 UNION ALL

  SELECT 16, 'Remco Evenepoel',      1 UNION ALL
  SELECT 16, 'Tadej Pogacar',        2 UNION ALL
  SELECT 16, 'Jonas Vingegaard',     3 UNION ALL
  SELECT 16, 'Filippo Ganna',        4 UNION ALL
  SELECT 16, 'Rémi Cavagna',         5 UNION ALL
  SELECT 16, 'Victor Campenaerts',   6 UNION ALL

  SELECT 17, 'Jasper Philipsen',     1 UNION ALL
  SELECT 17, 'Biniam Girmay',        2 UNION ALL
  SELECT 17, 'Jonathan Milan',       3 UNION ALL
  SELECT 17, 'Kaden Groves',         4 UNION ALL
  SELECT 17, 'Dylan Groenewegen',    5 UNION ALL
  SELECT 17, 'Wout van Aert',        6 UNION ALL

  SELECT 18, 'Tadej Pogacar',        1 UNION ALL
  SELECT 18, 'Jonas Vingegaard',     2 UNION ALL
  SELECT 18, 'Remco Evenepoel',      3 UNION ALL
  SELECT 18, 'Primoz Roglic',        4 UNION ALL
  SELECT 18, 'Enric Mas',            5 UNION ALL
  SELECT 18, 'Ben O''Connor',        6 UNION ALL

  SELECT 19, 'Tadej Pogacar',        1 UNION ALL
  SELECT 19, 'Jonas Vingegaard',     2 UNION ALL
  SELECT 19, 'Remco Evenepoel',      3 UNION ALL
  SELECT 19, 'Primoz Roglic',        4 UNION ALL
  SELECT 19, 'Enric Mas',            5 UNION ALL
  SELECT 19, 'Ben O''Connor',        6 UNION ALL

  SELECT 20, 'Tadej Pogacar',        1 UNION ALL
  SELECT 20, 'Jonas Vingegaard',     2 UNION ALL
  SELECT 20, 'Remco Evenepoel',      3 UNION ALL
  SELECT 20, 'Primoz Roglic',        4 UNION ALL
  SELECT 20, 'Adam Yates',           5 UNION ALL
  SELECT 20, 'Enric Mas',            6 UNION ALL

  SELECT 21, 'Jasper Philipsen',     1 UNION ALL
  SELECT 21, 'Biniam Girmay',        2 UNION ALL
  SELECT 21, 'Jonathan Milan',       3 UNION ALL
  SELECT 21, 'Kaden Groves',         4 UNION ALL
  SELECT 21, 'Dylan Groenewegen',    5 UNION ALL
  SELECT 21, 'Wout van Aert',        6
) fav
JOIN stages s ON s.`number` = fav.num
JOIN riders r ON r.name = fav.name;
