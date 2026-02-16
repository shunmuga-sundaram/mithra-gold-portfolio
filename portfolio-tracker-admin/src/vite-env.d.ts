/// <reference types="vite/client" />

/**
 * TypeScript definitions for Vite environment variables
 *
 * This file tells TypeScript what environment variables are available
 * and what their types are.
 *
 * Why do we need this?
 * - Without this, TypeScript doesn't know about import.meta.env
 * - Prevents "Property 'env' does not exist" errors
 * - Provides autocomplete for environment variables
 */

interface ImportMetaEnv {
  /**
   * Backend API Base URL
   * Example: http://localhost:3000
   */
  readonly VITE_API_BASE_URL: string;

  /**
   * Node environment
   * 'development' | 'production' | 'test'
   */
  readonly MODE: string;

  // Add more environment variables here as needed
  // readonly VITE_APP_NAME: string;
  // readonly VITE_ENABLE_ANALYTICS: string;
}

/**
 * Node.js process.env type definition
 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
