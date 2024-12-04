-- Create emissions table
CREATE TABLE IF NOT EXISTS emissions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_name TEXT NOT NULL,
    scope INTEGER CHECK (scope IN (1, 2, 3)),
    value DECIMAL NOT NULL,
    year INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emissions_company ON emissions(company_name);
CREATE INDEX IF NOT EXISTS idx_emissions_scope ON emissions(scope);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE TRIGGER update_emissions_updated_at
    BEFORE UPDATE ON emissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
