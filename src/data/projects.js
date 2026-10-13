export const projects = [
  {
    slug: "food-photography",
    hidden: true,
    brand: "Food Photography & Art Direction",
    title: "Studio & recipe photography",
    category: "Photo Art Direction",
    tileColor: "#0F3D2E",
    tileTextColor: "#B7F5EC",
    tileImage: "/projects/foodphoto/gnocchi.jpg",
    description:
      "Selected recipe and product photography shot under my art direction, styling, lighting and composition built for both editorial warmth and e-commerce clarity.",
    images: [
      "/projects/foodphoto/gnocchi.jpg",
      "/projects/foodphoto/thai-curry.jpg",
      "/projects/foodphoto/thai-bbq-chicken.jpg",
      "/projects/foodphoto/spiced-chicken.jpg",
      "/projects/foodphoto/HolidayDinner.jpg",
    ],
  },
  {
    slug: "marketing-email",
    hidden: true,
    brand: "Marketing Email",
    title: "CRM & lifecycle design",
    category: "Marketing Design",
    tileColor: "#B7F5EC",
    tileTextColor: "#0F3D2E",
    tileImage: "/projects/email/Justuno_Email_Journey_RTC_Email_EN.jpg",
    description:
      "CRM and lifecycle email design, onboarding journeys and retention sends built to carry brand voice and visual identity all the way into the inbox.",
    images: [
      "/projects/email/Justuno_Email_Journey_RTC_Email_EN.jpg",
      "/projects/email/C2_02_10_2026_CLIENTS.jpg",
    ],
  },
]

export const getProject = (slug) => projects.find((p) => p.slug === slug)
