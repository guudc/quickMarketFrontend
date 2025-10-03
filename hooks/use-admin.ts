// hooks/useAdminData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import useCrypto from './use-crypto';
import { useToast } from './use-toast';

interface Admin {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
}

interface AdminDataHook {
    admin: Admin | null;
    token:string | null;
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    logout: () => void;
}

// Cache structure
interface AdminCache {
    admin: Admin;
    token:string;
    timestamp: number;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const RETRY_INTERVAL = 60 * 1000; // 1 minute in milliseconds

// Global cache to share across components
let globalAdminCache: AdminCache | null = null;

export const useAdminData = (): AdminDataHook => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { addToast } = useToast();

    // Check if user is admin based on stored data
    const checkAdminLogin = useCallback(async (): Promise<boolean> => {
        try {
            const hasData = useCrypto.hasStoredData();
            if (!hasData) return false;

            const cryptoData = await useCrypto.retrieveUserData();
            if (cryptoData && typeof cryptoData === "object") {
                const { user, token } = cryptoData;
                // Check if user exists and has admin role
                return !!(user && user.role === 'admin');
            }
            return false;
        } catch (error) {
            console.error('Error checking admin login:', error);
            return false;
        }
    }, []);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Cleanup retry timeouts on unmount
    const cleanupRetry = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);

    const clearCache = useCallback(() => {
        globalAdminCache = null;
    }, []);

    const logout = useCallback(() => {
        useCrypto.clearStoredData();
        clearCache();
        cleanupRetry();
        setAdmin(null);
        setToken(null)
        setIsLoggedIn(false);
        setError(null);
    }, [clearCache, cleanupRetry]);

    const scheduleRetry = useCallback((retryFunction: () => void) => {
        cleanupRetry(); // Clear any existing retry
        retryTimeoutRef.current = setTimeout(retryFunction, RETRY_INTERVAL);
    }, [cleanupRetry]);

    const fetchAdminData = useCallback(async (isRetry = false): Promise<void> => {
        const adminLoggedIn = await checkAdminLogin();
        setIsLoggedIn(adminLoggedIn);

        if (!adminLoggedIn) {
            cleanupRetry();
            setAdmin(null);
            setToken(null)
            setLoading(false);
            setError(null);
            return;
        }

        // Check cache first (if not a retry attempt)
        if (!isRetry && globalAdminCache) {
            const now = Date.now();
            const cacheAge = now - globalAdminCache.timestamp;

            if (cacheAge < CACHE_DURATION) {
                setAdmin(globalAdminCache.admin);
                setToken(globalAdminCache.token)
                setLoading(false);
                setError(null);
                return;
            } else {
                // Cache expired, clear it
                clearCache();
            }
        }

        setLoading(true);
        if (!isRetry) {
            setError(null);
        }

        try {
            // Get admin data from crypto store only
            const cryptoData = await useCrypto.retrieveUserData();

            // Check if cryptoData has the expected structure
            if (cryptoData && typeof cryptoData === "object") {
                const { user, token } = cryptoData;

                if (user && user.role === 'admin') {
                    // Set admin data directly from crypto store
                    setAdmin(user);
                    setToken(token)
                    setError(null);
                    cleanupRetry(); // Clear any retry timeouts on success

                    // Update cache
                    globalAdminCache = {
                        admin: user,
                        token,
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('User is not an admin');
                }
            } else {
                throw new Error('Invalid admin data structure from crypto');
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(errorMessage);

            // If it's an authentication error or user not admin, trigger logout
            if (errorMessage.includes('not an admin') ||
                errorMessage.includes('Invalid admin data')) {
              
                logout();
            } else {
                // Network or other error - schedule indefinite retry
                console.log(`Scheduling retry in ${RETRY_INTERVAL / 1000} seconds...`);
                scheduleRetry(() => {
                    console.log('Retrying admin data fetch...');
                    fetchAdminData(true);
                });
            }
        } finally {
            setLoading(false);
        }
    }, [checkAdminLogin, logout, addToast, clearCache, cleanupRetry, scheduleRetry]);

    const refetch = useCallback(async (): Promise<void> => {
        cleanupRetry(); // Clear any ongoing retries
        clearCache(); // Clear cache to force fresh fetch
        await fetchAdminData();
    }, [fetchAdminData, clearCache, cleanupRetry]);

    useEffect(() => {
        fetchAdminData();

        // Cleanup on unmount
        return () => {
            cleanupRetry();
        };
    }, [fetchAdminData, cleanupRetry]);

    // Effect to handle logout when admin login becomes false
    useEffect(() => {
        const checkAndUpdateLoginStatus = async () => {
            const adminLoggedIn = await checkAdminLogin();
            setIsLoggedIn(adminLoggedIn);
            
            if (!adminLoggedIn) {
                cleanupRetry();
                setAdmin(null);
                setToken(null)
                setError(null);
            }
        };

        checkAndUpdateLoginStatus();
    }, [checkAdminLogin, cleanupRetry]);

    return {
        admin,
        token,
        isLoggedIn,
        loading,
        error,
        refetch,
        logout
    };
};

// Export cache management functions for manual control
export const adminCache = {
    clear: () => { globalAdminCache = null; },
    get: () => globalAdminCache,
    isValid: () => {
        if (!globalAdminCache) return false;
        return (Date.now() - globalAdminCache.timestamp) < CACHE_DURATION;
    }
};