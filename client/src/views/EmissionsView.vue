<template>
  <div class="emissions-view">
    <h2>Visualisation des Émissions CO2</h2>
    <sankey-diagram />
  </div>
</template>

<script>
import SankeyDiagram from '@/components/SankeyDiagram.vue'

export default {
  name: 'EmissionsView',
  components: {
    SankeyDiagram
  }
}
</script>

<style scoped>
.emissions-view {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}
</style>
