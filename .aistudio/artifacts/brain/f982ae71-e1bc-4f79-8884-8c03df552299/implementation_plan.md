# Step 3: Public Chase, Mob Smash, National Loss Ledger & "দৈনিক গেন্জাম"

Comprehensive technical and visual architecture for Step 3 of Dhaka CNG Driver 3D, implementing a dynamic multi-tier public chase system, a slapstick cartoon mob smash sequence with canvas capture and procedural audio, an itemized National Loss Ledger, a crisp modern digital edition of the "দৈনিক গেন্জাম" newspaper modal, and an interactive 150+ headline live breaking news ticker.

## User Review & Confirmed Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during interactive clarification and govern the implementation:

- **Chase Intensity & Escape**: Balanced arcade chase mechanics. The player can escape escalating public swarms through high speeds (>35 km/h), cutting into alleys, mounting flyover ramps, sheltering at traffic police booths, or paying settlement amounts before being encircled.
- **Newspaper Aesthetic**: Crisp modern digital news edition for "দৈনিক গেন্জাম". High-contrast editorial typography (Noto Serif Bengali headlines, Hind Siliguri body), sharp multi-column broadsheet layout, sepia/halftone canvas photo framing, and crisp editorial data boxes.

---

## 1. Overview & Core Concept

Step 3 introduces the chaotic, humorous social consequences of reckless driving in Dhaka:
- **Escalating Public Anger & Chase**: Hitting pedestrians, crashing into tea stalls, or smashing public property triggers public anger tiers (40% shouts, 70% foot/vehicle pursuit, 90% roadblocks).
- **Cartoon Mob Smash (Slapstick)**: If cornered (3+ people within 2m, speed < 5 km/h), a 3–5 second comedic sequence plays with camera shake, comic pop-ups ("ধুপধাপ!", "ঠাস!", "ধ্যাড়ং!", "ফটাস!"), parts flying off the CNG (canopy, jali, wheels, seat), ending with the driver scurrying away in a cloud of dust and zero gore.
- **জাতীয় ক্ষতির হিসাব (National Loss Ledger)**: Real-time damage accounting tracking 17 specific public and private property costs, persisted to `localStorage`.
- **"দৈনিক গেন্জাম" Newspaper**: Full-screen post-incident broadsheet featuring dynamic satirical headlines, the captured smash canvas screenshot, eyewitness testimonies, funny ads, horoscopes, and sports scores, exportable as PNG.
- **Live News Ticker**: Pinned interactive ticker running along the bottom with 150+ humorous Dhaka headlines, live loss stats, and clickable front-page inspection.

---

## 2. User Experience & Visual Design

### A. Public Chase & Escape Mechanics
- **Anger Tier 1 (40% - 69%)**: Shouting speech bubbles appear over nearby crowds and shopkeepers ("ধর ধর!", "মামার লাইসেন্স বাতিল করো!", "এই ব্যাটা খাড়া!"). Ambient honking intensifies.
- **Anger Tier 2 (70% - 89%)**: Pedestrians jog and sprint toward the CNG; nearby rickshaws and delivery bikes flank and chase the vehicle.
- **Anger Tier 3 (90% - 100%)**: Roadblocks appear ahead (crowds gathered with bamboo poles and street barriers).
- **Escape Affordances**:
  - **Speed**: Sustaining > 35 km/h for 4 seconds outruns on-foot mobs.
  - **Police Booths**: Driving within 8m of a Dhaka Metropolitan Traffic Police booth calms the crowd and triggers police whistle audio.
  - **Flyover Ramp**: Ascending the Mirpur-Agargaon viaduct ramp leaves ground crowds behind.
  - **Settlement**: Pressing "মিটমাট করুন" pays calculated settlement money from the player's cash before being encircled.

### B. Cartoon Slapstick Mob Smash
- **Trigger**: 3+ angry pursuers within 2m while CNG speed is < 5 km/h.
- **Cinematics**: Slow-motion factor (0.35x), camera shake, comic dust puff particles.
- **Disassembly**: Procedural detachment of 5 parts with physics arcs (roof canopy, side jali panels, front wheel, rear wheels, passenger seat cushion).
- **Driver Silhouette**: Cartoon character wearing lungi scurries away unharmed to the sidewalk.
- **Audio Rig**: Procedural Web Audio synthesized slaps, wooden thuds, metallic clangs, crowd clamor, and a resonant final gong ("ঠং").
- **Canvas Capture**: Grabs high-res canvas frame via `preserveDrawingBuffer` with sepia/halftone rendering.

### C. "দৈনিক গেন্জাম" Newspaper Modal (Crisp Modern Digital Edition)
- **Header**: Masthead "দৈনিক গেন্জাম" in bold Noto Serif Bengali, tagline "যেখানে গন্ডগোল সেখানেই আমরা", date in Bangla numerals (e.g. "১৫ কার্তিক ১৪৩১"), price "৳৫".
- **Lead Story**:
  - Dynamic headline generated from run statistics: *"{road}-এ অটোরিকশার তাণ্ডব: {shopCount}টি দোকান উধাও, জনতার হাতে গাড়ির চা-নাস্তা!"*
  - Photo frame with captured WebGL screenshot and witty caption.
  - 4-paragraph satirical news report featuring fictional witness quotes (*"আমার ১৪ বছরের কেটলি আজ শহীদ হইলো!"*, *"সিএনজি ছিল না যেন উড়ন্ত মিসাইল!"*).
- **National Loss Breakdown Box**:
  - Grand total in Bengali numerals (`৳১২,৫০০`).
  - Humorous equivalence metric (*"এই টাকায় ৩৭১টি ডিম কেনা যেত"* or *"এই টাকায় ৪২ প্লেট কাচ্চি বিরিয়ানি হতো"*).
  - Itemized damage tally.
  - Remaining cash balance and top-3 all-time records from `localStorage`.
- **Side Columns & Satirical Content**:
  - রাশিফল (Horoscope for Dhaka drivers).
  - আজকের কার্টুন / জ্যামের সূচক.
  - খেলাধুলার খবর (*"ঢাকা গর্ত একাদশ ২ - ১ ফুটপাত বিজয়ী"*).
  - ক্লাসিফায়েড বিজ্ঞাপন (ভাঙারি মামা, হাকিম সাহেবের ভেষজ হালুয়া, জিনের বাদশা বাবা, ধৈর্য কোচিং সেন্টার).
- **Actions**: "আবার খেলুন" (Instant restart), "পত্রিকা ডাউনলোড করুন" (HTML5 2D Canvas 1080x1600 PNG download), "মেনুতে ফিরুন".

### D. Live News Ticker Strip (Bottom HUD)
- Pinned horizontal ticker with red "দৈনিক গেন্জাম লাইভ" badge and animated ping dot.
- Pool of 150+ authentic, satirical Dhaka news lines, damage counter, and rotating funny ads every 10 seconds.
- Interactive: Clicking the ticker opens the front page view and pauses the drive.

---

## 3. Key Technical Decisions & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Main Controller)                       │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
   ┌──────────────────────────────┐  ┌───────────────────────────────────┐
   │    GameEngine.ts (3D World)  │  │        React HUD & Modals         │
   ├──────────────────────────────┤  ├───────────────────────────────────┤
   │ - PublicAngerSystem.ts       │  │ - HUD.tsx (Speed, Fuel, Anger)    │
   │ - LossLedger.ts              │  │ - NewsTicker.tsx (150+ lines)     │
   │ - PedestrianCrowd.ts (Chase) │  │ - NewspaperModal.tsx (PNG export) │
   │ - DhakaCity.ts (Police Booth)│  │ - Minimap.tsx                     │
   │ - SoundEffects.ts (WebAudio) │  │ - GameOverModal.tsx               │
   └──────────────────────────────┘  └───────────────────────────────────┘
```

### Damage Cost Catalog (`LossLedger.ts`)
| Item Key | Bangla Name | Unit Cost |
| :--- | :--- | :--- |
| `tea_stall` | টং চায়ের দোকান | ৳১,৫০০ |
| `fruit_cart` | ফলের ঠেলাগাড়ি | ৳১,০০০ |
| `umbrella_hawker` | ছাতা হকার দোকান | ৳৩,০০০ |
| `pharmacy` | ফুটপাত ফার্মেসি | ৳৫,০০০ |
| `biryani_shop` | কাচ্চি বিরিয়ানির দোকান | ৳৮,০০০ |
| `electronics` | ইলেকট্রনিক্স মেকানিক স্টল | ৳১৫,০০০ |
| `footpath_tile` | ফুটপাতের টাইলস | ৳২০০ |
| `planter` | রোডসাইড ফুলের টব | ৳৮০০ |
| `bollard` | ফুটপাত লোহার বোলার্ড | ৳১,২০০ |
| `kerb_block` | ডিভাইডার কার্ব ব্লক | ৳৬০০ |
| `traffic_cone` | ট্রাফিক কোন | ৳১৫০ |
| `street_lamp` | সড়ক বাতি পোল | ৳২৫,০০০ |
| `signboard` | দোকানের সাইনবোর্ড | ৳৩,৫০০ |
| `billboard` | বড় মেগা বিলবোর্ড | ৳২০,০০০ |
| `electric_pole` | বৈদ্যুতিক খুঁটি ও তার | ৳৫০,০০০ |
| `car_dent` | প্রাইভেট কার ডেন্ট | ৳১০,০০০ |
| `bus_mirror` | বাসের সাইড মিরর | ৳২,৫০০ |

---

## 4. Verification & Testing Strategy

- **Chase & Anger Verification**: Trigger damage to exceed 40%, 70%, and 90% anger thresholds; verify speech bubbles, pursuit animations, and escape mechanics (speeding, police booth safety, settlement payment).
- **Mob Smash Cinematic**: Stop near 3+ angry pedestrians; verify camera shake, 4 cartoon pop-up labels, model parts disassembly, dust clouds, and harmless driver scramble.
- **Audio Verification**: Verify mob thump, slap, clang, crowd murmur, and closing "ঠং" sound synthesis via Web Audio API.
- **Newspaper Presentation**: Inspect crisp modern digital layout of "দৈনিক গেন্জাম" upon game over or ticker tap, verify dynamic story generation, PNG image canvas export, and `localStorage` high-score records.
- **Build Verification**: Run `compile_applet` and `lint_applet` ensuring clean compilation with zero warnings or errors.
