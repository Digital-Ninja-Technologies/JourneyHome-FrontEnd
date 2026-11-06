const KEY = "jh_selected_package";

export function getStoredSelectedPackage(): string | null {
  try {
    for (const store of [sessionStorage, localStorage]) {
      const val = store.getItem(KEY);
      if (val) return val;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Also written to localStorage: the verification email's link usually opens in a new tab,
 * which has an empty sessionStorage, and the pick would otherwise be lost before onboarding.
 * Cleared once a plan is created, on entering /app, on logout and on account deletion.
 */
export function setStoredSelectedPackage(id: string): void {
  try {
    for (const store of [sessionStorage, localStorage]) {
      if (id) store.setItem(KEY, id);
      else store.removeItem(KEY);
    }
  } catch {
    /* ignore */
  }
}

export function clearStoredSelectedPackage(): void {
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
