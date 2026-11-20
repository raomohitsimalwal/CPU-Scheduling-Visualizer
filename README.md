# ⚙️ CPU Scheduling Visualizer & Performance Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: 178 Passed](https://img.shields.io/badge/Tests-178%20Passed-success.svg)](tests/test-algorithms.html)
[![Presentation: 14 Slides](https://img.shields.io/badge/Presentation-14%20Slides-brightgreen.svg)](presentation.html)
[![Pure Vanilla JS](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)](index.html)
[![Operating Systems](https://img.shields.io/badge/Course-Operating%20Systems%20Capstone-blueviolet.svg)](docs/PROJECT_REPORT.md)

An interactive, educational, and fully responsive web application that visualizes, evaluates, and compares CPU scheduling algorithms in Operating Systems. Designed for college-level Operating Systems courses, lab practicals, capstone submissions, and viva voce demonstrations.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Supported Scheduling Algorithms](#-supported-scheduling-algorithms)
- [Performance Metrics Explained](#-performance-metrics-explained)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Quick Start Guide](#-quick-start-guide)
- [Running Automated Tests](#-running-automated-tests)
- [Sample Datasets](#-sample-datasets)
- [Academic Report & Deliverables](#-academic-report--deliverables)
- [Viva Voce Cheatsheet](#-viva-voce-cheatsheet)
- [Author & Academic Notice](#-author--academic-notice)

---

## 🌟 Project Overview

In multi-programmed operating systems, the **CPU Scheduler** decides which ready process is allocated the CPU core. Different scheduling policies yield starkly different performance characteristics regarding responsiveness, waiting time, throughput, and fairness.

This project delivers a **full-featured laboratory simulation platform** where students and faculty can:
1. Define custom processes with distinct Process IDs, Arrival Times, Burst Times, and Priorities.
2. Interactively observe dynamic **Gantt Charts** with scaled timelines, idle CPU periods, and color-coded blocks.
3. Automatically compute per-process and average metrics: Completion Time ($CT$), Turnaround Time ($TAT$), Waiting Time ($WT$), Response Time ($RT$), CPU Utilization ($U$), and Throughput ($Th$).
4. Compare all 6 scheduling algorithms side-by-side using real-time comparison tables and responsive bar charts.
5. Review educational theory, algorithmic trade-offs, and step-by-step trace explanations.
6. Verify mathematical accuracy against **178 automated test cases** covering critical edge cases (idle periods, zero arrival, ties in burst/priority, and varied time quanta).

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **Interactive Process Management** | Add, edit, delete, reset processes, or load built-in sample workloads with full real-time input validation. |
| **6 Scheduling Algorithms** | FCFS, Non-Preemptive SJF, Non-Preemptive Priority, Preemptive Priority, Round Robin (configurable quantum), and SRTF. |
| **Dynamic Gantt Charts** | Accurately rendered CSS execution timelines displaying process IDs, start/end times, and explicit CPU idle gaps. |
| **Comprehensive Metrics Table** | Mathematically precise calculations for Completion Time, Turnaround Time, Waiting Time, Response Time, CPU Utilization %, and Throughput. |
| **Algorithm Comparison Engine** | Side-by-side performance benchmarks with animated bar graphs and automatic best-algorithm badge identification per metric. |
| **Step-by-Step Trace** | Human-readable explanation of scheduler decision points (e.g., arrivals, context switches, preemptions). |
| **Dark & Light Mode** | Modern, responsive dashboard with automatic theme switching and local storage persistence. |
| **Automated Testing Suite** | Browser-based graphical runner and CLI test runner executing 178 unit tests with 100% pass rate. |
| **Zero External Dependencies** | Built using pure HTML5, modern CSS3, and ES6 JavaScript. No Node.js build step or internet connection required. |

---

## 🔄 Supported Scheduling Algorithms

### 1. First Come First Serve (FCFS)
- **Type:** Non-Preemptive
- **Selection Criterion:** Smallest Arrival Time ($\min(AT)$). Tie-breaking by Process ID order.
- **Characteristics:** Simple and fair in arrival sequence, but suffers from the **Convoy Effect** (short tasks get delayed behind a long compute-bound task).

### 2. Shortest Job First (SJF)
- **Type:** Non-Preemptive
- **Selection Criterion:** Smallest Burst Time ($\min(BT)$) among ready processes.
- **Characteristics:** Provably optimal in minimizing average waiting time among non-preemptive algorithms. May cause **starvation** for processes with large burst times.

### 3. Priority Scheduling (Non-Preemptive)
- **Type:** Non-Preemptive
- **Convention:** **Lower numerical value = Higher priority** (e.g., Priority 1 precedes Priority 4).
- **Selection Criterion:** Highest priority among ready processes. Ties broken by arrival time.
- **Characteristics:** Honors task urgency, but low-priority processes can suffer starvation without aging.

### 4. Priority Scheduling (Preemptive)
- **Type:** Preemptive
- **Convention:** Lower numerical value = Higher priority.
- **Selection Criterion:** Whenever a new process arrives with higher priority than the currently running process, the CPU is immediately preempted.

### 5. Round Robin (RR)
- **Type:** Preemptive (Time-Sliced)
- **Selection Criterion:** Ready queue organized as a First-In-First-Out (FIFO) queue with a configurable **Time Quantum ($q$)**.
- **Queue Logic:** Newly arrived processes are enqueued into the ready queue before any process that was preempted at the exact same instant.
- **Characteristics:** Highly responsive and starvation-free; optimal for interactive time-sharing systems.

### 6. Shortest Remaining Time First (SRTF)
- **Type:** Preemptive SJF
- **Selection Criterion:** Smallest remaining CPU burst time.
- **Characteristics:** Achieves the theoretical minimum average waiting time across all scheduling algorithms.

---

## 📊 Performance Metrics Explained

$$\text{Turnaround Time } (TAT) = \text{Completion Time } (CT) - \text{Arrival Time } (AT)$$

$$\text{Waiting Time } (WT) = \text{Turnaround Time } (TAT) - \text{Burst Time } (BT)$$

$$\text{Response Time } (RT) = \text{First CPU Start Time} - \text{Arrival Time } (AT)$$

$$\text{CPU Utilization } (U) = \frac{\text{Total Time} - \text{Idle Time}}{\text{Total Time}} \times 100\%$$

$$\text{Throughput } (Th) = \frac{\text{Total Completed Processes}}{\text{Total Simulation Time}}$$

---

## 📁 Project Architecture & Directory Structure

```text
CPU-Scheduling-Visualizer/
├── index.html                     # Main interactive application dashboard
├── test-algorithms.html           # Convenience redirect to automated test runner
├── test-node.js                   # Headless CLI test runner (Node.js)
├── css/
│   └── styles.css                 # Responsive stylesheet with light/dark theme variables
├── js/
│   ├── scheduling-algorithms.js   # Pure algorithmic engine (FCFS, SJF, Priority, RR, SRTF)
│   └── app.js                     # UI state controller, Gantt chart renderer, and chart logic
├── tests/
│   ├── test-algorithms.html       # Graphical browser-based test suite runner
│   └── test-algorithms.js         # 178 assertion test cases and validation suites
└── docs/
    ├── PROJECT_REPORT.md          # Complete formal academic capstone project report
    └── VIVA_QUESTIONS_AND_ANSWERS.md # In-depth viva voce examination preparation guide
```

---

## ⚡ Quick Start Guide

### Option 1: Open Directly in Any Web Browser (No Server Needed)
Simply double-click `index.html` or open it with Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari:
```bash
# Windows PowerShell
Start-Process index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Option 2: Run with a Lightweight Local Server (Optional)
```bash
# Using Python 3
python -m http.server 8000

# Using Node http-server or npx serve
npx serve .
```
Then navigate to `http://localhost:8000` in your browser.

---

## 🧪 Running Automated Tests

The project includes **178 automated tests** validating scheduling logic, arrival gaps, edge cases, tie-breaking, Gantt timeline continuity, and metric invariants ($RT \le WT$, $WT = TAT - BT$, $\sum BT + Idle = TotalTime$).

### Method A: Browser Test Suite (Interactive UI)
Open `tests/test-algorithms.html` in your browser, or click **"Test Suite (178 Tests)"** in the left sidebar of the application.

### Method B: Terminal / CLI Test Runner (Node.js)
Execute the standalone test runner:
```bash
node test-node.js
```
**Output:**
```text
================================================================
   CPU SCHEDULING VISUALIZER — AUTOMATED CLI TEST SUITE
================================================================

----------------------------------------------------------------
✅ Total Test Cases Executed: 178
✅ Passed:                   178
❌ Failed:                   0
----------------------------------------------------------------
🎉 ALL 178 TEST CASES PASSED SUCCESSFULLY!
```

---

## 📂 Sample Datasets

The application features 5 built-in datasets accessible via the **"Load Sample"** dropdown:
1. **Basic Dataset:** 4 processes arriving at $t=0$; ideal for comparing pure burst-time mechanics.
2. **Varied Arrival Times:** Processes arriving staggered across time units; tests arrival queue handling.
3. **Priority Focus:** Distinct priorities (1 to 5) illustrating non-preemptive vs preemptive priority inversions.
4. **Heavy Workload:** 8 diverse processes demonstrating scalability and comparative metrics under load.
5. **CPU Idle Gaps:** Staggered arrivals with idle gaps between $P1, P2, P3$ verifying CPU idle visualization.

---

## 🎓 Academic Report, Presentation & Deliverables

Full academic materials are located in the `docs/` directory and root folder:
- [📊 **PowerPoint Presentation (`CPU_Scheduling_Visualizer_Presentation.pptx`)**](CPU_Scheduling_Visualizer_Presentation.pptx): Professional 16-slide widescreen `.pptx` presentation with dark slate theme, custom cards, tables, and integrated Speaker Notes.
- [📽️ **Interactive Presentation Slide Deck (`presentation.html`)**](presentation.html): 14 modern, animated presentation slides with keyboard navigation, full-screen support, and speaker notes toggle (`N` key).
- [🎤 **Presentation Speech & Speaking Script (`docs/PRESENTATION_SLIDES_AND_SPEECH.md`)**](docs/PRESENTATION_SLIDES_AND_SPEECH.md): Complete word-for-word spoken narration script divided between Mohit Yadav, Devansh Saini, and Deepak.
- [📄 **Formal Project Report (`docs/PROJECT_REPORT.md`)**](docs/PROJECT_REPORT.md): Covers Problem Statement, Mathematical Formulations, Architecture, Mermaid Flowcharts, Test Matrices, and Experimental Findings.
- [🗣️ **Viva Preparation Guide (`docs/VIVA_QUESTIONS_AND_ANSWERS.md`)**](docs/VIVA_QUESTIONS_AND_ANSWERS.md): 30+ frequently asked viva questions, detailed OS theoretical explanations, and step-by-step derivation walkthroughs.

---

## 🎯 Viva Voce Cheatsheet

| Question | Short Answer |
| :--- | :--- |
| **Why is SJF optimal for average waiting time?** | SJF schedules shorter jobs first, giving them small waiting times while only delaying remaining long jobs by tiny increments, minimizing $\frac{1}{n}\sum WT_i$. |
| **What is the Convoy Effect?** | In FCFS, when a long CPU-bound process occupies the CPU, all subsequent shorter I/O-bound processes are blocked waiting in the ready queue, dragging down CPU and device utilization. |
| **How does your Round Robin handle arrival ties?** | When a running process's quantum expires at time $t$ and another process arrives at time $t$, the newly arrived process is enqueued into the ready queue *before* the preempted process is re-enqueued. |
| **What priority convention is used?** | Lower integer = Higher priority ($1 > 2 > 3$). Ties are broken by earliest arrival time, followed by lexicographical process ID. |
| **Can Response Time exceed Waiting Time?** | Never. In non-preemptive algorithms, $RT = WT$. In preemptive algorithms, $RT \le WT$ because a process can be preempted after starting. |

---

## 👥 Project Team & Mandatory Capstone Roles

Developed as an **Operating Systems Capstone Project (Group G1 / G2)** adhering to university 3-member structured division:

| Roll Number | Student Name | Mandatory Assigned Role | Key Domain Contributions |
| :--- | :--- | :--- | :--- |
| **2401730063** | **MOHIT YADAV** | **Student 1: OS / Core Implementation** | Scheduling algorithms (FCFS, SJF, Priority NP/P, Round Robin, SRTF), discrete-event simulation engine, queue tie-breaking, process state models. |
| **2401730102** | **DEVANSH SAINI** | **Student 2: Interface & Visualization** | Dashboard UI, responsive CSS layout, proportional Gantt chart rendering, interactive playback controls, comparison bar charts, Dark/Light mode. |
| **2401730152** | **DEEPAK** | **Student 3: Testing & Performance** | 178 automated test cases, boundary & edge case coverage, mathematical invariant verification, performance analysis ($CT, TAT, WT, RT, U, Th$), documentation. |

*Pure Vanilla Implementation — Designed for college-level academic evaluation, laboratory practical examination, and viva voce defense.*
