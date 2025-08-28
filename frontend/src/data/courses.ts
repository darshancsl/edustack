export type Lesson = { id: string; title: string; duration?: string };
export type Section = { id: string; title: string; items: Lesson[] };
export type Course = {
  slug: string;
  title: string;
  subtitle?: string;
  heroImage: string;
  price: number; // base price
  salePrice?: number; // optional sale
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  language?: string;
  lastUpdated?: string; // ISO date or display text
  description: string; // long description (markdown-ish or plain text)
  whatYouWillLearn: string[]; // bullets
  toc: Section[]; // table of contents
};

export const COURSES: Course[] = [
  {
    slug: 'equipment-and-machinery',
    title: 'Equipment and Machinery',
    subtitle: 'Hands‑on training on industrial equipment usage and safety best practices.',
    heroImage: '/media/course-1.jpg',
    price: 79.99,
    salePrice: 49.99,
    level: 'Beginner',
    language: 'English',
    lastUpdated: '2025-08-01',
    description:
      'Master the fundamentals of operating industrial equipment safely. Learn inspection routines, maintenance basics, and hazard identification using real‑world scenarios. This course is designed for new operators and cross‑functional teams who interact with machinery on the shop floor.',
    whatYouWillLearn: [
      'Apply safety checklists before operating equipment',
      'Identify common mechanical hazards and mitigations',
      'Perform basic maintenance under supervision',
      'Document incidents and near‑misses effectively',
    ],
    toc: [
      {
        id: 's1',
        title: 'Getting Started',
        items: [
          { id: 'l1', title: 'Course Overview', duration: '6m' },
          { id: 'l2', title: 'Safety Mindset', duration: '10m' },
        ],
      },
      {
        id: 's2',
        title: 'Equipment Basics',
        items: [
          { id: 'l3', title: 'Components & Controls', duration: '18m' },
          { id: 'l4', title: 'Daily Inspections', duration: '14m' },
        ],
      },
      {
        id: 's3',
        title: 'Operating Safely',
        items: [
          { id: 'l5', title: 'Common Hazards', duration: '15m' },
          { id: 'l6', title: 'Emergency Procedures', duration: '11m' },
        ],
      },
    ],
  },
  {
    slug: 'safety-compliance',
    title: 'Safety Compliance',
    subtitle: 'Understand audits, protocols, and frameworks via real cases.',
    heroImage: '/media/course-2.jpg',
    price: 99.99,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: '2025-07-10',
    description:
      'Navigate safety compliance with confidence. We cover policy creation, audit preparation, and corrective actions to pass with ease.',
    whatYouWillLearn: [
      'Map org policies to standards',
      'Prepare and pass audits',
      'Create corrective action plans',
    ],
    toc: [
      {
        id: 's1',
        title: 'Frameworks Overview',
        items: [{ id: 'l1', title: 'ISO/OSHA Basics', duration: '12m' }],
      },
      {
        id: 's2',
        title: 'Audit Prep',
        items: [{ id: 'l2', title: 'Artifacts & Evidence', duration: '20m' }],
      },
    ],
  },
  {
    slug: 'first-aid-cpr',
    title: 'Standard First Aid/CPR',
    subtitle: 'Be prepared in emergencies with practical first aid and CPR.',
    heroImage: '/media/course-3.jpg',
    price: 59.99,
    level: 'Beginner',
    language: 'English',
    lastUpdated: '2025-06-21',
    description:
      'Learn essential first aid and CPR skills following up‑to‑date guidelines. Hands‑on demos included.',
    whatYouWillLearn: [
      'Assess the scene and call for help',
      'Perform adult CPR and use an AED',
      'Treat bleeding, burns, and fractures',
    ],
    toc: [
      { id: 's1', title: 'Basics', items: [{ id: 'l1', title: 'DRSABC', duration: '8m' }] },
      { id: 's2', title: 'Adult CPR', items: [{ id: 'l2', title: 'CPR Steps', duration: '16m' }] },
    ],
  },
];

export const getCourseBySlug = (slug: string) => COURSES.find((c) => c.slug === slug);
