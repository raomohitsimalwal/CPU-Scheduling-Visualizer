"""
PowerPoint Generator for CPU Scheduling Visualizer & Performance Analyzer
Generates a 16-slide, 16:9 widescreen presentation with dark-mode styling,
custom cards, tables, accent badges, and built-in speaker notes.
"""

import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Initialize Presentation
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# Theme Colors
COLOR_BG = RGBColor(11, 15, 25)          # Deep Slate #0B0F19
COLOR_CARD_BG = RGBColor(23, 29, 48)     # Card Navy #171D30
COLOR_CARD_BORDER = RGBColor(45, 55, 85) # Border Slate #2D3755
COLOR_TEXT_PRIMARY = RGBColor(248, 250, 252) # White #F8FAFC
COLOR_TEXT_MUTED = RGBColor(160, 170, 195)   # Muted Blue-Grey #A0AAC3
COLOR_TEXT_DIM = RGBColor(110, 120, 150)     # Dim Grey #6E7896

COLOR_PRIMARY = RGBColor(67, 97, 238)     # Indigo Blue #4361EE
COLOR_CYAN = RGBColor(56, 189, 248)       # Sky Cyan #38BDF8
COLOR_GREEN = RGBColor(52, 211, 153)      # Emerald #34D399
COLOR_ORANGE = RGBColor(245, 158, 11)     # Amber #F59E0B
COLOR_PINK = RGBColor(244, 63, 94)        # Rose #F43F5E
COLOR_PURPLE = RGBColor(168, 85, 247)     # Purple #A855F7

def set_slide_background(slide):
    """Fills slide background with dark slate color."""
    bg_shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5)
    )
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = COLOR_BG
    bg_shape.line.fill.background() # No line
    # Send to back if needed

def add_header(slide, tag_text, title_text, subtitle_text):
    """Creates a consistent slide header with category tag, title, and subtitle."""
    # Category Tag
    tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.35))
    tf_tag = tag_box.text_frame
    tf_tag.word_wrap = True
    tf_tag.margin_left = tf_tag.margin_top = tf_tag.margin_right = tf_tag.margin_bottom = 0
    p_tag = tf_tag.paragraphs[0]
    p_tag.text = tag_text.upper()
    p_tag.font.size = Pt(10)
    p_tag.font.bold = True
    p_tag.font.color.rgb = COLOR_CYAN
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.65))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(22)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_TEXT_PRIMARY
    
    # Subtitle
    if subtitle_text:
        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.5), Inches(0.4))
        tf_sub = sub_box.text_frame
        tf_sub.word_wrap = True
        tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = subtitle_text
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = COLOR_TEXT_MUTED

def add_card(slide, left, top, width, height, bg_color=COLOR_CARD_BG, border_color=COLOR_CARD_BORDER):
    """Draws a card rectangle container."""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1)
    return card

def add_speaker_notes(slide, notes_text):
    """Adds speaker notes visible in Presenter View."""
    notes_slide = slide.notes_slide
    text_frame = notes_slide.notes_text_frame
    text_frame.text = notes_text

# ==============================================================================
# SLIDE 1: Title Slide
# ==============================================================================
slide1 = prs.slides.add_slide(blank_layout)
set_slide_background(slide1)

# Header Tag Badge
tag1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.6), Inches(4.5), Inches(0.4))
tag1.fill.solid()
tag1.fill.fore_color.rgb = RGBColor(20, 35, 60)
tag1.line.color.rgb = COLOR_CYAN
tag1.line.width = Pt(1)
tag1.text_frame.text = "OPERATING SYSTEMS CAPSTONE PROJECT  |  GROUP G1/G2"
p = tag1.text_frame.paragraphs[0]
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN
p.alignment = PP_ALIGN.CENTER

# Big Title
t_box = slide1.shapes.add_textbox(Inches(0.8), Inches(1.2), Inches(11.7), Inches(1.5))
tf = t_box.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.text = "CPU Scheduling Visualizer &\nPerformance Analyzer"
p.font.size = Pt(36)
p.font.bold = True
p.font.color.rgb = COLOR_TEXT_PRIMARY

# Lead Description
d_box = slide1.shapes.add_textbox(Inches(0.8), Inches(2.75), Inches(11.7), Inches(0.7))
tf = d_box.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.text = "An interactive simulation, evaluation, and comparative benchmarking platform modeling CPU scheduling algorithms in multi-programmed operating systems."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_TEXT_MUTED

# 3 Team Member Cards
members_data = [
    {
        "name": "Mohit Yadav",
        "roll": "Roll No: 2401730063",
        "role": "STUDENT 1: OS / CORE IMPLEMENTATION",
        "accent": COLOR_PRIMARY,
        "desc": "Engineered core scheduling algorithms (FCFS, SJF, Priority NP/P, RR, SRTF), discrete-event simulation engine, queue tie-breaking & arrival sync."
    },
    {
        "name": "Devansh Saini",
        "roll": "Roll No: 2401730102",
        "role": "STUDENT 2: INTERFACE & VISUALIZATION",
        "accent": COLOR_PINK,
        "desc": "Designed responsive dashboard UI, proportional Gantt chart rendering with idle gap indicators, interactive playback controller & comparison bar charts."
    },
    {
        "name": "Deepak",
        "roll": "Roll No: 2401730152",
        "role": "STUDENT 3: TESTING & PERFORMANCE",
        "accent": COLOR_GREEN,
        "desc": "Developed automated verification suite with 178 unit and boundary test cases (100% pass rate), invariant validation & academic documentation."
    }
]

for idx, m in enumerate(members_data):
    x = Inches(0.8 + idx * 3.95)
    y = Inches(3.7)
    w = Inches(3.75)
    h = Inches(3.2)
    add_card(slide1, x, y, w, h)
    
    # Avatar icon
    avatar = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x + Inches(0.25), y + Inches(0.25), Inches(0.7), Inches(0.7))
    avatar.fill.solid()
    avatar.fill.fore_color.rgb = m["accent"]
    avatar.line.fill.background()
    avatar.text_frame.text = m["name"][0] + (m["name"].split()[1][0] if len(m["name"].split()) > 1 else "")
    avatar.text_frame.paragraphs[0].font.size = Pt(16)
    avatar.text_frame.paragraphs[0].font.bold = True
    avatar.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    
    # Text info
    info_box = slide1.shapes.add_textbox(x + Inches(1.1), y + Inches(0.2), Inches(2.4), Inches(0.8))
    tf_info = info_box.text_frame
    tf_info.word_wrap = True
    p1 = tf_info.paragraphs[0]
    p1.text = m["name"]
    p1.font.size = Pt(15)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TEXT_PRIMARY
    
    p2 = tf_info.add_paragraph()
    p2.text = m["roll"]
    p2.font.size = Pt(10)
    p2.font.color.rgb = COLOR_CYAN
    
    # Role Tag
    role_box = slide1.shapes.add_textbox(x + Inches(0.25), y + Inches(1.05), Inches(3.25), Inches(0.35))
    p_role = role_box.text_frame.paragraphs[0]
    p_role.text = m["role"]
    p_role.font.size = Pt(9.5)
    p_role.font.bold = True
    p_role.font.color.rgb = COLOR_ORANGE
    
    # Description
    desc_box = slide1.shapes.add_textbox(x + Inches(0.25), y + Inches(1.4), Inches(3.25), Inches(1.6))
    tf_desc = desc_box.text_frame
    tf_desc.word_wrap = True
    p_desc = tf_desc.paragraphs[0]
    p_desc.text = m["desc"]
    p_desc.font.size = Pt(10)
    p_desc.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide1, 
    "SPEAKER: Mohit Yadav (Roll No: 2401730063)\n"
    "Respected Professor and External Examiner, Good morning. Today, our team is presenting our Operating Systems Capstone Project titled 'CPU Scheduling Visualizer & Performance Analyzer'. "
    "I am Mohit Yadav, and with me are my fellow group members Devansh Saini (Roll No: 2401730102) and Deepak (Roll No: 2401730152). "
    "We have structured our implementation across three mandatory domains: OS/Core Implementation, Interface & Visualization, and Testing & Performance Analysis."
)

# ==============================================================================
# SLIDE 2: Executive Summary & Project Abstract
# ==============================================================================
slide2 = prs.slides.add_slide(blank_layout)
set_slide_background(slide2)
add_header(slide2, "Executive Summary", "Project Abstract & Background", "Addressing the core challenge of multi-programming and CPU scheduling in Operating Systems.")

# Left Card: Abstract
add_card(slide2, Inches(0.8), Inches(1.9), Inches(5.7), Inches(5.0))
ab_box = slide2.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf_ab = ab_box.text_frame
tf_ab.word_wrap = True

p = tf_ab.paragraphs[0]
p.text = "📄 Project Abstract"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN

p = tf_ab.add_paragraph()
p.text = "\nIn multi-programmed and time-sharing systems, the CPU scheduler is the foundational subsystem allocating processor execution time among competing ready tasks."
p.font.size = Pt(11)
p.font.color.rgb = COLOR_TEXT_MUTED

p = tf_ab.add_paragraph()
p.text = "\nThis project delivers a complete, academically rigorous, and fully interactive platform built from the ground up using pure modern web standards (HTML5, CSS3, ES6 JavaScript) without third-party frameworks."
p.font.size = Pt(11)
p.font.color.rgb = COLOR_TEXT_MUTED

p = tf_ab.add_paragraph()
p.text = "\nIt models 6 scheduling policies, generates continuous Gantt charts with explicit idle intervals, evaluates completion, turnaround, waiting, and response times, and benchmarks all algorithms side-by-side with 178 automated test cases."
p.font.size = Pt(11)
p.font.color.rgb = COLOR_TEXT_MUTED

# Right Card: Highlights Grid
add_card(slide2, Inches(6.8), Inches(1.9), Inches(5.7), Inches(5.0))
hl_box = slide2.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf_hl = hl_box.text_frame
tf_hl.word_wrap = True

p = tf_hl.paragraphs[0]
p.text = "⚡ Key System Highlights"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = COLOR_GREEN

highlights = [
    ("6 Full Algorithms", "FCFS, SJF-NP, Priority-NP, Priority-P, Round Robin, and SRTF."),
    ("Dynamic Scaled Gantt Chart", "Proportional block widths, distinct color mapping, and explicit idle gap visualization."),
    ("Live Playback Controller", "Play, pause, step forward/backward, and speed regulation to observe preemption in real time."),
    ("Automated Testing Suite", "178 unit tests verifying all edge cases, tie-breaking, and boundary invariants."),
    ("Zero Dependencies", "Runs directly in any web browser without Node.js, compilation, or internet connection.")
]

for title, desc in highlights:
    p = tf_hl.add_paragraph()
    p.text = f"\n• {title}: "
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    
    p2 = tf_hl.add_paragraph()
    p2.text = f"   {desc}"
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide2,
    "SPEAKER: Mohit Yadav\n"
    "In multi-programming systems, multiple processes reside in the ready queue competing for the CPU. "
    "Our project bridges theoretical formulations and concrete execution behavior by modeling the scheduling engine with 100% mathematical fidelity. "
    "Key highlights include 6 algorithms, scaled Gantt charts with playback, comprehensive metrics, and zero runtime dependencies."
)

# ==============================================================================
# SLIDE 3: Problem Statement & Academic Motivation
# ==============================================================================
slide3 = prs.slides.add_slide(blank_layout)
set_slide_background(slide3)
add_header(slide3, "Problem Statement", "Why Static Learning Fails & The Visual Need", "The pedagogical challenges in teaching and visualizing process scheduling.")

# Left Card: The Problem
add_card(slide3, Inches(0.8), Inches(1.9), Inches(5.7), Inches(5.0))
pr_box = slide3.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf_pr = pr_box.text_frame
tf_pr.word_wrap = True

p = tf_pr.paragraphs[0]
p.text = "⚠️ The Academic Limitations"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = COLOR_PINK

limitations = [
    ("Static Textbook Diagrams", "Traditional textbooks depict fixed Gantt charts that cannot illustrate dynamic process arrivals or interactive preemption."),
    ("Dynamic Preemption Confusion", "Students struggle to grasp how an incoming process preempts an active process in SRTF or Preemptive Priority."),
    ("Round Robin Arrival Race Conditions", "Textbooks rarely clarify queue re-ordering when time quantum expiration coincides with new task arrivals."),
    ("Impact of CPU Idle Time", "Sparse process arrivals introduce idle gaps that distort timeline continuity and CPU utilization.")
]

for title, desc in limitations:
    p = tf_pr.add_paragraph()
    p.text = f"\n• {title}:"
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf_pr.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

# Right Card: The Engineering Solution
add_card(slide3, Inches(6.8), Inches(1.9), Inches(5.7), Inches(5.0))
sol_box = slide3.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf_sol = sol_box.text_frame
tf_sol.word_wrap = True

p = tf_sol.paragraphs[0]
p.text = "🎯 Our Engineering Solution"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = COLOR_GREEN

solutions = [
    ("Interactive Custom Workloads", "Users can add, edit, delete, or load preset workloads with varied arrivals, bursts, and priorities."),
    ("Step-by-Step Execution Trace", "Chronological narrative explaining every dispatch, preemption, and queue state transition."),
    ("Side-by-Side Comparison", "Instant benchmarking showing why one algorithm cannot be universally optimal across all metrics."),
    ("Deterministic Tie-Breaking", "Standardized rules resolving burst, priority, and arrival ties predictably.")
]

for title, desc in solutions:
    p = tf_sol.add_paragraph()
    p.text = f"\n• {title}:"
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf_sol.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide3,
    "SPEAKER: Mohit Yadav\n"
    "In traditional classrooms, students only see static diagrams. When an examiner asks: 'What happens if a process arrives at the exact moment another quantum finishes?' "
    "or 'How does SRTF preemption actually behave?', students struggle. Our visualizer solves this by turning theoretical algorithms into an interactive, real-time lab."
)

# ==============================================================================
# SLIDE 4: 3-Member Role Architecture
# ==============================================================================
slide4 = prs.slides.add_slide(blank_layout)
set_slide_background(slide4)
add_header(slide4, "Team Architecture", "Structured 3-Member Responsibilities", "Strict division of labor adhering to university capstone guidelines.")

# 3 Big Columns
roles = [
    {
        "name": "Mohit Yadav",
        "roll": "2401730063",
        "role_title": "Student 1: OS / Core Implementation",
        "color": COLOR_PRIMARY,
        "items": [
            "Implemented 6 scheduling algorithms in pure vanilla ES6 JavaScript.",
            "Engineered discrete-event simulation engine with state queues.",
            "Formulated deterministic tie-breaking logic (Priority → AT → PID).",
            "Designed Round Robin ready-queue synchronization handling arrival ties.",
            "Guaranteed algorithmic immutability (deep-cloning inputs to prevent state mutation)."
        ]
    },
    {
        "name": "Devansh Saini",
        "roll": "2401730102",
        "role_title": "Student 2: Interface & Visualization",
        "color": COLOR_PINK,
        "items": [
            "Designed responsive dashboard with CSS custom properties & Dark/Light mode.",
            "Engineered proportional Gantt chart with hatched idle gap indicators.",
            "Implemented interactive Simulation Playback Controller (Play, Pause, Step).",
            "Built dynamic algorithm comparison engine with animated bar graphs.",
            "Integrated real-time form validation with field-level error messages."
        ]
    },
    {
        "name": "Deepak",
        "roll": "2401730152",
        "role_title": "Student 3: Testing & Performance",
        "color": COLOR_GREEN,
        "items": [
            "Constructed automated verification suite with 178 unit assertion tests.",
            "Verified fundamental invariants: RT ≤ WT, WT = TAT - BT, Total = Sum(BT) + Idle.",
            "Conducted empirical performance comparisons across 5 sample workloads.",
            "Prepared formal academic capstone project report & viva guide.",
            "Built browser graphical test runner and headless Node.js CLI runner."
        ]
    }
]

for idx, r in enumerate(roles):
    x = Inches(0.8 + idx * 3.95)
    y = Inches(1.9)
    w = Inches(3.75)
    h = Inches(5.0)
    add_card(slide4, x, y, w, h)
    
    # Title Header inside card
    th_box = slide4.shapes.add_textbox(x + Inches(0.2), y + Inches(0.2), Inches(3.35), Inches(1.1))
    tf = th_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = r["name"]
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    
    p2 = tf.add_paragraph()
    p2.text = f"Roll No: {r['roll']}"
    p2.font.size = Pt(10)
    p2.font.color.rgb = COLOR_CYAN
    
    p3 = tf.add_paragraph()
    p3.text = r["role_title"].upper()
    p3.font.size = Pt(9.5)
    p3.font.bold = True
    p3.font.color.rgb = r["color"]
    
    # List items
    list_box = slide4.shapes.add_textbox(x + Inches(0.2), y + Inches(1.35), Inches(3.35), Inches(3.4))
    tf_list = list_box.text_frame
    tf_list.word_wrap = True
    for item in r["items"]:
        p = tf_list.add_paragraph()
        p.text = f"▹ {item}"
        p.font.size = Pt(10)
        p.font.color.rgb = COLOR_TEXT_MUTED
        p.space_after = Pt(6)

add_speaker_notes(slide4,
    "SPEAKER: Devansh Saini (Roll No: 2401730102)\n"
    "To ensure high academic rigor and individual accountability, our project strictly implements the 3-member role distribution mandated in the manual: "
    "Mohit Yadav took complete charge of OS/Core algorithms and discrete-event queue mechanics; "
    "I took charge of the Interface, dynamic Gantt chart rendering, playback controls, and comparison graphs; "
    "and Deepak spearheaded Testing, Performance analysis, invariant verification, and documentation."
)

# ==============================================================================
# SLIDE 5: System Architecture & Decoupled Pipeline
# ==============================================================================
slide5 = prs.slides.add_slide(blank_layout)
set_slide_background(slide5)
add_header(slide5, "System Architecture", "Decoupled Unidirectional Architecture", "Pure functional scheduling engine separated from presentation and verification.")

# Left Card: Architecture Flow
add_card(slide5, Inches(0.8), Inches(1.9), Inches(6.0), Inches(5.0))
flow_box = slide5.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.4), Inches(4.5))
tf = flow_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "🏛️ Multi-Tier Architecture Pipeline"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN

pipeline_steps = [
    ("Tier 1: Presentation Layer", "HTML5 Dashboard, CSS Grid/Flexbox, Dark/Light Theme Custom Properties, Modal dialogs, and SVG icons."),
    ("Tier 2: Application Controller (app.js)", "Manages reactive state, form validation, dynamic Gantt DOM construction, animated bar charts, and simulation playback."),
    ("Tier 3: Core Algorithmic Engine (scheduling-algorithms.js)", "Pure functional discrete-event simulator. Receives immutable process arrays; returns Gantt timeline & performance metrics."),
    ("Tier 4: Verification Harness (test-algorithms.js / test-node.js)", "Executes 178 assertion tests against manual ground-truth solutions both in the browser and headless in CLI.")
]

for title, desc in pipeline_steps:
    p = tf.add_paragraph()
    p.text = f"\n{title}"
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"{desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

# Right Card: Algorithmic Purity
add_card(slide5, Inches(7.1), Inches(1.9), Inches(5.4), Inches(5.0))
pur_box = slide5.shapes.add_textbox(Inches(7.4), Inches(2.1), Inches(4.8), Inches(4.5))
tf = pur_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "⚙️ Core Engine Characteristics"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_GREEN

pts = [
    ("Zero DOM Coupling", "The scheduling algorithms have zero knowledge of HTML or DOM elements. They can be imported into Node.js, Jest, or web workers effortlessly."),
    ("State Immutability", "Input process arrays are deep-cloned before scheduling. User data is never corrupted or altered during simulation."),
    ("Discrete-Event Time Jumping", "Rather than stepping 1 unit at a time, the simulation jumps directly to significant arrival or preemption events, maintaining optimal O(n log n) efficiency."),
    ("Standard Mathematical Contract", "Every algorithm returns a standardized contract: { ganttChart, processResults, averages, totalTime, idleTime }.")
]

for title, desc in pts:
    p = tf.add_paragraph()
    p.text = f"\n• {title}:"
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide5,
    "SPEAKER: Mohit Yadav\n"
    "Our architecture adheres to the software engineering principle of separation of concerns. "
    "The core algorithms in 'scheduling-algorithms.js' are 100% pure functions. They do not touch the DOM. "
    "This allows the same algorithms to power our visual web interface and execute in automated command-line CI test runners like Node.js."
)

# ==============================================================================
# SLIDE 6: Core Scheduling Algorithms
# ==============================================================================
slide6 = prs.slides.add_slide(blank_layout)
set_slide_background(slide6)
add_header(slide6, "Algorithm Deep Dive", "6 Core CPU Scheduling Algorithms", "Mathematical models, selection criteria, and architectural trade-offs.")

# 6 Small Cards in 2x3 Grid
algos = [
    {
        "name": "1. FCFS (First Come First Serve)",
        "type": "NON-PREEMPTIVE",
        "crit": "Selection: Minimum Arrival Time min(AT)",
        "color": COLOR_PRIMARY,
        "desc": "Executes in arrival order. Vulnerable to Convoy Effect where long compute-bound jobs block short interactive tasks."
    },
    {
        "name": "2. SJF (Shortest Job First)",
        "type": "NON-PREEMPTIVE",
        "crit": "Selection: Minimum Burst Time min(BT)",
        "color": COLOR_PINK,
        "desc": "Selects ready job with shortest burst. Mathematically optimal for non-preemptive average waiting time. Long jobs may starve."
    },
    {
        "name": "3. Priority (Non-Preemptive)",
        "type": "NON-PREEMPTIVE",
        "crit": "Selection: Minimum Priority Integer (1 > 4)",
        "color": COLOR_PURPLE,
        "desc": "Dispatches highest priority task. Once started, runs to completion. Equal priority resolved by arrival time, then PID."
    },
    {
        "name": "4. Priority (Preemptive)",
        "type": "PREEMPTIVE",
        "crit": "Selection: Highest Priority at every instant",
        "color": COLOR_ORANGE,
        "desc": "Running process is immediately interrupted if a task with higher priority arrives. Remaining burst time tracked dynamically."
    },
    {
        "name": "5. Round Robin (RR)",
        "type": "PREEMPTIVE (TIME-SLICED)",
        "crit": "Selection: FIFO Queue + Time Quantum (q)",
        "color": COLOR_CYAN,
        "desc": "Fair time-slicing. Guarantees starvation freedom and low response time. Newly arrived tasks enqueued before preempted task."
    },
    {
        "name": "6. SRTF (Preemptive SJF)",
        "type": "PREEMPTIVE",
        "crit": "Selection: Shortest Remaining Time",
        "color": COLOR_GREEN,
        "desc": "Preempts active process if a newly arrived task has a shorter remaining burst. Theoretical minimum average waiting time overall."
    }
]

for idx, a in enumerate(algos):
    col = idx % 3
    row = idx // 3
    x = Inches(0.8 + col * 3.95)
    y = Inches(1.9 + row * 2.55)
    w = Inches(3.75)
    h = Inches(2.35)
    add_card(slide6, x, y, w, h)
    
    tb = slide6.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), Inches(3.35), Inches(2.05))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p1 = tf.paragraphs[0]
    p1.text = a["name"]
    p1.font.size = Pt(12.5)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TEXT_PRIMARY
    
    p2 = tf.add_paragraph()
    p2.text = f"{a['type']}  |  {a['crit']}"
    p2.font.size = Pt(8.5)
    p2.font.bold = True
    p2.font.color.rgb = a["color"]
    p2.space_after = Pt(4)
    
    p3 = tf.add_paragraph()
    p3.text = a["desc"]
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide6,
    "SPEAKER: Mohit Yadav\n"
    "We implemented all six core algorithms. Notice our priority convention: lower numerical value equals higher priority (1 is higher than 4), matching UNIX nice values and Silberschatz. "
    "In Round Robin, we accurately synchronize quantum expirations and new arrivals. In SRTF, we continuously track remaining burst times to achieve the theoretical minimum waiting time."
)

# ==============================================================================
# SLIDE 7: Mathematical Formulations & Metric Invariants
# ==============================================================================
slide7 = prs.slides.add_slide(blank_layout)
set_slide_background(slide7)
add_header(slide7, "Mathematical Rigor", "Performance Metrics & Formal Invariants", "Standard operating systems formulas and verified conservation axioms.")

# Left Card: The Formulas
add_card(slide7, Inches(0.8), Inches(1.9), Inches(5.7), Inches(5.0))
f_box = slide7.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = f_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "📐 Mathematical Formulations"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN

formulas = [
    ("Completion Time (CT)", "Timestamp at which process finishes execution."),
    ("Turnaround Time (TAT)", "TAT = CT - AT  (Total time in system)"),
    ("Waiting Time (WT)", "WT = TAT - BT  (Time spent waiting in ready queue)"),
    ("Response Time (RT)", "RT = First CPU Start - AT  (Latency to first execution)"),
    ("CPU Utilization (U)", "U = ((Total Time - Idle Time) / Total Time) × 100%"),
    ("Throughput (Th)", "Th = Completed Processes / Total Simulation Time")
]

for name, eq in formulas:
    p = tf.add_paragraph()
    p.text = f"\n• {name}:"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"   {eq}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_GREEN

# Right Card: The Invariants
add_card(slide7, Inches(6.8), Inches(1.9), Inches(5.7), Inches(5.0))
inv_box = slide7.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = inv_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "🛡️ Verified Mathematical Invariants"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = COLOR_ORANGE

invariants = [
    ("Invariant 1: Non-Preemptive Equality", "In FCFS, SJF, and Priority-NP, once a task gets CPU, it runs to completion with zero further queue delays. Therefore: RT = WT strictly."),
    ("Invariant 2: Preemptive Inequality", "In Round Robin, SRTF, and Priority-P, tasks can be preempted after their initial execution. Therefore: RT ≤ WT always. Response Time can never exceed Waiting Time."),
    ("Invariant 3: Conservation of CPU Time", "The total simulation duration must strictly equal the sum of all process burst times plus total idle time: Total Time = Sum(BT) + Idle Time."),
    ("Invariant 4: Non-Negativity", "Under all valid arrival and burst times, CT ≥ AT, TAT ≥ BT, WT ≥ 0, and RT ≥ 0.")
]

for title, desc in invariants:
    p = tf.add_paragraph()
    p.text = f"\n• {title}:"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide7,
    "SPEAKER: Deepak (Roll No: 2401730152)\n"
    "Turning to performance metrics, every formula matches standard OS literature. "
    "More importantly, our test suite verifies mathematical invariants: "
    "For example, an examiner might ask: 'Can Response Time ever exceed Waiting Time?' The answer is strictly NO (RT <= WT). "
    "In non-preemptive algorithms, RT equals WT. In preemptive algorithms, RT is less than or equal to WT. Our simulator enforces this axiom."
)

# ==============================================================================
# SLIDE 8: Dynamic Gantt Chart Visualization Engine
# ==============================================================================
slide8 = prs.slides.add_slide(blank_layout)
set_slide_background(slide8)
add_header(slide8, "Visualization Engineering", "Dynamic Gantt Chart & Playback Engine", "Precision timeline rendering with interactive simulation stepping.")

# Left Card: Gantt Features
add_card(slide8, Inches(0.8), Inches(1.9), Inches(5.7), Inches(5.0))
g_box = slide8.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = g_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "📈 Scaled Gantt Chart Architecture"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN

g_features = [
    ("Proportional Pixel Scaling", "Block widths scale directly with execution duration (pixels_per_unit = max(40 / min_slice, 30)), eliminating visual distortion."),
    ("Consolidated Consecutive Execution", "Consecutive time slices of the same process are merged into single unified blocks, keeping the timeline clean."),
    ("Hatched CPU Idle Gaps", "CPU idle periods are visually differentiated with diagonal hatched textures and explicit start/end timestamps."),
    ("Persistent Color Identity", "Each Process ID (P1, P2...) retains a fixed distinct color across all algorithm tabs and comparison charts.")
]

for title, desc in g_features:
    p = tf.add_paragraph()
    p.text = f"\n• {title}:"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

# Right Card: Playback Controller
add_card(slide8, Inches(6.8), Inches(1.9), Inches(5.7), Inches(5.0))
pb_box = slide8.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = pb_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "🎮 Interactive Simulation Playback Controller"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_GREEN

pb_features = [
    ("▶️ Live Playback Mode", "Watch CPU execution unfold unit-by-unit with an automated ticking timer and live status badge."),
    ("⏭️ Step Forward & Backward", "Step through execution block-by-block. Perfect for demonstrating preemption moments to an examiner."),
    ("✨ Dynamic Visual Cues", "Active running block pulses with a golden glow; past blocks stay highlighted; future blocks remain dimmed."),
    ("⏱️ Speed Regulation", "Adjust playback speed between 0.5x Slow (1500ms), 1.0x Normal (800ms), and 2.0x Fast (400ms).")
]

for title, desc in pb_features:
    p = tf.add_paragraph()
    p.text = f"\n{title}"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide8,
    "SPEAKER: Devansh Saini\n"
    "For the visual interface, we built two standout capabilities: "
    "First, our Gantt chart proportionally scales blocks so that time corresponds to physical width, and idle periods are clearly marked. "
    "Second, we built an interactive Simulation Playback Controller with Play, Pause, and Step buttons. "
    "During our live demo, we can step through the timeline block-by-block to show the exact moment a process is preempted."
)

# ==============================================================================
# SLIDE 9: Multi-Algorithm Benchmark Comparison
# ==============================================================================
slide9 = prs.slides.add_slide(blank_layout)
set_slide_background(slide9)
add_header(slide9, "Empirical Benchmarking", "Multi-Algorithm Performance Comparison", "Standard college lab benchmark: P1(0, 6, P2), P2(1, 8, P1), P3(2, 7, P4), P4(3, 3, P3).")

# Table Card
add_card(slide9, Inches(0.8), Inches(1.8), Inches(11.73), Inches(3.6))

# Add Table
table_shape = slide9.shapes.add_table(7, 6, Inches(1.0), Inches(2.0), Inches(11.33), Inches(3.2))
tbl = table_shape.table

# Set Column Widths
tbl.columns[0].width = Inches(2.73)
tbl.columns[1].width = Inches(1.7)
tbl.columns[2].width = Inches(1.7)
tbl.columns[3].width = Inches(1.8)
tbl.columns[4].width = Inches(1.7)
tbl.columns[5].width = Inches(1.7)

headers = ["Algorithm", "Avg Waiting Time", "Avg Turnaround", "Avg Response", "CPU Utilization", "Throughput"]
table_data = [
    ["FCFS", "8.75", "14.75", "8.75", "100.0%", "0.167"],
    ["SJF (Non-Preemptive)", "5.75", "11.75", "5.75", "100.0%", "0.167"],
    ["Priority (Non-Preemptive)", "6.50", "12.50", "6.50", "100.0%", "0.167"],
    ["Priority (Preemptive)", "7.75", "13.75", "2.50", "100.0%", "0.167"],
    ["Round Robin (q = 3)", "10.75", "16.75", "1.50 ★ Best", "100.0%", "0.167"],
    ["SRTF (Preemptive SJF)", "5.75 ★ Best", "11.75 ★ Best", "5.75", "100.0%", "0.167"]
]

for col_idx, h in enumerate(headers):
    cell = tbl.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = RGBColor(30, 41, 65)
    cell.text = h
    p = cell.text_frame.paragraphs[0]
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

for row_idx, row in enumerate(table_data):
    for col_idx, val in enumerate(row):
        cell = tbl.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_CARD_BG if row_idx % 2 == 0 else RGBColor(20, 26, 44)
        cell.text = val
        p = cell.text_frame.paragraphs[0]
        p.font.size = Pt(10.5)
        if "★" in val:
            p.font.bold = True
            p.font.color.rgb = COLOR_GREEN
        elif col_idx == 0:
            p.font.bold = True
            p.font.color.rgb = COLOR_TEXT_PRIMARY
        else:
            p.font.color.rgb = COLOR_TEXT_MUTED

# Bottom Insights Card
add_card(slide9, Inches(0.8), Inches(5.6), Inches(11.73), Inches(1.4))
ins_box = slide9.shapes.add_textbox(Inches(1.0), Inches(5.7), Inches(11.33), Inches(1.2))
tf = ins_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "💡 Critical Analytical Findings"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_ORANGE

findings = (
    "1. SRTF achieves lowest average waiting time (5.75) and turnaround time (11.75).\n"
    "2. Round Robin achieves the fastest average response time (1.50 vs 8.75 for FCFS) due to time-slicing.\n"
    "3. Preemptive Priority drastically lowers response time (from 6.50 to 2.50) compared to non-preemptive priority."
)
p2 = tf.add_paragraph()
p2.text = findings
p2.font.size = Pt(10)
p2.font.color.rgb = COLOR_TEXT_PRIMARY

add_speaker_notes(slide9,
    "SPEAKER: Deepak\n"
    "Here are our empirical benchmark results on the standard textbook dataset. "
    "Notice that SRTF produces the optimal average waiting time (5.75). "
    "However, Round Robin produces the fastest response time: 1.50 units compared to 8.75 for FCFS! "
    "This confirms why modern desktop operating systems use Round Robin variants: interactive applications need immediate responsiveness."
)

# ==============================================================================
# SLIDE 10: Robust Input Validation & Edge Case Handling
# ==============================================================================
slide10 = prs.slides.add_slide(blank_layout)
set_slide_background(slide10)
add_header(slide10, "Software Quality", "Input Validation & Edge Case Resilience", "Defensive engineering against invalid, boundary, and pathological workloads.")

# Left Card: Validation
add_card(slide10, Inches(0.8), Inches(1.9), Inches(5.7), Inches(5.0))
v_box = slide10.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = v_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "🛡️ Real-Time Field Validation"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_PINK

val_rules = [
    ("Arrival Time (AT)", "Enforces non-negative integers (AT ≥ 0). Rejects floating points or negative numbers with specific inline error hints."),
    ("Burst Time (BT)", "Enforces positive integers (BT ≥ 1). Prevents zero-burst processes which create divide-by-zero errors in CPU throughput."),
    ("Priority", "Enforces non-negative integers. Validates priority hierarchy where 0 or 1 represents maximum priority."),
    ("Duplicate PID Prevention", "Detects existing Process IDs during both process addition and editing, preventing state collisions.")
]

for title, desc in val_rules:
    p = tf.add_paragraph()
    p.text = f"\n• {title}:"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

# Right Card: Edge Cases
add_card(slide10, Inches(6.8), Inches(1.9), Inches(5.7), Inches(5.0))
ec_box = slide10.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = ec_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "⚡ Handled Boundary Conditions"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_GREEN

edge_cases = [
    ("Sparse Arrivals (CPU Gaps)", "When arrival times have gaps (e.g. P1 at t=0, P2 at t=5), the engine creates explicit idle blocks without freezing."),
    ("Single Process Workload", "Correctly handles a solitary process arriving at t=0 or t>0 with zero waiting time and 100% busy time during execution."),
    ("All Processes Arrive at t=0", "Simulates pure burst-time mechanics when all tasks contend for the CPU simultaneously from start."),
    ("Simultaneous Tie Breaking", "Ties in burst time or priority are broken deterministically using arrival order, then alphabetical PID.")
]

for title, desc in edge_cases:
    p = tf.add_paragraph()
    p.text = f"\n• {title}:"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide10,
    "SPEAKER: Devansh Saini\n"
    "A key criteria in the project guidelines is error handling and boundary testing. "
    "Our interface prevents zero burst times, negative arrival times, and duplicate PIDs. "
    "Furthermore, our scheduler handles edge cases like sparse arrival gaps, single process workloads, and tie-breaking deterministically."
)

# ==============================================================================
# SLIDE 11: Automated Software Testing (178 Test Cases)
# ==============================================================================
slide11 = prs.slides.add_slide(blank_layout)
set_slide_background(slide11)
add_header(slide11, "Verification & QA", "Automated Testing Suite: 178 Tests", "Zero-defect verification across browser and command-line environments.")

# 3 Cards
t_suites = [
    {
        "title": "🧪 Browser Test Runner",
        "color": COLOR_CYAN,
        "items": [
            "Located at tests/test-algorithms.html.",
            "Interactive GUI with animated progress bar and execution timer.",
            "Color-coded pass / fail badges for every assertion.",
            "Collapsible test groups organized by scheduling algorithm.",
            "Executes client-side in under 15 milliseconds."
        ]
    },
    {
        "title": "⚡ Headless Node.js CLI",
        "color": COLOR_PRIMARY,
        "items": [
            "Located at test-node.js in project root.",
            "Can be executed in terminal: node test-node.js.",
            "Provides automated pass/fail verification for CI pipelines.",
            "Exits with standard code 0 on full pass, code 1 on failure.",
            "Executes complete 178-test suite in 18 ms."
        ]
    },
    {
        "title": "✅ 100% Pass Certification",
        "color": COLOR_GREEN,
        "items": [
            "Total Test Cases: 178",
            "Passed: 178 (100%)  |  Failed: 0",
            "Covers zero-arrival, staggered arrivals, idle gaps, single process.",
            "Validates Round Robin with q = 1, 2, 3, 4, 10.",
            "Guarantees RT ≤ WT and Total = Sum(BT) + Idle."
        ]
    }
]

for idx, s in enumerate(t_suites):
    x = Inches(0.8 + idx * 3.95)
    y = Inches(1.9)
    w = Inches(3.75)
    h = Inches(5.0)
    add_card(slide11, x, y, w, h)
    
    tb = slide11.shapes.add_textbox(x + Inches(0.2), y + Inches(0.2), Inches(3.35), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = s["title"]
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = s["color"]
    p.space_after = Pt(10)
    
    for item in s["items"]:
        p = tf.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(10)
        p.font.color.rgb = COLOR_TEXT_MUTED
        p.space_after = Pt(6)

add_speaker_notes(slide11,
    "SPEAKER: Deepak\n"
    "As testing lead, I built an automated test harness with 178 unit test cases. "
    "We have two test runners: an interactive browser runner with progress bars, and a headless Node.js runner for command line. "
    "All 178 tests pass with zero failures, proving that our scheduling logic matches textbook ground-truth solutions."
)

# ==============================================================================
# SLIDE 12: Real-World Operating System Connections
# ==============================================================================
slide12 = prs.slides.add_slide(blank_layout)
set_slide_background(slide12)
add_header(slide12, "Industry Systems", "Real-World Operating System Parallels", "How production operating system kernels adapt classic scheduling theory.")

# 3 OS Cards
os_data = [
    {
        "name": "🐧 Linux Kernel (CFS)",
        "sub": "Completely Fair Scheduler",
        "color": COLOR_ORANGE,
        "items": [
            "Replaces traditional FIFO queues with a Red-Black Tree indexed by virtual runtime (vruntime).",
            "Processes with least CPU consumption sit at leftmost leaf of tree and get dispatched first.",
            "Uses 'nice' values (-20 to +19) to scale execution weight.",
            "Interactive I/O tasks naturally retain low vruntime, giving them high responsiveness."
        ]
    },
    {
        "name": "🪟 Windows NT Kernel",
        "sub": "Priority-Driven Multilevel Queue",
        "color": COLOR_CYAN,
        "items": [
            "Employs 32 discrete priority levels divided into variable (0–15) and real-time (16–31).",
            "Uses dynamic priority boosting for interactive foreground windows and thread unblocking.",
            "Applies Round Robin scheduling within each individual priority level.",
            "Periodically executes balance set manager to prevent thread starvation."
        ]
    },
    {
        "name": "⏱️ Real-Time OS (RTOS)",
        "sub": "Deterministic Scheduling",
        "color": COLOR_GREEN,
        "items": [
            "Used in mission-critical robotics, avionics, and medical devices where deadlines are absolute.",
            "Rate-Monotonic Scheduling (RMS): Static priority inversely proportional to task period.",
            "Earliest Deadline First (EDF): Dynamic priority allocating CPU to closest deadline.",
            "Preemption is immediate to guarantee zero deadline misses."
        ]
    }
]

for idx, o in enumerate(os_data):
    x = Inches(0.8 + idx * 3.95)
    y = Inches(1.9)
    w = Inches(3.75)
    h = Inches(5.0)
    add_card(slide12, x, y, w, h)
    
    tb = slide12.shapes.add_textbox(x + Inches(0.2), y + Inches(0.2), Inches(3.35), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = o["name"]
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    
    p2 = tf.add_paragraph()
    p2.text = o["sub"]
    p2.font.size = Pt(10)
    p2.font.bold = True
    p2.font.color.rgb = o["color"]
    p2.space_after = Pt(10)
    
    for item in o["items"]:
        p = tf.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(10)
        p.font.color.rgb = COLOR_TEXT_MUTED
        p.space_after = Pt(6)

add_speaker_notes(slide12,
    "SPEAKER: Mohit Yadav\n"
    "In real operating systems, these principles are actively used: "
    "Linux uses the Completely Fair Scheduler (CFS) based on Red-Black Trees of virtual runtime. "
    "Windows uses a 32-level priority queue with Round Robin and dynamic priority boosts. "
    "Real-Time OSs use Rate-Monotonic and Earliest-Deadline-First algorithms to guarantee hard real-time deadlines."
)

# ==============================================================================
# SLIDE 13: Viva Voce Defense Strategy & Examiner FAQ
# ==============================================================================
slide13 = prs.slides.add_slide(blank_layout)
set_slide_background(slide13)
add_header(slide13, "Viva Preparation", "Viva Voce Defense Strategy & Examiner FAQ", "Prepared technical explanations for oral practical examination.")

# Left Card: Questions
add_card(slide13, Inches(0.8), Inches(1.9), Inches(5.7), Inches(5.0))
q_box = slide13.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = q_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "❓ Common Examiner Questions"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN

qa_list1 = [
    ("Why is SJF provably optimal for average waiting time?", 
     "Moving a shorter job ahead of a longer job decreases the waiting time of the short job by more than it increases waiting time of the long job, minimizing average waiting time."),
    ("What is the Convoy Effect?", 
     "In FCFS, when a long CPU-bound process occupies the CPU, short I/O-bound tasks wait behind it in the ready queue, dragging down CPU utilization and device efficiency.")
]

for q, a in qa_list1:
    p = tf.add_paragraph()
    p.text = f"\nQ: {q}"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"A: {a}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

# Right Card: Questions
add_card(slide13, Inches(6.8), Inches(1.9), Inches(5.7), Inches(5.0))
q_box2 = slide13.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = q_box2.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "🎯 Advanced Technical Inquiries"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_ORANGE

qa_list2 = [
    ("How does Round Robin handle arrival-quantum ties?", 
     "When a quantum expires at time t and a new task arrives at time t, the newly arrived task enters the ready queue BEFORE the preempted task is re-appended."),
    ("What is Starvation and how is it resolved?", 
     "Starvation occurs in Priority and SJF when low-priority/long tasks wait indefinitely. Resolved via AGING—gradually increasing the priority of long-waiting tasks.")
]

for q, a in qa_list2:
    p = tf.add_paragraph()
    p.text = f"\nQ: {q}"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"A: {a}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide13,
    "SPEAKER: Mohit Yadav\n"
    "We have prepared answers for common viva questions: "
    "the mathematical proof of SJF optimality, the Convoy effect in FCFS, aging as the solution to starvation, "
    "and our precise tie-breaking logic in Round Robin."
)

# ==============================================================================
# SLIDE 14: Limitations & Future Scope
# ==============================================================================
slide14 = prs.slides.add_slide(blank_layout)
set_slide_background(slide14)
add_header(slide14, "Project Roadmap", "Limitations & Future Enhancements", "Current boundary scope and prospective expansions.")

# Left Card: Limitations
add_card(slide14, Inches(0.8), Inches(1.9), Inches(5.7), Inches(5.0))
lim_box = slide14.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = lim_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "⚠️ Current Simulator Scope & Limits"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_PINK

limits = [
    ("Single-Core Architecture", "Currently assumes a uniprocessor system; multi-core processor affinity, cache snooping, and inter-core load balancing are not yet modeled."),
    ("Deterministic Burst Knowledge", "Assumes process CPU bursts are known integers upfront. In general interactive systems, bursts are stochastic and predicted via exponential smoothing."),
    ("Zero Context Switching Latency", "Context switch overhead is treated as negligible (0 μs) to maintain conceptual clarity for student learning.")
]

for title, desc in limits:
    p = tf.add_paragraph()
    p.text = f"\n• {title}:"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

# Right Card: Future Scope
add_card(slide14, Inches(6.8), Inches(1.9), Inches(5.7), Inches(5.0))
fs_box = slide14.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.5))
tf = fs_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "🚀 Future Enhancement Roadmap"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_GREEN

futures = [
    ("Multi-Level Feedback Queue (MLFQ)", "Implement multiple priority queues where I/O-bound jobs stay in top queues and compute-heavy jobs migrate downward with dynamic aging."),
    ("Multi-Core Symmetric Multiprocessing", "Extend Gantt chart renderer to display dual-core and quad-core parallel execution pipelines with CPU affinity."),
    ("Real-Time Scheduling (EDF / RMS)", "Incorporate Earliest-Deadline-First and Rate-Monotonic scheduling with deadline miss detection."),
    ("PDF / LaTeX Lab Report Export", "One-click generation of university lab submission reports with auto-rendered vector Gantt charts.")
]

for title, desc in futures:
    p = tf.add_paragraph()
    p.text = f"\n• {title}:"
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    p_sub = tf.add_paragraph()
    p_sub.text = f"   {desc}"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide14,
    "SPEAKER: Devansh Saini\n"
    "While our current system is a uniprocessor simulator with deterministic burst times, "
    "our modular architecture easily scales to Multi-Level Feedback Queues (MLFQ), multi-core symmetric multiprocessing (SMP), and automated PDF laboratory report generation."
)

# ==============================================================================
# SLIDE 15: Conclusion & Summary of Deliverables
# ==============================================================================
slide15 = prs.slides.add_slide(blank_layout)
set_slide_background(slide15)
add_header(slide15, "Project Summary", "Project Deliverables & Summary", "Comprehensive deliverables provided for university capstone evaluation.")

delivs = [
    ("💻 Web Application", "index.html", "Fully functional dashboard with Gantt charts, playback controller, theme switcher, and multi-algorithm comparison."),
    ("🧪 Automated Test Suite", "tests/test-algorithms.html", "178 assertion test cases with 100% pass rate in browser and Node.js CLI runner."),
    ("📄 Formal Academic Report", "docs/PROJECT_REPORT.md", "Complete project report covering Abstract, Architecture, Formulas, Flowcharts, Test Matrices, and Findings."),
    ("🗣️ Viva Voce Cheatsheet", "docs/VIVA_QUESTIONS_AND_ANSWERS.md", "21+ detailed viva questions, mathematical invariant proofs, and examiner defense strategies."),
    ("🎤 Presentation & Speech", "presentation.html", "14-slide interactive slide deck with keyboard controls and word-for-word member speeches."),
    ("⚙️ Pure Vanilla Stack", "HTML5 + CSS3 + ES6 JS", "Zero external frameworks or libraries. Completely self-contained and runnable on any computer.")
]

for idx, (title, file_ref, desc) in enumerate(delivs):
    col = idx % 3
    row = idx // 3
    x = Inches(0.8 + col * 3.95)
    y = Inches(1.9 + row * 2.55)
    w = Inches(3.75)
    h = Inches(2.35)
    add_card(slide15, x, y, w, h)
    
    tb = slide15.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), Inches(3.35), Inches(2.05))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT_PRIMARY
    
    p2 = tf.add_paragraph()
    p2.text = file_ref
    p2.font.size = Pt(9.5)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_CYAN
    p2.space_after = Pt(4)
    
    p3 = tf.add_paragraph()
    p3.text = desc
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = COLOR_TEXT_MUTED

add_speaker_notes(slide15,
    "SPEAKER: Deepak\n"
    "In summary, we have delivered a complete software package: "
    "the interactive web app, a 178-test automated test suite, a formal project report, a viva cheatsheet, and this presentation slide deck. "
    "All components adhere strictly to the college curriculum guidelines."
)

# ==============================================================================
# SLIDE 16: Q&A and Live Demonstration
# ==============================================================================
slide16 = prs.slides.add_slide(blank_layout)
set_slide_background(slide16)

# Center Box
center_card = add_card(slide16, Inches(1.5), Inches(1.0), Inches(10.33), Inches(5.5))

c_box = slide16.shapes.add_textbox(Inches(1.8), Inches(1.4), Inches(9.73), Inches(4.8))
tf = c_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "DEMONSTRATION & DEFENSE"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN
p.alignment = PP_ALIGN.CENTER

p = tf.add_paragraph()
p.text = "Thank You!\nWe are Ready for Live Demonstration & Q&A"
p.font.size = Pt(30)
p.font.bold = True
p.font.color.rgb = COLOR_TEXT_PRIMARY
p.alignment = PP_ALIGN.CENTER
p.space_after = Pt(16)

p = tf.add_paragraph()
p.text = "We invite the examiners to input custom process workloads, test preemption boundaries,\nand observe our interactive Gantt chart simulation playback controller."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_TEXT_MUTED
p.alignment = PP_ALIGN.CENTER
p.space_after = Pt(28)

# Member Summary in final slide
p = tf.add_paragraph()
p.text = "Project Team Members (Group G1/G2):\nMohit Yadav (2401730063)  |  Devansh Saini (2401730102)  |  Deepak (2401730152)"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_GREEN
p.alignment = PP_ALIGN.CENTER

add_speaker_notes(slide16,
    "SPEAKER: All Team Members (Mohit, Devansh, Deepak)\n"
    "Thank you, professors. We would now like to transition to our live demonstration. "
    "We will run custom processes, demonstrate preemption, and answer any technical questions you may have."
)

# Save the presentation
output_pptx_path = r"c:\Users\91991\OneDrive\Desktop\CPU-Scheduling-Visualizer\CPU_Scheduling_Visualizer_Presentation.pptx"
prs.save(output_pptx_path)
print(f"PowerPoint Presentation generated successfully: {output_pptx_path}")
