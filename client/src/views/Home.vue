<template>
  <div class="home">
    <h1>ImactFlow - Visualisation des émissions CO2</h1>
    <SankeyDiagram />
  </div>
</template>

<script setup>
import SankeyDiagram from '@/components/SankeyDiagram.vue';
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 40px;
  color: #2c3e50;
}
</style>
