# EduFunds-Grundschule - Architecture Overview

This document outlines the high-level architecture of the EduFunds-Grundschule project, identifying its main components and their responsibilities.

## 1. Frontend Application

The frontend is a modern web application built with React and TypeScript, leveraging Vite for a fast development experience.

*   **Core UI (`App.tsx`, `index.tsx`):** The main entry points and root components of the application.
*   **Components (`components/`):** A collection of reusable UI elements and feature-specific components.
*   **State Management (`contexts/`):** Utilizes React Context API for managing global and shared application state, ensuring efficient data flow.
*   **Hooks (`hooks/`):** Contains custom React Hooks to encapsulate reusable logic and side-effects across components.
*   **Internationalization (`i18n/`):** Manages multi-language support for the user interface.
*   **Utilities (`utils/`):** General-purpose helper functions and modules.
*   **Public Assets (`public/`):** Static files served directly by the web server (e.g., images, manifest files).
*   **Build Tooling (`vite.config.ts`):** Vite is used for development server, bundling, and optimization.

## 2. Backend Services

The backend is responsible for handling server-side logic, data persistence, and exposing APIs to the frontend.

*   **API Endpoints (`backend/`):** This directory likely contains the server application code, defining API routes and business logic. Further inspection would be needed to detail the specific framework (e.g., Node.js with Express/NestJS, Python with Django/Flask).
*   **Functions (`functions/`):** May contain serverless functions or backend utility modules that support the core API services.

## 3. Data Management

*   **Data Models & Types (`types.ts`):** Centralized TypeScript type definitions ensuring consistency between frontend and backend data structures.
*   **Services (`services/`):** Modules responsible for interacting with the backend API, external services, and handling data fetching/mutation logic.
*   **Static Data (`funding_programs.json`, `metadata.json`):** JSON files storing application-specific configurations, lists of funding programs, and other metadata.

## 4. Development & Testing Infrastructure

*   **Dependency Management (`package.json`, `package-lock.json`):** Defines project dependencies and scripts for building, testing, and running the application.
*   **TypeScript Configuration (`tsconfig.json`):** Configures the TypeScript compiler settings for the project.
*   **Testing Framework (`*.test.ts`, `vitest.setup.ts`):** Uses Vitest for comprehensive unit and integration testing, ensuring code quality and reliability.

## 5. Deployment

*   **Build Output (`dist/`):** Contains the compiled and optimized assets ready for deployment (e.g., frontend bundles).
