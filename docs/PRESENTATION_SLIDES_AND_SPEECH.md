# 🎤 Project Presentation Script & Slide-by-Slide Speaking Notes
## CPU Scheduling Visualizer & Performance Analyzer
**Course:** Operating Systems Capstone Project (Group G1 / G2)

---

## 👥 Team Members & Designated Roles

| Roll No. | Student Name | Designated Role | Presentation Sections |
| :--- | :--- | :--- | :--- |
| **2401730063** | **MOHIT YADAV** | **Student 1: OS / Core Implementation** | Slides 1, 2, 4, 5, 11, 12, 14 |
| **2401730102** | **DEVANSH SAINI** | **Student 2: Interface & Visualization** | Slides 3, 7, 9, 13, 14 |
| **2401730152** | **DEEPAK** | **Student 3: Testing & Performance** | Slides 6, 8, 10, 14 |

---

## 🖥️ How to Present
- **Interactive Slide Deck:** Open `presentation.html` in Google Chrome, Microsoft Edge, or Mozilla Firefox.
- **Controls:**
  - `Right Arrow` or `Space`: Advance to next slide.
  - `Left Arrow`: Return to previous slide.
  - `F`: Toggle Fullscreen mode.
  - `N`: Toggle Speaker Notes drawer on screen.
  - `⚡ Open App`: Instantly switch to the live web application.

---

## Slide 1: Title & Team Introduction
- **Slide Title:** CPU Scheduling Visualizer & Performance Analyzer
- **Active Speaker:** **MOHIT YADAV (2401730063)**
- **Spoken Script:**
  > "Respected Professor and External Examiner, Good morning. Today, our team is presenting our Operating Systems Capstone Project titled **'CPU Scheduling Visualizer & Performance Analyzer'**.
  >
  > I am **Mohit Yadav** (Roll No: 2401730063), and with me are my fellow group members **Devansh Saini** (Roll No: 2401730102) and **Deepak** (Roll No: 2401730152).
  >
  > In modern multi-programmed computer systems, the CPU scheduler is responsible for allocating CPU execution cycles among competing processes. Our project bridges theoretical textbook formulas and practical execution by offering a fully interactive, mathematically verified simulation platform."

---

## Slide 2: Problem Statement & Motivation
- **Slide Title:** The CPU Scheduling Challenge
- **Active Speaker:** **MOHIT YADAV (2401730063)**
- **Spoken Script:**
  > "In university lectures, scheduling algorithms such as FCFS, Shortest Job First, Priority, and Round Robin are traditionally taught using static diagrams drawn on paper or whiteboards.
  >
  > However, students face severe difficulties visualizing:
  > 1. How preemption dynamically interrupts active process execution (such as in SRTF or Preemptive Priority).
  > 2. How the Round Robin ready queue behaves when process arrivals coincide with time quantum expirations.
  > 3. How idle CPU periods affect scheduling continuity and CPU utilization.
  >
  > To solve this, we set out to build an interactive laboratory simulation platform that accurately computes, animates, and benchmarks scheduling algorithms with zero external dependencies."

---

## Slide 3: 3-Member Role Architecture
- **Slide Title:** Structured 3-Member Responsibilities
- **Active Speaker:** **DEVANSH SAINI (2401730102)**
- **Spoken Script:**
  > "To ensure each member contributed deeply to an essential domain of computer systems engineering, we divided our responsibilities strictly according to the syllabus capstone guidelines:
  >
  > - **Mohit Yadav** took ownership of **OS and Core Implementation**, designing the pure functional algorithms, discrete-event simulation engine, tie-breaking rules, and queue mechanics.
  > - **I (Devansh Saini)** took charge of **Interface and Visualization**, creating our responsive dashboard, proportional Gantt chart renderer, live simulation playback controls, and comparative bar charts.
  > - **Deepak** spearheaded **Testing and Performance Analysis**, implementing a 178-test verification harness, testing boundary conditions, and validating mathematical invariants."

---

## Slide 4: System Architecture & Data Flow
- **Slide Title:** Decoupled Architectural Pipeline
- **Active Speaker:** **MOHIT YADAV (2401730063)**
- **Spoken Script:**
  > "From a software architecture perspective, we enforced a strict unidirectional data flow.
  >
  > The core scheduling engine in `scheduling-algorithms.js` is completely decoupled from the DOM. It operates as a pure discrete-event simulator: it accepts an array of process specifications and returns an immutable result object containing execution intervals, per-process completion records, and system averages.
  >
  > Because the core engine has zero DOM dependencies, the exact same algorithmic code runs inside our web application and in our headless Node.js CLI test runner."

---

## Slide 5: Core Scheduling Algorithms
- **Slide Title:** 6 Scheduling Algorithms Implemented
- **Active Speaker:** **MOHIT YADAV (2401730063)**
- **Spoken Script:**
  > "We implemented six distinct scheduling policies:
  > 1. **First Come First Serve (FCFS):** Non-preemptive, arrival-time ordered. Simple, but vulnerable to the Convoy Effect.
  > 2. **Shortest Job First (SJF):** Non-preemptive, selecting the available process with the smallest burst time.
  > 3. **Priority Scheduling (Non-Preemptive & Preemptive):** Standard convention where **lower number equals higher priority**. Preemptive mode interrupts execution immediately when a higher-priority task arrives.
  > 4. **Round Robin (RR):** Preemptive, time-sliced execution with a user-configurable time quantum $q$.
  > 5. **Shortest Remaining Time First (SRTF):** Preemptive SJF that achieves theoretical minimum waiting time.
  > 6. **CPU Idle Gap Handling:** When no process is ready, the CPU explicitly records idle blocks."

---

## Slide 6: Mathematical Formulations & Invariants
- **Slide Title:** Performance Metrics & Invariants
- **Active Speaker:** **DEEPAK (2401730152)**
- **Spoken Script:**
  > "Every metric computed in our application is derived from foundational operating systems equations:
  > - Turnaround Time ($TAT$) = Completion Time ($CT$) minus Arrival Time ($AT$).
  > - Waiting Time ($WT$) = Turnaround Time minus Burst Time ($BT$).
  > - Response Time ($RT$) = First CPU Start Time minus Arrival Time ($AT$).
  > - CPU Utilization ($U$) = Total Busy Time divided by Total Schedule Time.
  > - Throughput ($Th$) = Total Completed Processes divided by Total Schedule Time.
  >
  > Crucially, our test suite verifies fundamental mathematical invariants:
  > First, for all non-preemptive algorithms, Response Time strictly equals Waiting Time ($RT = WT$).
  > Second, for all preemptive algorithms, Response Time can never exceed Waiting Time ($RT \le WT$).
  > And third, total schedule duration always equals the sum of all burst times plus idle time."

---

## Slide 7: Gantt Chart & Interactive Playback Engine
- **Slide Title:** Dynamic Gantt Chart & Playback Engine
- **Active Speaker:** **DEVANSH SAINI (2401730102)**
- **Spoken Script:**
  > "In the visualization module, we engineered two major innovations:
  >
  > First, our Gantt chart uses proportional pixel scaling so that time durations correspond directly to block widths. CPU idle gaps are explicitly displayed with hatched diagonal styling, ensuring timeline continuity.
  >
  > Second, we implemented an **Interactive Simulation Playback Controller**. Rather than only showing a static chart, users can click **Play**, **Pause**, or **Step Next/Prev** to observe CPU execution tick forward block-by-block. The active process glows with a golden outline while future processes remain dimmed, enabling examiners to inspect preemption points in real time."

---

## Slide 8: Multi-Algorithm Benchmark Comparison
- **Slide Title:** Multi-Algorithm Benchmark Comparison
- **Active Speaker:** **DEEPAK (2401730152)**
- **Spoken Script:**
  > "This slide illustrates empirical benchmark results on a standard university workload consisting of four processes with varying arrivals, bursts, and priorities.
  >
  > Notice the key comparative observations:
  > - **SRTF** delivers the lowest average waiting time (5.75) and lowest average turnaround time (11.75).
  > - However, **Round Robin ($q=3$)** delivers the fastest average response time: 1.50 units compared to 8.75 for FCFS!
  > - This demonstrates the fundamental OS principle: **no single algorithm is universally best**. SRTF optimizes batch throughput and waiting times, while Round Robin is indispensable for interactive desktop operating systems."

---

## Slide 9: Edge Case Handling & Input Validation
- **Slide Title:** Robust Edge Case Handling
- **Active Speaker:** **DEVANSH SAINI (2401730102)**
- **Spoken Script:**
  > "Robust error handling was a core requirement. Our interface features real-time inline validation that prevents invalid states:
  > - Arrival times must be non-negative integers.
  > - Burst times must be positive non-zero integers (preventing zero-burst divide-by-zero crashes).
  > - Duplicate Process IDs are detected and flagged immediately.
  > - The scheduler deterministically handles simultaneous arrival ties, zero-arrival workloads, and solitary process sets."

---

## Slide 10: Automated Testing & Verification Suite
- **Slide Title:** Automated Verification: 178 Tests
- **Active Speaker:** **DEEPAK (2401730152)**
- **Spoken Script:**
  > "To verify that our algorithms never produce incorrect results, I authored an automated test suite containing **178 assertion test cases**.
  >
  > Our test suite runs in two environments:
  > 1. An interactive graphical browser test runner with visual progress bars and per-algorithm test breakdowns.
  > 2. A headless Node.js CLI runner that executes with `node test-node.js`.
  >
  > I am proud to report that **100% of our 178 test cases pass with zero defects**, verifying exact completion times, queue behavior, and boundary invariants."

---

## Slide 11: Real-World Operating System Connections
- **Slide Title:** Real-World Operating System Connections
- **Active Speaker:** **MOHIT YADAV (2401730063)**
- **Spoken Script:**
  > "These theoretical algorithms directly parallel modern commercial operating systems:
  > - The **Linux kernel** uses the **Completely Fair Scheduler (CFS)**, using a Red-Black Tree indexed by virtual runtime ($vruntime$) to give processes an equal share of CPU power.
  > - The **Windows NT kernel** employs a 32-level multi-level priority queue with dynamic priority boosting for foreground interactive threads.
  > - **Real-Time Operating Systems (RTOS)** in robotics and automotive control rely on Rate-Monotonic and Earliest-Deadline-First algorithms to guarantee hard deadline compliance."

---

## Slide 12: Viva Voce Defense Strategy
- **Slide Title:** Key Viva Questions & Examiner Defenses
- **Active Speaker:** **MOHIT YADAV (2401730063)**
- **Spoken Script:**
  > "During our viva preparation, we documented answers to core questions:
  > - *Why is SJF optimal?* Moving short jobs forward reduces their waiting time by more than it increases waiting time for longer jobs, minimizing the average.
  > - *What is the Convoy Effect?* In FCFS, when a long process holds the CPU, short I/O-bound tasks wait behind it, degrading utilization.
  > - *How do we handle simultaneous arrivals in Round Robin?* Newly arrived tasks enter the ready queue before the preempted task is re-appended."

---

## Slide 13: Limitations & Future Enhancements
- **Slide Title:** Limitations & Future Enhancements
- **Active Speaker:** **DEVANSH SAINI (2401730102)**
- **Spoken Script:**
  > "Our current implementation models a single-core uniprocessor with deterministic bursts. In future versions, we plan to extend this with:
  > 1. Multi-Level Feedback Queue (MLFQ) with dynamic aging.
  > 2. Multi-core Symmetric Multiprocessing (SMP) visualization.
  > 3. Automated PDF laboratory report generation with vector Gantt charts."

---

## Slide 14: Conclusion & Live Demonstration
- **Slide Title:** Live Demonstration & Q&A
- **Active Speaker:** **ALL TEAM MEMBERS (Mohit, Devansh, Deepak)**
- **Spoken Script:**
  > "In conclusion, our CPU Scheduling Visualizer and Performance Analyzer provides a complete, robust, and mathematically accurate platform for learning and demonstrating Operating Systems principles.
  >
  > We would now like to invite the examiners to view our live demonstration, enter custom process workloads, and inspect our interactive Gantt chart playback controls. Thank you!"
