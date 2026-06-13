-- Schema for the Tour stage winner app. Runs automatically on first
-- database startup (docker-entrypoint-initdb.d).

CREATE TABLE riders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  person_id INT UNSIGNED NULL,
  number SMALLINT UNSIGNED NULL,
  name VARCHAR(100) NOT NULL,
  team VARCHAR(100) NOT NULL DEFAULT '',
  out_of_race TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_riders_name (name),
  UNIQUE KEY uq_riders_person_id (person_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE stages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `number` TINYINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  start VARCHAR(100) NOT NULL,
  finish VARCHAR(100) NOT NULL,
  distance_km SMALLINT UNSIGNED NOT NULL,
  stage_type ENUM ('vlakke rit', 'heuvelrit', 'bergrit', 'tijdrit', 'ploegentijdrit') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_stages_number (`number`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Suggested winners per stage, ordered by position.
CREATE TABLE stage_favorites (
  stage_id INT UNSIGNED NOT NULL,
  rider_id INT UNSIGNED NOT NULL,
  position TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (stage_id, rider_id),
  CONSTRAINT fk_favorites_stage FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_rider FOREIGN KEY (rider_id) REFERENCES riders (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE votes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stage_id INT UNSIGNED NOT NULL,
  rider_id INT UNSIGNED NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_votes_stage FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE,
  CONSTRAINT fk_votes_rider FOREIGN KEY (rider_id) REFERENCES riders (id) ON DELETE CASCADE,
  INDEX idx_votes_stage_rider (stage_id, rider_id),
  UNIQUE KEY uq_votes_stage_user (stage_id, user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- General Classification standings, refreshed hourly by the cron job.
CREATE TABLE gc_standings (
  `rank` SMALLINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  team VARCHAR(100) NOT NULL,
  result VARCHAR(20) NOT NULL,
  time_gap INT NOT NULL,
  PRIMARY KEY (`rank`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Aggregated vote counts per (stage, rider) — the only public face of votes.
CREATE VIEW stage_results AS
SELECT stage_id, rider_id, COUNT(*) AS total_votes
FROM votes
GROUP BY stage_id, rider_id;
