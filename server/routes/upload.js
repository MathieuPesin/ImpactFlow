const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');
const { supabase } = require('../utils/supabaseClient');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route pour l'upload de fichier
router.post('/', upload.single('file'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    tempFilePath = req.file.path;
    console.log('Fichier reçu:', req.file.originalname, 'Path:', tempFilePath);

    // Vérifier que le fichier existe
    if (!fs.existsSync(tempFilePath)) {
      console.error('File not found:', tempFilePath);
      return res.status(500).json({ error: 'File not found after upload' });
    }

    // Lire et parser le fichier CSV
    const results = [];
    const parser = fs.createReadStream(tempFilePath)
      .pipe(csv.parse({ 
        columns: true, 
        trim: true,
        skip_empty_lines: true
      }));

    parser.on('data', (data) => {
      // Convertir et valider les données
      const emission = {
        company_name: data.entreprise,
        scope: parseInt(data.scope),
        category: data.categorie || 'Non catégorisé', // Utiliser directement la catégorie du CSV
        value: parseFloat(data.emissions_co2),
        year: parseInt(data.annee) || new Date().getFullYear()
      };
      
      // Vérifier que les données sont valides
      if (emission.company_name && !isNaN(emission.scope) && !isNaN(emission.value)) {
        results.push(emission);
      } else {
        console.warn('Invalid data row:', data);
      }
    });

    parser.on('end', async () => {
      try {
        console.log('Parsed data:', results);
        
        if (results.length === 0) {
          return res.status(400).json({ error: 'No valid data found in CSV' });
        }

        // Insérer les données dans Supabase
        const { data, error } = await supabase
          .from('emissions')
          .insert(results);

        if (error) {
          console.error('Supabase insert error:', error);
          return res.status(500).json({ error: 'Failed to insert data' });
        }

        console.log('Data inserted successfully');
        res.json({ 
          message: 'File uploaded and processed successfully',
          rowsInserted: results.length
        });
      } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
      } finally {
        // Nettoyer le fichier temporaire
        try {
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log('Temporary file deleted:', tempFilePath);
          }
        } catch (err) {
          console.error('Error deleting temporary file:', err);
        }
      }
    });

    parser.on('error', (error) => {
      console.error('CSV parsing error:', error);
      res.status(500).json({ error: 'Failed to parse CSV file' });
    });

  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ error: 'Internal server error' });
    
    // Nettoyer le fichier temporaire en cas d'erreur
    try {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log('Temporary file deleted after error:', tempFilePath);
      }
    } catch (err) {
      console.error('Error deleting temporary file:', err);
    }
  }
});

module.exports = router;
