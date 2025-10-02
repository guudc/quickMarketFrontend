// userCrypto.js - Browser Fingerprint-based Encryption System
'use client'

class UserDataCrypto {
  private storageKey: string;
  private isClient: boolean;

  constructor() {
    this.storageKey = 'encryptedUserData';
    this.isClient = typeof window !== 'undefined';
  }

  // Safe localStorage access methods
  private safeSetItem(key: string, value: string): boolean {
    if (!this.isClient) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('localStorage setItem failed:', error);
      return false;
    }
  }

  private safeGetItem(key: string): string | null {
    if (!this.isClient) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage getItem failed:', error);
      return null;
    }
  }

  private safeRemoveItem(key: string): boolean {
    if (!this.isClient) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('localStorage removeItem failed:', error);
      return false;
    }
  }

  // Generate a fingerprint-based key from browser properties
  async generateFingerprintKey() {
    if (!this.isClient) {
      throw new Error('Browser environment not available');
    }

    try {
      // Create a composite fingerprint from various browser properties
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        navigator.hardwareConcurrency || '',
        screen.colorDepth.toString(),
        screen.width.toString(),
        screen.height.toString(),
        navigator.platform,
        new Date().getTimezoneOffset().toString(),
        (!!navigator.cookieEnabled).toString(),
        (!!navigator.javaEnabled && navigator.javaEnabled()).toString(),
        navigator.maxTouchPoints?.toString() || '0',
        (!!navigator.pdfViewerEnabled).toString(),
      ].join('|');

      // Convert fingerprint to consistent crypto key using SHA-256
      const encoder = new TextEncoder();
      const fingerprintData = encoder.encode(fingerprint);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', fingerprintData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Use first 32 characters for AES-256 key
      return hashHex.substring(0, 32);
    } catch (error) {
      console.error('Fingerprint key generation failed:', error);
      throw new Error('Cannot generate browser fingerprint');
    }
  }

  // Encrypt user data using browser fingerprint
  async encryptUserData(userData: any) {
    if (!this.isClient) {
      throw new Error('Browser environment not available for encryption');
    }

    try {
      const fingerprintKey = await this.generateFingerprintKey();
      const encoder = new TextEncoder();
      
      // Generate random initialization vector
      const iv = crypto.getRandomValues(new Uint8Array(16));
      
      // Import the fingerprint-based key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(fingerprintKey),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      // Encrypt the user data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        encoder.encode(JSON.stringify(userData))
      );
      
      // Combine IV and encrypted data for storage
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);
      
      // Convert to base64 for easy storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt user data');
    }
  }

  // Decrypt user data using browser fingerprint
  async decryptUserData(encryptedData: any) {
    if (!this.isClient) {
      throw new Error('Browser environment not available for decryption');
    }

    try {
      const fingerprintKey = await this.generateFingerprintKey();
      const encoder = new TextEncoder();
      
      // Convert from base64 back to byte array
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // Extract IV (first 16 bytes) and encrypted data
      const iv = combined.slice(0, 16);
      const encryptedArray = combined.slice(16);
      
      // Import the fingerprint-based key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(fingerprintKey),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        encryptedArray
      );
      
      // Convert decrypted data back to JSON object
      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decryptedText);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt user data. This may be due to browser fingerprint changes.');
    }
  }

  // Store encrypted user data in localStorage
  async storeUserData(userData: any) {
    if (!this.isClient) {
      console.warn('Cannot store data: Not in browser environment');
      return false;
    }

    try {
      const encrypted = await this.encryptUserData(userData);
      const success = this.safeSetItem(this.storageKey, encrypted);
      
      if (success) {
        console.log('User data encrypted and stored successfully');
      } else {
        console.error('Failed to store encrypted data in localStorage');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return false;
    }
  }

  // Retrieve and decrypt user data from localStorage
  async retrieveUserData() {
    if (!this.isClient) {
      console.warn('Cannot retrieve data: Not in browser environment');
      return null;
    }

    try {
      const encrypted = this.safeGetItem(this.storageKey);
      if (!encrypted) {
        console.log('No encrypted data found in storage');
        return null;
      }
      
      const decrypted = await this.decryptUserData(encrypted);
      console.log('User data decrypted successfully');
      return decrypted;
    } catch (error) {
      console.error('Failed to retrieve and decrypt data:', error);
      // Clear invalid data
      this.clearStoredData();
      return null;
    }
  }

  // Clear stored encrypted data
  clearStoredData() {
    const success = this.safeRemoveItem(this.storageKey);
    if (success) {
      console.log('Stored user data cleared');
    } else {
      console.warn('Failed to clear stored user data');
    }
    return success;
  }

  // Check if encrypted data exists
  hasStoredData() {
    if (!this.isClient) return false;
    return this.safeGetItem(this.storageKey) !== null;
  }

  // Check if browser environment is available
  isBrowserEnvironment() {
    return this.isClient;
  }

  // Get fingerprint hash (for debugging)
  async getFingerprintHash() {
    if (!this.isClient) {
      throw new Error('Browser environment not available');
    }
    return await this.generateFingerprintKey();
  }
}

// Export for use in other modules (if using modules)
export default new UserDataCrypto();