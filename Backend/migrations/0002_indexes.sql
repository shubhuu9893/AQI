-- Indexes for performance on foreign keys and timestamp columns

CREATE INDEX IF NOT EXISTS idx_monitoring_stations_location_id ON monitoring_stations(location_id);
CREATE INDEX IF NOT EXISTS idx_air_quality_measurements_station_id ON air_quality_measurements(station_id);
CREATE INDEX IF NOT EXISTS idx_air_quality_measurements_timestamp ON air_quality_measurements(timestamp);
CREATE INDEX IF NOT EXISTS idx_weather_measurements_station_id ON weather_measurements(station_id);
CREATE INDEX IF NOT EXISTS idx_weather_measurements_timestamp ON weather_measurements(timestamp);
CREATE INDEX IF NOT EXISTS idx_health_risk_records_station_id ON health_risk_records(station_id);
CREATE INDEX IF NOT EXISTS idx_health_risk_records_timestamp ON health_risk_records(timestamp);
