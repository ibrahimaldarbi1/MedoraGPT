# medoraGPT - Smart Study System

## Overview
medoraGPT is an AI-powered study companion built with React, TypeScript, and Vite. It uses Google's Gemini API to generate study packs (summaries, flashcards, quizzes) from lecture materials. Authentication and data storage are powered by Supabase.

## Project Architecture
- **Frontend**: React 19 + TypeScript, bundled with Vite
- **Styling**: Tailwind CSS (via CDN)
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Auth & Database**: Supabase (`@supabase/supabase-js`)
- **Routing**: React Router DOM v6
- **PDF Support**: pdfjs-dist for reading PDF uploads

### Directory Structure
- `/components/` - React UI components (Dashboard, CourseForm, FlashcardView, QuizView, etc.)
- `/contexts/` - React context providers (UserContext - Supabase auth + profiles)
- `/services/` - API service layer (geminiService.ts, supabaseClient.ts)
- `/types.ts` - TypeScript type definitions
- `/constants.ts` - App constants and badge registry
- `/App.tsx` - Main app component with routing and Supabase course CRUD
- `/index.tsx` - Entry point
- `/index.html` - HTML template
- `/vite.config.ts` - Vite configuration
- `/supabase_migration.sql` - SQL migration to run in Supabase Dashboard

### Database Schema (Supabase)
- **profiles** - User metadata (name, email, university, xp, badges, streak, daily quests as JSONB)
- **courses** - User courses (name, instructor, color, exams as JSONB, materials as JSONB)
- Both tables have RLS policies scoped to the authenticated user
- A trigger auto-creates a profile row when a new user signs up

## Environment Variables
- `GEMINI_API_KEY` - Required. Google Gemini API key for AI features.
- `VITE_SUPABASE_URL` - Required. Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` - Required. Supabase anon/public key.

## Running
- Dev server: `npm run dev` (port 5000)
- Build: `npm run build` (outputs to `dist/`)
- Database setup: Run `supabase_migration.sql` in Supabase Dashboard SQL Editor

## Recent Changes
- 2026-02-12: Integrated Supabase for authentication (email/password signup & login) and database (profiles, courses tables with RLS). Replaced localStorage-based auth and data persistence.
- 2026-02-12: Initial Replit setup - configured Vite for port 5000 with allowedHosts, added script entry point to index.html, removed importmap (Vite handles bundling).
