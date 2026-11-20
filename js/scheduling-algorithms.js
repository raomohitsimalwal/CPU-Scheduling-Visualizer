/**
 * ============================================================================
 * CPU Scheduling Algorithms Module
 * ============================================================================
 *
 * This module implements six classic CPU scheduling algorithms studied in
 * Operating Systems courses. Each algorithm takes an array of processes and
 * returns a detailed result object containing the Gantt chart, per-process
 * metrics, and aggregate averages.
 *
 * Algorithms implemented:
 *   1. FCFS  – First Come First Serve (non-preemptive)
 *   2. SJF   – Shortest Job First (non-preemptive)
 *   3. Priority (Non-Preemptive)
 *   4. Priority (Preemptive)
 *   5. Round Robin
 *   6. SRTF  – Shortest Remaining Time First (preemptive SJF)
 *
 * INPUT format (array of objects):
 *   { pid: string, arrivalTime: number, burstTime: number, priority: number }
 *
 * OUTPUT format:
 *   {
 *     ganttChart:      [{pid, start, end}, ...],
 *     processResults:  [{pid, arrivalTime, burstTime, priority,
 *                        completionTime, turnaroundTime, waitingTime,
 *                        responseTime}, ...],
 *     averages:        {avgWaitingTime, avgTurnaroundTime, avgResponseTime,
 *                       cpuUtilization, throughput},
 *     totalTime:       number,
 *     idleTime:        number
 *   }
 *
 * IMPORTANT: No input array is ever mutated – we deep-copy first.
 *
 * Author: CPU-Scheduling-Visualizer Project
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // HELPER UTILITIES
  // ==========================================================================

  /**
   * deepCopyProcesses
   * ------------------
   * Creates an independent deep copy of the input process array so that
   * the original data is never modified by any algorithm.
   *
   * @param {Array} processes - Original array of process objects.
   * @returns {Array} A new array with cloned process objects.
   */
  function deepCopyProcesses(processes) {
    return processes.map(function (p) {
      return {
        pid: p.pid,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority
      };
    });
  }

  /**
   * mergeGanttEntries
   * ------------------
   * The raw Gantt chart may have consecutive entries for the same process
   * (e.g., when SRTF keeps running the same process across multiple time
   * units). This function merges adjacent entries with the same pid into
   * a single continuous block.
   *
   * Example:
   *   [{pid:'P1', start:0, end:1}, {pid:'P1', start:1, end:2}]
   *   becomes [{pid:'P1', start:0, end:2}]
   *
   * @param {Array} gantt - Raw Gantt chart array.
   * @returns {Array} Merged Gantt chart.
   */
  function mergeGanttEntries(gantt) {
    if (gantt.length === 0) return [];

    var merged = [{ pid: gantt[0].pid, start: gantt[0].start, end: gantt[0].end }];

    for (var i = 1; i < gantt.length; i++) {
      var last = merged[merged.length - 1];
      // If the current entry is for the same process AND is contiguous,
      // just extend the previous entry's end time.
      if (gantt[i].pid === last.pid && gantt[i].start === last.end) {
        last.end = gantt[i].end;
      } else {
        merged.push({ pid: gantt[i].pid, start: gantt[i].start, end: gantt[i].end });
      }
    }

    return merged;
  }

  /**
   * buildResults
   * -------------
   * After an algorithm finishes, this helper computes per-process metrics
   * and the aggregate averages from the completion times recorded during
   * scheduling.
   *
   * Key formulae (from OS textbooks):
   *   Turnaround Time = Completion Time – Arrival Time
   *   Waiting Time    = Turnaround Time – Burst Time
   *   Response Time   = First CPU Time – Arrival Time
   *
   *   CPU Utilization  = (Total Time – Idle Time) / Total Time × 100
   *   Throughput       = Number of Processes / Total Time
   *
   * @param {Array}  procs          - Deep-copied processes (with original fields).
   * @param {Object} completionMap  - Map: pid → completion time.
   * @param {Object} firstRunMap    - Map: pid → first time process got CPU.
   * @param {Array}  gantt          - The (already merged) Gantt chart.
   * @param {number} totalTime      - Makespan (time at which last process finishes).
   * @param {number} idleTime       - Total idle time across the schedule.
   * @returns {Object} The full result object.
   */
  function buildResults(procs, completionMap, firstRunMap, gantt, totalTime, idleTime) {
    var processResults = procs.map(function (p) {
      var ct = completionMap[p.pid];            // Completion Time
      var tat = ct - p.arrivalTime;             // Turnaround Time
      var wt = tat - p.burstTime;               // Waiting Time
      var rt = firstRunMap[p.pid] - p.arrivalTime; // Response Time

      return {
        pid: p.pid,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        completionTime: ct,
        turnaroundTime: tat,
        waitingTime: wt,
        responseTime: rt
      };
    });

    // Compute averages across all processes.
    var n = processResults.length;
    var sumWT = 0, sumTAT = 0, sumRT = 0;
    for (var i = 0; i < n; i++) {
      sumWT += processResults[i].waitingTime;
      sumTAT += processResults[i].turnaroundTime;
      sumRT += processResults[i].responseTime;
    }

    var averages = {
      avgWaitingTime: parseFloat((sumWT / n).toFixed(2)),
      avgTurnaroundTime: parseFloat((sumTAT / n).toFixed(2)),
      avgResponseTime: parseFloat((sumRT / n).toFixed(2)),
      cpuUtilization: parseFloat(((totalTime - idleTime) / totalTime * 100).toFixed(2)),
      throughput: parseFloat((n / totalTime).toFixed(4))
    };

    return {
      ganttChart: gantt,
      processResults: processResults,
      averages: averages,
      totalTime: totalTime,
      idleTime: idleTime
    };
  }


  // ==========================================================================
  // 1. FCFS – First Come First Serve
  // ==========================================================================
  /**
   * FCFS (First Come First Serve)
   * ==============================
   * The simplest scheduling algorithm. Processes are executed in the order
   * they arrive. Once a process starts, it runs to completion (non-preemptive).
   *
   * Logic:
   *   1. Sort processes by arrival time (ties broken by process order/pid).
   *   2. Starting from time 0, pick the next process in sorted order.
   *   3. If the CPU is free but no process has arrived yet, insert idle time
   *      until the next process arrives.
   *   4. Run the process for its full burst time.
   *   5. Record completion time and move to the next process.
   *
   * Time Complexity: O(n log n) for sorting.
   *
   * @param {Array} processes - Array of process objects.
   * @returns {Object} Result object with Gantt chart, metrics, and averages.
   */
  function fcfs(processes) {
    // Step 1: Deep copy to avoid mutating the input.
    var procs = deepCopyProcesses(processes);

    // Step 2: Sort by arrival time. If two processes arrive at the same time,
    //         the one listed first (by pid, alphabetically) goes first.
    procs.sort(function (a, b) {
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid);
    });

    var gantt = [];            // Gantt chart entries
    var currentTime = 0;       // Tracks the current point in time
    var idleTime = 0;          // Total idle time accumulated
    var completionMap = {};    // pid → completion time
    var firstRunMap = {};      // pid → first time the process was given the CPU

    // Step 3: Process each job in FCFS order.
    for (var i = 0; i < procs.length; i++) {
      var p = procs[i];

      // If the CPU is idle because the next process hasn't arrived yet,
      // we must insert an idle block in the Gantt chart.
      if (currentTime < p.arrivalTime) {
        gantt.push({ pid: 'Idle', start: currentTime, end: p.arrivalTime });
        idleTime += (p.arrivalTime - currentTime);
        currentTime = p.arrivalTime;
      }

      // Record the first time this process gets the CPU (for response time).
      // In FCFS every process runs exactly once, so first run = now.
      firstRunMap[p.pid] = currentTime;

      // The process runs for its entire burst time (non-preemptive).
      var startTime = currentTime;
      currentTime += p.burstTime;

      // Add a Gantt chart entry for this execution block.
      gantt.push({ pid: p.pid, start: startTime, end: currentTime });

      // Record the completion time of this process.
      completionMap[p.pid] = currentTime;
    }

    // Step 4: Build and return the results.
    var totalTime = currentTime;
    return buildResults(procs, completionMap, firstRunMap, mergeGanttEntries(gantt), totalTime, idleTime);
  }


  // ==========================================================================
  // 2. SJF – Shortest Job First (Non-Preemptive)
  // ==========================================================================
  /**
   * SJF (Shortest Job First) – Non-Preemptive
   * ============================================
   * At every scheduling decision point (when the CPU becomes free), we look
   * at all processes that have arrived so far and pick the one with the
   * shortest burst time. Once chosen, it runs to completion.
   *
   * This is provably optimal for minimizing average waiting time among
   * non-preemptive algorithms (but can cause starvation of long processes).
   *
   * Logic:
   *   1. Deep copy & maintain a list of remaining (unfinished) processes.
   *   2. At each decision point, find all processes with arrivalTime <= currentTime.
   *   3. Among those, pick the one with the smallest burstTime.
   *      Tie-breaking: shorter burst → earlier arrival → smaller pid.
   *   4. If no process is available, advance time to the next arrival (idle).
   *   5. Run the selected process to completion.
   *
   * @param {Array} processes - Array of process objects.
   * @returns {Object} Result object.
   */
  function sjf(processes) {
    var procs = deepCopyProcesses(processes);
    var n = procs.length;

    var gantt = [];
    var currentTime = 0;
    var idleTime = 0;
    var completionMap = {};
    var firstRunMap = {};
    var completed = 0;        // Count of completed processes
    var isCompleted = {};      // Track which processes are done

    // Keep going until every process has finished.
    while (completed < n) {
      // Step A: Gather all processes that have arrived and are not yet done.
      var available = [];
      for (var i = 0; i < n; i++) {
        if (!isCompleted[procs[i].pid] && procs[i].arrivalTime <= currentTime) {
          available.push(procs[i]);
        }
      }

      if (available.length === 0) {
        // Step B: No process is available – CPU is idle.
        // Find the earliest arrival among unfinished processes.
        var nextArrival = Infinity;
        for (var i = 0; i < n; i++) {
          if (!isCompleted[procs[i].pid] && procs[i].arrivalTime < nextArrival) {
            nextArrival = procs[i].arrivalTime;
          }
        }
        gantt.push({ pid: 'Idle', start: currentTime, end: nextArrival });
        idleTime += (nextArrival - currentTime);
        currentTime = nextArrival;
        continue; // Re-evaluate with updated time.
      }

      // Step C: Pick the process with the shortest burst time.
      // Tie-breaking order: burstTime → arrivalTime → pid (alphabetical).
      available.sort(function (a, b) {
        if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.pid.localeCompare(b.pid);
      });

      var chosen = available[0];

      // Record first CPU access (response time tracking).
      firstRunMap[chosen.pid] = currentTime;

      // Step D: Run the chosen process to completion (non-preemptive).
      gantt.push({ pid: chosen.pid, start: currentTime, end: currentTime + chosen.burstTime });
      currentTime += chosen.burstTime;
      completionMap[chosen.pid] = currentTime;
      isCompleted[chosen.pid] = true;
      completed++;
    }

    var totalTime = currentTime;
    return buildResults(procs, completionMap, firstRunMap, mergeGanttEntries(gantt), totalTime, idleTime);
  }


  // ==========================================================================
  // 3. Priority Scheduling – Non-Preemptive
  // ==========================================================================
  /**
   * Priority Scheduling (Non-Preemptive)
   * ======================================
   * Similar to SJF, but instead of burst time we use a priority value.
   * A LOWER priority number means HIGHER priority (convention used in most
   * OS textbooks like Silberschatz).
   *
   * Once a process is selected based on its priority, it runs to completion.
   *
   * Tie-breaking order: priority → arrivalTime → pid.
   *
   * @param {Array} processes - Array of process objects.
   * @returns {Object} Result object.
   */
  function priorityNonPreemptive(processes) {
    var procs = deepCopyProcesses(processes);
    var n = procs.length;

    var gantt = [];
    var currentTime = 0;
    var idleTime = 0;
    var completionMap = {};
    var firstRunMap = {};
    var completed = 0;
    var isCompleted = {};

    while (completed < n) {
      // Gather available (arrived & not completed) processes.
      var available = [];
      for (var i = 0; i < n; i++) {
        if (!isCompleted[procs[i].pid] && procs[i].arrivalTime <= currentTime) {
          available.push(procs[i]);
        }
      }

      if (available.length === 0) {
        // CPU is idle – jump to next arrival.
        var nextArrival = Infinity;
        for (var i = 0; i < n; i++) {
          if (!isCompleted[procs[i].pid] && procs[i].arrivalTime < nextArrival) {
            nextArrival = procs[i].arrivalTime;
          }
        }
        gantt.push({ pid: 'Idle', start: currentTime, end: nextArrival });
        idleTime += (nextArrival - currentTime);
        currentTime = nextArrival;
        continue;
      }

      // Sort by priority (ascending = higher priority first),
      // then by arrival time, then by pid.
      available.sort(function (a, b) {
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.pid.localeCompare(b.pid);
      });

      var chosen = available[0];

      firstRunMap[chosen.pid] = currentTime;

      // Execute to completion.
      gantt.push({ pid: chosen.pid, start: currentTime, end: currentTime + chosen.burstTime });
      currentTime += chosen.burstTime;
      completionMap[chosen.pid] = currentTime;
      isCompleted[chosen.pid] = true;
      completed++;
    }

    var totalTime = currentTime;
    return buildResults(procs, completionMap, firstRunMap, mergeGanttEntries(gantt), totalTime, idleTime);
  }


  // ==========================================================================
  // 4. Priority Scheduling – Preemptive
  // ==========================================================================
  /**
   * Priority Scheduling (Preemptive)
   * ==================================
   * At every time unit, we check if a newly arrived process has a higher
   * priority (lower number) than the currently running process. If so,
   * we PREEMPT (pause) the current process and switch to the new one.
   *
   * This is the preemptive version of priority scheduling. It guarantees
   * that the highest-priority available process is always running.
   *
   * We simulate time unit by unit (discrete event simulation):
   *   - At each unit of time, gather all arrived processes.
   *   - Pick the one with the highest priority (lowest number).
   *   - Run it for 1 unit, then repeat.
   *
   * Tie-breaking: priority → arrival time → pid.
   *
   * @param {Array} processes - Array of process objects.
   * @returns {Object} Result object.
   */
  function priorityPreemptive(processes) {
    var procs = deepCopyProcesses(processes);
    var n = procs.length;

    // Each process needs a "remaining burst time" tracker since it can
    // be preempted and resumed later.
    var remaining = {};
    for (var i = 0; i < n; i++) {
      remaining[procs[i].pid] = procs[i].burstTime;
    }

    var gantt = [];
    var currentTime = 0;
    var idleTime = 0;
    var completionMap = {};
    var firstRunMap = {};     // First time the process gets CPU
    var completed = 0;

    // We need to know when to stop. Find the latest possible finish time
    // as an upper bound, but we'll break out when all processes complete.
    // A safe approach: simulate time from 0 and stop when completed == n.

    while (completed < n) {
      // Step A: Find all arrived processes that still have remaining work.
      var available = [];
      for (var i = 0; i < n; i++) {
        if (remaining[procs[i].pid] > 0 && procs[i].arrivalTime <= currentTime) {
          available.push(procs[i]);
        }
      }

      if (available.length === 0) {
        // No process is available – find the next arrival time.
        var nextArrival = Infinity;
        for (var i = 0; i < n; i++) {
          if (remaining[procs[i].pid] > 0 && procs[i].arrivalTime < nextArrival) {
            nextArrival = procs[i].arrivalTime;
          }
        }
        gantt.push({ pid: 'Idle', start: currentTime, end: nextArrival });
        idleTime += (nextArrival - currentTime);
        currentTime = nextArrival;
        continue;
      }

      // Step B: Sort by priority (lowest number = highest priority).
      // Tie-break: arrival time, then pid.
      available.sort(function (a, b) {
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.pid.localeCompare(b.pid);
      });

      var chosen = available[0];

      // Record the first time this process touches the CPU (response time).
      if (firstRunMap[chosen.pid] === undefined) {
        firstRunMap[chosen.pid] = currentTime;
      }

      // Step C: Determine how long this process can run before a potential
      // preemption. Instead of advancing 1 unit at a time (slow for large
      // burst times), we look ahead to the next event: either a new process
      // arrives, or the current process finishes.
      var nextEvent = currentTime + remaining[chosen.pid]; // default: run to completion
      for (var i = 0; i < n; i++) {
        // Check future arrivals that might preempt.
        if (remaining[procs[i].pid] > 0 &&
            procs[i].arrivalTime > currentTime &&
            procs[i].arrivalTime < nextEvent) {
          nextEvent = procs[i].arrivalTime;
        }
      }

      var runDuration = nextEvent - currentTime;

      // Step D: Execute the chosen process for 'runDuration' units.
      gantt.push({ pid: chosen.pid, start: currentTime, end: currentTime + runDuration });
      remaining[chosen.pid] -= runDuration;
      currentTime += runDuration;

      // If the process finished, record its completion time.
      if (remaining[chosen.pid] === 0) {
        completionMap[chosen.pid] = currentTime;
        completed++;
      }
    }

    var totalTime = currentTime;
    return buildResults(procs, completionMap, firstRunMap, mergeGanttEntries(gantt), totalTime, idleTime);
  }


  // ==========================================================================
  // 5. Round Robin
  // ==========================================================================
  /**
   * Round Robin (RR)
   * ==================
   * Each process gets the CPU for a fixed "time quantum" (time slice).
   * If a process doesn't finish within its quantum, it is preempted and
   * placed at the back of the ready queue. This ensures fairness.
   *
   * Key details:
   *   - A ready queue (FIFO) holds processes that have arrived.
   *   - When a process finishes before the quantum expires, we immediately
   *     move on (no wasted time).
   *   - New arrivals during the current quantum are added to the queue
   *     BEFORE the preempted process goes back. (This is the most common
   *     convention in textbooks.)
   *
   * @param {Array}  processes   - Array of process objects.
   * @param {number} timeQuantum - Duration of each time slice.
   * @returns {Object} Result object.
   */
  function roundRobin(processes, timeQuantum) {
    var procs = deepCopyProcesses(processes);
    var n = procs.length;

    // Sort by arrival time first so we can add them to the queue in order.
    procs.sort(function (a, b) {
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid);
    });

    // Remaining burst time for each process.
    var remaining = {};
    for (var i = 0; i < n; i++) {
      remaining[procs[i].pid] = procs[i].burstTime;
    }

    var gantt = [];
    var currentTime = 0;
    var idleTime = 0;
    var completionMap = {};
    var firstRunMap = {};
    var completed = 0;

    // Ready queue: stores process objects. We use an array as a FIFO queue.
    var readyQueue = [];
    var inQueue = {};          // Track which pids are already in the queue.
    var nextArrivalIdx = 0;    // Pointer into the sorted procs array.

    /**
     * enqueueArrivals
     * ----------------
     * Adds all processes that have arrived by `time` (and aren't already
     * in the queue or completed) to the back of the ready queue.
     */
    function enqueueArrivals(time) {
      while (nextArrivalIdx < n && procs[nextArrivalIdx].arrivalTime <= time) {
        var p = procs[nextArrivalIdx];
        if (!inQueue[p.pid] && remaining[p.pid] > 0) {
          readyQueue.push(p);
          inQueue[p.pid] = true;
        }
        nextArrivalIdx++;
      }
    }

    // Seed the ready queue with processes that arrive at time 0.
    enqueueArrivals(0);

    while (completed < n) {
      if (readyQueue.length === 0) {
        // CPU is idle: no process in the ready queue.
        // Jump to the next process arrival.
        var nextArrival = Infinity;
        for (var i = 0; i < n; i++) {
          if (remaining[procs[i].pid] > 0 && procs[i].arrivalTime > currentTime) {
            if (procs[i].arrivalTime < nextArrival) {
              nextArrival = procs[i].arrivalTime;
            }
          }
        }

        if (nextArrival === Infinity) break; // Safety: shouldn't happen.

        gantt.push({ pid: 'Idle', start: currentTime, end: nextArrival });
        idleTime += (nextArrival - currentTime);
        currentTime = nextArrival;

        // Reset the arrival index to re-scan for arrivals at this new time.
        // (We need to re-find processes arriving at exactly nextArrival.)
        nextArrivalIdx = 0;
        for (var i = 0; i < n; i++) {
          if (procs[i].arrivalTime <= currentTime && remaining[procs[i].pid] <= 0) {
            nextArrivalIdx = i + 1;
          }
        }
        // Actually, let's just re-scan properly:
        nextArrivalIdx = 0;
        enqueueArrivals(currentTime);
        continue;
      }

      // Dequeue the front process.
      var current = readyQueue.shift();
      inQueue[current.pid] = false;

      // Record first CPU access for response time.
      if (firstRunMap[current.pid] === undefined) {
        firstRunMap[current.pid] = currentTime;
      }

      // Determine how long this process runs: min(timeQuantum, remaining burst).
      var runTime = Math.min(timeQuantum, remaining[current.pid]);

      // Execute the process.
      gantt.push({ pid: current.pid, start: currentTime, end: currentTime + runTime });
      currentTime += runTime;
      remaining[current.pid] -= runTime;

      // After execution, enqueue any NEW arrivals that happened during this
      // quantum BEFORE re-adding the current (preempted) process.
      // This is the standard textbook convention.
      enqueueArrivals(currentTime);

      if (remaining[current.pid] === 0) {
        // Process has finished execution.
        completionMap[current.pid] = currentTime;
        completed++;
      } else {
        // Process was preempted (didn't finish within quantum).
        // Add it back to the end of the ready queue.
        readyQueue.push(current);
        inQueue[current.pid] = true;
      }
    }

    var totalTime = currentTime;
    return buildResults(procs, completionMap, firstRunMap, mergeGanttEntries(gantt), totalTime, idleTime);
  }


  // ==========================================================================
  // 6. SRTF – Shortest Remaining Time First (Preemptive SJF)
  // ==========================================================================
  /**
   * SRTF (Shortest Remaining Time First)
   * ======================================
   * This is the preemptive version of SJF. At every time unit (or more
   * precisely, at every scheduling event), we compare the remaining burst
   * time of the currently running process with the burst times of newly
   * arrived processes. If a new process has a shorter remaining time,
   * we preempt the current one.
   *
   * This algorithm is optimal for minimizing average waiting time.
   *
   * Optimization: Instead of stepping 1 time unit at a time, we jump to the
   * next meaningful event (a new arrival or current process finishing).
   *
   * Tie-breaking: remaining time → arrival time → pid.
   *
   * @param {Array} processes - Array of process objects.
   * @returns {Object} Result object.
   */
  function srtf(processes) {
    var procs = deepCopyProcesses(processes);
    var n = procs.length;

    // Track remaining burst time for each process.
    var remaining = {};
    for (var i = 0; i < n; i++) {
      remaining[procs[i].pid] = procs[i].burstTime;
    }

    var gantt = [];
    var currentTime = 0;
    var idleTime = 0;
    var completionMap = {};
    var firstRunMap = {};
    var completed = 0;

    while (completed < n) {
      // Step A: Find all available processes (arrived and not finished).
      var available = [];
      for (var i = 0; i < n; i++) {
        if (remaining[procs[i].pid] > 0 && procs[i].arrivalTime <= currentTime) {
          available.push(procs[i]);
        }
      }

      if (available.length === 0) {
        // CPU idle – jump to next arrival.
        var nextArrival = Infinity;
        for (var i = 0; i < n; i++) {
          if (remaining[procs[i].pid] > 0 && procs[i].arrivalTime < nextArrival) {
            nextArrival = procs[i].arrivalTime;
          }
        }
        gantt.push({ pid: 'Idle', start: currentTime, end: nextArrival });
        idleTime += (nextArrival - currentTime);
        currentTime = nextArrival;
        continue;
      }

      // Step B: Among available processes, pick the one with the shortest
      // REMAINING burst time. Ties broken by arrival time, then pid.
      available.sort(function (a, b) {
        if (remaining[a.pid] !== remaining[b.pid]) return remaining[a.pid] - remaining[b.pid];
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.pid.localeCompare(b.pid);
      });

      var chosen = available[0];

      // First CPU access? Record for response time.
      if (firstRunMap[chosen.pid] === undefined) {
        firstRunMap[chosen.pid] = currentTime;
      }

      // Step C: Determine how long this process runs before the next
      // potential preemption event. Events that matter:
      //   1. A new process arrives (might have shorter remaining time).
      //   2. The current process finishes.
      var nextEvent = currentTime + remaining[chosen.pid]; // finish time

      for (var i = 0; i < n; i++) {
        if (remaining[procs[i].pid] > 0 &&
            procs[i].arrivalTime > currentTime &&
            procs[i].arrivalTime < nextEvent) {
          nextEvent = procs[i].arrivalTime;
        }
      }

      var runDuration = nextEvent - currentTime;

      // Step D: Execute the chosen process for the computed duration.
      gantt.push({ pid: chosen.pid, start: currentTime, end: currentTime + runDuration });
      remaining[chosen.pid] -= runDuration;
      currentTime += runDuration;

      // If process finished, record completion time.
      if (remaining[chosen.pid] === 0) {
        completionMap[chosen.pid] = currentTime;
        completed++;
      }
      // Otherwise, it was preempted and will be re-evaluated next iteration.
    }

    var totalTime = currentTime;
    return buildResults(procs, completionMap, firstRunMap, mergeGanttEntries(gantt), totalTime, idleTime);
  }


  // ==========================================================================
  // EXPORT – Attach all algorithms to the global namespace
  // ==========================================================================
  /**
   * We use the window.SchedulingAlgorithms namespace so that other scripts
   * can call these functions like:
   *   window.SchedulingAlgorithms.fcfs(processes)
   *   window.SchedulingAlgorithms.roundRobin(processes, 2)
   */
  window.SchedulingAlgorithms = {
    fcfs: fcfs,
    sjf: sjf,
    priorityNonPreemptive: priorityNonPreemptive,
    priorityPreemptive: priorityPreemptive,
    roundRobin: roundRobin,
    srtf: srtf
  };

})();
