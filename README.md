# Rephraser

A modern web application for text rephrasing using AI. Built with Vue 3, TypeScript, and OpenAI's Gemini 2.0 model.

## Features

- 🔄 Text rephrasing with customizable mood and context
- 🎨 Multiple mood options: Neutral, Formal, Casual, Friendly, Professional
- 📚 Multiple context options: General, Business, Academic, Creative, Technical
- 🎯 Output length control: Short (10-20 chars), Medium (30-50 chars), Long (70-100 chars)
- 📱 Mobile-responsive design
- 🌓 Dark mode support
- 📋 History tracking with relative time display
- 📋 Copy to clipboard functionality
- 🔄 Real-time processing

## Tech Stack

- Frontend:
  - Vue 3 with TypeScript
  - Vite for build tooling
  - FontAwesome for icons
  - Moment.js for relative time display
  - Axios for HTTP requests

- Backend:
  - Node.js with Express
  - Google's Gemini 2.0 model via OpenRouter
  - CORS support
  - Environment variable management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd rephraise
   yarn install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   yarn install
   ```

### Environment Setup

1. Create a `.env` file in the backend directory with your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key
   PORT=3001
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   yarn dev
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd rephraise
   yarn dev
   ```

The application will be available at `http://localhost:5173`.

## Project Structure

```
rephraise/
├── backend/              # Backend server code
│   ├── server.js        # Express server
│   └── package.json     # Backend dependencies
├── src/                 # Frontend source code
│   ├── components/      # Vue components
│   ├── services/        # API services
│   └── styles.scss      # Global styles
├── package.json         # Frontend dependencies
└── README.md           # This file
```

## Usage

1. Enter text in the input field
2. Select your preferred mood and context
3. Choose the desired output length
4. Click "Rephrase" or press Cmd+Enter
5. Copy the output to clipboard using the copy button
6. View history of rephrased texts



## License

This project is licensed under the MIT License - see the LICENSE file for details.
