-- Migration to add last_login_date column to existing gamification_data table
-- Run this if you have an existing database

ALTER TABLE gamification_data 
ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMP WITH TIME ZONE;