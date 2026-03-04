import CryptoJS from 'crypto-js';
import { StateStorage } from 'zustand/middleware';

const STORE_KEY = process.env.NEXT_PUBLIC_STORE_KEY as string;

/**
 * EncryptedStorage is a class that implements the PersistStorage interface
 * to provide encrypted storage functionality using localStorage.
 *
 * Methods:
 * - getItem: Retrieves and decrypts a stored item by its key.
 * - removeItem: Removes an item from storage by its key.
 * - setItem: Encrypts and stores an item with a specified key.
 *
 * Encryption and decryption are performed using AES with a key
 * specified in the environment variable NEXT_PUBLIC_STORE_KEY.
 */
export class EncryptedStorage implements StateStorage {
  getItem(key: string): string | Promise<string | null> | null {
    const value = localStorage.getItem(key) as string;
    if (value) {
      const decryptedBytes = CryptoJS.AES.decrypt(value, STORE_KEY);
      return decryptedBytes.toString(CryptoJS.enc.Utf8);
    }
    return null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    const encrypted = CryptoJS.AES.encrypt(value, STORE_KEY).toString();
    localStorage.setItem(key, encrypted);
  }
}

export const encryptedStorage = new EncryptedStorage();
