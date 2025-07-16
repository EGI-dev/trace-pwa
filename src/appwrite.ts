import { Client, Databases, Storage, Account } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const db = new Databases(client);
export const storage = new Storage(client);

export async function ensureSession() {
  try {
    await account.get();                 // User already signed in?
  } catch {
    await account.createAnonymousSession(); // If not, create anon session
  }
}
