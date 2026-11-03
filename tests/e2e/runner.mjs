#!/usr/bin/env node
// tests/e2e/runner.mjs
// Standalone high-performance test runner for Journey Home E2E Test Suite.
// Can run locally and in CI with zero external test runner dependencies.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRegistry, clearRegistry } from './harness/test-context.mjs';
import { MockBackendServer, getSharedMockBackend } from './harness/mock-backend.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const suitesDir = path.join(__dirname, 'suites');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m'
};

function getAllTestFiles(dir, filterTier = null) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!filterTier || file.includes(`tier${filterTier}`)) {
        results = results.concat(getAllTestFiles(fullPath));
      }
    } else if (file.endsWith('.test.mjs') || file.endsWith('.spec.mjs')) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

async function runSuite(suite, indent = '  ', parentBeforeEach = [], parentAfterEach = []) {
  let passed = 0;
  let failed = 0;
  const errors = [];

  const allBeforeEach = [...parentBeforeEach, ...suite.beforeEachHooks];
  const allAfterEach = [...suite.afterEachHooks, ...parentAfterEach];

  console.log(`${indent}${colors.bold}${colors.cyan}● ${suite.name}${colors.reset}`);

  // Run beforeAll hooks
  for (const hook of suite.beforeAllHooks) {
    try {
      await hook();
    } catch (err) {
      console.error(`${indent}  ${colors.red}[beforeAll hook failed] ${err.message}${colors.reset}`);
      throw err;
    }
  }

  // Run tests
  for (const test of suite.tests) {
    getSharedMockBackend().reset();

    // Run all beforeEach hooks in order
    for (const hook of allBeforeEach) {
      await hook();
    }

    const start = Date.now();
    try {
      await test.fn();
      const dur = Date.now() - start;
      passed++;
      console.log(`${indent}  ${colors.green}✓${colors.reset} ${colors.dim}${test.name}${colors.reset} ${colors.dim}(${dur}ms)${colors.reset}`);
    } catch (err) {
      const dur = Date.now() - start;
      failed++;
      console.log(`${indent}  ${colors.red}✕ ${test.name}${colors.reset} ${colors.dim}(${dur}ms)${colors.reset}`);
      console.log(`${indent}    ${colors.red}${err.message}${colors.reset}`);
      errors.push({ testName: test.name, error: err });
    }

    // Run all afterEach hooks
    for (const hook of allAfterEach) {
      await hook();
    }
  }

  // Run nested suites
  for (const childSuite of suite.suites) {
    const res = await runSuite(childSuite, indent + '  ', allBeforeEach, allAfterEach);
    passed += res.passed;
    failed += res.failed;
    errors.push(...res.errors);
  }

  // Run afterAll hooks
  for (const hook of suite.afterAllHooks) {
    try {
      await hook();
    } catch (err) {
      console.error(`${indent}  ${colors.red}[afterAll hook failed] ${err.message}${colors.reset}`);
    }
  }

  return { passed, failed, errors };
}

async function main() {
  const args = process.argv.slice(2);
  const tierArg = args.find(a => a.startsWith('--tier='));
  const filterTier = tierArg ? tierArg.split('=')[1] : null;

  console.log(`${colors.bold}${colors.magenta}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}      Journey Home E2E Test Suite Runner            ${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}====================================================${colors.reset}`);

  // In-process mock backend initialization
  const sharedMock = getSharedMockBackend();
  if (process.env.E2E_API_URL) {
    console.log(`${colors.yellow}Testing against configured API URL: ${process.env.E2E_API_URL}${colors.reset}\n`);
  } else {
    process.env.E2E_API_URL = sharedMock.baseUrl;
    console.log(`${colors.green}Using high-fidelity in-process Mock Backend (${sharedMock.baseUrl})${colors.reset}\n`);
  }

  const testFiles = getAllTestFiles(suitesDir, filterTier);
  console.log(`Discovered ${colors.bold}${testFiles.length}${colors.reset} test suite files:\n`);

  let totalPassed = 0;
  let totalFailed = 0;
  const allErrors = [];
  const overallStart = Date.now();

  for (const filePath of testFiles) {
    const relPath = path.relative(__dirname, filePath);
    console.log(`\n${colors.bold}RUNS${colors.reset} ${colors.yellow}${relPath}${colors.reset}`);

    clearRegistry();
    await import(`file://${filePath}?t=${Date.now()}`);
    const registry = getRegistry();

    for (const suite of registry) {
      const res = await runSuite(suite);
      totalPassed += res.passed;
      totalFailed += res.failed;
      allErrors.push(...res.errors);
    }
  }

  const duration = ((Date.now() - overallStart) / 1000).toFixed(2);

  console.log(`\n${colors.bold}${colors.magenta}====================================================${colors.reset}`);
  console.log(`${colors.bold}Test Summary:${colors.reset}`);
  console.log(`  Suites:  ${testFiles.length} passed, ${testFiles.length} total`);
  console.log(`  Tests:   ${colors.green}${totalPassed} passed${colors.reset}, ${totalFailed > 0 ? colors.red + totalFailed + ' failed' + colors.reset : '0 failed'}, ${totalPassed + totalFailed} total`);
  console.log(`  Time:    ${duration}s`);

  if (totalFailed === 0) {
    console.log(`\n${colors.bgGreen} PASS ${colors.reset} ${colors.bold}${colors.green}All ${totalPassed} E2E tests passed cleanly!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bgRed} FAIL ${colors.reset} ${colors.bold}${colors.red}${totalFailed} test(s) failed.${colors.reset}\n`);
    for (const err of allErrors) {
      console.log(`- ${err.testName}: ${err.error.message}`);
    }
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\nFatal runner error:', err);
  process.exit(1);
});
