const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');

// Route pour récupérer les données pour le diagramme Sankey
router.get('/sankey', async (req, res) => {
  try {
    console.log('Fetching emissions data from Supabase...');
    // Récupérer toutes les émissions
    const { data: emissions, error } = await supabase
      .from('emissions')
      .select('*')
      .order('company_name');

    if (error) {
      console.error('Error fetching emissions:', error);
      return res.status(500).json({ error: 'Failed to fetch emissions data' });
    }

    console.log('Raw emissions data:', emissions);

    if (!emissions || emissions.length === 0) {
      console.log('No emissions data found');
      return res.json({ nodes: [], links: [] });
    }

    console.log(`Found ${emissions.length} emission records`);

    // Transformer les données pour le format Sankey
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    let nodeIndex = 0;

    // Ajouter les nœuds d'entreprise (première colonne)
    const companies = [...new Set(emissions.map(e => e.company_name))];
    companies.forEach(company => {
      nodes.push({ name: company });
      nodeMap.set(company, nodeIndex++);
    });

    // Ajouter les nœuds de catégorie (deuxième colonne)
    const categories = [...new Set(emissions.map(e => e.category))];
    categories.forEach(category => {
      nodes.push({ name: category });
      nodeMap.set(category, nodeIndex++);
    });

    // Ajouter les nœuds de scope (troisième colonne)
    const scopes = [1, 2, 3];
    scopes.forEach(scope => {
      const scopeName = `Scope ${scope}`;
      nodes.push({ name: scopeName });
      nodeMap.set(scopeName, nodeIndex++);
    });

    // Créer les liens (entreprise -> catégorie -> scope)
    const uniqueEmissions = emissions.reduce((acc, emission) => {
      const key = `${emission.company_name}-${emission.scope}-${emission.category}`;
      if (!acc[key]) {
        acc[key] = emission;
      } else {
        acc[key].value += emission.value;
      }
      return acc;
    }, {});

    Object.values(uniqueEmissions).forEach(emission => {
      const companyIndex = nodeMap.get(emission.company_name);
      const categoryIndex = nodeMap.get(emission.category);
      const scopeIndex = nodeMap.get(`Scope ${emission.scope}`);
      
      if (companyIndex !== undefined && categoryIndex !== undefined && scopeIndex !== undefined) {
        // Lien entreprise -> catégorie
        links.push({
          source: companyIndex,
          target: categoryIndex,
          value: emission.value
        });
        
        // Lien catégorie -> scope
        links.push({
          source: categoryIndex,
          target: scopeIndex,
          value: emission.value
        });
      }
    });

    const result = { nodes, links };
    console.log('Sending Sankey data:', result);
    res.json(result);

  } catch (error) {
    console.error('Error in /sankey route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new emission data
router.post('/', async (req, res) => {
  try {
    const { company_name, scope, value, year } = req.body;

    const { data, error } = await supabase
      .from('emissions')
      .insert([
        { company_name, scope, value, year }
      ]);

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding emission:', error);
    res.status(500).json({ error: 'Failed to add emission data' });
  }
});

// Route pour supprimer toutes les données
router.delete('/all', async (req, res) => {
  try {
    const { error } = await supabase
      .from('emissions')
      .delete()
      .neq('id', 0); // Supprime toutes les lignes

    if (error) {
      console.error('Error deleting all emissions:', error);
      return res.status(500).json({ error: 'Failed to delete emissions data' });
    }

    console.log('All emissions data deleted successfully');
    res.json({ message: 'All emissions data deleted successfully' });
  } catch (error) {
    console.error('Error in /delete/all route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
