# Friday - Advanced AI Assistant

A high-performance, real-time conversational AI application built with React, TypeScript, and the Google Gemini API. Friday features a multimodal interface supporting text, images, and real-time voice interactions.

## 🚀 Features

-   **Real-time Voice Mode (Friday Live)**:
    -   Bi-directional low-latency audio streaming using Gemini Live API.
    -   Real-time Speech-to-Speech conversation.
    -   Background audio transcription logging.
-   **Multimodal Chat**:
    -   **Text**: Instant streaming responses with Markdown rendering.
    -   **Vision**: Upload images to analyze and discuss with the AI.
    -   **Speech-to-Text**: Built-in dictation support in the chat input (Microphone icon).
    -   **Text-to-Speech**: Read-aloud functionality for AI responses (Speaker icon).
-   **Modern UI/UX**:
    -   Polished Tailwind CSS design with Dark/Light mode.
    -   Smooth Framer Motion animations.
    -   Code block highlighting.

## 🛠 Tech Stack

-   **Framework**: React 18
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **AI SDK**: `@google/genai` (Official Google Gemini SDK)

## ⚡ Getting Started (VS Code)

### Prerequisites
-   Node.js (v18 or higher)
-   npm or yarn
-   A Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))
    -   *Note: For Gemini Live and Multimodal features, ensure your API key has access to `gemini-2.5-flash` series models.*

### Installation & Run Steps

1.  **Open the project in VS Code.**
    
2.  **Open the Integrated Terminal:**
    Press `Ctrl + ~` (Windows/Linux) or `Cmd + ~` (Mac).

3.  **Install dependencies:**
    Run the following command to install all required packages:
    ```bash
    npm install react react-dom framer-motion lucide-react react-markdown @google/genai uuid
    npm install -D typescript @types/react @types/react-dom @types/uuid parcel
    ```

4.  **Configure API Key:**
    
    **Option A: Environment Variable (Recommended)**
    Create a file named `.env` in the root directory:
    ```
    API_KEY=your_gemini_api_key_here
    ```

    **Option B: Quick Start (Dev Only)**
    If you want to test immediately without configuring bundlers, open `services/geminiService.ts` and `services/liveService.ts` and replace `process.env.API_KEY` with your actual key string.
    *Warning: Do not share or commit code with hardcoded keys.*

5.  **Run the application:**
    Start the development server with Parcel:
    ```bash
    npx parcel index.html
    ```

6.  **Access the App:**
    -   The terminal will show a URL (usually `http://localhost:1234`).
    -   Ctrl+Click the link or open your browser to that address.
    -   **Microphone Permissions**: The app will request microphone access for Voice Mode and Dictation. Allow these permissions to use all features.

## 🐛 Debugging in VS Code

1.  Install the **"Debugger for Chrome"** extension (or built-in JS debugger).
2.  Create a `.vscode/launch.json`:
    ```json
    {
      "version": "0.2.0",
      "configurations": [
        {
          "type": "chrome",
          "request": "launch",
          "name": "Launch Chrome against localhost",
          "url": "http://localhost:1234",
          "webRoot": "${workspaceFolder}"
        }
      ]
    }
    ```
3.  Press `F5` to start debugging. You can set breakpoints in `App.tsx` or `geminiService.ts`.

## 🏗 Architecture Decisions

-   **Service Layer**: Logic for the Gemini API (`geminiService.ts`) and Live API (`liveService.ts`) is isolated.
-   **Streaming**: Text chat uses async generators for token streaming. Voice chat uses WebSockets (via the SDK) and raw PCM audio processing.
-   **Multimodal**: Images are converted to Base64 on the client side before being sent to the Gemini API as inline data parts.
