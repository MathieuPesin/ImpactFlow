const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');

// Route pour récupérer les données pour le diagramme Sankey
router.get('/sankey', async (req, res) => {
  try {
    // Récupérer toutes les émissions
    const { data: emissions, error } = await supabase
      .from('emissions')
      .select('*')
      .order('company_name');

    if (error) {
      console.error('Error fetching emissions:', error);
      return res.status(500).json({ error: 'Failed to fetch emissions data' });
    }

    if (!emissions || emissions.length === 0) {
      console.log('No emissions data found');
      return res.json({ nodes: [], links: [] });
    }

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

    // Ajouter les nœuds de scope (deuxième colonne)
    const scopes = [1, 2, 3];
    scopes.forEach(scope => {
      const scopeName = `Scope ${scope}`;
      nodes.push({ name: scopeName });
      nodeMap.set(scopeName, nodeIndex++);
    });

    // Ajouter les nœuds de catégorie (troisième colonne)
    const categories = [...new Set(emissions.map(e => e.category))];
    categories.forEach(category => {
      nodes.push({ name: category });
      nodeMap.set(category, nodeIndex++);
    });

    // Créer les liens (entreprise -> scope -> catégorie)
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
      const scopeIndex = nodeMap.get(`Scope ${emission.scope}`);
      const categoryIndex = nodeMap.get(emission.category);
      
      if (companyIndex !== undefined && scopeIndex !== undefined && categoryIndex !== undefined) {
        // Lien entreprise -> scope
        links.push({
          source: companyIndex,
          target: scopeIndex,
          value: emission.value
        });
        
        // Lien scope -> catégorie
        links.push({
          source: scopeIndex,
          target: categoryIndex,
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

module.exports = router;
