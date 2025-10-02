import { useEffect, useState, useCallback } from 'react';

export const useGoogleAuth = () => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if ((window as any).google) {
      setIsGoogleLoaded(true);
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const signInWithGoogle = useCallback((onSuccess:Function, onError:Function) => {
    if (!isGoogleLoaded || !(window as any).google) {
      onError?.('Google auth not loaded');
      return;
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: onSuccess,
        error_callback: onError,
      });

      client.requestAccessToken();
    } catch (error:any) {
      onError?.(error.message);
    }
  }, [isGoogleLoaded]);

  return { signInWithGoogle, isGoogleLoaded };
};