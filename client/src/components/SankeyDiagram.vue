<template>
  <div id="sankey-diagram" class="sankey-container">
    <div v-if="loading" class="loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      Chargement du diagramme...
    </div>
    <div v-if="error" class="error">
      <el-icon><Warning /></el-icon>
      {{ error }}
    </div>
    <div ref="sankeyChart" class="sankey-chart"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';
import api from '../api';
import { Loading, Warning } from '@element-plus/icons-vue';

export default {
  name: 'SankeyDiagram',
  components: {
    Loading,
    Warning
  },
  data() {
    return {
      loading: true,
      error: null,
      chart: null,
      data: null,
      width: 1000,
      height: 600,
      rendered: false
    };
  },
  mounted() {
    this.initChart();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async initChart() {
      try {
        this.loading = true;
        this.error = null;
        
        console.log('Initializing Sankey diagram...');
        
        // Vérifier si des données ont été injectées pour l'export PDF
        if (window.SANKEY_DATA) {
          console.log('Using injected data for PDF export');
          this.data = window.SANKEY_DATA;
        } else {
          console.log('Fetching Sankey data from API...');
          const response = await api.get('/emissions/sankey');
          this.data = response.data;
        }

        if (!this.data) {
          throw new Error('No data available for Sankey diagram');
        }

        console.log('Creating chart with data:', this.data);
        await this.createChart();
        this.loading = false;
      } catch (error) {
        console.error('Error initializing Sankey diagram:', error);
        this.error = `Erreur lors du chargement du diagramme: ${error.message}`;
        this.loading = false;
      }
    },
    
    handleResize() {
      if (!this.rendered) return;
      
      const container = this.$refs.sankeyChart;
      if (container) {
        this.width = container.clientWidth;
        this.height = Math.max(600, container.clientHeight);
        this.updateChart();
      }
    },

    createChart() {
      if (!this.data || !this.$refs.sankeyChart) return;

      // Nettoyer le conteneur
      const container = this.$refs.sankeyChart;
      container.innerHTML = '';

      // Définir les palettes de couleurs
      const colorScales = {
        companies: d3.scaleOrdinal(d3.schemeSet3),
        categories: d3.scaleOrdinal(d3.schemePaired),
        scopes: d3.scaleOrdinal()
          .domain(['Scope 1', 'Scope 2', 'Scope 3'])
          .range(['#e74c3c', '#3498db', '#2ecc71'])
      };

      // Créer le SVG
      const svg = d3.select(container)
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('viewBox', [0, 0, this.width, this.height])
        .attr('style', 'max-width: 100%; height: auto;');

      // Configurer le layout Sankey
      const sankey = d3Sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 5], [this.width - 1, this.height - 5]]);

      // Générer le layout
      const { nodes, links } = sankey({
        nodes: this.data.nodes.map(d => Object.assign({}, d)),
        links: this.data.links.map(d => Object.assign({}, d))
      });

      // Fonction pour obtenir la couleur d'un nœud
      const getNodeColor = (node) => {
        if (node.name.startsWith('Scope')) {
          return colorScales.scopes(node.name);
        }
        // Déterminer le type de nœud en fonction de sa position
        const nodeType = node.x0 < this.width / 3 ? 'companies' : 'categories';
        return colorScales[nodeType](node.name);
      };

      // Créer les dégradés pour les liens
      const defs = svg.append('defs');
      links.forEach((link, i) => {
        const gradient = defs.append('linearGradient')
          .attr('id', `gradient-${i}`)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', link.source.x1)
          .attr('x2', link.target.x0);

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', getNodeColor(link.source));

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', getNodeColor(link.target));
      });

      // Ajouter les liens
      svg.append('g')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.5)
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('class', 'link')
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke', (d, i) => `url(#gradient-${i})`)
        .attr('stroke-width', d => Math.max(1, d.width))
        .style('mix-blend-mode', 'multiply')
        .on('mouseover', function() {
          d3.select(this)
            .attr('stroke-opacity', 0.8)
            .attr('stroke-width', d => Math.max(2, d.width + 2));
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('stroke-opacity', 0.5)
            .attr('stroke-width', d => Math.max(1, d.width));
        });

      // Ajouter les nœuds
      const node = svg.append('g')
        .selectAll('.node')
        .data(nodes)
        .join('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

      // Ajouter les rectangles des nœuds
      node.append('rect')
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('fill', d => getNodeColor(d))
        .attr('opacity', 0.8)
        .on('mouseover', function() {
          d3.select(this)
            .attr('opacity', 1)
            .attr('stroke', '#000')
            .attr('stroke-width', 1);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('opacity', 0.8)
            .attr('stroke', null);
        });

      // Ajouter les étiquettes
      node.append('text')
        .attr('x', d => d.x0 < this.width / 2 ? 6 + (d.x1 - d.x0) : -6)
        .attr('y', d => (d.y1 - d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < this.width / 2 ? 'start' : 'end')
        .text(d => `${d.name} (${d.value ? d.value.toFixed(2) : '0.00'})`)
        .style('font-size', '12px')
        .style('font-weight', d => d.name.startsWith('Scope') ? 'bold' : 'normal')
        .style('fill', '#2c3e50');

      this.rendered = true;
    },

    updateChart() {
      // Supprimer l'ancien graphique et en créer un nouveau
      this.createChart();
    }
  }
};
</script>

<style scoped>
.sankey-container {
  width: 100%;
  height: 600px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.sankey-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 10px;
  font-size: 1.2em;
  color: #909399;
}

.loading-icon {
  animation: rotate 2s linear infinite;
}

.error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 10px;
  color: #F56C6C;
  font-size: 1.2em;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
