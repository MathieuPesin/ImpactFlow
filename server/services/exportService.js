const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const puppeteer = require('puppeteer');

class ExportService {
  async generatePDF(data) {
    // Créer un nouveau document PDF avec des marges personnalisées
    const doc = new PDFDocument({
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      size: 'A4'
    });

    // Ajouter une page de couverture
    this.addCoverPage(doc);
    
    // Ajouter un sommaire
    this.addTableOfContents(doc);
    
    // Ajouter la section des données consolidées
    this.addConsolidatedData(doc, data);
    
    // Ajouter les graphiques et visualisations
    await this.addVisualizations(doc, data);
    
    // Ajouter les détails par entreprise
    this.addCompanyDetails(doc, data);
    
    // Ajouter les notes méthodologiques
    this.addMethodologyNotes(doc);
    
    return doc;
  }

  addCoverPage(doc) {
    // Logo ou en-tête
    doc.fontSize(24)
      .fillColor('#2c3e50')
      .text('ImactFlow', { align: 'center' });
    
    doc.moveDown(2);
    
    // Titre du rapport
    doc.fontSize(28)
      .fillColor('#2c3e50')
      .text('Rapport des Émissions CO2', { align: 'center' });
    
    doc.moveDown();
    
    // Sous-titre avec la période
    doc.fontSize(14)
      .fillColor('#7f8c8d')
      .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    
    // Ajouter une nouvelle page
    doc.addPage();
  }

  addTableOfContents(doc) {
    doc.fontSize(20)
      .fillColor('#2c3e50')
      .text('Sommaire', { align: 'left' });
    
    doc.moveDown();
    
    const sections = [
      { title: '1. Résumé des Émissions', page: 3 },
      { title: '2. Visualisation des Flux', page: 4 },
      { title: '3. Détails par Entreprise', page: 5 },
      { title: '4. Notes Méthodologiques', page: 6 }
    ];
    
    sections.forEach(section => {
      doc.fontSize(12)
        .fillColor('#34495e')
        .text(section.title, {
          continued: true
        })
        .fillColor('#7f8c8d')
        .text(`......................... page ${section.page}`, { align: 'right' });
      
      doc.moveDown(0.5);
    });
    
    doc.addPage();
  }

  async addConsolidatedData(doc, data) {
    doc.fontSize(20)
      .fillColor('#2c3e50')
      .text('1. Résumé des Émissions', { align: 'left' });
    
    doc.moveDown();

    // Calcul des totaux
    const totals = this.calculateTotals(data);
    
    // Afficher les totaux
    doc.fontSize(14)
      .fillColor('#34495e')
      .text('Total des émissions:', { continued: true })
      .fillColor('#7f8c8d')
      .text(` ${totals.total.toFixed(2)} tCO2e`);
    
    doc.moveDown();
    
    // Afficher les totaux par scope
    doc.fontSize(14)
      .fillColor('#34495e')
      .text('Émissions par scope:');
    
    doc.fontSize(12);
    Object.entries(totals.byScope).forEach(([scope, value]) => {
      doc.fillColor('#34495e')
        .text(`  Scope ${scope}:`, { continued: true })
        .fillColor('#7f8c8d')
        .text(` ${value.toFixed(2)} tCO2e`);
    });
    
    doc.moveDown();
    
    // Afficher les top émetteurs
    doc.fontSize(14)
      .fillColor('#34495e')
      .text('Top 5 émetteurs:');
    
    doc.fontSize(12);
    totals.topEmitters.slice(0, 5).forEach((emitter, index) => {
      doc.fillColor('#34495e')
        .text(`  ${index + 1}. ${emitter.name}:`, { continued: true })
        .fillColor('#7f8c8d')
        .text(` ${emitter.value.toFixed(2)} tCO2e`);
    });
    
    doc.addPage();
  }

  async addVisualizations(doc, data) {
    doc.fontSize(20)
      .fillColor('#2c3e50')
      .text('2. Visualisation des Flux', { align: 'left' });
    
    doc.moveDown();

    try {
      // Créer une représentation textuelle du flux
      doc.fontSize(12)
        .fillColor('#34495e');

      // Grouper les données par scope
      const scopeTotals = { 1: 0, 2: 0, 3: 0 };
      const categoryTotals = {};
      const companyTotals = {};

      data.forEach(emission => {
        const value = parseFloat(emission.value) || 0;
        
        // Totaux par scope
        scopeTotals[emission.scope] += value;
        
        // Totaux par catégorie
        if (!categoryTotals[emission.category]) {
          categoryTotals[emission.category] = 0;
        }
        categoryTotals[emission.category] += value;
        
        // Totaux par entreprise
        if (!companyTotals[emission.company_name]) {
          companyTotals[emission.company_name] = 0;
        }
        companyTotals[emission.company_name] += value;
      });

      // Afficher les flux principaux
      doc.text('Flux des émissions :', { underline: true });
      doc.moveDown();

      // Entreprises -> Catégories
      doc.text('Entreprises principales :');
      Object.entries(companyTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([company, total]) => {
          doc.text(`  • ${company}: ${total.toFixed(2)} tCO2e`);
        });
      
      doc.moveDown();

      // Catégories -> Scopes
      doc.text('Répartition par catégorie :');
      Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, total]) => {
          doc.text(`  • ${category}: ${total.toFixed(2)} tCO2e`);
        });
      
      doc.moveDown();

      // Totaux par scope
      doc.text('Distribution par scope :');
      Object.entries(scopeTotals)
        .forEach(([scope, total]) => {
          doc.text(`  • Scope ${scope}: ${total.toFixed(2)} tCO2e`);
        });

      // Ajouter une légende explicative
      doc.moveDown(2);
      doc.fontSize(10)
        .fillColor('#7f8c8d')
        .text('Note : Ce diagramme représente les flux d\'émissions depuis les entreprises vers leurs catégories respectives, puis vers les scopes correspondants.', {
          align: 'center',
          width: 400
        });

    } catch (error) {
      console.error('Error generating visualization:', error);
      doc.fontSize(12)
        .fillColor('#e74c3c')
        .text('Une erreur est survenue lors de la génération de la visualisation.');
    }
    
    doc.addPage();
  }

  addCompanyDetails(doc, data) {
    doc.fontSize(20)
      .fillColor('#2c3e50')
      .text('3. Détails par Entreprise', { align: 'left' });
    
    doc.moveDown();
    
    // Grouper les données par entreprise
    const companies = this.groupByCompany(data);
    
    // Afficher les détails pour chaque entreprise
    Object.entries(companies).forEach(([company, emissions]) => {
      doc.fontSize(16)
        .fillColor('#2c3e50')
        .text(company);
      
      doc.moveDown(0.5);
      
      // Afficher les émissions par scope
      const scopeTotals = this.calculateScopeTotals(emissions);
      Object.entries(scopeTotals).forEach(([scope, total]) => {
        doc.fontSize(12)
          .fillColor('#34495e')
          .text(`Scope ${scope}:`, { continued: true })
          .fillColor('#7f8c8d')
          .text(` ${total.toFixed(2)} tCO2e`);
      });
      
      doc.moveDown();
      
      // Afficher les émissions par catégorie
      const categoryTotals = this.calculateCategoryTotals(emissions);
      doc.fontSize(12)
        .fillColor('#34495e')
        .text('Émissions par catégorie:');
      
      Object.entries(categoryTotals).forEach(([category, total]) => {
        doc.fontSize(12)
          .fillColor('#34495e')
          .text(`  ${category}:`, { continued: true })
          .fillColor('#7f8c8d')
          .text(` ${total.toFixed(2)} tCO2e`);
      });
      
      doc.moveDown(2);
    });
    
    doc.addPage();
  }

  addMethodologyNotes(doc) {
    doc.fontSize(20)
      .fillColor('#2c3e50')
      .text('4. Notes Méthodologiques', { align: 'left' });
    
    doc.moveDown();
    
    const notes = [
      {
        title: 'Périmètre de calcul',
        content: 'Les émissions sont calculées selon les standards du GHG Protocol, couvrant les scopes 1, 2 et 3.'
      },
      {
        title: 'Facteurs d\'émission',
        content: 'Les facteurs d\'émission utilisés proviennent de bases de données reconnues (ADEME, DEFRA, etc.).'
      },
      {
        title: 'Méthodologie de collecte',
        content: 'Les données sont collectées auprès des entreprises via des questionnaires standardisés et vérifiées par nos experts.'
      }
    ];
    
    notes.forEach(note => {
      doc.fontSize(14)
        .fillColor('#34495e')
        .text(note.title);
      
      doc.moveDown(0.5);
      
      doc.fontSize(12)
        .fillColor('#7f8c8d')
        .text(note.content);
      
      doc.moveDown(2);
    });
  }

  calculateTotals(data) {
    const totals = {
      total: 0,
      byScope: { 1: 0, 2: 0, 3: 0 },
      byCompany: {},
      topEmitters: []
    };
    
    data.forEach(emission => {
      const value = parseFloat(emission.value) || 0;
      totals.total += value;
      totals.byScope[emission.scope] += value;
      
      if (!totals.byCompany[emission.company_name]) {
        totals.byCompany[emission.company_name] = 0;
      }
      totals.byCompany[emission.company_name] += value;
    });
    
    // Calculer les top émetteurs
    totals.topEmitters = Object.entries(totals.byCompany)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    return totals;
  }

  groupByCompany(data) {
    const companies = {};
    
    data.forEach(emission => {
      if (!companies[emission.company_name]) {
        companies[emission.company_name] = [];
      }
      companies[emission.company_name].push(emission);
    });
    
    return companies;
  }

  calculateScopeTotals(emissions) {
    const totals = { 1: 0, 2: 0, 3: 0 };
    
    emissions.forEach(emission => {
      totals[emission.scope] += parseFloat(emission.value) || 0;
    });
    
    return totals;
  }

  calculateCategoryTotals(emissions) {
    const totals = {};
    
    emissions.forEach(emission => {
      if (!totals[emission.category]) {
        totals[emission.category] = 0;
      }
      totals[emission.category] += parseFloat(emission.value) || 0;
    });
    
    return totals;
  }

  async generateExcel(data) {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();
    
    // Créer la feuille de résumé
    const summaryData = this.prepareSummaryData(data);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');
    
    // Créer la feuille de données détaillées
    const detailsSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Données Détaillées');
    
    // Créer la feuille par entreprise
    const companyData = this.prepareCompanyData(data);
    const companySheet = XLSX.utils.json_to_sheet(companyData);
    XLSX.utils.book_append_sheet(workbook, companySheet, 'Par Entreprise');
    
    return workbook;
  }

  prepareSummaryData(data) {
    const totals = this.calculateTotals(data);
    
    return [
      { Métrique: 'Total des émissions', Valeur: totals.total.toFixed(2) },
      { Métrique: 'Émissions Scope 1', Valeur: totals.byScope[1].toFixed(2) },
      { Métrique: 'Émissions Scope 2', Valeur: totals.byScope[2].toFixed(2) },
      { Métrique: 'Émissions Scope 3', Valeur: totals.byScope[3].toFixed(2) },
      { Métrique: 'Nombre d\'entreprises', Valeur: Object.keys(totals.byCompany).length }
    ];
  }

  prepareCompanyData(data) {
    const companies = this.groupByCompany(data);
    const companyData = [];
    
    Object.entries(companies).forEach(([company, emissions]) => {
      const scopeTotals = this.calculateScopeTotals(emissions);
      const categoryTotals = this.calculateCategoryTotals(emissions);
      
      companyData.push({
        Entreprise: company,
        'Total Scope 1': scopeTotals[1].toFixed(2),
        'Total Scope 2': scopeTotals[2].toFixed(2),
        'Total Scope 3': scopeTotals[3].toFixed(2),
        'Total': Object.values(scopeTotals).reduce((a, b) => a + b, 0).toFixed(2),
        'Catégories': Object.entries(categoryTotals)
          .map(([cat, val]) => `${cat}: ${val.toFixed(2)}`)
          .join('; ')
      });
    });
    
    return companyData;
  }
}

module.exports = new ExportService();
