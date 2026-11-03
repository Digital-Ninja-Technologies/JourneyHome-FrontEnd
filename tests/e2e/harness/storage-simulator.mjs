// tests/e2e/harness/storage-simulator.mjs
// In-memory simulation of browser sessionStorage and localStorage
// with helpers to assert onboarding and auth lifecycle invariants.

export class StorageSimulator {
  constructor() {
    this._data = new Map();
  }

  getItem(key) {
    return this._data.has(key) ? this._data.get(key) : null;
  }

  setItem(key, value) {
    this._data.set(key, String(value));
  }

  removeItem(key) {
    this._data.delete(key);
  }

  clear() {
    this._data.clear();
  }

  key(index) {
    const keys = Array.from(this._data.keys());
    return keys[index] || null;
  }

  get length() {
    return this._data.size;
  }

  has(key) {
    return this._data.has(key);
  }

  getAll() {
    const obj = {};
    for (const [k, v] of this._data.entries()) {
      obj[k] = v;
    }
    return obj;
  }
}

export class BrowserEnvironmentSimulator {
  constructor() {
    this.sessionStorage = new StorageSimulator();
    this.localStorage = new StorageSimulator();
  }

  reset() {
    this.sessionStorage.clear();
    this.localStorage.clear();
  }

  // Onboarding lifecycle helpers
  setPendingVerificationEmail(email) {
    this.sessionStorage.setItem('jh_pending_verification_email', email);
  }

  getPendingVerificationEmail() {
    return this.sessionStorage.getItem('jh_pending_verification_email');
  }

  clearPendingVerificationEmail() {
    this.sessionStorage.removeItem('jh_pending_verification_email');
  }

  setOnboardingPlan(planId) {
    this.sessionStorage.setItem('jh_onboarding_plan', planId);
  }

  getOnboardingPlan() {
    return this.sessionStorage.getItem('jh_onboarding_plan');
  }

  clearOnboardingPlan() {
    this.sessionStorage.removeItem('jh_onboarding_plan');
  }

  // Session lifecycle helpers
  writeSession(token, user, remember = false) {
    const sessionData = JSON.stringify({ token, user });
    if (remember) {
      this.localStorage.setItem('jh_session', sessionData);
      this.sessionStorage.removeItem('jh_session');
    } else {
      this.sessionStorage.setItem('jh_session', sessionData);
      this.localStorage.removeItem('jh_session');
    }
  }

  readSession() {
    const s = this.sessionStorage.getItem('jh_session') || this.localStorage.getItem('jh_session');
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  clearSession() {
    this.sessionStorage.removeItem('jh_session');
    this.localStorage.removeItem('jh_session');
  }
}
