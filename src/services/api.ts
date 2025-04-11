import axios from 'axios'

interface RephraseOptions {
  mood: string
  context: string
  input: string
  length: 'short' | 'medium' | 'long'
}

interface RephraseResponse {
  output: string
}

export class ApiService {
  private static readonly API_URL = 'http://localhost:3001/api/rephrase'

  static async rephraseText(options: RephraseOptions): Promise<RephraseResponse> {
    try {
      const response = await axios.post(this.API_URL, options)
      return response.data
    } catch (error) {
      console.error('Error rephrasing text:', error)
      throw error
    }
  }
}
