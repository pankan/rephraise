<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface HistoryItem {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  mood: string;
  context: string;
}

const inputText = ref('')
const outputText = ref('')
const selectedMood = ref('neutral')
const selectedContext = ref('general')
const isProcessing = ref(false)
const history = ref<HistoryItem[]>([])
const showHistory = ref(false)

const moods = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' }
]

const contexts = [
  { value: 'general', label: 'General' },
  { value: 'business', label: 'Business' },
  { value: 'academic', label: 'Academic' },
  { value: 'creative', label: 'Creative' },
  { value: 'technical', label: 'Technical' }
]

// Load history from localStorage on component mount
onMounted(() => {
  const savedHistory = localStorage.getItem('rephraseHistory')
  if (savedHistory) {
    try {
      history.value = JSON.parse(savedHistory)
    } catch (e) {
      console.error('Failed to parse history:', e)
      history.value = []
    }
  }

  // Add keyboard event listener
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  // Clean up event listener
  document.removeEventListener('keydown', handleKeyPress)
})

// Handle keyboard shortcuts
const handleKeyPress = (e: KeyboardEvent) => {
  // Check for Cmd+Enter on Mac
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    rephraseText()
  }
}

// Save history to localStorage
const saveHistory = () => {
  localStorage.setItem('rephraseHistory', JSON.stringify(history.value))
}

const rephraseText = () => {
  if (!inputText.value.trim()) return
  
  isProcessing.value = true
  
  // Simulate API call with timeout
  setTimeout(() => {
    // TODO: Will use these options when we integrate OpenRouter
    const output = `[${selectedMood.value}/${selectedContext.value}]: ${inputText.value}`
    outputText.value = output
    
    // Add to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      input: inputText.value,
      output: output,
      mood: selectedMood.value,
      context: selectedContext.value
    }
    
    history.value.unshift(historyItem) // Add to beginning of array
    
    // Limit history to 20 items
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20)
    }
    
    // Save to localStorage
    saveHistory()
    
    isProcessing.value = false
  }, 800)
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

const loadHistoryItem = (item: HistoryItem) => {
  inputText.value = item.input
  outputText.value = item.output
  selectedMood.value = item.mood
  selectedContext.value = item.context
}

const clearHistory = () => {
  if (confirm('Are you sure you want to clear your rephrasing history?')) {
    history.value = []
    saveHistory()
  }
}

const toggleHistory = () => {
  showHistory.value = !showHistory.value
}

</script>

<template>
  <div class="container">
    <div class="main-content">
      <h1>Text Rephraser</h1>
      
      <button 
        @click="toggleHistory" 
        class="mobile-menu-button"
      >
        History
      </button>
      
      <div class="form-section">
        <div class="input-group">
          <label for="input-text">Input Text</label>
          <textarea 
            id="input-text"
            v-model="inputText"
            placeholder="Enter text to rephrase..."
            class="input-field"
            rows="4"
          ></textarea>
        </div>

        <div class="options-grid">
          <div class="option-group">
            <label for="mood">Mood</label>
            <select 
              id="mood" 
              v-model="selectedMood" 
              class="select-field"
            >
              <option v-for="m in moods" :key="m.value" :value="m.value">
                {{ m.label }}
              </option>
            </select>
          </div>

          <div class="option-group">
            <label for="context">Context</label>
            <select 
              id="context" 
              v-model="selectedContext" 
              class="select-field"
            >
              <option v-for="c in contexts" :key="c.value" :value="c.value">
                {{ c.label }}
              </option>
            </select>
          </div>
        </div>

        <button 
          @click="rephraseText" 
          :disabled="isProcessing || !inputText.trim()"
          class="rephrase-button button"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Rephrase</span>
          <span class="keyboard-shortcut">⌘⏎</span>
        </button>
      </div>

      <div class="output-section" v-if="outputText">
        <h2>Output</h2>
        <div class="output-field card">
          <pre>{{ outputText }}</pre>
        </div>
      </div>
    </div>

    <div class="history-sidebar" :class="{ 'show': showHistory }">
      <div class="history-header">
        <h2>History</h2>
        <div class="header-actions">
          <button @click="clearHistory" class="clear-history button" v-if="history.length > 0">
            Clear
          </button>
          <button 
            @click="toggleHistory" 
            class="close-button button"
            :class="{ 'active': showHistory }"
            v-if="showHistory"
          >
            <span class="sr-only">Close History</span>
            ×
          </button>
        </div>
      </div>

      <div class="history-list-wrapper">
        <div v-if="history.length === 0" class="empty-history">
          No history yet
        </div>
        
        <div class="history-list">
          <div 
            v-for="item in history" 
            :key="item.id" 
            class="history-item card"
            @click="loadHistoryItem(item)"
          >
            <div class="history-item-header">
              <span class="history-date">{{ formatDate(item.timestamp) }}</span>
              <div class="history-tags">
                <span class="tag mood">{{ item.mood }}</span>
                <span class="tag context">{{ item.context }}</span>
              </div>
            </div>
            
            <div class="history-content">
              <p class="history-input">{{ item.input }}</p>
              <p class="history-output">{{ item.output }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  padding: 2rem;
  width: calc(100% - 320px);
  max-width: 1200px;
  margin: 0 320px 0 auto;
  gap: 2rem;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.form-section {
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 2rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--secondary-color);
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all var(--transition-time);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-field {
  padding: 0.5rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-time);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}

.rephrase-button {
  width: 100%;
  background: var(--primary-color);
  color: white;
  
  &:hover:not(:disabled) {
    background: var(--primary-hover);
  }
  
  &:disabled {
    background: var(--border-color);
    color: var(--secondary-color);
  }
}

.output-section {
  margin-top: 2rem;
}

.output-field {
  padding: 1.5rem;
  border-radius: 8px;
  overflow: auto;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.history-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  background-color: var(--card-bg);
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 0 4px var(--shadow-color);
  padding: 1.5rem;
  transform: translateX(0);
  transition: all var(--transition-time);
  z-index: 1000;
  
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    transform: translateX(100%);
    
    &.show {
      transform: translateX(0);
    }
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 0;
    color: var(--text-color);
    font-weight: 500;
  }
}

.history-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--input-bg);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }
}

.history-item {
  cursor: pointer;
  transition: all var(--transition-time);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--shadow-color);
  }
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.history-date {
  color: var(--secondary-color);
  opacity: 0.8;
}

.history-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  
  &.mood {
    background-color: rgba(38, 132, 255, 0.1);
    color: var(--primary-color);
  }
  
  &.context {
    background-color: rgba(102, 102, 102, 0.1);
    color: var(--secondary-color);
  }
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-input {
  color: var(--text-color);
  opacity: 0.8;
}

.history-output {
  color: var(--primary-color);
  font-weight: 500;
}

.empty-history {
  padding: 1.5rem;
  text-align: center;
  color: var(--secondary-color);
  opacity: 0.7;
  font-style: italic;
  background-color: var(--input-bg);
  border-radius: 6px;
}

.mobile-menu-button {
  display: none;
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-time);
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border-color: #dc3545;
  }
  
  @media (max-width: 768px) {
    display: block;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
    width: 100%;
    margin: 2.5rem 0 0 0;
    max-width: none;
  }

  .main-content {
    flex: none;
    width: 100%;
  }

  .history-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    transform: translateX(100%);
    
    &.show {
      transform: translateX(0);
    }
  }

  .history-list-wrapper {
    max-height: calc(100vh - 100px);
  }
}
</style>