-- ─────────────────────────────────────────────────────────────────────────────
-- HABIT.FIT — MySQL Database Schema
-- Run this entire file in MySQL Workbench:
--   File → Open SQL Script → select this file → click ⚡ (Execute All)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS habitfit
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE habitfit;

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           BIGINT        AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120)  NOT NULL,
  email        VARCHAR(255)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NULL COMMENT 'NULL for Google OAuth users',
  picture      TEXT          NULL,
  provider     ENUM('email','google') NOT NULL DEFAULT 'email',
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Habits ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id           BIGINT        AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT        NOT NULL,
  name         VARCHAR(120)  NOT NULL,
  goal         VARCHAR(255)  NOT NULL DEFAULT 'Daily',
  icon         VARCHAR(10)   NOT NULL DEFAULT '🎯',
  color        VARCHAR(20)   NOT NULL DEFAULT '#22d3a8',
  color_dim    VARCHAR(50)   NOT NULL DEFAULT 'rgba(34,211,168,0.12)',
  streak       INT           NOT NULL DEFAULT 0,
  completion   INT           NOT NULL DEFAULT 0 COMMENT 'Percentage 0-100',
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATE          NOT NULL DEFAULT (CURRENT_DATE),
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_habits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Daily Completions ──────────────────────────────────────────────────────
-- One row per habit per day it was marked done
CREATE TABLE IF NOT EXISTS completions (
  id           BIGINT        AUTO_INCREMENT PRIMARY KEY,
  habit_id     BIGINT        NOT NULL,
  user_id      BIGINT        NOT NULL,
  completed_on DATE          NOT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_habit_day (habit_id, completed_on),
  CONSTRAINT fk_comp_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  CONSTRAINT fk_comp_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
);

-- ── Useful indexes ─────────────────────────────────────────────────────────
CREATE INDEX idx_habits_user      ON habits(user_id);
CREATE INDEX idx_completions_user ON completions(user_id);
CREATE INDEX idx_completions_date ON completions(completed_on);

-- ─────────────────────────────────────────────────────────────────────────────
-- USEFUL QUERIES (for reference / testing in Workbench)
-- ─────────────────────────────────────────────────────────────────────────────

-- Get all habits for a user:
-- SELECT * FROM habits WHERE user_id = 1 AND is_active = 1;

-- Get today's completions for a user:
-- SELECT h.name, h.icon, c.completed_on
-- FROM completions c JOIN habits h ON c.habit_id = h.id
-- WHERE c.user_id = 1 AND c.completed_on = CURDATE();

-- Get completion count per day for calendar view (last 30 days):
-- SELECT completed_on, COUNT(*) AS done_count
-- FROM completions
-- WHERE user_id = 1 AND completed_on >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
-- GROUP BY completed_on ORDER BY completed_on;

-- Get weekly report (last 7 days):
-- SELECT
--   c.completed_on,
--   COUNT(c.id)    AS completed,
--   (SELECT COUNT(*) FROM habits WHERE user_id = 1 AND is_active = 1) AS total
-- FROM completions c
-- WHERE c.user_id = 1 AND c.completed_on >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
-- GROUP BY c.completed_on
-- ORDER BY c.completed_on;
