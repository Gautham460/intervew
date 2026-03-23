# 🏗️ Project Architecture - Enhanced

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   INTERVUE APPLICATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              FRONTEND LAYER (React)                    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  Public Pages          Protected Pages                │  │
│  │  ─────────────         ────────────────                │  │
│  │  • Home (NEW!)         • Interviews (Enhanced)         │  │
│  │  • Sign In             • Interview Details            │  │
│  │  • Sign Up             • Mock Interview               │  │
│  │                        • Feedback Results             │  │
│  │                        • Analytics (NEW!)             │  │
│  │                        • Setup (Admin)                │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         COMPONENT LAYER (Reusable Components)          │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  AnalyticsDashboard (NEW!)                             │  │
│  │  ├─ Line Chart (Performance Trend)                     │  │
│  │  ├─ Pie Chart (Score Distribution)                    │  │
│  │  ├─ Bar Chart (Questions Attempted)                   │  │
│  │  └─ Stat Cards                                        │  │
│  │                                                         │  │
│  │  EnhancedDashboard (NEW!)                              │  │
│  │  ├─ Search Component                                  │  │
│  │  ├─ Filter Dropdowns                                  │  │
│  │  ├─ Interview Cards (with metrics)                    │  │
│  │  └─ Statistics Cards                                  │  │
│  │                                                         │  │
│  │  PerformanceCard (NEW!)                                │  │
│  │  ├─ Skill Name                                        │  │
│  │  ├─ Rating Display                                    │  │
│  │  ├─ Trend Indicator                                   │  │
│  │  └─ Historical Data                                   │  │
│  │                                                         │  │
│  │  Other Components                                     │  │
│  │  ├─ InterviewPin (enhanced)                           │  │
│  │  ├─ Header (enhanced)                                 │  │
│  │  ├─ Navigation (enhanced)                             │  │
│  │  └─ Form/Input Components                             │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          UTILITY LAYER (Logic & Calculations)          │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  analytics.ts                                          │  │
│  │  ├─ calculatePerformanceMetrics()                      │  │
│  │  ├─ calculateSkillPerformance()                        │  │
│  │  ├─ getStrongAndWeakSkills()                           │  │
│  │  └─ groupFeedbacksBySkill()                            │  │
│  │                                                         │  │
│  │  interview-filters.ts                                  │  │
│  │  ├─ enhanceInterviewWithMetrics()                      │  │
│  │  ├─ filterInterviews()                                 │  │
│  │  ├─ searchInterviews()                                 │  │
│  │  └─ getInterviewStats()                                │  │
│  │                                                         │  │
│  │  Other Utilities                                      │  │
│  │  ├─ resume-parser.ts (existing)                        │  │
│  │  ├─ skill-questions-db.ts (existing)                   │  │
│  │  └─ helpers.ts (enhanced)                              │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │                                          │
         │                                          │
         ▼                                          ▼
┌──────────────────────────┐          ┌──────────────────────────┐
│   FIREBASE BACKEND       │          │  EXTERNAL SERVICES       │
├──────────────────────────┤          ├──────────────────────────┤
│                          │          │                          │
│  Firestore Database      │          │  Google Generative AI    │
│  ├─ interviews           │          │  (Feedback Generation)   │
│  ├─ userAnswers          │          │                          │
│  ├─ skillQuestions (DB)  │          │  Recharts Library        │
│  └─ users                │          │  (Visualizations)        │
│                          │          │                          │
│  Authentication          │          │  Radix UI                │
│  ├─ Clerk Integration    │          │  (Component Library)     │
│  └─ User Sessions        │          │                          │
│                          │          │                          │
└──────────────────────────┘          └──────────────────────────┘
```

---

## Data Flow Diagram

### Interview Creation Flow
```
┌─────────────────────────────────────────────────────────────┐
│                  USER UPLOADS RESUME                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │  Extract Skills          │
        │  (resume-parser.ts)      │
        └──────────┬───────────────┘
                   │
        React, TypeScript, Node.js
                   │
                   ▼
        ┌──────────────────────────────┐
        │  Store Interview Details     │
        │  (Form Submission)           │
        └──────────┬───────────────────┘
                   │
                   ├─► Generate AI Questions
                   │   (Google Gemini)
                   │
                   ├─► Fetch Database Questions
                   │   (skillQuestions collection)
                   │
                   ▼
        ┌──────────────────────────────┐
        │  Save to Firestore           │
        │  with all questions          │
        └──────────┬───────────────────┘
                   │
                   ▼
        ┌──────────────────────────────┐
        │  Interview Created ✓         │
        │  Ready to start              │
        └──────────────────────────────┘
```

### Analytics Calculation Flow
```
┌─────────────────────────────────────────────────────────────┐
│           USER TAKES INTERVIEW & RECORDS ANSWERS            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │  Generate Feedback       │
        │  (AI Analysis)           │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  Store UserAnswer        │
        │  in Firestore            │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────┐
        │  Calculate Performance Metrics       │
        │  (analytics.ts)                      │
        ├─ Average Rating                     │
        ├─ Score Distribution                 │
        ├─ Trend Analysis                     │
        └──────────┬──────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────┐
        │  Group by Skill                      │
        │  (interview-filters.ts)              │
        ├─ React: 7.5/10                      │
        ├─ TypeScript: 6.5/10                 │
        └──────────┬──────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────┐
        │  Identify Strengths & Weaknesses     │
        ├─ Strong: React (8+)                 │
        ├─ Weak: MongoDB (4.5)                │
        └──────────┬──────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────┐
        │  Display in Analytics Dashboard      │
        │  with Charts & Recommendations       │
        └──────────────────────────────────────┘
```

### Search & Filter Flow
```
┌─────────────────────────────────────────────────────────────┐
│           USER ENTERS SEARCH OR APPLIES FILTER              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    Search       Filter by     Sort by
    "React"      Status        Score
        │            │            │
        ▼            ▼            ▼
    ┌─────────────────────────────────────┐
    │  searchInterviews()                 │
    │  (Full-text search)                 │
    └────────────────┬────────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────────┐
    │  filterInterviews()                 │
    │  (Apply all filters)                │
    ├─ Status filter                     │
    ├─ Score range                       │
    ├─ Date range                        │
    └────────────────┬────────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────────┐
    │  Sort Results                       │
    │  (By date/score/position)           │
    └────────────────┬────────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────────┐
    │  Return Filtered Interviews         │
    │  with Enhanced Metrics              │
    └────────────────┬────────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────────┐
    │  Display with:                      │
    │  ✓ Score badges                    │
    │  ✓ Status indicators               │
    │  ✓ Result counter                  │
    │  ✓ Performance cards               │
    └─────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
├── PublicLayout
│   └── HomePage (Enhanced)
│       ├── Hero Section
│       ├── Features Showcase (NEW)
│       │   ├─ AI-Powered Questions
│       │   ├─ Resume Analysis
│       │   ├─ Performance Analytics (NEW)
│       │   ├─ Real-time Feedback
│       │   ├─ Voice Recording
│       │   └─ Skill Tracking
│       ├── CTA Section
│       └── Footer
│
├── AuthenticationLayout
│   ├── SignInPage
│   └── SignUpPage
│
└── MainLayout (Protected)
    ├── Header (Enhanced)
    │   ├── LogoContainer
    │   ├── NavigationRoutes
    │   ├── ProtectedRoutes Navigation (NEW)
    │   ├── ProfileContainer
    │   └── ToggleContainer
    │
    └── Routes
        ├── Generate Component
        │   ├── Dashboard (routes/dashboard.tsx)
        │   ├── EnhancedDashboard (Component - NEW)
        │   │   ├── Search Box
        │   │   ├── Filter Dropdowns
        │   │   ├── Statistics Cards
        │   │   ├── Interview Cards
        │   │   │   ├── InterviewPin
        │   │   │   ├── Score Badge
        │   │   │   └── Status Badge
        │   │   └── Results List
        │   │
        │   ├── CreateEditPage
        │   ├── MockLoadPage
        │   ├── MockInterviewPage
        │   │   ├── QuestionSection
        │   │   ├── RecordAnswer
        │   │   └── RecordSkillAnswer
        │   │
        │   └── Feedback
        │       ├── CustomBreadCrumb
        │       ├── FeedbackAccordion
        │       ├── PerformanceCard (NEW)
        │       └── RatingDisplay
        │
        ├── AnalyticsPage (NEW)
        │   ├── CustomBreadCrumb
        │   ├── AnalyticsDashboard (NEW)
        │   │   ├── Summary Stats Cards
        │   │   ├── LineChart (Performance Trend)
        │   │   ├── PieChart (Distribution)
        │   │   └── BarChart (Questions)
        │   │
        │   ├── Performance Summary Card
        │   ├── Alert Boxes (Recommendations)
        │   ├── Skill Performance Section
        │   │   └── PerformanceCard (Detailed variant)
        │   │
        │   └── Strong & Weak Skills Cards
        │
        ├── SetupPage
        │   ├── DatabaseSeeder
        │   └── System Info
        │
        └── UI Components (Updated)
            ├── Select (NEW) - Radix UI based
            ├── Card (existing)
            ├── Badge (existing)
            ├── Button (existing)
            ├── Input (existing)
            ├── Skeleton (existing)
            └── Alert (existing)
```

---

## Database Schema

```
Firebase Firestore
│
├── interviews (collection)
│   └── document
│       ├── id: string
│       ├── position: string
│       ├── description: string
│       ├── experience: number
│       ├── userId: string
│       ├── techStack: string (comma-separated)
│       ├── questions: Array<{question, answer}>
│       ├── skillQuestions: Array<{skill, question}>
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── userAnswers (collection)
│   └── document
│       ├── id: string
│       ├── mockIdRef: string (reference to interview)
│       ├── userId: string
│       ├── question: string
│       ├── correct_ans: string
│       ├── user_ans: string
│       ├── feedback: string (AI-generated)
│       ├── rating: number (0-10)
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── skillQuestions (collection) - Database-driven
│   └── document
│       ├── skill: string (indexed)
│       └── questions: Array<{
│           ├── question: string
│           └── expectedAnswer: string
│       }>
│
└── users (collection)
    └── document
        ├── id: string
        ├── name: string
        ├── email: string
        ├── imageUrl: string
        ├── createdAt: Timestamp
        └── updatedAt: Timestamp
```

---

## State Management & Data Flow

```
┌──────────────────────────────────────────────────┐
│         REACT COMPONENT STATE (Local)            │
├──────────────────────────────────────────────────┤
│                                                  │
│  Dashboard Component                            │
│  ├─ interviews: Interview[]                     │
│  ├─ loading: boolean                            │
│  ├─ searchQuery: string                         │
│  ├─ filters: InterviewFilter                    │
│  └─ feedbacks: UserAnswer[]                     │
│                                                  │
│  Analytics Component                            │
│  ├─ feedbacks: UserAnswer[]                     │
│  ├─ loading: boolean                            │
│  ├─ metrics: PerformanceMetrics                 │
│  └─ skillPerformances: SkillPerformance[]       │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   │
                   │ (Computed/Memoized)
                   ▼
┌──────────────────────────────────────────────────┐
│         DERIVED STATE (useMemo)                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Filtered & Searched Interviews                 │
│  ├─ Search applied                              │
│  ├─ Filters applied                             │
│  ├─ Sorting applied                             │
│  └─ Metrics enhanced                            │
│                                                  │
│  Calculated Analytics                           │
│  ├─ Performance metrics                         │
│  ├─ Skill breakdown                             │
│  ├─ Strong/weak skills                          │
│  └─ Recommendations                             │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   │
                   │ (Real-time updates via onSnapshot)
                   ▼
┌──────────────────────────────────────────────────┐
│         FIRESTORE (Real-time Database)           │
├──────────────────────────────────────────────────┤
│                                                  │
│  User's interviews & answers                    │
│  (automatically synchronized)                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Feature Matrix

| Feature | Before | After | Status |
|---------|--------|-------|--------|
| Interview Creation | ✅ | ✅ Enhanced | IMPROVED |
| Question Generation | ✅ AI + DB | ✅ Both Available | ENHANCED |
| Voice Recording | ✅ | ✅ Enhanced | IMPROVED |
| Feedback Generation | ✅ | ✅ Enhanced | IMPROVED |
| Interview View | ✅ Basic | ✅ Enhanced | IMPROVED |
| Dashboard | ✅ Basic | ✅ Advanced | UPGRADED |
| Analytics | ❌ | ✅ | NEW |
| Search | ❌ | ✅ | NEW |
| Filtering | ❌ | ✅ | NEW |
| Sorting | ❌ | ✅ | NEW |
| Charts | ❌ | ✅ | NEW |
| Skill Tracking | ✅ Basic | ✅ Advanced | UPGRADED |
| Recommendations | ❌ | ✅ | NEW |
| Home Page | ✅ Basic | ✅ Enhanced | UPGRADED |

---

## Technology Stack - Enhanced

```
Frontend
├── React 18.2 (UI Framework)
├── TypeScript 5 (Type Safety)
├── Tailwind CSS (Styling)
├── Radix UI (Components)
├── Lucide React (Icons)
│
│
Data Visualization (NEW)
├── Recharts (Charts & Graphs)
│   ├─ LineChart
│   ├─ BarChart
│   ├─ PieChart
│   └─ Responsive containers
│
│
Forms & Input (Enhanced)
├── React Hook Form (Form handling)
├── Radix UI Select (Enhanced dropdowns)
└── Custom Inputs
│
│
Backend & Database
├── Firebase 11.2
│   ├─ Firestore (Real-time DB)
│   └─ Authentication (Clerk)
├── Google Generative AI (Feedback)
│
│
Other Services
├── react-hook-speech-to-text (Voice)
├── sonner (Toast Notifications)
├── react-router-dom (Routing)
└── axios (HTTP)
```

---

## Performance Optimizations

```
┌────────────────────────────────────────────┐
│   PERFORMANCE TECHNIQUES USED               │
├────────────────────────────────────────────┤
│                                            │
│ 1. Memoization (useMemo)                   │
│    └─ Prevent expensive recalculations    │
│                                            │
│ 2. Real-time Updates (onSnapshot)          │
│    └─ Live data without polling            │
│                                            │
│ 3. Efficient Queries                       │
│    └─ Index-based searches                 │
│                                            │
│ 4. Component Lazy Loading                  │
│    └─ Load components as needed            │
│                                            │
│ 5. Responsive Images                       │
│    └─ Optimized for all devices            │
│                                            │
│ 6. Caching Patterns                        │
│    └─ Reduce server requests               │
│                                            │
│ 7. Skeleton Loaders                        │
│    └─ Better perceived performance         │
│                                            │
└────────────────────────────────────────────┘
```

---

This architecture supports scalability, maintainability, and provides excellent user experience!
