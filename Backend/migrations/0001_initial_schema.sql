-- Cloudflare D1 migration – initial database schema
-- This file was generated manually based on the SQLAlchemy models.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL,
    updated_at TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS monitoring_stations (
    id TEXT PRIMARY KEY,
    location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT,
    external_station_id TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    is_active TEXT DEFAULT 'True' NOT NULL,
    created_at TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL,
    updated_at TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS air_quality_measurements (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL REFERENCES monitoring_stations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL,
    aqi REAL,
    pm25 REAL,
    pm10 REAL,
    no2 REAL,
    so2 REAL,
    co REAL,
    o3 REAL,
    source TEXT,
    created_at TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS weather_measurements (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL REFERENCES monitoring_stations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL,
    temperature REAL,
    humidity REAL,
    pressure REAL,
    wind_speed REAL,
    wind_direction REAL,
    visibility REAL,
    weather_condition TEXT,
    source TEXT,
    created_at TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS health_risk_records (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL REFERENCES monitoring_stations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL,
    risk_score REAL,
    risk_level TEXT,
    recommendation TEXT,
    affected_groups TEXT,
    basis TEXT,
    created_at TIMESTAMP DEFAULT (DATETIME('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_settings (
    id TEXT PRIMARY KEY,
    city TEXT NOT NULL,
    threshold_aqi REAL NOT NULL,
    fcm_token TEXT
);
