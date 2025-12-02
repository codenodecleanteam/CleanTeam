# CleanTeams Design Guidelines

## Design Approach
**Utility-Focused B2B SaaS**: Drawing from productivity tools like Linear, Notion, and modern dashboard systems. Emphasis on clarity, efficiency, and role-appropriate experiences rather than visual flair.

## Core Design Principles

### 1. Multi-Experience Design Strategy

**SuperAdmin Dashboard**: Data-dense, analytics-focused
- Table-heavy layouts for company listings and metrics
- Dashboard cards with key statistics
- Professional, administrative aesthetic
- Desktop-optimized with responsive fallbacks

**Company Admin Panel**: Operational efficiency
- Clean forms for cleaner/client management
- Calendar/schedule views for job assignments
- List and card hybrid layouts
- Balanced desktop/tablet experience

**Cleaner Mobile Interface**: Extreme simplicity
- **Large touch targets (minimum 48px height)**
- Card-based job listings with generous spacing
- Minimal text, maximum clarity
- **Single-column layouts only**
- Bottom-sheet style forms for reports

### 2. Typography System

**Font Families**:
- Primary: Inter or Work Sans (body, UI elements)
- Headings: Same as primary for consistency

**Hierarchy**:
- Page titles: text-2xl to text-4xl, font-semibold
- Section headers: text-xl, font-medium
- Card titles: text-lg, font-medium
- Body text: text-base
- Helper text: text-sm
- **Cleaner mobile**: Increase base sizes by 1-2 units for readability

### 3. Layout & Spacing

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16**
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-16
- Card gaps: gap-4 to gap-6
- Mobile cleaner interface: Double spacing (p-8, gap-8)

**Container Widths**:
- Admin dashboards: max-w-7xl
- Forms: max-w-2xl
- Cleaner mobile: w-full with p-4 side padding

### 4. Component Library

**Navigation**:
- Header with language selector (EN | PT | ES) - **mandatory on all pages**
- Role-based sidebar navigation for admin areas
- Bottom navigation for cleaner mobile interface

**Forms**:
- Clear label positioning (above inputs)
- Full-width inputs on mobile
- Inline validation messages
- Large submit buttons (h-12 minimum for cleaner forms)

**Data Display**:
- Tables for admin views (companies, cleaners, schedules)
- Cards for mobile cleaner agenda
- Status badges with clear visual states
- Metric cards for SuperAdmin dashboard

**Action Elements**:
- Primary buttons: Large, clear text, sufficient padding (px-6 py-3)
- Secondary buttons: Outlined or ghost style
- Danger actions: Distinct visual treatment
- **Cleaner interface buttons**: h-14 minimum, w-full on mobile

**Job/Schedule Cards** (Cleaner View):
- Client name prominent (text-lg, font-semibold)
- Address below name (text-sm)
- Time/date clearly visible
- Status indicator (color-coded)
- Action buttons at bottom (Start/Complete)

### 5. Responsive Breakpoints

- Mobile: base (320px+) - **Primary target for cleaner interface**
- Tablet: md (768px+)
- Desktop: lg (1024px+) - **Primary target for admin dashboards**

**Cleaner Interface**: Always single-column, stack everything vertically

**Admin Interfaces**: 
- Mobile: Single column
- Tablet: 2-column grids where appropriate
- Desktop: Multi-column layouts, sidebar + content

### 6. Page-Specific Layouts

**Landing Page**:
- Hero section with value proposition
- Feature highlights (3-column grid on desktop)
- Social proof section (if applicable)
- Clear "Start 30-Day Trial" CTA
- Language selector in top navigation

**Authentication Pages**:
- Centered form (max-w-md)
- Clean, minimal design
- Language selector present
- Trial messaging on signup

**SuperAdmin Dashboard**:
- Metric cards at top (4-column grid)
- Company list table below
- Filters and search functionality

**Company Admin - Schedule View**:
- Calendar/list toggle
- Team assignment interface with dropdowns
- Conflict detection warnings
- Date/time pickers

**Cleaner Agenda**:
- Today's jobs first (prominent)
- Upcoming jobs below
- Each job as a large card
- Swipe-friendly spacing

### 7. Multilingual Considerations

- **Never hardcode text** - all strings from translation files
- Language selector: Flags or text labels (EN | PT | ES)
- Consider text expansion (Portuguese/Spanish can be 30% longer)
- RTL not required for MVP

### 8. Accessibility & Usability

- Touch targets minimum 44px (48px for cleaner interface)
- Sufficient color contrast for all text
- Clear focus states on interactive elements
- Form validation with helpful error messages in selected language
- Loading states for async operations

## Images

**Landing Page Hero**: 
- Large hero image showing cleaning team in action or happy cleaners
- Modern, professional photography
- Overlay with semi-transparent background for text/CTA visibility
- Buttons on image: Use backdrop-blur-md with bg-white/20 or bg-black/30

**Dashboard**: No decorative images - data and functionality focused

**Cleaner Interface**: Optional small client house thumbnail in job cards if available, but not required for MVP

## Key Distinctions by Role

- **SuperAdmin**: Dense information, professional analytics aesthetic
- **Company Admin**: Balanced between forms and data views, operational clarity
- **Cleaner**: Minimal cognitive load, large actionable elements, instant comprehension