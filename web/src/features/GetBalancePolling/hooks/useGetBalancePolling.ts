import { useCallback, useEffect, useState } from "react";

interface PollingConfig {
  enabled: boolean;
  intervalMS?: number;
  onError?: (error: Error) => void;
}

/**
 * Hook to poll for balance at a given interval
 * @param fetchBalance
 * @param config
 */
export default function useBalancePolling<T>(
  fetchBalance: () => Promise<T>,
  config: PollingConfig,
) {
  const [balance, setBalance] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getBalance = useCallback(async () => {
    if (!config.enabled) return;

    setIsLoading(true);
    try {
      const result = await fetchBalance();
      setBalance(result);
      setError(null);
    } catch (e) {
      const error =
        e instanceof Error ? e : new Error("Failed to fetch balance");
      setError(error);
      config.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalance, config.enabled, config.onError]);

  useEffect(() => {
    getBalance().then((_) => {});

    // setup polling if enabled
    if (config.enabled && config.intervalMS) {
      const intervalId = setInterval(getBalance, config.intervalMS);
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, [getBalance, config.enabled, config.intervalMS]);

  return {
    balance,
    isLoading,
    error,
    refetch: getBalance,
  };
}
