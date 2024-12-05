<template>
  <div class="emissions-view">
    <h1>Visualisation des Émissions</h1>
    <SankeyDiagram />
    <ExportOptions />
  </div>
</template>

<script>
import SankeyDiagram from '../components/SankeyDiagram.vue';
import ExportOptions from '../components/ExportOptions.vue';

export default {
  name: 'EmissionsView',
  components: {
    SankeyDiagram,
    ExportOptions
  }
};
</script>

<style scoped>
.emissions-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}
</style>
