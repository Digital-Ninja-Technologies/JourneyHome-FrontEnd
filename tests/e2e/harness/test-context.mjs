// tests/e2e/harness/test-context.mjs
// Unified test context supporting both Vitest and standalone Node.js execution.

let isVitest = false;
try {
  if (typeof globalThis !== 'undefined' && globalThis.__vitest_worker__) {
    isVitest = true;
  }
} catch {
  // Not vitest
}

// Built-in runner state for standalone Node execution
const testRegistry = [];
let currentSuite = null;
let currentHookContext = null;

class Expectation {
  constructor(actual, isNot = false) {
    this.actual = actual;
    this.isNot = isNot;
  }

  get not() {
    return new Expectation(this.actual, !this.isNot);
  }

  _check(pass, message) {
    const finalPass = this.isNot ? !pass : pass;
    if (!finalPass) {
      throw new Error(message());
    }
  }

  toBe(expected) {
    this._check(
      Object.is(this.actual, expected),
      () => `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to be' : 'to be'} ${JSON.stringify(expected)}`
    );
  }

  toEqual(expected) {
    const actStr = JSON.stringify(this.actual);
    const expStr = JSON.stringify(expected);
    this._check(
      actStr === expStr,
      () => `Expected ${actStr} ${this.isNot ? 'not to equal' : 'to equal'} ${expStr}`
    );
  }

  toMatch(regexOrStr) {
    const reg = typeof regexOrStr === 'string' ? new RegExp(regexOrStr) : regexOrStr;
    const pass = reg.test(String(this.actual));
    this._check(
      pass,
      () => `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to match' : 'to match'} ${regexOrStr}`
    );
  }

  toBeTruthy() {
    this._check(
      Boolean(this.actual),
      () => `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to be truthy' : 'to be truthy'}`
    );
  }

  toBeFalsy() {
    this._check(
      !this.actual,
      () => `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to be falsy' : 'to be falsy'}`
    );
  }

  toBeDefined() {
    this._check(
      typeof this.actual !== 'undefined',
      () => `Expected value ${this.isNot ? 'not to be defined' : 'to be defined'}`
    );
  }

  toBeUndefined() {
    this._check(
      typeof this.actual === 'undefined',
      () => `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to be undefined' : 'to be undefined'}`
    );
  }

  toBeNull() {
    this._check(
      this.actual === null,
      () => `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to be null' : 'to be null'}`
    );
  }

  toBeGreaterThan(n) {
    this._check(
      this.actual > n,
      () => `Expected ${this.actual} ${this.isNot ? 'not to be greater than' : 'to be greater than'} ${n}`
    );
  }

  toBeLessThan(n) {
    this._check(
      this.actual < n,
      () => `Expected ${this.actual} ${this.isNot ? 'not to be less than' : 'to be less than'} ${n}`
    );
  }

  toBeGreaterThanOrEqual(n) {
    this._check(
      this.actual >= n,
      () => `Expected ${this.actual} ${this.isNot ? 'not to be greater than or equal to' : 'to be greater than or equal to'} ${n}`
    );
  }

  toBeLessThanOrEqual(n) {
    this._check(
      this.actual <= n,
      () => `Expected ${this.actual} ${this.isNot ? 'not to be less than or equal to' : 'to be less than or equal to'} ${n}`
    );
  }

  toContain(item) {
    let pass = false;
    if (typeof this.actual === 'string') {
      pass = this.actual.includes(item);
    } else if (Array.isArray(this.actual)) {
      pass = this.actual.includes(item) || this.actual.some(i => JSON.stringify(i) === JSON.stringify(item));
    } else if (this.actual && typeof this.actual === 'object') {
      pass = item in this.actual;
    }
    this._check(
      pass,
      () => `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to contain' : 'to contain'} ${JSON.stringify(item)}`
    );
  }

  toHaveLength(length) {
    const actLen = this.actual ? this.actual.length : undefined;
    this._check(
      actLen === length,
      () => `Expected length ${actLen} ${this.isNot ? 'not to be' : 'to be'} ${length}`
    );
  }

  toThrow(expectedError) {
    let threw = false;
    let thrownError = null;
    try {
      if (typeof this.actual === 'function') {
        this.actual();
      }
    } catch (err) {
      threw = true;
      thrownError = err;
    }
    this._check(
      threw,
      () => `Expected function ${this.isNot ? 'not to throw' : 'to throw'}`
    );
    if (threw && expectedError) {
      if (typeof expectedError === 'string') {
        this._check(
          thrownError.message.includes(expectedError),
          () => `Expected error message "${thrownError.message}" to include "${expectedError}"`
        );
      } else if (expectedError instanceof RegExp) {
        this._check(
          expectedError.test(thrownError.message),
          () => `Expected error message "${thrownError.message}" to match ${expectedError}`
        );
      }
    }
  }

  get rejects() {
    return {
      toThrow: async (expectedError) => {
        let threw = false;
        let thrownError = null;
        try {
          await this.actual;
        } catch (err) {
          threw = true;
          thrownError = err;
        }
        this._check(
          threw,
          () => `Expected promise ${this.isNot ? 'not to reject' : 'to reject'}`
        );
        if (threw && expectedError) {
          if (typeof expectedError === 'string') {
            this._check(
              thrownError.message.includes(expectedError),
              () => `Expected rejected error message "${thrownError.message}" to include "${expectedError}"`
            );
          }
        }
      }
    };
  }

  get resolves() {
    return {
      toBe: async (expected) => {
        const res = await this.actual;
        new Expectation(res, this.isNot).toBe(expected);
      },
      toEqual: async (expected) => {
        const res = await this.actual;
        new Expectation(res, this.isNot).toEqual(expected);
      }
    };
  }
}

export function expect(actual) {
  if (isVitest && globalThis.expect) {
    return globalThis.expect(actual);
  }
  return new Expectation(actual);
}

export function describe(name, fn) {
  if (isVitest && globalThis.describe) {
    return globalThis.describe(name, fn);
  }
  const suite = {
    name,
    parent: currentSuite,
    beforeAllHooks: [],
    afterAllHooks: [],
    beforeEachHooks: [],
    afterEachHooks: [],
    tests: [],
    suites: []
  };

  if (currentSuite) {
    currentSuite.suites.push(suite);
  } else {
    testRegistry.push(suite);
  }

  const prevSuite = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = prevSuite;
  }
}

export function it(name, fn) {
  if (isVitest && globalThis.it) {
    return globalThis.it(name, fn);
  }
  const testCase = {
    name,
    fn,
    suite: currentSuite
  };
  if (currentSuite) {
    currentSuite.tests.push(testCase);
  } else {
    testRegistry.push({
      name: 'Default Suite',
      beforeAllHooks: [],
      afterAllHooks: [],
      beforeEachHooks: [],
      afterEachHooks: [],
      tests: [testCase],
      suites: []
    });
  }
}

export const test = it;

export function beforeAll(fn) {
  if (isVitest && globalThis.beforeAll) {
    return globalThis.beforeAll(fn);
  }
  if (currentSuite) currentSuite.beforeAllHooks.push(fn);
}

export function afterAll(fn) {
  if (isVitest && globalThis.afterAll) {
    return globalThis.afterAll(fn);
  }
  if (currentSuite) currentSuite.afterAllHooks.push(fn);
}

export function beforeEach(fn) {
  if (isVitest && globalThis.beforeEach) {
    return globalThis.beforeEach(fn);
  }
  if (currentSuite) currentSuite.beforeEachHooks.push(fn);
}

export function afterEach(fn) {
  if (isVitest && globalThis.afterEach) {
    return globalThis.afterEach(fn);
  }
  if (currentSuite) currentSuite.afterEachHooks.push(fn);
}

export function getRegistry() {
  return testRegistry;
}

export function clearRegistry() {
  testRegistry.length = 0;
  currentSuite = null;
}
