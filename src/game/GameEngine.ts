import { WeatherSkySystem } from "../world/WeatherSkySystem";
import { CameraDirector } from "./CameraDirector";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { VehicleFactory } from '../world/VehicleFactory';
import { DhakaCity } from '../world/DhakaCity';
import { TrafficManager } from './TrafficManager';
import { soundEffects } from '../audio/SoundEffects';
import { LossLedger } from './LossLedger';
import { PublicAngerSystem } from './PublicAngerSystem';
import { PedestrianCrowd } from './PedestrianCrowd';
import { NewspaperGenerator } from './NewspaperGenerator';
import { BreakableShop, CameraMode, CartoonImpactText, DebrisPiece, Mission, NewspaperData, PlayerState, VehicleType, WeatherType } from '../types';

export class GameEngine {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  public city: DhakaCity;
  public traffic: TrafficManager;
  public pedestrians!: PedestrianCrowd;
  public lossLedger: LossLedger = new LossLedger();
  public angerSystem: PublicAngerSystem = new PublicAngerSystem();
  public cameraDirector!: CameraDirector;
  public weatherSystem!: WeatherSkySystem;
  public currentQuality: "low" | "medium" | "high" = "high";

  public playerGroup: THREE.Group;
  public playerVehicleType: VehicleType = 'cng_auto';

  // Physics state
  public posX: number = 6.8;  // Right lane (forward down Begum Rokeya Ave towards Kazipara/Shahbagh)
  public posZ: number = 240;  // Starts on Begum Rokeya Ave
  public speed: number = 0;   // m/s
  public steerAngle: number = 0;
  public headingAngle: number = Math.PI; // Heading forward down the road (facing -Z)
  public rollAngle: number = 0;
  public pitchAngle: number = 0;

  // Input states
  public inputGas: boolean = false;
  public inputBrake: boolean = false;
  public inputLeft: boolean = false;
  public inputRight: boolean = false;
  public inputHorn: boolean = false;

  // Game state
  public playerState: PlayerState = {
    money: 2500,
    fuel: 100,
    maxFuel: 100,
    speedKmh: 0,
    activeVehicle: 'cng_auto',
    currentMission: null,
    completedMissionsCount: 0,
    damageIncurred: 0,
    nationalLossTotal: 0,
    publicAnger: 0,
    settlementCost: 300,
    speechBubble: null,
    isGameOver: false,
    gameOverReason: '',
    currentRoadName: 'বেগম রোকেয়া সরণি (মিরপুর-১০)',
    isMobSmashing: false,
    newspaperData: null,
    floatingCostTexts: [],
  };

  public isFirstPerson: boolean = false;
  public cameraShake: number = 0;
  public alertMessage: string | null = null;
  public alertTimer: number = 0;
  public mobImpactTexts: CartoonImpactText[] = [];

  private mobSmashTimer: number = 0;
  private driverEscapeMesh: THREE.Group | null = null;
  private detachedParts: THREE.Mesh[] = [];
  private footTileTimer: number = 0;
  private impactSpawnCooldown: number = 0;
  private policeWhistleCooldown: number = 0;
  private speedEscapeAlertCooldown: number = 0;
  private roadblockGroup: THREE.Group | null = null;
  private roadblockActive: boolean = false;

  private clock = new THREE.Clock();
  private reqId: number = 0;
  private isDestroyed: boolean = false;
  private isSoftwareGl: boolean = false;
  private hudNotifyTimer: number = 0;

  // Active debris pieces
  private debrisList: DebrisPiece[] = [];

  // Passenger & Mission Markers
  private passengerBeacon: THREE.Mesh | null = null;
  private destinationBeacon: THREE.Mesh | null = null;
  private passengerFigure: THREE.Group | null = null;

  // Scratch objects
  private _targetCamPos = new THREE.Vector3();
  private _targetLookAt = new THREE.Vector3();

  // State update callback for React HUD
  public onStateChange?: (state: PlayerState, alert: string | null) => void;

  constructor(mountElement: HTMLElement) {
    const probe = document.createElement('canvas').getContext('webgl2');
    if (probe) {
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } else {
      this.isSoftwareGl = true;
    }

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      stencil: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountElement.appendChild(this.renderer.domElement);

    // 2. Scene & Studio Lighting (Warm Dhaka daylight haze)
    this.scene = new THREE.Scene();
    const hazeColor = new THREE.Color(0xd6cebe);
    this.scene.background = hazeColor;
    this.scene.fog = new THREE.FogExp2(0xd6cebe, 0.0065);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const sunLight = new THREE.DirectionalLight(0xfffaea, 2.4);
    sunLight.position.set(45, 90, 60);
    sunLight.castShadow = !this.isSoftwareGl;
    if (sunLight.castShadow) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 240;
      const d = 50;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x8899aa, 1.25);
    this.scene.add(hemiLight);

    // 3. Camera & Director (6 modes, speed FOV, bump shake, slow-mo)
    this.camera = new THREE.PerspectiveCamera(70, mountElement.clientWidth / mountElement.clientHeight, 0.1, 900);
    this.cameraDirector = new CameraDirector(this.camera);

    // 4. Dynamic Sky & Weather System
    this.weatherSystem = new WeatherSkySystem(this.scene, this.renderer);

    // 5. City World & PBR Material Registration
    this.city = new DhakaCity();
    this.scene.add(this.city.scene);

    this.city.streetLamps.forEach(l => this.weatherSystem.registerStreetLamp(l.light, l.mat));
    this.city.roadMaterials.forEach(m => this.weatherSystem.registerRoadMaterial(m));
    this.city.nightMaterials.forEach(m => this.weatherSystem.registerNightWindowMaterial(m));
    this.city.mosqueMaterials.forEach(m => this.weatherSystem.registerMosqueMaterial(m));
    this.city.neonMaterials.forEach(m => this.weatherSystem.registerNeonMaterial(m));

    this.traffic = new TrafficManager(this.scene);
    this.pedestrians = new PedestrianCrowd(this.scene);

    // 6. Player Vehicle
    this.playerGroup = new THREE.Group();
    this.playerGroup.position.set(this.posX, 0, this.posZ);
    this.playerGroup.rotation.y = this.headingAngle;
    this.scene.add(this.playerGroup);
    this.setPlayerVehicle('cng_auto');

    // 7. Mission setup
    this.initBeacons();
    this.spawnNewMission();

    // 8. Event listeners & start loop
    window.addEventListener('resize', this.onResize);
    this.setupInputListeners();
    this.setupPhotoModeControls(mountElement);

    this.startLoop();
  }

  private setupPhotoModeControls(mountElement: HTMLElement) {
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    mountElement.addEventListener('pointerdown', (e) => {
      if (this.cameraDirector.mode === 'photo_mode') {
        isDragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (isDragging && this.cameraDirector.mode === 'photo_mode') {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        this.cameraDirector.orbitPhoto(-dx * 0.009, dy * 0.012);
      }
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    mountElement.addEventListener('wheel', (e) => {
      if (this.cameraDirector.mode === 'photo_mode') {
        this.cameraDirector.zoomPhoto(e.deltaY * 0.005);
      }
    }, { passive: true });
  }

  public cycleCamera(): CameraMode {
    const next = this.cameraDirector.cycleNextMode();
    soundEffects.playMeterTick();
    const modeNames: Record<CameraMode, string> = {
      low_chase: '১. লো চেজ (Default)',
      high_chase: '২. হাই চেজ',
      cinematic_side: '৩. সিনেম্যাটিক সাইড-ফলো',
      first_person: '৪. ড্রাইভার ভিউ (মিরর ও মিটার)',
      top_down: '৫. টপ-ডাউন ড্রোন ভিউ',
      photo_mode: '৬. ফটো মোড (ফ্রি ক্যামেরা)',
    };
    this.triggerAlert(`ক্যামেরা: ${modeNames[next]}`);
    if (this.onStateChange) {
      this.onStateChange({ ...this.playerState }, `ক্যামেরা: ${modeNames[next]}`);
    }
    return next;
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraDirector.setMode(mode);
    soundEffects.playMeterTick();
  }

  public setWeather(weather: WeatherType) {
    this.weatherSystem.setWeather(weather);
    soundEffects.playMeterTick();
    if (this.onStateChange) {
      this.onStateChange({ ...this.playerState }, "আবহাওয়া পরিবর্তিত হয়েছে");
    }
  }

  public setQuality(quality: "low" | "medium" | "high") {
    this.currentQuality = quality;
    if (quality === "low") {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1);
    } else if (quality === "medium") {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  public captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL("image/jpeg", 0.94);
  }


  public setPlayerVehicle(type: VehicleType) {
    this.playerVehicleType = type;
    this.playerState.activeVehicle = type;

    while (this.playerGroup.children.length > 0) {
      this.playerGroup.remove(this.playerGroup.children[0]);
    }

    let model: THREE.Group;
    if (type === 'easy_bike') {
      model = VehicleFactory.createEasyBike();
    } else if (type === 'cng_deluxe') {
      model = VehicleFactory.createCNGRickshaw(true);
    } else {
      model = VehicleFactory.createCNGRickshaw(false);
    }
    this.playerGroup.add(model);
  }

  // Fast travel between maps
  public teleportToMap(map: 'begum_rokeya' | 'shahbagh_rd') {
    if (map === 'shahbagh_rd') {
      this.posX = 7.0;
      this.posZ = -340; // At entrance of Shahbagh Road
      this.headingAngle = Math.PI;
      this.speed = 0;
      this.triggerAlert('শাহবাগ রোডে প্রবেশ করেছেন! (ঢাকা বিশ্ববিদ্যালয় এলাকা)');
    } else {
      this.posX = 6.8;
      this.posZ = 240; // On Begum Rokeya Ave
      this.headingAngle = Math.PI;
      this.speed = 0;
      this.triggerAlert('বেগম রোকেয়া সরণি, মিরপুর-১০-এ ফিরে এসেছেন!');
    }
    this.playerGroup.position.set(this.posX, 0, this.posZ);
    this.playerGroup.rotation.y = this.headingAngle;
    this.spawnNewMission();
  }

  private initBeacons() {
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    this.passengerBeacon = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.2, 24), beaconMat);
    this.passengerBeacon.position.set(0, 0.2, 0);
    this.scene.add(this.passengerBeacon);

    const personGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0077b6 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.85, 8), bodyMat);
    torso.position.y = 0.85;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), headMat);
    head.position.y = 1.45;
    personGroup.add(torso, head);
    this.passengerFigure = personGroup;
    this.scene.add(this.passengerFigure);

    const destMat = new THREE.MeshBasicMaterial({
      color: 0xffbe0b,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    this.destinationBeacon = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.2, 24), destMat);
    this.destinationBeacon.position.set(0, 0.2, 0);
    this.destinationBeacon.visible = false;
    this.scene.add(this.destinationBeacon);
  }

  private spawnNewMission() {
    const wpList = this.city.waypoints;
    // For initial mission, spawn conveniently ahead at Kazipara bus stand (wpList[1], z: 180)
    let fromIdx: number;
    let toIdx: number;
    if (this.playerState.completedMissionsCount === 0 && Math.abs(this.posZ - 240) < 50) {
      fromIdx = 1; // Kazipara Bus Stand (x: 8, z: 180)
      toIdx = 2;   // Shewrapara Bazar (x: -8, z: 40)
    } else {
      fromIdx = Math.floor(Math.random() * wpList.length);
      toIdx = Math.floor(Math.random() * wpList.length);
      while (toIdx === fromIdx) {
        toIdx = Math.floor(Math.random() * wpList.length);
      }
    }

    const fromWp = wpList[fromIdx];
    const toWp = wpList[toIdx];

    const dist = Math.abs(toWp.z - fromWp.z);
    const fare = Math.round(120 + dist * 1.1);

    const names = ['করিম সাহেব', 'সালমা বেগম', 'ছাত্র তন্ময়', 'শিল্পী রফিক', 'অধ্যাপক মতিন', 'ফারজানা হক'];
    const pName = names[Math.floor(Math.random() * names.length)];

    const mission: Mission = {
      id: `m_${Date.now()}`,
      passengerName: pName,
      passengerCount: Math.random() > 0.4 ? 2 : 1,
      pickupLocation: { x: fromWp.x, z: fromWp.z, name: fromWp.name },
      dropoffLocation: { x: toWp.x, z: toWp.z, name: toWp.name },
      fare,
      distance: dist,
      status: 'available',
    };

    this.playerState.currentMission = mission;

    if (this.passengerBeacon && this.passengerFigure) {
      this.passengerBeacon.position.set(fromWp.x, 0.2, fromWp.z);
      this.passengerBeacon.visible = true;
      this.passengerFigure.position.set(fromWp.x, 0.15, fromWp.z);
      this.passengerFigure.visible = true;
    }

    if (this.destinationBeacon) {
      this.destinationBeacon.position.set(toWp.x, 0.2, toWp.z);
      this.destinationBeacon.visible = false;
    }
  }

  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      soundEffects.init();
      soundEffects.resume();

      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.inputGas = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.inputBrake = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.inputLeft = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.inputRight = true;
      if (e.code === 'KeyH' || e.code === 'Space') {
        this.inputHorn = true;
        soundEffects.playHorn();
      }
      if (e.code === 'KeyC') {
        this.cycleCamera();
      }
    });


    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.inputGas = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.inputBrake = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.inputLeft = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.inputRight = false;
      if (e.code === 'KeyH' || e.code === 'Space') this.inputHorn = false;
    });

    window.addEventListener('blur', () => {
      this.inputGas = false;
      this.inputBrake = false;
      this.inputLeft = false;
      this.inputRight = false;
      this.inputHorn = false;
    });
  }

  private onResize = () => {
    if (!this.renderer || !this.camera) return;
    const parent = this.renderer.domElement.parentElement;
    if (parent) {
      this.camera.aspect = parent.clientWidth / parent.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(parent.clientWidth, parent.clientHeight);
    }
  };

  public fpsCap: 30 | 60 = 60;
  private lastFrameTimestamp: number = 0;

  private startLoop() {
    const tick = (timestamp: number) => {
      if (this.isDestroyed) return;

      const minInterval = 1000 / this.fpsCap - 1;
      if (timestamp - this.lastFrameTimestamp < minInterval) {
        this.reqId = requestAnimationFrame(tick);
        return;
      }
      this.lastFrameTimestamp = timestamp;

      const rawDt = this.clock.getDelta();
      const slowMo = this.cameraDirector ? this.cameraDirector.slowMotionFactor : 1.0;
      const dt = Math.min(rawDt, 0.05) * slowMo;

      this.update(dt);
      this.render();

      this.reqId = requestAnimationFrame(tick);
    };
    this.reqId = requestAnimationFrame(tick);
  }

  private update(dt: number) {
    if (this.playerState.isGameOver) return;

    // Update dynamic weather and sky
    if (this.weatherSystem) {
      this.weatherSystem.update(dt, this.posX, this.posZ);
    }

    // Photo Mode: Freeze vehicle movement & traffic so player can compose screenshot
    if (this.cameraDirector && this.cameraDirector.mode === 'photo_mode') {
      this.updateCamera(dt);
      if (this.onStateChange) {
        this.onStateChange({ ...this.playerState }, this.alertMessage);
      }
      return;
    }

    if (this.playerState.isMobSmashing) {
      this.updateMobSmash(dt);
      this.updateCamera(dt);
      this.render();
      if (this.onStateChange) {
        this.onStateChange({ ...this.playerState }, this.alertMessage);
      }
      return;
    }

    this.updatePhysics(dt);
    this.updateAudio();
    this.updateCollisions();
    this.updateMissions(dt);
    this.updateRefuel(dt);
    this.updateDebris(dt);
    this.updateFloatingCosts(dt);
    this.city.update(dt);

    this.traffic.update(dt, this.posX, this.posZ, this.speed);

    // 1. Police Booth Proximity Escape Check (DMP traffic police booths within 14m)
    let isNearPolice = false;
    if (this.city.policeBooths && this.city.policeBooths.length > 0) {
      for (const pb of this.city.policeBooths) {
        const dx = this.posX - pb.x;
        const dz = this.posZ - pb.z;
        if (dx * dx + dz * dz < 14 * 14) {
          isNearPolice = true;
          if (this.angerSystem.anger > 5 && this.policeWhistleCooldown <= 0) {
            soundEffects.playPoliceWhistle();
            this.policeWhistleCooldown = 6.0;
            this.triggerAlert(`👮‍♂️ ট্রাফিক পুলিশ বক্স (${pb.name})! জনতা ছত্রভঙ্গ হচ্ছে!`);
            this.angerSystem.triggerSpeech('পুলিশের বাঁশি শুনে জনতা পিছু হটলো!');
          }
          break;
        }
      }
    }
    if (this.policeWhistleCooldown > 0) {
      this.policeWhistleCooldown -= dt;
    }

    // 2. Speed Escape Check (> 35 km/h outruns angry crowds)
    const currentSpeedKmh = Math.abs(this.speed) * 3.6;
    if (currentSpeedKmh > 35 && this.angerSystem.anger > 10) {
      this.angerSystem.anger = Math.max(0, this.angerSystem.anger - 16 * dt);
      if (this.speedEscapeAlertCooldown <= 0) {
        this.speedEscapeAlertCooldown = 5.0;
        this.triggerAlert('⚡ তীব্র গতিতে জনতাকে পেছনে ফেলে পালাচ্ছেন!');
      }
    }
    if (this.speedEscapeAlertCooldown > 0) {
      this.speedEscapeAlertCooldown -= dt;
    }

    // 3. Anger & Safe Driving status
    const isCareful = Math.abs(this.posX) < 12.0 && Math.abs(this.speed) < 15.0;
    this.angerSystem.update(dt, isCareful, isNearPolice);

    // 4. Roadblock Check at 90% anger
    this.updateRoadblock();

    // Check Footpath driving violation
    if (Math.abs(this.posX) > 13.2) {
      this.angerSystem.addAnger(18 * dt, 'ফুটপাতে গাড়ি চালানো!');
      this.footTileTimer += dt;
      if (this.footTileTimer > 1.2) {
        this.footTileTimer = 0;
        this.lossLedger.recordDamage('footpath_tile', this.playerState.currentRoadName);
        this.deductMoney(200);
      }
    }

    // Pedestrian crowds update with horn reaction and cartoon slapstick launch
    if (this.pedestrians) {
      const pedResult = this.pedestrians.update(
        dt,
        this.posX,
        this.posZ,
        this.speed,
        this.angerSystem,
        this.inputHorn
      );

      if (pedResult.hitPedestrian) {
        this.cameraShake = 0.55;
        this.lossLedger.recordDamage('pedestrian_compensation', this.playerState.currentRoadName);
        this.deductMoney(pedResult.compensationAmount || 5000);
        this.addFloatingCost('-৳৫,০০০', 'ক্ষতিপূরণ দাবি!');
        this.addCartoonImpactText(pedResult.comicLine ? pedResult.comicLine.slice(0, 5) : 'ঠাস!');
        this.triggerAlert(`পথচারী ছিটকে আকাশে উড়ল! ক্ষতিপূরণ ৳৫,০০০ জরিমানা`);
      }

      // Prompt B: "The CNG is 'caught' when 3+ angry people are within 2m and speed is below 5 km/h"
      const isBelow5Kmh = currentSpeedKmh < 5.0;

      if (
        pedResult.surrounded ||
        (pedResult.nearCount >= 3 && isBelow5Kmh) ||
        (this.angerSystem.anger >= 98 && isBelow5Kmh)
      ) {
        this.startMobSmash();
        return;
      }
    }

    this.updateCamera(dt);

    if (this.alertTimer > 0) {
      this.alertTimer -= dt;
      if (this.alertTimer <= 0) {
        this.alertMessage = null;
      }
    }

    if (Math.abs(this.speed) > 1) {
      this.playerState.fuel = Math.max(0, this.playerState.fuel - dt * 0.25);
      if (this.playerState.fuel <= 0 && this.speed < 0.5) {
        this.triggerGameOver('সিএনজি গ্যাস শেষ হয়ে গেছে! ফিলিং স্টেশনে রিফুয়েল করেননি!');
      }
    }

    this.playerState.speedKmh = Math.round(Math.abs(this.speed) * 3.6);

    // Update active road location name based on position
    if (this.posZ <= -240) {
      this.playerState.currentRoadName = 'শাহবাগ রোড (ঢাকা বিশ্ববিদ্যালয় এলাকা)';
    } else {
      this.playerState.currentRoadName = 'বেগম রোকেয়া সরণি (মিরপুর-১০ মেট্রো জোন)';
    }

    // Sync live ledger, public anger, settlement cost and speech bubbles to PlayerState
    this.playerState.nationalLossTotal = this.lossLedger.getTotal();
    this.playerState.publicAnger = Math.round(this.angerSystem.anger);
    this.playerState.settlementCost = this.angerSystem.getSettlementCost();
    this.playerState.speechBubble = this.angerSystem.speechBubble;

    this.hudNotifyTimer += dt;
    if (this.hudNotifyTimer >= 0.05) {
      this.hudNotifyTimer = 0;
      if (this.onStateChange) {
        this.onStateChange({ ...this.playerState }, this.alertMessage);
      }
    }
  }

  private updatePhysics(dt: number) {
    let maxSpeed = 16.5;
    let accelRate = 8.5;
    let brakeRate = 14.0;
    let turnRate = 2.4;

    if (this.playerVehicleType === 'easy_bike') {
      maxSpeed = 10.5;
      accelRate = 5.5;
      turnRate = 2.8;
    } else if (this.playerVehicleType === 'cng_deluxe') {
      maxSpeed = 20.0;
      accelRate = 11.0;
    }

    if (this.inputGas && this.playerState.fuel > 0) {
      if (this.speed < maxSpeed) {
        this.speed += accelRate * dt;
      }
    } else if (this.inputBrake) {
      if (this.speed > 0.5) {
        this.speed -= brakeRate * dt;
      } else {
        this.speed = Math.max(-5.0, this.speed - accelRate * 0.6 * dt);
      }
    } else {
      if (Math.abs(this.speed) > 0.1) {
        this.speed -= Math.sign(this.speed) * 3.5 * dt;
      } else {
        this.speed = 0;
      }
    }

    if (Math.abs(this.speed) > 0.2) {
      const dirSign = this.speed >= 0 ? 1 : -1;
      if (this.inputLeft) {
        this.steerAngle = THREE.MathUtils.damp(this.steerAngle, 0.45, 8, dt);
      } else if (this.inputRight) {
        this.steerAngle = THREE.MathUtils.damp(this.steerAngle, -0.45, 8, dt);
      } else {
        this.steerAngle = THREE.MathUtils.damp(this.steerAngle, 0, 10, dt);
      }
      this.headingAngle += this.steerAngle * turnRate * dt * dirSign;
    } else {
      this.steerAngle = THREE.MathUtils.damp(this.steerAngle, 0, 10, dt);
    }

    this.posX += Math.sin(this.headingAngle) * this.speed * dt;
    this.posZ += Math.cos(this.headingAngle) * this.speed * dt;

    const targetRoll = -this.steerAngle * (Math.abs(this.speed) / maxSpeed) * 0.28;
    this.rollAngle = THREE.MathUtils.damp(this.rollAngle, targetRoll, 7, dt);

    this.playerGroup.position.set(this.posX, 0, this.posZ);
    this.playerGroup.rotation.y = this.headingAngle;
    this.playerGroup.rotation.z = this.rollAngle;

    const wheels = this.playerGroup.getObjectByName('wheels');
    if (wheels) {
      wheels.children.forEach(w => {
        w.rotation.x += (this.speed / 0.24) * dt;
      });
    }

    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 2.5);
    }
  }

  private updateAudio() {
    const speedRatio = Math.min(1.0, Math.abs(this.speed) / 16.5);
    soundEffects.updateEnginePitch(speedRatio, this.inputGas);
  }

  private updateCollisions() {
    const radius = 1.1;

    // Center Median on Begum Rokeya Ave (Z > -220)
    if (this.posZ > -220 && Math.abs(this.posX) < 1.35) {
      this.posX = Math.sign(this.posX) * 1.4;
      this.speed *= -0.3;
      this.cameraShake = 0.35;
      soundEffects.playCrash(0.6);
      this.lossLedger.recordDamage('kerb_block', this.playerState.currentRoadName);
      this.angerSystem.addAnger(8, 'আইল্যান্ডে ধাক্কা!');
      this.triggerAlert('আইল্যান্ডে ধাক্কা! কার্ব ব্লক ক্ষতিগ্রস্ত (৳৬০০)');
    }

    // Outer footpath boundary curbs
    if (this.posX < -14.2) {
      this.posX = -14.2;
      this.speed *= -0.3;
      this.cameraShake = 0.3;
      soundEffects.playCrash(0.5);
      this.lossLedger.recordDamage('kerb_block', this.playerState.currentRoadName);
      this.angerSystem.addAnger(10, 'ফুটপাতে ধাক্কা!');
    } else if (this.posX > 14.2) {
      this.posX = 14.2;
      this.speed *= -0.3;
      this.cameraShake = 0.3;
      soundEffects.playCrash(0.5);
      this.lossLedger.recordDamage('kerb_block', this.playerState.currentRoadName);
      this.angerSystem.addAnger(10, 'ফুটপাতে ধাক্কা!');
    }

    // Shahbagh Traffic Cones (X: ~2.8, Z: -260 to -1080)
    if (this.posZ <= -260 && this.posZ >= -1080 && Math.abs(this.posX - 2.8) < 0.65 && Math.abs(this.speed) > 1.5) {
      const coneDmg = this.lossLedger.recordDamage('traffic_cone', this.playerState.currentRoadName);
      this.angerSystem.addAnger(4);
      soundEffects.playCrash(0.4);
      this.spawnDebrisPiece(this.posX, this.posZ, new THREE.ConeGeometry(0.24, 0.75, 8), new THREE.MeshStandardMaterial({ color: 0xfb8500 }), 1);
      this.deductMoney(coneDmg.unitCost);
      this.triggerAlert(`ট্রাফিক কোনে ধাক্কা! ক্ষতি ৳${coneDmg.unitCost}`);
    }

    // Shahbagh Concrete Planters & Bollards (X: ~-16.7 and -12.2, Z: -920 to -1040)
    if (this.posZ <= -920 && this.posZ >= -1040) {
      if (Math.abs(this.posX - (-12.2)) < 0.65 && Math.abs(this.speed) > 1.5) {
        const bollardDmg = this.lossLedger.recordDamage('bollard', this.playerState.currentRoadName);
        this.angerSystem.addAnger(12);
        this.cameraShake = 0.45;
        this.speed *= -0.35;
        soundEffects.playCrash(0.7);
        this.spawnDebrisPiece(this.posX, this.posZ, new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x111111 }), 1);
        this.deductMoney(bollardDmg.unitCost);
        this.triggerAlert(`লোহার বোলার্ডে ধাক্কা! ক্ষতি ৳${bollardDmg.unitCost}`);
      } else if (this.posX < -15.5 && Math.abs(this.speed) > 1.5) {
        const plantDmg = this.lossLedger.recordDamage('planter_box', this.playerState.currentRoadName);
        this.angerSystem.addAnger(14);
        this.cameraShake = 0.5;
        this.speed *= -0.3;
        soundEffects.playCrash(0.8);
        this.spawnDebrisPiece(this.posX, this.posZ, new THREE.BoxGeometry(0.8, 0.4, 0.8), new THREE.MeshStandardMaterial({ color: 0x8d99ae }), 2);
        this.deductMoney(plantDmg.unitCost);
        this.triggerAlert(`ফুলের টবে ধাক্কা! ক্ষতি ৳${plantDmg.unitCost}`);
      }
    }

    // Traffic vehicle collision (accidents happen ONLY when PLAYER drives into front or sides of vehicles)
    const hitResult = this.traffic.getCollisions(this.posX, this.posZ, radius, this.speed, this.headingAngle);
    if (hitResult) {
      this.speed = -Math.sign(this.speed) * 4.0;
      this.cameraShake = 0.65;
      soundEffects.playCrash(1.3);

      let vKey = 'car_dent';
      if (hitResult.vehicle.type.includes('bus') || hitResult.vehicle.type.includes('coach')) vKey = 'bus_mirror';
      else if (hitResult.vehicle.type.includes('rickshaw')) vKey = 'rickshaw_damage';

      const dmgItem = this.lossLedger.recordDamage(vKey, this.playerState.currentRoadName);
      this.angerSystem.addAnger(25, `${dmgItem.nameBangla}!`);
      this.triggerAlert(`${hitResult.shout} জরিমানা ৳${dmgItem.unitCost.toLocaleString('bn-BD')}`);
      this.deductMoney(dmgItem.unitCost);
      this.addFloatingCost(`-৳${dmgItem.unitCost.toLocaleString('bn-BD')}`, hitResult.shout);
      this.addCartoonImpactText('ঠাস!');
    }

    // Breakable roadside shops collision
    for (const shop of this.city.shops) {
      if (shop.isBroken) continue;
      const dx = this.posX - shop.x;
      const dz = this.posZ - shop.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < 5.2) {
        if (Math.abs(this.speed) > 1.8) {
          this.breakShop(shop);
        } else {
          this.speed = -this.speed * 0.4;
          soundEffects.playCrash(0.4);
        }
      }
    }
  }

  // --- COMPREHENSIVE BREAKABLE SHOPS WITH AUTHENTIC BANGLADESHI FRAGMENTS ---
  private breakShop(shop: BreakableShop) {
    shop.isBroken = true;
    soundEffects.playCrash(1.6);
    this.cameraShake = 0.85;

    // Record in National Loss Ledger & Public Anger
    const dmg = this.lossLedger.recordDamage(shop.type, this.playerState.currentRoadName);
    this.angerSystem.addAnger(35, 'দোকান ধ্বংসযজ্ঞ!');

    this.deductMoney(dmg.unitCost);
    this.triggerAlert(`${shop.reaction} জরিমানা: ৳${dmg.unitCost.toLocaleString('bn-BD')}`);
    this.addFloatingCost(`-৳${dmg.unitCost.toLocaleString('bn-BD')}`, shop.reaction);
    this.addCartoonImpactText('ধুপধাপ!');

    if (shop.meshGroup) {
      shop.meshGroup.visible = false;
    }

    // Spawn authentic debris pieces according to all shop categories
    if (shop.type === 'tea_egg_stall') {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.08, 0.08, 1.8), new THREE.MeshStandardMaterial({ color: 0xc4a482 }), 4); // Bamboo
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(1.2, 0.04, 1.0), new THREE.MeshStandardMaterial({ color: 0x0077b6 }), 3); // Blue tarp
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.CylinderGeometry(0.18, 0.18, 0.55, 8), new THREE.MeshPhysicalMaterial({ color: 0x00b4d8 }), 1); // Water jar
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0xf8f9fa }), 8); // Eggs flying
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.CylinderGeometry(0.12, 0.16, 0.28, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc }), 1); // Kettle
    } else if (shop.type === 'vegetable_cart') {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0xc89f68 }), 12); // Potatoes
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.CylinderGeometry(0.08, 0.12, 0.32, 8), new THREE.MeshStandardMaterial({ color: 0x3a0ca3 }), 8); // Eggplants
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.DodecahedronGeometry(0.24, 1), new THREE.MeshStandardMaterial({ color: 0x7209b7 }), 4); // Red spinach
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.CylinderGeometry(0.38, 0.38, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0x222222 }), 2); // Wheels
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(1.2, 0.08, 0.4), new THREE.MeshStandardMaterial({ color: 0x582f0e }), 4); // Cart planks
    } else if (shop.type === 'fruit_cart') {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffbe0b }), 10); // Papayas & Melons
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.CylinderGeometry(0.4, 0.4, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0x222222 }), 2); // Wheels
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(1.0, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x007f5f }), 4); // Wood slats
    } else if (shop.type === 'hawker_market') {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.ConeGeometry(1.6, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0x0077b6, side: THREE.DoubleSide }), 2); // Umbrellas
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.24, 0.12, 0.14), new THREE.MeshStandardMaterial({ color: 0x222222 }), 10); // Shoes
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.6, 0.2, 0.4), new THREE.MeshStandardMaterial({ color: 0x1d3557 }), 6); // Denim jeans
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(1.2, 0.08, 0.4), new THREE.MeshStandardMaterial({ color: 0x8d6e63 }), 5); // Table planks
    } else if (shop.type === 'pitha_stall') {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.CylinderGeometry(0.2, 0.25, 0.15, 8), new THREE.MeshStandardMaterial({ color: 0xa0522d }), 5); // Clay stove chunks
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshStandardMaterial({ color: 0xf5f3f4 }), 3); // Steaming cloth/pots
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(1.0, 0.08, 0.4), new THREE.MeshStandardMaterial({ color: 0x7f4f24 }), 4); // Bench planks
    } else if (shop.type === 'jhalmuri_cart') {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.4, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0xd90429 }), 4); // Tin box
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.CylinderGeometry(0.1, 0.1, 0.25, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), 3); // Jars
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.SphereGeometry(0.08, 4, 4), new THREE.MeshStandardMaterial({ color: 0xffea00 }), 14); // Puffed rice & peanuts
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.CylinderGeometry(0.35, 0.35, 0.06, 8), new THREE.MeshStandardMaterial({ color: 0x222222 }), 2); // Wheels
    } else if (shop.type === 'paan_bidi_stall') {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.2, 0.02, 0.15), new THREE.MeshStandardMaterial({ color: 0x2d6a4f }), 10); // Betel leaves
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.25, 0.15, 0.15), new THREE.MeshStandardMaterial({ color: 0xd4af37 }), 2); // Spice boxes
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(1.0, 0.08, 0.4), new THREE.MeshStandardMaterial({ color: 0x582f0e }), 4); // Wood
    } else if (shop.type === 'balloon_vendor') {
      const bColors = [0xff0054, 0x00f5d4, 0xfee440, 0x7209b7, 0xfb5607, 0x3a86ff];
      bColors.forEach(col => {
        this.spawnFloatingBalloonPiece(shop.x, shop.z, col);
      });
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.CylinderGeometry(0.02, 0.02, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0xc4a482 }), 2);
    } else if (shop.type === 'book_stall') {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.35, 0.08, 0.28), new THREE.MeshStandardMaterial({ color: 0xd90429 }), 6);
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.35, 0.08, 0.28), new THREE.MeshStandardMaterial({ color: 0x1d3557 }), 6);
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(1.2, 0.08, 0.4), new THREE.MeshStandardMaterial({ color: 0x8d6e63 }), 4);
    } else if (shop.type === 'mobile_accessories') {
      const cColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b];
      cColors.forEach(col => {
        this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.16, 0.28, 0.03), new THREE.MeshStandardMaterial({ color: col }), 3);
      });
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(1.0, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }), 4);
    } else if (shop.type === 'flower_seller') {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.SphereGeometry(0.15, 6, 6), new THREE.MeshStandardMaterial({ color: 0xfb8500 }), 12);
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.SphereGeometry(0.15, 6, 6), new THREE.MeshStandardMaterial({ color: 0xffffff }), 8);
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.4, 0.05, 0.4), new THREE.MeshStandardMaterial({ color: 0xd4a373 }), 4);
    } else {
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.8, 0.06, 0.8), new THREE.MeshStandardMaterial({ color: 0xb0bec5 }), 6);
      this.spawnDebrisPiece(shop.x, shop.z, new THREE.BoxGeometry(0.15, 0.15, 1.2), new THREE.MeshStandardMaterial({ color: 0x6f4e37 }), 6);
    }
  }

  private spawnDebrisPiece(x: number, z: number, geo: THREE.BufferGeometry, mat: THREE.Material, count: number) {
    for (let i = 0; i < count; i++) {
      const piece = new THREE.Mesh(geo, mat);
      piece.position.set(
        x + (Math.random() - 0.5) * 1.5,
        1.0 + Math.random() * 0.8,
        z + (Math.random() - 0.5) * 1.5
      );
      this.scene.add(piece);

      const angle = Math.random() * Math.PI * 2;
      const force = 6 + Math.random() * 9;

      this.debrisList.push({
        mesh: piece,
        velocity: {
          x: Math.cos(angle) * force + (this.speed * 0.3 * Math.sin(this.headingAngle)),
          y: 4 + Math.random() * 6,
          z: Math.sin(angle) * force + (this.speed * 0.3 * Math.cos(this.headingAngle)),
        },
        rotVelocity: {
          x: (Math.random() - 0.5) * 14,
          y: (Math.random() - 0.5) * 14,
          z: (Math.random() - 0.5) * 14,
        },
        life: 0,
        maxLife: 4.5,
      });
    }
  }

  private updateDebris(dt: number) {
    for (let i = this.debrisList.length - 1; i >= 0; i--) {
      const d = this.debrisList[i];
      d.life += dt;

      const isFloatingBalloon = d.maxLife > 5.5;
      if (isFloatingBalloon) {
        d.velocity.y += 0.8 * dt; // Upward buoyant drift for helium balloons
      } else {
        d.velocity.y -= 18 * dt;
      }
      d.mesh.position.x += d.velocity.x * dt;
      d.mesh.position.y += d.velocity.y * dt;
      d.mesh.position.z += d.velocity.z * dt;

      d.mesh.rotation.x += d.rotVelocity.x * dt;
      d.mesh.rotation.y += d.rotVelocity.y * dt;
      d.mesh.rotation.z += d.rotVelocity.z * dt;

      if (!isFloatingBalloon && d.mesh.position.y < 0.1) {
        d.mesh.position.y = 0.1;
        d.velocity.y = -d.velocity.y * 0.35;
        d.velocity.x *= 0.7;
        d.velocity.z *= 0.7;
      }

      if (d.life >= d.maxLife) {
        this.scene.remove(d.mesh);
        this.debrisList.splice(i, 1);
      }
    }
  }

  public addFloatingCost(text: string, reaction?: string) {
    this.playerState.floatingCostTexts.push({
      id: `cost_${Date.now()}_${Math.random()}`,
      text,
      reaction,
      screenX: (window.innerWidth || 800) * 0.5 + (Math.random() - 0.5) * 160,
      screenY: (window.innerHeight || 600) * 0.42 + (Math.random() - 0.5) * 80,
      opacity: 1.0,
      life: 0,
    });
    if (this.playerState.floatingCostTexts.length > 5) {
      this.playerState.floatingCostTexts.shift();
    }
  }

  public addCartoonImpactText(text: string) {
    this.mobImpactTexts.push({
      id: `impact_${Date.now()}_${Math.random()}`,
      text,
      x: (Math.random() - 0.5) * 180,
      y: (Math.random() - 0.5) * 120,
      scale: 1.0,
      rot: (Math.random() - 0.5) * 30,
    });
    if (this.mobImpactTexts.length > 5) {
      this.mobImpactTexts.shift();
    }
  }

  private updateFloatingCosts(dt: number) {
    for (let i = this.playerState.floatingCostTexts.length - 1; i >= 0; i--) {
      const f = this.playerState.floatingCostTexts[i];
      f.life += dt;
      f.screenY -= 36 * dt; // Float smoothly upwards
      f.opacity = Math.max(0, 1.0 - (f.life / 2.6));
      if (f.life >= 2.6) {
        this.playerState.floatingCostTexts.splice(i, 1);
      }
    }
  }

  private spawnFloatingBalloonPiece(x: number, z: number, color: number) {
    const geo = new THREE.SphereGeometry(0.2, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.2 });
    const balloon = new THREE.Mesh(geo, mat);
    balloon.position.set(x + (Math.random() - 0.5) * 1.5, 1.5 + Math.random() * 0.5, z + (Math.random() - 0.5) * 1.5);
    this.scene.add(balloon);

    this.debrisList.push({
      mesh: balloon,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: 4.5 + Math.random() * 3.5,
        z: (Math.random() - 0.5) * 2,
      },
      rotVelocity: {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
      },
      life: 0,
      maxLife: 6.0,
    });
  }

  private updateMissions(dt: number) {
    const mission = this.playerState.currentMission;
    if (!mission) return;

    if (this.passengerBeacon && this.passengerBeacon.visible) {
      this.passengerBeacon.rotation.y += 1.5 * dt;
    }
    if (this.destinationBeacon && this.destinationBeacon.visible) {
      this.destinationBeacon.rotation.y += 1.5 * dt;
    }

    if (mission.status === 'available') {
      const dx = this.posX - mission.pickupLocation.x;
      const dz = this.posZ - mission.pickupLocation.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 4.0 && Math.abs(this.speed) < 2.2) {
        mission.status = 'in_progress';
        soundEffects.playCoin();
        this.triggerAlert(`যাত্রী উঠেছে! গন্তব্য: ${mission.dropoffLocation.name}`);

        if (this.passengerBeacon) this.passengerBeacon.visible = false;
        if (this.passengerFigure) this.passengerFigure.visible = false;
        if (this.destinationBeacon) this.destinationBeacon.visible = true;
      }
    } else if (mission.status === 'in_progress') {
      const dx = this.posX - mission.dropoffLocation.x;
      const dz = this.posZ - mission.dropoffLocation.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 4.5 && Math.abs(this.speed) < 2.2) {
        mission.status = 'completed';
        this.playerState.money += mission.fare;
        this.playerState.completedMissionsCount++;
        soundEffects.playCoin();
        this.triggerAlert(`যাত্রী নামিয়েছেন! ভাড়া পেলেন: ৳${mission.fare.toLocaleString()}`);

        if (this.destinationBeacon) this.destinationBeacon.visible = false;

        setTimeout(() => {
          if (!this.isDestroyed) {
            this.spawnNewMission();
          }
        }, 2000);
      }
    }
  }

  private updateRefuel(dt: number) {
    const stX = this.city.cngStationPosition.x;
    const stZ = this.city.cngStationPosition.z;
    const dx = this.posX - stX;
    const dz = this.posZ - stZ;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 5.5 && Math.abs(this.speed) < 1.5) {
      if (this.playerState.fuel < this.playerState.maxFuel && this.playerState.money >= 10) {
        this.playerState.fuel = Math.min(this.playerState.maxFuel, this.playerState.fuel + dt * 25);
        this.playerState.money = Math.max(0, this.playerState.money - dt * 15);
        soundEffects.playRefuel();
        this.triggerAlert('সিএনজি গ্যাস রিফুয়েল হচ্ছে... (মেঘনা ফিলিং স্টেশন)');
      }
    }
  }

  private deductMoney(amount: number) {
    this.playerState.money -= amount;
    this.playerState.damageIncurred += amount;

    if (this.playerState.money < 0) {
      this.triggerGameOver('গেম ওভার — আপনি ফতুর হয়ে গেছেন! জরিমানা দিয়ে সর্বস্বান্ত!');
    }
  }

  public settleWithCrowd(): boolean {
    const res = this.angerSystem.paySettlement(this.playerState.money);
    if (res.success) {
      this.playerState.money -= res.cost;
      this.triggerAlert(res.message);
      return true;
    } else {
      this.triggerAlert(res.message);
      return false;
    }
  }

  private updateRoadblock() {
    if (this.angerSystem.anger >= 90 && !this.roadblockActive) {
      this.roadblockActive = true;
      this.triggerAlert('🛑 সতর্কবার্তা: ৯০% চরম জনরোষ! সামনে রাস্তা অবরুদ্ধ করা হয়েছে!');
      soundEffects.playCrowdShout();

      // Create visual roadblock barrier ahead of player
      const rb = new THREE.Group();
      const barGeo = new THREE.BoxGeometry(6.5, 0.9, 0.35);
      const drumGeo = new THREE.CylinderGeometry(0.42, 0.42, 1.1, 12);
      const drumMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.5 });
      const barMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.4 });

      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.y = 0.55;
      const d1 = new THREE.Mesh(drumGeo, drumMat);
      d1.position.set(-3.0, 0.55, 0);
      const d2 = new THREE.Mesh(drumGeo, drumMat);
      d2.position.set(3.0, 0.55, 0);
      rb.add(bar, d1, d2);

      // Place 38m ahead in player's forward direction
      const fwdZ = Math.cos(this.headingAngle);
      rb.position.set(this.posX > 0 ? 6.8 : -6.8, 0.16, this.posZ + fwdZ * 38);
      this.scene.add(rb);
      this.roadblockGroup = rb;
    } else if (this.angerSystem.anger < 70 && this.roadblockActive) {
      if (this.roadblockGroup) {
        this.scene.remove(this.roadblockGroup);
        this.roadblockGroup = null;
      }
      this.roadblockActive = false;
    }
  }

  public startMobSmash() {
    if (this.playerState.isMobSmashing || this.playerState.isGameOver) return;
    this.playerState.isMobSmashing = true;
    this.mobSmashTimer = 3.8;
    this.speed = 0;
    this.cameraShake = 1.2;

    soundEffects.playCartoonMobCrunch();
    soundEffects.playCrowdShout();
    this.triggerAlert('জনতার রোষানল! ধূপধাপ আওয়াজে গাড়ি ভাঙচুর হচ্ছে!');

    // Spawn detached rickshaw parts with comic spring bounces
    const partColors = [0x007f5f, 0xffbe0b, 0x111111, 0x222222, 0xcccccc];
    partColors.forEach((color, i) => {
      const geo = i === 0
        ? new THREE.BoxGeometry(1.6, 0.05, 1.4) // Roof canopy
        : i === 1
        ? new THREE.BoxGeometry(0.8, 0.8, 0.04) // Side jali panel
        : i === 2
        ? new THREE.CylinderGeometry(0.3, 0.3, 0.15, 12) // Wheel
        : new THREE.SphereGeometry(0.14, 8, 8); // Headlight

      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
      mesh.position.set(
        this.posX + (Math.random() - 0.5) * 1.5,
        1.2 + Math.random() * 0.8,
        this.posZ + (Math.random() - 0.5) * 1.5
      );
      this.scene.add(mesh);
      this.detachedParts.push(mesh);

      this.debrisList.push({
        mesh,
        velocity: {
          x: (Math.random() - 0.5) * 8,
          y: 4 + Math.random() * 4,
          z: (Math.random() - 0.5) * 8,
        },
        rotVelocity: {
          x: (Math.random() - 0.5) * 12,
          y: (Math.random() - 0.5) * 12,
          z: (Math.random() - 0.5) * 12,
        },
        life: 0,
        maxLife: 6,
      });
    });

    // Spawn running cartoon driver scurrying away unharmed to footpath
    const driverGroup = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c });
    const lungiMat = new THREE.MeshStandardMaterial({ color: 0x2b9348 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xffeedd });

    const dTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.7, 8), shirtMat);
    dTorso.position.y = 0.8;
    const dLungi = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.6, 8), lungiMat);
    dLungi.position.y = 0.35;
    const dHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
    dHead.position.y = 1.35;
    driverGroup.add(dTorso, dLungi, dHead);

    driverGroup.position.set(this.posX, 0.16, this.posZ);
    this.scene.add(driverGroup);
    this.driverEscapeMesh = driverGroup;
  }

  private updateMobSmash(dt: number) {
    this.mobSmashTimer -= dt;
    this.speed = 0;
    this.cameraShake = Math.max(0.4, this.cameraShake);

    // Comic wobble on player rickshaw
    this.playerGroup.rotation.z = Math.sin(this.mobSmashTimer * 22) * 0.18;
    this.playerGroup.rotation.x = Math.cos(this.mobSmashTimer * 18) * 0.12;

    // Driver figure scurrying away toward footpath
    if (this.driverEscapeMesh) {
      const escapeTargetX = this.posX > 0 ? 17.5 : -17.5;
      this.driverEscapeMesh.position.x += Math.sign(escapeTargetX - this.driverEscapeMesh.position.x) * 4.2 * dt;
      this.driverEscapeMesh.position.z += 3.5 * dt;
      this.driverEscapeMesh.position.y = 0.16 + Math.abs(Math.sin(this.mobSmashTimer * 16)) * 0.25; // Scurrying bob
      this.driverEscapeMesh.rotation.y = this.posX > 0 ? Math.PI / 4 : -Math.PI / 4;
    }

    // Spawn comic impact text pops ("ধুপধাপ!", "ঠাস!", "ধ্যাড়ং!", "ফটাস!") with procedural audio
    this.impactSpawnCooldown -= dt;
    if (this.impactSpawnCooldown <= 0) {
      this.impactSpawnCooldown = 0.45;
      soundEffects.playMobThump();
      if (Math.random() > 0.4) soundEffects.playMetalClang();

      const comics = ['ধুপধাপ!', 'ঠাস!', 'ধ্যাড়ং!', 'ফটাস!', 'প্যাঁক!'];
      const text = comics[Math.floor(Math.random() * comics.length)];
      this.mobImpactTexts.push({
        id: `impact_${Date.now()}_${Math.random()}`,
        text,
        x: (Math.random() - 0.5) * 180,
        y: (Math.random() - 0.5) * 120,
        scale: 1.0,
        rot: (Math.random() - 0.5) * 30,
      });
      if (this.mobImpactTexts.length > 5) {
        this.mobImpactTexts.shift();
      }
    }

    this.updateDebris(dt);

    if (this.mobSmashTimer <= 0) {
      soundEffects.playFinalThong();
      this.triggerGameOver('জনতার রোষানলে পড়ে সিএনজি চুরমার! চালক চটি ফেলে উধাও!');
    }
  }

  private cleanUpMobSmash() {
    this.mobImpactTexts = [];
    if (this.driverEscapeMesh) {
      this.scene.remove(this.driverEscapeMesh);
      this.driverEscapeMesh = null;
    }
    this.detachedParts.forEach(p => this.scene.remove(p));
    this.detachedParts = [];
    if (this.roadblockGroup) {
      this.scene.remove(this.roadblockGroup);
      this.roadblockGroup = null;
    }
    this.roadblockActive = false;
  }

  public generateLiveNewspaper(): NewspaperData {
    this.renderer.render(this.scene, this.camera);
    let screenshotUrl = '';
    try {
      screenshotUrl = this.renderer.domElement.toDataURL('image/jpeg', 0.85);
    } catch {
      // fallback
    }
    return NewspaperGenerator.createNewspaperData(
      screenshotUrl,
      this.lossLedger,
      this.playerState.money,
      this.playerState.currentRoadName,
      'লাইভ বিশেষ সান্ধ্য সংস্করণ'
    );
  }

  public triggerGameOver(reason: string) {
    if (this.playerState.isGameOver) return;
    this.playerState.isGameOver = true;
    this.playerState.gameOverReason = reason;

    // Render one crisp frame and capture high-res canvas screenshot
    this.renderer.render(this.scene, this.camera);
    let screenshotUrl = '';
    try {
      screenshotUrl = this.renderer.domElement.toDataURL('image/jpeg', 0.85);
    } catch {
      // fallback if canvas tainted
    }

    // Generate full satirical broadsheet Dainik Genjam data
    const newspaperData = NewspaperGenerator.createNewspaperData(
      screenshotUrl,
      this.lossLedger,
      this.playerState.money,
      this.playerState.currentRoadName,
      reason
    );

    this.playerState.newspaperData = newspaperData;

    if (this.onStateChange) {
      this.onStateChange({ ...this.playerState }, this.alertMessage);
    }
  }

  public restartGame() {
    this.cleanUpMobSmash();
    this.playerState.money = 2500;
    this.playerState.fuel = 100;
    this.playerState.isGameOver = false;
    this.playerState.gameOverReason = '';
    this.playerState.isMobSmashing = false;
    this.playerState.newspaperData = null;

    this.lossLedger.reset();
    this.angerSystem.anger = 0;
    this.angerSystem.speechBubble = null;

    this.posX = 6.8;
    this.posZ = 240;
    this.speed = 0;
    this.headingAngle = Math.PI;
    this.playerGroup.position.set(this.posX, 0, this.posZ);
    this.playerGroup.rotation.y = this.headingAngle;
    this.setPlayerVehicle(this.playerVehicleType);
    this.spawnNewMission();
  }

  public triggerAlert(msg: string) {
    this.alertMessage = msg;
    this.alertTimer = 3.5;
  }

  private updateCamera(dt: number) {
    if (this.cameraDirector) {
      this.cameraDirector.update(
        dt,
        this.posX,
        this.posZ,
        this.headingAngle,
        this.playerState.speedKmh,
        this.rollAngle
      );
    }
  }


  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.reqId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
