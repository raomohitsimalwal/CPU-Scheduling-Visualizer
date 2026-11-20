/**
 * =============================================================================
 *  CPU Scheduling Algorithms — Comprehensive Test Suite
 * =============================================================================
 *
 *  This file tests every scheduling algorithm exposed on
 *  window.SchedulingAlgorithms:
 *      fcfs, sjf, srtf, priorityNonPreemptive, priorityPreemptive, roundRobin
 *
 *  Every expected value has been computed BY HAND and documented inline so a
 *  student can follow the Gantt-chart derivation during a viva.
 *
 *  Convention used throughout:
 *      AT  = Arrival Time
 *      BT  = Burst Time
 *      CT  = Completion Time
 *      TAT = Turnaround Time  = CT − AT
 *      WT  = Waiting Time     = TAT − BT
 *      RT  = Response Time    = first-start-on-CPU − AT
 *      Lower priority number  = higher priority
 * =============================================================================
 */

/* ──────────────────────────────────────────────────────────────────────────────
 *  §1  Minimal Test Framework
 * ────────────────────────────────────────────────────────────────────────────── */

const TestRunner = (() => {
    /** Each entry: { group, name, passed, error } */
    const results = [];
    let currentGroup = '';

    /* ---- public helpers -------------------------------------------------- */

    /**
     * Start a named group of tests (shown as a collapsible section in the UI).
     */
    function group(name) {
        currentGroup = name;
    }

    /**
     * Register a single test.  `fn` should throw on failure (use the assert
     * helpers below).
     */
    function test(name, fn) {
        try {
            fn();
            results.push({ group: currentGroup, name, passed: true, error: null });
        } catch (e) {
            results.push({ group: currentGroup, name, passed: false, error: e.message });
        }
    }

    /* ---- assertion helpers ----------------------------------------------- */

    /**
     * Strict equality (===).  Good for integers and strings.
     */
    function assertEqual(actual, expected, label = '') {
        if (actual !== expected) {
            throw new Error(
                `${label ? label + ': ' : ''}Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
            );
        }
    }

    /**
     * Approximate equality for floating-point comparisons.
     * Default tolerance = 0.01 (good enough for 2-decimal averages).
     */
    function assertApprox(actual, expected, label = '', tol = 0.01) {
        if (Math.abs(actual - expected) > tol) {
            throw new Error(
                `${label ? label + ': ' : ''}Expected ≈${expected}, got ${actual} (tol=${tol})`
            );
        }
    }

    /**
     * Deep-equal for arrays of simple objects (Gantt chart entries, etc.).
     */
    function assertDeepEqual(actual, expected, label = '') {
        const a = JSON.stringify(actual);
        const b = JSON.stringify(expected);
        if (a !== b) {
            throw new Error(
                `${label ? label + ': ' : ''}Objects differ.\n  Expected: ${b}\n  Actual:   ${a}`
            );
        }
    }

    /**
     * Assert that a value is greater than a threshold.
     */
    function assertGreaterThan(actual, threshold, label = '') {
        if (!(actual > threshold)) {
            throw new Error(
                `${label ? label + ': ' : ''}Expected value > ${threshold}, got ${actual}`
            );
        }
    }

    /* ---- rendering ------------------------------------------------------- */

    /**
     * Call after all tests have been registered.  Renders the results into the
     * DOM elements defined in test-algorithms.html.
     */
    function render() {
        const totalEl  = document.getElementById('total-count');
        const passEl   = document.getElementById('pass-count');
        const failEl   = document.getElementById('fail-count');
        const timeEl   = document.getElementById('run-time');
        const bar      = document.getElementById('progress-bar');
        const container = document.getElementById('results');

        const total  = results.length;
        const passed = results.filter(r => r.passed).length;
        const failed = total - passed;

        totalEl.textContent = total;
        passEl.textContent  = passed;
        failEl.textContent  = failed;

        // Progress bar colour
        const pct = total ? (passed / total * 100) : 0;
        bar.style.width = pct + '%';
        bar.style.background = failed === 0 ? '#27ae60' : '#e74c3c';

        // Group results by group name, preserving insertion order
        const groups = [];
        const groupMap = {};
        for (const r of results) {
            if (!groupMap[r.group]) {
                groupMap[r.group] = [];
                groups.push(r.group);
            }
            groupMap[r.group].push(r);
        }

        // Build DOM
        for (const g of groups) {
            const items     = groupMap[g];
            const groupFail = items.some(r => !r.passed);

            const section   = document.createElement('div');
            section.className = 'test-group' + (groupFail ? ' open' : '');

            // Header
            const header = document.createElement('div');
            header.className = 'test-group-header';
            const title  = document.createElement('span');
            title.textContent = g;
            const badge  = document.createElement('span');
            const gPass  = items.filter(r => r.passed).length;
            badge.textContent = `${gPass} / ${items.length}`;
            badge.className   = 'badge ' + (groupFail ? 'has-fail' : 'all-pass');
            header.appendChild(title);
            header.appendChild(badge);
            header.addEventListener('click', () => section.classList.toggle('open'));
            section.appendChild(header);

            // Body
            const body = document.createElement('div');
            body.className = 'test-group-body';
            for (const r of items) {
                const row = document.createElement('div');
                row.className = 'test-result ' + (r.passed ? 'pass' : 'fail');

                const icon = document.createElement('span');
                icon.className = 'icon';
                icon.textContent = r.passed ? '✔' : '✘';

                const details = document.createElement('div');
                details.className = 'details';
                const nameSpan = document.createElement('span');
                nameSpan.className = 'test-name';
                nameSpan.textContent = r.name;
                details.appendChild(nameSpan);

                if (!r.passed) {
                    const err = document.createElement('span');
                    err.className = 'error-msg';
                    err.textContent = r.error;
                    details.appendChild(err);
                }

                row.appendChild(icon);
                row.appendChild(details);
                body.appendChild(row);
            }
            section.appendChild(body);
            container.appendChild(section);
        }
    }

    return { group, test, assertEqual, assertApprox, assertDeepEqual, assertGreaterThan, render, results };
})();

/* Convenient short-hands */
const { group, test, assertEqual, assertApprox, assertDeepEqual, assertGreaterThan } = TestRunner;


/* ──────────────────────────────────────────────────────────────────────────────
 *  §2  Helper Utilities
 * ────────────────────────────────────────────────────────────────────────────── */

/** Deep-clone an array of process objects so tests never mutate shared data. */
function cloneProcesses(arr) {
    return arr.map(p => ({ ...p }));
}

/**
 * Look up a process result by pid inside the processResults array.
 * Returns the matching object, or throws if not found.
 */
function findByPid(processResults, pid) {
    const r = processResults.find(p => p.pid === pid);
    if (!r) throw new Error(`Process ${pid} not found in results`);
    return r;
}

/**
 * Verify every per-process metric in one call.
 * `expected` is an object keyed by pid, e.g.
 *   { 'P1': { ct: 6, tat: 6, wt: 0, rt: 0 }, ... }
 */
function verifyProcessResults(processResults, expected) {
    for (const [pid, exp] of Object.entries(expected)) {
        const r = findByPid(processResults, pid);
        assertEqual(r.completionTime,  exp.ct,  `${pid} CT`);
        assertEqual(r.turnaroundTime,  exp.tat, `${pid} TAT`);
        assertEqual(r.waitingTime,     exp.wt,  `${pid} WT`);
        assertEqual(r.responseTime,    exp.rt,  `${pid} RT`);
    }
}

/**
 * Verify the average metrics object.
 * Uses approximate comparison for floating-point values.
 */
function verifyAverages(averages, exp) {
    assertApprox(averages.avgWaitingTime,    exp.avgWT,   'Avg WT');
    assertApprox(averages.avgTurnaroundTime, exp.avgTAT,  'Avg TAT');
    assertApprox(averages.avgResponseTime,   exp.avgRT,   'Avg RT');
    assertApprox(averages.cpuUtilization,    exp.cpuUtil, 'CPU Util', 0.1);
    assertApprox(averages.throughput,         exp.throughput, 'Throughput', 0.001);
}


/* ──────────────────────────────────────────────────────────────────────────────
 *  §3  Test Datasets
 * ────────────────────────────────────────────────────────────────────────────── */

/** Dataset 1 — All processes arrive at time 0 */
const DS1 = [
    { pid: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
    { pid: 'P2', arrivalTime: 0, burstTime: 8, priority: 1 },
    { pid: 'P3', arrivalTime: 0, burstTime: 7, priority: 3 },
    { pid: 'P4', arrivalTime: 0, burstTime: 3, priority: 4 },
];

/** Dataset 2 — Different arrival times */
const DS2 = [
    { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 3 },
    { pid: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
    { pid: 'P3', arrivalTime: 2, burstTime: 8, priority: 4 },
    { pid: 'P4', arrivalTime: 3, burstTime: 6, priority: 2 },
];

/** Dataset 3 — Single process */
const DS3 = [
    { pid: 'P1', arrivalTime: 0, burstTime: 10, priority: 1 },
];

/** Dataset 4 — All same burst time */
const DS4 = [
    { pid: 'P1', arrivalTime: 0, burstTime: 4, priority: 2 },
    { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
    { pid: 'P3', arrivalTime: 2, burstTime: 4, priority: 3 },
];

/** Dataset 5 — Gaps in arrival (CPU idle periods expected) */
const DS5 = [
    { pid: 'P1', arrivalTime: 0,  burstTime: 3, priority: 1 },
    { pid: 'P2', arrivalTime: 5,  burstTime: 4, priority: 2 },
    { pid: 'P3', arrivalTime: 10, burstTime: 2, priority: 3 },
];

/** Dataset 6 — For Round Robin tests with different quanta */
const DS6 = [
    { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
    { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 2 },
    { pid: 'P3', arrivalTime: 2, burstTime: 2, priority: 3 },
    { pid: 'P4', arrivalTime: 3, burstTime: 1, priority: 4 },
];


/* ──────────────────────────────────────────────────────────────────────────────
 *  §4  Algorithm Reference  (window.SchedulingAlgorithms)
 * ────────────────────────────────────────────────────────────────────────────── */

const SA = window.SchedulingAlgorithms;


/* ══════════════════════════════════════════════════════════════════════════════
 *  §5  FCFS Tests
 *
 *  First-Come First-Served: non-preemptive, processes run in order of arrival.
 *  Ties in arrival time are broken by input order (PID order here).
 * ══════════════════════════════════════════════════════════════════════════════ */

group('FCFS — First Come First Served');

/* ---------- Dataset 1 (all arrive at 0) ----------
 *  Order: P1 → P2 → P3 → P4  (input/PID order, same AT)
 *
 *  Gantt: | P1  0-6 | P2  6-14 | P3  14-21 | P4  21-24 |
 *
 *  P1: CT=6,  TAT=6,  WT=0,  RT=0
 *  P2: CT=14, TAT=14, WT=6,  RT=6
 *  P3: CT=21, TAT=21, WT=14, RT=14
 *  P4: CT=24, TAT=24, WT=21, RT=21
 *
 *  Avg WT  = (0+6+14+21)/4 = 10.25
 *  Avg TAT = (6+14+21+24)/4 = 16.25
 *  Avg RT  = 10.25
 *  CPU Util = 24/24 = 100%   Throughput = 4/24 ≈ 0.1667
 */
test('DS1 — Gantt chart order', () => {
    const r = SA.fcfs(cloneProcesses(DS1));
    assertEqual(r.ganttChart[0].pid, 'P1', 'First slot');
    assertEqual(r.ganttChart[0].start, 0);
    assertEqual(r.ganttChart[0].end, 6);
});

test('DS1 — Per-process metrics', () => {
    const r = SA.fcfs(cloneProcesses(DS1));
    verifyProcessResults(r.processResults, {
        P1: { ct: 6,  tat: 6,  wt: 0,  rt: 0  },
        P2: { ct: 14, tat: 14, wt: 6,  rt: 6  },
        P3: { ct: 21, tat: 21, wt: 14, rt: 14 },
        P4: { ct: 24, tat: 24, wt: 21, rt: 21 },
    });
});

test('DS1 — Averages', () => {
    const r = SA.fcfs(cloneProcesses(DS1));
    verifyAverages(r.averages, {
        avgWT: 10.25, avgTAT: 16.25, avgRT: 10.25,
        cpuUtil: 100, throughput: 4 / 24,
    });
});

/* ---------- Dataset 2 (different arrival times) ----------
 *  Order: P1(AT=0) → P2(AT=1) → P3(AT=2) → P4(AT=3)
 *
 *  Gantt: | P1  0-5 | P2  5-8 | P3  8-16 | P4  16-22 |
 *
 *  P1: CT=5,  TAT=5,  WT=0,  RT=0
 *  P2: CT=8,  TAT=7,  WT=4,  RT=4
 *  P3: CT=16, TAT=14, WT=6,  RT=6
 *  P4: CT=22, TAT=19, WT=13, RT=13
 *
 *  Avg WT  = 23/4 = 5.75   Avg TAT = 45/4 = 11.25   Avg RT = 5.75
 *  CPU Util = 22/22 = 100%   Throughput = 4/22
 */
test('DS2 — Per-process metrics', () => {
    const r = SA.fcfs(cloneProcesses(DS2));
    verifyProcessResults(r.processResults, {
        P1: { ct: 5,  tat: 5,  wt: 0,  rt: 0  },
        P2: { ct: 8,  tat: 7,  wt: 4,  rt: 4  },
        P3: { ct: 16, tat: 14, wt: 6,  rt: 6  },
        P4: { ct: 22, tat: 19, wt: 13, rt: 13 },
    });
});

test('DS2 — Averages', () => {
    const r = SA.fcfs(cloneProcesses(DS2));
    verifyAverages(r.averages, {
        avgWT: 5.75, avgTAT: 11.25, avgRT: 5.75,
        cpuUtil: 100, throughput: 4 / 22,
    });
});

/* ---------- Dataset 3 (single process) ----------
 *  Gantt: | P1  0-10 |
 *  P1: CT=10, TAT=10, WT=0, RT=0
 */
test('DS3 — Single process', () => {
    const r = SA.fcfs(cloneProcesses(DS3));
    verifyProcessResults(r.processResults, {
        P1: { ct: 10, tat: 10, wt: 0, rt: 0 },
    });
    verifyAverages(r.averages, {
        avgWT: 0, avgTAT: 10, avgRT: 0,
        cpuUtil: 100, throughput: 0.1,
    });
});

/* ---------- Dataset 4 (same burst times) ----------
 *  Gantt: | P1  0-4 | P2  4-8 | P3  8-12 |
 *
 *  P1: CT=4,  TAT=4,  WT=0, RT=0
 *  P2: CT=8,  TAT=7,  WT=3, RT=3
 *  P3: CT=12, TAT=10, WT=6, RT=6
 *  Avg WT = 3   Avg TAT = 7   Avg RT = 3
 */
test('DS4 — Same burst times', () => {
    const r = SA.fcfs(cloneProcesses(DS4));
    verifyProcessResults(r.processResults, {
        P1: { ct: 4,  tat: 4,  wt: 0, rt: 0 },
        P2: { ct: 8,  tat: 7,  wt: 3, rt: 3 },
        P3: { ct: 12, tat: 10, wt: 6, rt: 6 },
    });
    verifyAverages(r.averages, {
        avgWT: 3, avgTAT: 7, avgRT: 3,
        cpuUtil: 100, throughput: 3 / 12,
    });
});

/* ---------- Dataset 5 (gaps / idle CPU) ----------
 *  Gantt: | P1 0-3 | idle 3-5 | P2 5-9 | idle 9-10 | P3 10-12 |
 *
 *  P1: CT=3,  TAT=3, WT=0, RT=0
 *  P2: CT=9,  TAT=4, WT=0, RT=0
 *  P3: CT=12, TAT=2, WT=0, RT=0
 *  Avg WT = 0   Avg TAT = 3   Avg RT = 0
 *  Total = 12   Idle = 3   CPU Util = 9/12 = 75%   Throughput = 3/12 = 0.25
 */
test('DS5 — Idle periods', () => {
    const r = SA.fcfs(cloneProcesses(DS5));
    verifyProcessResults(r.processResults, {
        P1: { ct: 3,  tat: 3, wt: 0, rt: 0 },
        P2: { ct: 9,  tat: 4, wt: 0, rt: 0 },
        P3: { ct: 12, tat: 2, wt: 0, rt: 0 },
    });
    assertEqual(r.totalTime, 12, 'totalTime');
    assertEqual(r.idleTime,  3,  'idleTime');
    verifyAverages(r.averages, {
        avgWT: 0, avgTAT: 3, avgRT: 0,
        cpuUtil: 75, throughput: 0.25,
    });
});


/* ══════════════════════════════════════════════════════════════════════════════
 *  §6  SJF (Non-Preemptive Shortest Job First)
 *
 *  At each decision point (when CPU becomes free) pick the ARRIVED process
 *  with the smallest burst time.  Ties broken by arrival time then PID.
 * ══════════════════════════════════════════════════════════════════════════════ */

group('SJF — Shortest Job First (Non-Preemptive)');

/* ---------- Dataset 1 ----------
 *  All arrive at 0.  Sort by BT: P4(3) → P1(6) → P3(7) → P2(8)
 *
 *  Gantt: | P4 0-3 | P1 3-9 | P3 9-16 | P2 16-24 |
 *
 *  P4: CT=3,  TAT=3,  WT=0,  RT=0
 *  P1: CT=9,  TAT=9,  WT=3,  RT=3
 *  P3: CT=16, TAT=16, WT=9,  RT=9
 *  P2: CT=24, TAT=24, WT=16, RT=16
 *  Avg WT = 7   Avg TAT = 13   Avg RT = 7
 */
test('DS1 — Per-process metrics', () => {
    const r = SA.sjf(cloneProcesses(DS1));
    verifyProcessResults(r.processResults, {
        P4: { ct: 3,  tat: 3,  wt: 0,  rt: 0  },
        P1: { ct: 9,  tat: 9,  wt: 3,  rt: 3  },
        P3: { ct: 16, tat: 16, wt: 9,  rt: 9  },
        P2: { ct: 24, tat: 24, wt: 16, rt: 16 },
    });
});

test('DS1 — Averages', () => {
    const r = SA.sjf(cloneProcesses(DS1));
    verifyAverages(r.averages, {
        avgWT: 7, avgTAT: 13, avgRT: 7,
        cpuUtil: 100, throughput: 4 / 24,
    });
});

/* ---------- Dataset 2 ----------
 *  t=0 : only P1 available → runs 0-5
 *  t=5 : P2(BT=3), P3(BT=8), P4(BT=6) → pick P2 → runs 5-8
 *  t=8 : P3(BT=8), P4(BT=6) → pick P4 → runs 8-14
 *  t=14: P3 → runs 14-22
 *
 *  P1: CT=5,  TAT=5,  WT=0,  RT=0
 *  P2: CT=8,  TAT=7,  WT=4,  RT=4
 *  P4: CT=14, TAT=11, WT=5,  RT=5
 *  P3: CT=22, TAT=20, WT=12, RT=12
 *  Avg WT = 21/4 = 5.25   Avg TAT = 43/4 = 10.75   Avg RT = 5.25
 */
test('DS2 — Per-process metrics', () => {
    const r = SA.sjf(cloneProcesses(DS2));
    verifyProcessResults(r.processResults, {
        P1: { ct: 5,  tat: 5,  wt: 0,  rt: 0  },
        P2: { ct: 8,  tat: 7,  wt: 4,  rt: 4  },
        P4: { ct: 14, tat: 11, wt: 5,  rt: 5  },
        P3: { ct: 22, tat: 20, wt: 12, rt: 12 },
    });
});

test('DS2 — Averages', () => {
    const r = SA.sjf(cloneProcesses(DS2));
    verifyAverages(r.averages, {
        avgWT: 5.25, avgTAT: 10.75, avgRT: 5.25,
        cpuUtil: 100, throughput: 4 / 22,
    });
});

/* ---------- Dataset 3 (single process) ---------- */
test('DS3 — Single process', () => {
    const r = SA.sjf(cloneProcesses(DS3));
    verifyProcessResults(r.processResults, {
        P1: { ct: 10, tat: 10, wt: 0, rt: 0 },
    });
});

/* ---------- Dataset 4 (same burst times → behaves like FCFS) ----------
 *  All BT=4.  Order by arrival: P1→P2→P3.  Same as FCFS DS4.
 */
test('DS4 — Same burst = FCFS order', () => {
    const r = SA.sjf(cloneProcesses(DS4));
    verifyProcessResults(r.processResults, {
        P1: { ct: 4,  tat: 4,  wt: 0, rt: 0 },
        P2: { ct: 8,  tat: 7,  wt: 3, rt: 3 },
        P3: { ct: 12, tat: 10, wt: 6, rt: 6 },
    });
});

/* ---------- Dataset 5 (gaps) ----------
 *  No overlap → same as FCFS.
 */
test('DS5 — Idle periods (same as FCFS)', () => {
    const r = SA.sjf(cloneProcesses(DS5));
    verifyProcessResults(r.processResults, {
        P1: { ct: 3,  tat: 3, wt: 0, rt: 0 },
        P2: { ct: 9,  tat: 4, wt: 0, rt: 0 },
        P3: { ct: 12, tat: 2, wt: 0, rt: 0 },
    });
    assertEqual(r.idleTime, 3, 'idleTime');
});


/* ══════════════════════════════════════════════════════════════════════════════
 *  §7  SRTF (Shortest Remaining Time First — preemptive SJF)
 *
 *  At every time unit a NEW arrival can preempt the running process if its
 *  burst is shorter than the remaining burst of the current process.
 * ══════════════════════════════════════════════════════════════════════════════ */

group('SRTF — Shortest Remaining Time First');

/* ---------- Dataset 1 ----------
 *  All arrive at 0 → no preemption possible → identical to SJF DS1.
 */
test('DS1 — Same as SJF (all arrive at 0)', () => {
    const r = SA.srtf(cloneProcesses(DS1));
    verifyProcessResults(r.processResults, {
        P4: { ct: 3,  tat: 3,  wt: 0,  rt: 0  },
        P1: { ct: 9,  tat: 9,  wt: 3,  rt: 3  },
        P3: { ct: 16, tat: 16, wt: 9,  rt: 9  },
        P2: { ct: 24, tat: 24, wt: 16, rt: 16 },
    });
});

/* ---------- Dataset 2 ----------
 *  t=0: P1(rem=5) starts.
 *  t=1: P2 arrives (rem=3 < P1's rem=4). Preempt → P2 starts.
 *        Gantt so far: P1 0-1.
 *  t=2: P3 arrives (rem=8). P2 rem=2, still shortest. Continue P2.
 *  t=3: P4 arrives (rem=6). P2 rem=1, still shortest. Continue P2.
 *  t=4: P2 finishes. Remaining: P1(4), P3(8), P4(6). P1 shortest.
 *        P1 runs 4-8.
 *  t=8: P1 done. P3(8), P4(6). P4 shortest → runs 8-14.
 *  t=14: P3 runs 14-22.
 *
 *  Gantt: P1(0-1), P2(1-4), P1(4-8), P4(8-14), P3(14-22)
 *
 *  P1: CT=8,  TAT=8,  WT=3,  RT=0
 *  P2: CT=4,  TAT=3,  WT=0,  RT=0
 *  P3: CT=22, TAT=20, WT=12, RT=12
 *  P4: CT=14, TAT=11, WT=5,  RT=5
 *  Avg WT = 5   Avg TAT = 10.5   Avg RT = 4.25
 */
test('DS2 — Preemption by shorter job', () => {
    const r = SA.srtf(cloneProcesses(DS2));
    verifyProcessResults(r.processResults, {
        P1: { ct: 8,  tat: 8,  wt: 3,  rt: 0  },
        P2: { ct: 4,  tat: 3,  wt: 0,  rt: 0  },
        P3: { ct: 22, tat: 20, wt: 12, rt: 12 },
        P4: { ct: 14, tat: 11, wt: 5,  rt: 5  },
    });
});

test('DS2 — Averages', () => {
    const r = SA.srtf(cloneProcesses(DS2));
    verifyAverages(r.averages, {
        avgWT: 5, avgTAT: 10.5, avgRT: 4.25,
        cpuUtil: 100, throughput: 4 / 22,
    });
});

/* ---------- Dataset 3 (single) ---------- */
test('DS3 — Single process', () => {
    const r = SA.srtf(cloneProcesses(DS3));
    verifyProcessResults(r.processResults, {
        P1: { ct: 10, tat: 10, wt: 0, rt: 0 },
    });
});

/* ---------- Dataset 4 ----------
 *  All BT=4.  At t=1 P2(rem=4) arrives, P1(rem=3). P1 is shorter → no preempt.
 *  At t=2 P3(rem=4), P1(rem=2). No preempt. Same result as SJF/FCFS.
 */
test('DS4 — Equal BT, no preemption', () => {
    const r = SA.srtf(cloneProcesses(DS4));
    verifyProcessResults(r.processResults, {
        P1: { ct: 4,  tat: 4,  wt: 0, rt: 0 },
        P2: { ct: 8,  tat: 7,  wt: 3, rt: 3 },
        P3: { ct: 12, tat: 10, wt: 6, rt: 6 },
    });
});

/* ---------- Dataset 5 (gaps) ---------- */
test('DS5 — Idle periods', () => {
    const r = SA.srtf(cloneProcesses(DS5));
    verifyProcessResults(r.processResults, {
        P1: { ct: 3,  tat: 3, wt: 0, rt: 0 },
        P2: { ct: 9,  tat: 4, wt: 0, rt: 0 },
        P3: { ct: 12, tat: 2, wt: 0, rt: 0 },
    });
    assertEqual(r.idleTime, 3, 'idleTime');
});


/* ══════════════════════════════════════════════════════════════════════════════
 *  §8  Priority Non-Preemptive
 *
 *  When CPU is free, pick the arrived process with the LOWEST priority number.
 * ══════════════════════════════════════════════════════════════════════════════ */

group('Priority — Non-Preemptive');

/* ---------- Dataset 1 ----------
 *  All at t=0.  Priority order: P2(1) → P1(2) → P3(3) → P4(4)
 *
 *  Gantt: | P2 0-8 | P1 8-14 | P3 14-21 | P4 21-24 |
 *
 *  P2: CT=8,  TAT=8,  WT=0,  RT=0
 *  P1: CT=14, TAT=14, WT=8,  RT=8
 *  P3: CT=21, TAT=21, WT=14, RT=14
 *  P4: CT=24, TAT=24, WT=21, RT=21
 *  Avg WT = 10.75   Avg TAT = 16.75   Avg RT = 10.75
 */
test('DS1 — Per-process metrics', () => {
    const r = SA.priorityNonPreemptive(cloneProcesses(DS1));
    verifyProcessResults(r.processResults, {
        P2: { ct: 8,  tat: 8,  wt: 0,  rt: 0  },
        P1: { ct: 14, tat: 14, wt: 8,  rt: 8  },
        P3: { ct: 21, tat: 21, wt: 14, rt: 14 },
        P4: { ct: 24, tat: 24, wt: 21, rt: 21 },
    });
});

test('DS1 — Averages', () => {
    const r = SA.priorityNonPreemptive(cloneProcesses(DS1));
    verifyAverages(r.averages, {
        avgWT: 10.75, avgTAT: 16.75, avgRT: 10.75,
        cpuUtil: 100, throughput: 4 / 24,
    });
});

/* ---------- Dataset 2 ----------
 *  t=0: only P1(pri=3) → runs 0-5
 *  t=5: P2(1), P3(4), P4(2) → P2 wins → runs 5-8
 *  t=8: P3(4), P4(2) → P4 wins → runs 8-14
 *  t=14: P3 → runs 14-22
 *
 *  P1: CT=5,  TAT=5,  WT=0,  RT=0
 *  P2: CT=8,  TAT=7,  WT=4,  RT=4
 *  P4: CT=14, TAT=11, WT=5,  RT=5
 *  P3: CT=22, TAT=20, WT=12, RT=12
 *  Avg WT = 5.25   Avg TAT = 10.75   Avg RT = 5.25
 */
test('DS2 — Per-process metrics', () => {
    const r = SA.priorityNonPreemptive(cloneProcesses(DS2));
    verifyProcessResults(r.processResults, {
        P1: { ct: 5,  tat: 5,  wt: 0,  rt: 0  },
        P2: { ct: 8,  tat: 7,  wt: 4,  rt: 4  },
        P4: { ct: 14, tat: 11, wt: 5,  rt: 5  },
        P3: { ct: 22, tat: 20, wt: 12, rt: 12 },
    });
});

/* ---------- Dataset 3 ---------- */
test('DS3 — Single process', () => {
    const r = SA.priorityNonPreemptive(cloneProcesses(DS3));
    verifyProcessResults(r.processResults, {
        P1: { ct: 10, tat: 10, wt: 0, rt: 0 },
    });
});

/* ---------- Dataset 5 (gaps) ---------- */
test('DS5 — Idle periods', () => {
    const r = SA.priorityNonPreemptive(cloneProcesses(DS5));
    verifyProcessResults(r.processResults, {
        P1: { ct: 3,  tat: 3, wt: 0, rt: 0 },
        P2: { ct: 9,  tat: 4, wt: 0, rt: 0 },
        P3: { ct: 12, tat: 2, wt: 0, rt: 0 },
    });
    assertEqual(r.idleTime, 3, 'idleTime');
});


/* ══════════════════════════════════════════════════════════════════════════════
 *  §9  Priority Preemptive
 *
 *  A newly arrived process with a LOWER priority number preempts the current.
 * ══════════════════════════════════════════════════════════════════════════════ */

group('Priority — Preemptive');

/* ---------- Dataset 1 ----------
 *  All arrive at 0 → no later arrivals → same as non-preemptive.
 */
test('DS1 — Same as NP when all arrive at 0', () => {
    const r = SA.priorityPreemptive(cloneProcesses(DS1));
    verifyProcessResults(r.processResults, {
        P2: { ct: 8,  tat: 8,  wt: 0,  rt: 0  },
        P1: { ct: 14, tat: 14, wt: 8,  rt: 8  },
        P3: { ct: 21, tat: 21, wt: 14, rt: 14 },
        P4: { ct: 24, tat: 24, wt: 21, rt: 21 },
    });
});

/* ---------- Dataset 2 ----------
 *  t=0: P1(pri=3) starts.
 *  t=1: P2(pri=1) arrives → preempts P1.  Gantt: P1 0-1.
 *  t=2: P3(pri=4) arrives. P2(pri=1) still best. Continue.
 *  t=3: P4(pri=2) arrives. P2(pri=1) still best. Continue.
 *  t=4: P2 done. Ready: P1(3,rem=4), P3(4,rem=8), P4(2,rem=6). P4(pri=2) wins.
 *  t=10: P4 done. Ready: P1(3,rem=4), P3(4,rem=8). P1 wins.
 *  t=14: P1 done. P3 runs 14-22.
 *
 *  Gantt: P1(0-1), P2(1-4), P4(4-10), P1(10-14), P3(14-22)
 *
 *  P1: CT=14, TAT=14, WT=9,  RT=0
 *  P2: CT=4,  TAT=3,  WT=0,  RT=0
 *  P3: CT=22, TAT=20, WT=12, RT=12
 *  P4: CT=10, TAT=7,  WT=1,  RT=1
 *  Avg WT = 5.5   Avg TAT = 11   Avg RT = 3.25
 */
test('DS2 — Preemption by higher priority', () => {
    const r = SA.priorityPreemptive(cloneProcesses(DS2));
    verifyProcessResults(r.processResults, {
        P1: { ct: 14, tat: 14, wt: 9,  rt: 0  },
        P2: { ct: 4,  tat: 3,  wt: 0,  rt: 0  },
        P3: { ct: 22, tat: 20, wt: 12, rt: 12 },
        P4: { ct: 10, tat: 7,  wt: 1,  rt: 1  },
    });
});

test('DS2 — Averages', () => {
    const r = SA.priorityPreemptive(cloneProcesses(DS2));
    verifyAverages(r.averages, {
        avgWT: 5.5, avgTAT: 11, avgRT: 3.25,
        cpuUtil: 100, throughput: 4 / 22,
    });
});

/* ---------- Dataset 3 ---------- */
test('DS3 — Single process', () => {
    const r = SA.priorityPreemptive(cloneProcesses(DS3));
    verifyProcessResults(r.processResults, {
        P1: { ct: 10, tat: 10, wt: 0, rt: 0 },
    });
});

/* ---------- Dataset 4 ----------
 *  t=0: P1(pri=2) starts.
 *  t=1: P2(pri=1) arrives → preempts P1. Gantt: P1(0-1).
 *  t=2: P3(pri=3) arrives. P2(pri=1) still best. Continue.
 *  t=5: P2 done. P1(pri=2,rem=3), P3(pri=3,rem=4). P1 wins → runs 5-8.
 *  t=8: P3 runs 8-12.
 *
 *  P1: CT=8,  TAT=8,  WT=4, RT=0
 *  P2: CT=5,  TAT=4,  WT=0, RT=0
 *  P3: CT=12, TAT=10, WT=6, RT=6
 *  Avg WT = 10/3 ≈ 3.33   Avg TAT = 22/3 ≈ 7.33   Avg RT = 2
 */
test('DS4 — Preemption with equal bursts', () => {
    const r = SA.priorityPreemptive(cloneProcesses(DS4));
    verifyProcessResults(r.processResults, {
        P1: { ct: 8,  tat: 8,  wt: 4, rt: 0 },
        P2: { ct: 5,  tat: 4,  wt: 0, rt: 0 },
        P3: { ct: 12, tat: 10, wt: 6, rt: 6 },
    });
});

test('DS4 — Averages', () => {
    const r = SA.priorityPreemptive(cloneProcesses(DS4));
    verifyAverages(r.averages, {
        avgWT: 10 / 3, avgTAT: 22 / 3, avgRT: 2,
        cpuUtil: 100, throughput: 3 / 12,
    });
});


/* ══════════════════════════════════════════════════════════════════════════════
 *  §10  Round Robin
 *
 *  Time-sliced scheduling.  Processes run for at most `quantum` time units,
 *  then go to the back of the ready queue.
 *
 *  Queue discipline: newly arriving processes are enqueued BEFORE the process
 *  whose quantum just expired (standard textbook convention).
 * ══════════════════════════════════════════════════════════════════════════════ */

group('Round Robin');

/* ────────────────────────────────────────
 *  Dataset 6, Quantum = 2
 * ────────────────────────────────────────
 *  Processes: P1(AT=0,BT=5), P2(AT=1,BT=4), P3(AT=2,BT=2), P4(AT=3,BT=1)
 *  Total burst = 12.
 *
 *  Trace (ready queue shown BEFORE picking next):
 *
 *  t=0:  Queue [P1].           P1 runs 0-2  (rem=3).
 *         During 0-2: P2 arrives(t=1), P3 arrives(t=2).
 *  t=2:  Queue [P2,P3,P1].    P2 runs 2-4  (rem=2).
 *         During 2-4: P4 arrives(t=3).
 *  t=4:  Queue [P3,P4,P1,P2]. P3 runs 4-6  (rem=0). ✓ P3 done.
 *  t=6:  Queue [P4,P1,P2].    hmm... wait, when P3 finishes, no new arrive during 4-6 beyond P4 which already arrived.
 *         Actually P4 arrived at t=3, which was during P2's run. So at t=4 queue is [P3, P1, P4, P2]? 
 *         Let me re-trace carefully.
 *
 *  Actually, the exact queue ordering depends on when newly-arrived processes vs 
 *  the preempted process are added. Let me use the standard convention:
 *
 *  t=0: arrives [P1]. Ready=[P1]. Run P1 (0→2, rem=3).
 *       At t=1 P2 arrives → Ready=[P2]. At t=2 P3 arrives → handled at t=2.
 *  t=2: new arrivals at t=2: [P3]. Add P3 first, then P1 goes to back.
 *       Ready=[P2, P3, P1]. Run P2 (2→4, rem=2).
 *       At t=3 P4 arrives → Ready=[P3, P1, P4].
 *  t=4: new arrivals at t=4: none. P2 goes to back.
 *       Ready=[P3, P1, P4, P2]. Run P3 (4→6, rem=0). P3 done.
 *  t=6: Ready=[P1, P4, P2]. Run P1 (6→8, rem=1).
 *  t=8: Ready=[P4, P2, P1]. Run P4 (8→9, rem=0). P4 done.
 *  t=9: Ready=[P2, P1]. Run P2 (9→11, rem=0). P2 done.
 *  t=11: Ready=[P1]. Run P1 (11→12, rem=0). P1 done.
 *
 *  Gantt: P1(0-2), P2(2-4), P3(4-6), P1(6-8), P4(8-9), P2(9-11), P1(11-12)
 *
 *  P1: CT=12, TAT=12-0=12, WT=12-5=7,  RT=0-0=0
 *  P2: CT=11, TAT=11-1=10, WT=10-4=6,  RT=2-1=1
 *  P3: CT=6,  TAT=6-2=4,   WT=4-2=2,   RT=4-2=2
 *  P4: CT=9,  TAT=9-3=6,   WT=6-1=5,   RT=8-3=5
 *
 *  Avg WT  = (7+6+2+5)/4 = 5
 *  Avg TAT = (12+10+4+6)/4 = 8
 *  Avg RT  = (0+1+2+5)/4 = 2
 *  CPU Util = 12/12 = 100%   Throughput = 4/12
 */
test('DS6 Q=2 — Per-process metrics', () => {
    const r = SA.roundRobin(cloneProcesses(DS6), 2);
    verifyProcessResults(r.processResults, {
        P1: { ct: 12, tat: 12, wt: 7, rt: 0 },
        P2: { ct: 11, tat: 10, wt: 6, rt: 1 },
        P3: { ct: 6,  tat: 4,  wt: 2, rt: 2 },
        P4: { ct: 9,  tat: 6,  wt: 5, rt: 5 },
    });
});

test('DS6 Q=2 — Averages', () => {
    const r = SA.roundRobin(cloneProcesses(DS6), 2);
    verifyAverages(r.averages, {
        avgWT: 5, avgTAT: 8, avgRT: 2,
        cpuUtil: 100, throughput: 4 / 12,
    });
});

/* ────────────────────────────────────────
 *  Dataset 6, Quantum = 3
 * ────────────────────────────────────────
 *  t=0: Ready=[P1]. Run P1 (0→3, rem=2).
 *       During 0-3: P2(t=1), P3(t=2), P4(t=3) arrive.
 *  t=3: new arrivals include P4 at t=3. Ready=[P2, P3, P4, P1].
 *       Run P2 (3→6, rem=1).
 *  t=6: Ready=[P3, P4, P1, P2]. Run P3 (6→8, rem=0). P3 done (BT=2 < Q=3).
 *  t=8: Ready=[P4, P1, P2]. Run P4 (8→9, rem=0). P4 done (BT=1 < Q=3).
 *  t=9: Ready=[P1, P2]. Run P1 (9→11, rem=0). P1 done (rem=2 < Q=3).
 *  t=11: Ready=[P2]. Run P2 (11→12, rem=0). P2 done (rem=1 < Q=3).
 *
 *  Gantt: P1(0-3), P2(3-6), P3(6-8), P4(8-9), P1(9-11), P2(11-12)
 *
 *  P1: CT=11, TAT=11, WT=6,  RT=0
 *  P2: CT=12, TAT=11, WT=7,  RT=2
 *  P3: CT=8,  TAT=6,  WT=4,  RT=4
 *  P4: CT=9,  TAT=6,  WT=5,  RT=5
 *
 *  Avg WT  = (6+7+4+5)/4 = 5.5
 *  Avg TAT = (11+11+6+6)/4 = 8.5
 *  Avg RT  = (0+2+4+5)/4 = 2.75
 */
test('DS6 Q=3 — Per-process metrics', () => {
    const r = SA.roundRobin(cloneProcesses(DS6), 3);
    verifyProcessResults(r.processResults, {
        P1: { ct: 11, tat: 11, wt: 6, rt: 0 },
        P2: { ct: 12, tat: 11, wt: 7, rt: 2 },
        P3: { ct: 8,  tat: 6,  wt: 4, rt: 4 },
        P4: { ct: 9,  tat: 6,  wt: 5, rt: 5 },
    });
});

test('DS6 Q=3 — Averages', () => {
    const r = SA.roundRobin(cloneProcesses(DS6), 3);
    verifyAverages(r.averages, {
        avgWT: 5.5, avgTAT: 8.5, avgRT: 2.75,
        cpuUtil: 100, throughput: 4 / 12,
    });
});

/* ────────────────────────────────────────
 *  Dataset 6, Quantum = 4
 * ────────────────────────────────────────
 *  t=0: Ready=[P1]. Run P1 (0→4, rem=1).
 *       During 0-4: P2(t=1), P3(t=2), P4(t=3) arrive.
 *  t=4: Ready=[P2, P3, P4, P1]. Run P2 (4→8, rem=0). P2 done.
 *  t=8: Ready=[P3, P4, P1]. Run P3 (8→10, rem=0). P3 done.
 *  t=10: Ready=[P4, P1]. Run P4 (10→11, rem=0). P4 done.
 *  t=11: Ready=[P1]. Run P1 (11→12, rem=0). P1 done.
 *
 *  Gantt: P1(0-4), P2(4-8), P3(8-10), P4(10-11), P1(11-12)
 *
 *  P1: CT=12, TAT=12, WT=7,  RT=0
 *  P2: CT=8,  TAT=7,  WT=3,  RT=3
 *  P3: CT=10, TAT=8,  WT=6,  RT=6
 *  P4: CT=11, TAT=8,  WT=7,  RT=7
 *
 *  Avg WT  = (7+3+6+7)/4 = 5.75
 *  Avg TAT = (12+7+8+8)/4 = 8.75
 *  Avg RT  = (0+3+6+7)/4 = 4
 */
test('DS6 Q=4 — Per-process metrics', () => {
    const r = SA.roundRobin(cloneProcesses(DS6), 4);
    verifyProcessResults(r.processResults, {
        P1: { ct: 12, tat: 12, wt: 7, rt: 0 },
        P2: { ct: 8,  tat: 7,  wt: 3, rt: 3 },
        P3: { ct: 10, tat: 8,  wt: 6, rt: 6 },
        P4: { ct: 11, tat: 8,  wt: 7, rt: 7 },
    });
});

test('DS6 Q=4 — Averages', () => {
    const r = SA.roundRobin(cloneProcesses(DS6), 4);
    verifyAverages(r.averages, {
        avgWT: 5.75, avgTAT: 8.75, avgRT: 4,
        cpuUtil: 100, throughput: 4 / 12,
    });
});

/* ---------- RR Dataset 3 (single process, Q=2) ----------
 *  P1 runs 0→2→4→6→8→10.  Five quanta of 2, CT=10.
 */
test('DS3 Q=2 — Single process', () => {
    const r = SA.roundRobin(cloneProcesses(DS3), 2);
    verifyProcessResults(r.processResults, {
        P1: { ct: 10, tat: 10, wt: 0, rt: 0 },
    });
});

/* ---------- RR Dataset 5 (gaps, Q=2) ----------
 *  P1(0-3): runs 0-2(rem=1), then 2-3(rem=0). Done at 3.
 *  Idle 3-5.
 *  P2(5-9): runs 5-7(rem=2), 7-9(rem=0). Done at 9.
 *  Idle 9-10.
 *  P3(10-12): runs 10-12(rem=0). Done at 12.
 *
 *  Same final CT/TAT/WT as FCFS because no concurrency.
 */
test('DS5 Q=2 — Idle periods', () => {
    const r = SA.roundRobin(cloneProcesses(DS5), 2);
    verifyProcessResults(r.processResults, {
        P1: { ct: 3,  tat: 3, wt: 0, rt: 0 },
        P2: { ct: 9,  tat: 4, wt: 0, rt: 0 },
        P3: { ct: 12, tat: 2, wt: 0, rt: 0 },
    });
    assertEqual(r.idleTime, 3, 'idleTime');
});

/* ---------- RR Dataset 1, Q=2 (all arrive at 0) ----------
 *  Ready=[P1,P2,P3,P4]
 *
 *  t=0:  P1 runs 0-2  (rem=4). Ready=[P2,P3,P4,P1].
 *  t=2:  P2 runs 2-4  (rem=6). Ready=[P3,P4,P1,P2].
 *  t=4:  P3 runs 4-6  (rem=5). Ready=[P4,P1,P2,P3].
 *  t=6:  P4 runs 6-8  (rem=1). Ready=[P1,P2,P3,P4].
 *  t=8:  P1 runs 8-10 (rem=2). Ready=[P2,P3,P4,P1].
 *  t=10: P2 runs 10-12(rem=4). Ready=[P3,P4,P1,P2].
 *  t=12: P3 runs 12-14(rem=3). Ready=[P4,P1,P2,P3].
 *  t=14: P4 runs 14-15(rem=0). Done. Ready=[P1,P2,P3].
 *  t=15: P1 runs 15-17(rem=0). Done. Ready=[P2,P3].
 *  t=17: P2 runs 17-19(rem=2). Ready=[P3,P2].
 *  t=19: P3 runs 19-21(rem=1). Ready=[P2,P3].
 *  t=21: P2 runs 21-23(rem=0). Done. Ready=[P3].
 *  t=23: P3 runs 23-24(rem=0). Done.
 *
 *  P1: CT=17, TAT=17, WT=11, RT=0
 *  P2: CT=23, TAT=23, WT=15, RT=2
 *  P3: CT=24, TAT=24, WT=17, RT=4
 *  P4: CT=15, TAT=15, WT=12, RT=6
 *
 *  Avg WT  = 55/4 = 13.75   Avg TAT = 79/4 = 19.75   Avg RT = 3
 */
test('DS1 Q=2 — All arrive at 0', () => {
    const r = SA.roundRobin(cloneProcesses(DS1), 2);
    verifyProcessResults(r.processResults, {
        P1: { ct: 17, tat: 17, wt: 11, rt: 0 },
        P2: { ct: 23, tat: 23, wt: 15, rt: 2 },
        P3: { ct: 24, tat: 24, wt: 17, rt: 4 },
        P4: { ct: 15, tat: 15, wt: 12, rt: 6 },
    });
});

test('DS1 Q=2 — Averages', () => {
    const r = SA.roundRobin(cloneProcesses(DS1), 2);
    verifyAverages(r.averages, {
        avgWT: 13.75, avgTAT: 19.75, avgRT: 3,
        cpuUtil: 100, throughput: 4 / 24,
    });
});


/* ══════════════════════════════════════════════════════════════════════════════
 *  §11  Edge-Case Tests
 * ══════════════════════════════════════════════════════════════════════════════ */

group('Edge Cases');

/* ---------- Identical burst times AND priorities ----------
 *  When both burst and priority are identical the algorithm must still
 *  produce valid results (we check structural invariants rather than a
 *  specific order because tie-breaking is implementation-defined).
 */
test('Identical BT & priority — structural validity (FCFS)', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
        { pid: 'P2', arrivalTime: 0, burstTime: 5, priority: 2 },
        { pid: 'P3', arrivalTime: 0, burstTime: 5, priority: 2 },
    ];
    const r = SA.fcfs(cloneProcesses(procs));

    // Total time must equal sum of bursts (no idle since all AT=0)
    assertEqual(r.totalTime, 15, 'totalTime');
    assertEqual(r.idleTime,  0,  'idleTime');

    // Every process must have correct TAT = CT - AT, WT = TAT - BT
    for (const p of r.processResults) {
        assertEqual(p.turnaroundTime, p.completionTime - p.arrivalTime, `${p.pid} TAT`);
        assertEqual(p.waitingTime, p.turnaroundTime - p.burstTime, `${p.pid} WT`);
    }
});

test('Identical BT & priority — structural validity (Priority NP)', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
        { pid: 'P2', arrivalTime: 0, burstTime: 5, priority: 2 },
    ];
    const r = SA.priorityNonPreemptive(cloneProcesses(procs));
    assertEqual(r.totalTime, 10, 'totalTime');
    for (const p of r.processResults) {
        assertEqual(p.turnaroundTime, p.completionTime - p.arrivalTime, `${p.pid} TAT`);
        assertEqual(p.waitingTime, p.turnaroundTime - p.burstTime, `${p.pid} WT`);
    }
});

/* ---------- Process arriving exactly when another finishes ----------
 *  P1: AT=0, BT=5   → finishes at t=5
 *  P2: AT=5, BT=3   → arrives exactly when P1 finishes; no idle.
 *
 *  All algorithms should produce:
 *    P1: CT=5, TAT=5, WT=0, RT=0
 *    P2: CT=8, TAT=3, WT=0, RT=0
 *    Idle = 0,  totalTime = 8.
 */
test('Arrival at exact finish — FCFS', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
        { pid: 'P2', arrivalTime: 5, burstTime: 3, priority: 2 },
    ];
    const r = SA.fcfs(cloneProcesses(procs));
    verifyProcessResults(r.processResults, {
        P1: { ct: 5, tat: 5, wt: 0, rt: 0 },
        P2: { ct: 8, tat: 3, wt: 0, rt: 0 },
    });
    assertEqual(r.idleTime, 0, 'idleTime');
});

test('Arrival at exact finish — SJF', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
        { pid: 'P2', arrivalTime: 5, burstTime: 3, priority: 2 },
    ];
    const r = SA.sjf(cloneProcesses(procs));
    verifyProcessResults(r.processResults, {
        P1: { ct: 5, tat: 5, wt: 0, rt: 0 },
        P2: { ct: 8, tat: 3, wt: 0, rt: 0 },
    });
    assertEqual(r.idleTime, 0, 'idleTime');
});

test('Arrival at exact finish — SRTF', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
        { pid: 'P2', arrivalTime: 5, burstTime: 3, priority: 2 },
    ];
    const r = SA.srtf(cloneProcesses(procs));
    verifyProcessResults(r.processResults, {
        P1: { ct: 5, tat: 5, wt: 0, rt: 0 },
        P2: { ct: 8, tat: 3, wt: 0, rt: 0 },
    });
    assertEqual(r.idleTime, 0, 'idleTime');
});

test('Arrival at exact finish — Round Robin Q=2', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
        { pid: 'P2', arrivalTime: 5, burstTime: 3, priority: 2 },
    ];
    const r = SA.roundRobin(cloneProcesses(procs), 2);
    // P1: 0-2, 2-4, 4-5 (done). P2: 5-7, 7-8 (done).
    verifyProcessResults(r.processResults, {
        P1: { ct: 5, tat: 5, wt: 0, rt: 0 },
        P2: { ct: 8, tat: 3, wt: 0, rt: 0 },
    });
    assertEqual(r.idleTime, 0, 'idleTime');
});

/* ---------- Very large burst time ----------
 *  Ensures no overflow / performance issues with BT=1000.
 */
test('Large burst time (BT=1000) — FCFS', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 1000, priority: 1 },
    ];
    const r = SA.fcfs(cloneProcesses(procs));
    verifyProcessResults(r.processResults, {
        P1: { ct: 1000, tat: 1000, wt: 0, rt: 0 },
    });
    assertEqual(r.totalTime, 1000, 'totalTime');
});

test('Large burst time (BT=1000) — SJF', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 1000, priority: 1 },
    ];
    const r = SA.sjf(cloneProcesses(procs));
    assertEqual(r.totalTime, 1000, 'totalTime');
    assertEqual(findByPid(r.processResults, 'P1').completionTime, 1000, 'P1 CT');
});

test('Large burst time (BT=1000) — Round Robin Q=100', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 1000, priority: 1 },
    ];
    const r = SA.roundRobin(cloneProcesses(procs), 100);
    assertEqual(r.totalTime, 1000, 'totalTime');
    verifyProcessResults(r.processResults, {
        P1: { ct: 1000, tat: 1000, wt: 0, rt: 0 },
    });
});

/* ---------- Two large-burst processes, RR ----------
 *  P1: AT=0, BT=1000;  P2: AT=0, BT=1000;  Q=100
 *  They alternate 100-unit slices.  Each gets 10 slices.
 *  P1 slices end at: 100,300,500,...,1900   → CT=1900
 *  P2 slices end at: 200,400,600,...,2000   → CT=2000
 *
 *  P1: CT=1900, TAT=1900, WT=900, RT=0
 *  P2: CT=2000, TAT=2000, WT=1000, RT=100
 */
test('Two large-burst processes — RR Q=100', () => {
    const procs = [
        { pid: 'P1', arrivalTime: 0, burstTime: 1000, priority: 1 },
        { pid: 'P2', arrivalTime: 0, burstTime: 1000, priority: 2 },
    ];
    const r = SA.roundRobin(cloneProcesses(procs), 100);
    verifyProcessResults(r.processResults, {
        P1: { ct: 1900, tat: 1900, wt: 900,  rt: 0   },
        P2: { ct: 2000, tat: 2000, wt: 1000, rt: 100 },
    });
    assertEqual(r.totalTime, 2000, 'totalTime');
    assertEqual(r.idleTime,  0,    'idleTime');
});


/* ══════════════════════════════════════════════════════════════════════════════
 *  §12  Cross-Algorithm Structural Invariant Tests
 *
 *  These tests verify mathematical relationships that MUST hold for every
 *  algorithm, regardless of scheduling order:
 *    • TAT = CT − AT
 *    • WT  = TAT − BT
 *    • RT  ≥ 0  and  RT ≤ WT
 *    • Sum of burst times + idle time = total time
 *    • Every process has a Gantt entry and total Gantt span = totalTime
 * ══════════════════════════════════════════════════════════════════════════════ */

group('Structural Invariants (all algorithms)');

const algorithmNames = [
    { name: 'fcfs',                 fn: p => SA.fcfs(p) },
    { name: 'sjf',                  fn: p => SA.sjf(p) },
    { name: 'srtf',                 fn: p => SA.srtf(p) },
    { name: 'priorityNonPreemptive', fn: p => SA.priorityNonPreemptive(p) },
    { name: 'priorityPreemptive',   fn: p => SA.priorityPreemptive(p) },
    { name: 'roundRobin Q=2',       fn: p => SA.roundRobin(p, 2) },
    { name: 'roundRobin Q=4',       fn: p => SA.roundRobin(p, 4) },
];

const invariantDatasets = [
    { label: 'DS1', data: DS1 },
    { label: 'DS2', data: DS2 },
    { label: 'DS3', data: DS3 },
    { label: 'DS4', data: DS4 },
    { label: 'DS5', data: DS5 },
    { label: 'DS6', data: DS6 },
];

for (const algo of algorithmNames) {
    for (const ds of invariantDatasets) {
        test(`${algo.name} × ${ds.label} — TAT/WT/RT invariants`, () => {
            const r = algo.fn(cloneProcesses(ds.data));

            for (const p of r.processResults) {
                // TAT = CT - AT
                assertEqual(
                    p.turnaroundTime,
                    p.completionTime - p.arrivalTime,
                    `${p.pid} TAT = CT - AT`
                );
                // WT = TAT - BT
                assertEqual(
                    p.waitingTime,
                    p.turnaroundTime - p.burstTime,
                    `${p.pid} WT = TAT - BT`
                );
                // RT ≥ 0
                if (p.responseTime < 0) {
                    throw new Error(`${p.pid} RT is negative: ${p.responseTime}`);
                }
                // RT ≤ WT  (response can't exceed waiting for non-preemptive,
                //           but always RT ≤ WT even for preemptive)
                if (p.responseTime > p.waitingTime) {
                    throw new Error(
                        `${p.pid} RT(${p.responseTime}) > WT(${p.waitingTime})`
                    );
                }
            }
        });

        test(`${algo.name} × ${ds.label} — totalTime & idleTime`, () => {
            const r = algo.fn(cloneProcesses(ds.data));

            // Sum of burst times
            const sumBurst = ds.data.reduce((s, p) => s + p.burstTime, 0);

            // totalTime = sumBurst + idleTime
            assertEqual(
                r.totalTime,
                sumBurst + r.idleTime,
                'totalTime = sumBurst + idleTime'
            );

            // Gantt chart should span from 0..totalTime with no gaps/overlaps
            const ganttEnd = r.ganttChart[r.ganttChart.length - 1].end;
            assertEqual(ganttEnd, r.totalTime, 'Gantt last end = totalTime');
        });

        test(`${algo.name} × ${ds.label} — averages are correct`, () => {
            const r = algo.fn(cloneProcesses(ds.data));
            const n = r.processResults.length;

            const expectedAvgWT  = r.processResults.reduce((s, p) => s + p.waitingTime, 0) / n;
            const expectedAvgTAT = r.processResults.reduce((s, p) => s + p.turnaroundTime, 0) / n;
            const expectedAvgRT  = r.processResults.reduce((s, p) => s + p.responseTime, 0) / n;

            assertApprox(r.averages.avgWaitingTime,    expectedAvgWT,  'avgWT');
            assertApprox(r.averages.avgTurnaroundTime, expectedAvgTAT, 'avgTAT');
            assertApprox(r.averages.avgResponseTime,   expectedAvgRT,  'avgRT');
        });
    }
}


/* ══════════════════════════════════════════════════════════════════════════════
 *  §13  Run & Render
 * ══════════════════════════════════════════════════════════════════════════════ */

(function run() {
    const start = performance.now();

    // All test() calls above have already executed synchronously.

    const elapsed = (performance.now() - start).toFixed(1);
    document.getElementById('run-time').textContent = elapsed;

    TestRunner.render();
})();
