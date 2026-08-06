import bcrypt from "bcryptjs";
import type {
  DB, User, MembershipPlan, Membership, Payment, Invoice, Attendance, GymClass, ClassRoom, Booking,
  Exercise, WorkoutPlan, WorkoutLog, DietPlan, MealLog, DailyStat, Measurement, Equipment, InventoryItem,
  Product, Order, Lead, Notification, Message, Ticket, Coupon, Review, Referral, Achievement, Challenge,
  AutomationLog, AuditEntry, Settings, LeadSource, LeadStatus, NotifChannel,
} from "./types";

const DAY = 86400000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => iso(new Date(Date.now() - n * DAY));
const daysAhead = (n: number) => iso(new Date(Date.now() + n * DAY));
const tsAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();
const tsAhead = (n: number) => new Date(Date.now() + n * DAY).toISOString();

let counter = 0;
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

// Deterministic PRNG so seeded demo data is stable between reseeds.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260601);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const between = (min: number, max: number) => Math.round(min + rnd() * (max - min));

const AVATAR_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444", "#14b8a6", "#f97316", "#6366f1"];

/* ------------------------------ Plans ------------------------------ */

const plans: MembershipPlan[] = [
  {
    id: "plan_student", name: "Student Pass", slug: "student", tier: "student", price: 1499, durationMonths: 1, tagline: "For full-time students",
    description: "Full gym access at a student-friendly price. Valid with a valid student ID.",
    features: ["All gym floors & cardio deck", "Locker + towel service", "1 group class / day", "Mobile check-in", "Fitness dashboard"],
    excluded: ["PT sessions", "Body scan", "Nutrition plan"],
  },
  {
    id: "plan_monthly", name: "Monthly", slug: "monthly", tier: "monthly", price: 2499, originalPrice: 2999, durationMonths: 1, popular: true, tagline: "Flexible. No lock-in.",
    description: "The flexible plan. Full club access with one group class per day and zero commitment.",
    features: ["All gym floors & cardio deck", "Locker + towel service", "1 group class / day", "Mobile check-in", "Fitness dashboard", "Guest pass ×2"],
    excluded: ["PT sessions", "Body scan"],
  },
  {
    id: "plan_quarterly", name: "Quarterly", slug: "quarterly", tier: "quarterly", price: 6699, originalPrice: 7497, durationMonths: 3, tagline: "3 months of momentum",
    description: "Best value for short-term goals. Save 10% vs monthly and unlock unlimited group classes.",
    features: ["Everything in Monthly", "Unlimited group classes", "1 PT assessment", "Body scan (1)", "Freeze up to 7 days", "2 guest passes / month"],
    excluded: ["Dedicated PT"],
  },
  {
    id: "plan_half_yearly", name: "Half-Yearly", slug: "half-yearly", tier: "half_yearly", price: 11999, originalPrice: 14994, durationMonths: 6, tagline: "Save 20%",
    description: "Six months to build real results with unlimited classes and quarterly body scans.",
    features: ["Everything in Quarterly", "Quarterly body scans", "1 PT session / month", "Freeze up to 14 days", "Priority class booking", "Diet snapshot"],
    excluded: ["Dedicated trainer"],
  },
  {
    id: "plan_yearly", name: "Yearly", slug: "yearly", tier: "yearly", price: 20999, originalPrice: 29988, durationMonths: 12, tagline: "Save 30% · most popular",
    description: "A full year of unlimited training, quarterly scans and monthly PT sessions. Your transformation runway.",
    features: ["Everything in Half-Yearly", "1 PT session / month", "Quarterly body scan", "Nutrition plan (3-month blocks)", "Freeze up to 30 days", "5% off shop", "Annual health check"],
    excluded: [],
  },
  {
    id: "plan_premium", name: "Premium", slug: "premium", tier: "premium", price: 34999, originalPrice: 40000, durationMonths: 12, gold: true, tagline: "Gold standard",
    description: "Semi-private training with a dedicated coach, bespoke nutrition and monthly scans.",
    features: ["Everything in Yearly", "Dedicated coach", "Weekly PT sessions", "Bespoke diet plan", "Monthly body scan", "Priority floor access", "Recovery suite", "10% off shop"],
    excluded: [],
  },
  {
    id: "plan_elite", name: "Elite", slug: "elite", tier: "elite", price: 59999, originalPrice: 72000, durationMonths: 12, gold: true, tagline: "White-glove coaching",
    description: "Fully guided transformation — personal coach, physio check-ins, sleep & recovery coaching, 24×7 gym access.",
    features: ["Everything in Premium", "24×7 club access", "Weekly 1:1 with coach + physio", "AI-assisted programming", "Priority PT bookings", "Quarterly blood-work coordination", "Airport-lounge style lounge access"],
    excluded: [],
  },
  {
    id: "plan_family", name: "Family", slug: "family", tier: "family", price: 3999, durationMonths: 1, tagline: "Up to 4 members",
    description: "Cover the whole household on one plan. Two members can train simultaneously.",
    features: ["4 member profiles", "2 simultaneous entries", "All gym floors", "2 group classes / day", "Family locker", "Kids activity corner"],
    excluded: [],
  },
];

/* --------------------------- Exercise DB --------------------------- */

const exercises: Exercise[] = [
  { id: "ex_bench", name: "Barbell Bench Press", category: "Strength", muscleGroup: "Chest", equipment: "Barbell", met: 5.5, instructions: "Lie on bench, press bar from mid-chest to lockout." },
  { id: "ex_incline", name: "Incline Dumbbell Press", category: "Strength", muscleGroup: "Chest", equipment: "Dumbbells", met: 5.0, instructions: "Press dumbbells from upper-chest position on an incline bench." },
  { id: "ex_pushup", name: "Push-Ups", category: "Bodyweight", muscleGroup: "Chest", equipment: "Bodyweight", met: 3.8, instructions: "Full body in a straight line, lower chest to floor, press up." },
  { id: "ex_squat", name: "Barbell Back Squat", category: "Strength", muscleGroup: "Quads", equipment: "Barbell", met: 6.0, instructions: "Bar on upper back, squat to parallel, drive up through heels." },
  { id: "ex_lunge", name: "Walking Lunges", category: "Strength", muscleGroup: "Quads", equipment: "Dumbbells", met: 4.0, instructions: "Step forward into a deep lunge, alternate legs." },
  { id: "ex_legpress", name: "Leg Press", category: "Strength", muscleGroup: "Quads", equipment: "Machine", met: 5.0, instructions: "Push platform away without locking knees." },
  { id: "ex_deadlift", name: "Conventional Deadlift", category: "Strength", muscleGroup: "Back", equipment: "Barbell", met: 6.5, instructions: "Hip-hinge, keep bar close, stand tall with straight back." },
  { id: "ex_rdl", name: "Romanian Deadlift", category: "Strength", muscleGroup: "Hamstrings", equipment: "Barbell", met: 5.0, instructions: "Hinge at hips, slide bar down legs with slight knee bend." },
  { id: "ex_pulldown", name: "Lat Pulldown", category: "Strength", muscleGroup: "Back", equipment: "Cable", met: 4.5, instructions: "Pull bar to upper chest, squeeze lats." },
  { id: "ex_row", name: "Barbell Bent-Over Row", category: "Strength", muscleGroup: "Back", equipment: "Barbell", met: 5.0, instructions: "Hinge forward, row bar to lower ribs." },
  { id: "ex_ohp", name: "Overhead Press", category: "Strength", muscleGroup: "Shoulders", equipment: "Barbell", met: 4.5, instructions: "Press bar from shoulders to overhead, brace core." },
  { id: "ex_latraise", name: "Lateral Raises", category: "Strength", muscleGroup: "Shoulders", equipment: "Dumbbells", met: 3.0, instructions: "Raise dumbbells to shoulder height with slight elbow bend." },
  { id: "ex_curl", name: "Dumbbell Bicep Curl", category: "Strength", muscleGroup: "Biceps", equipment: "Dumbbells", met: 3.0, instructions: "Curl dumbbells with controlled tempo, squeeze at top." },
  { id: "ex_tricep", name: "Triceps Rope Pushdown", category: "Strength", muscleGroup: "Triceps", equipment: "Cable", met: 3.0, instructions: "Press rope down, extend elbows fully." },
  { id: "ex_plank", name: "Plank", category: "Core", muscleGroup: "Core", equipment: "Bodyweight", met: 3.3, instructions: "Hold straight-line plank, brace abs, breathe." },
  { id: "ex_crunch", name: "Cable Crunch", category: "Core", muscleGroup: "Core", equipment: "Cable", met: 3.0, instructions: "Crunch cable down, curl spine, squeeze abs." },
  { id: "ex_russian", name: "Russian Twists", category: "Core", muscleGroup: "Core", equipment: "Bodyweight", met: 3.0, instructions: "Rotate torso side to side, feet hovered." },
  { id: "ex_tread", name: "Treadmill Run", category: "Cardio", muscleGroup: "Full Body", equipment: "Treadmill", met: 9.8, instructions: "Run at moderate-to-high intensity, control pace." },
  { id: "ex_bike", name: "Stationary Bike", category: "Cardio", muscleGroup: "Quads", equipment: "Bike", met: 7.0, instructions: "Sustained cadence with steady resistance." },
  { id: "ex_rower", name: "Rowing Machine", category: "Cardio", muscleGroup: "Back", equipment: "Rower", met: 8.5, instructions: "Drive with legs, then arms; reverse on return." },
  { id: "ex_burpee", name: "Burpees", category: "HIIT", muscleGroup: "Full Body", equipment: "Bodyweight", met: 10.0, instructions: "Squat, kick back, push-up, jump." },
  { id: "ex_mountain", name: "Mountain Climbers", category: "HIIT", muscleGroup: "Core", equipment: "Bodyweight", met: 8.0, instructions: "Drive knees to chest in plank at pace." },
  { id: "ex_jumprope", name: "Jump Rope", category: "Cardio", muscleGroup: "Calves", equipment: "Rope", met: 11.0, instructions: "Bounce on balls of feet, spin rope fast." },
  { id: "ex_kbswing", name: "Kettlebell Swing", category: "Strength", muscleGroup: "Hips", equipment: "Kettlebell", met: 7.5, instructions: "Hip-hinge, snap kettlebell to chest height." },
  { id: "ex_boxjump", name: "Box Jumps", category: "Plyometrics", muscleGroup: "Quads", equipment: "Box", met: 10.0, instructions: "Explode onto box, land soft, step down." },
  { id: "ex_lungesplit", name: "Bulgarian Split Squat", category: "Strength", muscleGroup: "Quads", equipment: "Dumbbells", met: 5.0, instructions: "Rear foot elevated, lower into lunge, drive up." },
  { id: "ex_facepull", name: "Face Pulls", category: "Strength", muscleGroup: "Rear Delts", equipment: "Cable", met: 3.0, instructions: "Pull rope to face, open hands, squeeze rear delts." },
  { id: "ex_hipthrust", name: "Barbell Hip Thrust", category: "Strength", muscleGroup: "Glutes", equipment: "Barbell", met: 5.5, instructions: "Shoulders on bench, thrust hips to full extension." },
  { id: "ex_yoga_down", name: "Downward Dog", category: "Yoga", muscleGroup: "Full Body", equipment: "Mat", met: 2.5, instructions: "Inverted V, push chest back, heels toward floor." },
  { id: "ex_yoga_warrior", name: "Warrior II", category: "Yoga", muscleGroup: "Legs", equipment: "Mat", met: 2.5, instructions: "Lunge wide, arms parallel, gaze over front hand." },
  { id: "ex_stretch_ham", name: "Hamstring Stretch", category: "Recovery", muscleGroup: "Hamstrings", equipment: "Mat", met: 1.5, instructions: "Fold forward, hinge at hips, keep spine long." },
  { id: "ex_foam", name: "Foam Roller — Quads", category: "Recovery", muscleGroup: "Quads", equipment: "Foam Roller", met: 1.5, instructions: "Roll along thigh length, pause on tight spots." },
];

/* ------------------------------ Rooms ------------------------------ */

const rooms: ClassRoom[] = [
  { id: "room_main", name: "Main Floor", capacity: 40 },
  { id: "room_studio1", name: "Studio 1 — Mind & Body", capacity: 24 },
  { id: "room_studio2", name: "Studio 2 — HIIT Deck", capacity: 30 },
];

/* ------------------------------ Users ------------------------------ */

function makeUser(id: string, name: string, email: string | undefined, phone: string, role: User["role"], extra: Partial<User> = {}): User {
  return {
    id, name, email, phone, passwordHash: hash("demo123"), role, verified: true, active: true,
    avatarColor: pick(AVATAR_COLORS), createdAt: tsAgo(between(200, 500)), updatedAt: tsAgo(between(0, 5)),
    ...extra,
  };
}

const admin = makeUser("usr_admin", "Aarav Menon", "admin@nextgenfitness.in", "9876543210", "admin", { twoFA: true });

const receptionists = [
  makeUser("usr_recep_1", "Priya Sharma", "priya@nextgenfitness.in", "9876543211", "receptionist", { occupation: "Front Desk Manager" }),
  makeUser("usr_recep_2", "Rohan Iyer", "rohan@nextgenfitness.in", "9876543212", "receptionist", { occupation: "Front Desk Executive" }),
];

const trainers = [
  makeUser("usr_trainer_1", "Karan Malhotra", "karan@nextgenfitness.in", "9876543221", "trainer", {
    specialization: ["Strength & Conditioning", "Hypertrophy"], certifications: ["ACE-CPT", "Precision Nutrition L1"], yearsExp: 9, rating: 4.9, reviewCount: 214,
    bio: "Former national-level powerlifter. I build strength athletes and complete beginners alike with science-backed programming.",
    languages: ["English", "Hindi", "Punjabi"], hourlyRate: 1200,
  }),
  makeUser("usr_trainer_2", "Ananya Rao", "ananya@nextgenfitness.in", "9876543222", "trainer", {
    specialization: ["Yoga", "Mobility", "Pilates"], certifications: ["RYT-500", "STOTT Pilates"], yearsExp: 8, rating: 4.9, reviewCount: 187,
    bio: "Movement-first coach. I help desk-bound professionals unlock mobility, posture and a pain-free practice.",
    languages: ["English", "Kannada", "Tamil"], hourlyRate: 1000,
  }),
  makeUser("usr_trainer_3", "Dev Patel", "dev@nextgenfitness.in", "9876543223", "trainer", {
    specialization: ["HIIT", "Functional Training", "Weight Loss"], certifications: ["NASM-CPT", "CrossFit L2"], yearsExp: 6, rating: 4.8, reviewCount: 156,
    bio: "I turn high-intensity workouts into something you'll actually look forward to. Fat-loss specialist.",
    languages: ["English", "Gujarati", "Hindi"], hourlyRate: 1100,
  }),
  makeUser("usr_trainer_4", "Meera Krishnan", "meera@nextgenfitness.in", "9876543224", "trainer", {
    specialization: ["Nutrition", "Body Transformation"], certifications: ["ACE-CPT", "Sports Nutrition MSc"], yearsExp: 10, rating: 5.0, reviewCount: 231,
    bio: "Nutrition-first coach. I pair evidence-based dieting with strength training for sustainable transformations.",
    languages: ["English", "Malayalam", "Hindi"], hourlyRate: 1300,
  }),
  makeUser("usr_trainer_5", "Arjun Nair", "arjun@nextgenfitness.in", "9876543225", "trainer", {
    specialization: ["Boxing", "Combat Conditioning"], certifications: ["ISSA-CPT", "Boxing Coach L2"], yearsExp: 7, rating: 4.7, reviewCount: 98,
    bio: "Ex-amateur boxer. Conditioning, footwork and pad-work that doubles as the best cardio you've ever had.",
    languages: ["English", "Hindi", "Malayalam"], hourlyRate: 1150,
  }),
  makeUser("usr_trainer_6", "Nisha Kapoor", "nisha@nextgenfitness.in", "9876543226", "trainer", {
    specialization: ["Rehab", "Physio-assisted Training", "Postnatal"], certifications: ["DPT", "ACE-CPT"], yearsExp: 11, rating: 5.0, reviewCount: 178,
    bio: "Physiotherapist and coach. I rebuild strength safely after injury, surgery and pregnancy.",
    languages: ["English", "Hindi", "Punjabi"], hourlyRate: 1400,
  }),
];

const memberSpecs: {
  id: string; name: string; email: string; phone: string; gender: User["gender"]; age: number; heightCm: number; weightKg: number;
  goal: User["fitnessGoal"]; plan: string; months: number; occupation: string; status?: Membership["status"]; referredBy?: string; xp?: number;
}[] = [
  { id: "m1", name: "Rahul Verma", email: "rahul@example.com", phone: "9876500001", gender: "Male", age: 28, heightCm: 175, weightKg: 78, goal: "Muscle Gain", plan: "plan_premium", months: 14, occupation: "Software Engineer", xp: 2840 },
  { id: "m2", name: "Sneha Kulkarni", email: "sneha@example.com", phone: "9876500002", gender: "Female", age: 31, heightCm: 162, weightKg: 68, goal: "Fat Loss", plan: "plan_yearly", months: 8, occupation: "Product Manager", xp: 1920 },
  { id: "m3", name: "Arjun Mehta", email: "arjun.m@example.com", phone: "9876500003", gender: "Male", age: 24, heightCm: 180, weightKg: 88, goal: "Strength", plan: "plan_half_yearly", months: 5, occupation: "MBA Student", xp: 1420 },
  { id: "m4", name: "Divya Reddy", email: "divya@example.com", phone: "9876500004", gender: "Female", age: 26, heightCm: 158, weightKg: 55, goal: "Endurance", plan: "plan_quarterly", months: 3, occupation: "Marketing Executive", xp: 890 },
  { id: "m5", name: "Vikram Singh", email: "vikram@example.com", phone: "9876500005", gender: "Male", age: 34, heightCm: 172, weightKg: 92, goal: "Fat Loss", plan: "plan_yearly", months: 6, occupation: "Business Owner", xp: 1650 },
  { id: "m6", name: "Ananya Pillai", email: "ananya.p@example.com", phone: "9876500006", gender: "Female", age: 22, heightCm: 165, weightKg: 52, goal: "General Fitness", plan: "plan_student", months: 2, occupation: "College Student", xp: 430 },
  { id: "m7", name: "Ravi Shastri", email: "ravi@example.com", phone: "9876500007", gender: "Male", age: 41, heightCm: 170, weightKg: 84, goal: "Rehab", plan: "plan_premium", months: 5, occupation: "Architect", xp: 1210 },
  { id: "m8", name: "Kavya Nair", email: "kavya.n@example.com", phone: "9876500008", gender: "Female", age: 29, heightCm: 160, weightKg: 60, goal: "Muscle Gain", plan: "plan_half_yearly", months: 4, occupation: "Designer", xp: 1120 },
  { id: "m9", name: "Imran Khan", email: "imran@example.com", phone: "9876500009", gender: "Male", age: 33, heightCm: 178, weightKg: 82, goal: "Strength", plan: "plan_quarterly", months: 3, occupation: "Banker", xp: 760 },
  { id: "m10", name: "Pooja Desai", email: "pooja@example.com", phone: "9876500010", gender: "Female", age: 36, heightCm: 163, weightKg: 74, goal: "Fat Loss", plan: "plan_yearly", months: 9, occupation: "Teacher", xp: 2140 },
  { id: "m11", name: "Aditya Rao", email: "aditya@example.com", phone: "9876500011", gender: "Male", age: 27, heightCm: 176, weightKg: 71, goal: "General Fitness", plan: "plan_monthly", months: 1, occupation: "Consultant", xp: 320, status: "paused" },
  { id: "m12", name: "Fatima Sheikh", email: "fatima@example.com", phone: "9876500012", gender: "Female", age: 25, heightCm: 159, weightKg: 58, goal: "Muscle Gain", plan: "plan_quarterly", months: 3, occupation: "Doctor", xp: 980 },
  { id: "m13", name: "Sanjay Gupta", email: "sanjay@example.com", phone: "9876500013", gender: "Male", age: 45, heightCm: 168, weightKg: 96, goal: "Fat Loss", plan: "plan_half_yearly", months: 6, occupation: "Chartered Accountant", xp: 1680 },
  { id: "m14", name: "Ritika Bansal", email: "ritika@example.com", phone: "9876500014", gender: "Female", age: 30, heightCm: 161, weightKg: 63, goal: "General Fitness", plan: "plan_family", months: 4, occupation: "Entrepreneur", xp: 880, referredBy: "m2" },
  { id: "m15", name: "Mohit Chopra", email: "mohit@example.com", phone: "9876500015", gender: "Male", age: 23, heightCm: 183, weightKg: 79, goal: "Endurance", plan: "plan_student", months: 2, occupation: "Intern", xp: 510 },
  { id: "m16", name: "Lakshmi Menon", email: "lakshmi@example.com", phone: "9876500016", gender: "Female", age: 38, heightCm: 156, weightKg: 66, goal: "Rehab", plan: "plan_yearly", months: 7, occupation: "Bank Manager", xp: 1450 },
  { id: "m17", name: "Gaurav Joshi", email: "gaurav@example.com", phone: "9876500017", gender: "Male", age: 29, heightCm: 174, weightKg: 75, goal: "Muscle Gain", plan: "plan_quarterly", months: 2, occupation: "Sales Lead", xp: 620, status: "frozen" },
  { id: "m18", name: "Tanvi Shah", email: "tanvi@example.com", phone: "9876500018", gender: "Female", age: 27, heightCm: 164, weightKg: 57, goal: "Endurance", plan: "plan_monthly", months: 1, occupation: "Analyst", xp: 340, status: "expired" },
];

export function buildSeed(): DB {
  const users: User[] = [admin, ...receptionists, ...trainers];
  const dbCounters: Record<string, number> = {};

  // Members
  memberSpecs.forEach((s, i) => {
    const referralCode = `NF${s.id.slice(1).padStart(3, "0")}`;
    users.push(
      makeUser(s.id, s.name, s.email, s.phone, "member", {
        memberId: `NF-2026-${String(i + 1).padStart(4, "0")}`,
        age: s.age, dob: daysAgo(s.age * 365 + between(20, 300)), gender: s.gender, heightCm: s.heightCm, weightKg: s.weightKg,
        targetWeightKg: s.goal === "Fat Loss" ? Math.round(s.weightKg * 0.9) : s.goal === "Muscle Gain" ? s.weightKg + 5 : undefined,
        fitnessGoal: s.goal, occupation: s.occupation, city: "Bengaluru", referralCode,
        referredBy: s.referredBy, signedWaiver: true, signedAt: tsAgo(s.months * 30), xp: s.xp ?? 0, level: Math.min(10, Math.floor((s.xp ?? 0) / 300) + 1),
        idDoc: { type: "Aadhaar", fileName: "aadhaar.pdf", uploadedAt: tsAgo(s.months * 30) },
        twoFA: false, createdAt: tsAgo(s.months * 31), updatedAt: tsAgo(between(0, 3)),
      })
    );
  });

  /* --------------------------- Memberships --------------------------- */

  const memberships: Membership[] = [];
  const payments: Payment[] = [];
  const invoices: Invoice[] = [];
  dbCounters.invoiceSeq = 0;
  dbCounters.memberSeq = 18;

  memberSpecs.forEach((s) => {
    const plan = plans.find((p) => p.id === s.plan)!;
    const months = s.status === "expired" ? 1 : s.months;
    const start = daysAgo(months * 30);
    const status: Membership["status"] = s.status ?? (s.months > 0 ? "active" : "active");
    const endDate =
      status === "active" ? daysAhead(Math.max(5, (s.months + 1) * 30 - Date.now() / DAY - months * 30)) : daysAgo(between(2, 20));
    memberships.push({
      id: uid("mem"), memberId: s.id, planId: plan.id, planName: plan.name, tier: plan.tier, status,
      startDate: start, endDate, autoRenew: status === "active", price: plan.price, paid: plan.price,
      paymentMethod: pick(["upi", "card", "netbanking", "cash", "emi"]), createdAt: tsAgo(months * 30), updatedAt: tsAgo(between(0, 5)),
    });

    // Monthly renewal payments for charting history
    for (let m = 0; m < months; m++) {
      const when = tsAgo((months - m) * 30 - between(0, 4));
      const p = makePayment(s.id, `plan-${m}`, plan.name, plan.price, "paid", when);
      payments.push(p);
      if (m === 0) attachInvoice(p, s.id, plan);
    }
  });

  function makePayment(memberId: string, tag: string, desc: string, amount: number, status: Payment["status"], when: string): Payment {
    const seq = (dbCounters.paymentSeq = (dbCounters.paymentSeq ?? 0) + 1);
    return {
      id: uid("pay"), ref: `PYMT-${String(seq).padStart(5, "0")}`, memberId, description: desc, amount, paidAmount: status === "paid" ? amount : 0,
      method: pick(["upi", "card", "netbanking", "wallet", "cash"]), status,
      invoiceNo: status === "paid" ? `NF-INV-${String(seq).padStart(5, "0")}` : undefined, createdAt: when,
    };
  }

  function attachInvoice(payment: Payment, memberId: string, plan: MembershipPlan) {
    const seq = ++dbCounters.invoiceSeq;
    const subtotal = Math.round(plan.price / 1.18);
    const gst = plan.price - subtotal;
    invoices.push({
      id: uid("inv"), number: `NF-INV-${String(seq).padStart(5, "0")}`, memberId, paymentId: payment.id,
      items: [{ name: `${plan.name} Membership`, qty: 1, amount: subtotal }], subtotal, gst, total: plan.price,
      issuedAt: payment.createdAt,
    });
  }

  // Ad-hoc payments (PT sessions, assessments, shop)
  const adHoc: { memberId: string; desc: string; amount: number; days: number }[] = [
    { memberId: "m1", desc: "PT Session ×4 (July)", amount: 4800, days: 20 },
    { memberId: "m2", desc: "Body Scan + Nutrition consult", amount: 2500, days: 14 },
    { memberId: "m5", desc: "PT Session ×8", amount: 9600, days: 9 },
    { memberId: "m7", desc: "Physio-assisted training ×6", amount: 8400, days: 25 },
    { memberId: "m10", desc: "Body Scan + Diet plan", amount: 3500, days: 11 },
    { memberId: "m13", desc: "Fitness Assessment", amount: 1500, days: 6 },
    { memberId: "m16", desc: "Rehab program (initial)", amount: 5000, days: 30 },
    { memberId: "m3", desc: "Shop — Protein & Creatine", amount: 4200, days: 12 },
    { memberId: "m4", desc: "Shop — Gym wear", amount: 2400, days: 18 },
    { memberId: "m8", desc: "PT Session ×4", amount: 4800, days: 16 },
  ];
  adHoc.forEach((a) => payments.push(makePayment(a.memberId, "adhoc", a.desc, a.amount, "paid", tsAgo(a.days))));

  // A pending and a failed payment for realism
  payments.push(makePayment("m18", "renew", "Monthly Membership Renewal", 2499, "pending", tsAgo(2)));
  payments.push(makePayment("m15", "renew", "Student Pass Renewal", 1499, "failed", tsAgo(4)));

  /* --------------------------- Attendance --------------------------- */

  const attendance: Attendance[] = [];
  const AM = ["06:30", "06:45", "07:00", "07:15", "07:30", "08:00"];
  const PM = ["18:00", "18:15", "18:30", "19:00", "19:30", "20:00"];
  const activeMembers = memberSpecs.filter((s) => s.status !== "expired" && s.status !== "frozen");
  const prefs: Record<string, boolean> = {};
  activeMembers.forEach((s) => (prefs[s.id] = rnd() > 0.5));

  for (let back = 1; back <= 120; back++) {
    for (const s of activeMembers) {
      if (s.status === "paused" && back > 25) continue;
      if (rnd() > 0.62) continue;
      const date = daysAgo(back);
      const dt = new Date(`${date}T10:00:00`);
      if (dt.getDay() === 0) continue; // closed Sundays
      const time = prefs[s.id] ? pick(AM) : pick(PM);
      const mins = between(45, 95);
      const checkIn = new Date(`${date}T${time}:00`).toISOString();
      const checkOut = new Date(new Date(`${date}T${time}:00`).getTime() + mins * 60000).toISOString();
      attendance.push({ id: uid("att"), memberId: s.id, date, checkIn, checkOut, workoutMinutes: mins, method: pick(["qr", "qr", "mobile", "rfid", "face"]) });
    }
  }
  // Today's check-ins
  activeMembers.slice(0, 9).forEach((s) => {
    const time = prefs[s.id] ? AM[0] : PM[0];
    attendance.push({
      id: uid("att"), memberId: s.id, date: iso(new Date()), checkIn: new Date(`${iso(new Date())}T${time}:00`).toISOString(),
      workoutMinutes: between(40, 85), method: pick(["qr", "mobile"]),
    });
  });

  /* ----------------------------- Classes ----------------------------- */

  const classes: GymClass[] = [
    { id: "cls_yoga", name: "Sunrise Yoga", slug: "sunrise-yoga", category: "yoga", description: "Slow-flow vinyasa to wake up the body and calm the mind.", durationMin: 45, intensity: "Low", capacity: 24, roomId: "room_studio1", trainerId: "usr_trainer_2", schedule: [{ day: 1, time: "06:00", trainerId: "usr_trainer_2" }, { day: 3, time: "06:00", trainerId: "usr_trainer_2" }, { day: 5, time: "06:00", trainerId: "usr_trainer_2" }, { day: 6, time: "08:00", trainerId: "usr_trainer_2" }], color: "#10b981", active: true },
    { id: "cls_crossfit", name: "CrossFit WOD", slug: "crossfit-wod", category: "crossfit", description: "Daily Workout of the Day — Olympic lifts, gymnastics and brutal conditioning.", durationMin: 60, intensity: "High", capacity: 30, roomId: "room_studio2", trainerId: "usr_trainer_3", schedule: [{ day: 1, time: "07:00", trainerId: "usr_trainer_3" }, { day: 2, time: "19:00", trainerId: "usr_trainer_3" }, { day: 4, time: "07:00", trainerId: "usr_trainer_3" }, { day: 6, time: "07:00", trainerId: "usr_trainer_3" }], color: "#ef4444", active: true },
    { id: "cls_hiit", name: "HIIT Blast", slug: "hiit-blast", category: "hiit", description: "40 minutes of maximal interval work. Every session is a different beast.", durationMin: 40, intensity: "High", capacity: 30, roomId: "room_studio2", trainerId: "usr_trainer_1", schedule: [{ day: 1, time: "18:30", trainerId: "usr_trainer_1" }, { day: 3, time: "18:30", trainerId: "usr_trainer_1" }, { day: 5, time: "07:00", trainerId: "usr_trainer_1" }], color: "#f97316", active: true },
    { id: "cls_zumba", name: "Zumba Party", slug: "zumba-party", category: "zumba", description: "Latin-inspired dance fitness that feels like a party, burns like cardio.", durationMin: 50, intensity: "Moderate", capacity: 30, roomId: "room_studio1", trainerId: "usr_trainer_4", schedule: [{ day: 2, time: "19:00", trainerId: "usr_trainer_4" }, { day: 5, time: "19:00", trainerId: "usr_trainer_4" }, { day: 6, time: "10:00", trainerId: "usr_trainer_4" }], color: "#a855f7", active: true },
    { id: "cls_pilates", name: "Pilates Core", slug: "pilates-core", category: "pilates", description: "Mat pilates for a strong core, better posture and controlled movement.", durationMin: 45, intensity: "Moderate", capacity: 20, roomId: "room_studio1", trainerId: "usr_trainer_2", schedule: [{ day: 2, time: "07:30", trainerId: "usr_trainer_2" }, { day: 4, time: "07:30", trainerId: "usr_trainer_2" }, { day: 6, time: "09:00", trainerId: "usr_trainer_2" }], color: "#14b8a6", active: true },
    { id: "cls_strength", name: "Strength & Conditioning", slug: "strength-conditioning", category: "strength", description: "Barbell-focused strength training with coach-led progression.", durationMin: 60, intensity: "High", capacity: 24, roomId: "room_main", trainerId: "usr_trainer_1", schedule: [{ day: 1, time: "19:30", trainerId: "usr_trainer_1" }, { day: 3, time: "07:00", trainerId: "usr_trainer_1" }, { day: 4, time: "19:30", trainerId: "usr_trainer_1" }], color: "#3b82f6", active: true },
    { id: "cls_boxing", name: "Boxing Fundamentals", slug: "boxing-fundamentals", category: "boxing", description: "Footwork, stance, pad-work and bags. Boxercise without the bruises.", durationMin: 45, intensity: "High", capacity: 20, roomId: "room_studio2", trainerId: "usr_trainer_5", schedule: [{ day: 2, time: "18:00", trainerId: "usr_trainer_5" }, { day: 4, time: "18:00", trainerId: "usr_trainer_5" }, { day: 6, time: "08:00", trainerId: "usr_trainer_5" }], color: "#ef4444", active: true },
    { id: "cls_functional", name: "Functional Circuit", slug: "functional-circuit", category: "functional", description: "Full-body circuit training that mimics real-life movement patterns.", durationMin: 50, intensity: "Moderate", capacity: 30, roomId: "room_main", trainerId: "usr_trainer_3", schedule: [{ day: 2, time: "07:00", trainerId: "usr_trainer_3" }, { day: 5, time: "07:00", trainerId: "usr_trainer_3" }], color: "#22c55e", active: true },
    { id: "cls_cardio", name: "Cardio Endurance", slug: "cardio-endurance", category: "cardio", description: "Tempo runs, intervals and conditioning on the cardio deck.", durationMin: 40, intensity: "Moderate", capacity: 30, roomId: "room_main", trainerId: "usr_trainer_1", schedule: [{ day: 3, time: "19:00", trainerId: "usr_trainer_1" }, { day: 5, time: "18:30", trainerId: "usr_trainer_1" }], color: "#6366f1", active: true },
  ];

  /* ----------------------------- Bookings ----------------------------- */

  const bookings: Booking[] = [];
  dbCounters.bookingSeq = 0;
  const classDayMap: Record<number, { cls: string; time: string }[]> = {};
  classes.forEach((c) => c.schedule.forEach((slot) => (classDayMap[slot.day] = [...(classDayMap[slot.day] ?? []), { cls: c.id, time: slot.time }])));

  function addBooking(b: Omit<Booking, "id" | "ref" | "createdAt"> & { ref?: string }) {
    const seq = ++dbCounters.bookingSeq;
    bookings.push({ ...b, id: uid("bk"), ref: b.ref ?? `BK-${String(seq).padStart(5, "0")}`, createdAt: tsAgo(between(1, 40)) });
  }

  // Past completed bookings
  const classBookers = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m12", "m13", "m14", "m15", "m16"];
  for (let back = 1; back <= 60; back++) {
    const dt = new Date(daysAgo(back) + "T10:00:00");
    const slots = classDayMap[dt.getDay()];
    if (!slots) continue;
    const booked = between(6, 18);
    for (let i = 0; i < booked; i++) {
      const memberId = pick(classBookers);
      const slot = pick(slots);
      const cls = classes.find((c) => c.id === slot.cls)!;
      addBooking({
        memberId, classId: cls.id, type: "class", date: daysAgo(back), time: slot.time, durationMin: cls.durationMin,
        status: "completed", price: 0, paid: 0, attended: rnd() > 0.12, trainerId: cls.trainerId,
      });
    }
  }

  // Upcoming class bookings (next 7 days)
  for (let ahead = 0; ahead <= 7; ahead++) {
    const dt = new Date(daysAhead(ahead) + "T10:00:00");
    const slots = classDayMap[dt.getDay()];
    if (!slots) continue;
    const perSlot = between(4, 16);
    for (let i = 0; i < perSlot; i++) {
      const memberId = pick(classBookers);
      const slot = pick(slots);
      const cls = classes.find((c) => c.id === slot.cls)!;
      addBooking({
        memberId, classId: cls.id, type: "class", date: daysAhead(ahead), time: slot.time, durationMin: cls.durationMin,
        status: rnd() > 0.85 ? "waitlisted" : "upcoming", price: 0, paid: 0, trainerId: cls.trainerId,
      });
    }
  }

  // PT + assessment bookings
  const ptSlots: { memberId: string; trainerId: string; day: number; time: string }[] = [
    { memberId: "m1", trainerId: "usr_trainer_1", day: 1, time: "08:00" },
    { memberId: "m1", trainerId: "usr_trainer_1", day: 4, time: "08:00" },
    { memberId: "m2", trainerId: "usr_trainer_4", day: 3, time: "18:00" },
    { memberId: "m5", trainerId: "usr_trainer_3", day: 2, time: "08:30" },
    { memberId: "m7", trainerId: "usr_trainer_6", day: 5, time: "10:00" },
    { memberId: "m8", trainerId: "usr_trainer_2", day: 6, time: "09:00" },
    { memberId: "m10", trainerId: "usr_trainer_4", day: 2, time: "18:30" },
    { memberId: "m13", trainerId: "usr_trainer_3", day: 4, time: "19:00" },
  ];
  ptSlots.forEach((p) => {
    for (let w = 0; w < 4; w++) {
      const date = new Date(daysAgo(0) + "T10:00:00");
      date.setDate(date.getDate() - w * 7);
      const d = iso(date);
      if (new Date(`${d}T10:00:00`).getDay() !== p.day) {
        const diff = (p.day - new Date(`${d}T10:00:00`).getDay() + 7) % 7;
        date.setDate(date.getDate() - diff);
      }
      addBooking({
        memberId: p.memberId, trainerId: p.trainerId, type: "pt_session", date: iso(date), time: p.time, durationMin: 60,
        status: w === 0 ? "upcoming" : "completed", price: 1200, paid: 1200, attended: w === 0 ? undefined : true,
        notes: "Weekly session — push/pull split",
      });
    }
  });
  // Upcoming body scans
  [["m1", "usr_trainer_4"], ["m2", "usr_trainer_4"], ["m10", "usr_trainer_4"]].forEach(([m, t], i) => {
    addBooking({ memberId: m, trainerId: t, type: "body_scan", date: daysAhead(3 + i), time: "09:30", durationMin: 30, status: "upcoming", price: 0, paid: 0 });
  });

  /* ----------------------- Workout plans & logs ----------------------- */

  const workoutPlans: WorkoutPlan[] = [
    {
      id: uid("wplan"), memberId: "m1", trainerId: "usr_trainer_1", name: "Hypertrophy Split", goal: "Muscle Gain", weeklyDays: 5, active: true,
      days: [
        { day: "Day 1 — Push", focus: "Chest · Shoulders · Triceps", exercises: [
          { exerciseId: "ex_bench", sets: 4, reps: "8-10", weightKg: 60, restSec: 120 },
          { exerciseId: "ex_incline", sets: 3, reps: "10-12", weightKg: 24, restSec: 90 },
          { exerciseId: "ex_ohp", sets: 3, reps: "8-10", weightKg: 40, restSec: 90 },
          { exerciseId: "ex_tricep", sets: 3, reps: "12-15", weightKg: 27, restSec: 60 },
        ] },
        { day: "Day 2 — Pull", focus: "Back · Biceps", exercises: [
          { exerciseId: "ex_deadlift", sets: 4, reps: "5", weightKg: 100, restSec: 180 },
          { exerciseId: "ex_pulldown", sets: 3, reps: "10-12", weightKg: 55, restSec: 90 },
          { exerciseId: "ex_row", sets: 3, reps: "10", weightKg: 60, restSec: 90 },
          { exerciseId: "ex_curl", sets: 3, reps: "12", weightKg: 14, restSec: 60 },
        ] },
        { day: "Day 3 — Legs", focus: "Quads · Glutes · Hamstrings", exercises: [
          { exerciseId: "ex_squat", sets: 4, reps: "6-8", weightKg: 80, restSec: 150 },
          { exerciseId: "ex_legpress", sets: 3, reps: "12", weightKg: 180, restSec: 90 },
          { exerciseId: "ex_rdl", sets: 3, reps: "10", weightKg: 60, restSec: 90 },
          { exerciseId: "ex_lunge", sets: 3, reps: "12", weightKg: 20, restSec: 60 },
        ] },
        { day: "Day 4 — Upper Power", focus: "Compound strength", exercises: [
          { exerciseId: "ex_bench", sets: 5, reps: "5", weightKg: 65, restSec: 180 },
          { exerciseId: "ex_row", sets: 5, reps: "5", weightKg: 65, restSec: 180 },
          { exerciseId: "ex_ohp", sets: 4, reps: "6", weightKg: 42, restSec: 120 },
        ] },
        { day: "Day 5 — Accessories + Core", focus: "Isolation & core", exercises: [
          { exerciseId: "ex_facepull", sets: 4, reps: "15", weightKg: 22, restSec: 60 },
          { exerciseId: "ex_latraise", sets: 4, reps: "15", weightKg: 10, restSec: 60 },
          { exerciseId: "ex_plank", sets: 3, reps: "60s", restSec: 60 },
          { exerciseId: "ex_crunch", sets: 3, reps: "20", weightKg: 25, restSec: 45 },
        ] },
      ],
      createdAt: tsAgo(60), updatedAt: tsAgo(2),
    },
    {
      id: uid("wplan"), memberId: "m2", trainerId: "usr_trainer_4", name: "Fat-Loss Circuit", goal: "Fat Loss", weeklyDays: 4, active: true,
      days: [
        { day: "Day 1 — Full Body", focus: "Metabolic circuit", exercises: [
          { exerciseId: "ex_squat", sets: 3, reps: "12", weightKg: 40, restSec: 60 },
          { exerciseId: "ex_kbswing", sets: 4, reps: "20", weightKg: 16, restSec: 60 },
          { exerciseId: "ex_pushup", sets: 3, reps: "15", restSec: 60 },
          { exerciseId: "ex_row", sets: 3, reps: "12", weightKg: 30, restSec: 60 },
        ] },
        { day: "Day 2 — Cardio Intervals", focus: "HIIT", exercises: [
          { exerciseId: "ex_tread", sets: 8, reps: "1 min @ 85%", restSec: 90 },
          { exerciseId: "ex_mountain", sets: 3, reps: "40s", restSec: 30 },
        ] },
        { day: "Day 3 — Full Body", focus: "Strength circuit", exercises: [
          { exerciseId: "ex_deadlift", sets: 3, reps: "8", weightKg: 50, restSec: 90 },
          { exerciseId: "ex_lunge", sets: 3, reps: "12", weightKg: 16, restSec: 60 },
          { exerciseId: "ex_facepull", sets: 3, reps: "15", weightKg: 18, restSec: 45 },
          { exerciseId: "ex_plank", sets: 3, reps: "45s", restSec: 45 },
        ] },
        { day: "Day 4 — Steady Cardio", focus: "Zone 2", exercises: [
          { exerciseId: "ex_bike", sets: 1, reps: "45 min @ Zone 2", restSec: 0 },
        ] },
      ],
      createdAt: tsAgo(45), updatedAt: tsAgo(3),
    },
    {
      id: uid("wplan"), memberId: "m7", trainerId: "usr_trainer_6", name: "Rehab & Rebuild", goal: "Rehab", weeklyDays: 3, active: true,
      days: [
        { day: "Day 1 — Mobility + Core", focus: "Posture & stability", exercises: [
          { exerciseId: "ex_yoga_warrior", sets: 3, reps: "30s hold", restSec: 30 },
          { exerciseId: "ex_plank", sets: 3, reps: "30s", restSec: 60 },
          { exerciseId: "ex_russian", sets: 3, reps: "15", restSec: 45 },
        ] },
        { day: "Day 2 — Lower Body", focus: "Controlled strength", exercises: [
          { exerciseId: "ex_lunge", sets: 3, reps: "10", weightKg: 8, restSec: 90 },
          { exerciseId: "ex_hipthrust", sets: 3, reps: "12", weightKg: 40, restSec: 90 },
          { exerciseId: "ex_stretch_ham", sets: 3, reps: "30s", restSec: 30 },
        ] },
        { day: "Day 3 — Upper Body", focus: "Push-pull balance", exercises: [
          { exerciseId: "ex_pushup", sets: 3, reps: "10", restSec: 60 },
          { exerciseId: "ex_facepull", sets: 3, reps: "15", weightKg: 14, restSec: 45 },
          { exerciseId: "ex_latraise", sets: 2, reps: "12", weightKg: 6, restSec: 45 },
          { exerciseId: "ex_foam", sets: 1, reps: "10 min", restSec: 0 },
        ] },
      ],
      createdAt: tsAgo(30), updatedAt: tsAgo(1),
    },
  ];

  const workoutLogs: WorkoutLog[] = [];
  const planExercises = workoutPlans[0].days.flatMap((d) => d.exercises);
  const plan2 = workoutPlans[1];
  activeMembers.forEach((s) => {
    const count = between(6, 22);
    for (let i = 0; i < count; i++) {
      const back = between(0, 60);
      const exs = s.id === "m2" ? plan2.days.flatMap((d) => d.exercises) : planExercises;
      const sample = exs.slice(0, 3);
      workoutLogs.push({
        id: uid("wlog"), memberId: s.id, planId: s.id === "m2" ? plan2.id : workoutPlans[0].id,
        day: pick(["Day 1 — Push", "Day 2 — Pull", "Day 3 — Legs"]), date: daysAgo(back), durationMin: between(40, 75),
        caloriesBurned: between(320, 650),
        exercises: sample.map((e) => {
          const ex = exercises.find((x) => x.id === e.exerciseId)!;
          return { name: ex.name, sets: e.sets, reps: e.reps, weightKg: e.weightKg, completed: rnd() > 0.1 };
        }),
        trainerNotes: rnd() > 0.6 ? pick(["Great form today. Increase weight next week.", "Push the last set — you had more in the tank.", "Keep bracing before every rep.", "Solid tempo control. Slow the negatives."]) : undefined,
        createdAt: tsAgo(back),
      });
    }
  });

  /* ----------------------------- Diet ----------------------------- */

  const dietPlans: DietPlan[] = [
    {
      id: uid("dplan"), memberId: "m1", trainerId: "usr_trainer_4", name: "Mass Builder 3200 kcal", goal: "Muscle Gain", dailyCalories: 3200, active: true,
      meals: [
        { id: uid("meal"), type: "Breakfast", name: "Oats + Whey Bowl", time: "08:00", calories: 650, protein: 42, carbs: 88, fat: 14, items: ["Rolled oats 80g", "Whey 1 scoop", "Banana", "Peanut butter 20g"] },
        { id: uid("meal"), type: "Snack", name: "Poha + Eggs", time: "11:00", calories: 420, protein: 18, carbs: 52, fat: 14, items: ["Poha 100g", "2 whole eggs", "Curd 100g"] },
        { id: uid("meal"), type: "Lunch", name: "Chicken Rice Bowl", time: "13:30", calories: 780, protein: 55, carbs: 96, fat: 18, items: ["Chicken breast 200g", "Basmati rice 150g", "Ghee 1 tbsp", "Mixed salad"] },
        { id: uid("meal"), type: "Pre-Workout", name: "Pre-workout snack", time: "17:00", calories: 220, protein: 6, carbs: 44, fat: 2, items: ["Banana", "White rice flakes"] },
        { id: uid("meal"), type: "Post-Workout", name: "Whey + Fruit", time: "19:00", calories: 280, protein: 28, carbs: 36, fat: 3, items: ["Whey 1.5 scoop", "Apple", "Water"] },
        { id: uid("meal"), type: "Dinner", name: "Paneer Stir-Fry + Roti", time: "21:00", calories: 850, protein: 46, carbs: 84, fat: 34, items: ["Paneer 200g", "Whole wheat roti 3", "Stir-fried veggies"] },
      ],
      createdAt: tsAgo(30), updatedAt: tsAgo(3),
    },
    {
      id: uid("dplan"), memberId: "m2", trainerId: "usr_trainer_4", name: "Deficit Plan 1650 kcal", goal: "Fat Loss", dailyCalories: 1650, active: true,
      meals: [
        { id: uid("meal"), type: "Breakfast", name: "Egg White Omelette + Toast", time: "07:30", calories: 320, protein: 28, carbs: 26, fat: 11, items: ["Egg whites 4", "Multigrain toast 2", "Green chutney"] },
        { id: uid("meal"), type: "Snack", name: "Greek Yogurt + Berries", time: "11:00", calories: 180, protein: 16, carbs: 18, fat: 5, items: ["Greek yogurt 150g", "Blueberries", "Flax seeds 1 tsp"] },
        { id: uid("meal"), type: "Lunch", name: "Grilled Fish + Salad", time: "13:30", calories: 420, protein: 40, carbs: 24, fat: 16, items: ["Tilapia 180g", "Quinoa 60g", "Cucumber-tomato salad"] },
        { id: uid("meal"), type: "Pre-Workout", name: "Small fruit", time: "17:30", calories: 100, protein: 1, carbs: 25, fat: 0, items: ["Apple"] },
        { id: uid("meal"), type: "Post-Workout", name: "Whey Lite", time: "19:00", calories: 140, protein: 24, carbs: 8, fat: 2, items: ["Whey 1 scoop", "Water"] },
        { id: uid("meal"), type: "Dinner", name: "Dal + Veggies + Khichdi", time: "20:30", calories: 490, protein: 24, carbs: 62, fat: 14, items: ["Moong dal 100g", "Mixed veggies", "Khichdi 150g"] },
      ],
      createdAt: tsAgo(25), updatedAt: tsAgo(2),
    },
  ];

  const mealLogs: MealLog[] = [];
  const dailyStats: DailyStat[] = [];
  const trackers = ["m1", "m2", "m5", "m8", "m10", "m12"];
  trackers.forEach((m) => {
    for (let back = 0; back < 14; back++) {
      const date = daysAgo(back);
      const plan = dietPlans.find((p) => p.memberId === m) ?? pick(dietPlans);
      const eaten = pick(plan.meals);
      const totalCals = plan.dailyCalories * (rnd() > 0.3 ? 0.92 : 1.05);
      mealLogs.push({
        id: uid("mlog"), memberId: m, date, mealType: eaten.type, items: eaten.items, calories: eaten.calories,
        protein: eaten.protein, carbs: eaten.carbs, fat: eaten.fat, createdAt: `${date}T${eaten.time}:00Z`,
      });
      dailyStats.push({
        id: uid("dstat"), memberId: m, date, waterML: between(1800, 3200), steps: between(6000, 14000),
        sleepHrs: Math.round((between(6, 8.5) * 2)) / 2, caloriesIn: Math.round(totalCals), caloriesOut: between(1800, 2600),
      });
    }
  });

  /* --------------------------- Measurements --------------------------- */

  const measurements: Measurement[] = [];
  const baseWeight: Record<string, { start: number; end: number }> = {
    m1: { start: 74, end: 78 }, m2: { start: 74, end: 66.4 }, m5: { start: 97, end: 88.2 },
    m7: { start: 86, end: 84.1 }, m10: { start: 81, end: 72.6 }, m13: { start: 101, end: 93.4 },
    m8: { start: 64, end: 61.2 }, m16: { start: 69, end: 66.8 }, m12: { start: 60, end: 58.4 },
  };
  Object.entries(baseWeight).forEach(([m, w]) => {
    const months = between(4, 8);
    for (let i = 0; i <= months; i++) {
      const t = i / months;
      const weight = +(w.start + (w.end - w.start) * t).toFixed(1);
      measurements.push({
        id: uid("meas"), memberId: m, date: daysAgo(Math.round((months - i) * 28)),
        weightKg: weight, bodyFat: +(24 - t * 6).toFixed(1), muscle: +(32 + t * 5).toFixed(1), water: +(55 + t * 3).toFixed(1),
        bmi: +(weight / Math.pow(1.7, 2)).toFixed(1), chest: between(90, 105), waist: +(88 - t * 9).toFixed(0),
        hip: between(92, 104), shoulders: between(108, 122), arms: between(30, 40), forearms: between(25, 31),
        thighs: between(52, 62), calves: between(34, 40), neck: between(36, 41),
        note: i === months ? "Monthly body assessment — great progress!" : undefined,
      });
    }
  });

  /* --------------------------- Equipment --------------------------- */

  const equipment: Equipment[] = [
    { id: "eq_1", name: "Treadmill — Matrix T75 ×8", category: "Cardio", status: "operational", usageHours: 4210, lastMaintenance: daysAgo(12), nextMaintenance: daysAhead(20), warrantyExpiry: daysAhead(200), amcProvider: "Matrix AMC" },
    { id: "eq_2", name: "Elliptical — Precor EFX ×6", category: "Cardio", status: "operational", usageHours: 3120, lastMaintenance: daysAgo(25), nextMaintenance: daysAhead(40), warrantyExpiry: daysAhead(300) },
    { id: "eq_3", name: "Rower — Concept2 ×4", category: "Cardio", status: "maintenance", usageHours: 2890, lastMaintenance: daysAgo(45), nextMaintenance: daysAhead(5), warrantyExpiry: daysAhead(120), notes: "Monitor battery replacement scheduled" },
    { id: "eq_4", name: "Smith Machine ×2", category: "Strength", status: "operational", usageHours: 5100, lastMaintenance: daysAgo(30), nextMaintenance: daysAhead(60), warrantyExpiry: daysAhead(400), amcProvider: "Freemotion AMC" },
    { id: "eq_5", name: "Squat Rack ×4", category: "Strength", status: "operational", usageHours: 6400, lastMaintenance: daysAgo(20), nextMaintenance: daysAhead(50), warrantyExpiry: daysAhead(500) },
    { id: "eq_6", name: "Flat Bench Press ×6", category: "Strength", status: "operational", usageHours: 4800, lastMaintenance: daysAgo(15), nextMaintenance: daysAhead(45), warrantyExpiry: daysAhead(350) },
    { id: "eq_7", name: "Dumbbell Set (2–50kg) ×2", category: "Strength", status: "operational", usageHours: 7200, lastMaintenance: daysAgo(10), nextMaintenance: daysAhead(40), warrantyExpiry: daysAhead(600) },
    { id: "eq_8", name: "Kettlebell Set (8–32kg)", category: "Strength", status: "operational", usageHours: 1900, lastMaintenance: daysAgo(35), nextMaintenance: daysAhead(70) },
    { id: "eq_9", name: "Cable Crossover Tower ×2", category: "Strength", status: "repair", usageHours: 5600, lastMaintenance: daysAgo(60), nextMaintenance: daysAhead(2), warrantyExpiry: daysAhead(200), notes: "Cable pulley bearing worn — parts ordered" },
    { id: "eq_10", name: "Leg Press 45° ×2", category: "Strength", status: "operational", usageHours: 3900, lastMaintenance: daysAgo(28), nextMaintenance: daysAhead(55), warrantyExpiry: daysAhead(420) },
    { id: "eq_11", name: "Punching Bags ×4", category: "Boxing", status: "operational", usageHours: 2200, lastMaintenance: daysAgo(40), nextMaintenance: daysAhead(80) },
    { id: "eq_12", name: "Battle Ropes & Sleds", category: "Functional", status: "operational", usageHours: 1500, lastMaintenance: daysAgo(50), nextMaintenance: daysAhead(90) },
  ];

  /* ---------------------------- Inventory ---------------------------- */

  const inventory: InventoryItem[] = [
    { id: "inv_1", sku: "SUP-WHEY-01", name: "Whey Protein 1kg", category: "Protein", stock: 42, lowStockThreshold: 15, cost: 1800, price: 2899, unit: "unit" },
    { id: "inv_2", sku: "SUP-WHEY-02", name: "Whey Isolate 1kg", category: "Protein", stock: 8, lowStockThreshold: 10, cost: 2600, price: 3999, unit: "unit" },
    { id: "inv_3", sku: "SUP-CRE-01", name: "Creatine Monohydrate 250g", category: "Supplements", stock: 30, lowStockThreshold: 12, cost: 700, price: 1299, unit: "unit" },
    { id: "inv_4", sku: "SUP-PRE-01", name: "Pre-Workout 300g", category: "Supplements", stock: 6, lowStockThreshold: 10, cost: 1100, price: 1899, unit: "unit" },
    { id: "inv_5", sku: "SUP-BCAA-01", name: "BCAA 2:1:1 500g", category: "Supplements", stock: 24, lowStockThreshold: 10, cost: 900, price: 1599, unit: "unit" },
    { id: "inv_6", sku: "SUP-OMEGA-01", name: "Omega-3 Fish Oil 60 caps", category: "Supplements", stock: 35, lowStockThreshold: 12, cost: 350, price: 699, unit: "unit" },
    { id: "inv_7", sku: "ACC-SHK-01", name: "Shaker Bottle 700ml", category: "Accessories", stock: 60, lowStockThreshold: 20, cost: 150, price: 399, unit: "unit" },
    { id: "inv_8", sku: "ACC-BND-01", name: "Resistance Band Set", category: "Accessories", stock: 28, lowStockThreshold: 10, cost: 250, price: 599, unit: "unit" },
    { id: "inv_9", sku: "ACC-GLV-01", name: "Training Gloves", category: "Accessories", stock: 18, lowStockThreshold: 8, cost: 300, price: 749, unit: "unit" },
    { id: "inv_10", sku: "ACC-BLT-01", name: "Lifting Belt", category: "Accessories", stock: 12, lowStockThreshold: 6, cost: 700, price: 1499, unit: "unit" },
    { id: "inv_11", sku: "WER-TSH-01", name: "NEXTGEN Gym Tee", category: "Gym Wear", stock: 45, lowStockThreshold: 15, cost: 350, price: 999, unit: "unit" },
    { id: "inv_12", sku: "WER-SHR-01", name: "Training Shorts", category: "Gym Wear", stock: 30, lowStockThreshold: 12, cost: 320, price: 899, unit: "unit" },
  ];

  /* ----------------------------- Products ----------------------------- */

  const products: Product[] = [
    { id: "prd_1", sku: "SUP-WHEY-01", name: "NEXTGEN Whey Protein 1kg", category: "Protein", description: "24g protein per scoop, 5.5g BCAAs, chocolate / vanilla / mango. Third-party lab tested.", price: 2899, compareAt: 3299, stock: 42, tags: ["whey", "protein", "best-seller"], rating: 4.8, reviewCount: 312, featured: true },
    { id: "prd_2", sku: "SUP-WHEY-02", name: "Whey Isolate 1kg", category: "Protein", description: "28g protein, <1g fat and sugar per serve. For lean, precise macros.", price: 3999, compareAt: 4599, stock: 8, tags: ["isolate", "protein"], rating: 4.9, reviewCount: 178 },
    { id: "prd_3", sku: "SUP-CRE-01", name: "Micronised Creatine 250g", category: "Supplements", description: "Pure monohydrate, micronised for easy mixing. Strength and power support.", price: 1299, stock: 30, tags: ["creatine", "strength"], rating: 4.7, reviewCount: 204, featured: true },
    { id: "prd_4", sku: "SUP-PRE-01", name: "Pre-Workout Rush 300g", category: "Supplements", description: "200mg caffeine, beta-alanine and citrulline. 20 clean servings.", price: 1899, stock: 6, tags: ["pre-workout", "energy"], rating: 4.5, reviewCount: 141 },
    { id: "prd_5", sku: "SUP-BCAA-01", name: "BCAA 2:1:1 500g", category: "Supplements", description: "Recovery-focused aminos. Refreshing orange flavour.", price: 1599, stock: 24, tags: ["bcaa", "recovery"], rating: 4.4, reviewCount: 96 },
    { id: "prd_6", sku: "SUP-OMEGA-01", name: "Omega-3 Fish Oil", category: "Supplements", description: "1000mg EPA+DHA per serving. Heart, brain and joint support.", price: 699, stock: 35, tags: ["omega3", "health"], rating: 4.6, reviewCount: 88 },
    { id: "prd_7", sku: "WER-TSH-01", name: "NEXTGEN Performance Tee", category: "Gym Wear", description: "Moisture-wicking athletic tee with reflective NEXTGEN logo.", price: 999, stock: 45, tags: ["gym-wear", "tee"], rating: 4.7, reviewCount: 122, featured: true },
    { id: "prd_8", sku: "WER-SHR-01", name: "Flex Training Shorts", category: "Gym Wear", description: "Four-way stretch shorts with zip pocket and liner.", price: 899, stock: 30, tags: ["gym-wear", "shorts"], rating: 4.6, reviewCount: 74 },
    { id: "prd_9", sku: "ACC-SHK-01", name: "Steel Shaker 700ml", category: "Accessories", description: "Leak-proof stainless shaker with mixer ball.", price: 399, stock: 60, tags: ["accessory", "shaker"], rating: 4.8, reviewCount: 260 },
    { id: "prd_10", sku: "ACC-BND-01", name: "Resistance Band Set (5pc)", category: "Accessories", description: "Five colour-coded latex bands with carry pouch and workout guide.", price: 599, stock: 28, tags: ["band", "home"], rating: 4.5, reviewCount: 93 },
    { id: "prd_11", sku: "ACC-GLV-01", name: "Grip Training Gloves", category: "Accessories", description: "Padded palms, breathable mesh, adjustable wrist strap.", price: 749, stock: 18, tags: ["gloves", "accessory"], rating: 4.4, reviewCount: 67 },
    { id: "prd_12", sku: "ACC-BLT-01", name: "Pro Lifting Belt", category: "Accessories", description: "10mm leather powerlifting belt with double prong.", price: 1499, stock: 12, tags: ["belt", "powerlifting"], rating: 4.9, reviewCount: 58 },
  ];

  const orders: Order[] = [
    { id: uid("ord"), ref: "ORD-10421", memberId: "m3", items: [{ productId: "prd_1", name: "NEXTGEN Whey Protein 1kg", qty: 1, price: 2899 }, { productId: "prd_3", name: "Micronised Creatine 250g", qty: 1, price: 1299 }], subtotal: 4198, discount: 0, total: 4198, status: "delivered", paymentMethod: "upi", createdAt: tsAgo(12) },
    { id: uid("ord"), ref: "ORD-10420", memberId: "m4", items: [{ productId: "prd_7", name: "NEXTGEN Performance Tee", qty: 2, price: 999 }], subtotal: 1998, discount: 100, total: 1898, status: "delivered", paymentMethod: "card", couponCode: "NFNEW100", createdAt: tsAgo(18) },
    { id: uid("ord"), ref: "ORD-10419", memberId: "m10", items: [{ productId: "prd_9", name: "Steel Shaker 700ml", qty: 1, price: 399 }, { productId: "prd_5", name: "BCAA 2:1:1 500g", qty: 1, price: 1599 }], subtotal: 1998, discount: 0, total: 1998, status: "shipped", paymentMethod: "wallet", createdAt: tsAgo(3) },
    { id: uid("ord"), ref: "ORD-10418", memberId: "m1", items: [{ productId: "prd_4", name: "Pre-Workout Rush 300g", qty: 1, price: 1899 }], subtotal: 1899, discount: 0, total: 1899, status: "delivered", paymentMethod: "cash", createdAt: tsAgo(25) },
    { id: uid("ord"), ref: "ORD-10417", memberId: "m13", items: [{ productId: "prd_11", name: "Grip Training Gloves", qty: 1, price: 749 }, { productId: "prd_12", name: "Pro Lifting Belt", qty: 1, price: 1499 }], subtotal: 2248, discount: 0, total: 2248, status: "processing", paymentMethod: "card", createdAt: tsAgo(1) },
    { id: uid("ord"), ref: "ORD-10416", memberId: "m2", items: [{ productId: "prd_6", name: "Omega-3 Fish Oil", qty: 2, price: 699 }], subtotal: 1398, discount: 0, total: 1398, status: "delivered", paymentMethod: "upi", createdAt: tsAgo(30) },
  ];

  /* ------------------------------- Leads ------------------------------- */

  const leadNames: [string, LeadSource, LeadStatus][] = [
    ["Aisha Khan", "instagram", "interested"], ["Bharat Shetty", "google", "new"], ["Chitra Menon", "referral", "contacted"],
    ["Dinesh Kumar", "website", "demo_booked"], ["Esha Patil", "facebook", "interested"], ["Farhan Ali", "google", "new"],
    ["Gita Nair", "walkin", "negotiation"], ["Harsh Vora", "instagram", "contacted"], ["Ishita Bose", "website", "interested"],
    ["Jatin Shah", "referral", "won"], ["Kavita Joshi", "google", "new"], ["Lalit Kumar", "facebook", "lost"],
    ["Manoj Pillai", "whatsapp", "interested"], ["Neha Agarwal", "instagram", "demo_booked"], ["Om Prakash", "walkin", "contacted"],
    ["Priyanka Dey", "website", "interested"], ["Qureshi Salim", "google", "new"], ["Ritu Kapoor", "referral", "won"],
    ["Sagar Rao", "whatsapp", "negotiation"], ["Tara Singh", "facebook", "interested"],
  ];

  const leads: Lead[] = leadNames.map(([name, source, status], i) => {
    return {
      id: uid("lead"), name, phone: `98765${String(10000 + i * 137).slice(0, 5)}`, email: `${name.toLowerCase().replace(/ /g, ".")}@example.com`,
      source, status, tierInterested: pick(["plan_monthly", "plan_yearly", "plan_premium", "plan_quarterly", "plan_student"]),
      followUpAt: status === "won" || status === "lost" ? undefined : tsAhead(between(0, 5)),
      assignedTo: pick(["usr_recep_1", "usr_recep_2"]), notes: status === "new" ? [] : [pick(["Asked about yearly plan pricing", "Wants evening batch", "Prefers female trainer", "Interested in PT add-on", "Comparing with nearby gym"])],
      memberId: status === "won" ? pick(["m1", "m2", "m5", "m8"]) : undefined, createdAt: tsAgo(between(0, 30)),
    };
  });

  /* -------------------------- Notifications --------------------------- */

  const notifications: Notification[] = [];
  const notifyTemplates: { userId: string; title: string; body: string; link?: string; channel: NotifChannel; back: number }[] = [
    { userId: "m1", title: "Workout reminder", body: "Day 4 — Upper Power is on today at 7:00 PM.", link: "/portal/dashboard?tab=workout", channel: "push", back: 0 },
    { userId: "m1", title: "PT session confirmed", body: "Karan has confirmed your session tomorrow 8:00 AM.", link: "/portal/bookings", channel: "app", back: 1 },
    { userId: "m1", title: "Body scan booked", body: "Your monthly body scan is on Friday 9:30 AM.", link: "/portal/bookings", channel: "app", back: 1 },
    { userId: "m2", title: "Progress update", body: "You're down 3.4 kg this month. Keep it up!", link: "/portal/progress", channel: "app", back: 2 },
    { userId: "m2", title: "Meal reminder", body: "Time for your pre-workout snack — apple.", channel: "push", back: 0 },
    { userId: "m5", title: "Class reminder", body: "CrossFit WOD starts in 30 minutes at Studio 2.", link: "/portal/bookings", channel: "push", back: 0 },
    { userId: "m7", title: "Rehab session", body: "Nisha scheduled your mobility session today.", link: "/portal/bookings", channel: "app", back: 1 },
    { userId: "m10", title: "Diet plan updated", body: "Meera adjusted your macros for the new week.", link: "/portal/diet", channel: "app", back: 1 },
    { userId: "m3", title: "Membership expiring soon", body: "Your Half-Yearly plan renews in 9 days.", link: "/portal/membership", channel: "app", back: 1 },
    { userId: "m2", title: "Achievement unlocked", body: "30-Day Consistency badge earned. +150 XP", link: "/portal/achievements", channel: "app", back: 2 },
    { userId: "m1", title: "Payment receipt", body: "Receipt NF-INV-00042 for PT sessions is ready.", link: "/portal/invoices", channel: "app", back: 3 },
    { userId: "m1", title: "Trainer message", body: "Karan: 'Great work today. Add 2.5kg on bench next week.'", link: "/portal/messages", channel: "app", back: 0 },
  ];
  notifyTemplates.forEach((n) => notifications.push({ id: uid("notif"), userId: n.userId, channel: n.channel, title: n.title, body: n.body, link: n.link, read: rnd() > 0.5, createdAt: tsAgo(n.back) }));

  /* ------------------------------ Messages ----------------------------- */

  const messages: Message[] = [
    { id: uid("msg"), senderId: "usr_trainer_1", receiverId: "m1", text: "Nice session today. Let's push bench to 67.5 next week.", read: false, createdAt: tsAgo(0.02) },
    { id: uid("msg"), senderId: "m1", receiverId: "usr_trainer_1", text: "Thanks Karan! Will try. Should I keep the same warm-up?", read: true, createdAt: tsAgo(0.04) },
    { id: uid("msg"), senderId: "usr_trainer_4", receiverId: "m2", text: "Protein was a touch low yesterday — add 100g curd at lunch.", read: false, createdAt: tsAgo(0.5) },
    { id: uid("msg"), senderId: "m2", receiverId: "usr_trainer_4", text: "Got it Meera, thanks!", read: true, createdAt: tsAgo(0.4) },
    { id: uid("msg"), senderId: "usr_trainer_3", receiverId: "m5", text: "Tomorrow's WOD is lunges-heavy. Hydrate well tonight.", read: false, createdAt: tsAgo(1) },
    { id: uid("msg"), senderId: "usr_trainer_6", receiverId: "m7", text: "Remember: no running until we clear the knee test. Bike only.", read: true, createdAt: tsAgo(1.5) },
  ];

  /* ------------------------------ Tickets ------------------------------ */

  const tickets: Ticket[] = [
    { id: uid("tkt"), memberId: "m3", subject: "Change my PT day", body: "Can I move Tuesday PT to Thursday this week?", status: "in_progress", priority: "medium", assigneeId: "usr_recep_1", replies: [{ authorId: "usr_recep_1", text: "Sure! Moving to Thursday 8 AM. Confirmed.", createdAt: tsAgo(0.3) }], createdAt: tsAgo(1), updatedAt: tsAgo(0.3) },
    { id: uid("tkt"), memberId: "m10", subject: "Locker issue", body: "Locker 214 is jammed and my shoes are stuck inside.", status: "open", priority: "high", replies: [], createdAt: tsAgo(0.5) },
    { id: uid("tkt"), memberId: "m5", subject: "Invoice for corporate claim", body: "Need a GST invoice for my yearly plan for reimbursement.", status: "resolved", priority: "low", assigneeId: "usr_recep_2", replies: [{ authorId: "usr_recep_2", text: "Emailed invoice NF-INV-00038 to you. Let us know if HR needs anything else.", createdAt: tsAgo(1) }], createdAt: tsAgo(2), updatedAt: tsAgo(1) },
    { id: uid("tkt"), memberId: "m2", subject: "Freeze request next month", body: "Travelling for work 3 weeks in July. Requesting a freeze.", status: "open", priority: "medium", replies: [], createdAt: tsAgo(0.2) },
  ];

  /* ------------------------------ Coupons ------------------------------ */

  const coupons: Coupon[] = [
    { id: uid("cpn"), code: "NFNEW100", type: "flat", value: 100, maxUses: 200, uses: 47, validFrom: daysAgo(20), validTo: daysAhead(40), active: true },
    { id: uid("cpn"), code: "SUMMER20", type: "percent", value: 20, maxUses: 100, uses: 31, validFrom: daysAgo(10), validTo: daysAhead(20), active: true },
    { id: uid("cpn"), code: "REFER50", type: "percent", value: 50, maxUses: 500, uses: 12, validFrom: daysAgo(60), validTo: daysAhead(300), active: true },
    { id: uid("cpn"), code: "WELCOME100", type: "flat", value: 100, maxUses: 1000, uses: 210, validFrom: daysAgo(200), validTo: daysAhead(150), active: true },
  ];

  /* ------------------------------ Reviews ------------------------------ */

  const reviews: Review[] = [
    { id: uid("rev"), memberId: "m1", memberName: "Rahul Verma", rating: 5, comment: "The member app makes everything stupidly easy. My coach adjusts my plan weekly and I've put on 4kg of clean mass.", channel: "google", createdAt: tsAgo(8) },
    { id: uid("rev"), memberId: "m2", memberName: "Sneha Kulkarni", rating: 5, comment: "Lost 7.6kg in 4 months with Meera's diet plan. The body scan reports keep me accountable.", channel: "app", createdAt: tsAgo(12) },
    { id: uid("rev"), memberId: "m5", memberName: "Vikram Singh", rating: 5, comment: "Best gym in the city. Clean, huge, and the CrossFit WODs are addictive.", channel: "google", createdAt: tsAgo(20) },
    { id: uid("rev"), memberId: "m10", memberName: "Pooja Desai", rating: 4, comment: "Amazing trainers and atmosphere. Parking could be better on weekends.", channel: "google", createdAt: tsAgo(30) },
    { id: uid("rev"), memberId: "m13", memberName: "Sanjay Gupta", rating: 5, comment: "As a 45-year-old, I was nervous. The team built a plan around my knees. Down 8kg and feeling 10 years younger.", channel: "app", createdAt: tsAgo(15) },
    { id: uid("rev"), memberId: "m7", memberName: "Ravi Shastri", rating: 5, comment: "Post-surgery rehab here was life-changing. Nisha is a miracle worker.", channel: "google", createdAt: tsAgo(6) },
  ];

  /* ----------------------------- Referrals ----------------------------- */

  const referrals: Referral[] = memberSpecs.slice(0, 12).map((s) => ({
    id: uid("ref"), code: `NF${s.id.slice(1).padStart(3, "0")}`, ownerId: s.id, uses: s.referredBy ? 0 : between(0, 4), rewardPoints: between(100, 1500), totalRewarded: between(0, 750),
  }));

  /* -------------------------- Achievements ----------------------------- */

  const achievements: Achievement[] = [];
  const achievementDefs: { badge: string; title: string; desc: string; xp: number }[] = [
    { badge: "first-session", title: "First Session", desc: "Complete your first workout", xp: 50 },
    { badge: "consistency-7", title: "7-Day Streak", desc: "Train 7 days in a row", xp: 100 },
    { badge: "consistency-30", title: "30-Day Consistency", desc: "Complete 30 workouts in a month", xp: 150 },
    { badge: "strength-lift", title: "Weightlifter", desc: "Log 1,000 kg total volume in a session", xp: 100 },
    { badge: "class-hero", title: "Class Hero", desc: "Attend 20 group classes", xp: 120 },
    { badge: "milestone-5", title: "5 kg Down", desc: "Lose 5 kg on record", xp: 150 },
    { badge: "body-scan", title: "Scanned", desc: "Complete your first body scan", xp: 60 },
    { badge: "apprentice", title: "Apprentice", desc: "Reach Level 2", xp: 0 },
  ];
  activeMembers.forEach((s) => {
    const count = between(3, 7);
    for (let i = 0; i < count; i++) {
      const def = pick(achievementDefs);
      achievements.push({ id: uid("ach"), memberId: s.id, badge: def.badge, title: def.title, description: def.desc, xp: def.xp, unlockedAt: tsAgo(between(1, 60)) });
    }
  });

  /* ---------------------------- Challenges ----------------------------- */

  const challenges: Challenge[] = [
    {
      id: uid("chal"), title: "30-Day Plank Challenge", description: "Hold a plank every single day. Start at 30s and add 5s daily.", metric: "plankSeconds", goal: 180, rewardXp: 400,
      startsAt: daysAgo(3), endsAt: daysAhead(27), participants: activeMembers.slice(0, 10).map((s) => ({ memberId: s.id, value: between(30, 110), updatedAt: tsAgo(between(0, 3)) })),
    },
    {
      id: uid("chal"), title: "10k Steps Weekend", description: "Hit 10,000 steps on Saturday and Sunday.", metric: "steps", goal: 20000, rewardXp: 250,
      startsAt: daysAhead(2), endsAt: daysAhead(5), participants: activeMembers.slice(0, 8).map((s) => ({ memberId: s.id, value: between(4000, 14000), updatedAt: tsAgo(between(0, 2)) })),
    },
    {
      id: uid("chal"), title: "Deadlift 100 Club", description: "Reach a 100kg deadlift in this cycle.", metric: "deadliftKg", goal: 100, rewardXp: 500,
      startsAt: daysAgo(10), endsAt: daysAhead(50), participants: activeMembers.slice(0, 6).map((s) => ({ memberId: s.id, value: between(40, 120), updatedAt: tsAgo(between(0, 4)) })),
    },
  ];

  /* --------------------------- Automation ------------------------------ */

  const automationLogs: AutomationLog[] = [
    { id: uid("al"), type: "welcome", channel: "email", recipient: "tanvi@example.com", summary: "Welcome email + 2-week workout plan sent", status: "sent", createdAt: tsAgo(28) },
    { id: uid("al"), type: "welcome_whatsapp", channel: "whatsapp", recipient: "+91 98765 00018", summary: "WhatsApp onboarding + QR check-in link", status: "sent", createdAt: tsAgo(28) },
    { id: uid("al"), type: "birthday", channel: "whatsapp", recipient: "+91 98765 00009", summary: "Happy birthday offer: 1 free PT session", status: "sent", createdAt: tsAgo(6) },
    { id: uid("al"), type: "membership_expiry", channel: "email", recipient: "mohit@example.com", summary: "Membership expiring in 5 days — renewal offer", status: "sent", createdAt: tsAgo(2) },
    { id: uid("al"), type: "invoice", channel: "email", recipient: "rahul@example.com", summary: "Invoice NF-INV-00042 attached", status: "sent", createdAt: tsAgo(3) },
    { id: uid("al"), type: "class_reminder", channel: "whatsapp", recipient: "+91 98765 00005", summary: "CrossFit WOD reminder — 12 booked, 3 spots left", status: "sent", createdAt: tsAgo(0.5) },
    { id: uid("al"), type: "water_reminder", channel: "push", recipient: "All active members", summary: "Push: 2L water target — 64% complete", status: "simulated", createdAt: tsAgo(0.1) },
    { id: uid("al"), type: "review_request", channel: "whatsapp", recipient: "+91 98765 00008", summary: "Post-session review request", status: "sent", createdAt: tsAgo(1) },
    { id: uid("al"), type: "offer", channel: "email", recipient: "12 eligible members", summary: "Summer20 flash offer — 20% off quarterly", status: "simulated", createdAt: tsAgo(1.2) },
  ];

  /* ------------------------------ Audit -------------------------------- */

  const auditLogs: AuditEntry[] = [
    { id: uid("aud"), actorId: "usr_admin", actorName: "Aarav Menon", action: "plan.created", targetId: "plan_family", meta: "Created Family plan", createdAt: tsAgo(30) },
    { id: uid("aud"), actorId: "usr_admin", actorName: "Aarav Menon", action: "coupon.created", targetId: "SUMMER20", meta: "Created 20% summer coupon", createdAt: tsAgo(10) },
    { id: uid("aud"), actorId: "usr_recep_1", actorName: "Priya Sharma", action: "member.registered", targetId: "m18", meta: "Walk-in registration — Tanvi Shah", createdAt: tsAgo(28) },
    { id: uid("aud"), actorId: "usr_admin", actorName: "Aarav Menon", action: "price.update", targetId: "plan_yearly", meta: "Yearly plan price set to ₹20,999", createdAt: tsAgo(40) },
    { id: uid("aud"), actorId: "usr_recep_2", actorName: "Rohan Iyer", action: "payment.collected", targetId: "m5", meta: "Cash payment ₹9,600 — PT sessions", createdAt: tsAgo(9) },
    { id: uid("aud"), actorId: "usr_admin", actorName: "Aarav Menon", action: "equipment.repair", targetId: "eq_9", meta: "Cable tower sent for repair", createdAt: tsAgo(2) },
  ];

  /* ----------------------------- Settings ------------------------------ */

  const settings: Settings = {
    name: "NEXTGEN FITNESS", tagline: "Train Harder. Recover Faster. Live Stronger.",
    phone: "+91 98765 43210", whatsapp: "+91 98765 43210", email: "hello@nextgenfitness.in", supportEmail: "support@nextgenfitness.in",
    address: "Level 4, Pulse Tower, MG Road", city: "Bengaluru", gstin: "29ABCDE1234F1Z5", hours: "Mon–Sat · 5:00 AM – 11:00 PM",
    branches: [
      { id: "br_mgroad", name: "MG Road Flagship", address: "Level 4, Pulse Tower, MG Road", phone: "+91 98765 43210", city: "Bengaluru" },
      { id: "br_indiranagar", name: "Indiranagar", address: "100 Feet Road, Indiranagar", phone: "+91 98765 43211", city: "Bengaluru" },
      { id: "br_hsr", name: "HSR Layout", address: "27th Main, Sector 1, HSR", phone: "+91 98765 43212", city: "Bengaluru" },
    ],
    referralDiscountPct: 10, demoMode: true, demoAnchor: iso(new Date()),
  };

  return {
    users, memberships, plans, payments, invoices, attendance, classes, rooms, bookings, exercises,
    workoutPlans, workoutLogs, dietPlans, mealLogs, dailyStats, measurements, equipment, inventory,
    products, orders, leads, notifications, messages, tickets, coupons, reviews, referrals, achievements,
    challenges, otps: [], automationLogs, auditLogs, settings, counters: dbCounters,
  };
}

/* --------------------- Date shifting (demo freshness) --------------------- */

function shiftDateStr(s: string, days: number): string {
  if (!s) return s;
  const full = /^\d{4}-\d{2}-\d{2}T/.test(s);
  const d = new Date(full ? s : `${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return s;
  d.setUTCDate(d.getUTCDate() + days);
  return full ? d.toISOString() : d.toISOString().slice(0, 10);
}

/**
 * Rolls demo data forward so relative dates never go stale. Shifts date-ish
 * fields on every collection by `days` (positive). Person metadata like DOB
 * is intentionally left untouched.
 */
export function shiftDemoDates(db: DB, days: number): void {
  if (days === 0) return;
  const dstr = (f: (x: object) => string | undefined) => (r: object) => {
    const v = f(r);
    if (v) (r as Record<string, unknown>)[f.name] = undefined;
  };

  db.memberships.forEach((r) => {
    r.startDate = shiftDateStr(r.startDate, days); r.endDate = shiftDateStr(r.endDate, days);
    r.createdAt = shiftDateStr(r.createdAt, days); r.updatedAt = shiftDateStr(r.updatedAt, days);
  });
  db.payments.forEach((r) => { r.createdAt = shiftDateStr(r.createdAt, days); });
  db.invoices.forEach((r) => { r.issuedAt = shiftDateStr(r.issuedAt, days); });
  db.attendance.forEach((r) => {
    r.date = shiftDateStr(r.date, days); r.checkIn = shiftDateStr(r.checkIn, days); if (r.checkOut) r.checkOut = shiftDateStr(r.checkOut, days);
  });
  db.bookings.forEach((r) => { r.date = shiftDateStr(r.date, days); r.createdAt = shiftDateStr(r.createdAt, days); if (r.reminderSentAt) r.reminderSentAt = shiftDateStr(r.reminderSentAt, days); if (r.updatedAt) r.updatedAt = shiftDateStr(r.updatedAt, days); });
  db.workoutLogs.forEach((r) => { r.date = shiftDateStr(r.date, days); r.createdAt = shiftDateStr(r.createdAt, days); });
  db.mealLogs.forEach((r) => { r.date = shiftDateStr(r.date, days); r.createdAt = shiftDateStr(r.createdAt, days); });
  db.dailyStats.forEach((r) => { r.date = shiftDateStr(r.date, days); });
  db.measurements.forEach((r) => { r.date = shiftDateStr(r.date, days); });
  db.equipment.forEach((r) => {
    if (r.lastMaintenance) r.lastMaintenance = shiftDateStr(r.lastMaintenance, days);
    if (r.nextMaintenance) r.nextMaintenance = shiftDateStr(r.nextMaintenance, days);
    if (r.warrantyExpiry) r.warrantyExpiry = shiftDateStr(r.warrantyExpiry, days);
  });
  db.orders.forEach((r) => { r.createdAt = shiftDateStr(r.createdAt, days); });
  db.leads.forEach((r) => { if (r.followUpAt) r.followUpAt = shiftDateStr(r.followUpAt, days); r.createdAt = shiftDateStr(r.createdAt, days); });
  db.notifications.forEach((r) => { r.createdAt = shiftDateStr(r.createdAt, days); });
  db.messages.forEach((r) => { r.createdAt = shiftDateStr(r.createdAt, days); });
  db.tickets.forEach((r) => { r.createdAt = shiftDateStr(r.createdAt, days); if (r.updatedAt) r.updatedAt = shiftDateStr(r.updatedAt, days); r.replies.forEach((rep) => { rep.createdAt = shiftDateStr(rep.createdAt, days); }); });
  db.reviews.forEach((r) => { r.createdAt = shiftDateStr(r.createdAt, days); });
  db.achievements.forEach((r) => { r.unlockedAt = shiftDateStr(r.unlockedAt, days); });
  db.challenges.forEach((r) => { r.startsAt = shiftDateStr(r.startsAt, days); r.endsAt = shiftDateStr(r.endsAt, days); r.participants.forEach((p) => { p.updatedAt = shiftDateStr(p.updatedAt, days); }); });
  db.otps.forEach((r) => { r.expiresAt = shiftDateStr(r.expiresAt, days); });
  db.automationLogs.forEach((r) => { r.createdAt = shiftDateStr(r.createdAt, days); });
  db.auditLogs.forEach((r) => { r.createdAt = shiftDateStr(r.createdAt, days); });
  db.coupons.forEach((r) => { r.validFrom = shiftDateStr(r.validFrom, days); r.validTo = shiftDateStr(r.validTo, days); });
  db.settings.demoAnchor = shiftDateStr(db.settings.demoAnchor, days);
  void dstr;
}

export const demoCredentials = {
  admin: { email: "admin@nextgenfitness.in", password: "demo123" },
  trainer: { email: "karan@nextgenfitness.in", password: "demo123" },
  receptionist: { email: "priya@nextgenfitness.in", password: "demo123" },
  member: { email: "rahul@example.com", password: "demo123" },
};
