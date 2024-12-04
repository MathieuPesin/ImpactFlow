const { supabase } = require('./supabaseClient');

async function initDatabase() {
  try {
    console.log('Checking if emissions table exists...');
    
    // Vérifier si la table existe
    const { data: existingTable, error: checkError } = await supabase
      .from('emissions')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('Table does not exist, creating...');
      
      // Créer la table emissions
      const { error: createError } = await supabase
        .rpc('create_emissions_table');

      if (createError) {
        console.error('Error creating emissions table:', createError);
        throw createError;
      }

      console.log('Emissions table created successfully');
    } else if (checkError) {
      console.error('Error checking table:', checkError);
      throw checkError;
    } else {
      console.log('Emissions table already exists');
    }

  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = { initDatabase };
