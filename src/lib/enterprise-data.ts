export const courses = [
  { id: "c1", name: "Traditional Pottery Basics", craft: "Pottery", trainer: "Lakshmi Devi", duration: "6 weeks", seats: 24, level: "Beginner", language: "Tamil / English", sponsored: true, image: "🏺" },
  { id: "c2", name: "Rosewood Carving Mastery", craft: "Wood", trainer: "Karthik Achari", duration: "10 weeks", seats: 12, level: "Intermediate", language: "Kannada", sponsored: true, image: "🪵" },
  { id: "c3", name: "Lost-wax Bronze Casting", craft: "Metal", trainer: "Ramesh Sthapati", duration: "12 weeks", seats: 8, level: "Advanced", language: "Tamil", sponsored: true, image: "🔔" },
  { id: "c4", name: "Kanchipuram Handloom", craft: "Handloom", trainer: "Selvi Ammal", duration: "16 weeks", seats: 20, level: "Intermediate", language: "Tamil", sponsored: true, image: "🧵" },
  { id: "c5", name: "Kundan Jewellery Design", craft: "Jewellery", trainer: "Mohan Meenakari", duration: "8 weeks", seats: 15, level: "Intermediate", language: "Hindi", sponsored: false, image: "💎" },
  { id: "c6", name: "Soapstone Sculpting", craft: "Stone", trainer: "Prakash Shilpi", duration: "10 weeks", seats: 10, level: "Beginner", language: "Tamil", sponsored: true, image: "🗿" },
  { id: "c7", name: "Temple Bronzes & Iconography", craft: "Temple Arts", trainer: "Ramesh Sthapati", duration: "14 weeks", seats: 6, level: "Advanced", language: "Tamil / Sanskrit", sponsored: true, image: "🛕" },
  { id: "c8", name: "Muli Bamboo Weaving", craft: "Bamboo", trainer: "Meena Bora", duration: "5 weeks", seats: 30, level: "Beginner", language: "Assamese", sponsored: true, image: "🎋" },
  { id: "c9", name: "Warli & Madhubani Painting", craft: "Painting", trainer: "Arti Devi", duration: "6 weeks", seats: 25, level: "Beginner", language: "Hindi", sponsored: true, image: "🎨" },
  { id: "c10", name: "Chikankari Embroidery", craft: "Embroidery", trainer: "Ruksana Begum", duration: "8 weeks", seats: 22, level: "Beginner", language: "Urdu / Hindi", sponsored: true, image: "🪡" },
];

export const officers = [
  { id: "o1", name: "Dr. Arun Menon", role: "Sr. Craftmark Officer", queue: 4, completed: 128, pending: 7, status: "Available" as const },
  { id: "o2", name: "Kavitha Ramesh", role: "GI Verification Lead", queue: 2, completed: 98, pending: 5, status: "Available" as const },
  { id: "o3", name: "Rakesh Sharma", role: "Field Inspector", queue: 6, completed: 154, pending: 12, status: "Busy" as const },
  { id: "o4", name: "Sneha Ravi", role: "Export Certification", queue: 1, completed: 76, pending: 3, status: "Available" as const },
  { id: "o5", name: "Dr. Prakash Iyer", role: "Chief AI Reviewer", queue: 0, completed: 210, pending: 0, status: "Offline" as const },
];

export const certificateTypes = [
  { id: "auth", title: "Craft Authenticity", subtitle: "AI + physical verification", seal: "Authentic" },
  { id: "craftmark", title: "Craftmark", subtitle: "AIACA certified handmade", seal: "Craftmark" },
  { id: "gov", title: "Government Verification", subtitle: "Ministry of MSME approved", seal: "GoI" },
  { id: "twin", title: "Digital Twin", subtitle: "Blockchain-anchored 3D asset", seal: "Twin" },
  { id: "skill", title: "Skill Verification", subtitle: "NSDC-affiliated training", seal: "NSDC" },
  { id: "export", title: "Export Ready", subtitle: "DGFT & IEC compliant", seal: "Export" },
];

export const verificationTimeline = [
  { step: "Book Verification Slot", detail: "Choose officer & centre" },
  { step: "Visit Centre", detail: "Bring craft samples + Aadhaar" },
  { step: "Officer Inspection", detail: "Physical examination of handwork" },
  { step: "AI Verification", detail: "Photos re-scanned on-site" },
  { step: "Craftmark Approval", detail: "AIACA sign-off" },
  { step: "Government Approval", detail: "MSME endorsement" },
  { step: "Marketplace Listing", detail: "Goes live with badges" },
];

export const notifications = [
  { id: "n1", title: "AI verification passed", detail: "Warli terracotta vase — 98% authenticity", tag: "AI" as const, ts: "2 min ago" },
  { id: "n2", title: "Craftmark certificate ready", detail: "Download from your portal", tag: "Certificate" as const, ts: "1 hour ago" },
  { id: "n3", title: "Government approval", detail: "Officer Dr. Menon approved 3 items", tag: "Government" as const, ts: "3 hours ago" },
  { id: "n4", title: "Workshop reminder", detail: "Kanchipuram Handloom starts Monday 09:00", tag: "Training" as const, ts: "6 hours ago" },
  { id: "n5", title: "Kiosk appointment", detail: "Slot confirmed at Bhuj — Token B-042", tag: "Kiosk" as const, ts: "Yesterday" },
  { id: "n6", title: "NFC card generated", detail: "Ready to download from NFC Digital ID", tag: "ID" as const, ts: "Yesterday" },
];

export const aiAnalytics = {
  topCrafts: [
    { name: "Kanchipuram Silk", verified: 1420 },
    { name: "Warli Pottery", verified: 1180 },
    { name: "Rosewood Elephants", verified: 960 },
    { name: "Blue Pottery", verified: 840 },
    { name: "Bamboo Baskets", verified: 720 },
  ],
  stateGrowth: [
    { state: "Tamil Nadu", growth: 42 },
    { state: "Gujarat", growth: 38 },
    { state: "Rajasthan", growth: 35 },
    { state: "Assam", growth: 31 },
    { state: "Karnataka", growth: 28 },
    { state: "UP", growth: 24 },
  ],
  successRate: 97.4,
  fakesDetected: 312,
  activeArtisans: 48210,
};
