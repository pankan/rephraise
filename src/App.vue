<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Rephraser from './components/Rephraser.vue'

const darkMode = ref(false)

// Function to toggle dark mode
const toggleTheme = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value.toString())
  updateTheme()
}

// Function to update theme based on darkMode value
const updateTheme = () => {
  if (darkMode.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

// On component mount, check for saved theme preference
onMounted(() => {
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme !== null) {
    darkMode.value = savedTheme === 'true'
    updateTheme()
  } else {
    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    darkMode.value = prefersDark
    updateTheme()
  }
})
</script>

<template>
  <div class="app-container">
    <button 
      class="theme-toggle" 
      @click="toggleTheme" 
      :title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      {{ darkMode ? '☀️' : '🌙' }}
    </button>
    
    <Rephraser />
  </div>
</template>

<style scoped lang="scss">
.app-container {
  min-height: 100vh;
  padding: 1rem;
}
</style>
