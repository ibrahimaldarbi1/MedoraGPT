# medoraGPT - Smart Study System

## Overview
medoraGPT is an AI-powered study companion built with React, TypeScript, and Vite. It uses Google's Gemini API to generate study packs (summaries, flashcards, quizzes) from lecture materials.

## Project Architecture
- **Frontend**: React 19 + TypeScript, bundled with Vite
- **Styling**: Tailwind CSS (via CDN)
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Routing**: React Router DOM v6
- **PDF Support**: pdfjs-dist for reading PDF uploads

### Directory Structure
- `/components/` - React UI components (Dashboard, CourseForm, FlashcardView, QuizView, etc.)
- `/contexts/` - React context providers (UserContext)
- `/services/` - API service layer (geminiService.ts)
- `/types.ts` - TypeScript type definitions
- `/constants.ts` - App constants and mock data
- `/App.tsx` - Main app component with routing
- `/index.tsx` - Entry point
- `/index.html` - HTML template
- `/vite.config.ts` - Vite configuration

## Environment Variables
- `GEMINI_API_KEY` - Required. Google Gemini API key for AI features.

## Running
- Dev server: `npm run dev` (port 5000)
- Build: `npm run build` (outputs to `dist/`)

## Recent Changes
- 2026-02-12: Initial Replit setup - configured Vite for port 5000 with allowedHosts, added script entry point to index.html, removed importmap (Vite handles bundling).
