import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * Retorna `false` durante o SSR e a primeira renderização no cliente, e `true`
 * depois. Evita mismatch de hidratação ao ler estado persistido (zustand/localStorage).
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
