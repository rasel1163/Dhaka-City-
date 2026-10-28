/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface PosterDef {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  footer?: string;
  badge?: string;
  theme: 'yellow_black' | 'red_white' | 'cyan_blue' | 'pink_vintage' | 'green_retro' | 'white_ink';
}

export const FUNNY_POSTERS: PosterDef[] = [
  {
    id: 'goat_dollar',
    title: 'নিখোঁজ বিজ্ঞপ্তি!',
    subtitle: 'আমার প্রিয় ছাগল "ডলার"',
    body: 'গায়ের রঙ সাদা-কালো, গলায় লাল ফিতা। শেষ দেখা গেছে মিরপুর-১০ ফুটপাতে। সন্ধান দিলে নগদ পুরস্কার:',
    footer: 'পুরস্কার: ৳৫০০ (সাথে এক কাপ চা)',
    badge: 'সন্ধান দিন',
    theme: 'yellow_black',
  },
  {
    id: 'no_poster',
    title: 'কঠোর সতর্কতা!',
    subtitle: 'এই খুঁটিতে পোস্টার লাগানো নিষেধ',
    body: '(এই নোটিশটা আমি লাগাইছি, অন্য কেউ লাগাইলে খবর আছে!)',
    footer: '— সচেতন দেশপ্রেমিক নাগরিক',
    badge: 'নিষেধাজ্ঞা',
    theme: 'red_white',
  },
  {
    id: 'movie_tea',
    title: 'সুপারহিট সিনেমা!',
    subtitle: 'পাশের বাসার চা',
    body: 'আজ রাত ৯টায় মিরপুর সিনেমা হলে! এক কাপ চায়ে ১০০ টুইস্ট। টিকিট মূল্য মাত্র ৫ টাকা!',
    footer: 'পরিচালনায়: আবুল কাশেম',
    badge: 'মুক্তির ধামাকা',
    theme: 'pink_vintage',
  },
  {
    id: 'lost_patience',
    title: 'জরুরি হারানো বিজ্ঞপ্তি',
    subtitle: 'আমার ধৈর্য!',
    body: 'আজ সকালে কাজীপাড়া ট্রাফিক জ্যামে হারাইয়া গেছে। দয়া করে কেউ পাইলে ফেরত দিবেন না, নতুন কিনতে গেছি!',
    footer: 'যোগাযোগ: জ্যামে আটকে থাকা এক যাত্রী',
    badge: 'হারিয়েছে',
    theme: 'cyan_blue',
  },
  {
    id: 'polite_dog',
    title: 'সাবধান! সাবধান!',
    subtitle: 'কুকুর থেকে সাবধান',
    body: 'কুকুর ভদ্র ও অমায়িক, কোনো কামড় দেয় না। তবে কুকুরের মালিক বদমেজাজি ও বিপজ্জনক!',
    footer: 'বাড়ি নং ৪২০, মিরপুর-১০',
    badge: 'সতর্কতা',
    theme: 'yellow_black',
  },
  {
    id: 'mega_discount',
    title: 'ধামাকা অফার! ৫০% ছাড়',
    subtitle: 'আগে ১০০% দাম বাড়ানো হয়েছে!',
    body: 'জিন্স প্যান্ট, শার্ট ও লুঙ্গি। কিনলে লস না কিনলে মিস। দোকান ছাড়ার ঘোষণা (গত ৫ বছর ধরে)!',
    footer: 'স্থান: ফুটপাতের ফুটপাত',
    badge: '৫০% OFF',
    theme: 'red_white',
  },
  {
    id: 'hakim_kabiraj',
    title: 'হাকিম সাহেবের ঔষধালয়',
    subtitle: 'গোপন রোগের একমাত্র ভরসা',
    body: 'গাছের শিকড়, মধু ও প্রাচীন ভেষজ ফর্মুলা। জ্যামে মেজাজ গরম, ক্লান্তি ও অনিদ্রার পরীক্ষিত সমাধান!',
    footer: 'স্থান: মিরপুর ফুটপাত মোড়',
    badge: '১০০% গ্যারান্টি',
    theme: 'green_retro',
  },
];

export class FunnyPosterFactory {
  private static textures: THREE.CanvasTexture[] = [];

  public static getPosterTexture(index: number): THREE.CanvasTexture {
    if (this.textures[index]) return this.textures[index];

    const def = FUNNY_POSTERS[index % FUNNY_POSTERS.length];
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Background paper color with subtle tea stain and wear
    let bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (def.theme === 'yellow_black') {
      bgGrad.addColorStop(0, '#f9e855');
      bgGrad.addColorStop(1, '#ebd035');
    } else if (def.theme === 'red_white') {
      bgGrad.addColorStop(0, '#e63946');
      bgGrad.addColorStop(1, '#c92a2a');
    } else if (def.theme === 'cyan_blue') {
      bgGrad.addColorStop(0, '#38bdf8');
      bgGrad.addColorStop(1, '#0284c7');
    } else if (def.theme === 'pink_vintage') {
      bgGrad.addColorStop(0, '#f472b6');
      bgGrad.addColorStop(1, '#db2777');
    } else if (def.theme === 'green_retro') {
      bgGrad.addColorStop(0, '#4ade80');
      bgGrad.addColorStop(1, '#16a34a');
    } else {
      bgGrad.addColorStop(0, '#f5f5f0');
      bgGrad.addColorStop(1, '#e8e8dc');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Weathered paper grain & grunge spots
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Torn paper edges (irregular border)
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, canvas.width, 6);
    ctx.fillRect(0, canvas.height - 8, canvas.width, 8);
    ctx.fillRect(0, 0, 6, canvas.height);
    ctx.fillRect(canvas.width - 6, 0, 6, canvas.height);

    // Tape / staple marks at corners
    ctx.fillStyle = 'rgba(210, 180, 140, 0.75)';
    ctx.fillRect(16, 8, 36, 14);
    ctx.fillRect(canvas.width - 52, 8, 36, 14);
    ctx.fillRect(20, canvas.height - 22, 36, 14);
    ctx.fillRect(canvas.width - 56, canvas.height - 22, 36, 14);

    const isLightBg = def.theme === 'yellow_black' || def.theme === 'white_ink';
    const primaryTextColor = isLightBg ? '#111827' : '#ffffff';
    const accentTextColor = isLightBg ? '#b91c1c' : '#fef08a';

    // Badge top
    if (def.badge) {
      ctx.fillStyle = isLightBg ? '#dc2626' : '#facc15';
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - 70, 24, 140, 32, 6);
      ctx.fill();

      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillStyle = isLightBg ? '#ffffff' : '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def.badge, canvas.width / 2, 40);
    }

    // Main Title
    ctx.font = '900 32px "Hind Siliguri", sans-serif';
    ctx.fillStyle = accentTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(def.title, canvas.width / 2, 70);

    // Decorative divider line
    ctx.strokeStyle = primaryTextColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(30, 115);
    ctx.lineTo(canvas.width - 30, 115);
    ctx.stroke();

    // Subtitle
    if (def.subtitle) {
      ctx.font = '700 24px "Hind Siliguri", sans-serif';
      ctx.fillStyle = primaryTextColor;
      ctx.fillText(def.subtitle, canvas.width / 2, 130);
    }

    // Body Text (Wrapped lines)
    ctx.font = '500 18px "Hind Siliguri", sans-serif';
    ctx.fillStyle = primaryTextColor;
    ctx.textAlign = 'center';

    const words = def.body.split(' ');
    let line = '';
    let startY = 180;
    const lineHeight = 28;
    const maxWidth = canvas.width - 50;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width / 2, startY);
        line = words[n] + ' ';
        startY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, startY);

    // Cartoon / slapstick doodle
    this.drawFunnyDoodle(ctx, def.id, canvas.width / 2, startY + 50);

    // Footer box
    if (def.footer) {
      ctx.fillStyle = isLightBg ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)';
      ctx.fillRect(20, canvas.height - 65, canvas.width - 40, 45);

      ctx.font = 'bold 17px "Hind Siliguri", sans-serif';
      ctx.fillStyle = accentTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def.footer, canvas.width / 2, canvas.height - 42);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this.textures[index] = tex;
    return tex;
  }

  private static drawFunnyDoodle(ctx: CanvasRenderingContext2D, id: string, cx: number, cy: number) {
    ctx.save();
    ctx.strokeStyle = '#111827';
    ctx.fillStyle = '#111827';
    ctx.lineWidth = 2.5;

    if (id === 'goat_dollar') {
      ctx.beginPath();
      ctx.ellipse(cx, cy, 26, 32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 16, cy - 28, 14, Math.PI, Math.PI * 1.6);
      ctx.arc(cx + 16, cy - 28, 14, Math.PI * 1.4, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 32);
      ctx.lineTo(cx, cy + 46);
      ctx.lineTo(cx + 6, cy + 32);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 6, 3.5, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy - 6, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'polite_dog') {
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx - 24, cy - 8, 8, 16, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 24, cy - 8, 8, 16, 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 24);
      ctx.lineTo(cx - 14, cy + 32);
      ctx.lineTo(cx - 14, cy + 16);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 24);
      ctx.lineTo(cx + 14, cy + 32);
      ctx.lineTo(cx + 14, cy + 16);
      ctx.closePath();
      ctx.fill();
    } else if (id === 'movie_tea') {
      ctx.beginPath();
      ctx.ellipse(cx, cy + 16, 22, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(cx - 20, cy - 10, 40, 24);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 14);
      ctx.quadraticCurveTo(cx - 14, cy - 28, cx - 8, cy - 40);
      ctx.moveTo(cx + 8, cy - 14);
      ctx.quadraticCurveTo(cx + 2, cy - 28, cx + 8, cy - 40);
      ctx.stroke();
    } else {
      ctx.font = '900 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ 📢 ⚠️', cx, cy + 10);
    }

    ctx.restore();
  }
}
