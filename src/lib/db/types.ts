export type Role = "admin" | "trainer" | "receptionist" | "member";

export type Gender = "Male" | "Female" | "Other";

/* ------------------------------ Users ------------------------------ */

export interface DocUpload {
  type: string;
  fileName: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  passwordHash?: string;
  role: Role;
  verified: boolean;
  google?: boolean;
  apple?: boolean;
  active: boolean;
  avatarColor?: string;
  twoFA?: boolean;

  // member profile
  memberId?: string;
  age?: number;
  dob?: string;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  fitnessGoal?: "Fat Loss" | "Muscle Gain" | "Strength" | "Endurance" | "General Fitness" | "Rehab";
  medicalConditions?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  occupation?: string;
  address?: string;
  city?: string;
  profilePhoto?: string;
  idDoc?: DocUpload;
  signedWaiver?: boolean;
  signedAt?: string;
  referralCode?: string;
  referredBy?: string;
  xp?: number;
  level?: number;
  streak?: number;
  lastCheckInDate?: string;

  // trainer profile
  specialization?: string[];
  certifications?: string[];
  yearsExp?: number;
  rating?: number;
  reviewCount?: number;
  bio?: string;
  languages?: string[];
  hourlyRate?: number;

  // receptionist / admin
  createdAt: string;
  updatedAt: string;
}

/* --------------------------- Memberships --------------------------- */

export type MembershipTier =
  | "monthly"
  | "quarterly"
  | "half_yearly"
  | "yearly"
  | "premium"
  | "elite"
  | "student"
  | "corporate"
  | "family";

export interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  tier: MembershipTier;
  price: number;
  originalPrice?: number;
  durationMonths: number;
  popular?: boolean;
  gold?: boolean;
  tagline: string;
  description: string;
  features: string[];
  excluded?: string[];
}

export type MembershipStatus = "active" | "frozen" | "paused" | "expired" | "cancelled";

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  tier: MembershipTier;
  status: MembershipStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
  paid: number;
  paymentMethod: string;
  couponCode?: string;
  referralUsed?: string;
  createdAt: string;
  updatedAt: string;
}

/* ----------------------------- Payments ---------------------------- */

export type PayMethod = "upi" | "card" | "netbanking" | "wallet" | "emi" | "cash" | "demo";
export type PayStatus = "paid" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  ref: string;
  memberId?: string;
  membershipId?: string;
  bookingId?: string;
  orderId?: string;
  description: string;
  amount: number;
  paidAmount: number;
  method: PayMethod;
  status: PayStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  payerEmail?: string;
  payerPhone?: string;
  meta?: string;
  invoiceNo?: string;
  refundRef?: string;
  refundedAt?: string;
  createdAt: string;
}

export interface InvoiceItem {
  name: string;
  qty: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  memberId: string;
  paymentId: string;
  items: InvoiceItem[];
  subtotal: number;
  gst: number;
  total: number;
  issuedAt: string;
}

/* --------------------------- Attendance ---------------------------- */

export interface Attendance {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  checkIn: string;
  checkOut?: string;
  workoutMinutes?: number;
  method: "qr" | "rfid" | "face" | "mobile" | "manual";
}

/* ----------------------------- Classes ----------------------------- */

export type ClassCategory = "yoga" | "crossfit" | "hiit" | "zumba" | "pilates" | "strength" | "cardio" | "boxing" | "functional";

export interface ClassScheduleSlot {
  day: number; // 0=Monday ... 6=Sunday
  time: string; // "06:30"
  trainerId: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  capacity: number;
}

export interface GymClass {
  id: string;
  name: string;
  slug: string;
  category: ClassCategory;
  description: string;
  durationMin: number;
  intensity: "Low" | "Moderate" | "High";
  capacity: number;
  roomId: string;
  trainerId: string;
  schedule: ClassScheduleSlot[];
  color: string;
  active: boolean;
}

/* ----------------------------- Bookings ---------------------------- */

export type BookingType = "class" | "pt_session" | "assessment" | "consultation" | "body_scan";
export type BookingStatus = "confirmed" | "upcoming" | "completed" | "cancelled" | "no_show" | "waitlisted";

export interface Booking {
  id: string;
  ref: string;
  memberId: string;
  trainerId?: string;
  classId?: string;
  type: BookingType;
  date: string;
  time: string;
  durationMin: number;
  status: BookingStatus;
  price: number;
  paid: number;
  attended?: boolean;
  notes?: string;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/* ----------------------------- Workouts ---------------------------- */

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  met: number;
  instructions?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: string; // "12" or "8-12"
  weightKg?: number;
  restSec: number;
  notes?: string;
}

export interface WorkoutDay {
  day: string; // "Day 1 — Push"
  focus: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  trainerId?: string;
  name: string;
  goal: string;
  weeklyDays: number;
  days: WorkoutDay[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutLog {
  id: string;
  memberId: string;
  planId?: string;
  day?: string;
  date: string;
  durationMin: number;
  caloriesBurned: number;
  exercises: { name: string; sets: number; reps: string; weightKg?: number; completed: boolean }[];
  trainerNotes?: string;
  createdAt: string;
}

/* ------------------------------- Diet ------------------------------ */

export interface DietMeal {
  id: string;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Pre-Workout" | "Post-Workout";
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
}

export interface DietPlan {
  id: string;
  memberId: string;
  trainerId?: string;
  name: string;
  goal: string;
  dailyCalories: number;
  meals: DietMeal[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealLog {
  id: string;
  memberId: string;
  date: string;
  mealType: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export interface DailyStat {
  id: string;
  memberId: string;
  date: string;
  waterML: number;
  steps: number;
  sleepHrs: number;
  caloriesIn: number;
  caloriesOut: number;
}

/* --------------------------- Measurements -------------------------- */

export interface Measurement {
  id: string;
  memberId: string;
  date: string;
  weightKg: number;
  bodyFat: number;
  muscle: number;
  water: number;
  bmi: number;
  chest: number;
  waist: number;
  hip: number;
  shoulders: number;
  arms: number;
  forearms: number;
  thighs: number;
  calves: number;
  neck: number;
  note?: string;
}

/* --------------------------- Equipment ----------------------------- */

export type EquipmentStatus = "operational" | "maintenance" | "repair" | "out_of_service";

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  usageHours: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  warrantyExpiry?: string;
  amcProvider?: string;
  notes?: string;
}

/* ---------------------------- Inventory ---------------------------- */

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  cost: number;
  price: number;
  unit: string;
}

/* ----------------------------- Products ---------------------------- */

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: "Protein" | "Supplements" | "Gym Wear" | "Accessories";
  description: string;
  price: number;
  compareAt?: number;
  stock: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  ref: string;
  memberId?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  couponCode?: string;
  createdAt: string;
}

/* ------------------------------- CRM ------------------------------- */

export type LeadSource = "website" | "whatsapp" | "facebook" | "instagram" | "google" | "referral" | "walkin";
export type LeadStatus = "new" | "contacted" | "interested" | "demo_booked" | "negotiation" | "won" | "lost";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  status: LeadStatus;
  tierInterested?: string;
  followUpAt?: string;
  assignedTo?: string;
  notes: string[];
  memberId?: string;
  createdAt: string;
}

/* --------------------------- Notifications ------------------------- */

export type NotifChannel = "app" | "whatsapp" | "email" | "sms" | "push";

export interface Notification {
  id: string;
  userId: string;
  channel: NotifChannel;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  memberId?: string;
  subject: string;
  body: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  assigneeId?: string;
  replies: { authorId: string; text: string; createdAt: string }[];
  createdAt: string;
  updatedAt?: string;
}

/* ----------------------------- Commerce ---------------------------- */

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  maxUses: number;
  uses: number;
  validFrom: string;
  validTo: string;
  active: boolean;
}

/* ------------------------------ Reviews ---------------------------- */

export interface Review {
  id: string;
  memberId: string;
  memberName: string;
  rating: number;
  comment: string;
  private?: boolean;
  channel?: "google" | "app";
  createdAt: string;
}

/* ---------------------------- Referrals ---------------------------- */

export interface Referral {
  id: string;
  code: string;
  ownerId: string;
  uses: number;
  rewardPoints: number;
  totalRewarded: number;
}

/* -------------------------- Gamification --------------------------- */

export interface Achievement {
  id: string;
  memberId: string;
  badge: string;
  title: string;
  description: string;
  xp: number;
  unlockedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  metric: string;
  goal: number;
  rewardXp: number;
  startsAt: string;
  endsAt: string;
  participants: { memberId: string; value: number; updatedAt: string }[];
}

/* ------------------------------ Auth ------------------------------- */

export interface OTP {
  id: string;
  identifier: string;
  code: string;
  purpose: "login" | "register" | "reset";
  expiresAt: string;
}

/* --------------------------- Automation ---------------------------- */

export type AutomationType =
  | "welcome"
  | "booking_confirmed"
  | "class_reminder"
  | "appointment_reminder"
  | "payment_receipt"
  | "invoice"
  | "membership_expiry"
  | "renewal_reminder"
  | "birthday"
  | "festival"
  | "workout_reminder"
  | "water_reminder"
  | "meal_reminder"
  | "missed_workout"
  | "progress_update"
  | "offer"
  | "review_request"
  | "otp"
  | "welcome_whatsapp";

export interface AutomationLog {
  id: string;
  type: AutomationType;
  channel: NotifChannel;
  recipient: string;
  summary: string;
  status: "sent" | "simulated" | "failed";
  createdAt: string;
}

/* ----------------------------- Audit ------------------------------- */

export interface AuditEntry {
  id: string;
  actorId: string;
  actorName?: string;
  action: string;
  targetId?: string;
  meta?: string;
  createdAt: string;
}

/* ---------------------------- Settings ----------------------------- */

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
}

export interface Settings {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  address: string;
  city: string;
  branches: Branch[];
  gstin: string;
  hours: string;
  referralDiscountPct: number;
  demoMode: boolean;
  demoAnchor: string; // seed date, used to roll demo data forward
}

/* ------------------------------- DB -------------------------------- */

export interface DB {
  users: User[];
  memberships: Membership[];
  plans: MembershipPlan[];
  payments: Payment[];
  invoices: Invoice[];
  attendance: Attendance[];
  classes: GymClass[];
  rooms: ClassRoom[];
  bookings: Booking[];
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  workoutLogs: WorkoutLog[];
  dietPlans: DietPlan[];
  mealLogs: MealLog[];
  dailyStats: DailyStat[];
  measurements: Measurement[];
  equipment: Equipment[];
  inventory: InventoryItem[];
  products: Product[];
  orders: Order[];
  leads: Lead[];
  notifications: Notification[];
  messages: Message[];
  tickets: Ticket[];
  coupons: Coupon[];
  reviews: Review[];
  referrals: Referral[];
  achievements: Achievement[];
  challenges: Challenge[];
  otps: OTP[];
  automationLogs: AutomationLog[];
  auditLogs: AuditEntry[];
  settings: Settings;
  counters: Record<string, number>;
}
