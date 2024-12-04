<template>
  <div class="upload-container">
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <h2>Import de Données Carbone</h2>
          <el-button type="primary" size="large" @click="$router.push('/')">
            Voir la Visualisation
            <el-icon class="el-icon--right"><arrow-right /></el-icon>
          </el-button>
        </div>
      </template>
      
      <el-upload
        class="upload-component"
        drag
        action="/api/upload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :headers="headers"
        name="file"
        accept=".csv,.xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Déposez votre fichier ici ou <em>cliquez pour sélectionner</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            Formats acceptés: CSV, Excel (.xlsx, .xls)
          </div>
        </template>
      </el-upload>

      <div v-if="uploadStatus" :class="['upload-status', uploadStatus.type]">
        {{ uploadStatus.message }}
      </div>

      <div v-if="previewData.length > 0" class="preview-section">
        <h3>Aperçu des données</h3>
        <el-table
          :data="previewData.slice(0, 5)"
          style="width: 100%"
          border
        >
          <el-table-column
            v-for="column in tableColumns"
            :key="column"
            :prop="column"
            :label="column"
          />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ArrowRight, UploadFilled } from '@element-plus/icons-vue'

export default {
  name: 'Upload',
  components: {
    ArrowRight,
    UploadFilled
  },
  setup() {
    const previewData = ref([])
    const tableColumns = ref([])
    const uploadStatus = ref(null)
    const headers = {
      'Accept': 'application/json'
    }

    const handleSuccess = (response) => {
      console.log('Upload success:', response)
      uploadStatus.value = {
        type: 'success',
        message: 'Fichier importé avec succès'
      }
      // Rediriger vers la visualisation après un court délai
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }

    const handleError = (error) => {
      console.log('Upload error:', error)
      uploadStatus.value = {
        type: 'error',
        message: 'Erreur lors de l\'import du fichier'
      }
    }

    const beforeUpload = (file) => {
      const isCSV = file.type === 'text/csv'
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel'
      
      if (!isCSV && !isExcel) {
        uploadStatus.value = {
          type: 'error',
          message: 'Seuls les fichiers CSV et Excel sont acceptés'
        }
        return false
      }
      
      uploadStatus.value = {
        type: 'info',
        message: 'Import en cours...'
      }
      return true
    }

    return {
      previewData,
      tableColumns,
      uploadStatus,
      headers,
      handleSuccess,
      handleError,
      beforeUpload
    }
  }
}
</script>

<style scoped>
.upload-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.upload-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
}

.upload-component {
  margin: 20px 0;
}

.upload-status {
  margin: 20px 0;
  padding: 10px;
  border-radius: 4px;
}

.upload-status.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.upload-status.error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.upload-status.info {
  background-color: #f4f4f5;
  color: #909399;
}

.preview-section {
  margin-top: 30px;
}

.preview-section h3 {
  margin-bottom: 20px;
}
</style>
