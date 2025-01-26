import { Client, Account, Databases } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID, collections } from './config';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT!)
  .setProject(APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const database = new Databases(client);

export async function createUser(email: string, password: string, name: string) {
  try {
    const user = await account.create('unique()', email, password, name);
    await database.createDocument(
      APPWRITE_DATABASE_ID!,
      collections.users,
      user.$id,
      {
        name,
        email,
      }
    );
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    return await account.createEmailSession(email, password);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    return await account.deleteSession('current');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}