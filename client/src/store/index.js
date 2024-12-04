import { createStore } from 'vuex'

export default createStore({
  state: {
    carbonData: null,
    consolidatedData: null
  },
  mutations: {
    SET_CARBON_DATA(state, data) {
      state.carbonData = data
    },
    SET_CONSOLIDATED_DATA(state, data) {
      state.consolidatedData = data
    }
  },
  actions: {
    updateCarbonData({ commit }, data) {
      commit('SET_CARBON_DATA', data)
    },
    updateConsolidatedData({ commit }, data) {
      commit('SET_CONSOLIDATED_DATA', data)
    }
  },
  getters: {
    getCarbonData: state => state.carbonData,
    getConsolidatedData: state => state.consolidatedData
  }
})
