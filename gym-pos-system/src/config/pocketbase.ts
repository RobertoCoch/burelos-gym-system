// src/config/pocketbase.ts
import PocketBase from 'pocketbase';

// Vite usa import.meta.env en lugar de process.env
const pbUrl = import.meta.env.VITE_POCKETBASE_URL;

// Esta es tu "api" global
export const pb = new PocketBase(pbUrl);