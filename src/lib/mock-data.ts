import pottery from "@/assets/product-pottery.jpg";
import textile from "@/assets/product-textile.jpg";
import metal from "@/assets/product-metal.jpg";
import wood from "@/assets/product-wood.jpg";
import bamboo from "@/assets/product-bamboo.jpg";
import jewellery from "@/assets/product-jewellery.jpg";
import stone from "@/assets/product-stone.jpg";

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
  { slug: "instruments", name: "Musical Instruments", icon: "🪘", count: 67 },
] as const;

export const products: Product[] = [
  {
    id: "p1",
    name: "Warli Terracotta Ceremonial Vase",
    category: "pottery",
    price: 2499, mrp: 3200,
    image: pottery, rating: 4.9, reviews: 128,
    artisan: "Lakshmi Devi", village: "Bhuj", state: "Gujarat",
    story: "Hand-thrown on a stone wheel and painted with tribal Warli motifs, this vessel carries motifs passed through six generations.",
    materials: ["River clay", "Natural pigments", "Rice husk fired"],
    authenticity: 98, craftmark: true, giCertified: true, digitalTwin: true, inStock: 12,
  },
  {
    id: "p2",
    name: "Kanchipuram Silk Zari Saree",
    category: "textiles",
    price: 18999, mrp: 24000,
    image: textile, rating: 5.0, reviews: 342,
    artisan: "Selvi Ammal", village: "Kanchipuram", state: "Tamil Nadu",
    story: "Woven on a pit-loom over 21 days with pure mulberry silk and 22-carat gold zari borders.",
    materials: ["Mulberry silk", "Gold zari", "Vegetable dyes"],
    authenticity: 99, craftmark: true, giCertified: true, digitalTwin: true, inStock: 3,
  },
  {
    id: "p3",
    name: "Peacock Brass Diya Lamp",
    category: "metal",
    price: 3499, mrp: 4200,
    image: metal, rating: 4.8, reviews: 89,
    artisan: "Ramesh Sthapati", village: "Swamimalai", state: "Tamil Nadu",
    story: "Cast using the ancient lost-wax method by a family of Sthapati sculptors devoted to temple bronzes.",
    materials: ["Panchaloha brass", "Hand-polished"],
    authenticity: 97, craftmark: true, giCertified: false, digitalTwin: true, inStock: 8,
  },
  {
    id: "p4",
    name: "Rosewood Blessing Elephant",
    category: "wood",
    price: 4200, mrp: 5500,
    image: wood, rating: 4.7, reviews: 64,
    artisan: "Karthik Achari", village: "Channapatna", state: "Karnataka",
    story: "Carved from a single block of sustainably sourced rosewood over 14 days with traditional chisels.",
    materials: ["Rosewood", "Beeswax finish"],
    authenticity: 95, craftmark: true, giCertified: false, digitalTwin: false, inStock: 15,
  },
  {
    id: "p5",
    name: "Assamese Bamboo Harvest Basket",
    category: "bamboo",
    price: 899, mrp: 1200,
    image: bamboo, rating: 4.6, reviews: 41,
    artisan: "Meena Bora", village: "Majuli", state: "Assam",
    story: "Woven on the river island of Majuli using bamboo harvested at the winter moon, following the Mishing tribal method.",
    materials: ["Muli bamboo", "Cane binding"],
    authenticity: 96, craftmark: true, giCertified: true, digitalTwin: false, inStock: 22,
  },
  {
    id: "p6",
    name: "Kundan Emerald Rani Haar",
    category: "jewellery",
    price: 42500, mrp: 56000,
    image: jewellery, rating: 4.9, reviews: 156,
    artisan: "Mohan Meenakari", village: "Jaipur", state: "Rajasthan",
    story: "Set in 22K gold with uncut Kundan and cabochon emeralds, finished with fresh-water pearls.",
    materials: ["22K gold", "Kundan", "Emerald", "Pearls"],
    authenticity: 99, craftmark: true, giCertified: true, digitalTwin: true, inStock: 2,
  },
  {
    id: "p7",
    name: "Soapstone Ganesha Sculpture",
    category: "stone",
    price: 3799, mrp: 4800,
    image: stone, rating: 4.8, reviews: 73,
    artisan: "Prakash Shilpi", village: "Mahabalipuram", state: "Tamil Nadu",
    story: "Sculpted from a single block of Cudappah soapstone by an eighth-generation Shilpi from the temple town.",
    materials: ["Soapstone", "Traditional chisels"],
    authenticity: 97, craftmark: true, giCertified: true, digitalTwin: true, inStock: 6,
  },
  {
    id: "p8",
    name: "Blue Pottery Serving Set",
    category: "pottery",
    price: 3200, mrp: 4000,
    image: pottery, rating: 4.7, reviews: 92,
    artisan: "Anwar Ali", village: "Jaipur", state: "Rajasthan",
    story: "Persian-inspired Jaipur blue pottery — glazed without clay, fired at low temperatures for a translucent finish.",
    materials: ["Quartz", "Fuller's earth", "Cobalt oxide"],
    authenticity: 96, craftmark: true, giCertified: true, digitalTwin: false, inStock: 9,
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function related(id: string, category: string) {
  return products.filter((p) => p.category === category && p.id !== id).slice(0, 4);
}

export const schemes = [
  { code: "vishwakarma", name: "PM Vishwakarma", tag: "Central", benefit: "Up to ₹3,00,000 collateral-free loans + toolkit incentive of ₹15,000", desc: "Recognises traditional artisans as Vishwakarmas with skill training, modern tools, digital transactions incentive, and marketing support." },
  { code: "msme", name: "MSME Udyam", tag: "Central", benefit: "Priority sector lending, GST exemptions & subsidies", desc: "Universal registration for micro, small & medium enterprises with lifetime Udyam number." },
  { code: "skill-india", name: "Skill India Mission", tag: "Central", benefit: "Free certified craft training + placement", desc: "NSDC-affiliated centres offering short-term certificate courses in traditional crafts." },
  { code: "mudra", name: "PM Mudra Yojana", tag: "Central", benefit: "Up to ₹10 lakh business loans across Shishu/Kishor/Tarun tiers", desc: "Collateral-free credit for micro and non-corporate small enterprises." },
  { code: "trifed", name: "TRIFED", tag: "Ministry", benefit: "Tribal India Fair procurement + Van Dhan Yojana", desc: "Marketing development for tribal products through Tribes India retail chain." },
  { code: "craftmark", name: "Craftmark Certification", tag: "AIACA", benefit: "Authenticity hallmark for genuine handicrafts", desc: "Sector-specific standards verifying handmade origin — trusted by global buyers." },
  { code: "aiaca", name: "AIACA", tag: "Council", benefit: "Advocacy, exports & design collaboration", desc: "All India Artisans and Craftworkers Welfare Association network access." },
  { code: "startuptn", name: "StartupTN", tag: "State", benefit: "Grant-in-aid, incubation & Grand Finale access", desc: "Tamil Nadu's flagship startup mission enabling rural innovation and market linkage." },
];

export const testimonials = [
  { name: "Lakshmi Devi", role: "Potter · Bhuj, Gujarat", quote: "For 40 years I sold my pots for ₹200 at the local mela. NAVSHAKTHI got me my first international order — ₹18,000 for a single vase.", },
  { name: "Anand Krishnan", role: "Design collector · Chennai", quote: "The AI authenticity score gave me confidence to buy heirloom textiles online. Every purchase feels traceable and meaningful.", },
  { name: "Meena Bora", role: "Bamboo weaver · Majuli", quote: "The Smart Kiosk helped me register, get my Vishwakarma card, and list my baskets — all in one afternoon in my village.", },
  { name: "Dr. Priya Iyer", role: "Cultural anthropologist", quote: "This is what dignified digitisation of heritage looks like. Culture preserved, artisans paid fairly, provenance verified.", },
];

export const impactStats = [
  { label: "Rural artisans", value: 7000000, suffix: "+", },
  { label: "Craft categories", value: 9, suffix: "" },
  { label: "Villages onboarded", value: 1240, suffix: "+" },
  { label: "AI-verified crafts", value: 84500, suffix: "+" },
];

export const teamMembers = [
  { name: "Aarav Kumaran", role: "Founder & Product", init: "AK" },
  { name: "Divya Rajesh", role: "AI & Digital Twin Lead", init: "DR" },
  { name: "Meera Balaji", role: "Design & Research", init: "MB" },
  { name: "Kishore Iyer", role: "Full-stack Engineering", init: "KI" },
  { name: "Sneha Prakash", role: "Field & Community", init: "SP" },
  { name: "Rohit Venkat", role: "Government Partnerships", init: "RV" },
];
