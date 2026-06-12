-- Seed: riders, the official 2026 Tour route, suggested favorites per stage
-- type, and a few sample votes on stage 1.

INSERT INTO riders (name, team) VALUES
  ('Tadej Pogacar', 'UAE Team Emirates'),
  ('Jonas Vingegaard', 'Visma | Lease a Bike'),
  ('Florian Lipowitz', 'Red Bull - BORA - hansgrohe'),
  ('Oscar Onley', 'Picnic PostNL'),
  ('Felix Gall', 'Decathlon AG2R La Mondiale'),
  ('Tobias Halland Johannessen', 'Uno-X Mobility'),
  ('Kévin Vauquelin', 'Arkéa - B&B Hotels'),
  ('Primoz Roglic', 'Red Bull - BORA - hansgrohe'),
  ('Ben Healy', 'EF Education - EasyPost'),
  ('Jordan Jegat', 'TotalEnergies'),
  ('Mathieu van der Poel', 'Alpecin - Deceuninck'),
  ('Jasper Philipsen', 'Alpecin - Deceuninck'),
  ('Wout van Aert', 'Visma | Lease a Bike'),
  ('Remco Evenepoel', 'Soudal Quick-Step'),
  ('Biniam Girmay', 'Intermarché - Wanty');

INSERT INTO stages (`number`, `date`, start, finish, distance_km, stage_type) VALUES
  (1, '2026-07-04', 'Barcelona', 'Barcelona', 19, 'ploegentijdrit'),
  (2, '2026-07-05', 'Tarragona', 'Barcelona', 182, 'heuvelrit'),
  (3, '2026-07-06', 'Granollers', 'Les Angles', 196, 'bergrit'),
  (4, '2026-07-07', 'Carcassonne', 'Foix', 182, 'heuvelrit'),
  (5, '2026-07-08', 'Lannemezan', 'Pau', 158, 'vlakke rit'),
  (6, '2026-07-09', 'Pau', 'Gavarnie-Cèdre', 186, 'bergrit'),
  (7, '2026-07-10', 'Hagetmau', 'Bordeaux', 175, 'vlakke rit'),
  (8, '2026-07-11', 'Périgueux', 'Bergerac', 182, 'vlakke rit'),
  (9, '2026-07-12', 'Malemort', 'Ussel', 185, 'heuvelrit'),
  (10, '2026-07-14', 'Aurillac', 'Le Lioran', 167, 'heuvelrit'),
  (11, '2026-07-15', 'Vichy', 'Nevers', 161, 'vlakke rit'),
  (12, '2026-07-16', 'Magny-Cours', 'Châlon-sur-Saône', 181, 'vlakke rit'),
  (13, '2026-07-17', 'Dole', 'Belfort', 205, 'heuvelrit'),
  (14, '2026-07-18', 'Mulhouse', 'Le Markstein', 155, 'bergrit'),
  (15, '2026-07-19', 'Champagnole', 'Plateau de Solaison', 184, 'bergrit'),
  (16, '2026-07-21', 'Évian-les-Bains', 'Thonon-les-Bains', 26, 'tijdrit'),
  (17, '2026-07-22', 'Chambéry', 'Voiron', 175, 'vlakke rit'),
  (18, '2026-07-23', 'Voiron', 'Orcières-Merlette', 185, 'bergrit'),
  (19, '2026-07-24', 'Gap', 'Alpe d''Huez', 128, 'bergrit'),
  (20, '2026-07-25', 'Le Bourg-d''Oisans', 'Alpe d''Huez', 171, 'bergrit'),
  (21, '2026-07-26', 'Thoiry', 'Parijs', 130, 'vlakke rit');

-- Suggested favorites per stage type.
INSERT INTO stage_favorites (stage_id, rider_id, position)
SELECT s.id, r.id, fav.position
FROM stages s
JOIN (
  SELECT 'vlakke rit' AS stage_type, 'Jasper Philipsen' AS name, 1 AS position
  UNION ALL SELECT 'vlakke rit', 'Biniam Girmay', 2
  UNION ALL SELECT 'vlakke rit', 'Wout van Aert', 3
  UNION ALL SELECT 'vlakke rit', 'Mathieu van der Poel', 4
  UNION ALL SELECT 'heuvelrit', 'Mathieu van der Poel', 1
  UNION ALL SELECT 'heuvelrit', 'Wout van Aert', 2
  UNION ALL SELECT 'heuvelrit', 'Remco Evenepoel', 3
  UNION ALL SELECT 'heuvelrit', 'Tadej Pogacar', 4
  UNION ALL SELECT 'bergrit', 'Tadej Pogacar', 1
  UNION ALL SELECT 'bergrit', 'Jonas Vingegaard', 2
  UNION ALL SELECT 'bergrit', 'Remco Evenepoel', 3
  UNION ALL SELECT 'bergrit', 'Florian Lipowitz', 4
  UNION ALL SELECT 'tijdrit', 'Remco Evenepoel', 1
  UNION ALL SELECT 'tijdrit', 'Tadej Pogacar', 2
  UNION ALL SELECT 'tijdrit', 'Jonas Vingegaard', 3
  UNION ALL SELECT 'tijdrit', 'Wout van Aert', 4
  UNION ALL SELECT 'ploegentijdrit', 'Remco Evenepoel', 1
  UNION ALL SELECT 'ploegentijdrit', 'Tadej Pogacar', 2
  UNION ALL SELECT 'ploegentijdrit', 'Jonas Vingegaard', 3
  UNION ALL SELECT 'ploegentijdrit', 'Wout van Aert', 4
) fav ON fav.stage_type = s.stage_type
JOIN riders r ON r.name = fav.name;

-- Sample votes on stage 1 so stage_results has data from day one.
INSERT INTO votes (stage_id, rider_id)
SELECT (SELECT id FROM stages WHERE `number` = 1), (SELECT id FROM riders WHERE name = 'Jonas Vingegaard')
FROM seq_1_to_6;

INSERT INTO votes (stage_id, rider_id)
SELECT (SELECT id FROM stages WHERE `number` = 1), (SELECT id FROM riders WHERE name = 'Tadej Pogacar')
FROM seq_1_to_4;

INSERT INTO votes (stage_id, rider_id)
SELECT (SELECT id FROM stages WHERE `number` = 1), (SELECT id FROM riders WHERE name = 'Remco Evenepoel')
FROM seq_1_to_2;
