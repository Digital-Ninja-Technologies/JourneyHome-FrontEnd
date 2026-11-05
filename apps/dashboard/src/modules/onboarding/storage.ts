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

export function setStoredSelectedPackage(id: string): void {
  try {
    if (id) {
      sessionStorage.setItem(KEY, id);
    } else {
      sessionStorage.removeItem(KEY);
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
