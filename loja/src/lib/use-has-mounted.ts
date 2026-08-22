"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * Cliente-only flag para ler stores persistidas no localStorage (zustand) sem
 * causar mismatch de hidratação, sem precisar de setState dentro de um effect.
 */
export function useHasMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
