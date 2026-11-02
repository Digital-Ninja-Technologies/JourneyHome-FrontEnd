const KEY = "jh_selected_package";

export function getStoredSelectedPackage(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setStoredSelectedPackage(id: string): void {
  try {
    sessionStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}

export function clearStoredSelectedPackage(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
