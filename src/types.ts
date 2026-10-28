/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VehicleType = 'cng_auto' | 'easy_bike' | 'cng_deluxe';
export type MapType = 'begum_rokeya' | 'shahbagh_rd';

export interface VehicleConfig {
  id: VehicleType;
  name: string;
  subName: string;
  description: string;
  topSpeed: number; // km/h
  acceleration: number;
  braking: number;
  handling: number;
  fuelCapacity: number;
  passengerCapacity: number;
  price: number;
  unlocked: boolean;
  color: string;
}

export interface Mission {
  id: string;
  passengerName: string;
  passengerCount: number;
  pickupLocation: { x: number; z: number; name: string };
  dropoffLocation: { x: number; z: number; name: string };
  fare: number; // in Taka ৳
  distance: number;
  status: 'available' | 'in_progress' | 'completed';
}

export type ShopCategory =
  | 'tea_egg_stall'     // চায়ের দোকান / ডিম স্টল (৳1,500)
  | 'hawker_market'     // ছাতার নিচে হকার মার্কেট (৳3,000)
  | 'vegetable_cart'    // সবজির ঠেলাগাড়ি ও মাটির পসরা (৳2,000)
  | 'fruit_cart'        // ফলের ঠেলাগাড়ি (৳2,000)
  | 'pitha_stall'       // চিতই ও ভাপা পিঠার স্টল (৳1,200)
  | 'jhalmuri_cart'     // ঝালমুড়ির টিনের বাক্স গাড়ি (৳800)
  | 'paan_bidi_stall'   // পান-সিগারেট ও খিলি পানের দোকান (৳1,000)
  | 'balloon_vendor'    // রঙিন গ্যাসের বেলুন বিক্রেতা (৳800)
  | 'book_stall'        // পুরোনো বই ও ম্যাগাজিন স্টল (৳2,500)
  | 'mobile_accessories'// মোবাইল কভার ও হেডফোন পসরা (৳3,500)
  | 'flower_seller'     // রজনীগন্ধা ও গাঁদা ফুলের ডালা (৳1,500)
  | 'tailor_pharmacy'   // ফার্মেসি ও টেইলার্স শপ (৳5,000)
  | 'biryani_hotel'     // বিরিয়ানির দোকান (৳8,000)
  | 'electronics_shop'; // ইলেকট্রনিক্স দোকান (৳15,000)

export interface BreakableShop {
  id: string;
  type: ShopCategory;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  repairCost: number;
  isBroken: boolean;
  reaction: string;
  meshGroup?: any;
}

export interface DebrisPiece {
  mesh: any;
  velocity: { x: number; y: number; z: number };
  rotVelocity: { x: number; y: number; z: number };
  life: number;
  maxLife: number;
}

export interface DamageItem {
  key: string;
  nameBangla: string;
  category: 'shop' | 'property' | 'vehicle';
  unitCost: number;
  count: number;
  totalCost: number;
  roadName: string;
}

export interface NationalLossRecord {
  totalLoss: number;
  date: string;
  headline: string;
  roadName: string;
}

export interface FloatingCostText {
  id: string;
  text: string;
  reaction?: string;
  screenX: number;
  screenY: number;
  opacity: number;
  life: number;
}

export interface CartoonImpactText {
  id: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  rot: number;
}

export interface NewspaperData {
  screenshotUrl: string;
  headline: string;
  subHeadline: string;
  dateStr: string;
  issueNo: string;
  roadName: string;
  totalLoss: number;
  remainingMoney: number;
  items: DamageItem[];
  articleParagraphs: string[];
  eggComparison: number;
  kettleComparison: number;
  bridgeBoltComparison: string;
  quotes: { speaker: string; quote: string }[];
  sideStories: { icon: string; title: string; snippet: string }[];
  ads: { title: string; text: string; phone: string }[];
  horoscope: string;
  sportsScore: string;
  readersLetter: string;
  historicalRecords: NationalLossRecord[];
}

export interface PlayerState {
  money: number;
  fuel: number;
  maxFuel: number;
  speedKmh: number;
  activeVehicle: VehicleType;
  currentMission: Mission | null;
  completedMissionsCount: number;
  damageIncurred: number;
  nationalLossTotal: number;
  publicAnger: number; // 0 to 100%
  settlementCost: number;
  speechBubble: string | null;
  speechBubbleSpeaker?: string;
  isGameOver: boolean;
  gameOverReason: string;
  currentRoadName: string;
  isMobSmashing: boolean;
  newspaperData: NewspaperData | null;
  floatingCostTexts: FloatingCostText[];
}

export type CameraMode =
  | 'low_chase'        // ১. লো চেজ (Street View উচ্চতা, FOV ~70)
  | 'high_chase'       // ২. হাই চেজ
  | 'cinematic_side'   // ৩. সিনেম্যাটিক সাইড-ফলো
  | 'first_person'     // ৪. ফার্স্ট পার্সন ড্রাইভার ভিউ (মিরর ও হ্যান্ডেলবার)
  | 'top_down'         // ৫. টপ-ডাউন ড্রোন ভিউ
  | 'photo_mode';      // ৬. ফটো মোড (ফ্রি ক্যামেরা, পজ, স্ক্রিনশট)

export type WeatherType =
  | 'morning'          // সকাল
  | 'noon'             // দুপুর
  | 'afternoon'        // বিকেল
  | 'evening'          // সন্ধ্যা
  | 'night'            // রাত
  | 'autumn'           // শরতের পরিষ্কার আকাশ
  | 'hot_sun'          // গরম রোদ
  | 'rain'             // বর্ষার ভারী বৃষ্টি
  | 'winter_fog';      // শীতের কুয়াশা

export const WEATHER_PRESETS: { id: WeatherType; name: string; icon: string; desc: string }[] = [
  { id: 'noon', name: 'দুপুর', icon: '☀️', desc: 'ঝকঝকে ঢাকার আকাশ ও উজ্জ্বল রোদ' },
  { id: 'morning', name: 'সকাল', icon: '🌅', desc: 'মিষ্টি সকালের নরম সোনালী রোদ' },
  { id: 'afternoon', name: 'বিকেল', icon: '🌇', desc: 'পড়ন্ত বিকেলের আমেজ ও লম্বা ছায়া' },
  { id: 'evening', name: 'সন্ধ্যা', icon: '🌆', desc: 'গোধূলি লালচে আকাশ ও সোডিয়াম বাতি' },
  { id: 'night', name: 'রাত', icon: '🌙', desc: 'চাঁদ-তারা, সোডিয়াম বাতি ও হেডলাইট' },
  { id: 'autumn', name: 'শরতের আকাশ', icon: '🌤️', desc: 'নীল আকাশ ও সাদা পেঁজা মেঘ' },
  { id: 'hot_sun', name: 'গরম রোদ', icon: '🔥', desc: 'তপ্ত দুপুর ও ঢাকার গরম আবহাওয়া' },
  { id: 'rain', name: 'ভারী বৃষ্টি', icon: '🌧️', desc: 'বর্ষার ঝুম বৃষ্টি, ভেজা রাস্তা ও ছিটকানি' },
  { id: 'winter_fog', name: 'শীতের কুয়াশা', icon: '🌫️', desc: 'ঢাকার মিষ্টি শীতের ঘন কুয়াশা' },
];

export const CAMERA_MODES: { id: CameraMode; name: string; num: string }[] = [
  { id: 'low_chase', name: 'লো চেজ', num: '১' },
  { id: 'high_chase', name: 'হাই চেজ', num: '২' },
  { id: 'cinematic_side', name: 'সাইড ফলো', num: '৩' },
  { id: 'first_person', name: 'ড্রাইভার ভিউ', num: '৪' },
  { id: 'top_down', name: 'ড্রোন ভিউ', num: '৫' },
  { id: 'photo_mode', name: 'ফটো মোড', num: '৬' },
];

export interface GameSettings {
  soundEnabled: boolean;
  quality: 'low' | 'medium' | 'high';
  fpsCap: 30 | 60;
  cameraMode: CameraMode;
  weather: WeatherType;
  useEnglishNumerals: boolean;
}

// Convert Latin digits to Bangla digits: 0-9 -> ০-৯
export function toBanglaNumber(num: number | string, useEnglish: boolean = false): string {
  const s = typeof num === 'number' ? Math.round(num).toLocaleString('en-US') : String(num);
  if (useEnglish) return s;
  const banglaDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    ',': ',', '.': '.'
  };
  return s.split('').map(c => banglaDigits[c] || c).join('');
}
