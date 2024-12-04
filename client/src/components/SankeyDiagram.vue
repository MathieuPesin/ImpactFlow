<template>
  <div class="sankey-container">
    <div v-if="loading" class="loading">Chargement des données...</div>
    <div v-if="error" class="error">Erreur : {{ error }}</div>
    <div ref="sankeyChart" class="sankey-chart"></div>
  </div>
</template>

<script>
import Plotly from 'plotly.js-dist';

export default {
  name: 'SankeyDiagram',
  data() {
    return {
      loading: false,
      error: null,
      data: null
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      console.log('Fetching data from API...');

      try {
        const response = await fetch('/api/emissions/sankey');
        const data = await response.json();
        console.log('Received data:', data);

        if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
          console.log('No data found, using mock data');
          this.data = this.getMockData();
        } else {
          this.data = data;
        }

        this.updateChart();
      } catch (error) {
        console.error('Error fetching data:', error);
        this.error = error.message;
        this.data = this.getMockData();
        this.updateChart();
      } finally {
        this.loading = false;
      }
    },
    updateChart() {
      console.log('Processed data:', this.data);

      const data = [{
        type: "sankey",
        orientation: "h",
        node: {
          pad: 15,
          thickness: 30,
          line: {
            color: "black",
            width: 0.5
          },
          label: this.data.nodes.map(n => n.name),
          color: this.data.nodes.map(() => '#3498db')
        },
        link: {
          source: this.data.links.map(l => l.source),
          target: this.data.links.map(l => l.target),
          value: this.data.links.map(l => l.value)
        }
      }];

      const layout = {
        title: "Émissions CO2 par Entreprise et Scope",
        font: {
          size: 12
        },
        width: 800,
        height: 600
      };

      const config = {
        responsive: true,
        displayModeBar: true
      };

      Plotly.newPlot(this.$refs.sankeyChart, data, layout, config);
    },
    getMockData() {
      return {
        nodes: [
          { name: 'Entreprise A' },
          { name: 'Entreprise B' },
          { name: 'Scope 1' },
          { name: 'Scope 2' },
          { name: 'Scope 3' }
        ],
        links: [
          { source: 0, target: 2, value: 1000 },
          { source: 0, target: 3, value: 800 },
          { source: 0, target: 4, value: 2000 },
          { source: 1, target: 2, value: 1200 },
          { source: 1, target: 3, value: 1500 },
          { source: 1, target: 4, value: 900 }
        ]
      };
    }
  }
};
</script>

<style scoped>
.sankey-container {
  width: 100%;
  padding: 20px;
}

.sankey-chart {
  width: 100%;
  height: 600px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  text-align: center;
  padding: 20px;
  color: #ff4444;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>
