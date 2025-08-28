require("dotenv").config();
const { connect } = require("mongoose");
const Course = require("../src/models/Course");

const seed = async () => {
  await connect(process.env.MONGO_URI, { autoIndex: true });

  const data = [
    {
      slug: "equipment-and-machinery",
      title: "Equipment and Machinery",
      subtitle:
        "Hands‑on training on industrial equipment usage and safety best practices.",
      heroImage: "/media/course-1.jpg",
      price: 79.99,
      salePrice: 49.99,
      level: "Beginner",
      language: "English",
      lastUpdated: new Date("2025-08-01"),
      description:
        "Master the fundamentals of operating industrial equipment safely. Learn inspection routines, maintenance basics, and hazard identification using real‑world scenarios.",
      whatYouWillLearn: [
        "Apply safety checklists before operating equipment",
        "Identify common mechanical hazards and mitigations",
        "Perform basic maintenance under supervision",
        "Document incidents and near‑misses effectively",
      ],
      accessPeriod: 'lifetime',
      toc: [
        {
          id: "s1",
          title: "Getting Started",
          items: [
            { id: "l1", title: "Course Overview", duration: "6m" },
            { id: "l2", title: "Safety Mindset", duration: "10m" },
          ],
        },
        {
          id: "s2",
          title: "Equipment Basics",
          items: [
            { id: "l3", title: "Components & Controls", duration: "18m" },
            { id: "l4", title: "Daily Inspections", duration: "14m" },
          ],
        },
      ],
    },
    {
      slug: "safety-compliance",
      title: "Safety Compliance",
      subtitle: "Understand audits, protocols, and frameworks via real cases.",
      heroImage: "/media/course-2.jpg",
      price: 99.99,
      level: "Intermediate",
      language: "English",
      lastUpdated: new Date("2025-07-10"),
      description:
        "Navigate safety compliance with confidence. We cover policy creation, audit preparation, and corrective actions to pass with ease.",
      whatYouWillLearn: [
        "Map org policies to standards",
        "Prepare and pass audits",
        "Create corrective action plans",
      ],
      accessPeriod: '60d',
      toc: [
        {
          id: "s1",
          title: "Frameworks Overview",
          items: [{ id: "l1", title: "ISO/OSHA Basics", duration: "12m" }],
        },
        {
          id: "s2",
          title: "Audit Prep",
          items: [{ id: "l2", title: "Artifacts & Evidence", duration: "20m" }],
        },
      ],
    },
    {
      slug: "first-aid-cpr",
      title: "Standard First Aid/CPR",
      subtitle: "Be prepared in emergencies with practical first aid and CPR.",
      heroImage: "/media/course-3.jpg",
      price: 59.99,
      level: "Beginner",
      language: "English",
      lastUpdated: new Date("2025-06-21"),
      description:
        "Learn essential first aid and CPR skills following up‑to‑date guidelines. Hands‑on demos included.",
      whatYouWillLearn: [
        "Assess the scene and call for help",
        "Perform adult CPR and use an AED",
        "Treat bleeding, burns, and fractures",
      ],
      accessPeriod: '30d',
      toc: [
        {
          id: "s1",
          title: "Basics",
          items: [{ id: "l1", title: "DRSABC", duration: "8m" }],
        },
        {
          id: "s2",
          title: "Adult CPR",
          items: [{ id: "l2", title: "CPR Steps", duration: "16m" }],
        },
      ],
    },
  ];

  // Upsert by slug so you can run the seeder multiple times safely
  for (const c of data) {
    await Course.updateOne({ slug: c.slug }, { $set: c }, { upsert: true });
  }

  console.log(
    "Seeded courses:",
    data.map((d) => d.slug)
  );
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
