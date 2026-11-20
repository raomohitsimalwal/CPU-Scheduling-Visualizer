# 🎓 CPU Scheduling Viva Voce Preparation Guide & Cheatsheet

This document prepares you for any oral exam, practical viva, or project presentation on the **CPU Scheduling Visualizer & Performance Analyzer**. It contains comprehensive, technically sound answers to the most common questions asked by university professors and external examiners.

---

## 📑 Table of Contents
1. [Fundamental OS Concepts](#1-fundamental-os-concepts)
2. [Process States & Schedulers](#2-process-states--schedulers)
3. [Algorithm-Specific Questions](#3-algorithm-specific-questions)
4. [Performance Metrics & Mathematical Invariants](#4-performance-metrics--mathematical-invariants)
5. [Implementation & Design Architecture](#5-implementation--design-architecture)
6. [Tricky Edge Cases & Viva Traps](#6-tricky-edge-cases--viva-traps)

---

## 1. Fundamental OS Concepts

### Q1: What is the primary purpose of CPU Scheduling in an Operating System?
**Answer:**
CPU scheduling is the basis of multi-programmed operating systems. By switching the CPU among processes, the operating system makes the computer more productive. The objective is to maximize **CPU utilization** and **throughput**, while minimizing **turnaround time**, **waiting time**, and **response time**, while maintaining fairness among processes.

### Q2: What is the difference between Preemptive and Non-Preemptive scheduling?
**Answer:**
- **Non-Preemptive Scheduling:** Once the CPU has been allocated to a process, the process keeps the CPU until it releases it, either by terminating or by switching to the waiting state (e.g., for I/O). Examples: Basic FCFS, standard SJF, Non-Preemptive Priority.
- **Preemptive Scheduling:** An executing process can be interrupted and moved back to the ready state by the operating system before its CPU burst completes (e.g., when a higher-priority process arrives or a time slice expires). Examples: Round Robin, SRTF, Preemptive Priority.

### Q3: What is the Dispatcher, and what is Dispatch Latency?
**Answer:**
The **Dispatcher** is the OS module that gives control of the CPU to the process selected by the short-term scheduler. Its functions include:
1. Switching context.
2. Switching to user mode.
3. Jumping to the proper location in the user program to restart it.
The time it takes for the dispatcher to stop one process and start another is called the **Dispatch Latency**.

---

## 2. Process States & Schedulers

### Q4: What are the three levels of schedulers in an OS?
**Answer:**
1. **Long-Term Scheduler (Job Scheduler):** Determines which programs are admitted to the system for processing (controls the degree of multi-programming).
2. **Short-Term Scheduler (CPU Scheduler):** Selects from among the processes in memory that are ready to execute and allocates the CPU to one of them. *This is what this project implements.*
3. **Medium-Term Scheduler (Swapper):** Removes processes from memory (and from active CPU contention) to reduce the degree of multi-programming, later re-introducing them (swapping).

### Q5: What is Context Switching and why is it considered overhead?
**Answer:**
Context switching involves saving the state (registers, program counter, process control block - PCB) of the currently running process and loading the saved state of the newly scheduled process. It is pure overhead because the system does no useful application work while switching.

---

## 3. Algorithm-Specific Questions

### Q6: What is the Convoy Effect, and which algorithm suffers from it?
**Answer:**
The **Convoy Effect** occurs in **First Come First Serve (FCFS)** scheduling when a CPU-bound process with a very large burst time holds the CPU. All other short, I/O-bound processes are forced to wait behind it in the ready queue. This results in poor CPU and device utilization and severely inflates average waiting times.

### Q7: Why is Shortest Job First (SJF) provably optimal for minimizing average waiting time?
**Answer:**
Moving a short process before a long process decreases the waiting time of the short process by more than it increases the waiting time of the long process. Consequently, the average waiting time decreases. For any set of processes with fixed burst times, SJF minimizes $\frac{1}{n} \sum WT_i$.

### Q8: What is the major practical limitation of SJF and SRTF in real-world general-purpose operating systems?
**Answer:**
The primary limitation is knowing or predicting the length of the next CPU burst in advance. In batch systems, users might provide estimated execution limits, but in interactive systems, burst lengths are unknown and must be approximated using techniques like exponential smoothing:
$$\tau_{n+1} = \alpha t_n + (1 - \alpha) \tau_n$$
where $t_n$ is the actual burst length and $\tau_n$ is the historical prediction.

### Q9: What is Starvation (Indefinite Blocking), and how is it resolved?
**Answer:**
Starvation occurs when a runnable process is perpetually denied the CPU because higher-priority or shorter processes continually enter the ready queue.
- **Algorithms susceptible:** Priority Scheduling, SJF, SRTF.
- **Solution:** **Aging** — a technique of gradually increasing the priority of processes that wait in the system for a long time.

### Q10: How does the choice of Time Quantum ($q$) impact Round Robin performance?
**Answer:**
- **If $q$ is extremely large:** Round Robin degrades into First Come First Serve (FCFS).
- **If $q$ is extremely small:** Context switching overhead dominates, causing CPU thrashing and poor throughput.
- **Rule of Thumb:** About 80% of CPU bursts should be shorter than the time quantum, typically between 10 ms and 100 ms in production systems.

### Q11: In Round Robin, what happens when a process finishes its time quantum at the exact same instant a new process arrives?
**Answer:**
In our simulator (and standard OS queue convention), **newly arrived processes are enqueued into the ready queue first**, followed by the preempted process. This guarantees that newly arrived tasks do not wait an entire extra cycle behind a task that just consumed CPU time.

---

## 4. Performance Metrics & Mathematical Invariants

### Q12: Define Turnaround Time ($TAT$), Waiting Time ($WT$), and Response Time ($RT$).
**Answer:**
- **Turnaround Time ($TAT$):** The interval from process submission (Arrival Time) to process completion:
  $$TAT = CT - AT$$
- **Waiting Time ($WT$):** The total time a process spends waiting in the ready queue:
  $$WT = TAT - BT$$
- **Response Time ($RT$):** The time from submission until the first response/execution begins:
  $$RT = \text{First CPU Start Time} - AT$$

### Q13: Can Response Time ever be greater than Waiting Time?
**Answer:**
**No, never ($RT \le WT$).**
- In **non-preemptive algorithms**, a process never yields the CPU once started, meaning $RT = WT$.
- In **preemptive algorithms**, a process may start, get preempted, and wait more in the ready queue, meaning $RT < WT$.
Therefore, $RT \le WT$ is a fundamental invariant across all scheduling disciplines.

### Q14: How are CPU Utilization and Throughput calculated?
**Answer:**
- **CPU Utilization ($U$):**
  $$U = \left( \frac{\text{Total Time} - \text{Total Idle Time}}{\text{Total Time}} \right) \times 100\%$$
- **Throughput ($Th$):**
  $$Th = \frac{\text{Number of Completed Processes}}{\text{Total Schedule Time}} \quad (\text{processes/unit time})$$

---

## 5. Implementation & Design Architecture

### Q15: How did you implement preemption in your code?
**Answer:**
Instead of incrementing time unit-by-unit ($t = 0, 1, 2, \dots$), our simulation engine uses **discrete-event simulation**. The scheduler advances time to the next significant event: either the arrival of a new process or the completion of the current time slice/burst. At that point, the scheduler evaluates remaining times or priorities, logs a Gantt segment, and switches tasks if required. Consecutive blocks of the same process are merged cleanly.

### Q16: How do you handle CPU idle time?
**Answer:**
If the ready queue is empty at time $t$ and unarrived processes remain, the engine advances time directly to the earliest arrival time $AT_{\min}$ of the remaining processes. It logs an explicit `{ pid: 'Idle', start: t, end: AT_min }` block, which is visually distinguished in the Gantt chart with hatched diagonal styling.

### Q17: Why did you choose Vanilla JavaScript instead of frameworks like React or Angular?
**Answer:**
1. **Zero build dependencies:** Opens in any browser instantly without `npm install` or compilation.
2. **Direct explainability in viva:** The code has no framework boilerplate or virtual DOM abstraction; the professor can inspect pure algorithmic functions in `js/scheduling-algorithms.js`.
3. **High performance:** Instant rendering of Gantt blocks and responsive bar charts with minimal memory footprint.

---

## 6. Tricky Edge Cases & Viva Traps

### Q18: What priority convention is used in your visualizer?
**Answer:**
**Lower numerical integer = Higher priority** (e.g., Priority 0 or 1 is the highest priority, Priority 5 is lower). This matches UNIX nice values and standard textbooks. Ties in priority are broken by earliest arrival time ($AT$), then alphabetically by Process ID.

### Q19: What happens if all processes have identical burst times in SJF?
**Answer:**
When burst times are identical, SJF breaks ties using Arrival Time, effectively behaving like FCFS. If arrival times are also identical, it breaks ties deterministically using the Process ID order.

### Q20: What happens if a process has a Burst Time of 0?
**Answer:**
Our form validation forbids Burst Time $\le 0$ because in real operating systems, a process must execute at least one CPU instruction to exist. If entered via API, it would complete immediately at arrival time with $WT=0, TAT=0$.

### Q21: How do you verify that your scheduling calculations are correct?
**Answer:**
We wrote an automated test suite (`tests/test-algorithms.js`) with **178 automated tests** that executes against known textbook problems, verifying:
- Completion times and order.
- Invariants: $WT = TAT - BT$, $RT \le WT$, $\text{Total Time} = \sum BT + \text{Idle Time}$.
- Edge cases: all arriving at 0, staggered arrivals, single process, identical priorities, and varied quanta.
The test runner can be launched from the browser (`tests/test-algorithms.html`) or command line (`node test-node.js`).
