-- Create investment_intents table
CREATE TABLE IF NOT EXISTS investment_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  source_token TEXT NOT NULL,
  source_chain INTEGER NOT NULL,
  target_token TEXT NOT NULL,
  target_chain INTEGER NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  fee_tolerance DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  user_signature TEXT, -- User's signature authorizing execution
  signature_timestamp TIMESTAMP WITH TIME ZONE, -- When the signature was created
  signature_expiry TIMESTAMP WITH TIME ZONE, -- When the signature expires
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investment_executions table
CREATE TABLE IF NOT EXISTS investment_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_id UUID REFERENCES investment_intents(id),
  user_address TEXT NOT NULL,
  source_token TEXT NOT NULL,
  source_chain INTEGER NOT NULL,
  target_token TEXT NOT NULL,
  target_chain INTEGER NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  actual_amount_in TEXT,
  actual_amount_out TEXT,
  fee_paid TEXT,
  resolver_address TEXT,
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'failed', 'skipped')),
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gamification_data table
CREATE TABLE IF NOT EXISTS gamification_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL UNIQUE,
  xp_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_investments INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  last_investment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resolver_data table (for transparency)
CREATE TABLE IF NOT EXISTS resolver_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resolver_address TEXT NOT NULL,
  execution_id UUID REFERENCES investment_executions(id),
  fee_earned TEXT,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investment_intents_user_address ON investment_intents(user_address);
CREATE INDEX IF NOT EXISTS idx_investment_intents_status ON investment_intents(status);
CREATE INDEX IF NOT EXISTS idx_investment_executions_user_address ON investment_executions(user_address);
CREATE INDEX IF NOT EXISTS idx_investment_executions_status ON investment_executions(status);
CREATE INDEX IF NOT EXISTS idx_investment_executions_intent_id ON investment_executions(intent_id);
CREATE INDEX IF NOT EXISTS idx_gamification_data_user_address ON gamification_data(user_address);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_investment_intents_updated_at 
  BEFORE UPDATE ON investment_intents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamification_data_updated_at 
  BEFORE UPDATE ON gamification_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO gamification_data (user_address, xp_points, current_streak, total_investments) 
VALUES 
  ('0x1234567890123456789012345678901234567890', 150, 3, 5),
  ('0x0987654321098765432109876543210987654321', 80, 1, 2)
ON CONFLICT (user_address) DO NOTHING; 