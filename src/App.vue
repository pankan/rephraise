<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Rephraser from './components/Rephraser.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

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

// Watch for system theme changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const handleThemeChange = (e: MediaQueryListEvent) => {
  if (!localStorage.getItem('darkMode')) {
    darkMode.value = e.matches
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
  }
}

mediaQuery.addEventListener('change', handleThemeChange)
</script>

<template>
  <div class="app-container">
    <div class="theme-toggle" @click="toggleTheme">
      <font-awesome-icon 
        :icon="darkMode ? faSun : faMoon" 
        class="icon"
        :class="{ rotate: darkMode }"
      />
    </div>
    
    <Rephraser />
  </div>
</template>

<style scoped lang="scss">
.app-container {
  min-height: 100vh;
  padding: 1rem;
  transition: background-color 0.5s ease, color 0.5s ease;
}

.theme-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 0.5rem;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow-color);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--shadow-color);
  }
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
  
  /* Rotate icon when toggling */
  &.rotate {
    transform: rotate(360deg);
  }
}

/* Theme transition animation */
[data-theme="dark"] {
  transition: background-color 0.5s ease, color 0.5s ease;
}

[data-theme="light"] {
  transition: background-color 0.5s ease, color 0.5s ease;
}
</style>
