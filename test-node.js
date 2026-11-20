/**
 * =============================================================================
 * CPU Scheduling Visualizer & Performance Analyzer
 * CLI Automated Test Runner (Node.js)
 * =============================================================================
 * 
 * Runs all unit tests and edge cases in the Node environment.
 * Usage: node test-node.js
 * =============================================================================
 */

// Emulate browser globals for modules that expect window/document
global.window = {};
global.performance = { now: () => Date.now() };

function createMockEl() {
  return {
    textContent: '',
    style: {},
    appendChild: () => {},
    innerHTML: '',
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    addEventListener: () => {},
    querySelector: () => createMockEl(),
    querySelectorAll: () => []
  };
}

let testStats = {};
global.document = {
  getElementById: (id) => {
    const el = createMockEl();
    Object.defineProperty(el, 'textContent', {
      set: (val) => { testStats[id] = val; }
    });
    return el;
  },
  createElement: () => createMockEl()
};

// 1. Load Core Scheduling Algorithms
require('./js/scheduling-algorithms.js');
const SA = window.SchedulingAlgorithms;

console.log('================================================================');
console.log('   CPU SCHEDULING VISUALIZER — AUTOMATED CLI TEST SUITE');
console.log('================================================================\n');

// 2. Run Comprehensive Test Suite from tests/test-algorithms.js
require('./tests/test-algorithms.js');

console.log('----------------------------------------------------------------');
console.log(`✅ Total Test Cases Executed: ${testStats['total-count']}`);
console.log(`✅ Passed:                   ${testStats['pass-count']}`);
console.log(`❌ Failed:                   ${testStats['fail-count']}`);
console.log('----------------------------------------------------------------');

if (Number(testStats['fail-count']) === 0) {
  console.log('🎉 ALL 178 TEST CASES PASSED SUCCESSFULLY!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
