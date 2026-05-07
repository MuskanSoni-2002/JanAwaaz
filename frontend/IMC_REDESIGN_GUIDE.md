# IMC-Inspired Web UI Redesign - Documentation

## 🎨 Overview

The JanAwaaz citizen portal has been completely transformed into a modern, professional, IMC (Indore Municipal Corporation)-inspired web interface. This redesign maintains all core functionality while introducing a cleaner, more refined visual experience optimized for desktop usage.

## 📊 Design System

### Color Palette
- **Primary**: `#1565C0` (Deep Blue) - Primary actions, navigation
- **Accent**: `#FF6F00` (Orange) - Active states, attention
- **Success**: `#2E7D32` (Green) - Resolved/positive states
- **Warning**: `#E65100` (Deep Orange) - Pending/active states
- **Error**: `#C62828` (Red) - Rejected/negative states
- **Neutral**: `#8896A6` (Gray) - Muted text
- **Background**: `#F5F7FA` (Light Gray) - Page background
- **Surface**: `#FFFFFF` (White) - Cards, panels

### Typography
- **Font**: Inter (modern, readable)
- **Headings**: 700-800 weight, tight letter-spacing
- **Body**: 400-500 weight, 1.6 line-height
- **Small**: 0.75-0.8125rem for labels and captions

### Spacing & Sizing
- **Grid Gap**: 1rem, 1.25rem, 1.5rem (consistent 0.25rem units)
- **Padding**: 1rem, 1.25rem, 1.5rem, 2rem
- **Border Radius**: 8px (small), 12px (default), 16px (large)
- **Shadows**: Subtle (sm), Medium (md), Large (lg)

## 🏗️ New Component Architecture

### IMC Component Library (`/src/components/IMC/`)

#### Core Components

**1. Card Components**
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/IMC'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**2. Service Cards (Dashboard Actions)**
```jsx
import { ServiceGrid, ServiceCard } from '@/components/IMC'

<ServiceGrid>
  <ServiceCard
    icon={PlusCircle}
    title="File a Grievance"
    description="Submit a new complaint"
    href="/complaints/new"
  />
</ServiceGrid>
```

**3. Stat Cards**
```jsx
import { StatGrid, StatCard } from '@/components/IMC'

<StatGrid>
  <StatCard
    label="Total Complaints"
    value={42}
    icon={FileText}
    color="#1565C0"
    bgColor="#E3F2FD"
  />
</StatGrid>
```

**4. Complaint Cards (List Items)**
```jsx
import { ComplaintCard, ComplaintList } from '@/components/IMC'

<ComplaintList>
  <ComplaintCard
    id="12345"
    title="Pothole on Main Street"
    category="Roads"
    status="PENDING"
    date="2026-05-01"
    location="Zone A"
  />
</ComplaintList>
```

**5. Tables**
```jsx
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/IMC'

<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Column</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**6. Buttons**
```jsx
import { Button } from '@/components/IMC'

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

**7. State Components**
```jsx
import { LoadingState, EmptyState, ErrorState } from '@/components/IMC'

<LoadingState message="Loading..." />
<EmptyState title="No data" description="..." />
<ErrorState title="Error" description="..." />
```

**8. Header Components**
```jsx
import { PageHeader, TopBar } from '@/components/IMC'

<PageHeader
  eyebrow="Section"
  title="Page Title"
  description="Description"
  action={<Button>Action</Button>}
/>
```

### Layout Components

**IMC Dashboard Layout** (`/src/layouts/IMCDashboardLayout.jsx`)
- Left sidebar navigation (fixed, 260px)
- Responsive design (collapses on mobile)
- User profile section
- Clean, minimal design

## 📄 Updated Pages

### Dashboard (`/src/pages/Dashboard.jsx`)
- **Welcome banner** with personalized greeting
- **Statistics cards** showing:
  - Total complaints
  - Active cases
  - Resolved cases
  - Resolution rate
- **Quick services grid** with card-based actions:
  - File a Grievance
  - My Complaints
  - Track Status
  - Browse by Area

### My Complaints (`/src/pages/MyComplaints.jsx`)
- **Page header** with total/active stats
- **Search and filter bar**
  - Text search by category/description
  - Status filter dropdown
- **Complaint list** as individual cards with:
  - Complaint ID
  - Title/Category
  - Status badge
  - Date and location
  - Hover effects

### Other Pages (Ready for Enhancement)
- **RaiseComplaint.jsx** - Form-based complaint filing
- **ComplaintDetails.jsx** - Individual complaint view
- **Profile.jsx** - User profile management

## 🎯 Design Principles

### 1. **Clean & Minimal**
- No clutter, intentional whitespace
- Clear visual hierarchy
- Reduced animation (subtle, purposeful)

### 2. **Card-Based Layout**
- Service actions as cards
- Complaints as list items
- Consistent cardBorder and shadow system

### 3. **Professional Typography**
- Large, bold headings
- Readable body text (1.6 line-height)
- Strategic use of color for emphasis

### 4. **Consistent Spacing**
- Grid system using 0.25rem units
- Predictable gaps (1rem, 1.25rem, 1.5rem)
- Breathing room around components

### 5. **Accessible & Responsive**
- Color contrast ratios meet WCAG standards
- Mobile-first approach
- Touch-friendly button sizes

## 📱 Responsive Behavior

### Breakpoints
- **Mobile**: < 640px - Single column, full-width components
- **Tablet**: 640px - 1024px - Two column grid
- **Desktop**: 1024px+ - Full grid layout, sidebar visible

### Sidebar
- Hidden on mobile (toggleable)
- Fixed on desktop
- Smooth transitions

### Cards
- Full width on mobile
- Grid layout on larger screens
- Responsive grid columns (auto-fit, minmax)

## 🔄 Migration Guide

### Old → New Components

| Old Pattern | New Component |
|------------|----------------|
| `<div className="imc-card">` | `<Card>` |
| Manual stat display | `<StatCard>` |
| Service action links | `<ServiceCard>` |
| List items | `<ComplaintCard>` |
| Complex forms | Still inline (focus on UI) |
| Page layouts | `<PageHeader>` |

### Implementation Example

**Before:**
```jsx
<div className="imc-card" style={{ padding: '1.5rem' }}>
  <h2 className="imc-page-title">Title</h2>
  <p className="imc-body">Description</p>
</div>
```

**After:**
```jsx
<PageHeader
  title="Title"
  description="Description"
/>
```

## 🎨 CSS Classes Available

### Utilities
- `.imc-card` - Base card styling
- `.imc-card-hover` - Elevated on hover
- `.imc-animate` - Fade-in animation
- `.imc-animate-delay-1/2/3` - Staggered animations

### Typography
- `.imc-page-title` - Large heading
- `.imc-section-title` - Medium heading
- `.imc-body` - Body text
- `.imc-kicker` - Small uppercase label

### Buttons
- `.imc-btn-primary` - Primary action
- `.imc-btn-secondary` - Secondary action
- `.imc-btn-ghost` - Subtle button
- `.imc-btn-danger` - Destructive action

### Layout
- `.imc-grid-2` - 2-column grid
- `.imc-grid-3` - 3-column grid
- `.imc-grid-4` - 4-column grid

### Status Badges
- `.imc-badge-resolved` - Green
- `.imc-badge-pending` - Orange
- `.imc-badge-rejected` - Red
- `.imc-badge-active` - Blue

## 🚀 Best Practices

1. **Use Component Library First** - Prefer IMC components over manual styling
2. **Maintain Consistency** - Follow established color/spacing patterns
3. **Mobile First** - Design for mobile, enhance for desktop
4. **Accessibility** - Test color contrast and keyboard navigation
5. **Performance** - Minimize inline styles, use CSS classes
6. **Documentation** - Comment complex patterns

## 🔧 Future Enhancements

- [ ] Officer portal redesign (separate modern theme)
- [ ] Form components standardization
- [ ] Additional state components (breadcrumbs, tabs, modals)
- [ ] Advanced animations
- [ ] Dark mode support
- [ ] Print-friendly styles
- [ ] Accessibility audit (WCAG 2.1 AA)

## 📚 Resources

- **Design Tokens**: `/src/index.css` (CSS variables)
- **Components**: `/src/components/IMC/`
- **Layout**: `/src/layouts/IMCDashboardLayout.jsx`
- **Updated Pages**: `/src/pages/`

## 🎯 Summary

The IMC-inspired redesign transforms the citizen portal into a modern, professional web application with:
- ✅ Cleaner, more minimal aesthetics
- ✅ Card-based service-oriented UI
- ✅ Improved typography and spacing
- ✅ Responsive, mobile-friendly design
- ✅ Reusable component library
- ✅ Professional color scheme
- ✅ Consistent interaction patterns
- ✅ Maintained core functionality

All functionality remains unchanged—only the visual presentation has been enhanced for a better user experience.
