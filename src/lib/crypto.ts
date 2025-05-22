// src/lib/crypto.ts
'use client';

// Helper function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generates a cryptographically random salt.
 * @param length The length of the salt in bytes. Defaults to 16.
 * @returns A Base64 encoded string representing the salt.
 */
export function generateSalt(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return arrayBufferToBase64(array.buffer);
}

/**
 * Derives a cryptographic key from a passphrase and salt using PBKDF2.
 * @param passphrase The user's passphrase.
 * @param saltString The Base64 encoded salt.
 * @returns A Promise that resolves to a CryptoKey.
 */
export async function deriveKeyFromPassphrase(passphrase: string, saltString: string): Promise<CryptoKey> {
  const salt = base64ToArrayBuffer(saltString);
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // NIST recommendation
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 }, // Key for AES-GCM encryption
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM.
 * @param data The string data to encrypt.
 * @param key The CryptoKey to use for encryption.
 * @returns A Promise that resolves to an object containing the Base64 encoded IV and ciphertext.
 */
export async function encryptData(data: string, key: CryptoKey): Promise<{ iv: string; ciphertext: string }> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for AES-GCM is standard

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
  };
}

/**
 * Decrypts data using AES-GCM.
 * @param ciphertextBase64 The Base64 encoded ciphertext.
 * @param ivBase64 The Base64 encoded IV.
 * @param key The CryptoKey to use for decryption.
 * @returns A Promise that resolves to the decrypted string data.
 */
export async function decryptData(ciphertextBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const iv = base64ToArrayBuffer(ivBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Generates a cryptographically strong recovery key.
 * @param lengthBytes The length of the recovery key in bytes. Defaults to 32.
 * @returns A Base64 encoded string representing the recovery key.
 */
export function generateRecoveryKey(lengthBytes: number = 32): string {
  const array = new Uint8Array(lengthBytes);
  crypto.getRandomValues(array);
  return arrayBufferToBase64(array.buffer);
}

/**
 * Encrypts a recovery key using a master key (derived from passphrase).
 * This is a convenience wrapper around encryptData.
 * @param recoveryKey The recovery key string.
 * @param masterKey The CryptoKey derived from the user's passphrase.
 * @returns A Promise that resolves to an object containing the Base64 encoded IV and ciphertext.
 */
export async function encryptRecoveryKey(recoveryKey: string, masterKey: CryptoKey): Promise<{ iv: string; ciphertext: string }> {
  return encryptData(recoveryKey, masterKey);
}

/**
 * Decrypts an encrypted recovery key using a master key (derived from passphrase).
 * This is a convenience wrapper around decryptData.
 * @param encryptedRecoveryKeyBase64 The Base64 encoded encrypted recovery key.
 * @param ivBase64 The Base64 encoded IV.
 * @param masterKey The CryptoKey derived from the user's passphrase.
 * @returns A Promise that resolves to the decrypted recovery key string.
 */
export async function decryptRecoveryKey(encryptedRecoveryKeyBase64: string, ivBase64: string, masterKey: CryptoKey): Promise<string> {
  return decryptData(encryptedRecoveryKeyBase64, ivBase64, masterKey);
}
