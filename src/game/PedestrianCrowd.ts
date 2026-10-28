/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Pedestrian, PublicAngerSystem } from './PublicAngerSystem';
import { soundEffects } from '../audio/SoundEffects';

export interface PedestrianCollisionResult {
  nearCount: number;
  surrounded: boolean;
  hitPedestrian: boolean;
  hitPosition?: { x: number; y: number; z: number };
  comicLine?: string;
  compensationAmount: number;
}

export class PedestrianCrowd {
  public scene: THREE.Group;
  public pedestrians: Pedestrian[] = [];

  // Cartoon 3D star shared geometry & material for dizzy effect
  private starGeometry = new THREE.OctahedronGeometry(0.08, 0);
  private starMaterial = new THREE.MeshBasicMaterial({ color: 0xffe600 }); // Vibrant cartoon yellow

  constructor(parentScene: THREE.Scene) {
    this.scene = new THREE.Group();
    this.scene.name = 'Dhaka_Pedestrian_Crowd';
    parentScene.add(this.scene);
    this.spawnDhakaCrowds();
  }

  // --- SPAWN LIVING DHAKA CROWD (UP TO 80 PEDESTRIANS ON BEGUM ROKEYA AVE) ---
  private spawnDhakaCrowds() {
    const totalPedestrians = 78;

    // Begum Rokeya Avenue footpath Z spans from Mirpur-10 (+460) to Agargaon / Farmgate (-200)
    const zBands = [
      440, 400, 360, 330, 290, 250, 210, 180, 140, 100, 60, 20, -20, -60, -100, -140, -180
    ];

    let pedId = 0;

    zBands.forEach((baseZ, bandIdx) => {
      // 4 to 5 pedestrians per Z band
      const countInBand = bandIdx % 3 === 0 ? 5 : 4;

      for (let i = 0; i < countInBand; i++) {
        pedId++;
        // Left footpath (x ~ -14.6 to -16.2) or Right footpath (x ~ 14.6 to 16.2)
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (14.4 + (i * 0.45) % 1.8);
        const z = baseZ + (i - 2) * 8 + (Math.random() - 0.5) * 6;

        this.createDhakaPedestrian(pedId, x, z);
      }
    });

    // Zebra Crossings / Mid-road crossers (near stations)
    [320, 180, 40, -100].forEach((crossZ, idx) => {
      pedId++;
      this.createDhakaPedestrian(pedId, (idx % 2 === 0 ? -10 : 10), crossZ, true);
    });
  }

  private createDhakaPedestrian(idNum: number, x: number, z: number, isCrossingZebra: boolean = false) {
    const group = new THREE.Group();
    group.position.set(x, 0.16, z);

    // Random Bengali attire type
    const randAttire = Math.random();
    let attireType: 'lungi' | 'panjabi' | 'saree' | 'salwar' | 'burqa' | 'shirt_pant' | 'school' = 'lungi';
    let attireColor = 0x2b9348; // Default green

    if (randAttire < 0.22) {
      attireType = 'lungi';
      const lungiColors = [0x2b9348, 0x0077b6, 0x582f0e, 0x1d3557, 0x005f73];
      attireColor = lungiColors[idNum % lungiColors.length];
    } else if (randAttire < 0.40) {
      attireType = 'panjabi';
      const panjabiColors = [0xf8f9fa, 0xffd166, 0x023e8a, 0xe9d8a6, 0x606c38];
      attireColor = panjabiColors[idNum % panjabiColors.length];
    } else if (randAttire < 0.54) {
      attireType = 'saree';
      const sareeColors = [0xd90429, 0x007f5f, 0x7209b7, 0xf72585, 0xca6702];
      attireColor = sareeColors[idNum % sareeColors.length];
    } else if (randAttire < 0.68) {
      attireType = 'salwar';
      const salwarColors = [0xff006e, 0x3a0ca3, 0x48cae4, 0x9b5de5];
      attireColor = salwarColors[idNum % salwarColors.length];
    } else if (randAttire < 0.78) {
      attireType = 'burqa';
      attireColor = 0x1a1a1a;
    } else if (randAttire < 0.88) {
      attireType = 'school';
      attireColor = 0x1e3a8a; // Navy uniform
    } else {
      attireType = 'shirt_pant';
      attireColor = 0x3b82f6;
    }

    const skinColors = [0x8d5b4c, 0xa16e5c, 0x794d3f, 0xb07d6b];
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColors[idNum % skinColors.length],
      roughness: 0.65,
    });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const attireMat = new THREE.MeshStandardMaterial({ color: attireColor, roughness: 0.8 });

    // --- BODY MESHES BY ATTIRE ---
    if (attireType === 'saree' || attireType === 'burqa') {
      // Flowing draped lower garment
      const dress = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.25, 8), attireMat);
      dress.position.y = 0.65;
      dress.castShadow = true;
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.5, 8), attireMat);
      upper.position.y = 1.15;
      group.add(dress, upper);

      // Sari pallu drape across shoulder
      if (attireType === 'saree') {
        const palluMat = new THREE.MeshStandardMaterial({
          color: attireColor === 0xd90429 ? 0xf4a261 : 0xffbe0b,
          roughness: 0.7,
        });
        const pallu = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.32), palluMat);
        pallu.position.set(-0.14, 1.05, 0.05);
        pallu.rotation.z = 0.3;
        group.add(pallu);
      }
    } else if (attireType === 'lungi') {
      // Lungi: lower cylinder + vest/shirt upper
      const lungi = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.75, 8), attireMat);
      lungi.position.y = 0.48;
      lungi.castShadow = true;
      const vest = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.22, 0.55, 8),
        new THREE.MeshStandardMaterial({ color: 0xf5f3f4, roughness: 0.9 })
      );
      vest.position.y = 1.05;
      group.add(lungi, vest);

      // Gamcha over shoulder
      const gamchaMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.9 });
      const gamcha = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.26), gamchaMat);
      gamcha.position.set(0.18, 1.1, 0);
      group.add(gamcha);
    } else if (attireType === 'school') {
      // School uniform: Navy trousers + white shirt + dark backpack
      const trousers = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.65, 8), attireMat);
      trousers.position.y = 0.42;
      const whiteShirt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 })
      );
      whiteShirt.position.y = 0.95;
      const backpack = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.35, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      backpack.position.set(0, 0.95, -0.18);
      group.add(trousers, whiteShirt, backpack);
    } else {
      // Panjabi or Casual Shirt-Pant
      const lower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.22, 0.85, 8),
        attireType === 'panjabi' ? attireMat : new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      lower.position.y = 0.85;
      lower.castShadow = true;
      group.add(lower);
    }

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
    head.position.y = 1.45;
    group.add(head);

    // Prayer Topi for Panjabi, Hair for others
    if (attireType === 'panjabi' && Math.random() > 0.3) {
      const topi = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      topi.position.y = 1.58;
      group.add(topi);
    } else if (attireType !== 'burqa') {
      const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 8), hairMat);
      hair.position.y = 1.58;
      group.add(hair);
    }

    // --- ACCESSORIES & ROLES ---
    let activity: 'walking' | 'shopping' | 'vlogging' | 'tea' | 'newspaper' | 'school' | 'vendor' | 'dancing' = 'walking';
    const randRole = Math.random();

    if (attireType === 'school') {
      activity = 'school';
    } else if (randRole < 0.15) {
      // Vlogger holding selfie stick with glowing smartphone ("ভ্লগার ভাই")
      activity = 'vlogging';
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.65, 6),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 })
      );
      stick.position.set(0.18, 1.45, 0.35);
      stick.rotation.x = -Math.PI / 4;
      const phone = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.14, 0.02),
        new THREE.MeshBasicMaterial({ color: 0x00f5d4 }) // Glowing screen
      );
      phone.position.set(0.18, 1.68, 0.58);
      group.add(stick, phone);
    } else if (randRole < 0.30) {
      // Tong tea drinker (drinking tea near stalls)
      activity = 'tea';
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.03, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      cup.position.set(0.18, 1.15, 0.18);
      group.add(cup);
    } else if (randRole < 0.44) {
      // Bazaar Shopping bags
      activity = 'shopping';
      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.3, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x90be6d })
      );
      bag.position.set(0.26, 0.65, 0.08);
      group.add(bag);
    } else if (randRole < 0.54) {
      // Newspaper reader ("দৈনিক গেন্জাম" পাঠক)
      activity = 'newspaper';
      const paper = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.22, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xfefae0, roughness: 0.9 })
      );
      paper.position.set(0, 1.25, 0.25);
      paper.rotation.x = -Math.PI / 6;
      group.add(paper);
    } else if (randRole < 0.64) {
      // Street vendor shouting
      activity = 'vendor';
    } else if (randRole < 0.72) {
      // Lively youth group / dancing
      activity = 'dancing';
    }

    // Optional Umbrella (20% chance)
    const hasUmbrella = Math.random() > 0.8;
    if (hasUmbrella) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      pole.position.set(0.25, 1.3, 0);
      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(0.65, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, side: THREE.DoubleSide })
      );
      canopy.position.set(0.25, 1.85, 0);
      group.add(pole, canopy);
    }

    // --- CARTOON ORBITING STARS GROUP (FOR DIZZY SLAPSTICK STATE) ---
    const starsGroup = new THREE.Group();
    starsGroup.position.set(0, 1.8, 0); // Above head
    starsGroup.visible = false;

    // 3 yellow stars arranged in a halo
    for (let s = 0; s < 3; s++) {
      const star = new THREE.Mesh(this.starGeometry, this.starMaterial);
      const angle = (s * Math.PI * 2) / 3;
      star.position.set(Math.cos(angle) * 0.32, (s % 2) * 0.06, Math.sin(angle) * 0.32);
      starsGroup.add(star);
    }
    group.add(starsGroup);

    this.scene.add(group);

    this.pedestrians.push({
      id: `dhaka_ped_${idNum}`,
      mesh: group,
      x,
      z,
      baseY: 0.16,
      targetX: isCrossingZebra ? -x : x,
      targetZ: z + (Math.random() > 0.5 ? 40 : -40),
      speed: 1.1 + Math.random() * 0.6,
      state: isCrossingZebra ? 'crossing' : 'walking',
      stateTimer: 0,
      attireColor,
      hasUmbrella,
      shoutCooldown: Math.random() * 6,
      activity,
      attireType,
      starsGroup,
      dizzyTimer: 0,
    });
  }

  // --- UPDATE LOOP WITH HORN EVASION & CARTOON SLAPSTICK LAUNCH ---
  public update(
    dt: number,
    playerX: number,
    playerZ: number,
    playerSpeed: number,
    angerSystem: PublicAngerSystem,
    isHornActive: boolean = false
  ): PedestrianCollisionResult {
    let nearCount = 0;
    let hitPedestrian = false;
    let hitPosition: { x: number; y: number; z: number } | undefined;
    let comicLine: string | undefined;

    const comicHitLines = [
      'ঠাস! ওরে বাবা রে! বিমান ল্যান্ড করলো নাকি?!',
      'ফটাস! আমার স্পঞ্জের স্যান্ডেল উড়ে গেল!',
      'ধ্যাড়ং! ফুটপাত দিয়া রকেট চালায়!',
      'মাগো! আমি আকাশে উড়ে গেলাম!',
      'পটাশ! ভাই, আমার চশমাটা খুইজা দেন!',
      'বুম! চালকের লাইসেন্স চেক করো রে!',
    ];

    const vendorShouts = [
      'চা গরম! স্পেশাল মালাই চা!',
      'ঝালমুড়ি! এক প্লেট দশ টাকা!',
      'তাজা দেশি আলু নেন আলু!',
      'রঙিন গ্যাসের বেলুন নেন!',
      'গরম চিতই আর ডিম ভাপা!',
    ];

    this.pedestrians.forEach(p => {
      const dx = playerX - p.mesh.position.x;
      const dz = playerZ - p.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 3.0) {
        nearCount++;
      }

      // 1. CARTOON SLAPSTICK COLLISION TRIGGER
      if (dist < 1.45 && Math.abs(playerSpeed) > 1.2 && p.state !== 'flying') {
        hitPedestrian = true;
        hitPosition = { x: p.mesh.position.x, y: p.mesh.position.y + 1.0, z: p.mesh.position.z };
        soundEffects.playCartoonBoing();
        soundEffects.playCrash(0.8);

        // High cartoon launch arc into the air
        p.state = 'flying';
        if (p.starsGroup) p.starsGroup.visible = false;

        const forwardForce = Math.max(6.0, Math.abs(playerSpeed) * 0.95);
        p.flyingVel = {
          x: -(dx / (dist || 1)) * forwardForce + (Math.random() - 0.5) * 5,
          y: 11.0 + Math.random() * 4.5, // High cartoon arc
          z: -(dz / (dist || 1)) * forwardForce + (Math.random() - 0.5) * 5,
        };

        // Increase anger strongly & trigger comic shout
        angerSystem.addAnger(25, 'পথচারীকে উড়িয়ে দেওয়া!');
        comicLine = comicHitLines[Math.floor(Math.random() * comicHitLines.length)];
        angerSystem.triggerSpeech(comicLine);
      }

      // 2. REACTION TO CNG HORN (Space / H)
      // Pedestrians jump back to safety towards the footpath edge
      if (isHornActive && dist < 16.0 && p.state !== 'flying' && p.state !== 'dizzy') {
        p.state = 'startled';
        const evadeDirection = Math.sign(p.mesh.position.x);
        p.mesh.position.x += evadeDirection * 4.2 * dt;
        p.mesh.position.y = p.baseY + Math.abs(Math.sin(Date.now() * 0.02)) * 0.2; // Little jump
        return;
      }

      // 3. STATE MACHINE
      if (p.state === 'flying') {
        if (!p.flyingVel) p.flyingVel = { x: 0, y: 8, z: 0 };

        // Apply cartoon arc trajectory
        p.mesh.position.x += p.flyingVel.x * dt;
        p.mesh.position.y += p.flyingVel.y * dt;
        p.mesh.position.z += p.flyingVel.z * dt;
        p.flyingVel.y -= 22 * dt; // Gravity

        // Comedic 360 cartwheel spins in the air
        p.mesh.rotation.x += 16 * dt;
        p.mesh.rotation.z += 14 * dt;

        // Land safely with soft cartoon bounce, then transition to DIZZY state
        if (p.mesh.position.y <= p.baseY) {
          p.mesh.position.y = p.baseY;
          p.mesh.rotation.x = 0;
          p.mesh.rotation.z = 0;
          p.state = 'dizzy';
          p.dizzyTimer = 3.5; // Dizzy for 3.5 seconds

          if (p.starsGroup) {
            p.starsGroup.visible = true;
          }
        }
      } else if (p.state === 'dizzy') {
        // DIZZY STATE: Orbiting yellow cartoon stars around head & comedic wobble
        p.dizzyTimer = (p.dizzyTimer || 3.5) - dt;

        if (p.starsGroup) {
          p.starsGroup.visible = true;
          p.starsGroup.rotation.y += 9 * dt; // Fast halo rotation
          p.starsGroup.children.forEach(c => (c.rotation.y += 12 * dt));
        }

        // Dizzy head wobble
        p.mesh.rotation.z = Math.sin(Date.now() * 0.008) * 0.28;
        p.mesh.rotation.y = Math.cos(Date.now() * 0.006) * 0.25;

        if (p.dizzyTimer <= 0) {
          // Recover into angry state
          p.state = 'angry';
          p.stateTimer = 4.0;
          p.mesh.rotation.z = 0;
          if (p.starsGroup) p.starsGroup.visible = false;
        }
      } else if (p.state === 'angry') {
        p.stateTimer -= dt;
        // Looking angry, shaking fist
        p.mesh.lookAt(playerX, p.mesh.position.y, playerZ);
        p.mesh.position.y = p.baseY + Math.abs(Math.sin(Date.now() * 0.015)) * 0.12;

        if (p.stateTimer <= 0) {
          p.state = 'walking';
          p.mesh.position.y = p.baseY;
        }
      } else if (angerSystem.anger >= 60 && dist < 22 && Math.abs(playerSpeed) < 3.5) {
        // High anger: angry mob furiously chases player rickshaw!
        p.state = 'chasing';
        const dirX = dx / (dist || 1);
        const dirZ = dz / (dist || 1);
        p.mesh.position.x += dirX * 3.4 * dt;
        p.mesh.position.z += dirZ * 3.4 * dt;
        p.mesh.lookAt(playerX, p.mesh.position.y, playerZ);

        // Furious bobbing run animation
        p.mesh.position.y = p.baseY + Math.abs(Math.sin(Date.now() * 0.012)) * 0.22;
      } else if (dist < 6.0 && Math.abs(playerSpeed) > 4.0) {
        // Startled by incoming rickshaw: step back towards footpath edge
        p.state = 'startled';
        const evadeX = Math.sign(p.mesh.position.x) * 2.5 * dt;
        p.mesh.position.x += evadeX;
      } else if (p.state === 'crossing') {
        // Zebra crossing walkers
        const dirX = Math.sign(p.targetX - p.mesh.position.x);
        p.mesh.position.x += dirX * (p.speed * 0.85) * dt;
        p.mesh.position.y = p.baseY + Math.abs(Math.sin(Date.now() * 0.008)) * 0.08;

        if (Math.abs(p.mesh.position.x - p.targetX) < 1.0) {
          p.targetX = -p.targetX;
        }
      } else {
        // Normal activity
        p.state = 'walking';
        p.mesh.position.y = p.baseY;

        if (p.activity === 'shopping' || p.activity === 'tea') {
          // Standing & browsing stalls, looking around
          p.mesh.rotation.y += Math.sin(Date.now() * 0.002) * 0.005;
        } else if (p.activity === 'vlogging') {
          // Turning around holding selfie phone
          p.mesh.rotation.y += dt * 0.45;
        } else if (p.activity === 'dancing') {
          // Lively swaying
          p.mesh.position.y = p.baseY + Math.abs(Math.sin(Date.now() * 0.008)) * 0.15;
          p.mesh.rotation.y += Math.sin(Date.now() * 0.004) * 0.02;
        } else if (p.activity === 'vendor') {
          // Periodic vendor shouts
          p.shoutCooldown -= dt;
          if (p.shoutCooldown <= 0 && dist < 14) {
            angerSystem.triggerSpeech(vendorShouts[Math.floor(Math.random() * vendorShouts.length)]);
            p.shoutCooldown = 12 + Math.random() * 10;
          }
        } else {
          // Walking along footpath
          const dirZ = Math.sign(p.targetZ - p.mesh.position.z);
          p.mesh.position.z += dirZ * p.speed * dt;
          p.mesh.position.y = p.baseY + Math.abs(Math.sin(Date.now() * 0.006)) * 0.06;

          if (Math.abs(p.mesh.position.z - p.targetZ) < 2.0) {
            p.targetZ = p.mesh.position.z + (Math.random() > 0.5 ? 45 : -45);
          }
        }
      }
    });

    const isSurrounded =
      (nearCount >= 3 && Math.abs(playerSpeed) < 1.2) || (nearCount >= 2 && angerSystem.anger >= 90);

    return {
      nearCount,
      surrounded: isSurrounded,
      hitPedestrian,
      hitPosition,
      comicLine,
      compensationAmount: 5000, // ৳5,000 compensation per hit pedestrian
    };
  }
}
