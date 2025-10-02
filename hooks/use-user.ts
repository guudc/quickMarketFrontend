// hooks/useUserData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import useCrypto from './use-crypto';
import { useToast } from './use-toast';

interface Subscription {
    id: string;
    status: string;
    packageName: string;
    displayName: string;
    totalSlots: number;
    slotsUsed: number;
    slotsRemaining: number | null;
    maxQuantityPerItem: number;
    pricePaid: string;
    location: string;
    startsAt: string;
    expiresAt: string;
    paymentReference: string;
    createdAt: string;
    daysUntilExpiry: number;
    isExpiringSoon: boolean;
    isExpired: boolean;
}

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    location: string;
    emailVerified: boolean;
    createdAt: string;
    subscription: Subscription | null;
}

interface UserDataHook {
    user: User | null;
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;
    subscription: Subscription | null;
    refetch: () => Promise<void>;
    refetchSubscription: () => Promise<void>;
    logout: () => void;
}

// Cache structure
interface UserCache {
    user: User;
    subscription: Subscription | null;
    timestamp: number;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const RETRY_INTERVAL = 60 * 1000; // 1 minute in milliseconds

// Global cache to share across components
let globalUserCache: UserCache | null = null;

export const useUserData = (): UserDataHook => {
    const [user, setUser] = useState<User | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isLoggedIn = useCrypto.hasStoredData();
    const { addToast } = useToast();

    // Cleanup retry timeouts on unmount
    const cleanupRetry = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);

    const clearCache = useCallback(() => {
        globalUserCache = null;
    }, []);

    const logout = useCallback(() => {
        useCrypto.clearStoredData();
        clearCache();
        cleanupRetry();
        setUser(null);
        setSubscription(null);
        setError(null);
    }, [clearCache, cleanupRetry]);

    const fetchSubscription = useCallback(async (token: string): Promise<Subscription | null> => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/subscriptions/current", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const subscriptionData = await response.json();
                return subscriptionData.subscription || null;
            } else if (response.status === 401) {
                throw new Error('Authentication failed');
            } else {
                console.warn('Failed to fetch subscription:', response.statusText);
                throw new Error(`Subscription fetch failed: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('Error fetching subscription:', error);
            throw error; // Re-throw to handle in main function
        }
    }, []);

    const scheduleRetry = useCallback((retryFunction: () => void) => {
        cleanupRetry(); // Clear any existing retry
        retryTimeoutRef.current = setTimeout(retryFunction, RETRY_INTERVAL);
    }, [cleanupRetry]);

    const fetchUserData = useCallback(async (isRetry = false): Promise<void> => {
        if (!isLoggedIn) {
            cleanupRetry();
            setUser(null);
            setSubscription(null);
            setLoading(false);
            setError(null);
            return;
        }

        // Check cache first (if not a retry attempt)
        if (!isRetry && globalUserCache) {
            const now = Date.now();
            const cacheAge = now - globalUserCache.timestamp;

            if (cacheAge < CACHE_DURATION) {
                setUser(globalUserCache.user);
                setSubscription(globalUserCache.subscription);
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
            // First get user data and token from crypto
            const cryptoData = await useCrypto.retrieveUserData();

            // Check if cryptoData has the expected structure
            if (cryptoData && typeof cryptoData === "object") {
                const { user: tempUserData, token } = cryptoData;

                // Temporarily set the user data from crypto if we don't have cache
                if (tempUserData && !globalUserCache) {
                    setUser(tempUserData);
                }

                // If we have a token, fetch real-time user data from API
                if (token && typeof token === "string") {
                    // Fetch user profile and subscription in parallel
                    const [profileResponse, subscriptionData] = await Promise.all([
                        fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/profile", {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }),
                        fetchSubscription(token).catch(error => {
                            console.warn('Subscription fetch failed, continuing with user data:', error);
                            return null; // Continue even if subscription fails
                        })
                    ]);

                    if (profileResponse.ok) {
                        const realTimeUserData = await profileResponse.json();

                        if (realTimeUserData.user) {
                            // Update user with real-time data from API
                            const userData = realTimeUserData.user;

                            // Merge subscription data from separate endpoint
                            const userWithSubscription = {
                                ...userData,
                                subscription: subscriptionData
                            };

                            setUser(userWithSubscription);
                            setSubscription(subscriptionData);
                            setError(null);
                            cleanupRetry(); // Clear any retry timeouts on success

                            // Update cache
                            globalUserCache = {
                                user: userWithSubscription,
                                subscription: subscriptionData,
                                timestamp: Date.now()
                            };
                        } else {
                            // No user data in response - trigger logout
                            throw new Error('User not found in response');
                        }
                    } else if (profileResponse.status === 401) {
                        // Unauthorized - trigger logout
                        throw new Error('Authentication failed');
                    } else {
                        throw new Error(`HTTP ${profileResponse.status}: ${profileResponse.statusText}`);
                    }
                } else {
                    throw new Error('Invalid token');
                }
            } else {
                throw new Error('Invalid user data structure from crypto');
            }
        } catch (error) {
            console.error("Error fetching user data:", error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(errorMessage);

            // If it's an authentication error or user not found, trigger logout
            if (errorMessage.includes('Authentication failed') ||
                errorMessage.includes('User not found') ||
                errorMessage.includes('Invalid token')) {
                addToast({
                    title: "Session Expired",
                    description: "Please log in again",
                    type: "error",
                });
                logout();
            } else {
                // Network or other error - schedule indefinite retry
                console.log(`Scheduling retry in ${RETRY_INTERVAL / 1000} seconds...`);
                scheduleRetry(() => {
                    console.log('Retrying user data fetch...');
                    fetchUserData(true);
                });
            }
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, logout, addToast, clearCache, cleanupRetry, fetchSubscription, scheduleRetry]);

    const refetchSubscription = useCallback(async (): Promise<void> => {
        if (!isLoggedIn) return;

        try {
            const cryptoData = await useCrypto.retrieveUserData();
            if (cryptoData && cryptoData.token) {
                const subscriptionData = await fetchSubscription(cryptoData.token);
                setSubscription(subscriptionData);

                // Update user object with new subscription data
                if (user) {
                    const updatedUser = { ...user, subscription: subscriptionData };
                    setUser(updatedUser);

                    // Update cache
                    if (globalUserCache) {
                        globalUserCache = {
                            ...globalUserCache,
                            user: updatedUser,
                            subscription: subscriptionData,
                            timestamp: Date.now()
                        };
                    }
                }

                cleanupRetry(); // Clear retries on success
            }
        } catch (error) {
            console.error('Error refetching subscription:', error);

            // Schedule indefinite retry for subscription
            scheduleRetry(() => {
                console.log('Retrying subscription fetch...');
                refetchSubscription();
            });
        }
    }, [isLoggedIn, user, fetchSubscription, cleanupRetry, scheduleRetry, addToast]);

    const refetch = useCallback(async (): Promise<void> => {
        cleanupRetry(); // Clear any ongoing retries
        clearCache(); // Clear cache to force fresh fetch
        await fetchUserData();
    }, [fetchUserData, clearCache, cleanupRetry]);

    useEffect(() => {
        fetchUserData();

        // Cleanup on unmount
        return () => {
            cleanupRetry();
        };
    }, [fetchUserData, cleanupRetry]);

    // Effect to handle logout when isLoggedIn becomes false
    useEffect(() => {
        if (!isLoggedIn) {
            cleanupRetry();
            setUser(null);
            setSubscription(null);
            setError(null);
        }
    }, [isLoggedIn, cleanupRetry]);

    return {
        user,
        isLoggedIn,
        loading,
        error,
        subscription,
        refetch,
        refetchSubscription,
        logout
    };
};

// Export cache management functions for manual control
export const userCache = {
    clear: () => { globalUserCache = null; },
    get: () => globalUserCache,
    isValid: () => {
        if (!globalUserCache) return false;
        return (Date.now() - globalUserCache.timestamp) < CACHE_DURATION;
    }
};