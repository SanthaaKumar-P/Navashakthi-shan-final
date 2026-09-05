export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
  rating: number;
  reviews: number;
  artisan: string;
  village: string;
  state: string;
  story: string;
  materials: string[];
  authenticity: number;
  craftmark: boolean;
  giCertified: boolean;
  digitalTwin: boolean;
  inStock: number;
}

export const categories = [
  { slug: "pottery", name: "Pottery", icon: "🏺", count: 342 },
  { slug: "wood", name: "Wood", icon: "🪵", count: 218 },
  { slug: "metal", name: "Metal", icon: "🔔", count: 176 },
  { slug: "bamboo", name: "Bamboo", icon: "🎋", count: 143 },
  { slug: "jewellery", name: "Jewellery", icon: "💎", count: 421 },
  { slug: "textiles", name: "Textiles", icon: "🧵", count: 587 },
  { slug: "stone", name: "Stone", icon: "🗿", count: 98 },
  { slug: "handloom", name: "Handloom", icon: "🧶", count: 312 },
  {
    slug: "instruments",
    name: "Musical Instruments",
    icon: "🪘",
    count: 67,
  },
] as const;

/**
 * NAVSHAKTHI demo craft catalogue
 *
 * Images are served from /public/craft-images/.
 *
 * IMPORTANT:
 * These are demonstration catalogue records.
 * Artisan names, GI status, authenticity scores and other verification
 * values should be replaced with verified records when real artisan data
 * is available.
 */
export const products: Product[] = [
  {
    id: "p1",
    name: "Traditional Brass Figurine Pair",
    category: "metal",
    price: 3499,
    mrp: 4299,
    image: "/craft-images/brass-doll/main.jpg",
    rating: 4.8,
    reviews: 42,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Tamil Nadu",
    state: "Tamil Nadu",
    story:
      "A handcrafted pair of traditional brass figurines, shaped and finished by skilled artisans using traditional metalworking techniques.",
    materials: ["Brass", "Traditional metalwork"],
    authenticity: 96,
    craftmark: true,
    giCertified: false,
    digitalTwin: true,
    inStock: 8,
  },

  {
    id: "p2",
    name: "Embroidered Handloom Saree",
    category: "textiles",
    price: 4299,
    mrp: 5499,
    image: "/craft-images/embroidered-saree/main.jpg",
    rating: 4.8,
    reviews: 37,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Tamil Nadu",
    state: "Tamil Nadu",
    story:
      "A vibrant handloom-style saree featuring colourful floral embroidery and traditional handcrafted detailing.",
    materials: ["Handloom textile", "Cotton thread", "Embroidery"],
    authenticity: 95,
    craftmark: true,
    giCertified: false,
    digitalTwin: true,
    inStock: 10,
  },

  {
    id: "p3",
    name: "Brass Fish Sculpture",
    category: "metal",
    price: 2899,
    mrp: 3699,
    image: "/craft-images/brass-fish/main.jpg",
    rating: 4.9,
    reviews: 51,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Tamil Nadu",
    state: "Tamil Nadu",
    story:
      "A decorative brass fish sculpture featuring detailed openwork and handcrafted metal finishing, designed as a distinctive heritage décor piece.",
    materials: ["Brass", "Handcrafted metalwork"],
    authenticity: 97,
    craftmark: true,
    giCertified: false,
    digitalTwin: true,
    inStock: 6,
  },

  {
    id: "p4",
    name: "Red Traditional Saree",
    category: "textiles",
    price: 5999,
    mrp: 7499,
    image: "/craft-images/red-silk-saree/main.jpg",
    rating: 4.9,
    reviews: 63,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Tamil Nadu",
    state: "Tamil Nadu",
    story:
      "A richly coloured traditional saree presented with detailed decorative motifs and a handcrafted textile aesthetic.",
    materials: [
      "Silk-style textile",
      "Decorative embroidery",
      "Textile threads",
    ],
    authenticity: 96,
    craftmark: true,
    giCertified: false,
    digitalTwin: true,
    inStock: 5,
  },

  {
    id: "p5",
    name: "Traditional Temple Jewellery Set",
    category: "jewellery",
    price: 8499,
    mrp: 10499,
    image: "/craft-images/temple-jewellery/main.jpg",
    rating: 4.9,
    reviews: 48,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Tamil Nadu",
    state: "Tamil Nadu",
    story:
      "A traditional jewellery ensemble inspired by temple jewellery aesthetics, featuring ornate forms and detailed handcrafted ornamentation.",
    materials: [
      "Metal alloy",
      "Decorative stones",
      "Traditional ornamentation",
    ],
    authenticity: 95,
    craftmark: true,
    giCertified: false,
    digitalTwin: true,
    inStock: 4,
  },

  {
    id: "p6",
    name: "Terracotta Water Pot",
    category: "pottery",
    price: 1899,
    mrp: 2399,
    image: "/craft-images/terracotta-water-pot/main.jpg",
    rating: 4.7,
    reviews: 34,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Tamil Nadu",
    state: "Tamil Nadu",
    story:
      "A traditional terracotta water vessel with a natural clay finish and handcrafted form, designed for functional and decorative use.",
    materials: ["Terracotta clay", "Natural clay finish"],
    authenticity: 96,
    craftmark: true,
    giCertified: false,
    digitalTwin: true,
    inStock: 9,
  },

  {
    id: "p7",
    name: "Handcrafted Terracotta Pot",
    category: "pottery",
    price: 1299,
    mrp: 1699,
    image: "/craft-images/terracotta-pot/main.jpg",
    rating: 4.7,
    reviews: 29,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Tamil Nadu",
    state: "Tamil Nadu",
    story:
      "A simple handcrafted terracotta pot showcasing the natural character of fired clay and traditional pottery craftsmanship.",
    materials: ["Terracotta clay"],
    authenticity: 95,
    craftmark: true,
    giCertified: false,
    digitalTwin: false,
    inStock: 14,
  },

  {
    id: "p8",
    name: "Handwoven Bamboo Lantern",
    category: "bamboo",
    price: 1799,
    mrp: 2299,
    image: "/craft-images/bamboo-lantern/main.jpg",
    rating: 4.8,
    reviews: 36,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Tamil Nadu",
    state: "Tamil Nadu",
    story:
      "A lightweight bamboo lantern created with interwoven natural strips, combining traditional craft techniques with contemporary home décor.",
    materials: ["Bamboo", "Natural fibre binding"],
    authenticity: 96,
    craftmark: true,
    giCertified: false,
    digitalTwin: true,
    inStock: 11,
  },

  {
    id: "p9",
    name: "Terracotta Pottery Set",
    category: "pottery",
    price: 2499,
    mrp: 3199,
    image: "/craft-images/terracotta-pottery-set/main.jpg",
    rating: 4.8,
    reviews: 31,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Tamil Nadu",
    state: "Tamil Nadu",
    story:
      "A coordinated terracotta pottery set featuring a handcrafted vessel and matching cups, showcasing the warmth and texture of fired clay.",
    materials: ["Terracotta clay", "Natural finish"],
    authenticity: 96,
    craftmark: true,
    giCertified: false,
    digitalTwin: true,
    inStock: 7,
  },

  {
    id: "p10",
    name: "Blue Pottery Storage Set",
    category: "pottery",
    price: 3299,
    mrp: 4199,
    image: "/craft-images/blue-pottery-set/main.jpg",
    rating: 4.8,
    reviews: 44,
    artisan: "NAVSHAKTHI Artisan Collective",
    village: "Jaipur",
    state: "Rajasthan",
    story:
      "A blue-and-white decorative pottery set with floral detailing, suitable for storage and display in traditional or contemporary interiors.",
    materials: ["Pottery", "Mineral-based pigments", "Glaze"],
    authenticity: 95,
    craftmark: true,
    giCertified: false,
    digitalTwin: false,
    inStock: 8,
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function related(id: string, category: string) {
  return products
    .filter((p) => p.category === category && p.id !== id)
    .slice(0, 4);
}

export const schemes = [
  {
    code: "vishwakarma",
    name: "PM Vishwakarma",
    tag: "Central",
    benefit:
      "Up to ₹3,00,000 collateral-free loans + toolkit incentive of ₹15,000",
    desc:
      "Recognises traditional artisans as Vishwakarmas with skill training, modern tools, digital transactions incentive, and marketing support.",
  },
  {
    code: "msme",
    name: "MSME Udyam",
    tag: "Central",
    benefit: "Priority sector lending, GST exemptions & subsidies",
    desc:
      "Universal registration for micro, small & medium enterprises with lifetime Udyam number.",
  },
  {
    code: "skill-india",
    name: "Skill India Mission",
    tag: "Central",
    benefit: "Free certified craft training + placement",
    desc:
      "NSDC-affiliated centres offering short-term certificate courses in traditional crafts.",
  },
  {
    code: "mudra",
    name: "PM Mudra Yojana",
    tag: "Central",
    benefit:
      "Up to ₹10 lakh business loans across Shishu/Kishor/Tarun tiers",
    desc:
      "Collateral-free credit for micro and non-corporate small enterprises.",
  },
  {
    code: "trifed",
    name: "TRIFED",
    tag: "Ministry",
    benefit: "Tribal India Fair procurement + Van Dhan Yojana",
    desc:
      "Marketing development for tribal products through Tribes India retail chain.",
  },
  {
    code: "craftmark",
    name: "Craftmark Certification",
    tag: "AIACA",
    benefit: "Authenticity hallmark for genuine handicrafts",
    desc:
      "Sector-specific standards verifying handmade origin — trusted by global buyers.",
  },
  {
    code: "aiaca",
    name: "AIACA",
    tag: "Council",
    benefit: "Advocacy, exports & design collaboration",
    desc:
      "All India Artisans and Craftworkers Welfare Association network access.",
  },
  {
    code: "startuptn",
    name: "StartupTN",
    tag: "State",
    benefit: "Grant-in-aid, incubation & Grand Finale access",
    desc:
      "Tamil Nadu's flagship startup mission enabling rural innovation and market linkage.",
  },
];

export const testimonials = [
  {
    name: "Lakshmi Devi",
    role: "Potter · Bhuj, Gujarat",
    quote:
      "For 40 years I sold my pots for ₹200 at the local mela. NAVSHAKTHI got me my first international order — ₹18,000 for a single vase.",
  },
  {
    name: "Anand Krishnan",
    role: "Design collector · Chennai",
    quote:
      "The AI authenticity score gave me confidence to buy heirloom textiles online. Every purchase feels traceable and meaningful.",
  },
  {
    name: "Meena Bora",
    role: "Bamboo weaver · Majuli",
    quote:
      "The Smart Kiosk helped me register, get my Vishwakarma card, and list my baskets — all in one afternoon in my village.",
  },
  {
    name: "Dr. Priya Iyer",
    role: "Cultural anthropologist",
    quote:
      "This is what dignified digitisation of heritage looks like. Culture preserved, artisans paid fairly, provenance verified.",
  },
];

export const impactStats = [
  {
    label: "Rural artisans",
    value: 7000000,
    suffix: "+",
  },
  {
    label: "Craft categories",
    value: 9,
    suffix: "",
  },
  {
    label: "Villages onboarded",
    value: 1240,
    suffix: "+",
  },
  {
    label: "AI-verified crafts",
    value: 84500,
    suffix: "+",
  },
];

export const teamMembers = [
  {
    name: "Aarav Kumaran",
    role: "Founder & Product",
    init: "AK",
  },
  {
    name: "Divya Rajesh",
    role: "AI & Digital Twin Lead",
    init: "DR",
  },
  {
    name: "Meera Balaji",
    role: "Design & Research",
    init: "MB",
  },
  {
    name: "Kishore Iyer",
    role: "Full-stack Engineering",
    init: "KI",
  },
  {
    name: "Sneha Prakash",
    role: "Field & Community",
    init: "SP",
  },
  {
    name: "Rohit Venkat",
    role: "Government Partnerships",
    init: "RV",
  },
];