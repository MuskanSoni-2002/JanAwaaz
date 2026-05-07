# IMC Component Library - Quick Reference

## 📦 Import from `@/components/IMC`

### Cards & Layout
```jsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/IMC'
```

### Service Cards
```jsx
import { ServiceCard, ServiceGrid } from '@/components/IMC'
```

### Statistics
```jsx
import { StatCard, StatGrid } from '@/components/IMC'
```

### Lists
```jsx
import { ComplaintCard, ComplaintList } from '@/components/IMC'
```

### Tables
```jsx
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableContainer,
} from '@/components/IMC'
```

### Buttons
```jsx
import { Button, ButtonGroup } from '@/components/IMC'
```

### States
```jsx
import { LoadingState, EmptyState, ErrorState } from '@/components/IMC'
```

### Navigation & Headers
```jsx
import { Sidebar, TopBar, PageHeader } from '@/components/IMC'
```

---

## 🎨 Quick Styling Guide

### Color Variables (CSS)
```css
var(--color-primary)        /* #1565C0 */
var(--color-primary-dark)   /* #0D47A1 */
var(--color-primary-light)  /* #42A5F5 */
var(--color-accent)         /* #FF6F00 */
var(--imc-bg)              /* #F5F7FA */
var(--imc-surface)         /* #FFFFFF */
var(--imc-border)          /* #E8ECF1 */
var(--imc-text)            /* #1A2332 */
var(--imc-text-secondary)  /* #5A6A7E */
var(--imc-text-muted)      /* #8896A6 */
```

### Sizing Variables (CSS)
```css
var(--imc-radius)     /* 12px */
var(--imc-radius-sm)  /* 8px */
var(--imc-radius-lg)  /* 16px */
var(--imc-shadow-sm)  /* 0 1px 3px rgba(0,0,0,0.06) */
var(--imc-shadow-md)  /* 0 4px 12px rgba(0,0,0,0.08) */
var(--imc-shadow-lg)  /* 0 8px 24px rgba(0,0,0,0.1) */
```

### CSS Classes
```css
.imc-card                   /* Base card */
.imc-card-hover            /* Elevated on hover */
.imc-animate               /* Fade-in animation */
.imc-animate-delay-1/2/3   /* Staggered animations */
.imc-page-title            /* Large heading */
.imc-section-title         /* Medium heading */
.imc-body                  /* Body text */
.imc-kicker                /* Small label */
.imc-btn-primary           /* Primary button */
.imc-btn-secondary         /* Secondary button */
.imc-btn-ghost             /* Ghost button */
.imc-btn-danger            /* Danger button */
.imc-grid-2/3/4            /* Grid layouts */
.imc-badge-*               /* Status badges */
.imc-label                 /* Form labels */
.imc-input                 /* Form inputs */
.imc-select                /* Form selects */
.imc-textarea              /* Form textareas */
```

---

## 💡 Component Examples

### Page with Header, Stats, and Cards
```jsx
import { PageHeader, StatGrid, StatCard, ServiceGrid, ServiceCard } from '@/components/IMC'
import { FileText, PlusCircle } from 'lucide-react'

export function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Section"
        title="Dashboard"
        description="Overview of your complaints"
        action={<button className="imc-btn-primary">New</button>}
      />

      <StatGrid>
        <StatCard label="Total" value={42} icon={FileText} />
        <StatCard label="Active" value={5} icon={FileText} />
      </StatGrid>

      <ServiceGrid>
        <ServiceCard
          icon={PlusCircle}
          title="File Complaint"
          description="Submit new grievance"
          href="/new"
        />
      </ServiceGrid>
    </div>
  )
}
```

### Complaint List
```jsx
import { ComplaintCard, ComplaintList, EmptyState } from '@/components/IMC'
import { Link } from 'react-router-dom'

export function ComplaintsList({ complaints }) {
  if (complaints.length === 0) {
    return <EmptyState title="No complaints" />
  }

  return (
    <ComplaintList>
      {complaints.map((complaint) => (
        <Link key={complaint.id} to={`/complaints/${complaint.id}`}>
          <ComplaintCard
            id={complaint.id}
            title={complaint.title}
            status={complaint.status}
            date={complaint.date}
          />
        </Link>
      ))}
    </ComplaintList>
  )
}
```

### Table
```jsx
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/IMC'

export function ComplaintsTable({ complaints }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>ID</TableHeader>
          <TableHeader>Title</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {complaints.map((c) => (
          <TableRow key={c.id}>
            <TableCell>#{c.id}</TableCell>
            <TableCell>{c.title}</TableCell>
            <TableCell>{c.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Forms
```jsx
export function ComplaintForm() {
  return (
    <div className="imc-form-group">
      <label className="imc-label">Category</label>
      <select className="imc-select">
        <option>-- Select --</option>
      </select>

      <label className="imc-label" style={{ marginTop: '1rem' }}>
        Description
      </label>
      <textarea className="imc-textarea" placeholder="Describe..." />

      <div style={{ marginTop: '1.5rem' }}>
        <button className="imc-btn-primary">Submit</button>
        <button className="imc-btn-secondary" style={{ marginLeft: '0.5rem' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
```

---

## 🔍 Status Badge Colors

### Complaint Status Mapping
```jsx
const statusColors = {
  RESOLVED: { bg: '#E8F5E9', text: '#2E7D32', label: 'Resolved' },
  REJECTED: { bg: '#FFEBEE', text: '#C62828', label: 'Rejected' },
  PENDING: { bg: '#FFF3E0', text: '#E65100', label: 'Pending' },
  ASSIGNED: { bg: '#E3F2FD', text: '#1565C0', label: 'Assigned' },
  IN_PROGRESS: { bg: '#FCE4EC', text: '#AD1457', label: 'In Progress' },
}
```

---

## 📐 Responsive Patterns

### Grid Responsive
```jsx
// Automatically adjusts columns based on screen size
<div className="imc-grid-2">  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 2 cols */}
<div className="imc-grid-3">  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
<div className="imc-grid-4">  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
```

### Flex Responsive
```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
  {/* Stacks on mobile, adjusts layout at breakpoints */}
</div>
```

---

## ✅ Checklist for Page Updates

- [ ] Import IMC components
- [ ] Use `<PageHeader>` for title/description
- [ ] Use `<StatCard>` for metrics
- [ ] Use `<ServiceCard>` for actions
- [ ] Use `<ComplaintCard>` for lists
- [ ] Use `<Button>` for actions
- [ ] Use `<LoadingState>` for loading
- [ ] Use `<EmptyState>` for empty lists
- [ ] Use `.imc-form-group` for forms
- [ ] Use `.imc-grid-*` for grids
- [ ] Test on mobile (responsive)
- [ ] Verify color contrast
- [ ] Check keyboard navigation

---

## 🎨 Design Tokens Summary

| Token | Value | Usage |
|-------|-------|-------|
| Primary | #1565C0 | Main actions, links |
| Accent | #FF6F00 | Active/pending states |
| Success | #2E7D32 | Resolved/positive |
| Warning | #E65100 | Attention/active |
| Error | #C62828 | Errors/rejected |
| Muted | #8896A6 | Secondary text |
| Background | #F5F7FA | Page background |
| Surface | #FFFFFF | Cards/panels |
| Border | #E8ECF1 | Dividers/lines |
| Radius | 12px | Default corner radius |
| Shadow-md | 0 4px 12px rgba(...) | Elevated elements |

---

## 🚀 Performance Tips

1. **Lazy load images** in cards
2. **Use React.memo** for card lists
3. **Defer expensive renders** with `useDeferredValue`
4. **Minimize re-renders** with proper key props
5. **Avoid inline style objects** in loops
6. **Use CSS classes** instead of inline styles when possible

---

## 🐛 Debugging

### Common Issues

**Cards not styled correctly?**
- Check `className="imc-card"` is applied
- Verify CSS file is imported in `main.jsx`

**Responsive layout broken?**
- Use proper grid/flex classes
- Check viewport meta tag in HTML

**Components not rendering?**
- Verify import path: `@/components/IMC`
- Check all required props

**Colors look wrong?**
- Verify CSS variables are set
- Check browser devtools for applied styles
- Test in different browsers

