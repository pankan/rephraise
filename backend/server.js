require('dotenv').config()
const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Rephraser App",
  },
})

app.post('/api/rephrase', async (req, res) => {
  try {
    const { input, mood, context, length } = req.body
    
    // Define length constraints
    const lengthConstraints = {
      short: { min: 10, max: 20 },
      medium: { min: 30, max: 50 },
      long: { min: 70, max: 100 }
    }

    const prompt = `
      Rephrase the following text in a ${mood} tone and ${context} context:
      
      Original: ${input}
      
      Rephrased version:
    `

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'system',
          content: `You are a text rephrasing assistant. Generate a single, concise rephrased version of the input text that matches the specified mood and context. The output should be between ${lengthConstraints[length].min} and ${lengthConstraints[length].max} characters.`
        },
        {
          role: 'user',
          content: prompt,
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    // Extract the response and remove any extra quotes or whitespace
    const response = completion.choices[0].message.content.trim()
    const rephrasedText = response.replace(/^"|"$/g, '').trim()

    // Ensure the response is within the length constraints
    const maxLength = lengthConstraints[length].max
    const rephrasedTextTrimmed = rephrasedText.length > maxLength ? 
      rephrasedText.substring(0, maxLength - 3) + '...' :
      rephrasedText

    res.json({ output: rephrasedTextTrimmed })
  } catch (error) {
    console.error('Error rephrasing text:', error)
    res.status(500).json({ error: 'Failed to rephrase text' })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
