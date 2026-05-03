# YouTube Video Summarizer

A complete, full-stack application that leverages AI to generate summaries of YouTube videos. 

## 🏗 Project Structure

This is a monorepo consisting of three main components:

1. **`frontend/`**
   - Built with **React** and **Vite**.
   - Handles the user interface, video link submission, and displaying the generated summaries.
2. **`backend/`**
   - Built with **Node.js**, **Express**, and **Mongoose**.
   - Handles user authentication (JWT), secure routing, and database interactions (MongoDB).
   - Serves as the middle layer between the frontend and the AI services.
3. **`rag-service/`**
   - Built with **Python**.
   - Contains the core AI and Large Language Model (LLM) logic for processing transcripts and generating summaries using a Retrieval-Augmented Generation (RAG) approach.

## 🚀 Getting Started

To run the full stack locally, you'll need to start all three services in separate terminal windows.

### 1. RAG Service (Python)
Navigate to the `rag-service` directory, activate the virtual environment, and run the service:
```bash
cd rag-service
# Activate virtual environment (Windows)
venv\Scripts\activate
# Install dependencies if you haven't already
pip install -r requirements.txt
# Start the AI service
python main.py
```

### 2. Backend (Node.js)
Navigate to the `backend` directory, install dependencies, and start the development server:
```bash
cd backend
npm install
# Make sure your .env file is set up with DB credentials and JWT secrets
npm run dev
```

### 3. Frontend (React)
Navigate to the `frontend` directory, install dependencies, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables

Ensure you have created `.env` files in each respective directory (`frontend`, `backend`, and `rag-service`) with your own API keys, database URIs, and other secret credentials. Check each directory for an `.env.example` file if provided.

## 📄 License
ISC
