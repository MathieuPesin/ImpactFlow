const csv = require('csv-parse');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const validateFile = async (file) => {
  try {
    const requiredColumns = ['entreprise', 'annee', 'scope', 'categorie', 'emissions_co2'];
    let headers = [];

    if (file.mimetype === 'text/csv') {
      const content = fs.readFileSync(file.path, 'utf-8');
      const records = await new Promise((resolve, reject) => {
        csv.parse(content, {
          columns: true,
          skip_empty_lines: true
        }, (err, records) => {
          if (err) reject(err);
          else resolve(records);
        });
      });
      
      if (records.length === 0) {
        return {
          isValid: false,
          errors: ['Le fichier est vide']
        };
      }
      
      headers = Object.keys(records[0]);
    } else {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      if (data.length === 0) {
        return {
          isValid: false,
          errors: ['Le fichier est vide']
        };
      }
      
      headers = Object.keys(data[0]);
    }

    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      return {
        isValid: false,
        errors: [`Colonnes manquantes: ${missingColumns.join(', ')}`]
      };
    }

    return {
      isValid: true
    };
  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    return {
      isValid: false,
      errors: ['Erreur lors de la lecture du fichier: ' + error.message]
    };
  }
};

const processFile = async (file) => {
  try {
    let data = [];

    if (file.mimetype === 'text/csv') {
      const content = fs.readFileSync(file.path, 'utf-8');
      data = await new Promise((resolve, reject) => {
        csv.parse(content, {
          columns: true,
          skip_empty_lines: true
        }, (err, records) => {
          if (err) reject(err);
          else resolve(records);
        });
      });
    } else {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(worksheet);
    }

    // Convertir les types de données
    data = data.map(row => ({
      ...row,
      annee: parseInt(row.annee),
      scope: parseInt(row.scope),
      emissions_co2: parseFloat(row.emissions_co2)
    }));

    return {
      raw: data,
      summary: {
        totalRows: data.length,
        totalEmissions: data.reduce((sum, row) => sum + row.emissions_co2, 0),
        uniqueCompanies: [...new Set(data.map(row => row.entreprise))].length
      }
    };
  } catch (error) {
    console.error('Erreur lors du traitement:', error);
    throw new Error('Erreur lors du traitement du fichier: ' + error.message);
  } finally {
    // Nettoyer le fichier temporaire
    fs.unlinkSync(file.path);
  }
};

module.exports = {
  validateFile,
  processFile
};
