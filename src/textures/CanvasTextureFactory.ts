/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class CanvasTextureFactory {
  private static cache = new Map<string, THREE.CanvasTexture>();

  private static createCached(key: string, draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void, width = 512, height = 512): THREE.CanvasTexture {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      draw(ctx, canvas);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  // --- 1. Begum Rokeya Ave Road Surface ---
  public static getRoadTexture(): THREE.CanvasTexture {
    return this.createCached('road_begum_rokeya', (ctx, canvas) => {
      ctx.fillStyle = '#48494b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const shade = Math.floor(60 + Math.random() * 45);
        ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      ctx.strokeStyle = '#2d2e30';
      ctx.lineWidth = 2;
      for (let j = 0; j < 6; j++) {
        ctx.beginPath();
        let px = Math.random() * canvas.width;
        let py = Math.random() * canvas.height;
        ctx.moveTo(px, py);
        for (let s = 0; s < 5; s++) {
          px += (Math.random() - 0.5) * 80;
          py += (Math.random() - 0.5) * 80;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Worn white dashed lane divider lines
      ctx.fillStyle = '#dfdfdb';
      ctx.fillRect(160, 40, 10, 160);
      ctx.fillRect(160, 320, 10, 160);
      ctx.fillRect(340, 40, 10, 160);
      ctx.fillRect(340, 320, 10, 160);

      // Large white street stencil: "Begum Rokeya Ave"
      ctx.save();
      ctx.translate(256, 256);
      ctx.rotate(-Math.PI / 2);
      ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(235, 235, 230, 0.78)';
      ctx.fillText('Begum Rokeya Ave', 0, 0);
      ctx.restore();
    }, 512, 512);
  }

  // --- 2. Shahbagh Road Surface (Matching Street View Screenshot) ---
  public static getShahbaghRoadTexture(): THREE.CanvasTexture {
    return this.createCached('road_shahbagh', (ctx, canvas) => {
      // Warm dusty grey asphalt
      ctx.fillStyle = '#444547';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fine grit & aggregate
      for (let i = 0; i < 22000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const shade = Math.floor(65 + Math.random() * 40);
        ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      // Subtle oil drip line along traffic track
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, 'rgba(30, 32, 34, 0.25)');
      grad.addColorStop(0.5, 'rgba(20, 22, 24, 0.4)');
      grad.addColorStop(1, 'rgba(30, 32, 34, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(180, 0, 140, canvas.height);

      // Worn center lane marking
      ctx.fillStyle = '#dcdcd8';
      ctx.fillRect(252, 30, 8, 180);
      ctx.fillRect(252, 300, 8, 180);

      // Large white street stencil: "Shahbagh Rd" (Exact Street View match)
      ctx.save();
      ctx.translate(256, 256);
      ctx.rotate(-Math.PI / 2);
      ctx.font = 'bold 44px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(240, 240, 235, 0.85)';
      ctx.fillText('Shahbagh Rd', 0, 0);
      ctx.restore();
    }, 512, 512);
  }

  // --- 3. Footpath Type 1: Circular Swirl / Floral Paving Pattern (Ref Image 1) ---
  public static getFootpathType1Texture(): THREE.CanvasTexture {
    return this.createCached('footpath_swirl_tiles', (ctx, canvas) => {
      // Warm brownish-orange clay paver base
      ctx.fillStyle = '#b77b58';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tile grid
      const tileSize = 64;
      ctx.strokeStyle = '#8a5538';
      ctx.lineWidth = 3;

      for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
          ctx.strokeRect(x, y, tileSize, tileSize);

          // Embossed circular swirl rings inside each tile
          const cx = x + tileSize / 2;
          const cy = y + tileSize / 2;

          ctx.strokeStyle = '#9c6444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 22, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#cb8f6a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#8a5538';
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Dusty street weathering
      for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      }
    }, 512, 512);
  }

  // --- 4. Footpath Type 2: Herringbone / Red-Brown Brick Pattern (Ref Image 2) ---
  public static getFootpathType2Texture(): THREE.CanvasTexture {
    return this.createCached('footpath_herringbone', (ctx, canvas) => {
      ctx.fillStyle = '#9c5a45';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#6f3827';
      ctx.lineWidth = 2;

      // Clean paver brick pattern
      const bw = 32;
      const bh = 64;
      for (let y = 0; y < canvas.height; y += bh) {
        for (let x = 0; x < canvas.width; x += bw) {
          const shift = (Math.floor(y / bh) % 2) * (bw / 2);
          ctx.strokeRect(x + shift, y, bw, bh);

          // Highlight & shadow for 3D paver depth
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(x + shift + 2, y + 2, bw - 4, 4);
        }
      }
    }, 512, 512);
  }

  // --- 5. Footpath Type 3: Red Brick + Yellow Tactile Strip (Ref Image 3) ---
  public static getFootpathType3Texture(): THREE.CanvasTexture {
    return this.createCached('footpath_tactile', (ctx, canvas) => {
      // Red brick paver
      ctx.fillStyle = '#8f4f3b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#5a2e20';
      ctx.lineWidth = 2;
      for (let y = 0; y < canvas.height; y += 32) {
        for (let x = 0; x < canvas.width; x += 64) {
          const ox = (Math.floor(y / 32) % 2) * 32;
          ctx.strokeRect(x + ox, y, 64, 32);
        }
      }

      // Yellow tactile blister paving strip along inner edge
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(canvas.width - 120, 0, 120, canvas.height);
      ctx.fillStyle = '#d48b00';
      for (let ty = 12; ty < canvas.height; ty += 24) {
        for (let tx = canvas.width - 110; tx < canvas.width; tx += 24) {
          ctx.beginPath();
          ctx.arc(tx, ty, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }, 512, 512);
  }

  // --- 6. Folk-Art Mural Wall (Alpona / Patachitra / Tigers, Ref Image 1) ---
  public static getFolkArtMuralTexture(panelIdx: number): THREE.CanvasTexture {
    return this.createCached(`folk_art_mural_${panelIdx % 3}`, (ctx, canvas) => {
      // White boundary wall base
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top decorative zigzag/triangle border band in red, yellow, blue
      const borderH = 36;
      ctx.fillStyle = '#d90429';
      ctx.fillRect(0, 0, canvas.width, 10);
      for (let x = 0; x < canvas.width; x += 32) {
        // Red, yellow, blue alternating triangles
        ctx.fillStyle = (x / 32) % 3 === 0 ? '#ffb703' : (x / 32) % 3 === 1 ? '#0077b6' : '#d90429';
        ctx.beginPath();
        ctx.moveTo(x, 10);
        ctx.lineTo(x + 16, borderH);
        ctx.lineTo(x + 32, 10);
        ctx.closePath();
        ctx.fill();
      }

      // Recessed rectangular panels with bold yellow & orange backgrounds
      const panels = [
        { bg: '#ffb703', fg: '#d90429', type: 'tiger' },
        { bg: '#fb8500', fg: '#0077b6', type: 'lotus' },
        { bg: '#fcbf49', fg: '#2b9348', type: 'peacock' },
      ];
      const p = panels[panelIdx % panels.length];

      // Red framed panel
      const px = 24, py = 50, pw = canvas.width - 48, ph = canvas.height - 75;
      ctx.fillStyle = '#c1121f';
      ctx.fillRect(px, py, pw, ph);

      ctx.fillStyle = p.bg;
      ctx.fillRect(px + 8, py + 8, pw - 16, ph - 16);

      // Hand-painted Bangladeshi Folk Art figures
      const cx = canvas.width / 2;
      const cy = py + ph / 2;

      if (p.type === 'tiger') {
        // Stylized Royal Bengal Folk Tiger (like in ref photo 1!)
        ctx.strokeStyle = '#d90429';
        ctx.lineWidth = 14;
        ctx.beginPath();
        // Arched spine and head
        ctx.arc(cx, cy + 10, 80, Math.PI * 0.8, Math.PI * 1.9, false);
        ctx.stroke();

        // Tiger stripes in black & red
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 6;
        for (let a = -0.8; a <= 0.8; a += 0.3) {
          ctx.beginPath();
          ctx.moveTo(cx + Math.sin(a) * 60, cy - Math.cos(a) * 45);
          ctx.lineTo(cx + Math.sin(a) * 90, cy - Math.cos(a) * 75);
          ctx.stroke();
        }

        // Curving tail
        ctx.strokeStyle = '#d90429';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx - 90, cy - 20, 45, 0, Math.PI);
        ctx.stroke();

        // Folk flowers & leaves surrounding
        ctx.fillStyle = '#2b9348';
        for (let i = 0; i < 8; i++) {
          const fx = px + 40 + (i * 50);
          ctx.beginPath();
          ctx.ellipse(fx, py + ph - 35, 12, 28, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === 'lotus') {
        // Grand stylized Lotus & Alpona creepers
        ctx.fillStyle = '#d90429';
        for (let l = 0; l < 5; l++) {
          ctx.save();
          ctx.translate(cx, cy + 30);
          ctx.rotate((l - 2) * 0.28);
          ctx.beginPath();
          ctx.ellipse(0, -70, 24, 75, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(cx, cy + 25, 26, 0, Math.PI * 2);
        ctx.fill();

        // Swirling vines
        ctx.strokeStyle = '#0077b6';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx - 70, cy + 60, 40, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 70, cy + 60, 40, Math.PI * 1.5, Math.PI * 3);
        ctx.stroke();
      } else {
        // Traditional Bird / Mayur & River Boat
        ctx.fillStyle = '#023e8a';
        ctx.beginPath();
        // Boat hull
        ctx.ellipse(cx, cy + 60, 110, 30, 0, 0, Math.PI);
        ctx.fill();
        // Stylized folk bird
        ctx.fillStyle = '#d90429';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20, 40, 65, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.arc(cx + 35, cy - 65, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }, 512, 512);
  }

  // --- 7. Flower-Mural Wall (Sky Blue + Giant Colorful Flowers, Ref Image 2) ---
  public static getFlowerMuralTexture(): THREE.CanvasTexture {
    return this.createCached('flower_mural_blue', (ctx, canvas) => {
      // Vibrant sky-blue wall base
      ctx.fillStyle = '#0096c7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lush green stems and broad leaves rising from bottom
      ctx.fillStyle = '#2d6a4f';
      for (let s = 20; s < canvas.width; s += 60) {
        ctx.beginPath();
        ctx.ellipse(s + 20, 380, 22, 110, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Giant colorful flowers (red, pink, orange, yellow, white)
      const flowers = [
        { x: 90, y: 160, col: '#e63946', size: 60 },
        { x: 230, y: 220, col: '#ffb703', size: 55 },
        { x: 340, y: 130, col: '#fb8500', size: 68 },
        { x: 440, y: 240, col: '#f72585', size: 50 },
      ];

      flowers.forEach(f => {
        // Petals
        for (let p = 0; p < 8; p++) {
          const a = (p * Math.PI) / 4;
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(a);
          ctx.fillStyle = f.col;
          ctx.beginPath();
          ctx.ellipse(0, f.size * 0.7, f.size * 0.35, f.size * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        // Center
        ctx.fillStyle = '#fff3b0';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });
    }, 512, 512);
  }

  // --- 8. Building A: Red Brick Infill with White Concrete Grid Frame ---
  public static getRedBrickGridTexture(): THREE.CanvasTexture {
    return this.createCached('red_brick_grid_frame', (ctx, canvas) => {
      // Red clay brick background
      ctx.fillStyle = '#a8422b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Brick mortar lines
      ctx.strokeStyle = '#6e2b1b';
      ctx.lineWidth = 2;
      const bw = 32;
      const bh = 14;
      for (let y = 0; y < canvas.height; y += bh) {
        const ox = (Math.floor(y / bh) % 2) * (bw / 2);
        for (let x = -bw; x < canvas.width + bw; x += bw) {
          ctx.strokeRect(x + ox, y, bw, bh);
        }
      }

      // Strong White Concrete Grid Beams and Columns (Shahbagh Street View Match)
      ctx.fillStyle = '#e9ecef';
      // Vertical concrete columns (every 128px)
      for (let x = 0; x < canvas.width; x += 128) {
        ctx.fillRect(x - 8, 0, 16, canvas.height);
      }
      // Horizontal concrete floor slab beams (every 128px)
      for (let y = 0; y < canvas.height; y += 128) {
        ctx.fillRect(0, y - 8, canvas.width, 16);
      }

      // Recessed dark window panes in bays
      ctx.fillStyle = '#1b263b';
      for (let y = 16; y < canvas.height; y += 128) {
        for (let x = 16; x < canvas.width; x += 128) {
          ctx.fillRect(x + 12, y + 16, 88, 70);
        }
      }
    }, 512, 512);
  }

  // --- 9. Left Side Boundary Wall Slogans & Rising Sun (Building A Street Level) ---
  public static getBoundaryWallSlogansTexture(): THREE.CanvasTexture {
    return this.createCached('wall_slogans_shahbagh', (ctx, canvas) => {
      // Grey plaster wall base
      ctx.fillStyle = '#8d99ae';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Black base stripe along bottom
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

      // Framed slogan panels
      // Panel 1: Rising Sun Illustration with Yellow/Orange rays (Street View Match)
      ctx.fillStyle = '#edf2f4';
      ctx.fillRect(20, 20, 220, 180);
      ctx.strokeStyle = '#2b2d42';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, 220, 180);

      // Rising sun & figure
      ctx.fillStyle = '#ffb703';
      ctx.beginPath();
      ctx.arc(130, 160, 50, Math.PI, 0, false);
      ctx.fill();

      ctx.strokeStyle = '#fb8500';
      ctx.lineWidth = 4;
      for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(130 + Math.cos(a) * 55, 160 + Math.sin(a) * 55);
        ctx.lineTo(130 + Math.cos(a) * 85, 160 + Math.sin(a) * 85);
        ctx.stroke();
      }

      // Motivational Bangla Slogan
      ctx.font = 'bold 20px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#c1121f';
      ctx.textAlign = 'center';
      ctx.fillText('স্বপ্ন দেখো, বড় হও', 130, 55);

      // Panel 2: Blue Text Panel "সত্য বলো, সাহসী হও"
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(260, 20, 230, 180);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(260, 20, 230, 180);

      ctx.font = 'bold 22px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('সত্য বলো, সাহসী হও', 375, 80);
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffea00';
      ctx.fillText('— দেশ ও জাতির অঙ্গীকার', 375, 120);

      // Barbed wire posts along top
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 2;
      for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 20);
        ctx.stroke();
      }
    }, 512, 256);
  }

  // --- 10. Building B: Old Market Complex Facade (Jali Railings & Fashion Shops) ---
  public static getOldMarketComplexTexture(): THREE.CanvasTexture {
    return this.createCached('old_market_complex', (ctx, canvas) => {
      // Weathered cream/beige concrete with rust streaks
      ctx.fillStyle = '#dcd3b8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Weathering & water streaks
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * canvas.width;
        ctx.fillStyle = 'rgba(70, 60, 50, 0.25)';
        ctx.fillRect(x, 0, 6 + Math.random() * 12, canvas.height);
      }

      // Decorative geometric star/diamond lattice jali on balconies
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 80, canvas.width, 50);
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 2;
      for (let x = 0; x < canvas.width; x += 24) {
        ctx.strokeRect(x, 82, 20, 46);
        ctx.beginPath();
        ctx.moveTo(x + 10, 82);
        ctx.lineTo(x + 20, 105);
        ctx.lineTo(x + 10, 128);
        ctx.lineTo(x, 105);
        ctx.closePath();
        ctx.stroke();
      }

      // Ground floor fashion brand boards
      // Long white fascia band
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 160, canvas.width, 90);

      // Red "আজোয়া" style brand sign
      ctx.fillStyle = '#c1121f';
      ctx.fillRect(20, 168, 220, 74);
      ctx.font = 'bold 32px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('আজোয়া ফ্যাশন', 130, 212);

      // "ফ্যাশন প্লাজা" board + "সেল ৫০%" (SALE 50%) red tag
      ctx.fillStyle = '#023e8a';
      ctx.fillRect(260, 168, 230, 74);
      ctx.font = 'bold 26px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ফ্যাশন প্লাজা', 375, 200);

      ctx.fillStyle = '#d90429';
      ctx.fillRect(320, 216, 110, 22);
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffea00';
      ctx.fillText('সেল ৫০% ছাড়', 375, 232);
    }, 512, 256);
  }

  // --- 11. Street Tea / Egg Stall (Ref Image 3, Type A) ---
  public static getTeaEggStallTexture(): THREE.CanvasTexture {
    return this.createCached('tea_egg_stall_sign', (ctx, canvas) => {
      // Red and green painted signboard
      ctx.fillStyle = '#007f5f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#d90429';
      ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);

      ctx.font = 'bold 36px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('বিসমিল্লাহ ডিম ও চায়ের স্টল', canvas.width / 2, 45);

      ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffea00';
      ctx.fillText('গরম দুধ চা • সেদ্ধ ডিম • বিস্কুট • পান', canvas.width / 2, 95);
    }, 512, 128);
  }

  // --- 12. Hawker Market Umbrella Canopy (Ref Image 4, Type B) ---
  public static getHawkerUmbrellaTexture(): THREE.CanvasTexture {
    return this.createCached('hawker_umbrella_stripes', (ctx, canvas) => {
      // 8 colored slices for beach umbrella (green, yellow, blue, red, white)
      const colors = ['#007f5f', '#ffb703', '#0077b6', '#d90429', '#f8f9fa', '#fb8500', '#2ec4b6', '#9b5de5'];
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = canvas.width / 2;

      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, (i * Math.PI) / 4, ((i + 1) * Math.PI) / 4);
        ctx.closePath();
        ctx.fill();
      }

      // Printed brand text: "মুন ফ্যাশন"
      ctx.font = 'bold 28px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('মুন ফ্যাশন', cx, cy - 80);
    }, 512, 512);
  }

  // --- Kerb Texture ---
  public static getKerbTexture(): THREE.CanvasTexture {
    return this.createCached('kerb_stripe', (ctx, canvas) => {
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e8e8e4';
      const stripeW = 64;
      for (let x = 0; x < canvas.width; x += stripeW * 2) {
        ctx.fillRect(x, 0, stripeW, canvas.height);
      }
    }, 512, 128);
  }

  // --- Rounded Stone Kerb (Ref Image 1: curved grey-white connected rounded stones) ---
  public static getRoundedStoneKerbTexture(): THREE.CanvasTexture {
    return this.createCached('rounded_stone_kerb', (ctx, canvas) => {
      ctx.fillStyle = '#c8c8c4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Alternating rounded block joints
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 4;
      for (let x = 0; x < canvas.width; x += 48) {
        ctx.strokeRect(x, 0, 48, canvas.height);
        ctx.fillStyle = (x / 48) % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 2, 2, 44, canvas.height - 4);
      }
    }, 512, 128);
  }

  // --- Metro Viaduct Weathered Concrete ---
  public static getViaductConcrete(): THREE.CanvasTexture {
    return this.createCached('viaduct_concrete', (ctx, canvas) => {
      ctx.fillStyle = '#8e9296';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 15000; i++) {
        const c = 120 + Math.floor(Math.random() * 45);
        ctx.fillStyle = `rgba(${c}, ${c}, ${c}, 0.2)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      }

      for (let i = 0; i < 16; i++) {
        const x = Math.random() * canvas.width;
        const w = 4 + Math.random() * 14;
        const grad = ctx.createLinearGradient(x, 0, x, canvas.height);
        grad.addColorStop(0, 'rgba(50, 52, 55, 0.45)');
        grad.addColorStop(0.7, 'rgba(70, 72, 75, 0.25)');
        grad.addColorStop(1, 'rgba(90, 92, 95, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, w, canvas.height);
      }
    }, 512, 512);
  }

  // --- Metro Pillar with Funny Bengali Posters ---
  public static getPillarPosterTexture(pillarIndex: number): THREE.CanvasTexture {
    return this.createCached(`pillar_poster_${pillarIndex % 4}`, (ctx, canvas) => {
      ctx.fillStyle = '#9b9fa3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const posters = [
        { bg: '#fcf6bd', text: 'গোপন রোগের চিকিৎসা!\nহাকিম সাহেবের ঔষধালয়\n০১৭১২-xxxxxx', color: '#d90429', x: 40, y: 180, w: 200, h: 120 },
        { bg: '#fee440', text: 'এখানে প্রস্রাব করা নিষেধ!\nকরলে গরম পানি ঢালা হইবে!\n— এলাকাবাসী', color: '#000000', x: 230, y: 160, w: 240, h: 130 },
        { bg: '#ffb5a7', text: 'জিনের বাদশা বাবা\nপ্রেমে ব্যর্থ? ব্যবসায়ে লোকসান?\n২৪ ঘণ্টায় সমাধান!', color: '#7b1113', x: 50, y: 310, w: 220, h: 140 },
        { bg: '#cbf3f0', text: 'মোটা হতে চান?\nআমার কাছে আসুন!\nনা হলে টাকা ফেরত!', color: '#023e8a', x: 250, y: 300, w: 220, h: 130 },
      ];

      posters.forEach(p => {
        ctx.fillStyle = p.bg;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#c1121f';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = p.color;
        ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        const lines = p.text.split('\n');
        lines.forEach((l, idx) => {
          ctx.fillText(l, p.x + p.w / 2, p.y + 28 + idx * 26);
        });
      });
    }, 512, 512);
  }

  // --- CNG Rickshaw Textures ---
  public static getCNGHoodBackTexture(): THREE.CanvasTexture {
    return this.createCached('cng_hood_back', (ctx, canvas) => {
      ctx.fillStyle = '#0f3823';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = 190;

      ctx.strokeStyle = '#f5c518';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();

      for (let p = 0; p < 12; p++) {
        const angle = (p * Math.PI) / 6;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.fillStyle = p % 2 === 0 ? '#ff0054' : '#ffb703';
        ctx.beginPath();
        ctx.ellipse(0, 75, 18, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = '#f8f9fa';
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 32px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#007200';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('আল্লাহ', cx, cy);

      ctx.font = 'bold 44px "Noto Sans Bengali", cursive, sans-serif';
      ctx.fillStyle = '#ff8800';
      ctx.fillText('ভাড়ায় চালিত', cx, 345);

      ctx.font = '900 68px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('CNG', cx, 435);

      ctx.fillStyle = '#22577a';
      ctx.fillRect(cx - 110, 475, 220, 32);
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ঢাকা মেট্রো থ-১২-৭৮৯০', cx, 492);
    }, 512, 512);
  }

  public static getDiamondMeshTexture(): THREE.CanvasTexture {
    return this.createCached('cng_jali_mesh', (ctx, canvas) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 3;
      const spacing = 16;
      for (let x = -canvas.height; x < canvas.width + canvas.height; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + canvas.height, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x + canvas.height, 0);
        ctx.stroke();
      }
    }, 128, 128);
  }

  public static getCNGSideStripe(): THREE.CanvasTexture {
    return this.createCached('cng_side_stripe', (ctx, canvas) => {
      ctx.fillStyle = '#0b522c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffbe0b';
      ctx.fillRect(0, 35, canvas.width, 35);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 75, canvas.width, 25);

      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#b7094c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★ মায়ের দোয়া পরিবহন ★', canvas.width / 2, 52);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillText('সিএনজি চালিত অটো রিকশা', canvas.width / 2, 87);
    }, 512, 128);
  }

  public static getShopSignboard(index: number): THREE.CanvasTexture {
    const signs = [
      { name: 'ফরাজী ডেন্টাল অ্যান্ড ম্যাক্সিলোফেসিয়াল', sub: 'ফারাজি হাসপাতাল লিমিটেড', bg: '#007f5f', text: '#ffffff', subColor: '#ffea00' },
      { name: 'পপুলার ডায়াগনস্টিক সেন্টার লি.', sub: 'মিরপুর-১০ শাখা • ২৪ ঘণ্টা সেবা', bg: '#023e8a', text: '#ffffff', subColor: '#90e0ef' },
      { name: 'মেগাসিটি ডেন্টাল কেয়ার', sub: 'দাঁতের সকল রোগের উন্নত চিকিৎসা', bg: '#d90429', text: '#ffffff', subColor: '#ffdd00' },
      { name: 'হেলথ প্লাস ফার্মা ও সার্জিক্যাল', sub: 'ঔষধের বিশ্বস্ত প্রতিষ্ঠান • ফ্লেক্সিলোড', bg: '#2b9348', text: '#ffffff', subColor: '#ffffff' },
      { name: 'ঢাকা সেন্ট্রাল হাসপাতাল লি.', sub: 'জরুরি বিভাগ • এ্যাম্বুলেন্স সার্ভিস', bg: '#005f73', text: '#ffffff', subColor: '#94d2bd' },
      { name: 'হাজী নান্না বিরিয়ানি ও কাচ্চি', sub: 'স্পেশাল মাটন কাচ্চি ও বোরহানি', bg: '#9b2226', text: '#ffffff', subColor: '#ee9b00' },
      { name: 'রহমান স্টোর ও চা দোকান', sub: 'রং চা, দুধ চা, পান-সিগারেট', bg: '#582f0e', text: '#ffffff', subColor: '#ffe6a7' },
      { name: 'নিউ ডায়মন্ড টেইলার্স অ্যান্ড ফেব্রিক্স', sub: 'শার্ট ও প্যান্টের নির্ভরযোগ্য প্রতিষ্ঠান', bg: '#3d348b', text: '#ffffff', subColor: '#e0aaff' },
    ];
    const s = signs[index % signs.length];

    return this.createCached(`shop_sign_${index}`, (ctx, canvas) => {
      ctx.fillStyle = s.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      ctx.font = 'bold 34px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = s.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.name, canvas.width / 2, canvas.height / 2 - 14);

      ctx.font = 'bold 19px "Hind Siliguri", sans-serif';
      ctx.fillStyle = s.subColor;
      ctx.fillText(s.sub, canvas.width / 2, canvas.height / 2 + 24);
    }, 512, 128);
  }

  public static getBRTCBusTexture(): THREE.CanvasTexture {
    return this.createCached('brtc_bus_side', (ctx, canvas) => {
      ctx.fillStyle = '#dc2f02';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#2d6a4f';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.5, canvas.height);
      ctx.lineTo(canvas.width, canvas.height * 0.4);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      ctx.font = '900 74px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BRTC', canvas.width * 0.72, canvas.height * 0.65);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, 20, canvas.width - 80, 48);
      ctx.font = 'bold 26px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#03045e';
      ctx.fillText('মিরপুর-১০ ⇄ ফার্মগেট ⇄ শাহবাগ ⇄ মতিঝিল', canvas.width / 2, 45);
    }, 512, 256);
  }

  public static getCoachSagarTexture(): THREE.CanvasTexture {
    return this.createCached('coach_sagar', (ctx, canvas) => {
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00509d';
      ctx.beginPath();
      ctx.moveTo(120, canvas.height);
      ctx.lineTo(240, canvas.height * 0.3);
      ctx.lineTo(310, canvas.height * 0.55);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 46px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#00296b';
      ctx.textAlign = 'left';
      ctx.fillText('সাগর ট্রাভেলস', 40, canvas.height * 0.75);
    }, 512, 256);
  }

  public static getCoachRoyalTexture(): THREE.CanvasTexture {
    return this.createCached('coach_royal', (ctx, canvas) => {
      ctx.fillStyle = '#dcd3b8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 50px "Hind Siliguri", cursive, sans-serif';
      ctx.fillStyle = '#b7094c';
      ctx.textAlign = 'center';
      ctx.fillText('রয়েল এক্সপ্রেস', canvas.width * 0.55, canvas.height * 0.55);
    }, 512, 256);
  }

  public static getStationNameplate(): THREE.CanvasTexture {
    return this.createCached('metro_station_plate', (ctx, canvas) => {
      ctx.fillStyle = '#006d77';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 52px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('মিরপুর-১০ মেট্রো স্টেশন', canvas.width / 2, canvas.height / 2 - 16);
    }, 512, 160);
  }

  public static getBillboardTexture(idx: number): THREE.CanvasTexture {
    const ads = [
      { brand: 'ওয়ালটন ফ্রিজ', tag: 'দেশসেরা বিদ্যুৎ সাশ্রয়ী স্মার্ট ফ্রিজ', bg: '#0077b6', col: '#ffea00' },
      { brand: 'বসুন্ধরা সিমেন্ট', tag: 'দেশ গড়ার শক্ত ভিত • ভরসার নাম', bg: '#b7094c', col: '#ffffff' },
      { brand: 'প্রাণ জুস ও ড্রিংকস', tag: '১০০% তাজা ফলের আসল স্বাদ', bg: '#2b9348', col: '#ffffff' },
    ];
    const ad = ads[idx % ads.length];
    return this.createCached(`billboard_${idx}`, (ctx, canvas) => {
      ctx.fillStyle = ad.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 48px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(ad.brand, canvas.width / 2, canvas.height / 2 - 18);
      ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
      ctx.fillStyle = ad.col;
      ctx.fillText(ad.tag, canvas.width / 2, canvas.height / 2 + 32);
    }, 512, 256);
  }

  // --- 16. Authentic Electric Pole Posters & Funny Notices (খাম্বায় নোটিশ ও সিনেমার পোস্টার) ---
  public static getElectricPolePostersTexture(variant: number): THREE.CanvasTexture {
    return this.createCached(`pole_posters_var_${variant}`, (ctx, canvas) => {
      // Grey concrete / weathered pole base
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const posters = [
        // Variant 0: Bangladeshi Action Movie Poster
        () => {
          ctx.fillStyle = '#d90429';
          ctx.fillRect(15, 20, 226, 320);
          ctx.fillStyle = '#ffb703';
          ctx.fillRect(25, 30, 206, 65);
          ctx.font = 'bold 32px "Noto Sans Bengali", sans-serif';
          ctx.fillStyle = '#d90429';
          ctx.textAlign = 'center';
          ctx.fillText('তুফান ড্রাইভার', 128, 75);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
          ctx.fillText('ঈদের বিশেষ সিনেমা!', 128, 130);
          ctx.fillStyle = '#ffea00';
          ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
          ctx.fillText('সিনেপ্লেক্স ও দেশজুড়ে মুক্তি', 128, 160);

          // Second poster on pole: Bachelor rent notice
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(15, 355, 226, 140);
          ctx.strokeStyle = '#222222';
          ctx.lineWidth = 2;
          ctx.strokeRect(15, 355, 226, 140);
          ctx.font = 'bold 20px "Noto Sans Bengali", sans-serif';
          ctx.fillStyle = '#111111';
          ctx.fillText('বাসা ভাড়া দেওয়া হইবে', 128, 390);
          ctx.font = '14px "Hind Siliguri", sans-serif';
          ctx.fillStyle = '#c1121f';
          ctx.fillText('ব্যাচেলর নহে! ছোট পরিবার', 128, 420);
          ctx.font = '13px "Hind Siliguri", sans-serif';
          ctx.fillStyle = '#333333';
          ctx.fillText('মোবাইল: ০১৮১১-XXXXXX', 128, 455);
        },
        // Variant 1: Funny Dentist & Lost Slipper Notice
        () => {
          ctx.fillStyle = '#023e8a';
          ctx.fillRect(15, 20, 226, 260);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px "Noto Sans Bengali", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ডাক্তার কালাম (দাঁত)', 128, 65);
          ctx.font = '15px "Hind Siliguri", sans-serif';
          ctx.fillStyle = '#ffea00';
          ctx.fillText('বিনা ব্যথায় দাঁত তোলা হয়', 128, 100);
          ctx.fillStyle = '#ffffff';
          ctx.fillText('মিরপুর-১০ গোলচত্বর', 128, 135);

          // Funny Lost Slipper Notice
          ctx.fillStyle = '#fff3b0';
          ctx.fillRect(15, 300, 226, 195);
          ctx.fillStyle = '#9e2a2b';
          ctx.font = 'bold 22px "Noto Sans Bengali", sans-serif';
          ctx.fillText('জরুরি বিজ্ঞপ্তি!', 128, 340);
          ctx.fillStyle = '#333333';
          ctx.font = '14px "Hind Siliguri", sans-serif';
          ctx.fillText('এখানে ময়লা ফেলা নিষেধ', 128, 380);
          ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
          ctx.fillStyle = '#c1121f';
          ctx.fillText('অমান্য করিলে ৫০০৳ জরিমানা', 128, 425);
        },
      ];

      const drawPoster = posters[variant % posters.length];
      drawPoster();
    }, 256, 512);
  }

  // --- 17. Vegetable & Fruit Cart Texture (সবজির ঠেলাগাড়ি) ---
  public static getVegetableCartTexture(): THREE.CanvasTexture {
    return this.createCached('veg_cart_tex', (ctx, canvas) => {
      // Wooden cart base
      ctx.fillStyle = '#583101';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Red banner sign: "টাটকা শাক-সবজি ও ফল ভাণ্ডার"
      ctx.fillStyle = '#2b9348';
      ctx.fillRect(10, 10, canvas.width - 20, 90);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, canvas.width - 20, 90);

      ctx.font = 'bold 34px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('টাটকা দেশি সবজি ভাণ্ডার', canvas.width / 2, 55);
      ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffea00';
      ctx.fillText('সরাসরি চাষির মাঠ থেকে • লাল শাক • বেগুন • লাউ', canvas.width / 2, 88);

      // Slat markings
      ctx.strokeStyle = '#3d2600';
      ctx.lineWidth = 2;
      for (let y = 120; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }, 512, 256);
  }

  // --- 18. Detailed Tea Stall Front Banner (টং চায়ের দোকান) ---
  public static getDetailedTeaStallTexture(): THREE.CanvasTexture {
    return this.createCached('tea_stall_detailed_banner', (ctx, canvas) => {
      // Colorful wooden / tin roadside signboard
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#ffb703';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      ctx.font = 'bold 38px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffea00';
      ctx.textAlign = 'center';
      ctx.fillText('বিসমিল্লাহ স্পেশাল টং চা', canvas.width / 2, 58);

      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('খাঁটি গরুর দুধের চা • লেবু চা • টোস্ট বিস্কুট ও ডিম', canvas.width / 2, 98);
      ctx.font = '16px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#caf0f8';
      ctx.fillText('দুধ চা: ৳১৫ • রং চা: ৳১০ • সেদ্ধ ডিম: ৳১৫', canvas.width / 2, 132);
    }, 512, 160);
  }

  // --- Pitha Stall Texture (চিতই ও ভাপা পিঠা) ---
  public static getPithaStallTexture(): THREE.CanvasTexture {
    return this.createCached('pitha_stall_tex', (ctx, canvas) => {
      ctx.fillStyle = '#7f4f24';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ffb703';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      ctx.font = 'bold 34px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffea00';
      ctx.textAlign = 'center';
      ctx.fillText('মামার গরম চিতই ও ভাপা পিঠা', canvas.width / 2, 48);

      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('সরিষা বাটা • শুঁটকি ভর্তা • খাঁটি খেজুরের গুড়', canvas.width / 2, 85);
    }, 512, 128);
  }

  // --- Jhalmuri Cart Texture (ঝালমুড়ি) ---
  public static getJhalmuriCartTexture(): THREE.CanvasTexture {
    return this.createCached('jhalmuri_cart_tex', (ctx, canvas) => {
      ctx.fillStyle = '#d90429';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#fee440';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      ctx.font = 'bold 36px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#fee440';
      ctx.textAlign = 'center';
      ctx.fillText('স্পেশাল বোম্বাই মরিচের ঝালমুড়ি', canvas.width / 2, 50);

      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('চানাচুর • কাঁচামরিচ • খাঁটি সরিষার তেল • চটপটি', canvas.width / 2, 88);
    }, 512, 128);
  }

  // --- Paan Bidi Stall Texture (পান-সিগারেট স্টল) ---
  public static getPaanBidiStallTexture(): THREE.CanvasTexture {
    return this.createCached('paan_bidi_stall_tex', (ctx, canvas) => {
      ctx.fillStyle = '#007f5f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      ctx.font = 'bold 36px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('শাহী খিলি পান ও বিড়ি ভান্ডার', canvas.width / 2, 48);

      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffd166';
      ctx.fillText('মিষ্টি জর্দা • স্পেশাল মসলা • সুপারি • সিগারেট', canvas.width / 2, 86);
    }, 512, 128);
  }

  // --- Book Stall Texture (পুরান বইয়ের স্টল) ---
  public static getBookStallTexture(): THREE.CanvasTexture {
    return this.createCached('book_stall_tex', (ctx, canvas) => {
      ctx.fillStyle = '#1d3557';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#a8dadc';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      ctx.font = 'bold 34px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#f1faee';
      ctx.textAlign = 'center';
      ctx.fillText('ফুটপাত বই মেলা ও ম্যাগাজিন', canvas.width / 2, 48);

      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#e63946';
      ctx.fillText('উপন্যাস • কমিকস • চাকরির খবর • ৫০% ডিসকাউন্ট', canvas.width / 2, 86);
    }, 512, 128);
  }

  // --- Mobile Accessories Texture (মোবাইল এক্সেসরিজ) ---
  public static getMobileAccessoriesTexture(): THREE.CanvasTexture {
    return this.createCached('mobile_acc_tex', (ctx, canvas) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      ctx.font = 'bold 34px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('ডিজিটাল মোবাইল এক্সেসরিজ', canvas.width / 2, 48);

      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('গ্লাস প্রটেক্টর • ব্যাককভার • হেডফোন • কেবল', canvas.width / 2, 86);
    }, 512, 128);
  }

  // --- Flower Seller Texture (ফুলের ডালা) ---
  public static getFlowerSellerTexture(): THREE.CanvasTexture {
    return this.createCached('flower_seller_tex', (ctx, canvas) => {
      ctx.fillStyle = '#c1121f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#fdf0d5';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      ctx.font = 'bold 34px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#fdf0d5';
      ctx.textAlign = 'center';
      ctx.fillText('তাজা ফুলের ডালা ও তোড়া', canvas.width / 2, 48);

      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffea00';
      ctx.fillText('রজনীগন্ধা • গাঁদা ফুল • লাল গোলাপের মালা', canvas.width / 2, 86);
    }, 512, 128);
  }

  // --- 19. Commercial Bangla Building Shop Banners ---
  public static getBanglaShopBanner(idx: number): THREE.CanvasTexture {
    const shops = [
      { name: 'হাজী কাচ্চি বিরিয়ানি', sub: 'পুরান ঢাকার আসল স্বাদ ও সুবাস', bg: '#9d0208', col: '#ffea00' },
      { name: 'বিসমিল্লাহ ফার্মেসি', sub: 'দেশি-বিদেশি সকল ঔষধের ডিপো', bg: '#007f5f', col: '#ffffff' },
      { name: 'মায়ের দোয়া টেলিকম', sub: 'মোবাইল রিচার্জ ও ফ্লেক্সিলোড', bg: '#00509d', col: '#ffb703' },
      { name: 'নিউ ঢাকা ফ্যাশন', sub: 'লেটেস্ট ডিজাইন শার্ট ও প্যান্ট', bg: '#6a040f', col: '#ffffff' },
      { name: 'ভাই ভাই সুইটস ও বেকার্স', sub: 'ঘিয়ে ভাজা চমচম ও রসগোল্লা', bg: '#7f4f24', col: '#fef08a' },
      { name: 'আল-মদিনা অপটিক্যাল ও চশমা', sub: 'কম্পিউটারাইজড চোখের পরীক্ষা', bg: '#1d3557', col: '#48cae4' },
      { name: 'জনপ্রিয় টিম্বার ও হার্ডওয়্যার', sub: 'রং, বার্নিশ, পাইপ ও ফিটিংস', bg: '#386641', col: '#f2e8cf' },
      { name: 'সোনার বাংলা জুয়েলার্স', sub: '২২ ক্যারেট খাঁটি হলমার্ক স্বর্ণালঙ্কার', bg: '#580c10', col: '#ffd166' },
    ];
    const s = shops[idx % shops.length];
    return this.createCached(`bangla_shop_sign_${idx}`, (ctx, canvas) => {
      ctx.fillStyle = s.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      ctx.font = 'bold 36px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, canvas.width / 2, 52);
      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillStyle = s.col;
      ctx.fillText(s.sub, canvas.width / 2, 92);
    }, 512, 128);
  }

  // --- 20. Asphalt Bump / Roughness Map (PBR Gravel Aggregate) ---
  public static getAsphaltBumpMap(): THREE.CanvasTexture {
    return this.createCached('asphalt_bump_pbr', (ctx, canvas) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 35000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const val = Math.floor(40 + Math.random() * 160);
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }, 256, 256);
  }

  // --- 21. Concrete Bump & Normal Map (Weathered Pavement & Pillars) ---
  public static getConcreteBumpMap(): THREE.CanvasTexture {
    return this.createCached('concrete_bump_pbr', (ctx, canvas) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const val = Math.floor(60 + Math.random() * 130);
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(x, y, 2, 2);
      }
      // Cracks
      ctx.strokeStyle = '#303030';
      ctx.lineWidth = 1;
      for (let c = 0; c < 4; c++) {
        ctx.beginPath();
        let cx = Math.random() * canvas.width;
        let cy = Math.random() * canvas.height;
        ctx.moveTo(cx, cy);
        for (let s = 0; s < 6; s++) {
          cx += (Math.random() - 0.5) * 40;
          cy += (Math.random() - 0.5) * 40;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }
    }, 256, 256);
  }

  // --- 22. Red-Brick & White-Grid Apartment Facade (মিরপুর আবাসিক ভবন) ---
  public static getRedBrickWhiteGridBuilding(): THREE.CanvasTexture {
    return this.createCached('bldg_red_brick_grid', (ctx, canvas) => {
      ctx.fillStyle = '#8f2d1e'; // Red terracotta clay brick
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fine mortar lines
      ctx.strokeStyle = '#611a10';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        const offset = (Math.floor(y / 16) % 2) * 20;
        for (let x = offset; x < canvas.width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 16);
          ctx.stroke();
        }
      }

      // Concrete structural white grid frame
      const cols = 4;
      const rows = 6;
      const colW = canvas.width / cols;
      const rowH = canvas.height / rows;

      ctx.strokeStyle = '#f1f1eb';
      ctx.lineWidth = 10;
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * colW, 0);
        ctx.lineTo(i * colW, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * rowH);
        ctx.lineTo(canvas.width, j * rowH);
        ctx.stroke();
      }

      // Window panes & sliding aluminum glass
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = c * colW + 18;
          const wy = r * rowH + 16;
          const ww = colW - 36;
          const wh = rowH - 32;

          ctx.fillStyle = '#1c2833';
          ctx.fillRect(wx, wy, ww, wh);

          // Glass reflection highlight
          const grad = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
          grad.addColorStop(0, 'rgba(100, 150, 190, 0.4)');
          grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
          grad.addColorStop(1, 'rgba(40, 60, 80, 0.6)');
          ctx.fillStyle = grad;
          ctx.fillRect(wx + 2, wy + 2, ww - 4, wh - 4);

          // Balcony grille / safety railing
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 2;
          for (let g = 0; g < 4; g++) {
            ctx.beginPath();
            ctx.moveTo(wx, wy + wh - 6 - g * 4);
            ctx.lineTo(wx + ww, wy + wh - 6 - g * 4);
            ctx.stroke();
          }
        }
      }
    }, 512, 512);
  }

  // --- 23. Beige Tiled Commercial Complex Facade ---
  public static getBeigeTiledCommercialBuilding(): THREE.CanvasTexture {
    return this.createCached('bldg_beige_commercial', (ctx, canvas) => {
      ctx.fillStyle = '#e6dcce';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ceramic tile grid
      const tileS = 32;
      ctx.strokeStyle = '#c5b8a5';
      ctx.lineWidth = 1.5;
      for (let y = 0; y < canvas.height; y += tileS) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let x = 0; x < canvas.width; x += tileS) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Tinted green/bronze architectural glass bands
      const bands = 5;
      const bandH = 48;
      for (let b = 0; b < bands; b++) {
        const by = 40 + b * 96;
        ctx.fillStyle = '#1b4332';
        ctx.fillRect(20, by, canvas.width - 40, bandH);

        // Reflection sheen
        ctx.fillStyle = 'rgba(183, 228, 199, 0.25)';
        ctx.beginPath();
        ctx.moveTo(20, by);
        ctx.lineTo(120, by);
        ctx.lineTo(80, by + bandH);
        ctx.lineTo(20, by + bandH);
        ctx.fill();
      }
    }, 512, 512);
  }

  // --- 24. Peeling Weathered Paint Building Facade ---
  public static getOldPeelingPaintBuilding(): THREE.CanvasTexture {
    return this.createCached('bldg_peeling_paint', (ctx, canvas) => {
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Exposed red brick patches under peeling plaster
      for (let p = 0; p < 8; p++) {
        const px = 40 + (p * 65) % (canvas.width - 80);
        const py = 60 + (p * 85) % (canvas.height - 100);
        const pw = 50 + Math.random() * 40;
        const ph = 35 + Math.random() * 30;

        ctx.fillStyle = '#8d3b2a';
        ctx.fillRect(px, py, pw, ph);

        // Irregular peeling boundary
        ctx.strokeStyle = '#f5ebe0';
        ctx.lineWidth = 3;
        ctx.strokeRect(px - 1, py - 1, pw + 2, ph + 2);
      }

      // Rain water streaks & grime
      for (let s = 0; s < 25; s++) {
        const sx = Math.random() * canvas.width;
        const sh = 60 + Math.random() * 120;
        const grad = ctx.createLinearGradient(sx, 0, sx, sh);
        grad.addColorStop(0, 'rgba(40, 30, 20, 0.45)');
        grad.addColorStop(1, 'rgba(40, 30, 20, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(sx, 0, 3, sh);
      }
    }, 512, 512);
  }

  // --- 25. Rolling Shutter Door Texture (দোকানের শাটার) ---
  public static getRollingShutterTexture(): THREE.CanvasTexture {
    return this.createCached('rolling_shutter_metal', (ctx, canvas) => {
      ctx.fillStyle = '#94a3b8'; // Galvanized steel
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Corrugated horizontal slat lines with shadow and highlight
      const slatH = 14;
      for (let y = 0; y < canvas.height; y += slatH) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(0, y, canvas.width, 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(0, y + 2, canvas.width, 3);
      }

      // Center brass padlock & handle latch
      ctx.fillStyle = '#475569';
      ctx.fillRect(canvas.width / 2 - 25, canvas.height - 40, 50, 16);
      ctx.fillStyle = '#d97706'; // Brass lock
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height - 24, 8, 0, Math.PI * 2);
      ctx.fill();
    }, 256, 256);
  }

  // --- 26. Lit Apartment Windows Emissive Map (রাতের আলোর উইন্ডো ম্যাপ) ---
  public static getNightWindowsEmissiveMap(): THREE.CanvasTexture {
    return this.createCached('night_windows_emissive', (ctx, canvas) => {
      ctx.fillStyle = '#050505'; // Unlit building body
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cols = 5;
      const rows = 8;
      const colW = canvas.width / cols;
      const rowH = canvas.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // 65% of rooms have lights on at night
          if (Math.random() > 0.35) {
            const wx = c * colW + 16;
            const wy = r * rowH + 14;
            const ww = colW - 32;
            const wh = rowH - 28;

            // Warm incandescent / CFL glow
            const colors = ['#fef08a', '#fde047', '#fed7aa', '#e0f2fe'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillRect(wx, wy, ww, wh);

            // Subtle silhouette inside window
            if (Math.random() > 0.5) {
              ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
              ctx.fillRect(wx + ww * 0.3, wy + wh * 0.4, ww * 0.4, wh * 0.6);
            }
          }
        }
      }
    }, 256, 512);
  }

  // --- 27. Mosque Islamic Arch & Green Tile Texture (মিরপুর জামে মসজিদ) ---
  public static getMosqueTilePattern(): THREE.CanvasTexture {
    return this.createCached('mosque_islamic_tile', (ctx, canvas) => {
      ctx.fillStyle = '#1b4332'; // Deep Islamic Emerald Green
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gold calligraphy / geometric arabesque diamond motif
      ctx.strokeStyle = '#d4af37'; // Antique Gold
      ctx.lineWidth = 3;

      const size = 64;
      for (let y = 0; y < canvas.height; y += size) {
        for (let x = 0; x < canvas.width; x += size) {
          ctx.beginPath();
          ctx.moveTo(x + size / 2, y);
          ctx.lineTo(x + size, y + size / 2);
          ctx.lineTo(x + size / 2, y + size);
          ctx.lineTo(x, y + size / 2);
          ctx.closePath();
          ctx.stroke();

          // Small gold crescent center
          ctx.fillStyle = '#ffd166';
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }, 256, 256);
  }

  // --- 28. Bangladeshi Road Signs (ট্রাফিক সাইনবোর্ড) ---
  public static getTrafficSignTexture(type: 'speed_40' | 'no_uturn' | 'roundabout' | 'bus_stop'): THREE.CanvasTexture {
    return this.createCached(`traffic_sign_${type}`, (ctx, canvas) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (type === 'speed_40') {
        // Red circle with white center and "৪০"
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(128, 128, 116, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(128, 128, 90, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '900 85px "Noto Sans Bengali", sans-serif';
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('৪০', 128, 130);
      } else if (type === 'no_uturn') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(128, 128, 116, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(128, 128, 90, 0, Math.PI * 2);
        ctx.fill();

        // U-turn arrow with red slash
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.arc(128, 140, 42, Math.PI, 0, false);
        ctx.lineTo(170, 160);
        ctx.stroke();

        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(60, 60);
        ctx.lineTo(196, 196);
        ctx.stroke();
      } else if (type === 'roundabout') {
        // Blue circle with white circular arrows
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(128, 128, 116, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(128, 128, 55, 0, Math.PI * 1.8);
        ctx.stroke();

        ctx.font = 'bold 26px "Noto Sans Bengali", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('গোলচত্বর', 128, 135);
      } else {
        // Bus stop sign
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(10, 10, 236, 236);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Noto Sans Bengali", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('বাস স্টপ', 128, 70);
        ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
        ctx.fillText('মিরপুর-১০', 128, 115);
        ctx.font = '16px "Hind Siliguri", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText('কাজীপাড়া • শেওড়াপাড়া', 128, 165);
      }
    }, 256, 256);
  }

  // --- 29. Foot Overbridge Banner (পদচারী সেতু) ---
  public static getOverbridgeBanner(): THREE.CanvasTexture {
    return this.createCached('overbridge_banner_tex', (ctx, canvas) => {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      ctx.font = 'bold 44px "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('কাজীপাড়া পদচারী সেতু', canvas.width / 2, 54);

      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('নিরাপদে রাস্তা পার হোন • ফুটওভার ব্রিজ ব্যবহার করুন • ঢাকা উত্তর সিটি কর্পোরেশন', canvas.width / 2, 95);
    }, 512, 128);
  }

  // --- 30. Hanging Laundry Swaying Texture (শুকানো শাড়ি ও লুঙ্গি) ---
  public static getHangingLaundryTexture(): THREE.CanvasTexture {
    return this.createCached('hanging_laundry_tex', (ctx, canvas) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fabrics = [
        { color: '#e63946', pattern: 'check' },
        { color: '#0077b6', pattern: 'stripe' },
        { color: '#ffb703', pattern: 'solid' },
        { color: '#52b788', pattern: 'stripe' },
      ];

      const itemW = canvas.width / fabrics.length;
      fabrics.forEach((f, idx) => {
        const x = idx * itemW + 6;
        const w = itemW - 12;
        ctx.fillStyle = f.color;
        ctx.fillRect(x, 10, w, canvas.height - 20);

        if (f.pattern === 'check') {
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 2;
          for (let y = 10; y < canvas.height - 20; y += 12) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.stroke();
          }
        }
      });
    }, 256, 128);
  }
}

