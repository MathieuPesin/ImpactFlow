<template>
  <div class="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Options d'Exportation</h2>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button 
        @click="exportPDF"
        class="w-full sm:w-48 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <span>Exporter en PDF</span>
        </div>
      </button>
      
      <button 
        @click="exportExcel"
        class="w-full sm:w-48 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-emerald-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
      >
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>Exporter en Excel</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'ExportOptions',
  
  methods: {
    async exportPDF() {
      try {
        const response = await axios.post('/api/exports/pdf', {}, {
          responseType: 'blob'
        });
        
        this.downloadFile(response.data, 'emissions-report.pdf');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        ElMessage.error('Erreur lors de l\'export en PDF');
      }
    },

    async exportExcel() {
      try {
        const response = await axios.post('/api/exports/excel', {}, {
          responseType: 'blob'
        });
        
        this.downloadFile(response.data, 'emissions-data.xlsx');
      } catch (error) {
        console.error('Error exporting Excel:', error);
        ElMessage.error('Erreur lors de l\'export en Excel');
      }
    },

    downloadFile(data, filename) {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  }
};
</script>

<style>
/* Les styles ne sont plus nécessaires car nous utilisons Tailwind */
</style>
