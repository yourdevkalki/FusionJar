-- Migration to support new Invest.tsx UI features
-- Add new columns to investment_intents table

ALTER TABLE investment_intents 
ADD COLUMN IF NOT EXISTS jar_name TEXT,
ADD COLUMN IF NOT EXISTS amount DECIMAL(15,6),
ADD COLUMN IF NOT EXISTS amount_unit TEXT,
ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS save_as_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gas_limit TEXT,
ADD COLUMN IF NOT EXISTS min_slippage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS deadline_minutes INTEGER,
ADD COLUMN IF NOT EXISTS stop_after_swaps INTEGER;

-- Update frequency column to support new values
ALTER TABLE investment_intents 
DROP CONSTRAINT IF EXISTS investment_intents_frequency_check;

ALTER TABLE investment_intents 
ADD CONSTRAINT investment_intents_frequency_check 
CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom'));

-- Create index for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_investment_intents_start_date ON investment_intents(start_date);
CREATE INDEX IF NOT EXISTS idx_investment_intents_jar_name ON investment_intents(jar_name);

-- Create templates table for saved templates
CREATE TABLE IF NOT EXISTS investment_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  template_name TEXT NOT NULL,
  source_token TEXT NOT NULL,
  source_chain INTEGER NOT NULL,
  target_token TEXT NOT NULL,
  target_chain INTEGER NOT NULL,
  amount DECIMAL(15,6) NOT NULL,
  amount_unit TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  interval_days INTEGER DEFAULT 1,
  gas_limit TEXT,
  min_slippage DECIMAL(5,2),
  deadline_minutes INTEGER,
  stop_after_swaps INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for templates table
CREATE INDEX IF NOT EXISTS idx_investment_templates_user_address ON investment_templates(user_address);
CREATE INDEX IF NOT EXISTS idx_investment_templates_template_name ON investment_templates(template_name);

-- Create trigger for updated_at on templates
CREATE TRIGGER update_investment_templates_updated_at 
  BEFORE UPDATE ON investment_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data with new structure
INSERT INTO investment_intents (
  user_address, 
  source_token, 
  source_chain, 
  target_token, 
  target_chain, 
  jar_name,
  amount, 
  amount_unit,
  frequency, 
  interval_days,
  start_date,
  min_slippage,
  status
) VALUES 
(
  '0x1234567890123456789012345678901234567890',
  '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C',
  1,
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  1,
  'My Weekly USDC → USDT Jar',
  100.0,
  'USDC',
  'weekly',
  7,
  CURRENT_DATE + INTERVAL '1 day',
  0.5,
  'active'
) ON CONFLICT DO NOTHING;