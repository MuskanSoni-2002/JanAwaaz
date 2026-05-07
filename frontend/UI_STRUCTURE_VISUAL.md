# IMC UI Structure - Visual Overview

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (260px fixed)          │  MAIN CONTENT AREA        │
│  [Brand Logo]                   │                           │
│  JanAwaaz                        │  ╭─────────────────────╮  │
│  CITIZEN PORTAL                  │  │  PAGE HEADER        │  │
│  ───────────────────────────────  │  │  - Eyebrow          │  │
│  [🏠] Dashboard                  │  │  - Title            │  │
│  [📋] My Complaints              │  │  - Description      │  │
│  [➕] New Complaint              │  │  - Action Button    │  │
│  [👤] Profile                    │  ╰─────────────────────╯  │
│  ───────────────────────────────  │                           │
│  [Avatar] John Doe               │  ╭─────────────────────╮  │
│  john@example.com                │  │  STAT CARDS GRID    │  │
│  Citizen                          │  │  ┌───┐ ┌───┐ ┌───┐ │  │
│  [Logout]                         │  │  │42 │ │5  │ │8  │ │  │
│  ───────────────────────────────  │  │  └───┘ └───┘ └───┘ │  │
│                                   │  ╰─────────────────────╯  │
│                                   │                           │
│                                   │  ╭─────────────────────╮  │
│                                   │  │  SERVICE CARDS      │  │
│                                   │  │  ┌────────┬────────┐ │  │
│                                   │  │  │ Card 1 │ Card 2 │ │  │
│                                   │  │  ├────────┼────────┤ │  │
│                                   │  │  │ Card 3 │ Card 4 │ │  │
│                                   │  │  └────────┴────────┘ │  │
│                                   │  ╰─────────────────────╯  │
└─────────────────────────────────────────────────────────────┘
```

## Dashboard Layout (Home Page)

```
PAGE HEADER
├─ Eyebrow: "Welcome back"
├─ Title: "Hello, John!"
├─ Description: "Manage your civic complaints..."
└─ Action: "File New Complaint" button

STATISTICS GRID (4 columns)
├─ Total Complaints: 42
├─ Active Cases: 5
├─ Resolved: 35
└─ Resolution Rate: 83%

QUICK SERVICES SECTION
├─ Title: "Quick Services"
└─ Service Grid (2 columns)
    ├─ [📝] File a Grievance
    │  "Submit a new complaint..."
    ├─ [📋] My Complaints
    │  "View and track all your..."
    ├─ [📊] Track Status
    │  "Check real-time updates..."
    └─ [📍] Browse by Area
       "Browse grievances by area..."
```

## My Complaints Layout

```
PAGE HEADER
├─ Eyebrow: "Grievances"
├─ Title: "My Complaints"
├─ Description: "Track and manage..."
└─ Action: "File Complaint" button

QUICK STATS
├─ Total Complaints: 42
└─ Active Cases: 5

FILTERS & SEARCH
├─ Search Box
│  "Search by category..."
└─ Status Filter Dropdown
   "All Statuses, Pending, Resolved..."

COMPLAINTS LIST
├─ Complaint Card 1
│  ├─ ID: #12345
│  ├─ Title: Pothole on Main Street
│  ├─ Category: Roads
│  ├─ Status Badge: [PENDING]
│  ├─ Date: 2026-05-01
│  └─ Location: Zone A
│
├─ Complaint Card 2
│  ├─ ID: #12344
│  ├─ Title: Water Supply Issue
│  ├─ Category: Water
│  ├─ Status Badge: [RESOLVED]
│  ├─ Date: 2026-04-28
│  └─ Location: Zone B
│
└─ ... (more cards)
```

## Component Hierarchy

```
App.jsx
└─ IMCDashboardLayout
   ├─ Sidebar
   │  ├─ Brand Section
   │  ├─ Navigation Items
   │  │  ├─ Dashboard
   │  │  ├─ My Complaints
   │  │  ├─ New Complaint
   │  │  └─ Profile
   │  └─ User Section
   │     ├─ Avatar
   │     ├─ User Info
   │     └─ Logout Button
   │
   └─ Main Content
      └─ Outlet (Page Content)
         ├─ PageHeader
         │  ├─ Eyebrow
         │  ├─ Title
         │  ├─ Description
         │  └─ Action
         │
         ├─ StatGrid
         │  └─ StatCard (multiple)
         │     ├─ Label
         │     ├─ Value
         │     ├─ Icon
         │     └─ Colors
         │
         ├─ ServiceGrid
         │  └─ ServiceCard (multiple)
         │     ├─ Icon
         │     ├─ Title
         │     ├─ Description
         │     └─ Link
         │
         └─ ComplaintList
            └─ ComplaintCard (multiple)
               ├─ ID
               ├─ Title
               ├─ Category
               ├─ Status Badge
               ├─ Date
               ├─ Location
               └─ Chevron Icon
```

## Design System Layers

```
Level 1: CSS Design Tokens
├─ Colors (12 semantic colors)
├─ Typography (font sizes, weights)
├─ Spacing (0.25rem units)
├─ Radius (8px, 12px, 16px)
└─ Shadows (3 levels)

Level 2: CSS Classes
├─ Utility Classes (.imc-card, .imc-grid-2)
├─ Typography Classes (.imc-page-title, .imc-body)
├─ Button Classes (.imc-btn-primary, .imc-btn-danger)
├─ Badge Classes (.imc-badge-resolved, .imc-badge-pending)
└─ Layout Classes (.imc-form-group, .imc-animate)

Level 3: React Components
├─ Basic Components (Card, Button, Sidebar)
├─ Composite Components (PageHeader, StatCard)
├─ Container Components (ServiceGrid, ComplaintList)
└─ State Components (LoadingState, EmptyState)

Level 4: Pages
├─ Dashboard (uses multiple components)
├─ MyComplaints (uses list components)
├─ RaiseComplaint (uses form components)
└─ ComplaintDetails (uses detail components)
```

## Color Palette Visualization

```
PRIMARY COLORS
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│              │  │              │  │              │
│   Primary    │  │Primary Dark  │  │Primary Light │
│   #1565C0    │  │  #0D47A1     │  │  #42A5F5     │
│     (Blue)   │  │   (Darker)   │  │  (Lighter)   │
└──────────────┘  └──────────────┘  └──────────────┘

SEMANTIC COLORS
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Success    │  │   Warning    │  │    Error     │
│   #2E7D32    │  │   #E65100    │  │   #C62828    │
│   (Green)    │  │  (Orange)    │  │    (Red)     │
└──────────────┘  └──────────────┘  └──────────────┘

NEUTRAL COLORS
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Background   │  │   Surface    │  │    Border    │
│  #F5F7FA     │  │  #FFFFFF     │  │   #E8ECF1    │
└──────────────┘  └──────────────┘  └──────────────┘

TEXT COLORS
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Primary    │  │  Secondary   │  │    Muted     │
│  #1A2332     │  │  #5A6A7E     │  │  #8896A6     │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Responsive Breakpoints

```
Mobile (< 640px)
┌─────────────┐
│   (Full)    │
│             │
│  - Single   │
│  - Column   │
│  - Layout   │
└─────────────┘
  Sidebar: Hamburger Menu
  Cards: Full Width
  Grid: 1 Column

Tablet (640px - 1024px)
┌─────────────────────┐
│ (Half) │ (Half)    │
├────────┼───────────┤
│ (Half) │ (Half)    │
└─────────────────────┘
  Sidebar: Hidden/Compact
  Cards: 2 Columns
  Grid: 2 Columns

Desktop (1024px+)
┌──────────┬──────────────────────┐
│Sidebar   │  Page Content        │
│(260px)   │                      │
│          │  Grid: 3-4 Columns   │
│          │  Full Layout         │
└──────────┴──────────────────────┘
  Sidebar: Fixed, Always Visible
  Cards: Full Width, Optimized
  Grid: 3-4 Columns
```

## Status Badge Color Mapping

```
RESOLVED ──────┐  PENDING ────────┐  REJECTED ─────┐  ASSIGNED ──────┐
   ✓            │     ⏳            │      ✗          │    📋           │
   Green        │    Orange       │     Red        │     Blue        │
   #2E7D32      │    #E65100      │    #C62828     │    #1565C0      │
   Background:  │   Background:   │  Background:   │  Background:    │
   #E8F5E9      │   #FFF3E0       │  #FFEBEE       │  #E3F2FD        │
```

## Typography Scale

```
Display (2.25rem, 800w, -0.05em)
└─ Main page titles / Heroic content

Page Title (1.5rem, 700w, -0.02em)
└─ Section headers / Prominent titles

Section Title (1rem, 600w, -0.01em)
└─ Card headers / Subsection titles

Body (0.875rem, 400-500w, 1.6lh)
└─ Main content / Descriptions

Small (0.8125rem, 500w)
└─ Labels / Secondary info

Kicker (0.6875rem, 600w, 0.08em uppercase)
└─ Category tags / Eyebrow text

Label (0.8125rem, 600w, 0.01em uppercase)
└─ Form labels / Field names
```

## Spacing System

```
0.25rem (4px) - Tiny gaps
0.5rem (8px)  - Extra small
0.625rem      - Small padding/margin
0.75rem       - Small gap
1rem (16px)   - Base unit (standard gap/padding)
1.25rem       - Medium-large
1.5rem (24px) - Large (card padding)
2rem (32px)   - Extra large (section padding)
```

## Interaction States

```
BUTTON STATES
├─ Default: Full opacity, normal shadow
├─ Hover: Darker color, elevated shadow
├─ Active: Even darker, inset appearance
└─ Disabled: 55% opacity, no-pointer

CARD STATES
├─ Rest: Subtle shadow, normal border
├─ Hover: Elevated shadow, colored border
├─ Focus: Border color changed to primary
└─ Disabled: Reduced opacity

INPUT STATES
├─ Default: Border color #E8ECF1
├─ Focus: Border #1565C0, light blue ring
├─ Error: Border #C62828, error text
└─ Disabled: Opacity 0.7, no-pointer
```

This visual overview helps developers understand the structure, hierarchy, and relationships between different UI components and design elements.

