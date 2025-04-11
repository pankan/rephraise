<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTrash, faXmark, faCopy, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { ApiService } from '../services/api'
import moment from 'moment'

interface HistoryItem {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  mood: string;
  context: string;
  length: string;
}

const inputText = ref('')
const outputText = ref('')
const selectedMood = ref('neutral')
const selectedContext = ref('general')
const selectedLength = ref<'short' | 'medium' | 'long'>('medium')
const isProcessing = ref(false)
const history = ref<HistoryItem[]>([])
const showHistory = ref(false)
const isCopied = ref(false)
const errorMessage = ref('')

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

const lengthOptions = [
  { value: 'short' as const, label: 'Short (10-20 chars)' },
  { value: 'medium' as const, label: 'Medium (30-50 chars)' },
  { value: 'long' as const, label: 'Long (70-100 chars)' }
] as const

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

const rephraseText = async () => {
  if (!inputText.value.trim()) {
    errorMessage.value = 'Please enter some text to rephrase'
    return
  }
  
  try {
    errorMessage.value = ''
    isProcessing.value = true
    
    const response = await ApiService.rephraseText({
      input: inputText.value,
      mood: selectedMood.value,
      context: selectedContext.value,
      length: selectedLength.value
    })
    
    outputText.value = response.output
    errorMessage.value = ''
    
    // Add to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      input: inputText.value,
      output: outputText.value,
      mood: selectedMood.value,
      context: selectedContext.value,
      length: selectedLength.value
    }
    
    history.value.unshift(historyItem)
    
    // Limit history to 20 items
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20)
    }
    
    // Save to localStorage
    saveHistory()
    
  } catch (error) {
    console.error('Error rephrasing text:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to rephrase text. Please try again.'
    outputText.value = ''
  } finally {
    isProcessing.value = false
  }
}

const formatDate = (timestamp: number): string => {
  return moment(timestamp).fromNow()
}

const loadHistoryItem = (item: HistoryItem) => {
  inputText.value = item.input
  outputText.value = item.output
  selectedMood.value = item.mood
  selectedContext.value = item.context
  selectedLength.value = item.length
  
  // Hide history sidebar on mobile view
  if (window.innerWidth <= 768) {
    showHistory.value = false
  }
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

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
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
          <div class="input-with-actions">
            <textarea 
              id="input-text"
              v-model="inputText"
              placeholder="Enter text to rephrase..."
              class="input-field"
              rows="4"
              :disabled="isProcessing"
            ></textarea>
            <button 
              @click="clearInput" 
              class="clear-button button"
              :disabled="!inputText.trim() || isProcessing"
              title="Clear input"
            >
              <font-awesome-icon :icon="faTrash" class="icon" />
            </button>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
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

          <div class="option-group">
            <label for="length">Length</label>
            <select 
              id="length" 
              v-model="selectedLength" 
              class="select-field"
            >
              <option v-for="l in lengthOptions" :key="l.value" :value="l.value">
                {{ l.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            @click="rephraseText" 
            :disabled="isProcessing || !inputText.trim()"
            class="rephrase-button button"
          >
            <span v-if="isProcessing">
              <font-awesome-icon :icon="faSpinner" class="icon spin" />
              Processing...
            </span>
            <span v-else>
              Rephrase
              <span class="keyboard-shortcut">⌘⏎</span>
            </span>
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="output-section" v-if="outputText">
          <h2>Output</h2>
          <div class="output-field card">
            <div class="output-content">
              <pre>{{ outputText }}</pre>
            </div>
            <button 
              @click="copyToClipboard" 
              class="copy-button button"
              :class="{ 'copied': isCopied }"
              title="Copy to clipboard"
            >
              <font-awesome-icon :icon="isCopied ? faCheck : faCopy" class="icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="history-sidebar" :class="{ 'show': showHistory }">
      <div class="history-header">
        <h2>History</h2>
        <div class="header-actions">
          <button @click="clearHistory" class="clear-history button" v-if="history.length > 0">
            <font-awesome-icon :icon="faTrash" class="icon" />
          </button>
          <button 
            @click="toggleHistory" 
            class="close-button button"
            :class="{ 'active': showHistory }"
            v-if="showHistory"
          >
            <font-awesome-icon :icon="faXmark" class="icon" />
          </button>
        </div>
      </div>

      <div class="history-list-wrapper">
        <div v-if="history.length === 0" class="empty-history">
          No history yet
        </div>
        
        <div class="history-grid">
          <div 
            v-for="item in history" 
            :key="item.id" 
            class="history-card"
            @click="loadHistoryItem(item)"
          >
            <div class="history-card-header">
              <span class="history-date">{{ formatDate(item.timestamp) }}</span>
              <div class="history-tags">
                <span class="tag mood">{{ item.mood }}</span>
                <span class="tag context">{{ item.context }}</span>
                <span class="tag length">{{ item.length }}</span>
              </div>
            </div>
            
            <div class="history-card-content">
              <div class="history-input">
                <p>{{ item.input }}</p>
              </div>
              <div class="history-output">
                <p>{{ item.output }}</p>
              </div>
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

@media (max-width: 768px) {
  .container {
    width: 100%;
    margin: 2rem auto 0;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
}

.form-section {
  margin-top: 2rem;
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
  .keyboard-shortcut{
    margin-left: 0.5rem;
  }
}

.output-section {
  margin-top: 2rem;
}

.output-field {
  position: relative;
  padding: 1.5rem;
  border-radius: 8px;
  overflow: auto;
  
  .output-content {
    margin-bottom: 1rem;
    
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .copy-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--transition-time);
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    
    &:hover:not(.copied) {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    &.copied {
      background-color: rgba(66, 185, 131, 0.1);
      color: #42b883;
      border-color: #42b883;
      
      .icon {
        animation: checkmark 0.3s ease-out;
      }
    }
  }
}

@keyframes checkmark {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
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
  overflow-y: scroll;
  
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
    font-weight: 600;
  }
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.clear-history {
  padding: 0.5rem;
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
}

.close-button {
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-time);
  background-color: transparent;
  color: var(--text-color);
  border: none;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }
}

.history-grid {
  display: grid;
  gap: 1rem;
}

.history-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  transition: all var(--transition-time);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--shadow-color);
  }
}

.history-card-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  .history-date {
    color: var(--text-muted);
    font-size: 0.75rem;
  }
}

.history-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.history-card-content {
  display: grid;
  gap: 1rem;
}

.history-input,
.history-output {  
  p {
    margin: 0;
    color: var(--text-color);
    font-size: 0.9rem;
  }
}
.history-input {  
  p {
    color: var(--secondary-color);
  }
}


.empty-history {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem 0;
}

.icon {
  width: 1em;
  height: 1em;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  
  &.mood {
    background-color: rgba(66, 155, 185, 0.1);
    color: var(--secondary-color);
  }
  
  &.context {
    background-color: rgba(102, 102, 102, 0.1);
    color: var(--secondary-color);
  }
  
  &.length {
    background-color: rgba(24, 137, 137, 0.1);
    color: var(--secondary-color);
  }
}

@media (max-width: 768px) {
  .history-sidebar {
    width: 100%;
    padding: 1rem;
  }

  .history-card {
    padding: 0.75rem;
  }

  .history-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .history-tags {
    margin-top: 0.5rem;
  }
}

.input-with-actions {
  position: relative;
}

.clear-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-time);
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  
  &:hover:not(:disabled) {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border-color: #dc3545;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.error-message {
  margin-top: 0.5rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  font-size: 0.875rem;
  text-align: center;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
</style>