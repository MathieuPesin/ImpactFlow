const path = require('path');
const envPath = path.join(__dirname, '../../.env');
console.log('Loading .env from (supabaseClient):', envPath);
require('dotenv').config({ path: envPath });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('\nSupabase Configuration:');
console.log('URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Key:', supabaseKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseKey) {
    console.error('\nERROR: Missing Supabase environment variables!');
    console.error('Please check your .env file and ensure both SUPABASE_URL and SUPABASE_ANON_KEY are set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase client initialized successfully');

module.exports = { supabase };
