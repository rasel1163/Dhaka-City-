# Implementation Plan — Step 2: Footpath Shops, Living Crowds, Pedestrian Slapstick & Dhaka Traffic Rules

Expand *ঢাকা সিএনজি ড্রাইভার ৩ডি* on Begum Rokeya Avenue (Mirpur-10) with dense breakable footpath bazaars, living crowds with authentic Bangladeshi attire and role archetypes, cartoon slapstick pedestrian bump physics, and authentic Dhaka traffic flow (lighter player lane, zero rear-end ramming, and aggressive AI lane cutting).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions have been confirmed via interactive clarification:
> - **Pedestrian Collision Slapstick**: Classic Cartoon Slapstick (Pedestrians launched airborne with comic spin, landing dizzy with orbiting yellow cartoon stars, funny pop-up text like `ঠাস!`, `ওরে বাবা!`, zero gore/injury).
> - **Footpath Stall Density**: Dense Continuous Bazaar (A lively continuous stretch of tea stalls, fruit/veg carts, pitha, jhalmuri, paan-bidi, balloon vendors, and mobile accessories along both sidewalks).
> - **Camera Follow & Steering Alignment**: Direct Rear Follow (Camera locks tightly directly behind the CNG, keeping forward driving and steering intuitive and responsive).
> - **Traffic Safety Rule**: AI vehicles in the player's lane will never ram the player from behind; rear-end collisions are completely suppressed while front/side collisions retain full slapstick impact and financial damage.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Turns the sidewalks of Begum Rokeya Avenue into a vibrant, interactive Bangladeshi street bazaar. Every vendor stall, cart, parasol, stool, kettle, and display rack can be smashed by the CNG, erupting into physical debris chunks (bamboo, blue tarps, tumbling coconuts, rolling eggplants, flying tea kettles, and floating balloons) with sound effects and Bangla shouts.
  - Populates footpaths, bus stops, and zebra crossings with up to 80 animated pedestrians in authentic clothing (lungis, sarees, panjabis, burqas, school uniforms). Crowds chat, bargain, drink tea, dodge honking horns, and include fun archetypes like a phone vlogger (*"ভাইয়ারা আজকে আমরা..."*) and shouting vendors (*"চা গরম!"*).
  - Implements cartoon slapstick pedestrian collisions: pedestrians fly in comic arcs, spin, land, and shake their heads with orbiting cartoon stars and damage compensation fees.
  - Implements authentic Dhaka traffic rules: player's forward lane has breathing room, AI never rear-ends the player, and opposite lanes feature dense gridlock with buses and rickshaws cutting lanes.

---

## 2. User Experience & Visual Design

### Breakable Footpath Vendor Categories
1. **টং চায়ের দোকান (Tea & Biscuit Stalls — ৳১,৫০০)**: Tin counter, steaming aluminum kettle, glass biscuit jars, plastic stools, condensed milk cans.
2. **হকার মার্কেট (Umbrella Hawkers — ৳৩,০০০)**: Large colorful beach umbrellas, clothing stacks, rows of slippers/sandals.
3. **সবজির ঠেলাগাড়ি (Vegetable Carts — ৳২,০০০)**: Heaps of eggplants, potatoes, onions, green chilies, and cabbage scattering across the sidewalk.
4. **ফলের ডালা (Fruit Carts — ৳২,০০০)**: Watermelons, bananas, pineapples, and papayas rolling into the road.
5. **ভাপা ও চিতই পিঠার দোকান (Pitha Stalls — ৳১,২০০)**: Earthen clay stoves, steaming cloth pots, molasses jars.
6. **ঝালমুড়ি ও ফুচকার ভ্যান (Jhalmuri Carts — ৳৮০০)**: Mustard oil bottles, puffed rice tin drums, chanachur trays.
7. **পানের ডালা (Paan-Bidi Stalls — ৳১,০০০)**: Betel leaf trays, areca nuts, bidi packs.
8. **বেলুন বিক্রেতা (Balloon Vendors — ৳৮০০)**: Floating cluster of colorful gas balloons that pop and disperse skyward when bumped.
9. **বই ও ম্যাগাজিন স্টল (Book Stalls — ৳২,৫০০)**: Paperbacks and newspapers flying as fluttering pages.
10. **মোবাইল এক্সেসরিজ (Mobile Accessories — ৳৩,৫০০)**: Phone covers and screen protectors.

### Slapstick Visual FX & Audio
- **Fruit & Vegetable Scatter**: Dynamic 3D debris pieces with random velocities, angular spin, gravity bounce, and 3-second fading.
- **Floating Loss Popups**: Floating red tags (`-৳১,৫০০`, `-৳২,০০০`) with Bengali merchant reactions (*"হায় হায়! আমার সবজির গাড়ি শ্যাষ!"*).
- **Pedestrian Slapstick**: Hit pedestrians launch in a harmless comic arc, land on their bottoms, and dizzy yellow cartoon stars orbit their heads alongside slapstick text tags (`ঠাস!`, `বুম!`, `ওরে বাবা!`).
- **Public Anger (গণরোষ)**: Hitting pedestrians spikes anger rapidly (+25%) and adds a legal settlement fine (`ক্ষতিপূরণ ৳৫,০০০`). Nearby pedestrians pull out smartphones to film the incident.

### Direct Rear Driving Camera
- Camera smoothly tracks directly behind the CNG at street-level height (1.8m) and distance (4.6m), closely following the vehicle's heading vector for intuitive forward driving and sharp alleyway turning.

---

## 3. Key Product Decisions & Trade-Offs

- **No Rear-End Ramming**:
  - *Chosen Approach*: Traffic vehicles approaching from behind automatically check distance to the player; if within 12 meters, they slow down, honk, and smoothly steer to an adjacent lane. Rear collision damage is strictly ignored.
  - *Why*: Prevents frustrating deaths and ensures the player controls the pace of driving and collisions.
- **Lighter Player Lane vs. Dense Opposite Lane**:
  - *Chosen Approach*: Traffic spawning actively filters player lane occupancy, maintaining a light forward convoy of slow rickshaws/cars, while oncoming lanes are densely packed with heavy buses and trucks.
  - *Why*: Provides high visual authenticity of Dhaka congestion without making the player's path an unplayable wall of stopped vehicles.
- **Instanced & Reusable Debris Pool**:
  - *Chosen Approach*: Maintain an active debris pool of up to 40 simultaneous physical debris pieces, recycling oldest meshes to maintain consistent 60 FPS during multi-stall demolition runs.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GameEngine Physics Loop                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────┐                         ┌───────────────────────┐
│ BreakableShopManager │                         │   PedestrianCrowd     │
│ - 12 Vendor Types    │                         │ - 80 Instanced Figures│
│ - Debris Scatter     │                         │ - Slapstick Arc Launch│
│ - Floating ৳ Loss    │                         │ - Orbiting Stars FX   │
│ - Bangla Reactions   │                         │ - Phone Filming / Run │
└──────────┬───────────┘                         └───────────┬───────────┘
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    ▼
                         ┌───────────────────────┐
                         │    TrafficManager     │
                         │ - Light Player Lane   │
                         │ - Dense Opposite Lane │
                         │ - Rear-End Prevention │
                         │ - Front/Side Dents    │
                         └───────────────────────┘
```

### Module Upgrades
1. **`src/game/PedestrianCrowd.ts`**:
   - Upgraded to support 80 distinct pedestrians with 6 Bangladeshi clothing palettes (lungis, sarees, school uniforms, burqas, panjabis).
   - Slapstick hit state: launches upward with arc trajectory, landing recovery animation, yellow rotating star mesh, and comic impact text.
   - Reactive AI: pedestrians step back onto footpaths when the player sounds the horn (`H` / `Space`).
2. **`src/world/DhakaCity.ts`**:
   - Populate Begum Rokeya Avenue footpaths with a continuous bazaar of 24+ breakable stalls and carts.
   - Every cart and stall has defined dimensions, repair costs, and custom debris meshes (kettles, eggplants, umbrellas, plastic stools).
3. **`src/game/TrafficManager.ts`**:
   - Asymmetric lane density logic: filters spawn rates so the player's lane is open with occasional slow obstacles, while oncoming lanes are heavily congested.
   - Rear collision check: vehicles behind the player decelerate and switch lanes, preventing rear-end hits.
   - Front/side collisions register car dents (`৳১০,০০০`), bus mirrors (`৳২,৫০০`), and driver honk reactions.
4. **`src/game/CameraDirector.ts`**:
   - `low_chase` tightened into direct rear follow with rapid angular damping for natural steering responsiveness.
