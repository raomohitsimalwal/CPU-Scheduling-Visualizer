/**
 * =============================================================================
 * CPU Scheduling Visualizer & Performance Analyzer
 * Main Application Logic (app.js)
 * =============================================================================
 * 
 * This file handles all the user interface logic:
 * - Navigation between sections
 * - Process input management (add, edit, delete, reset, load samples)
 * - Running scheduling algorithms and displaying results
 * - Generating Gantt charts
 * - Displaying performance metrics
 * - Algorithm comparison with bar charts
 * - Dark/light theme toggling
 * - Toast notifications
 * - Input validation
 * 
 * Dependencies: scheduling-algorithms.js (must be loaded first)
 * =============================================================================
 */

// ============================================================================
// GLOBAL STATE
// All application state is stored here for easy access and debugging.
// ============================================================================

/**
 * Array of process objects entered by the user.
 * Each process: { pid: string, arrivalTime: number, burstTime: number, priority: number }
 */
let processes = [];

/** Currently selected algorithm key (e.g., 'fcfs', 'sjf', 'rr') */
let currentAlgorithm = 'fcfs';

/** Index of the process being edited (-1 means adding a new process) */
let editingIndex = -1;

/** 
 * Color palette for process visualization.
 * Each process gets a consistent color based on its index.
 */
const PROCESS_COLORS = [
    '#4361ee', '#f72585', '#4cc9f0', '#7209b7', '#f77f00',
    '#06d6a0', '#ef476f', '#ffd166', '#118ab2', '#8338ec'
];

/**
 * Algorithm display names for the UI.
 */
const ALGO_NAMES = {
    'fcfs': 'FCFS',
    'sjf': 'SJF',
    'priority-np': 'Priority (NP)',
    'priority-p': 'Priority (P)',
    'rr': 'Round Robin',
    'srtf': 'SRTF'
};

/**
 * Full algorithm names for display.
 */
const ALGO_FULL_NAMES = {
    'fcfs': 'First Come First Serve',
    'sjf': 'Shortest Job First',
    'priority-np': 'Priority Scheduling (Non-Preemptive)',
    'priority-p': 'Priority Scheduling (Preemptive)',
    'rr': 'Round Robin',
    'srtf': 'Shortest Remaining Time First'
};

/**
 * Algorithm descriptions for the scheduling section.
 */
const ALGO_DESCRIPTIONS = {
    'fcfs': 'The simplest scheduling algorithm. Processes are executed in the order they arrive in the ready queue. It is non-preemptive — once a process starts executing, it runs to completion. FCFS may cause the "convoy effect" where short processes wait behind long ones.',
    'sjf': 'Selects the process with the shortest burst time from the ready queue (non-preemptive). Once a process starts, it runs to completion. SJF produces the optimal average waiting time for non-preemptive scheduling but may cause starvation of long processes.',
    'priority-np': 'Selects the process with the highest priority (lowest priority number) from the ready queue. Non-preemptive — once a process starts, it runs to completion. May cause starvation of low-priority processes.',
    'priority-p': 'Selects the process with the highest priority (lowest priority number). Preemptive — if a newly arrived process has higher priority than the currently running process, the running process is preempted. May cause starvation of low-priority processes.',
    'rr': 'Each process gets a fixed time quantum. If a process doesn\'t finish within its quantum, it is moved to the back of the ready queue. This ensures fairness — every process gets equal CPU time. Performance depends heavily on the quantum size.',
    'srtf': 'Preemptive version of SJF. At each time unit, the process with the shortest remaining burst time is selected. If a newly arrived process has shorter remaining time than the current one, the current process is preempted. Produces optimal average waiting time overall.'
};

// ============================================================================
// SAMPLE DATASETS
// Pre-defined datasets for quick demonstration.
// ============================================================================
const SAMPLE_DATASETS = {
    /** Basic dataset: all processes arrive at time 0 */
    basic: [
        { pid: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
        { pid: 'P2', arrivalTime: 0, burstTime: 8, priority: 1 },
        { pid: 'P3', arrivalTime: 0, burstTime: 7, priority: 3 },
        { pid: 'P4', arrivalTime: 0, burstTime: 3, priority: 4 }
    ],
    /** Varied arrival times */
    varied: [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 3 },
        { pid: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
        { pid: 'P3', arrivalTime: 2, burstTime: 8, priority: 4 },
        { pid: 'P4', arrivalTime: 3, burstTime: 6, priority: 2 }
    ],
    /** Priority-focused dataset */
    priority: [
        { pid: 'P1', arrivalTime: 0, burstTime: 10, priority: 3 },
        { pid: 'P2', arrivalTime: 0, burstTime: 1, priority: 1 },
        { pid: 'P3', arrivalTime: 0, burstTime: 2, priority: 5 },
        { pid: 'P4', arrivalTime: 0, burstTime: 1, priority: 4 },
        { pid: 'P5', arrivalTime: 0, burstTime: 5, priority: 2 }
    ],
    /** Heavy workload with 8 processes */
    heavy: [
        { pid: 'P1', arrivalTime: 0, burstTime: 8, priority: 3 },
        { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
        { pid: 'P3', arrivalTime: 2, burstTime: 9, priority: 4 },
        { pid: 'P4', arrivalTime: 3, burstTime: 5, priority: 2 },
        { pid: 'P5', arrivalTime: 4, burstTime: 2, priority: 5 },
        { pid: 'P6', arrivalTime: 5, burstTime: 6, priority: 1 },
        { pid: 'P7', arrivalTime: 6, burstTime: 3, priority: 3 },
        { pid: 'P8', arrivalTime: 7, burstTime: 7, priority: 2 }
    ],
    /** Gaps between arrivals (causes CPU idle time) */
    gaps: [
        { pid: 'P1', arrivalTime: 0, burstTime: 3, priority: 1 },
        { pid: 'P2', arrivalTime: 5, burstTime: 4, priority: 2 },
        { pid: 'P3', arrivalTime: 12, burstTime: 2, priority: 3 }
    ]
};

// ============================================================================
// NAVIGATION
// Single-page app navigation between sections.
// ============================================================================

/**
 * Navigate to a specific section.
 * Hides all sections, shows the target, and updates the active nav link.
 * @param {string} sectionId - The section to navigate to (e.g., 'dashboard', 'process-input')
 */
function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Show target section
    const target = document.getElementById('section-' + sectionId);
    if (target) {
        target.classList.add('active');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    
    // Close mobile sidebar
    closeSidebar();
    
    // Refresh section-specific content
    switch (sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'gantt':
            updateGanttChart();
            break;
        case 'performance':
            updatePerformance();
            break;
        case 'comparison':
            updateComparison();
            break;
    }
}

// ============================================================================
// SIDEBAR (Mobile)
// ============================================================================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// ============================================================================
// THEME TOGGLE
// Switches between light and dark mode.
// ============================================================================

/**
 * Toggle between light and dark theme.
 * Saves preference to localStorage for persistence.
 */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update button text
    const label = document.getElementById('themeLabel');
    label.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

/**
 * Initialize theme from localStorage on page load.
 */
function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeLabel').textContent = '☀️ Light Mode';
    }
}

// ============================================================================
// TOAST NOTIFICATIONS
// Display temporary feedback messages to the user.
// ============================================================================

/**
 * Show a toast notification.
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info', or 'warning'
 * @param {number} duration - How long to show the toast (ms), default 3000
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Auto-remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================================================
// DROPDOWN
// Simple dropdown toggle for the sample data button.
// ============================================================================

function toggleDropdown(id) {
    const menu = document.getElementById(id);
    menu.classList.toggle('open');
    
    // Close when clicking outside
    const closeHandler = (e) => {
        if (!menu.contains(e.target) && !menu.previousElementSibling.contains(e.target)) {
            menu.classList.remove('open');
            document.removeEventListener('click', closeHandler);
        }
    };
    
    if (menu.classList.contains('open')) {
        // Delay to avoid immediate close from same click
        setTimeout(() => document.addEventListener('click', closeHandler), 0);
    }
}

// ============================================================================
// PROCESS MANAGEMENT
// Add, edit, delete, reset processes.
// ============================================================================

/**
 * Validate process form inputs.
 * @returns {object|null} - Validated process object or null if invalid
 */
function validateProcessInput() {
    const pid = document.getElementById('inputPID').value.trim();
    const at = document.getElementById('inputAT').value;
    const bt = document.getElementById('inputBT').value;
    const priority = document.getElementById('inputPriority').value;
    
    let valid = true;
    
    // Clear previous errors
    ['PID', 'AT', 'BT', 'Priority'].forEach(field => {
        document.getElementById('error' + field).classList.remove('visible');
        document.getElementById('error' + field).textContent = '';
        document.getElementById('input' + field).classList.remove('error');
    });
    
    // Validate Process ID
    if (!pid) {
        showFieldError('PID', 'Process ID is required');
        valid = false;
    } else if (editingIndex === -1 && processes.some(p => p.pid.toLowerCase() === pid.toLowerCase())) {
        showFieldError('PID', 'Process ID already exists');
        valid = false;
    } else if (editingIndex >= 0 && processes.some((p, i) => i !== editingIndex && p.pid.toLowerCase() === pid.toLowerCase())) {
        showFieldError('PID', 'Process ID already exists');
        valid = false;
    }
    
    // Validate Arrival Time
    if (at === '' || at === null) {
        showFieldError('AT', 'Arrival Time is required');
        valid = false;
    } else if (parseInt(at) < 0 || !Number.isInteger(Number(at))) {
        showFieldError('AT', 'Must be a non-negative integer');
        valid = false;
    }
    
    // Validate Burst Time
    if (bt === '' || bt === null) {
        showFieldError('BT', 'Burst Time is required');
        valid = false;
    } else if (parseInt(bt) < 1 || !Number.isInteger(Number(bt))) {
        showFieldError('BT', 'Must be a positive integer (≥ 1)');
        valid = false;
    }
    
    // Validate Priority
    if (priority === '' || priority === null) {
        showFieldError('Priority', 'Priority is required');
        valid = false;
    } else if (parseInt(priority) < 0 || !Number.isInteger(Number(priority))) {
        showFieldError('Priority', 'Must be a non-negative integer');
        valid = false;
    }
    
    if (!valid) return null;
    
    return {
        pid: pid,
        arrivalTime: parseInt(at),
        burstTime: parseInt(bt),
        priority: parseInt(priority)
    };
}

/**
 * Show a validation error on a specific form field.
 */
function showFieldError(field, message) {
    const errorEl = document.getElementById('error' + field);
    const inputEl = document.getElementById('input' + field);
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    inputEl.classList.add('error');
}

/**
 * Handle process form submission (add or update).
 * @param {Event} event - The form submit event
 * @returns {boolean} false to prevent form submission
 */
function handleProcessSubmit(event) {
    event.preventDefault();
    
    const process = validateProcessInput();
    if (!process) return false;
    
    if (editingIndex >= 0) {
        // Update existing process
        processes[editingIndex] = process;
        showToast(`Process ${process.pid} updated successfully`, 'success');
        cancelEdit();
    } else {
        // Add new process
        processes.push(process);
        showToast(`Process ${process.pid} added successfully`, 'success');
    }
    
    // Clear form
    document.getElementById('processForm').reset();
    
    // Auto-generate next PID
    suggestNextPID();
    
    // Refresh displays
    renderProcessTable();
    updateDashboard();
    
    return false;
}

/**
 * Suggest the next process ID (e.g., P1, P2, P3...).
 */
function suggestNextPID() {
    let maxNum = 0;
    processes.forEach(p => {
        const match = p.pid.match(/^P(\d+)$/i);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    });
    document.getElementById('inputPID').value = 'P' + (maxNum + 1);
}

/**
 * Start editing a process (fill form with its data).
 * @param {number} index - Index of the process in the processes array
 */
function editProcess(index) {
    const process = processes[index];
    editingIndex = index;
    
    document.getElementById('inputPID').value = process.pid;
    document.getElementById('inputAT').value = process.arrivalTime;
    document.getElementById('inputBT').value = process.burstTime;
    document.getElementById('inputPriority').value = process.priority;
    
    document.getElementById('processFormTitle').textContent = `✏️ Edit Process ${process.pid}`;
    document.getElementById('btnSubmitProcess').textContent = '💾 Update Process';
    document.getElementById('btnCancelEdit').style.display = 'inline-flex';
    
    // Scroll to form
    document.getElementById('processForm').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Cancel editing mode, reset form.
 */
function cancelEdit() {
    editingIndex = -1;
    document.getElementById('processForm').reset();
    document.getElementById('processFormTitle').textContent = '➕ Add New Process';
    document.getElementById('btnSubmitProcess').textContent = '➕ Add Process';
    document.getElementById('btnCancelEdit').style.display = 'none';
    suggestNextPID();
}

/**
 * Delete a process by index.
 * @param {number} index - Index of the process to delete
 */
function deleteProcess(index) {
    const pid = processes[index].pid;
    processes.splice(index, 1);
    showToast(`Process ${pid} deleted`, 'warning');
    renderProcessTable();
    updateDashboard();
    
    // If we were editing this process, cancel edit
    if (editingIndex === index) cancelEdit();
    else if (editingIndex > index) editingIndex--;
}

/**
 * Reset all processes.
 */
function resetAllProcesses() {
    if (processes.length === 0) return;
    
    processes = [];
    cancelEdit();
    renderProcessTable();
    updateDashboard();
    showToast('All processes cleared', 'info');
}

/**
 * Load a sample dataset.
 * @param {string} name - Key from SAMPLE_DATASETS
 */
function loadSample(name) {
    const data = SAMPLE_DATASETS[name];
    if (!data) return;
    
    // Deep copy to avoid mutating the sample
    processes = JSON.parse(JSON.stringify(data));
    
    cancelEdit();
    renderProcessTable();
    updateDashboard();
    
    // Close dropdown
    document.getElementById('sampleDropdown').classList.remove('open');
    
    showToast(`Loaded "${name}" dataset (${data.length} processes)`, 'success');
}

// ============================================================================
// PROCESS TABLE RENDERING
// Render the process list table in the Process Input section.
// ============================================================================

/**
 * Render the process table showing all current processes.
 */
function renderProcessTable() {
    const tbody = document.getElementById('processTableBody');
    const wrapper = document.getElementById('processTableWrapper');
    const empty = document.getElementById('emptyProcessState');
    const countEl = document.getElementById('processCount');
    
    if (processes.length === 0) {
        wrapper.style.display = 'none';
        empty.style.display = 'block';
        countEl.textContent = '0 processes';
        return;
    }
    
    wrapper.style.display = 'block';
    empty.style.display = 'none';
    countEl.textContent = `${processes.length} process${processes.length !== 1 ? 'es' : ''}`;
    
    tbody.innerHTML = processes.map((p, i) => `
        <tr>
            <td><span class="pid-badge badge-${i % 10}">${escapeHtml(p.pid)}</span></td>
            <td>${p.arrivalTime}</td>
            <td>${p.burstTime}</td>
            <td>${p.priority}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editProcess(${i})" title="Edit">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProcess(${i})" title="Delete" style="margin-left:4px;">🗑️</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Render a read-only process table (for dashboard).
 */
function renderDashboardProcessTable() {
    const container = document.getElementById('dashboardProcessTable');
    
    if (processes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>No processes added yet</h3>
                <p>Add processes or load a sample dataset to begin.</p>
                <button class="btn btn-primary" onclick="navigateTo('process-input')">Add Processes</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Process ID</th>
                        <th>Arrival Time</th>
                        <th>Burst Time</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
                    ${processes.map((p, i) => `
                        <tr>
                            <td><span class="pid-badge badge-${i % 10}">${escapeHtml(p.pid)}</span></td>
                            <td>${p.arrivalTime}</td>
                            <td>${p.burstTime}</td>
                            <td>${p.priority}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ============================================================================
// ALGORITHM EXECUTION
// Run the selected scheduling algorithm and display results.
// ============================================================================

/**
 * Run a scheduling algorithm with the current processes.
 * @param {string} algoKey - Algorithm key (e.g., 'fcfs', 'sjf', 'rr')
 * @param {number} [quantum] - Time quantum for Round Robin
 * @returns {object|null} - Algorithm result or null if no processes
 */
function runAlgorithm(algoKey, quantum) {
    if (processes.length === 0) return null;
    
    const algos = window.SchedulingAlgorithms;
    if (!algos) {
        showToast('Scheduling algorithms not loaded!', 'error');
        return null;
    }
    
    quantum = quantum || parseInt(document.getElementById('timeQuantum').value) || 2;
    
    switch (algoKey) {
        case 'fcfs':
            return algos.fcfs(processes);
        case 'sjf':
            return algos.sjf(processes);
        case 'priority-np':
            return algos.priorityNonPreemptive(processes);
        case 'priority-p':
            return algos.priorityPreemptive(processes);
        case 'rr':
            return algos.roundRobin(processes, quantum);
        case 'srtf':
            return algos.srtf(processes);
        default:
            showToast('Unknown algorithm: ' + algoKey, 'error');
            return null;
    }
}

/**
 * Select an algorithm tab in the Scheduling section.
 * @param {string} algoKey - Algorithm key
 */
function selectAlgorithm(algoKey) {
    currentAlgorithm = algoKey;
    
    // Update tab styles
    document.querySelectorAll('#algoTabs .tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.algo === algoKey);
    });
    
    // Show/hide quantum input
    document.getElementById('quantumInput').style.display = algoKey === 'rr' ? 'flex' : 'none';
    
    // Update description
    document.getElementById('algoDescTitle').textContent = 
        `📖 ${ALGO_NAMES[algoKey]} — ${ALGO_FULL_NAMES[algoKey]}`;
    document.getElementById('algoDescription').innerHTML = 
        `<p>${ALGO_DESCRIPTIONS[algoKey]}</p>`;
    
    // Hide step-by-step until algorithm is run
    document.getElementById('stepByStepCard').style.display = 'none';
}

/**
 * Run the currently selected algorithm and show step-by-step execution.
 */
function runSelectedAlgorithm() {
    if (processes.length === 0) {
        showToast('No processes to schedule! Add processes first.', 'warning');
        return;
    }
    
    const quantum = parseInt(document.getElementById('timeQuantum').value) || 2;
    
    if (currentAlgorithm === 'rr' && quantum < 1) {
        showToast('Time quantum must be at least 1', 'error');
        return;
    }
    
    const result = runAlgorithm(currentAlgorithm, quantum);
    if (!result) return;
    
    // Show step-by-step execution
    displayStepByStep(result, currentAlgorithm, quantum);
    
    showToast(`${ALGO_NAMES[currentAlgorithm]} algorithm executed successfully!`, 'success');
}

/**
 * Display step-by-step execution of the algorithm.
 * @param {object} result - Algorithm result
 * @param {string} algoKey - Algorithm key
 * @param {number} quantum - Time quantum (for RR display)
 */
function displayStepByStep(result, algoKey, quantum) {
    const card = document.getElementById('stepByStepCard');
    const content = document.getElementById('stepByStepContent');
    
    card.style.display = 'block';
    
    let steps = [];
    let stepNum = 1;
    
    // Build step-by-step narrative from the Gantt chart
    result.ganttChart.forEach((block, idx) => {
        if (block.pid === 'Idle') {
            steps.push({
                num: stepNum++,
                text: `<strong>Time ${block.start}–${block.end}:</strong> CPU is <em>idle</em>. No process has arrived yet or is ready to execute.`
            });
        } else {
            const processInfo = result.processResults.find(p => p.pid === block.pid);
            const duration = block.end - block.start;
            
            let explanation = `<strong>Time ${block.start}–${block.end}:</strong> `;
            
            // Algorithm-specific explanation
            switch (algoKey) {
                case 'fcfs':
                    explanation += `Process <strong>${block.pid}</strong> executes for ${duration} unit(s) (arrived at t=${processInfo.arrivalTime}, first in queue by arrival order).`;
                    break;
                case 'sjf':
                    explanation += `Process <strong>${block.pid}</strong> executes for ${duration} unit(s) (burst time = ${processInfo.burstTime}, shortest among available processes).`;
                    break;
                case 'priority-np':
                    explanation += `Process <strong>${block.pid}</strong> executes for ${duration} unit(s) (priority = ${processInfo.priority}, highest priority among available processes).`;
                    break;
                case 'priority-p':
                    explanation += `Process <strong>${block.pid}</strong> executes for ${duration} unit(s) (priority = ${processInfo.priority}). `;
                    if (idx < result.ganttChart.length - 1 && result.ganttChart[idx + 1].pid !== block.pid && result.ganttChart[idx + 1].pid !== 'Idle') {
                        explanation += `Preempted when a higher-priority process becomes available.`;
                    }
                    break;
                case 'rr':
                    explanation += `Process <strong>${block.pid}</strong> executes for ${duration} unit(s) (quantum = ${quantum}). `;
                    if (duration < quantum) {
                        explanation += `Finished before quantum expired.`;
                    } else if (block.end < result.totalTime) {
                        explanation += `Quantum expired; moved to back of ready queue.`;
                    }
                    break;
                case 'srtf':
                    explanation += `Process <strong>${block.pid}</strong> executes for ${duration} unit(s) (shortest remaining time among available processes).`;
                    break;
            }
            
            steps.push({ num: stepNum++, text: explanation });
        }
    });
    
    // Add completion summary
    steps.push({
        num: stepNum++,
        text: `<strong>All processes completed</strong> at time ${result.totalTime}. Average Waiting Time = ${result.averages.avgWaitingTime.toFixed(2)}, Average Turnaround Time = ${result.averages.avgTurnaroundTime.toFixed(2)}.`
    });
    
    content.innerHTML = steps.map(s => `
        <div class="step">
            <div class="step-number">${s.num}</div>
            <div class="step-text">${s.text}</div>
        </div>
    `).join('');
}

// ============================================================================
// GANTT CHART RENDERING
// Generate the visual Gantt chart for a scheduling result.
// ============================================================================

/**
 * Update the Gantt chart display based on the selected algorithm.
 */
function updateGanttChart() {
    const algoKey = document.getElementById('ganttAlgoSelect').value;
    const ganttQuantumInput = document.getElementById('ganttQuantumInput');
    
    // Show/hide quantum input for RR
    ganttQuantumInput.style.display = algoKey === 'rr' ? 'flex' : 'none';
    
    // Update title
    document.getElementById('ganttTitle').textContent = 
        `📊 ${ALGO_NAMES[algoKey]} Gantt Chart`;
    
    if (processes.length === 0) {
        document.getElementById('emptyGanttState').style.display = 'block';
        document.getElementById('ganttChartContent').style.display = 'none';
        document.getElementById('ganttResultsCard').style.display = 'none';
        return;
    }
    
    const quantum = parseInt(document.getElementById('ganttTimeQuantum').value) || 2;
    const result = runAlgorithm(algoKey, quantum);
    if (!result) return;
    
    // Show Gantt chart
    document.getElementById('emptyGanttState').style.display = 'none';
    document.getElementById('ganttChartContent').style.display = 'block';
    
    renderGanttChart(result);
    renderResultsTable(result, 'ganttResultsTable');
    document.getElementById('ganttResultsCard').style.display = 'block';
}

/**
 * Render the Gantt chart visualization.
 * @param {object} result - Algorithm result containing ganttChart array
 */
function renderGanttChart(result) {
    const blocksContainer = document.getElementById('ganttBlocks');
    const timelineContainer = document.getElementById('ganttTimeline');
    const legendContainer = document.getElementById('ganttLegend');
    
    // Build a map of process IDs to their color indices
    const pidColorMap = {};
    processes.forEach((p, i) => {
        pidColorMap[p.pid] = i % 10;
    });
    
    // Calculate scale: each time unit gets a pixel width
    const totalTime = result.totalTime;
    const minBlockWidth = 40;
    const pixelsPerUnit = Math.max(minBlockWidth / Math.max(1, Math.min(...result.ganttChart.map(b => b.end - b.start))), 30);
    
    // Render blocks
    blocksContainer.innerHTML = result.ganttChart.map((block, idx) => {
        const duration = block.end - block.start;
        const width = duration * pixelsPerUnit;
        
        if (block.pid === 'Idle') {
            return `<div class="gantt-block idle" id="gantt-block-${idx}" data-idx="${idx}" style="width:${width}px; min-width:${width}px;" 
                        title="CPU Idle: ${block.start} → ${block.end} (${duration} units)">
                        Idle
                    </div>`;
        }
        
        const colorIdx = pidColorMap[block.pid] !== undefined ? pidColorMap[block.pid] : 0;
        return `<div class="gantt-block process-color-${colorIdx}" id="gantt-block-${idx}" data-idx="${idx}"
                    style="width:${width}px; min-width:${width}px;"
                    title="${block.pid}: ${block.start} → ${block.end} (${duration} units)">
                    ${block.pid}
                </div>`;
    }).join('');
    
    // Render timeline labels
    let timeLabels = [];
    result.ganttChart.forEach((block, idx) => {
        const duration = block.end - block.start;
        const width = duration * pixelsPerUnit;
        
        if (idx === 0) {
            timeLabels.push(`<span class="gantt-time-label" style="width:${width}px; min-width:${width}px;">${block.start}</span>`);
        } else {
            timeLabels.push(`<span class="gantt-time-label" style="width:${width}px; min-width:${width}px;">${block.start}</span>`);
        }
    });
    // Add final time
    const lastBlock = result.ganttChart[result.ganttChart.length - 1];
    timeLabels.push(`<span class="gantt-time-label" style="width:auto;">${lastBlock.end}</span>`);
    
    timelineContainer.innerHTML = timeLabels.join('');
    
    // Render legend
    const usedPids = [...new Set(result.ganttChart.filter(b => b.pid !== 'Idle').map(b => b.pid))];
    let legendHTML = usedPids.map(pid => {
        const colorIdx = pidColorMap[pid] !== undefined ? pidColorMap[pid] : 0;
        return `<div class="legend-item">
                    <div class="legend-color process-color-${colorIdx}"></div>
                    <span>${pid}</span>
                </div>`;
    }).join('');
    
    // Add idle to legend if present
    if (result.ganttChart.some(b => b.pid === 'Idle')) {
        legendHTML += `<div class="legend-item">
                        <div class="legend-color" style="background: repeating-linear-gradient(45deg, #f0f2f8, #f0f2f8 3px, #e2e6f0 3px, #e2e6f0 6px);"></div>
                        <span>Idle</span>
                    </div>`;
    }
    
    legendContainer.innerHTML = legendHTML;

    // Initialize interactive playback controls
    initGanttPlayback(result);
}

// ============================================================================
// GANTT SIMULATION PLAYBACK CONTROLS
// ============================================================================
let currentGanttResult = null;
let playbackCurrentIndex = -1;
let playbackTimer = null;
let playbackSpeed = 800;

function initGanttPlayback(result) {
    currentGanttResult = result;
    stopGanttPlayback();
    playbackCurrentIndex = -1;
    updatePlaybackDisplay();
}

function updatePlaybackSpeed() {
    const select = document.getElementById('playbackSpeedSelect');
    if (select) {
        playbackSpeed = parseInt(select.value) || 800;
        if (playbackTimer) {
            stopGanttPlayback();
            startGanttPlayback();
        }
    }
}

function toggleGanttPlayback() {
    if (playbackTimer) {
        stopGanttPlayback();
    } else {
        startGanttPlayback();
    }
}

function startGanttPlayback() {
    if (!currentGanttResult || !currentGanttResult.ganttChart || currentGanttResult.ganttChart.length === 0) return;
    
    const totalBlocks = currentGanttResult.ganttChart.length;
    if (playbackCurrentIndex >= totalBlocks - 1) {
        playbackCurrentIndex = -1;
    }
    
    const playBtn = document.getElementById('btnPlayGantt');
    if (playBtn) playBtn.innerHTML = '⏸️ Pause';
    
    stepGanttPlayback(1);
    playbackTimer = setInterval(() => {
        if (playbackCurrentIndex < totalBlocks - 1) {
            stepGanttPlayback(1);
        } else {
            stopGanttPlayback();
        }
    }, playbackSpeed);
}

function stopGanttPlayback() {
    if (playbackTimer) {
        clearInterval(playbackTimer);
        playbackTimer = null;
    }
    const playBtn = document.getElementById('btnPlayGantt');
    if (playBtn) playBtn.innerHTML = '▶️ Play';
}

function stepGanttPlayback(step) {
    if (!currentGanttResult || !currentGanttResult.ganttChart || currentGanttResult.ganttChart.length === 0) return;
    
    const totalBlocks = currentGanttResult.ganttChart.length;
    playbackCurrentIndex += step;
    
    if (playbackCurrentIndex < 0) playbackCurrentIndex = 0;
    if (playbackCurrentIndex >= totalBlocks) playbackCurrentIndex = totalBlocks - 1;
    
    updatePlaybackDisplay();
}

function resetGanttPlayback() {
    stopGanttPlayback();
    playbackCurrentIndex = -1;
    updatePlaybackDisplay();
}

function updatePlaybackDisplay() {
    if (!currentGanttResult || !currentGanttResult.ganttChart) return;
    
    const timeDisplay = document.getElementById('playbackTimeDisplay');
    const procDisplay = document.getElementById('playbackProcessDisplay');
    const totalTime = currentGanttResult.totalTime;
    const blocks = currentGanttResult.ganttChart;
    
    if (playbackCurrentIndex === -1) {
        if (timeDisplay) timeDisplay.textContent = `0 / ${totalTime}`;
        if (procDisplay) procDisplay.textContent = 'State: Showing Full Timeline';
        blocks.forEach((_, idx) => {
            const el = document.getElementById(`gantt-block-${idx}`);
            if (el) {
                el.classList.remove('anim-active', 'anim-past', 'anim-future');
            }
        });
        return;
    }
    
    const activeBlock = blocks[playbackCurrentIndex];
    if (timeDisplay) timeDisplay.textContent = `${activeBlock.end} / ${totalTime}`;
    if (procDisplay) {
        if (activeBlock.pid === 'Idle') {
            procDisplay.innerHTML = `<span style="color:var(--text-tertiary);">CPU Idle (${activeBlock.start} → ${activeBlock.end})</span>`;
        } else {
            procDisplay.innerHTML = `<span style="color:var(--primary);">Executing: ${escapeHtml(activeBlock.pid)} (Time: ${activeBlock.start} → ${activeBlock.end})</span>`;
        }
    }
    
    blocks.forEach((_, idx) => {
        const el = document.getElementById(`gantt-block-${idx}`);
        if (!el) return;
        el.classList.remove('anim-active', 'anim-past', 'anim-future');
        if (idx === playbackCurrentIndex) {
            el.classList.add('anim-active');
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else if (idx < playbackCurrentIndex) {
            el.classList.add('anim-past');
        } else {
            el.classList.add('anim-future');
        }
    });
}

// ============================================================================
// RESULTS TABLE
// Render detailed scheduling results in a table.
// ============================================================================

/**
 * Render a results table with per-process metrics and averages.
 * @param {object} result - Algorithm result
 * @param {string} containerId - ID of the container element
 */
function renderResultsTable(result, containerId) {
    const container = document.getElementById(containerId);
    
    // Build a map of process IDs to color indices
    const pidColorMap = {};
    processes.forEach((p, i) => {
        pidColorMap[p.pid] = i % 10;
    });
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Process</th>
                    <th>Arrival Time (AT)</th>
                    <th>Burst Time (BT)</th>
                    <th>Priority</th>
                    <th>Completion Time (CT)</th>
                    <th>Turnaround Time (TAT)</th>
                    <th>Waiting Time (WT)</th>
                    <th>Response Time (RT)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Sort results by PID for consistent display
    const sortedResults = [...result.processResults].sort((a, b) => {
        const numA = parseInt(a.pid.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.pid.replace(/\D/g, '')) || 0;
        return numA - numB || a.pid.localeCompare(b.pid);
    });
    
    sortedResults.forEach(p => {
        const colorIdx = pidColorMap[p.pid] !== undefined ? pidColorMap[p.pid] : 0;
        html += `
            <tr>
                <td><span class="pid-badge badge-${colorIdx}">${escapeHtml(p.pid)}</span></td>
                <td>${p.arrivalTime}</td>
                <td>${p.burstTime}</td>
                <td>${p.priority}</td>
                <td>${p.completionTime}</td>
                <td>${p.turnaroundTime}</td>
                <td>${p.waitingTime}</td>
                <td>${p.responseTime}</td>
            </tr>
        `;
    });
    
    // Average row
    html += `
            <tr class="avg-row">
                <td colspan="4"><strong>Averages</strong></td>
                <td>—</td>
                <td><strong>${result.averages.avgTurnaroundTime.toFixed(2)}</strong></td>
                <td><strong>${result.averages.avgWaitingTime.toFixed(2)}</strong></td>
                <td><strong>${result.averages.avgResponseTime.toFixed(2)}</strong></td>
            </tr>
        </tbody>
    </table>
    `;
    
    container.innerHTML = html;
}

// ============================================================================
// PERFORMANCE ANALYSIS
// Display detailed metrics for a selected algorithm.
// ============================================================================

/**
 * Update the Performance Analysis section.
 */
function updatePerformance() {
    const algoKey = document.getElementById('perfAlgoSelect').value;
    const perfQuantumInput = document.getElementById('perfQuantumInput');
    
    // Show/hide quantum input
    perfQuantumInput.style.display = algoKey === 'rr' ? 'flex' : 'none';
    
    if (processes.length === 0) {
        document.getElementById('perfStatsGrid').style.display = 'none';
        document.getElementById('perfResultsCard').style.display = 'none';
        document.getElementById('perfEmptyState').style.display = 'block';
        return;
    }
    
    const quantum = parseInt(document.getElementById('perfTimeQuantum').value) || 2;
    const result = runAlgorithm(algoKey, quantum);
    if (!result) return;
    
    // Show stats and table
    document.getElementById('perfEmptyState').style.display = 'none';
    document.getElementById('perfStatsGrid').style.display = 'grid';
    document.getElementById('perfResultsCard').style.display = 'block';
    
    // Update stat cards
    document.getElementById('perfAvgWT').textContent = result.averages.avgWaitingTime.toFixed(2);
    document.getElementById('perfAvgTAT').textContent = result.averages.avgTurnaroundTime.toFixed(2);
    document.getElementById('perfAvgRT').textContent = result.averages.avgResponseTime.toFixed(2);
    document.getElementById('perfCPUUtil').textContent = result.averages.cpuUtilization.toFixed(1) + '%';
    document.getElementById('perfThroughput').textContent = result.averages.throughput.toFixed(3);
    document.getElementById('perfTotalTime').textContent = result.totalTime;
    
    // Render results table
    renderResultsTable(result, 'perfResultsTable');
}

// ============================================================================
// ALGORITHM COMPARISON
// Compare all algorithms side by side.
// ============================================================================

/**
 * Update the Algorithm Comparison section.
 */
function updateComparison() {
    if (processes.length === 0) {
        document.getElementById('compEmptyState').style.display = 'block';
        document.getElementById('compContent').style.display = 'none';
        return;
    }
    
    document.getElementById('compEmptyState').style.display = 'none';
    document.getElementById('compContent').style.display = 'block';
    
    const quantum = parseInt(document.getElementById('compQuantum').value) || 2;
    
    // Run all algorithms
    const results = {};
    const algoKeys = ['fcfs', 'sjf', 'priority-np', 'priority-p', 'rr', 'srtf'];
    
    algoKeys.forEach(key => {
        results[key] = runAlgorithm(key, quantum);
    });
    
    // Build summary table
    renderComparisonTable(results, algoKeys);
    
    // Build bar charts for each metric
    renderComparisonBarChart('compChartWT', results, algoKeys, 'avgWaitingTime', 'lower');
    renderComparisonBarChart('compChartTAT', results, algoKeys, 'avgTurnaroundTime', 'lower');
    renderComparisonBarChart('compChartRT', results, algoKeys, 'avgResponseTime', 'lower');
    renderComparisonBarChart('compChartCPU', results, algoKeys, 'cpuUtilization', 'higher');
    renderComparisonBarChart('compChartTP', results, algoKeys, 'throughput', 'higher');
    
    // Best algorithm summary
    renderBestAlgoSummary(results, algoKeys);
}

/**
 * Render the comparison summary table.
 */
function renderComparisonTable(results, algoKeys) {
    const container = document.getElementById('compSummaryTable');
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    ${algoKeys.map(k => `<th>${ALGO_NAMES[k]}</th>`).join('')}
                    <th>Best</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    const metrics = [
        { key: 'avgWaitingTime', name: 'Avg Waiting Time', unit: '', best: 'lower', decimals: 2 },
        { key: 'avgTurnaroundTime', name: 'Avg Turnaround Time', unit: '', best: 'lower', decimals: 2 },
        { key: 'avgResponseTime', name: 'Avg Response Time', unit: '', best: 'lower', decimals: 2 },
        { key: 'cpuUtilization', name: 'CPU Utilization', unit: '%', best: 'higher', decimals: 1 },
        { key: 'throughput', name: 'Throughput', unit: ' p/u', best: 'higher', decimals: 3 }
    ];
    
    metrics.forEach(metric => {
        const values = algoKeys.map(k => results[k].averages[metric.key]);
        const bestVal = metric.best === 'lower' ? Math.min(...values) : Math.max(...values);
        const bestAlgos = algoKeys.filter((k, i) => Math.abs(values[i] - bestVal) < 0.001);
        
        html += `<tr>
            <td><strong>${metric.name}</strong></td>
            ${algoKeys.map((k, i) => {
                const isBest = Math.abs(values[i] - bestVal) < 0.001;
                return `<td${isBest ? ' style="color: var(--success); font-weight: 700;"' : ''}>${values[i].toFixed(metric.decimals)}${metric.unit}${isBest ? ' <span class="best-badge">★ Best</span>' : ''}</td>`;
            }).join('')}
            <td><strong>${bestAlgos.map(k => ALGO_NAMES[k]).join(', ')}</strong></td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

/**
 * Render a bar chart comparing a specific metric across algorithms.
 * @param {string} containerId - Container element ID
 * @param {object} results - All algorithm results
 * @param {string[]} algoKeys - Algorithm keys
 * @param {string} metricKey - Key in the averages object
 * @param {string} bestDirection - 'lower' or 'higher'
 */
function renderComparisonBarChart(containerId, results, algoKeys, metricKey, bestDirection) {
    const container = document.getElementById(containerId);
    
    const values = algoKeys.map(k => results[k].averages[metricKey]);
    const maxVal = Math.max(...values);
    const bestVal = bestDirection === 'lower' ? Math.min(...values) : Math.max(...values);
    
    const barColors = ['#4361ee', '#f72585', '#7209b7', '#8338ec', '#f77f00', '#06d6a0'];
    
    container.innerHTML = algoKeys.map((key, i) => {
        const value = values[i];
        const percentage = maxVal > 0 ? (value / maxVal) * 100 : 0;
        const isBest = Math.abs(value - bestVal) < 0.001;
        const decimals = metricKey === 'throughput' ? 3 : metricKey === 'cpuUtilization' ? 1 : 2;
        
        return `
            <div class="bar-row">
                <div class="bar-label">${ALGO_NAMES[key]}</div>
                <div class="bar-track">
                    <div class="bar-fill ${isBest ? 'best' : ''}" 
                         style="width: ${Math.max(percentage, 5)}%; background: ${barColors[i]};">
                    </div>
                </div>
                <div class="bar-value">${value.toFixed(decimals)}${isBest ? ' ★' : ''}</div>
            </div>
        `;
    }).join('');
}

/**
 * Render the "Best Algorithm per Metric" summary.
 */
function renderBestAlgoSummary(results, algoKeys) {
    const container = document.getElementById('bestAlgoSummary');
    
    const metrics = [
        { key: 'avgWaitingTime', name: 'Lowest Avg Waiting Time', icon: '⏳', best: 'lower' },
        { key: 'avgTurnaroundTime', name: 'Lowest Avg Turnaround Time', icon: '🔄', best: 'lower' },
        { key: 'avgResponseTime', name: 'Lowest Avg Response Time', icon: '⚡', best: 'lower' },
        { key: 'cpuUtilization', name: 'Highest CPU Utilization', icon: '💻', best: 'higher' },
        { key: 'throughput', name: 'Highest Throughput', icon: '📊', best: 'higher' }
    ];
    
    container.innerHTML = `
        <div class="algo-props">
            ${metrics.map(metric => {
                const values = algoKeys.map(k => results[k].averages[metric.key]);
                const bestVal = metric.best === 'lower' ? Math.min(...values) : Math.max(...values);
                const bestAlgos = algoKeys.filter((k, i) => Math.abs(values[i] - bestVal) < 0.001);
                const decimals = metric.key === 'throughput' ? 3 : metric.key === 'cpuUtilization' ? 1 : 2;
                
                return `<div class="algo-prop">
                    <span class="prop-icon">${metric.icon}</span>
                    <strong>${metric.name}:</strong> ${bestAlgos.map(k => ALGO_NAMES[k]).join(', ')} (${bestVal.toFixed(decimals)})
                </div>`;
            }).join('')}
        </div>
    `;
}

// ============================================================================
// DASHBOARD
// Update the dashboard overview with current state.
// ============================================================================

/**
 * Update all dashboard widgets.
 */
function updateDashboard() {
    // Update process count
    document.getElementById('statTotalProcesses').textContent = processes.length;
    
    // Update total burst time
    const totalBurst = processes.reduce((sum, p) => sum + p.burstTime, 0);
    document.getElementById('statTotalBurst').textContent = totalBurst;
    
    // Render dashboard process table
    renderDashboardProcessTable();
    
    // If we have processes, compute and show best algorithm stats
    if (processes.length > 0) {
        const quantum = 2;
        const algoKeys = ['fcfs', 'sjf', 'priority-np', 'priority-p', 'rr', 'srtf'];
        
        let bestAlgo = '';
        let bestWT = Infinity;
        let bestResult = null;
        
        algoKeys.forEach(key => {
            const result = runAlgorithm(key, quantum);
            if (result && result.averages.avgWaitingTime < bestWT) {
                bestWT = result.averages.avgWaitingTime;
                bestAlgo = key;
                bestResult = result;
            }
        });
        
        if (bestResult) {
            document.getElementById('statBestAlgo').textContent = ALGO_NAMES[bestAlgo];
            document.getElementById('statBestAlgoMetric').textContent = `Lowest Avg WT: ${bestWT.toFixed(2)}`;
            document.getElementById('statAvgWT').textContent = bestWT.toFixed(2);
            document.getElementById('statAvgWTAlgo').textContent = `(${ALGO_NAMES[bestAlgo]})`;
            document.getElementById('statCPUUtil').textContent = bestResult.averages.cpuUtilization.toFixed(1) + '%';
            document.getElementById('statThroughput').textContent = bestResult.averages.throughput.toFixed(3);
        }
        
        // Hide quick start, it's no longer needed
        document.getElementById('dashboardQuickStart').style.display = 'none';
    } else {
        document.getElementById('statBestAlgo').textContent = '—';
        document.getElementById('statBestAlgoMetric').textContent = '';
        document.getElementById('statAvgWT').textContent = '—';
        document.getElementById('statAvgWTAlgo').textContent = '';
        document.getElementById('statCPUUtil').textContent = '—';
        document.getElementById('statThroughput').textContent = '—';
        document.getElementById('dashboardQuickStart').style.display = 'block';
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} text - Raw text
 * @returns {string} - HTML-safe text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// INITIALIZATION
// Set up the application on page load.
// ============================================================================

/**
 * Initialize the application.
 * Called when the DOM is fully loaded.
 */
function initApp() {
    // Initialize theme
    initTheme();
    
    // Suggest first PID
    suggestNextPID();
    
    // Update dashboard
    updateDashboard();
    
    // Select default algorithm
    selectAlgorithm('fcfs');
    
    // Log ready message
    console.log('CPU Scheduling Visualizer & Performance Analyzer loaded successfully.');
    console.log('Algorithms available:', Object.keys(window.SchedulingAlgorithms || {}));
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
