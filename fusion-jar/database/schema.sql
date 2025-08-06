-- Create users table for Privy authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  privy_id TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create embedded_wallets table for Privy embedded wallets
CREATE TABLE IF NOT EXISTS embedded_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  privy_wallet_id TEXT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL DEFAULT 1, -- Default to Ethereum mainnet
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  last_login_date TIMESTAMP WITH TIME ZONE,
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
CREATE INDEX IF NOT EXISTS idx_users_privy_id ON users(privy_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_embedded_wallets_user_id ON embedded_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_embedded_wallets_privy_wallet_id ON embedded_wallets(privy_wallet_id);
CREATE INDEX IF NOT EXISTS idx_embedded_wallets_wallet_address ON embedded_wallets(wallet_address);
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
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_embedded_wallets_updated_at 
  BEFORE UPDATE ON embedded_wallets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_intents_updated_at 
  BEFORE UPDATE ON investment_intents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamification_data_updated_at 
  BEFORE UPDATE ON gamification_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedded_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_data ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.jwt() ->> 'privy_id' = privy_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.jwt() ->> 'privy_id' = privy_id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.jwt() ->> 'privy_id' = privy_id);

-- Embedded wallets policies
CREATE POLICY "Users can view own wallets" ON embedded_wallets
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE privy_id = auth.jwt() ->> 'privy_id'
    )
  );

CREATE POLICY "Users can insert own wallets" ON embedded_wallets
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE privy_id = auth.jwt() ->> 'privy_id'
    )
  );

-- Investment intents policies
CREATE POLICY "Users can view own intents" ON investment_intents
  FOR SELECT USING (user_address IN (
    SELECT wallet_address FROM embedded_wallets 
    WHERE user_id IN (
      SELECT id FROM users WHERE privy_id = auth.jwt() ->> 'privy_id'
    )
  ));

CREATE POLICY "Users can insert own intents" ON investment_intents
  FOR INSERT WITH CHECK (user_address IN (
    SELECT wallet_address FROM embedded_wallets 
    WHERE user_id IN (
      SELECT id FROM users WHERE privy_id = auth.jwt() ->> 'privy_id'
    )
  ));

-- Investment executions policies
CREATE POLICY "Users can view own executions" ON investment_executions
  FOR SELECT USING (user_address IN (
    SELECT wallet_address FROM embedded_wallets 
    WHERE user_id IN (
      SELECT id FROM users WHERE privy_id = auth.jwt() ->> 'privy_id'
    )
  ));

-- Gamification data policies
CREATE POLICY "Users can view own gamification data" ON gamification_data
  FOR SELECT USING (user_address IN (
    SELECT wallet_address FROM embedded_wallets 
    WHERE user_id IN (
      SELECT id FROM users WHERE privy_id = auth.jwt() ->> 'privy_id'
    )
  ));

CREATE POLICY "Users can update own gamification data" ON gamification_data
  FOR UPDATE USING (user_address IN (
    SELECT wallet_address FROM embedded_wallets 
    WHERE user_id IN (
      SELECT id FROM users WHERE privy_id = auth.jwt() ->> 'privy_id'
    )
  ));

CREATE POLICY "Users can insert own gamification data" ON gamification_data
  FOR INSERT WITH CHECK (user_address IN (
    SELECT wallet_address FROM embedded_wallets 
    WHERE user_id IN (
      SELECT id FROM users WHERE privy_id = auth.jwt() ->> 'privy_id'
    )
  ));

-- Insert some sample data for testing
INSERT INTO gamification_data (user_address, xp_points, current_streak, total_investments) 
VALUES 
  ('0x1234567890123456789012345678901234567890', 150, 3, 5),
  ('0x0987654321098765432109876543210987654321', 80, 1, 2)
ON CONFLICT (user_address) DO NOTHING; 