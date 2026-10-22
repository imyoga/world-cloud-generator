/**
 * Word Cloud Hardcoded Data
 * You can edit, add, or customize words and their weights (values) below.
 */

const WORD_CLOUD_DATA = [
  // Primary / High-frequency baby shower & celebration words
  { name: "Baby", value: 100 },
  { name: "Love", value: 92 },
  { name: "Little One", value: 85 },
  { name: "Joy", value: 80 },
  { name: "Blessings", value: 76 },
  { name: "Tiny Toes", value: 72 },
  { name: "Sweet Dreams", value: 68 },
  { name: "Cuddles", value: 65 },
  { name: "Miracle", value: 62 },
  { name: "Lullaby", value: 58 },
  { name: "Family", value: 55 },
  { name: "Smiles", value: 52 },
  { name: "Teddy Bear", value: 50 },
  { name: "Giggles", value: 48 },
  { name: "Nursery", value: 45 },
  { name: "Onesie", value: 44 },
  { name: "Diapers", value: 42 },
  { name: "Pacifier", value: 40 },
  { name: "Stroller", value: 38 },
  { name: "Booties", value: 36 },
  { name: "Blanket", value: 35 },
  { name: "Happiness", value: 34 },
  { name: "Cherish", value: 32 },
  { name: "Adorbs", value: 30 },
  { name: "Warmth", value: 29 },
  { name: "Cute", value: 28 },
  { name: "Precious", value: 27 },
  { name: "Kisses", value: 26 },
  { name: "Wonder", value: 25 },
  { name: "Laughter", value: 24 },
  { name: "Sweet Pea", value: 23 },
  { name: "Bundles of Joy", value: 22 },
  { name: "Baby Shower", value: 21 },
  { name: "Hope", value: 20 },
  { name: "Celebration", value: 20 },
  { name: "Parenthood", value: 19 },
  { name: "Rattle", value: 18 },
  { name: "Swaddle", value: 18 },
  { name: "Cradle", value: 17 },
  { name: "Sunshine", value: 16 },
  { name: "Darling", value: 15 },
  { name: "Gifts", value: 14 },
  { name: "Games", value: 14 },
  { name: "Angel", value: 13 },
  { name: "Welcome", value: 12 },
  { name: "Memories", value: 12 },
  { name: "Cheeks", value: 11 },
  { name: "Snuggles", value: 10 }
];

// Optional alternate datasets for instant theme switching
const THEMED_DATASETS = {
  babyShower: {
    title: "Baby Shower Celebration",
    data: WORD_CLOUD_DATA
  },
  techTrends: {
    title: "Tech & Innovation",
    data: [
      { name: "Artificial Intelligence", value: 98 },
      { name: "ECharts", value: 92 },
      { name: "JavaScript", value: 85 },
      { name: "Cloud", value: 78 },
      { name: "Machine Learning", value: 74 },
      { name: "React", value: 68 },
      { name: "Data Visualization", value: 65 },
      { name: "Open Source", value: 60 },
      { name: "Frontend", value: 55 },
      { name: "TypeScript", value: 52 },
      { name: "WebDev", value: 48 },
      { name: "FullStack", value: 45 },
      { name: "Analytics", value: 42 },
      { name: "Innovation", value: 40 },
      { name: "Performance", value: 36 },
      { name: "CSS3", value: 34 },
      { name: "HTML5", value: 32 },
      { name: "Scalability", value: 30 },
      { name: "Design", value: 28 },
      { name: "Automation", value: 25 },
      { name: "APIs", value: 24 },
      { name: "Mobile", value: 22 },
      { name: "UX/UI", value: 20 }
    ]
  },
  festive: {
    title: "Happy Moments & Wishes",
    data: [
      { name: "Celebration", value: 95 },
      { name: "Togetherness", value: 88 },
      { name: "Gratitude", value: 82 },
      { name: "Cheers", value: 75 },
      { name: "Friendship", value: 70 },
      { name: "Memories", value: 65 },
      { name: "Party", value: 60 },
      { name: "Magic", value: 55 },
      { name: "Good Vibes", value: 50 },
      { name: "Smile", value: 46 },
      { name: "Kindness", value: 42 },
      { name: "Peace", value: 38 },
      { name: "Warm Wishes", value: 35 },
      { name: "Sparkle", value: 32 },
      { name: "Delight", value: 28 }
    ]
  }
};
