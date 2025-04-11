<script setup lang="ts">
import { ref, onMounted } from 'vue'

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
      // If parsing fails, start with empty history
      history.value = []
    }
  }
})

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
    <h1>Text Rephraser</h1>
    
    <div class="card">
      <div class="controls">
        <div class="control-group">
          <label for="mood-select">Mood</label>
          <select id="mood-select" v-model="selectedMood">
            <option v-for="mood in moods" :key="mood.value" :value="mood.value">{{ mood.label }}</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="context-select">Context</label>
          <select id="context-select" v-model="selectedContext">
            <option v-for="context in contexts" :key="context.value" :value="context.value">{{ context.label }}</option>
          </select>
        </div>
      </div>
      
      <div class="input-section">
        <h2>Original Text</h2>
        <textarea 
          v-model="inputText" 
          placeholder="Enter text to rephrase..."
          :disabled="isProcessing"
        ></textarea>
      </div>
      
      <button 
        @click="rephraseText" 
        :disabled="isProcessing || !inputText.trim()"
        class="rephrase-button"
      >
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Rephrase</span>
      </button>
      
      <div class="output-section" v-if="outputText">
        <h2>Rephrased Text</h2>
        <textarea v-model="outputText" readonly></textarea>
      </div>
      
      <div class="history-controls">
        <button @click="toggleHistory" class="history-toggle">
          {{ showHistory ? 'Hide History' : 'Show History' }} 
        </button>
        <button @click="clearHistory" class="clear-history" v-if="history.length > 0 && showHistory">
          Clear History
        </button>
      </div>
      
      <div class="history-section" v-if="showHistory">
        <h2>History</h2>
        <div v-if="history.length === 0" class="empty-history">
          No history yet. Your rephrasing requests will appear here.
        </div>
        <div v-else class="history-list">
          <div 
            v-for="item in history" 
            :key="item.id" 
            class="history-item"
            @click="loadHistoryItem(item)"
          >
            <div class="history-item-header">
              <span class="history-date">{{ formatDate(item.timestamp) }}</span>
              <span class="history-tags">
                <span class="tag mood">{{ item.mood }}</span>
                <span class="tag context">{{ item.context }}</span>
              </span>
            </div>
            <div class="history-content">
              <div class="history-input">{{ item.input.substring(0, 100) }}{{ item.input.length > 100 ? '...' : '' }}</div>
              <div class="history-output">{{ item.output.substring(0, 100) }}{{ item.output.length > 100 ? '...' : '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--text-color);
    font-weight: 600;
  }
  
  .card {
    background-color: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--shadow-color);
    padding: 2rem;
    transition: all var(--transition-time);
  }
  
  .controls {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    
    @media (max-width: 600px) {
      flex-direction: column;
      gap: 1rem;
    }
    
    .control-group {
      flex: 1;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-color);
      }
      
      select {
        width: 100%;
        padding: 0.75rem;
        background-color: var(--input-bg);
        color: var(--text-color);
        border: 1px solid var(--input-border);
        border-radius: 6px;
        font-size: 1rem;
        transition: all var(--transition-time);
        
        &:focus {
          border-color: var(--primary-color);
          outline: none;
          box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
        }
      }
    }
  }
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    color: var(--text-color);
    font-weight: 500;
  }
  
  textarea {
    width: 100%;
    min-height: 180px;
    padding: 1rem;
    font-size: 1rem;
    background-color: var(--input-bg);
    color: var(--text-color);
    border: 1px solid var(--input-border);
    border-radius: 6px;
    transition: all var(--transition-time);
    resize: vertical;
    
    &:focus {
      border-color: var(--primary-color);
      outline: none;
      box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
    }
    
    &::placeholder {
      color: var(--text-color);
      opacity: 0.5;
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    &[readonly] {
      background-color: var(--input-bg);
      opacity: 0.9;
    }
  }
  
  .rephrase-button {
    display: block;
    margin: 1.5rem auto;
    padding: 0.75rem 2.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all var(--transition-time);
    box-shadow: 0 2px 5px var(--shadow-color);
    
    &:hover:not(:disabled) {
      background: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--shadow-color);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  .input-section, .output-section {
    margin-bottom: 1.5rem;
  }
  
  .output-section {
    border-top: 1px solid var(--border-color);
    padding-top: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .history-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
  }
  
  .history-toggle, .clear-history {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--transition-time);
  }
  
  .history-toggle {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    
    &:hover {
      opacity: 0.9;
    }
  }
  
  .clear-history {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: rgba(220, 53, 69, 0.1);
      color: #dc3545;
      border-color: #dc3545;
    }
  }
  
  .history-section {
    margin-top: 1.5rem;
    
    h2 {
      margin-bottom: 1rem;
    }
  }
  
  .empty-history {
    padding: 1.5rem;
    text-align: center;
    color: var(--text-color);
    opacity: 0.7;
    font-style: italic;
    background-color: var(--input-bg);
    border-radius: 6px;
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
    
    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--input-bg);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }
  }
  
  .history-item {
    background-color: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 1rem;
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
    color: var(--text-color);
    opacity: 0.7;
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
      background-color: rgba(66, 184, 131, 0.2);
      color: var(--primary-color);
    }
    
    &.context {
      background-color: rgba(53, 73, 94, 0.2);
      color: var(--secondary-color);
    }
  }
  
  .history-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .history-input {
    font-size: 0.9rem;
    color: var(--text-color);
    opacity: 0.9;
  }
  
  .history-output {
    font-size: 0.9rem;
    color: var(--primary-color);
    font-weight: 500;
  }
}
</style>