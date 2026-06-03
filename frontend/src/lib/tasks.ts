export type TaskStatus = 'ready' | 'generating' | 'review' | 'draft'

export type Task = {
  id: string
  title: string
  type: string
  status: TaskStatus
  owner: string
  updated: string
  progress: number
}

export const tasks: Task[] = [
  {
    id: 'spring-formal',
    title: 'Spring Formal 2026',
    type: 'Planning pack',
    status: 'ready',
    owner: 'Maya R.',
    updated: '2 hours ago',
    progress: 100,
  },
  {
    id: 'fall-fundraiser',
    title: 'Fall Fundraiser Gala',
    type: 'Planning pack',
    status: 'review',
    owner: 'Devin K.',
    updated: 'Yesterday',
    progress: 70,
  },
  {
    id: 'orientation-week',
    title: 'Orientation Week Mixer',
    type: 'Handoff doc',
    status: 'generating',
    owner: 'Sara L.',
    updated: 'Just now',
    progress: 40,
  },
  {
    id: 'guest-lecture',
    title: 'Guest Lecture Series',
    type: 'Document review',
    status: 'draft',
    owner: 'Tom W.',
    updated: '3 days ago',
    progress: 15,
  },
]

export const statusLabels: Record<TaskStatus, string> = {
  ready: 'Ready',
  generating: 'Generating',
  review: 'Needs review',
  draft: 'Draft',
}

export const statusStyles: Record<TaskStatus, string> = {
  ready: 'bg-primary/10 text-primary border-primary/20',
  generating: 'bg-accent text-accent-foreground border-primary/20',
  review: 'bg-amber-100 text-amber-700 border-amber-200',
  draft: 'bg-muted text-muted-foreground border-border',
}

export type ResultSection = {
  id: string
  title: string
  summary: string
  items: string[]
  locked?: boolean
}

export const sampleResult = {
  id: 'spring-formal',
  title: 'Spring Formal 2026',
  type: 'Planning pack',
  meta: {
    audience: 'Undergraduate members & guests (~180)',
    date: 'April 18, 2026',
    venue: 'Riverside Hall Ballroom',
    budget: '$6,500',
  },
  sections: [
    {
      id: 'overview',
      title: 'Event overview',
      summary:
        'A semi-formal evening event celebrating the academic year with dinner, awards, and dancing for members and their guests.',
      items: [
        'Goal: strengthen community and recognize member contributions',
        'Theme: "A Night Under the Stars" — navy and gold palette',
        'Format: 6:30 PM reception, 7:30 PM dinner, 9:00 PM program, 9:30 PM open floor',
      ],
    },
    {
      id: 'timeline',
      title: 'Planning timeline',
      summary: 'Eight-week countdown with weekly milestones and owners.',
      items: [
        'Week 8: Confirm venue contract and deposit',
        'Week 6: Finalize catering and headcount estimate',
        'Week 4: Open ticket sales and launch promo campaign',
        'Week 2: Confirm AV, decor, and volunteer roster',
      ],
    },
    {
      id: 'budget',
      title: 'Budget breakdown',
      summary: 'Line-item budget with buffer and projected ticket revenue.',
      items: [
        'Venue & AV: $2,400',
        'Catering (180 × $20): $3,600',
        'Decor & printing: $500',
        'Contingency (10%): $650',
      ],
      locked: true,
    },
    {
      id: 'roles',
      title: 'Roles & responsibilities',
      summary: 'Clear ownership across the committee with backup contacts.',
      items: [
        'Event lead: end-to-end coordination and vendor sign-off',
        'Finance: budget tracking, reimbursements, ticket reconciliation',
        'Logistics: venue, AV, day-of setup and teardown',
        'Marketing: promo timeline, socials, and RSVP tracking',
      ],
      locked: true,
    },
    {
      id: 'runsheet',
      title: 'Day-of run sheet',
      summary: 'Minute-by-minute schedule for the event team.',
      items: [
        '4:00 PM — Setup crew arrives, decor and signage',
        '6:00 PM — AV check, registration table live',
        '6:30 PM — Doors open, reception begins',
        '9:00 PM — Awards program, then open floor',
      ],
      locked: true,
    },
    {
      id: 'checklist',
      title: 'Pre-event checklist',
      summary: 'Final 48-hour checklist to confirm nothing slips.',
      items: [
        'Reconfirm headcount with caterer',
        'Print name tags and program cards',
        'Charge mics and test playlist',
        'Brief volunteers on roles and timing',
      ],
      locked: true,
    },
  ] satisfies ResultSection[],
}
