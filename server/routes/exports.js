const express = require('express');
const router = express.Router();
const exportService = require('../services/exportService');
const { supabase } = require('../utils/supabaseClient');

// Route pour exporter en PDF
router.post('/pdf', async (req, res) => {
  try {
    console.log('Starting PDF export...');
    
    // Récupérer toutes les données
    const { data: emissions, error } = await supabase
      .from('emissions')
      .select('*')
      .order('company_name');

    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }

    if (!emissions || emissions.length === 0) {
      throw new Error('No emissions data found');
    }

    console.log(`Found ${emissions.length} emission records`);

    // Générer le PDF
    const doc = await exportService.generatePDF(emissions);
    
    // Configuration de la réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=emissions-report.pdf');
    
    // Streaming du PDF
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF report',
      details: error.message 
    });
  }
});

// Route pour exporter en Excel
router.post('/excel', async (req, res) => {
  try {
    console.log('Starting Excel export...');
    
    // Récupérer toutes les données
    const { data: emissions, error } = await supabase
      .from('emissions')
      .select('*')
      .order('company_name');

    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }

    if (!emissions || emissions.length === 0) {
      throw new Error('No emissions data found');
    }

    console.log(`Found ${emissions.length} emission records`);

    // Générer le fichier Excel
    const workbook = await exportService.generateExcel(emissions);
    
    // Configuration de la réponse
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=emissions-data.xlsx');
    
    // Envoyer le fichier
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ 
      error: 'Failed to generate Excel file',
      details: error.message 
    });
  }
});

module.exports = router;
