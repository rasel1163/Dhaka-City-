/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WeatherType } from '../types';

export class WeatherSkySystem {
  public currentWeather: WeatherType = 'noon';
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  // Sky Mesh & Texture
  private skyMesh!: THREE.Mesh;
  private skyCanvas!: HTMLCanvasElement;
  private skyTexture!: THREE.CanvasTexture;

  // Lights
  public sunLight!: THREE.DirectionalLight;
  public hemiLight!: THREE.HemisphereLight;
  public ambientLight!: THREE.AmbientLight;

  // Street Lights Collection (Sodium glow)
  public streetLights: THREE.PointLight[] = [];
  public streetLampMaterials: THREE.MeshStandardMaterial[] = [];

  // Weather Particles
  private rainParticles: THREE.Points | null = null;
  private rainPositions!: Float32Array;
  private rainVelocities!: Float32Array;
  private dustParticles: THREE.Points | null = null;
  private dustPositions!: Float32Array;
  private smokeParticles: THREE.Points | null = null;

  // Wet road reflection modifier
  public isRaining: boolean = false;
  public roadWetness: number = 0;

  // Road materials for wet monsoon reflection
  public roadMaterials: THREE.MeshStandardMaterial[] = [];
  public nightWindowMaterials: THREE.MeshStandardMaterial[] = [];
  public mosqueMaterials: THREE.MeshStandardMaterial[] = [];
  public neonMaterials: THREE.MeshStandardMaterial[] = [];

  // Windblown litter / polythene bags
  private litterMeshes: THREE.Mesh[] = [];
  public heatShimmerActive: boolean = false;


  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.initSky();
    this.initLighting();
    this.initWeatherParticles();
    this.initWindblownLitter();
    this.setWeather('morning'); // Default: Crisp Dhaka Morning
  }


  private initSky() {
    this.skyCanvas = document.createElement('canvas');
    this.skyCanvas.width = 1024;
    this.skyCanvas.height = 512;
    this.skyTexture = new THREE.CanvasTexture(this.skyCanvas);
    this.skyTexture.colorSpace = THREE.SRGBColorSpace;
    this.skyTexture.mapping = THREE.EquirectangularReflectionMapping;

    const skyGeo = new THREE.SphereGeometry(750, 32, 24);
    // Invert geometry to view inside
    skyGeo.scale(-1, 1, 1);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.skyTexture,
      fog: false,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.skyMesh.renderOrder = -100;
    this.scene.add(this.skyMesh);
  }

  private initLighting() {
    // Key Directional Sun/Moon light with soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfff7e6, 2.0);
    this.sunLight.position.set(45, 90, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 300;
    const d = 80;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Fill Hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0xbfdbfe, 0xa16207, 0.7);
    this.scene.add(this.hemiLight);

    // Subtle base ambient
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambientLight);
  }

  private initWeatherParticles() {
    // 1. Heavy Monsoon Rain Particle System
    const rainCount = 2800;
    const rainGeo = new THREE.BufferGeometry();
    this.rainPositions = new Float32Array(rainCount * 3);
    this.rainVelocities = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 120;
      this.rainPositions[i * 3 + 1] = Math.random() * 45;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
      this.rainVelocities[i] = 28 + Math.random() * 14;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

    // Procedural rain drop sprite
    const dropCanvas = document.createElement('canvas');
    dropCanvas.width = 16;
    dropCanvas.height = 64;
    const dropCtx = dropCanvas.getContext('2d')!;
    const dropGrad = dropCtx.createLinearGradient(0, 0, 0, 64);
    dropGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    dropGrad.addColorStop(0.7, 'rgba(200, 225, 255, 0.75)');
    dropGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
    dropCtx.fillStyle = dropGrad;
    dropCtx.fillRect(6, 0, 4, 64);
    const dropTex = new THREE.CanvasTexture(dropCanvas);

    const rainMat = new THREE.PointsMaterial({
      color: 0xcee4f8,
      size: 1.2,
      map: dropTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);

    // 2. City Dust / Drifting Litter Particles (Windblown wrappers, dry dust)
    const dustCount = 200;
    const dustGeo = new THREE.BufferGeometry();
    this.dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      this.dustPositions[i * 3] = (Math.random() - 0.5) * 80;
      this.dustPositions[i * 3 + 1] = 0.2 + Math.random() * 6;
      this.dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: 0xd4b996,
      size: 0.22,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustParticles);

    // 3. Tea Stall Rising Smoke & Food Steam
    const smokeCount = 120;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3] = (Math.random() - 0.5) * 20;
      smokePos[i * 3 + 1] = 1.0 + Math.random() * 4;
      smokePos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.8,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    this.smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    this.scene.add(this.smokeParticles);
  }

  public setWeather(type: WeatherType) {
    this.currentWeather = type;
    const ctx = this.skyCanvas.getContext('2d')!;
    const w = this.skyCanvas.width;
    const h = this.skyCanvas.height;

    // Reset particle visibilities
    this.isRaining = type === 'rain';
    if (this.rainParticles) {
      this.rainParticles.visible = this.isRaining;
    }
    this.roadWetness = this.isRaining ? 1.0 : 0.0;

    let skyTop = '#1e3a8a';
    let skyMid = '#38bdf8';
    let skyBottom = '#bae6fd';
    let fogColor = 0xcfe2f7;
    let fogDensity = 0.0022;

    let sunColor = 0xfffaed;
    let sunIntensity = 2.0;
    let sunPos = new THREE.Vector3(45, 90, 40);

    let hemiSky = 0xbfdbfe;
    let hemiGround = 0x78716c;
    let hemiIntensity = 0.75;
    let streetLightsOn = false;

    switch (type) {
      case 'morning': // সকাল - Golden sunrise, soft mist
        skyTop = '#1e293b';
        skyMid = '#fb923c';
        skyBottom = '#fed7aa';
        fogColor = 0xfde047;
        fogDensity = 0.0035;
        sunColor = 0xfde047;
        sunIntensity = 1.6;
        sunPos.set(80, 45, 50);
        hemiSky = 0xfef08a;
        hemiGround = 0x57534e;
        hemiIntensity = 0.6;
        streetLightsOn = false;
        break;

      case 'noon': // দুপুর - Crisp bright Dhaka noon, deep blue sky
        skyTop = '#0284c7';
        skyMid = '#38bdf8';
        skyBottom = '#e0f2fe';
        fogColor = 0xdbeafe;
        fogDensity = 0.002;
        sunColor = 0xffffff;
        sunIntensity = 2.2;
        sunPos.set(20, 110, 15);
        hemiSky = 0xe0f2fe;
        hemiGround = 0x71717a;
        hemiIntensity = 0.8;
        streetLightsOn = false;
        break;

      case 'afternoon': // বিকেল - Golden hour, amber glow
        skyTop = '#0369a1';
        skyMid = '#f59e0b';
        skyBottom = '#fef3c7';
        fogColor = 0xfde68a;
        fogDensity = 0.0028;
        sunColor = 0xfbbf24;
        sunIntensity = 1.9;
        sunPos.set(-70, 50, 40);
        hemiSky = 0xfef08a;
        hemiGround = 0x52525b;
        hemiIntensity = 0.7;
        streetLightsOn = false;
        break;

      case 'evening': // সন্ধ্যা - Magenta/violet dusk, sodium lights turn on
        skyTop = '#0f172a';
        skyMid = '#7c2d12';
        skyBottom = '#ea580c';
        fogColor = 0x475569;
        fogDensity = 0.004;
        sunColor = 0xf97316;
        sunIntensity = 0.8;
        sunPos.set(-85, 25, 40);
        hemiSky = 0x94a3b8;
        hemiGround = 0x27272a;
        hemiIntensity = 0.45;
        streetLightsOn = true;
        break;

      case 'night': // রাত - Midnight sky, glowing moon, sodium lamps
        skyTop = '#020617';
        skyMid = '#090d1f';
        skyBottom = '#1e1b4b';
        fogColor = 0x090d1f;
        fogDensity = 0.0038;
        sunColor = 0x93c5fd; // Moon light
        sunIntensity = 0.45;
        sunPos.set(50, 80, -40);
        hemiSky = 0x1e293b;
        hemiGround = 0x09090b;
        hemiIntensity = 0.3;
        streetLightsOn = true;
        break;

      case 'autumn': // শরতের পরিষ্কার আকাশ - Crisp azure with fluffy white clouds
        skyTop = '#0369a1';
        skyMid = '#0ea5e9';
        skyBottom = '#e0f2fe';
        fogColor = 0xe0f2fe;
        fogDensity = 0.0018;
        sunColor = 0xfffbeb;
        sunIntensity = 2.1;
        sunPos.set(40, 100, 30);
        hemiSky = 0xbae6fd;
        hemiGround = 0x71717a;
        hemiIntensity = 0.8;
        streetLightsOn = false;
        break;

      case 'hot_sun': // গরম রোদ - Blinding midday heat
        skyTop = '#38bdf8';
        skyMid = '#7dd3fc';
        skyBottom = '#fef08a';
        fogColor = 0xfef08a;
        fogDensity = 0.003;
        sunColor = 0xffffff;
        sunIntensity = 2.5;
        sunPos.set(10, 120, 10);
        hemiSky = 0xfef9c3;
        hemiGround = 0x854d0e;
        hemiIntensity = 0.9;
        streetLightsOn = false;
        break;

      case 'rain': // বর্ষার ভারী বৃষ্টি - Dark overcast monsoon storm
        skyTop = '#1e293b';
        skyMid = '#334155';
        skyBottom = '#475569';
        fogColor = 0x475569;
        fogDensity = 0.006;
        sunColor = 0x94a3b8;
        sunIntensity = 0.9;
        sunPos.set(20, 90, 20);
        hemiSky = 0x64748b;
        hemiGround = 0x334155;
        hemiIntensity = 0.55;
        streetLightsOn = true;
        break;

      case 'winter_fog': // শীতের কুয়াশা - Dense Dhaka winter fog
        skyTop = '#64748b';
        skyMid = '#cbd5e1';
        skyBottom = '#f1f5f9';
        fogColor = 0xe2e8f0;
        fogDensity = 0.012; // Dense atmospheric mist
        sunColor = 0xfef3c7;
        sunIntensity = 1.1;
        sunPos.set(50, 60, 30);
        hemiSky = 0xe2e8f0;
        hemiGround = 0x64748b;
        hemiIntensity = 0.7;
        streetLightsOn = true;
        break;
    }

    // Paint Procedural Sky Canvas
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(0.55, skyMid);
    grad.addColorStop(0.92, skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Add Clouds or Stars/Moon depending on preset
    if (type === 'night') {
      // Stars
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 300; s++) {
        const sx = Math.random() * w;
        const sy = Math.random() * (h * 0.6);
        const sr = 0.6 + Math.random() * 1.4;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      // Glowing Crescent Moon
      ctx.save();
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(w * 0.72, h * 0.28, 26, 0, Math.PI * 2);
      ctx.fill();
      // Moon inner cutout
      ctx.fillStyle = skyTop;
      ctx.beginPath();
      ctx.arc(w * 0.72 - 10, h * 0.28 - 6, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (type === 'autumn' || type === 'noon' || type === 'morning') {
      // Soft procedural cumulus clouds
      ctx.fillStyle = type === 'morning' ? 'rgba(254, 215, 170, 0.45)' : 'rgba(255, 255, 255, 0.4)';
      const cloudClusters = [
        { cx: w * 0.2, cy: h * 0.35, r: 42 },
        { cx: w * 0.48, cy: h * 0.42, r: 56 },
        { cx: w * 0.78, cy: h * 0.32, r: 48 },
        { cx: w * 0.92, cy: h * 0.45, r: 38 },
      ];
      cloudClusters.forEach((cl) => {
        for (let puff = 0; puff < 5; puff++) {
          ctx.beginPath();
          ctx.arc(cl.cx + (puff - 2) * 22, cl.cy + Math.sin(puff) * 8, cl.r * (0.8 + Math.random() * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    this.skyTexture.needsUpdate = true;

    // Apply Lights & Fog
    this.sunLight.color.setHex(sunColor);
    this.sunLight.intensity = sunIntensity;
    this.sunLight.position.copy(sunPos);

    this.hemiLight.color.setHex(hemiSky);
    this.hemiLight.groundColor.setHex(hemiGround);
    this.hemiLight.intensity = hemiIntensity;

    this.scene.fog = new THREE.FogExp2(fogColor, fogDensity);

    this.heatShimmerActive = type === 'hot_sun';

    // 1. Toggle Street Sodium Lamps
    this.streetLights.forEach((light) => {
      light.visible = streetLightsOn;
    });
    this.streetLampMaterials.forEach((mat) => {
      mat.emissive.setHex(streetLightsOn ? 0xf59e0b : 0x111111);
      mat.emissiveIntensity = streetLightsOn ? 1.8 : 0.0;
    });

    // 2. Wet Road Surface Reflections (Monsoon Rain)
    const isWet = type === 'rain';
    this.roadMaterials.forEach((mat) => {
      mat.roughness = isWet ? 0.22 : 0.85;
      mat.metalness = isWet ? 0.35 : 0.08;
    });

    // 3. Lit Apartment Windows at Dusk/Night
    const isDark = type === 'night' || type === 'evening' || type === 'rain' || type === 'winter_fog';
    this.nightWindowMaterials.forEach((mat) => {
      mat.emissive.setHex(isDark ? 0xfff3b0 : 0x0a0a0a);
      mat.emissiveIntensity = isDark ? 1.2 : 0.05;
    });

    // 4. Mosque Green Arch & Dome Illumination
    this.mosqueMaterials.forEach((mat) => {
      mat.emissive.setHex(isDark ? 0x10b981 : 0x052e16);
      mat.emissiveIntensity = isDark ? 0.9 : 0.1;
    });

    // 5. Shop Neon & Tube Lights
    this.neonMaterials.forEach((mat) => {
      mat.emissiveIntensity = isDark ? 1.4 : 0.4;
    });
  }

  private initWindblownLitter() {
    const litterColors = [0x38bdf8, 0xef4444, 0xfacc15, 0xffffff, 0x4ade80];
    const litterGeo = new THREE.PlaneGeometry(0.35, 0.45);

    for (let i = 0; i < 20; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: litterColors[i % litterColors.length],
        side: THREE.DoubleSide,
        roughness: 0.7,
      });
      const mesh = new THREE.Mesh(litterGeo, mat);
      mesh.position.set((Math.random() - 0.5) * 26, 0.08 + Math.random() * 0.4, 200 + (Math.random() - 0.5) * 400);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.litterMeshes.push(mesh);
      this.scene.add(mesh);
    }
  }

  public update(delta: number, playerX: number, playerZ: number) {
    // Keep Sky Dome centered on player
    this.skyMesh.position.set(playerX, 0, playerZ);
    this.sunLight.position.set(playerX + 45, 90, playerZ + 40);
    this.sunLight.target.position.set(playerX, 0, playerZ);

    // Update Rain Particles
    if (this.isRaining && this.rainParticles) {
      this.rainParticles.position.set(playerX, 0, playerZ);
      const pos = this.rainPositions;
      const count = pos.length / 3;

      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= this.rainVelocities[i] * delta;
        // Reset to top when hitting the road
        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 45;
          pos[i * 3] = (Math.random() - 0.5) * 120;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
        }
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Drift dust particles softly
    if (this.dustParticles) {
      this.dustParticles.position.set(playerX, 0, playerZ);
      const dpos = this.dustPositions;
      const dcount = dpos.length / 3;
      for (let j = 0; j < dcount; j++) {
        dpos[j * 3] += Math.sin(delta * 2 + j) * 0.02;
        dpos[j * 3 + 2] += delta * 0.5;
        if (dpos[j * 3 + 2] > 40) {
          dpos[j * 3 + 2] = -40;
        }
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Windblown polythene bags / wrappers tumbling along Begum Rokeya Ave
    this.litterMeshes.forEach((mesh, idx) => {
      mesh.position.z += Math.cos(delta * 3 + idx) * 0.8 * delta;
      mesh.position.x += Math.sin(delta * 2 + idx) * 0.4 * delta;
      mesh.position.y = 0.08 + Math.abs(Math.sin(Date.now() * 0.003 + idx)) * 0.25;
      mesh.rotation.x += delta * 1.5;
      mesh.rotation.y += delta * 2.0;
    });
  }

  public registerRoadMaterial(mat: THREE.MeshStandardMaterial) {
    this.roadMaterials.push(mat);
    const isWet = this.currentWeather === 'rain';
    mat.roughness = isWet ? 0.22 : 0.85;
    mat.metalness = isWet ? 0.35 : 0.08;
  }

  public registerNightWindowMaterial(mat: THREE.MeshStandardMaterial) {
    this.nightWindowMaterials.push(mat);
    const isDark = this.currentWeather === 'night' || this.currentWeather === 'evening' || this.currentWeather === 'rain' || this.currentWeather === 'winter_fog';
    mat.emissive.setHex(isDark ? 0xfff3b0 : 0x0a0a0a);
    mat.emissiveIntensity = isDark ? 1.2 : 0.05;
  }

  public registerMosqueMaterial(mat: THREE.MeshStandardMaterial) {
    this.mosqueMaterials.push(mat);
    const isDark = this.currentWeather === 'night' || this.currentWeather === 'evening' || this.currentWeather === 'rain' || this.currentWeather === 'winter_fog';
    mat.emissive.setHex(isDark ? 0x10b981 : 0x052e16);
    mat.emissiveIntensity = isDark ? 0.9 : 0.1;
  }

  public registerNeonMaterial(mat: THREE.MeshStandardMaterial) {
    this.neonMaterials.push(mat);
    const isDark = this.currentWeather === 'night' || this.currentWeather === 'evening' || this.currentWeather === 'rain' || this.currentWeather === 'winter_fog';
    mat.emissiveIntensity = isDark ? 1.4 : 0.4;
  }

  public registerStreetLamp(light: THREE.PointLight, lampMat: THREE.MeshStandardMaterial) {
    this.streetLights.push(light);
    this.streetLampMaterials.push(lampMat);
    const isOn = this.currentWeather === 'night' || this.currentWeather === 'evening' || this.currentWeather === 'rain' || this.currentWeather === 'winter_fog';
    light.visible = isOn;
    lampMat.emissive.setHex(isOn ? 0xf59e0b : 0x111111);
    lampMat.emissiveIntensity = isOn ? 1.8 : 0;
  }
}

