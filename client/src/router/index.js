import { createRouter, createWebHistory } from 'vue-router'
import Upload from '../views/Upload.vue'
import EmissionsView from '../views/EmissionsView.vue'

const routes = [
  {
    path: '/',
    name: 'Upload',
    component: Upload
  },
  {
    path: '/emissions',
    name: 'Emissions',
    component: EmissionsView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
