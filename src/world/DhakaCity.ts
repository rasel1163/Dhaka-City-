import { FunnyPosterFactory } from "../textures/FunnyPosterFactory";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CanvasTextureFactory } from '../textures/CanvasTextureFactory';
import { VehicleFactory } from './VehicleFactory';
import { BreakableShop } from '../types';

export class DhakaCity {
  public scene: THREE.Group;
  public shops: BreakableShop[] = [];
  public metroTrain: THREE.Group | null = null;
  public cngStationPosition = { x: 13.5, z: 80 };
  public policeBooths: { x: number; z: number; name: string }[] = [];
  public streetLamps: { light: THREE.PointLight; mat: THREE.MeshStandardMaterial }[] = [];

  // PBR materials for dynamic weather reaction (rain wetness, night windows, mosque illumination)
  public roadMaterials: THREE.MeshStandardMaterial[] = [];
  public nightMaterials: THREE.MeshStandardMaterial[] = [];
  public mosqueMaterials: THREE.MeshStandardMaterial[] = [];
  public neonMaterials: THREE.MeshStandardMaterial[] = [];

  // Waypoints spanning both Begum Rokeya Ave and Shahbagh Road
  public waypoints: { name: string; x: number; z: number; map: 'begum_rokeya' | 'shahbagh_rd' }[] = [
    { name: 'মিরপুর-১০ গোলচত্বর', x: -8, z: 320, map: 'begum_rokeya' },
    { name: 'কাজীপাড়া বাসস্ট্যান্ড', x: 8, z: 180, map: 'begum_rokeya' },
    { name: 'শেওড়াপাড়া বাজার', x: -8, z: 40, map: 'begum_rokeya' },
    { name: 'আগারগাঁও মেট্রো স্টেশন', x: 8, z: -100, map: 'begum_rokeya' },
    { name: 'ফার্মগেট মোড় জংশন', x: -8, z: -210, map: 'begum_rokeya' },
    // Shahbagh Road waypoints
    { name: 'শাহবাগ রোড প্রবেশপথ', x: 7, z: -320, map: 'shahbagh_rd' },
    { name: 'আজোয়া ও ফ্যাশন প্লাজা মার্কেট', x: -14, z: -520, map: 'shahbagh_rd' },
    { name: 'ঢাকা বিশ্ববিদ্যালয় চারুকলা মোড়', x: 7, z: -700, map: 'shahbagh_rd' },
    { name: 'শাহবাগ মোড় চত্বর', x: -8, z: -920, map: 'shahbagh_rd' },
  ];

  private metroZ: number = -200;
  private leavesMaterial: THREE.MeshStandardMaterial | null = null;

  constructor() {
    this.scene = new THREE.Group();
    this.scene.name = 'Dhaka_City_Environment';
    this.buildCity();
  }

  private buildCity() {
    // Section 1: Begum Rokeya Avenue (Z: -220 to +550) with Elevated Metro viaduct
    this.buildBegumRokeyaAvenue();

    // Section 1.5: Begum Rokeya Urban Infrastructure
    this.buildKaziparaFootOverbridge();
    this.buildBusStopsAndSignage();
    this.buildStrayAnimalsAndClutter();

    // Section 2: Farmgate / Shahbagh Junction (Z: -220 to -260)
    this.buildRoadJunction();

    // Section 3: Shahbagh Road (Z: -260 to -1100)
    this.buildShahbaghRoad();

    // Section 4: Mirpur-10 Golchottor (Grand Roundabout Circle)
    this.buildMirpur10Golchottor();

    // Section 5: Overhead Electric Poles & Sagging Tangled Wires
    this.buildElectricPolesAndSaggingWires();

    // Roadside Shops (Type A: Tea/Egg stalls, Type B: Hawker umbrellas, Fruit/Veg carts)
    this.buildAuthenticRoadsideShops();

    // CNG Refueling Station
    this.buildCNGRefuelStation();

    // Dhaka Metropolitan Police (DMP) Traffic Police Booths (Escape Havens)
    this.buildTrafficPoliceBooths();
  }

  // =========================================================================
  // 1. BEGUM ROKEYA AVENUE (MIRPUR-10 TO FARMGATE)
  // =========================================================================
  private buildBegumRokeyaAvenue() {
    const roadLength = 760;
    const centerZ = 160;

    // Roadway with PBR Bump & Roughness Maps ("Begum Rokeya Ave")
    const roadTex = CanvasTextureFactory.getRoadTexture();
    roadTex.repeat.set(1, 20);
    const roadBump = CanvasTextureFactory.getAsphaltBumpMap();
    roadBump.repeat.set(4, 80);

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      bumpMap: roadBump,
      bumpScale: 0.04,
      roughness: 0.85,
      metalness: 0.08,
    });
    this.roadMaterials.push(roadMat);

    const roadGeo = new THREE.PlaneGeometry(25, roadLength);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, centerZ);
    road.receiveShadow = true;
    this.scene.add(road);

    // Median with Black/White Kerb & Shrubs
    const kerbTex = CanvasTextureFactory.getKerbTexture();
    kerbTex.repeat.set(22, 1);
    const kerbMat = new THREE.MeshStandardMaterial({ map: kerbTex, roughness: 0.7 });

    const median = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.32, roadLength), kerbMat);
    median.position.set(0, 0.16, centerZ);
    median.castShadow = true;
    median.receiveShadow = true;
    this.scene.add(median);

    // Median Steel Railings
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd0d5dd, metalness: 0.85, roughness: 0.3 });
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, roadLength), railMat);
    topBar.position.set(0, 1.1, centerZ);
    this.scene.add(topBar);

    // Elevated Metro Viaduct & Flared Pillars (PBR Weathered Concrete)
    const viaductTex = CanvasTextureFactory.getViaductConcrete();
    viaductTex.repeat.set(1, 22);
    const viaductBump = CanvasTextureFactory.getConcreteBumpMap();
    viaductBump.repeat.set(2, 44);

    const viaductMat = new THREE.MeshStandardMaterial({
      map: viaductTex,
      bumpMap: viaductBump,
      bumpScale: 0.03,
      roughness: 0.75,
      metalness: 0.1,
    });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(9.2, 2.2, roadLength), viaductMat);
    deck.position.set(0, 9.8, centerZ);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.scene.add(deck);

    // Parapets
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, roadLength), viaductMat);
    wallL.position.set(-4.5, 11.2, centerZ);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, roadLength), viaductMat);
    wallR.position.set(4.5, 11.2, centerZ);
    this.scene.add(wallL, wallR);

    // Metro Pillars with funny Bangla wall posters
    let pCount = 0;
    for (let z = -180; z <= 500; z += 34) {
      if (Math.abs(z - 320) < 30) continue; // Station space

      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(0, 0, z);

      const posterTex = FunnyPosterFactory.getPosterTexture(pCount++);
      const col = new THREE.Mesh(new THREE.BoxGeometry(2.0, 6.5, 2.0), new THREE.MeshStandardMaterial({ map: posterTex }));
      col.position.y = 3.4;
      col.castShadow = true;

      const arm = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.8, 2.4), viaductMat);
      arm.position.y = 7.8;
      arm.castShadow = true;

      pillarGroup.add(col, arm);
      this.scene.add(pillarGroup);
    }

    // Mirpur-10 Overhead Station Block at Z = 320
    this.buildMirpurStation(320);

    // Elevated Metro Train
    this.metroTrain = VehicleFactory.createMetroTrain();
    this.metroTrain.position.set(-2.2, 11.1, this.metroZ);
    this.scene.add(this.metroTrain);

    // Begum Rokeya Footpaths: Type 3 (Red Brick + Tactile Strip)
    const fpTex = CanvasTextureFactory.getFootpathType3Texture();
    fpTex.repeat.set(1, 24);
    const fpMat = new THREE.MeshStandardMaterial({ map: fpTex, roughness: 0.9 });

    const walkL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.28, roadLength), fpMat);
    walkL.position.set(-17.2, 0.14, centerZ);
    walkL.receiveShadow = true;
    const walkR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.28, roadLength), fpMat);
    walkR.position.set(17.2, 0.14, centerZ);
    walkR.receiveShadow = true;
    this.scene.add(walkL, walkR);

    // Pure Authentic Bangladeshi Buildings along Begum Rokeya Avenue
    this.buildBegumRokeyaBuildings(centerZ, roadLength);
  }

  private buildMirpurStation(zPos: number) {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(0, 0, zPos);

    const brickRedMat = new THREE.MeshStandardMaterial({ color: 0x9d0208, roughness: 0.75 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf4f3ee, roughness: 0.4 });

    const concourse = new THREE.Mesh(new THREE.BoxGeometry(32, 7.5, 50), brickRedMat);
    concourse.position.y = 12.5;
    concourse.castShadow = true;

    const roof = new THREE.Mesh(new THREE.BoxGeometry(34, 1.2, 54), whiteMat);
    roof.position.y = 16.5;
    stationGroup.add(concourse, roof);

    const signTex = CanvasTextureFactory.getStationNameplate();
    const signMat = new THREE.MeshStandardMaterial({ map: signTex });
    const signFront = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), signMat);
    signFront.position.set(0, 13.5, -25.1);
    const signBack = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), signMat);
    signBack.position.set(0, 13.5, 25.1);
    signBack.rotation.y = Math.PI;
    stationGroup.add(signFront, signBack);

    this.scene.add(stationGroup);
  }

  // --- AUTHENTIC BANGLADESHI BUILDINGS (MIRPUR-10 TO AGARGAON) ---
  private buildBegumRokeyaBuildings(centerZ: number, length: number) {
    const redBrickTex = CanvasTextureFactory.getRedBrickWhiteGridBuilding();
    redBrickTex.repeat.set(1, 2);
    const beigeTileTex = CanvasTextureFactory.getBeigeTiledCommercialBuilding();
    beigeTileTex.repeat.set(1, 2);
    const peelingTex = CanvasTextureFactory.getOldPeelingPaintBuilding();
    peelingTex.repeat.set(1, 2);

    const shutterTex = CanvasTextureFactory.getRollingShutterTexture();
    const shutterMat = new THREE.MeshStandardMaterial({ map: shutterTex, roughness: 0.5, metalness: 0.4 });

    const laundryTex = CanvasTextureFactory.getHangingLaundryTexture();
    const laundryMat = new THREE.MeshStandardMaterial({ map: laundryTex, side: THREE.DoubleSide, transparent: true });

    const tinMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4 });
    const gaziTankMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.5 }); // Dark green Gazi tank
    const acMat = new THREE.MeshStandardMaterial({ color: 0xdee2e6, roughness: 0.4 });
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });

    let shopCount = 0;

    for (let z = centerZ - length / 2 + 20; z <= centerZ + length / 2 - 20; z += 28) {
      if (Math.abs(z - 340) < 45) continue; // Roundabout space

      // Special Landmark: Mirpur Jame Mosque at z = 100 on Left Side
      if (Math.abs(z - 100) < 16) {
        this.buildMirpurMosque(-26, 100);
        continue;
      }

      // --- Left Side Building ---
      const typeIdxL = (Math.abs(Math.floor(z / 28))) % 4;
      const hL = 18 + ((Math.abs(Math.floor(z * 13)) % 5) * 4); // 18m to 34m tall
      const bLGroup = new THREE.Group();
      bLGroup.position.set(-25, 0, z);

      let bLMat: THREE.MeshStandardMaterial;
      if (typeIdxL === 0) {
        bLMat = new THREE.MeshStandardMaterial({ map: redBrickTex, roughness: 0.85 });
      } else if (typeIdxL === 1) {
        bLMat = new THREE.MeshStandardMaterial({ map: beigeTileTex, roughness: 0.65 });
      } else if (typeIdxL === 2) {
        bLMat = new THREE.MeshStandardMaterial({ map: peelingTex, roughness: 0.9 });
      } else {
        // Modern glass tower
        bLMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.15, metalness: 0.85 });
      }
      this.nightMaterials.push(bLMat);

      const bL = new THREE.Mesh(new THREE.BoxGeometry(13, hL, 25), bLMat);
      bL.position.y = hL / 2;
      bL.castShadow = true;
      bLGroup.add(bL);

      // Ground Floor: Rolling Shutters (দোকানের মেটাল শাটার)
      for (let s = -1; s <= 1; s++) {
        const shutterL = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.2), shutterMat);
        shutterL.position.set(6.52, 1.6, s * 7.5);
        shutterL.rotation.y = Math.PI / 2;
        bLGroup.add(shutterL);
      }

      // Ground Floor Bangla Shop Banner
      const signTexL = CanvasTextureFactory.getBanglaShopBanner(shopCount++);
      const signMeshL = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.5), new THREE.MeshStandardMaterial({ map: signTexL }));
      signMeshL.position.set(6.55, 3.8, 0);
      signMeshL.rotation.y = Math.PI / 2;
      bLGroup.add(signMeshL);

      // Rooftop Clutter: Gazi Water Tank (পানির ট্যাংক) & Tin Laundry Shed
      const tankL = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.9, 12), gaziTankMat);
      tankL.position.set(2.5, hL + 0.95, 5);
      tankL.castShadow = true;

      const tinShedL = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.8, 8), tinMat);
      tinShedL.position.set(-1, hL + 0.9, -4);

      // Satellite Dish Antenna on Roof
      const dishL = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8, 0, Math.PI), dishMat);
      dishL.rotation.x = -Math.PI / 3;
      dishL.position.set(4, hL + 1.2, -6);
      bLGroup.add(tankL, tinShedL, dishL);

      // Hanging Laundry Line on Balconies (শুকানো শাড়ি ও লুঙ্গি)
      if (typeIdxL === 0 || typeIdxL === 2) {
        const laundry = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.6), laundryMat);
        laundry.position.set(6.6, 9.5, 0);
        laundry.rotation.y = Math.PI / 2;
        bLGroup.add(laundry);
      }

      // Exterior AC Split Units on Walls
      for (let f = 6; f < hL - 2; f += 4) {
        const ac = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.48, 0.75), acMat);
        ac.position.set(6.65, f, ((f % 3) - 1) * 6);
        bLGroup.add(ac);
      }

      this.scene.add(bLGroup);

      // --- Right Side Building ---
      const typeIdxR = (Math.abs(Math.floor((z + 14) / 28))) % 4;
      const hR = 18 + ((Math.abs(Math.floor((z + 37) * 11)) % 5) * 4);
      const bRGroup = new THREE.Group();
      bRGroup.position.set(25, 0, z);

      let bRMat: THREE.MeshStandardMaterial;
      if (typeIdxR === 0) {
        bRMat = new THREE.MeshStandardMaterial({ map: redBrickTex, roughness: 0.85 });
      } else if (typeIdxR === 1) {
        bRMat = new THREE.MeshStandardMaterial({ map: beigeTileTex, roughness: 0.65 });
      } else if (typeIdxR === 2) {
        bRMat = new THREE.MeshStandardMaterial({ map: peelingTex, roughness: 0.9 });
      } else {
        bRMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.15, metalness: 0.85 });
      }
      this.nightMaterials.push(bRMat);

      const bR = new THREE.Mesh(new THREE.BoxGeometry(13, hR, 25), bRMat);
      bR.position.y = hR / 2;
      bR.castShadow = true;
      bRGroup.add(bR);

      // Right Ground Floor Shutters & Bangla Banner
      for (let s = -1; s <= 1; s++) {
        const shutterR = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.2), shutterMat);
        shutterR.position.set(-6.52, 1.6, s * 7.5);
        shutterR.rotation.y = -Math.PI / 2;
        bRGroup.add(shutterR);
      }

      const signTexR = CanvasTextureFactory.getBanglaShopBanner(shopCount++);
      const signMeshR = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.5), new THREE.MeshStandardMaterial({ map: signTexR }));
      signMeshR.position.set(-6.55, 3.8, 0);
      signMeshR.rotation.y = -Math.PI / 2;
      bRGroup.add(signMeshR);

      // Rooftop Tank & Dish
      const tankR = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.9, 12), gaziTankMat);
      tankR.position.set(-2.5, hR + 0.95, -4);
      const dishR = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8, 0, Math.PI), dishMat);
      dishR.rotation.x = -Math.PI / 3;
      dishR.position.set(-4, hR + 1.2, 5);
      bRGroup.add(tankR, dishR);

      // Hanging Laundry
      if (typeIdxR === 0 || typeIdxR === 2) {
        const laundryR = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.6), laundryMat);
        laundryR.position.set(-6.6, 9.5, 0);
        laundryR.rotation.y = -Math.PI / 2;
        bRGroup.add(laundryR);
      }

      for (let f = 6; f < hR - 2; f += 4) {
        const ac = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.48, 0.75), acMat);
        ac.position.set(-6.65, f, ((f % 3) - 1) * 6);
        bRGroup.add(ac);
      }

      this.scene.add(bRGroup);
    }
  }

  // --- MIRPUR-10 JAME MOSQUE (মসজিদের সবুজ গম্বুজ ও মিনার) ---
  private buildMirpurMosque(x: number, z: number) {
    const mosqueGroup = new THREE.Group();
    mosqueGroup.position.set(x, 0, z);

    const whiteMarbleMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.35 });
    const greenTileTex = CanvasTextureFactory.getMosqueTilePattern();
    const greenDomeMat = new THREE.MeshStandardMaterial({
      map: greenTileTex,
      color: 0x1b4332,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x052e16,
      emissiveIntensity: 0.2,
    });
    this.mosqueMaterials.push(greenDomeMat);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.9, roughness: 0.2 });

    // Main Mosque Hall (20m x 26m, 12m tall)
    const hall = new THREE.Mesh(new THREE.BoxGeometry(14, 11, 26), whiteMarbleMat);
    hall.position.y = 5.5;
    hall.castShadow = true;
    mosqueGroup.add(hall);

    // Front Grand Entrance Archway
    const archRoof = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 8), whiteMarbleMat);
    archRoof.position.set(7.5, 6, 0);
    mosqueGroup.add(archRoof);

    // Central Magnificent Emerald Green Ribbed Dome (বড় সবুজ গম্বুজ)
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.6, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2), greenDomeMat);
    dome.position.set(0, 11, 0);
    dome.castShadow = true;

    // Golden Crescent & Spire on Dome
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.25, 3.2, 8), goldMat);
    spire.position.set(0, 16.5, 0);
    const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 8, 16, Math.PI * 1.5), goldMat);
    crescent.position.set(0, 18.2, 0);
    mosqueGroup.add(dome, spire, crescent);

    // Tall Slender Minaret Tower (উঁচু মিনার)
    const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 24, 12), whiteMarbleMat);
    minaret.position.set(6, 12, 10);
    minaret.castShadow = true;

    const minaretDome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), greenDomeMat);
    minaretDome.position.set(6, 24, 10);
    const minaretCrescent = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 12, Math.PI * 1.5), goldMat);
    minaretCrescent.position.set(6, 25.6, 10);
    mosqueGroup.add(minaret, minaretDome, minaretCrescent);

    // Green Neon Illumination at Night
    const greenLight = new THREE.PointLight(0x10b981, 2.0, 18, 1.2);
    greenLight.position.set(6.5, 6.5, 0);
    mosqueGroup.add(greenLight);

    this.scene.add(mosqueGroup);
  }

  // --- KAZIPARA FOOT OVERBRIDGE (কাজীপাড়া পদচারী সেতু) ---
  private buildKaziparaFootOverbridge() {
    const obGroup = new THREE.Group();
    const obZ = 180;
    obGroup.position.set(0, 0, obZ);

    const steelBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d3557, metalness: 0.8, roughness: 0.3 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const roofTinMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.4 });

    // Concrete Support Pillars on both sidewalks
    [-13.5, 13.5].forEach((px) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6.4, 1.2), concreteMat);
      col.position.set(px, 3.2, 0);
      col.castShadow = true;
      obGroup.add(col);

      // Stairs climbing up from footpath
      for (let s = 0; s < 10; s++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.75), concreteMat);
        step.position.set(px + (px > 0 ? 1.4 : -1.4), s * 0.55 + 0.3, (s - 5) * 0.75);
        obGroup.add(step);
      }
    });

    // Elevated Bridge Walkway (Spanning across Begum Rokeya Avenue)
    const walkway = new THREE.Mesh(new THREE.BoxGeometry(28, 0.35, 3.2), concreteMat);
    walkway.position.set(0, 6.2, 0);
    walkway.castShadow = true;
    walkway.receiveShadow = true;

    // Protective Blue Curved Roof Canopy
    const roof = new THREE.Mesh(new THREE.BoxGeometry(28.4, 0.15, 3.8), roofTinMat);
    roof.position.set(0, 8.4, 0);

    // Steel Safety Truss Railings on sides
    [-1.55, 1.55].forEach((rz) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(28, 1.4, 0.08), steelBlueMat);
      rail.position.set(0, 7.0, rz);
      obGroup.add(rail);
    });

    // Big Overbridge Banner Sign ("কাজীপাড়া পদচারী সেতু")
    const bannerTex = CanvasTextureFactory.getOverbridgeBanner();
    const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex });
    const bannerFront = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.8), bannerMat);
    bannerFront.position.set(0, 7.2, 1.62);
    const bannerBack = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.8), bannerMat);
    bannerBack.position.set(0, 7.2, -1.62);
    bannerBack.rotation.y = Math.PI;

    // Pedestrians crossing overhead on the bridge
    for (let p = -2; p <= 2; p++) {
      const walker = new THREE.Group();
      walker.position.set(p * 5, 6.35, 0);
      const wBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.9, 6),
        new THREE.MeshStandardMaterial({ color: p % 2 === 0 ? 0xd90429 : 0x0077b6 })
      );
      wBody.position.y = 0.45;
      const wHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), new THREE.MeshStandardMaterial({ color: 0x8d5b4c }));
      wHead.position.y = 1.05;
      walker.add(wBody, wHead);
      obGroup.add(walker);
    }

    obGroup.add(walkway, roof, bannerFront, bannerBack);
    this.scene.add(obGroup);
  }

  // --- BUS STOPS & BANGLA ROAD SIGNS ---
  private buildBusStopsAndSignage() {
    const busStopPositions = [
      { x: 14.5, z: 290, name: 'মিরপুর-১০ বাস স্টপ' },
      { x: -14.5, z: 150, name: 'কাজীপাড়া বাসস্ট্যান্ড' },
      { x: 14.5, z: 20, name: 'শেওড়াপাড়া বাস স্টপ' },
    ];

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const shelterRoofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const woodBenchMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.8 });

    busStopPositions.forEach((pos) => {
      const bs = new THREE.Group();
      bs.position.set(pos.x, 0, pos.z);

      // Shelter canopy
      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 6.0), shelterRoofMat);
      roof.position.set(0, 2.7, 0);
      roof.castShadow = true;

      // 2 Steel posts
      [-2.4, 2.4].forEach((pz) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.7, 8), steelMat);
        post.position.set(0, 1.35, pz);
        bs.add(post);
      });

      // Wooden passenger bench
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 4.2), woodBenchMat);
      bench.position.set(0, 0.22, 0);

      // Bus stop sign
      const signTex = CanvasTextureFactory.getTrafficSignTexture('bus_stop');
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshStandardMaterial({ map: signTex }));
      sign.position.set(pos.x > 0 ? -1.0 : 1.0, 3.2, 0);
      sign.rotation.y = pos.x > 0 ? -Math.PI / 2 : Math.PI / 2;

      bs.add(roof, bench, sign);
      this.scene.add(bs);
    });

    // Traffic Light Signals (ট্রাফিক সিগন্যাল বাতি)
    const signalPositions = [
      { x: 12.8, z: 315 },
      { x: -12.8, z: 315 },
      { x: 12.8, z: 170 },
      { x: -12.8, z: 170 },
    ];

    const blackHousingMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 });
    const redLightMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.8 });
    const greenLightMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.8 });
    const yellowLightMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.2 });

    signalPositions.forEach((pos, idx) => {
      const sigGroup = new THREE.Group();
      sigGroup.position.set(pos.x, 0, pos.z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5.5, 8), steelMat);
      pole.position.y = 2.75;

      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.4, 0.45), blackHousingMat);
      housing.position.set(0, 4.8, 0);

      // Red, Amber, Green light lenses
      const rLens = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), idx % 2 === 0 ? redLightMat : blackHousingMat);
      rLens.position.set(0, 5.2, pos.x > 0 ? -0.23 : 0.23);
      const yLens = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), yellowLightMat);
      yLens.position.set(0, 4.8, pos.x > 0 ? -0.23 : 0.23);
      const gLens = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), idx % 2 !== 0 ? greenLightMat : blackHousingMat);
      gLens.position.set(0, 4.4, pos.x > 0 ? -0.23 : 0.23);

      sigGroup.add(pole, housing, rLens, yLens, gLens);
      this.scene.add(sigGroup);
    });

    // Speed limit signs: "গতিসীমা ৪০"
    [260, 80, -80].forEach((z, idx) => {
      const spGroup = new THREE.Group();
      const sx = idx % 2 === 0 ? 12.6 : -12.6;
      spGroup.position.set(sx, 0, z);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 6), steelMat);
      post.position.y = 1.6;

      const signTex = CanvasTextureFactory.getTrafficSignTexture('speed_40');
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshStandardMaterial({ map: signTex }));
      signMesh.position.set(0, 2.7, 0);
      signMesh.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;

      spGroup.add(post, signMesh);
      this.scene.add(spGroup);
    });
  }

  // --- STRAY ANIMALS (CATS, PIGEONS) & DETAILS ---
  private buildStrayAnimalsAndClutter() {
    const pigeonMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
    const catMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }); // Orange tabby street cat

    // Pigeons pecking along sidewalks and parapets
    for (let i = 0; i < 16; i++) {
      const pig = new THREE.Group();
      const pz = 100 + (Math.random() - 0.5) * 350;
      const px = Math.random() > 0.5 ? 13.8 + Math.random() * 2 : -13.8 - Math.random() * 2;
      pig.position.set(px, 0.35, pz);

      const pBody = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 6), pigeonMat);
      pBody.rotation.z = Math.PI / 3;
      const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), pigeonMat);
      pHead.position.set(0.12, 0.05, 0);
      pig.add(pBody, pHead);
      this.scene.add(pig);
    }

    // Stray cats near tea stalls
    [-13.2, 13.2].forEach((cx, idx) => {
      const cat = new THREE.Group();
      cat.position.set(cx, 0.3, 122 + idx * 80);

      const cBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.18), catMat);
      cBody.position.y = 0.1;
      const cHead = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), catMat);
      cHead.position.set(0.2, 0.2, 0);
      const cTail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4), catMat);
      cTail.position.set(-0.2, 0.22, 0);
      cTail.rotation.z = Math.PI / 4;
      cat.add(cBody, cHead, cTail);
      this.scene.add(cat);
    });
  }


  // =========================================================================
  // 2. ROAD JUNCTION (FARMGATE / SHAHBAGH CONNECTOR)
  // =========================================================================
  private buildRoadJunction() {
    const jZ = -230;

    // Road sign gantry bridging road
    const gantryMat = new THREE.MeshStandardMaterial({ color: 0x22577a, roughness: 0.3 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 7.5, 12), gantryMat);
    postL.position.set(-13, 3.75, jZ);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 7.5, 12), gantryMat);
    postR.position.set(13, 3.75, jZ);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(26.5, 0.4, 0.4), gantryMat);
    beam.position.set(0, 7.2, jZ);

    // Directional Sign: "শাহবাগ রোড সোজা ➔" and "মিরপুর ⬅"
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#007f5f'; // Green highway board
      ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 116);

      ctx.font = 'bold 36px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('শাহবাগ রোড সোজা ➔', 256, 48);
      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffea00';
      ctx.fillText('SHAHBAGH RD • ঢাকা বিশ্ববিদ্যালয় • চারুকলা', 256, 95);
    }
    const signTex = new THREE.CanvasTexture(canvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshStandardMaterial({ map: signTex }));
    signBoard.position.set(0, 6.2, jZ - 0.25);
    this.scene.add(postL, postR, beam, signBoard);
  }

  // =========================================================================
  // 3. MAP 2: SHAHBAGH ROAD (EXACT STREET VIEW RECREATION)
  // =========================================================================
  private buildShahbaghRoad() {
    const roadLength = 840;
    const centerZ = -680;

    // 1. Two-way asphalt road with "Shahbagh Rd" painted in large white letters (Street View Match!)
    const roadTex = CanvasTextureFactory.getShahbaghRoadTexture();
    roadTex.repeat.set(1, 24);
    const roadMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.85, metalness: 0.1 });

    const roadGeo = new THREE.PlaneGeometry(24, roadLength);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, centerZ);
    road.receiveShadow = true;
    this.scene.add(road);

    // 2. Right Side: Line of Orange-and-White striped Traffic Cones / Bollards (Street View Match!)
    const coneGeo = new THREE.ConeGeometry(0.24, 0.75, 12);
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xfb8500, roughness: 0.3 });
    const whiteStripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    for (let z = -260; z >= -1080; z -= 7.5) {
      const coneGroup = new THREE.Group();
      coneGroup.position.set(2.8, 0.37, z);

      const cone = new THREE.Mesh(coneGeo, orangeMat);
      cone.castShadow = true;
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.18, 12), whiteStripeMat);
      stripe.position.y = -0.05;

      coneGroup.add(cone, stripe);
      this.scene.add(coneGroup);
    }

    // Sandy dirt strip along right edge
    const dirtMat = new THREE.MeshStandardMaterial({ color: 0xbfa888, roughness: 0.95 });
    const dirtStrip = new THREE.Mesh(new THREE.PlaneGeometry(3.5, roadLength), dirtMat);
    dirtStrip.rotation.x = -Math.PI / 2;
    dirtStrip.position.set(13.8, 0.01, centerZ);
    dirtStrip.receiveShadow = true;
    this.scene.add(dirtStrip);

    // 3. Right Side: Big Shady Green Trees (Neem / Rain-Tree style) with wide leafy canopies
    this.buildShahbaghTrees(centerZ, roadLength);

    // 4. Left Side: Raised Footpath of Pinkish-Brown Paver Tiles & Rounded Stone Kerb
    // Uses Footpath Type 1 (swirl/floral) and Footpath Type 2 (flower mural)
    const fp1Tex = CanvasTextureFactory.getFootpathType1Texture();
    fp1Tex.repeat.set(1, 28);
    const fpMatL = new THREE.MeshStandardMaterial({ map: fp1Tex, roughness: 0.85 });

    const walkL = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.32, roadLength), fpMatL);
    walkL.position.set(-14.6, 0.16, centerZ);
    walkL.receiveShadow = true;
    this.scene.add(walkL);

    // Rounded Stone Kerb (Ref Image 1: curved grey-white connected rounded stones)
    const kerbTex = CanvasTextureFactory.getRoundedStoneKerbTexture();
    kerbTex.repeat.set(28, 1);
    const kerbMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, roadLength), new THREE.MeshStandardMaterial({ map: kerbTex }));
    kerbMesh.position.set(-11.8, 0.17, centerZ);
    this.scene.add(kerbMesh);

    // Row of Parked Motorbikes along Left Kerb (Shahbagh Street View Match!)
    for (let z = -280; z >= -1060; z -= 14) {
      const bike = VehicleFactory.createMotorbike();
      bike.position.set(-12.8, 0.32, z);
      bike.rotation.y = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
      this.scene.add(bike);
    }

    // 5. LEFT SIDE BUILDING A: Long Red-Brick Apartment Block (12-15 Stories, Street View Match!)
    this.buildShahbaghBuildingA();

    // 6. LEFT SIDE BUILDING B: Old Market Complex (8-10 Stories, Jali lattice, Fashion Shops)
    this.buildShahbaghBuildingB();

    // 7. Right Side Buildings (6-8 Stories behind trees, shopfronts)
    this.buildShahbaghRightBuildings(centerZ, roadLength);

    // 8. Footpath Type 1 (Folk-Art Murals) & Type 2 (Flower-Murals) along boundary walls
    this.buildMuralBoundaryWalls(centerZ, roadLength);
  }

  // --- BIG SHADY NEEM / RAIN TREES ALONG SHAHBAGH ROAD RIGHT SIDE ---
  private buildShahbaghTrees(centerZ: number, length: number) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.85,
      side: THREE.DoubleSide,
    });
    this.leavesMaterial = leafMat;

    for (let z = centerZ + length / 2 - 25; z >= centerZ - length / 2 + 25; z -= 24) {
      const tree = new THREE.Group();
      tree.position.set(13.2, 0, z);

      // Thick dark trunk leaning slightly toward road
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 6.5, 8), trunkMat);
      trunk.position.set(0, 3.25, 0);
      trunk.rotation.z = -0.08;
      trunk.castShadow = true;
      tree.add(trunk);

      // Wide leafy canopy branches spreading over road casting dappled shade
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(4.2, 1), leafMat);
      canopy.position.set(-1.8, 7.5, 0);
      canopy.scale.set(1.4, 0.85, 1.2);
      canopy.castShadow = true;
      tree.add(canopy);

      const subCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(3.0, 1), leafMat);
      subCanopy.position.set(-3.2, 6.8, 1.2);
      subCanopy.castShadow = true;
      tree.add(subCanopy);

      this.scene.add(tree);
    }
  }

  // --- LEFT SIDE BUILDING A: RED-BRICK 12-15 STORY APARTMENT BLOCK (EXACT MATCH) ---
  private buildShahbaghBuildingA() {
    const blockGroup = new THREE.Group();
    blockGroup.name = 'Shahbagh_Building_A_RedBrick';

    const brickGridTex = CanvasTextureFactory.getRedBrickGridTexture();
    brickGridTex.repeat.set(6, 14);
    const brickMat = new THREE.MeshStandardMaterial({ map: brickGridTex, roughness: 0.8 });
    const whiteConcreteMat = new THREE.MeshStandardMaterial({ color: 0xf4f3ee, roughness: 0.5 });
    const balRailingMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });

    // Long continuous residential block stretching from Z = -260 to -620 (360 meters!)
    const blockLength = 360;
    const blockHeight = 42; // ~14 stories
    const centerZ = -440;

    const mainFacade = new THREE.Mesh(new THREE.BoxGeometry(12, blockHeight, blockLength), brickMat);
    mainFacade.position.set(-25, blockHeight / 2, centerZ);
    mainFacade.castShadow = true;
    mainFacade.receiveShadow = true;
    blockGroup.add(mainFacade);

    // Rows of projecting white concrete balconies on every floor with railings
    const balGeo = new THREE.BoxGeometry(1.6, 0.8, 3.2);
    const balRailGeo = new THREE.BoxGeometry(1.62, 0.6, 3.22);

    for (let floor = 2; floor <= 13; floor++) {
      const y = floor * 3.0;
      for (let z = -280; z >= -600; z -= 6.0) {
        const bal = new THREE.Mesh(balGeo, whiteConcreteMat);
        bal.position.set(-18.2, y, z);
        bal.castShadow = true;

        const rail = new THREE.Mesh(balRailGeo, balRailingMat);
        rail.position.set(-18.2, y + 0.4, z);

        blockGroup.add(bal, rail);
      }
    }

    // Street-level 3m grey boundary wall with black base & barbed wire
    const wallSlogansTex = CanvasTextureFactory.getBoundaryWallSlogansTexture();
    wallSlogansTex.repeat.set(16, 1);
    const wallMat = new THREE.MeshStandardMaterial({ map: wallSlogansTex, roughness: 0.8 });

    const boundaryWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, blockLength), wallMat);
    boundaryWall.position.set(-17.2, 1.6, centerZ);
    boundaryWall.castShadow = true;
    blockGroup.add(boundaryWall);

    this.scene.add(blockGroup);
  }

  // --- LEFT SIDE BUILDING B: OLD MARKET COMPLEX (8-10 STORIES, JALI, FASHION SHOPS) ---
  private buildShahbaghBuildingB() {
    const marketGroup = new THREE.Group();
    marketGroup.name = 'Shahbagh_Building_B_MarketComplex';

    const marketTex = CanvasTextureFactory.getOldMarketComplexTexture();
    marketTex.repeat.set(4, 3);
    const marketMat = new THREE.MeshStandardMaterial({ map: marketTex, roughness: 0.7 });

    const mLength = 280;
    const mHeight = 28; // ~9 stories
    const centerZ = -820;

    const facade = new THREE.Mesh(new THREE.BoxGeometry(12, mHeight, mLength), marketMat);
    facade.position.set(-25, mHeight / 2, centerZ);
    facade.castShadow = true;
    facade.receiveShadow = true;
    marketGroup.add(facade);

    // Deep open balconies with star/diamond lattice jali railings
    const jaliMat = new THREE.MeshStandardMaterial({ color: 0xefefea, roughness: 0.6 });
    for (let floor = 1; floor <= 7; floor++) {
      const balFloor = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, mLength), jaliMat);
      balFloor.position.set(-18.0, floor * 3.2 + 1.2, centerZ);

      const jaliScreen = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, mLength), jaliMat);
      jaliScreen.position.set(-16.9, floor * 3.2 + 1.8, centerZ);
      marketGroup.add(balFloor, jaliScreen);
    }

    // Ground floor continuous clothing shopfronts with glass and red signs
    const shopBand = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 3.8, mLength),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    shopBand.position.set(-17.6, 2.0, centerZ);
    marketGroup.add(shopBand);

    this.scene.add(marketGroup);
  }

  // --- RIGHT SIDE BUILDINGS (6-8 STORIES BEHIND SHADY TREES) ---
  private buildShahbaghRightBuildings(centerZ: number, length: number) {
    const brickTex = CanvasTextureFactory.getRedBrickGridTexture();
    brickTex.repeat.set(2, 4);
    const brickMat = new THREE.MeshStandardMaterial({ map: brickTex });
    const beigeMat = new THREE.MeshStandardMaterial({ color: 0xd6c7b2 });

    for (let z = centerZ + length / 2 - 30; z >= centerZ - length / 2 + 30; z -= 38) {
      const h = 20 + Math.floor(Math.random() * 8);
      const isBrick = Math.random() > 0.5;
      const b = new THREE.Mesh(new THREE.BoxGeometry(11, h, 34), isBrick ? brickMat : beigeMat);
      b.position.set(24.5, h / 2, z);
      b.castShadow = true;
      this.scene.add(b);

      // Red Bangla shop signboard at ground floor
      const signTex = CanvasTextureFactory.getShopSignboard(Math.floor(Math.random() * 8));
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.6), new THREE.MeshStandardMaterial({ map: signTex }));
      sign.position.set(18.9, 3.5, z);
      sign.rotation.y = -Math.PI / 2;
      this.scene.add(sign);
    }
  }

  // --- BOUNDARY WALLS: FOLK-ART MURALS (TYPE 1) & FLOWER MURALS (TYPE 2) ---
  private buildMuralBoundaryWalls(centerZ: number, length: number) {
    // Left boundary walls between buildings with Folk-Art & Flower Murals
    const muralLength = 120;

    // 1. Folk-Art Mural Wall (Alpona/Tigers/Lotus) matching Reference Image 1
    const folkTex = CanvasTextureFactory.getFolkArtMuralTexture(0);
    folkTex.repeat.set(8, 1);
    const folkWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 2.4, muralLength),
      new THREE.MeshStandardMaterial({ map: folkTex, roughness: 0.6 })
    );
    folkWall.position.set(-17.3, 1.2, -640);
    folkWall.castShadow = true;
    this.scene.add(folkWall);

    // Iron spear fence along top
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
    for (let z = -700; z <= -580; z += 1.5) {
      const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6), ironMat);
      spear.position.set(-17.3, 2.7, z);
      this.scene.add(spear);
    }

    // 2. Flower Mural Wall (Sky-Blue + Giant Flowers) matching Reference Image 2
    const flowerTex = CanvasTextureFactory.getFlowerMuralTexture();
    flowerTex.repeat.set(8, 1);
    const flowerWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 2.6, muralLength),
      new THREE.MeshStandardMaterial({ map: flowerTex, roughness: 0.5 })
    );
    flowerWall.position.set(-17.3, 1.3, -980);
    flowerWall.castShadow = true;
    this.scene.add(flowerWall);

    // Concrete Planter Boxes along flower wall base (Ref Image 2)
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x8d99ae });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8 });

    for (let z = -1040; z <= -920; z += 4.5) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 3.8), planterMat);
      box.position.set(-16.7, 0.45, z);

      // Canna / broad-leaf plants inside
      const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 1), leafMat);
      plant.position.set(-16.7, 0.95, z);
      plant.scale.set(0.6, 1.2, 2.4);

      this.scene.add(box, plant);
    }

    // Steel bollards with red tops along road-side (Ref Image 2)
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    const redTopMat = new THREE.MeshStandardMaterial({ color: 0xd90429 });
    for (let z = -1040; z <= -920; z += 6.0) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 10), bollardMat);
      post.position.set(-12.2, 0.55, z);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), redTopMat);
      top.position.set(-12.2, 0.95, z);
      this.scene.add(post, top);
    }
  }

  // =========================================================================
  // 4. AUTHENTIC BANGLADESHI BREAKABLE SHOPS (DENSE CONTINUOUS BAZAAR)
  // =========================================================================
  private buildAuthenticRoadsideShops() {
    // --- BEGUM ROKEYA AVENUE DENSE FOOTPATH BAZAAR (Z: -200 to +480) ---
    // A) Street Tea & Boiled Egg Stalls (টং চায়ের দোকান, ৳১,৫০০)
    this.buildTeaEggStall(14.8, 440);
    this.buildTeaEggStall(-14.8, 380);
    this.buildTeaEggStall(14.8, 280);
    this.buildTeaEggStall(-14.8, 190);
    this.buildTeaEggStall(14.8, 110);
    this.buildTeaEggStall(-14.8, 30);
    this.buildTeaEggStall(14.8, -50);
    this.buildTeaEggStall(-14.8, -130);

    // B) Hawker Stalls under Colorful Beach Umbrellas (হকার মার্কেট, ৳৩,০০০)
    this.buildHawkerMarket(14.8, 410);
    this.buildHawkerMarket(-14.8, 330);
    this.buildHawkerMarket(14.8, 220);
    this.buildHawkerMarket(-14.8, 130);
    this.buildHawkerMarket(14.8, 20);
    this.buildHawkerMarket(-14.8, -80);

    // C) Fresh Vegetable Carts & Ground Produce (সবজির ঠেলাগাড়ি, ৳২,০০০)
    this.buildVegetableCart(-14.8, 460);
    this.buildVegetableCart(14.8, 360);
    this.buildVegetableCart(-14.8, 250);
    this.buildVegetableCart(14.8, 160);
    this.buildVegetableCart(-14.8, 70);
    this.buildVegetableCart(14.8, -20);
    this.buildVegetableCart(-14.8, -160);

    // D) Fruit Carts (ফল বিতান - কলা, পেঁপে, আনারস, আম, ৳২,০০০)
    this.buildFruitCart(14.8, 390);
    this.buildFruitCart(-14.8, 290);
    this.buildFruitCart(14.8, 180);
    this.buildFruitCart(-14.8, 90);
    this.buildFruitCart(14.8, -90);

    // E) Pitha Stalls (গরম চিতই ও ভাপা পিঠার দোকান, ৳১,২০০)
    this.buildPithaStall(-14.8, 420);
    this.buildPithaStall(14.8, 250);
    this.buildPithaStall(-14.8, 150);
    this.buildPithaStall(14.8, 60);
    this.buildPithaStall(-14.8, -30);

    // F) Jhalmuri Carts (ঝালমুড়ির টিনের বাক্স গাড়ি, ৳৮০০)
    this.buildJhalmuriCart(14.8, 470);
    this.buildJhalmuriCart(-14.8, 360);
    this.buildJhalmuriCart(14.8, 140);
    this.buildJhalmuriCart(-14.8, 10);
    this.buildJhalmuriCart(14.8, -120);

    // G) Paan-Bidi Stalls (পান-সিগারেটের দোকান, ৳১,০০০)
    this.buildPaanBidiStall(-14.8, 390);
    this.buildPaanBidiStall(14.8, 310);
    this.buildPaanBidiStall(-14.8, 210);
    this.buildPaanBidiStall(14.8, 80);
    this.buildPaanBidiStall(-14.8, -60);

    // H) Balloon Sellers (হিলিয়াম রঙিন বেলুন ক্লাস্টার, ৳৮০০)
    this.buildBalloonVendor(14.8, 340);
    this.buildBalloonVendor(-14.8, 170);
    this.buildBalloonVendor(14.8, -10);

    // I) Book Stalls (পুরোনো বই ও ম্যাগাজিনের পসরা, ৳২,৫০০)
    this.buildBookStall(-14.8, 270);
    this.buildBookStall(14.8, 40);
    this.buildBookStall(-14.8, -110);

    // J) Mobile Accessories (মোবাইল কভার ও হেডফোন, ৳৩,৫০০)
    this.buildMobileAccessories(14.8, 200);
    this.buildMobileAccessories(-14.8, 40);
    this.buildMobileAccessories(14.8, -150);

    // K) Flower Sellers (রজনীগন্ধা ও গাঁদা ফুলের ডালা, ৳১,৫০০)
    this.buildFlowerSeller(-14.8, 310);
    this.buildFlowerSeller(14.8, 100);
    this.buildFlowerSeller(-14.8, -10);

    // L) Tailor & Pharmacy stalls (টেইলার্স ও ফার্মেসি, ৳৫,০০০)
    this.buildTailorPharmacyStall(-14.8, 230);
    this.buildTailorPharmacyStall(14.8, -70);
    this.buildTailorPharmacyStall(-14.8, -180);

    // --- Shahbagh Road stalls ---
    this.buildHawkerMarket(14.8, -480);
    this.buildHawkerMarket(14.8, -620);
    this.buildVegetableCart(-14.8, -540);
    this.buildTeaEggStall(-14.8, -380);
    this.buildTeaEggStall(14.8, -740);
  }

  // --- TYPE A: STREET TEA / EGG STALL (BREAKABLE, ৳১,৫০০) ---
  private buildTeaEggStall(x: number, z: number) {
    const stallGroup = new THREE.Group();
    stallGroup.position.set(x, 0, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6f4e37, roughness: 0.85 });
    const blueTarpMat = new THREE.MeshStandardMaterial({ color: 0x0077b6, roughness: 0.6 });
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xc4a482 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });

    // Rough wooden counter table
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.2), woodMat);
    table.position.set(0, 0.45, 0);
    table.castShadow = true;
    stallGroup.add(table);

    // Signboard banner: "বিসমিল্লাহ ডিম ও চায়ের স্টল"
    const signTex = CanvasTextureFactory.getTeaEggStallTexture();
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.45), new THREE.MeshStandardMaterial({ map: signTex }));
    sign.position.set(0, 0.6, Math.sign(x) * -0.62);
    sign.rotation.y = Math.sign(x) > 0 ? 0 : Math.PI;
    stallGroup.add(sign);

    // Blue Plastic Tarpaulin on 2 leaning bamboo poles
    const tarp = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.05, 1.8), blueTarpMat);
    tarp.position.set(0, 2.15, 0);
    tarp.rotation.x = 0.2;
    stallGroup.add(tarp);

    [-1.2, 1.2].forEach(px => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 6), bambooMat);
      pole.position.set(px, 1.1, 0.7);
      pole.rotation.x = -0.15;
      stallGroup.add(pole);
    });

    // Props: Boiled eggs in tray, kettle, blue 20L water dispenser jar, stool
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.28, 8), steelMat);
    kettle.position.set(-0.6, 1.05, 0);
    const waterJar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.55, 12),
      new THREE.MeshPhysicalMaterial({ color: 0x00b4d8, transparent: true, opacity: 0.85 })
    );
    waterJar.position.set(0.6, 1.18, 0);

    const eggTray = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.35), new THREE.MeshStandardMaterial({ color: 0xf5f3f4 }));
    eggTray.position.set(0, 0.95, 0);

    const stool = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), woodMat);
    stool.position.set(0.9, 0.22, 0.8);

    stallGroup.add(kettle, waterJar, eggTray, stool);
    this.scene.add(stallGroup);

    this.shops.push({
      id: `shop_tea_${z}`,
      type: 'tea_egg_stall',
      name: 'বিসমিল্লাহ ডিম ও চায়ের স্টল',
      x,
      z,
      width: 2.8,
      depth: 2.0,
      repairCost: 1500, // ৳1,500 repair fine
      isBroken: false,
      reaction: 'হায় হায়! আমার চায়ের কেটলি আর ডিমের ট্রে ভাইঙ্গা দিলা রে!',
      meshGroup: stallGroup,
    });
  }

  // --- TYPE B: HAWKER MARKET UNDER COLORFUL UMBRELLAS (BREAKABLE, ৳৩,০০০) ---
  private buildHawkerMarket(x: number, z: number) {
    const marketGroup = new THREE.Group();
    marketGroup.position.set(x, 0, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.85 });
    const denimMat = new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.9 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 });
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });

    // 2 Low wooden tables piled with folded clothes & jeans
    const table1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.65, 1.4), woodMat);
    table1.position.set(-1.1, 0.32, 0);
    const table2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.65, 1.4), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    table2.position.set(1.1, 0.32, 0);
    marketGroup.add(table1, table2);

    // Folded jeans and fabric stacks on Table 1
    for (let j = 0; j < 6; j++) {
      const jeans = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.25, 0.45), denimMat);
      jeans.position.set(-1.6 + (j % 3) * 0.5, 0.75, (Math.floor(j / 3) - 0.5) * 0.5);
      marketGroup.add(jeans);
    }

    // Heaped shoes & sandals on Table 2 (Ref Image 4)
    for (let s = 0; s < 12; s++) {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.14), shoeMat);
      shoe.position.set(0.5 + (s % 4) * 0.35, 0.72 + (s % 3) * 0.08, ((s % 2) - 0.5) * 0.4);
      shoe.rotation.y = (s * Math.PI) / 6;
      marketGroup.add(shoe);
    }

    // Big Colorful Beach Umbrellas ("মুন ফ্যাশন", Ref Image 4)
    const umbrellaTex = CanvasTextureFactory.getHawkerUmbrellaTexture();
    const umbrellaMat = new THREE.MeshStandardMaterial({ map: umbrellaTex, roughness: 0.6, side: THREE.DoubleSide });

    [-1.2, 1.2].forEach((ux, idx) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), poleMat);
      pole.position.set(ux, 1.3, 0);

      // Conical 8-panel colorful umbrella canopy
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.65, 16), umbrellaMat);
      canopy.position.set(ux, 2.5, 0);
      canopy.rotation.y = idx * 0.5;
      canopy.castShadow = true;

      marketGroup.add(pole, canopy);
    });

    // Pedestrians / Customers browsing the market
    const shopper = new THREE.Group();
    shopper.position.set(0, 0, 1.2);
    const sBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.85, 8), new THREE.MeshStandardMaterial({ color: 0xf8f9fa }));
    sBody.position.y = 0.85;
    const sHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0x8d5b4c }));
    sHead.position.y = 1.45;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cap.position.y = 1.6;
    shopper.add(sBody, sHead, cap);
    marketGroup.add(shopper);

    this.scene.add(marketGroup);

    this.shops.push({
      id: `shop_hawker_${z}`,
      type: 'hawker_market',
      name: 'মুন ফ্যাশন হকার মার্কেট (জুতা ও কাপড়)',
      x,
      z,
      width: 4.5,
      depth: 2.2,
      repairCost: 3000, // ৳3,000 repair fine
      isBroken: false,
      reaction: 'ভাই! আমার সব জুতা আর কাপড়ের পসরা রাস্তায় ছিঁড়া ফালাইলেন!',
      meshGroup: marketGroup,
    });
  }

  // --- FRUIT CART (BREAKABLE, ৳১,০০০) ---
  private buildFruitCart(x: number, z: number) {
    const cartGroup = new THREE.Group();
    cartGroup.position.set(x, 0, z);

    const greenMat = new THREE.MeshStandardMaterial({ color: 0x007f5f });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

    const cart = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 1.2), greenMat);
    cart.position.set(0, 0.7, 0);
    cart.castShadow = true;
    cartGroup.add(cart);

    // Spoked cart wheels
    [-0.9, 0.9].forEach(wx => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 12), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.4, 0);
      cartGroup.add(w);
    });

    // Papayas, Bananas, Melons
    const yellowFruitMat = new THREE.MeshStandardMaterial({ color: 0xffbe0b });
    const orangeFruitMat = new THREE.MeshStandardMaterial({ color: 0xfb8500 });
    for (let i = 0; i < 8; i++) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), i % 2 === 0 ? yellowFruitMat : orangeFruitMat);
      f.position.set(-0.6 + (i % 4) * 0.4, 1.05, ((i % 2) - 0.5) * 0.4);
      cartGroup.add(f);
    }

    this.scene.add(cartGroup);

    this.shops.push({
      id: `shop_fruit_${z}`,
      type: 'fruit_cart',
      name: 'মামুন ফ্রুট ভান্ডার (কলা, পেঁপে ও আনারস)',
      x,
      z,
      width: 2.2,
      depth: 1.5,
      repairCost: 2000, // ৳2,000 fine
      isBroken: false,
      reaction: 'ভাই, গাড়ি দেখে চালান! আমার সব ফল রাস্তায় ফালাইয়া দিলেন!',
      meshGroup: cartGroup,
    });
  }

  // --- TAILOR & PHARMACY STALL (BREAKABLE, ৳৫,০০০) ---
  private buildTailorPharmacyStall(x: number, z: number) {
    const stallGroup = new THREE.Group();
    stallGroup.position.set(x, 0, z);

    const tinMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.6 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });

    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 1.4), tinMat);
    counter.position.set(0, 0.5, 0);

    const showcase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.6), glassMat);
    showcase.position.set(0, 1.3, 0);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 1.8), tinMat);
    roof.position.set(0, 2.3, 0);

    stallGroup.add(counter, showcase, roof);
    this.scene.add(stallGroup);

    this.shops.push({
      id: `shop_pharm_${z}`,
      type: 'tailor_pharmacy',
      name: 'নিউ ডায়মন্ড টেইলার্স ও ফার্মেসি',
      x,
      z,
      width: 3.0,
      depth: 2.0,
      repairCost: 5000, // ৳5,000 fine
      isBroken: false,
      reaction: 'সর্বনাশ! আমার দোকানের শোকেস ও ফার্মেসি ভেঙে চুরমার করলেন!',
      meshGroup: stallGroup,
    });
  }

  // --- FRESH VEGETABLE CART (সবজির ঠেলাগাড়ি, ৳২,০০০) ---
  private buildVegetableCart(x: number, z: number) {
    const cartGroup = new THREE.Group();
    cartGroup.position.set(x, 0, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x582f0e, roughness: 0.85 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x212529 });

    // Wooden Cart Frame
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.4), woodMat);
    bed.position.set(0, 0.72, 0);
    bed.castShadow = true;
    cartGroup.add(bed);

    // Front Bangla Banner Signboard
    const signTex = CanvasTextureFactory.getVegetableCartTexture();
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.45), new THREE.MeshStandardMaterial({ map: signTex }));
    sign.position.set(0, 0.72, Math.sign(x) * -0.72);
    sign.rotation.y = Math.sign(x) > 0 ? 0 : Math.PI;
    cartGroup.add(sign);

    // Cart Wheels (4 spoked wheels)
    [-0.9, 0.9].forEach(wx => {
      [-0.6, 0.6].forEach(wz => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.38, wz);
        cartGroup.add(wheel);
      });
    });

    // Vegetable Produce: Red Spinach, Eggplants, Papayas, Gourds, Onions & Potatoes
    const redSpinachMat = new THREE.MeshStandardMaterial({ color: 0x7209b7, roughness: 0.9 });
    const eggplantMat = new THREE.MeshStandardMaterial({ color: 0x3a0ca3, roughness: 0.3 });
    const papayaMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.7 });
    const gourdMat = new THREE.MeshStandardMaterial({ color: 0x55a630, roughness: 0.6 });
    const potatoMat = new THREE.MeshStandardMaterial({ color: 0xc89f68, roughness: 0.9 }); // Potato mound
    const chiliMat = new THREE.MeshStandardMaterial({ color: 0x38b000, roughness: 0.5 }); // Green chili

    for (let i = 0; i < 4; i++) {
      const spinach = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 1), redSpinachMat);
      spinach.position.set(-0.7 + i * 0.45, 1.05, -0.25);
      cartGroup.add(spinach);
    }

    for (let i = 0; i < 6; i++) {
      const ep = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.32, 8), eggplantMat);
      ep.position.set(-0.6 + (i % 3) * 0.45, 1.05, 0.25);
      ep.rotation.z = 0.3;
      cartGroup.add(ep);
    }

    // Potatoes and Green Chilies
    const potatoPile = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), potatoMat);
    potatoPile.position.set(0.6, 1.05, 0.1);
    const chiliBasket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.16, 8), chiliMat);
    chiliBasket.position.set(0.7, 1.05, -0.2);
    cartGroup.add(potatoPile, chiliBasket);

    // Hanging Balance Scale (দাঁড়িপাল্লা)
    const scalePole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0x495057 }));
    scalePole.position.set(-0.9, 1.35, 0);
    const scalePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 8), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 }));
    scalePlate.position.set(-0.9, 0.95, 0);
    cartGroup.add(scalePole, scalePlate);

    this.scene.add(cartGroup);

    this.shops.push({
      id: `shop_veg_${z}`,
      type: 'vegetable_cart',
      name: 'টাটকা দেশি সবজি ভাণ্ডার (আলু, পেঁয়াজ ও বেগুন)',
      x,
      z,
      width: 2.6,
      depth: 1.8,
      repairCost: 2000, // ৳2,000 fine
      isBroken: false,
      reaction: 'হায় হায়! আমার সব তাজা বেগুন আর লাল শাকের ঝুড়ি পিষে দিলেন রে!',
      meshGroup: cartGroup,
    });
  }

  // --- PITHA STALL (গরম চিতই ও ভাপা পিঠা, ৳১,২০০) ---
  private buildPithaStall(x: number, z: number) {
    const pithaGroup = new THREE.Group();
    pithaGroup.position.set(x, 0, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7f4f24, roughness: 0.9 });
    const clayMat = new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.95 }); // Earthen clay pot
    const whiteClothMat = new THREE.MeshStandardMaterial({ color: 0xf5f3f4, roughness: 0.8 }); // Steaming cloth

    // Low wooden bench counter
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 1.2), woodMat);
    bench.position.set(0, 0.32, 0);
    pithaGroup.add(bench);

    // Signboard banner
    const signTex = CanvasTextureFactory.getPithaStallTexture();
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshStandardMaterial({ map: signTex }));
    sign.position.set(0, 0.5, Math.sign(x) * -0.62);
    sign.rotation.y = Math.sign(x) > 0 ? 0 : Math.PI;
    pithaGroup.add(sign);

    // Earthen clay stove with pot (মাটির চুলা ও ভাপা পিঠার হাঁড়ি)
    const stove = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.35, 10), clayMat);
    stove.position.set(-0.45, 0.82, 0);
    const steamPot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), whiteClothMat);
    steamPot.position.set(-0.45, 1.05, 0);
    pithaGroup.add(stove, steamPot);

    // Plates of mustard mash & jaggery
    const plate1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8), new THREE.MeshStandardMaterial({ color: 0xffb703 })); // Mustard
    plate1.position.set(0.35, 0.68, -0.2);
    const plate2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8), new THREE.MeshStandardMaterial({ color: 0x582f0e })); // Date jaggery
    plate2.position.set(0.35, 0.68, 0.2);
    pithaGroup.add(plate1, plate2);

    this.scene.add(pithaGroup);

    this.shops.push({
      id: `shop_pitha_${z}`,
      type: 'pitha_stall',
      name: 'মামার গরম চিতই ও ভাপা পিঠা',
      x,
      z,
      width: 2.2,
      depth: 1.5,
      repairCost: 1200, // ৳1,200 fine
      isBroken: false,
      reaction: 'হায় হায়! আমার গরম ভাপা পিঠার হাঁড়ি আর চুলা ভাইঙ্গা দিলেন!',
      meshGroup: pithaGroup,
    });
  }

  // --- JHALMURI CART (ঝালমুড়ির টিনের বাক্স গাড়ি, ৳৮০০) ---
  private buildJhalmuriCart(x: number, z: number) {
    const muriGroup = new THREE.Group();
    muriGroup.position.set(x, 0, z);

    const tinMat = new THREE.MeshStandardMaterial({ color: 0xd90429, metalness: 0.4, roughness: 0.5 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });

    // Tin box cart
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.9), tinMat);
    box.position.set(0, 0.8, 0);
    muriGroup.add(box);

    // Front sign
    const signTex = CanvasTextureFactory.getJhalmuriCartTexture();
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.38), new THREE.MeshStandardMaterial({ map: signTex }));
    sign.position.set(0, 0.8, Math.sign(x) * -0.47);
    sign.rotation.y = Math.sign(x) > 0 ? 0 : Math.PI;
    muriGroup.add(sign);

    // 2 Cart Wheels
    [-0.6, 0.6].forEach(wx => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.35, 0);
      muriGroup.add(wheel);
    });

    // Glass jars with puffed rice & chanachur
    for (let j = 0; j < 3; j++) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.28, 8), glassMat);
      jar.position.set(-0.4 + j * 0.4, 1.3, 0);
      muriGroup.add(jar);
    }

    // Tin mixing funnel can
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.22, 8), steelMat);
    funnel.position.set(0.55, 1.25, 0.2);
    muriGroup.add(funnel);

    this.scene.add(muriGroup);

    this.shops.push({
      id: `shop_muri_${z}`,
      type: 'jhalmuri_cart',
      name: 'স্পেশাল বোম্বাই মরিচের ঝালমুড়ি',
      x,
      z,
      width: 1.8,
      depth: 1.2,
      repairCost: 800, // ৳800 fine
      isBroken: false,
      reaction: 'ভাই! আমার বোম্বাই মরিচের ঝালমুড়ির টিন সব রাস্তায় ছড়ায়া দিলেন!',
      meshGroup: muriGroup,
    });
  }

  // --- PAAN BIDI STALL (পান-সিগারেট ও খিলি পানের দোকান, ৳১,০০০) ---
  private buildPaanBidiStall(x: number, z: number) {
    const paanGroup = new THREE.Group();
    paanGroup.position.set(x, 0, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x582f0e });
    const betelMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.6 }); // Green betel leaves

    // Wooden counter table
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.9), woodMat);
    table.position.set(0, 0.4, 0);
    paanGroup.add(table);

    // Signboard banner
    const signTex = CanvasTextureFactory.getPaanBidiStallTexture();
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.35), new THREE.MeshStandardMaterial({ map: signTex }));
    sign.position.set(0, 0.55, Math.sign(x) * -0.47);
    sign.rotation.y = Math.sign(x) > 0 ? 0 : Math.PI;
    paanGroup.add(sign);

    // Stacks of betel leaves wrapped in damp green cloth
    const betelStack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.3), betelMat);
    betelStack.position.set(-0.35, 0.86, 0);
    paanGroup.add(betelStack);

    // Spice jars & silver box
    const spiceBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.2), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 }));
    spiceBox.position.set(0.35, 0.85, 0);
    paanGroup.add(spiceBox);

    this.scene.add(paanGroup);

    this.shops.push({
      id: `shop_paan_${z}`,
      type: 'paan_bidi_stall',
      name: 'শাহী খিলি পান ও বিড়ি ভান্ডার',
      x,
      z,
      width: 1.8,
      depth: 1.2,
      repairCost: 1000, // ৳1,000 fine
      isBroken: false,
      reaction: 'সর্বনাশ! আমার শাহী খিলি পান আর মসলার বয়াম চুরমার করলেন!',
      meshGroup: paanGroup,
    });
  }

  // --- BALLOON VENDOR (হিলিয়াম গ্যাসের রঙিন বেলুনের গুচ্ছ, ৳৮০০) ---
  private buildBalloonVendor(x: number, z: number) {
    const balloonGroup = new THREE.Group();
    balloonGroup.position.set(x, 0, z);

    const stickMat = new THREE.MeshStandardMaterial({ color: 0xc4a482 });
    const gasCanisterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7 });

    // Bamboo pole held vertically
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.8, 8), stickMat);
    pole.position.set(0, 1.4, 0);
    balloonGroup.add(pole);

    // Small blue helium gas canister
    const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.45, 8), gasCanisterMat);
    canister.position.set(0.2, 0.22, 0);
    balloonGroup.add(canister);

    // Cluster of 8 bright helium balloons
    const balloonColors = [0xff0054, 0x00f5d4, 0xfee440, 0x7209b7, 0xfb5607, 0x3a86ff];
    for (let b = 0; b < 8; b++) {
      const bColor = balloonColors[b % balloonColors.length];
      const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.2, metalness: 0.1 })
      );
      const angle = (b * Math.PI * 2) / 8;
      balloon.position.set(Math.cos(angle) * 0.45, 2.6 + (b % 3) * 0.25, Math.sin(angle) * 0.45);
      balloonGroup.add(balloon);
    }

    this.scene.add(balloonGroup);

    this.shops.push({
      id: `shop_balloon_${z}`,
      type: 'balloon_vendor',
      name: 'রঙিন গ্যাসের বেলুনের গুচ্ছ',
      x,
      z,
      width: 1.6,
      depth: 1.6,
      repairCost: 800, // ৳800 fine
      isBroken: false,
      reaction: 'ওরে বাবারে! আমার সব রঙিন গ্যাসের বেলুন আকাশে উড়াইয়া দিলেন!',
      meshGroup: balloonGroup,
    });
  }

  // --- BOOK STALL (ফুটপাতের পুরান বই ও ম্যাগাজিন স্টল, ৳২,৫০০) ---
  private buildBookStall(x: number, z: number) {
    const bookGroup = new THREE.Group();
    bookGroup.position.set(x, 0, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });

    // Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 1.4), woodMat);
    table.position.set(0, 0.28, 0);
    bookGroup.add(table);

    // Signboard banner
    const signTex = CanvasTextureFactory.getBookStallTexture();
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.45), new THREE.MeshStandardMaterial({ map: signTex }));
    sign.position.set(0, 0.45, Math.sign(x) * -0.72);
    sign.rotation.y = Math.sign(x) > 0 ? 0 : Math.PI;
    bookGroup.add(sign);

    // Stacks of books with various colored covers
    const bookColors = [0xd90429, 0x1d3557, 0x007f5f, 0xf77f00, 0x4a4e69];
    for (let bk = 0; bk < 8; bk++) {
      const col = bookColors[bk % bookColors.length];
      const stack = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.22, 0.28),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 })
      );
      stack.position.set(-0.8 + (bk % 4) * 0.5, 0.66, (Math.floor(bk / 4) - 0.5) * 0.5);
      bookGroup.add(stack);
    }

    this.scene.add(bookGroup);

    this.shops.push({
      id: `shop_book_${z}`,
      type: 'book_stall',
      name: 'ফুটপাত পুরান বই মেলা ও ম্যাগাজিন',
      x,
      z,
      width: 2.6,
      depth: 1.8,
      repairCost: 2500, // ৳2,500 fine
      isBroken: false,
      reaction: 'ভাই রে ভাই! ফুটপাতের এত বই আর ম্যাগাজিন সব কাদায় মিশায়া দিলেন!',
      meshGroup: bookGroup,
    });
  }

  // --- MOBILE ACCESSORIES (মোবাইল এক্সেসরিজ ও হেডফোন, ৳৩,৫০০) ---
  private buildMobileAccessories(x: number, z: number) {
    const mobGroup = new THREE.Group();
    mobGroup.position.set(x, 0, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });

    // Vertical display stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 0.1), metalMat);
    stand.position.set(0, 0.9, 0);
    mobGroup.add(stand);

    // Signboard banner
    const signTex = CanvasTextureFactory.getMobileAccessoriesTexture();
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), new THREE.MeshStandardMaterial({ map: signTex }));
    sign.position.set(0, 1.6, Math.sign(x) * -0.08);
    sign.rotation.y = Math.sign(x) > 0 ? 0 : Math.PI;
    mobGroup.add(sign);

    // Colorful hanging phone cases
    const caseColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
    for (let c = 0; c < 12; c++) {
      const ph = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.28, 0.03),
        new THREE.MeshStandardMaterial({ color: caseColors[c % caseColors.length], roughness: 0.3 })
      );
      ph.position.set(-0.7 + (c % 4) * 0.45, 0.6 + Math.floor(c / 4) * 0.35, Math.sign(x) * -0.06);
      mobGroup.add(ph);
    }

    this.scene.add(mobGroup);

    this.shops.push({
      id: `shop_mob_${z}`,
      type: 'mobile_accessories',
      name: 'ডিজিটাল মোবাইল এক্সেসরিজ',
      x,
      z,
      width: 2.2,
      depth: 1.4,
      repairCost: 3500, // ৳3,500 fine
      isBroken: false,
      reaction: 'আমার সব ব্র্যান্ডের মোবাইল কভার আর হেডফোনের পসরা শেষ কইরা দিলেন!',
      meshGroup: mobGroup,
    });
  }

  // --- FLOWER SELLER (রজনীগন্ধা ও গাঁদা ফুলের ডালা, ৳১,৫০০) ---
  private buildFlowerSeller(x: number, z: number) {
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(x, 0, z);

    const caneMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 }); // Woven cane wicker

    // 3 Round wicker cane baskets
    const positions = [
      { x: -0.5, z: 0 },
      { x: 0.5, z: -0.2 },
      { x: 0.1, z: 0.4 },
    ];

    positions.forEach((p, idx) => {
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.25, 12), caneMat);
      basket.position.set(p.x, 0.15, p.z);
      flowerGroup.add(basket);

      // Flower mound (Marigold orange or Tuberose white)
      const fColor = idx === 0 ? 0xfb8500 : idx === 1 ? 0xffffff : 0xd90429;
      const mound = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 8, 8),
        new THREE.MeshStandardMaterial({ color: fColor, roughness: 0.8 })
      );
      mound.position.set(p.x, 0.32, p.z);
      flowerGroup.add(mound);
    });

    // Signboard banner
    const signTex = CanvasTextureFactory.getFlowerSellerTexture();
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.38), new THREE.MeshStandardMaterial({ map: signTex }));
    sign.position.set(0, 0.45, Math.sign(x) * -0.55);
    sign.rotation.y = Math.sign(x) > 0 ? 0 : Math.PI;
    flowerGroup.add(sign);

    this.scene.add(flowerGroup);

    this.shops.push({
      id: `shop_flower_${z}`,
      type: 'flower_seller',
      name: 'তাজা ফুলের ডালা ও তোড়া',
      x,
      z,
      width: 1.8,
      depth: 1.6,
      repairCost: 1500, // ৳1,500 fine
      isBroken: false,
      reaction: 'হায় আল্লাহ! আমার তাজা গাঁদা ফুল আর রজনীগন্ধার ডালা পিষে দিলেন!',
      meshGroup: flowerGroup,
    });
  }

  // --- MIRPUR-10 GOLCHOTTOR (ROUNDABOUT CIRCLE & LANDMARK MONUMENT) ---
  private buildMirpur10Golchottor() {
    const roundaboutZ = 340;
    const roundaboutGroup = new THREE.Group();
    roundaboutGroup.position.set(0, 0, roundaboutZ);

    // 1. Circular asphalt roadway (Outer Radius 28m, Inner 16m)
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x444547, roughness: 0.85 });
    const ringGeo = new THREE.RingGeometry(16, 28, 48);
    const ringRoad = new THREE.Mesh(ringGeo, roadMat);
    ringRoad.rotation.x = -Math.PI / 2;
    ringRoad.position.y = 0.02;
    ringRoad.receiveShadow = true;
    roundaboutGroup.add(ringRoad);

    // Circular white dashed lane line in roundabout
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dashRing = new THREE.Mesh(new THREE.RingGeometry(21.8, 22.2, 48), dashMat);
    dashRing.rotation.x = -Math.PI / 2;
    dashRing.position.y = 0.03;
    roundaboutGroup.add(dashRing);

    // 2. Circular Kerb with Black/White Stripes (Radius 16m)
    const kerbTex = CanvasTextureFactory.getKerbTexture();
    kerbTex.repeat.set(36, 1);
    const kerbMat = new THREE.MeshStandardMaterial({ map: kerbTex, roughness: 0.7 });
    const kerbRing = new THREE.Mesh(new THREE.CylinderGeometry(16, 16.2, 0.42, 48, 1, true), kerbMat);
    kerbRing.position.y = 0.21;
    kerbRing.castShadow = true;
    roundaboutGroup.add(kerbRing);

    // 3. Central Raised Grassy Island (Radius 15.9m)
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.9 });
    const lawn = new THREE.Mesh(new THREE.CylinderGeometry(15.9, 15.9, 0.38, 48), grassMat);
    lawn.position.y = 0.19;
    roundaboutGroup.add(lawn);

    // 4. Multi-tier Monument Base (Dhaka Landmark Plinth)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xced4da, roughness: 0.5 });
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 8.2, 0.6, 24), baseMat);
    base1.position.y = 0.68;
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.6, 0.6, 24), baseMat);
    base2.position.y = 1.28;
    roundaboutGroup.add(base1, base2);

    // 5. Stainless Steel Modern Monument Sculpture (Mirpur-10 Landmark)
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, metalness: 0.9, roughness: 0.15 });
    for (let i = 0; i < 4; i++) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.24, 12, 32, Math.PI), steelMat);
      arch.rotation.y = (i * Math.PI) / 4;
      arch.position.y = 4.8;
      arch.castShadow = true;
      roundaboutGroup.add(arch);
    }
    // Central towering spire & glowing chrome sphere
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 9.5, 12), steelMat);
    spire.position.y = 6.2;
    spire.castShadow = true;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), steelMat);
    sphere.position.y = 11.2;
    roundaboutGroup.add(spire, sphere);

    // 6. Tropical Flowerbeds & Shrubs
    const flowerRedMat = new THREE.MeshStandardMaterial({ color: 0xd90429 });
    const flowerYellowMat = new THREE.MeshStandardMaterial({ color: 0xffb703 });
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const fx = Math.cos(a) * 11.5;
      const fz = Math.sin(a) * 11.5;
      const bush = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.75, 1),
        a % 2 === 0 ? flowerRedMat : flowerYellowMat
      );
      bush.position.set(fx, 0.65, fz);
      bush.scale.set(1.2, 0.7, 1.2);
      roundaboutGroup.add(bush);
    }

    this.scene.add(roundaboutGroup);
  }

  // --- OVERHEAD ELECTRIC POLES WITH FUNNY POSTERS & SAGGING WIRES (কারেন্টের খাম্বা ও ঝুলন্ত তার) ---
  private buildElectricPolesAndSaggingWires() {
    const poleGroup = new THREE.Group();
    poleGroup.name = 'Electric_Poles_And_Wires';

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5a6268, roughness: 0.92 });
    const crossArmMat = new THREE.MeshStandardMaterial({ color: 0x212529, metalness: 0.8, roughness: 0.3 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 });
    const transformerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const kiteMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const crowMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

    const zSteps = [
      480, 420, 360, 300, 240, 180, 120, 60, 0,
      -60, -120, -180, -240, -300, -380, -460, -540, -620, -700, -780, -860, -940, -1020
    ];

    let posterIndex = 0;

    zSteps.forEach((z, idx) => {
      [-14.0, 14.0].forEach((x, sideIdx) => {
        const pole = new THREE.Group();
        pole.position.set(x, 0, z);

        // Concrete pole pillar (9.5m tall with octagonal profile)
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 9.5, 8), poleMat);
        col.position.y = 4.75;
        col.castShadow = true;
        pole.add(col);

        // Authentic Bangladeshi torn posters on pole ("ছাগল ডলার নিখোঁজ", "পোস্টার লাগানো নিষেধ", ইত্যাদি)
        const posterTex = FunnyPosterFactory.getPosterTexture(posterIndex++);
        const posterMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.23, 0.25, 1.5, 10, 1, true, 0, Math.PI * 1.3),
          new THREE.MeshStandardMaterial({ map: posterTex, side: THREE.DoubleSide, roughness: 0.8 })
        );
        posterMesh.position.y = 2.4;
        posterMesh.rotation.y = sideIdx === 0 ? Math.PI / 2 : -Math.PI / 2;
        pole.add(posterMesh);

        // Secondary small notice on reverse side
        const noticeTex = FunnyPosterFactory.getPosterTexture((posterIndex + 2) % 7);
        const noticeMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.24, 0.9, 8, 1, true, 0, Math.PI * 1.0),
          new THREE.MeshStandardMaterial({ map: noticeTex, side: THREE.DoubleSide, roughness: 0.85 })
        );
        noticeMesh.position.y = 4.0;
        noticeMesh.rotation.y = sideIdx === 0 ? -Math.PI / 2 : Math.PI / 2;
        pole.add(noticeMesh);

        // Metal Cross-arm near top with porcelain insulators
        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 2.4), crossArmMat);
        cross.position.set(0, 8.5, 0);
        pole.add(cross);

        [-0.9, -0.3, 0.3, 0.9].forEach((oz) => {
          const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.18, 6), new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
          ins.position.set(0, 8.68, oz);
          pole.add(ins);
        });

        // Transformer drum on every 3rd pole
        if (idx % 3 === 0) {
          const trans = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 10), transformerMat);
          trans.position.set(sideIdx === 0 ? -0.5 : 0.5, 6.8, 0);
          pole.add(trans);

          // Tangled wire coils around pole (karenter tarer bundle)
          const coilGeo = new THREE.TorusGeometry(0.38, 0.05, 6, 12);
          const coil = new THREE.Mesh(coilGeo, wireMat);
          coil.rotation.x = Math.PI / 2;
          coil.position.set(0, 6.5, 0);
          pole.add(coil);
        }

        // Streetlamp arm extending over the road
        const lampMat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 1.2 });
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.8, 6), crossArmMat);
        arm.position.set(sideIdx === 0 ? 1.2 : -1.2, 8.8, 0);
        arm.rotation.z = sideIdx === 0 ? -Math.PI / 5 : Math.PI / 5;

        const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.32, 8), crossArmMat);
        lamp.position.set(sideIdx === 0 ? 2.4 : -2.4, 8.0, 0);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), lampMat);
        bulb.position.set(sideIdx === 0 ? 2.4 : -2.4, 7.85, 0);

        // PointLight casting warm sodium light cone on the asphalt road
        const streetLight = new THREE.PointLight(0xf59e0b, 1.2, 24, 1.5);
        streetLight.position.set(x + (sideIdx === 0 ? 2.4 : -2.4), 7.8, z);
        streetLight.castShadow = false; // keep performance optimal
        this.scene.add(streetLight);
        this.streetLamps.push({ light: streetLight, mat: lampMat });

        pole.add(arm, lamp, bulb);
        poleGroup.add(pole);
      });

      // Sagging overhead electric wires (karenter tar) between consecutive poles
      if (idx < zSteps.length - 1) {
        const nextZ = zSteps[idx + 1];
        [-14.0, 14.0].forEach((x, sideIdx) => {
          [-0.8, 0, 0.8].forEach((offsetZ, wireIdx) => {
            const curve = new THREE.QuadraticBezierCurve3(
              new THREE.Vector3(x, 8.65, z + offsetZ),
              new THREE.Vector3(x, 7.2 - wireIdx * 0.25, (z + nextZ) / 2),
              new THREE.Vector3(x, 8.65, nextZ + offsetZ)
            );
            const pts = curve.getPoints(12);
            const wireGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const wireLine = new THREE.Line(wireGeo, wireMat);
            poleGroup.add(wireLine);

            // Perched black crow (কাক) on wire
            if (idx % 2 === 0 && wireIdx === 1) {
              const crow = new THREE.Group();
              const midPt = curve.getPoint(0.45);
              crow.position.copy(midPt);
              // Body
              const cbody = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 6), crowMat);
              cbody.rotation.z = Math.PI / 2.5;
              // Head & Beak
              const chead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), crowMat);
              chead.position.set(0.12, 0.06, 0);
              const cbeak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), new THREE.MeshBasicMaterial({ color: 0x94a3b8 }));
              cbeak.rotation.z = -Math.PI / 2;
              cbeak.position.set(0.18, 0.06, 0);
              crow.add(cbody, chead, cbeak);
              poleGroup.add(crow);
            }

            // Tangled colorful kite (ঘুড়ি) stuck in wires on Begum Rokeya Ave!
            if (idx === 3 && wireIdx === 0 && sideIdx === 1) {
              const kite = new THREE.Group();
              const kPt = curve.getPoint(0.6);
              kite.position.copy(kPt);
              const kMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), kiteMat);
              kMesh.rotation.z = Math.PI / 4;
              kMesh.rotation.y = 0.3;
              kite.add(kMesh);
              poleGroup.add(kite);
            }
          });
        });
      }
    });

    this.scene.add(poleGroup);
  }
  // --- ROADSIDE CNG REFUEL STATION ---
  private buildCNGRefuelStation() {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(this.cngStationPosition.x, 0, this.cngStationPosition.z);

    const greenMat = new THREE.MeshStandardMaterial({ color: 0x007f5f, roughness: 0.4 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x2b2d42 });

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 14), greenMat);
    canopy.position.set(3, 4.5, 0);
    canopy.castShadow = true;

    [-1, 1].forEach(px => {
      [-4, 4].forEach(pz => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.2, 12), whiteMat);
        pillar.position.set(3 + px * 3.5, 2.1, pz);
        stationGroup.add(pillar);
      });
    });

    const pumpL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), pumpMat);
    pumpL.position.set(3, 0.9, -2.5);
    const pumpR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), pumpMat);
    pumpR.position.set(3, 0.9, 2.5);
    stationGroup.add(pumpL, pumpR);

    // Glowing Bengali CNG Signboard
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#007f5f';
      ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = '#ffea00';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 116);
      ctx.font = 'bold 38px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('মেঘনা সিএনজি ফিলিং স্টেশন', 256, 45);
      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffea00';
      ctx.fillText('এখানে প্রাকৃতিক গ্যাস রিফুয়েল করুন • ২৪ ঘণ্টা খোলা', 256, 92);
    }
    const cngSignTex = new THREE.CanvasTexture(canvas);
    cngSignTex.colorSpace = THREE.SRGBColorSpace;
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(8.5, 2.0),
      new THREE.MeshStandardMaterial({ map: cngSignTex, emissive: 0x224422, emissiveIntensity: 0.3 })
    );
    signMesh.position.set(-2.05, 4.5, 0);
    signMesh.rotation.y = -Math.PI / 2;
    stationGroup.add(signMesh);

    stationGroup.add(canopy);
    this.scene.add(stationGroup);
  }

  // --- DHAKA METROPOLITAN POLICE (DMP) TRAFFIC POLICE BOOTHS ---
  private buildTrafficPoliceBooths() {
    const boothLocations = [
      { x: 13.8, z: 200, name: 'কাজীপাড়া পুলিশ বক্স' },
      { x: -13.8, z: -20, name: 'শেওড়াপাড়া পুলিশ বক্স' },
      { x: 8.5, z: -880, name: 'শাহবাগ মোড় পুলিশ বক্স' },
    ];

    const bluePaint = new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.4 });
    const yellowPaint = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.4 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0077b6, roughness: 0.5 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.85,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
    });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa });
    const navyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c });
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });

    boothLocations.forEach((loc) => {
      this.policeBooths.push(loc);

      const boothGroup = new THREE.Group();
      boothGroup.position.set(loc.x, 0.16, loc.z);

      // Concrete plinth
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x64748b }));
      plinth.position.y = 0.15;
      boothGroup.add(plinth);

      // Octagonal booth lower body with blue & yellow DMP bands
      const lowerBody = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 1.2, 8), bluePaint);
      lowerBody.position.y = 0.9;
      const yellowBand = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.25, 8), yellowPaint);
      yellowBand.position.y = 0.7;
      boothGroup.add(lowerBody, yellowBand);

      // Glass windows
      const windowMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.75, 8), glassMat);
      windowMesh.position.y = 1.85;
      boothGroup.add(windowMesh);

      // Conical police umbrella roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.85, 0.85, 8), roofMat);
      roof.position.y = 2.65;
      boothGroup.add(roof);

      // Overhead flashing beacon
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.22, 12), neonMat);
      beacon.position.y = 3.15;
      boothGroup.add(beacon);

      // DMP Traffic Officer standing attentively outside booth
      const officerGroup = new THREE.Group();
      officerGroup.position.set(loc.x > 0 ? -1.6 : 1.6, 0, 0);

      // Officer body
      const oLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.85, 8), navyMat);
      oLegs.position.y = 0.42;
      const oTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.75, 8), whiteMat);
      oTorso.position.y = 1.15;
      const oSash = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.26), yellowPaint);
      oSash.position.y = 1.15;
      oSash.rotation.z = 0.4;
      const oHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
      oHead.position.y = 1.65;
      const oCap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.1, 8), bluePaint);
      oCap.position.y = 1.8;
      officerGroup.add(oLegs, oTorso, oSash, oHead, oCap);
      boothGroup.add(officerGroup);

      this.scene.add(boothGroup);
    });
  }

  // --- UPDATE ANIMATION LOOP ---
  public update(dt: number) {
    // Metro train moves only on Begum Rokeya viaduct (between Z = -200 and +520)
    if (this.metroTrain) {
      this.metroZ += 18 * dt;
      if (this.metroZ > 520) {
        this.metroZ = -200;
      }
      this.metroTrain.position.z = this.metroZ;
    }
  }
}
