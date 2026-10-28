/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DamageItem, NationalLossRecord } from '../types';

export interface CostDefinition {
  key: string;
  nameBangla: string;
  category: 'shop' | 'property' | 'vehicle';
  cost: number;
}

export const COST_TABLE: Record<string, CostDefinition> = {
  // Roadside Footpath Shops (Breakable)
  tea_stall: { key: 'tea_stall', nameBangla: 'টং চায়ের দোকান ও কেটলি', category: 'shop', cost: 1500 },
  tea_egg_stall: { key: 'tea_stall', nameBangla: 'টং চায়ের দোকান ও ডিমের খাঁচি', category: 'shop', cost: 1500 },
  fruit_cart: { key: 'fruit_cart', nameBangla: 'ফলের ঠেলাগাড়ি (কলা, পেঁপে, তরমুজ)', category: 'shop', cost: 1000 },
  umbrella_hawker: { key: 'umbrella_hawker', nameBangla: 'ছাতা হকার দোকান (জুতা-পোশাক)', category: 'shop', cost: 3000 },
  hawker_market: { key: 'umbrella_hawker', nameBangla: 'ছাতার নিচে হকার মার্কেট', category: 'shop', cost: 3000 },
  pharmacy: { key: 'pharmacy', nameBangla: 'ফুটপাত ফার্মেসি ও ওষুধের শোকেস', category: 'shop', cost: 5000 },
  tailor_pharmacy: { key: 'pharmacy', nameBangla: 'ফার্মেসি ও টেইলার্স শপ', category: 'shop', cost: 5000 },
  biryani_shop: { key: 'biryani_shop', nameBangla: 'কাচ্চি বিরিয়ানির দোকান ও ডেকচি', category: 'shop', cost: 8000 },
  biryani_hotel: { key: 'biryani_shop', nameBangla: 'কাচ্চি ও বিরিয়ানির ডেকচি স্টল', category: 'shop', cost: 8000 },
  electronics: { key: 'electronics', nameBangla: 'ইলেকট্রনিক্স মেকানিক স্টল', category: 'shop', cost: 15000 },
  electronics_shop: { key: 'electronics', nameBangla: 'ইলেকট্রনিক্স দোকান', category: 'shop', cost: 15000 },
  vegetable_cart: { key: 'vegetable_cart', nameBangla: 'টাটকা সবজির ঠেলাগাড়ি', category: 'shop', cost: 1000 },
  pitha_stall: { key: 'pitha_stall', nameBangla: 'চিতই ও ভাপা পিঠার গরম মাটির চুলা', category: 'shop', cost: 1200 },
  jhalmuri_cart: { key: 'jhalmuri_cart', nameBangla: 'মুড়ি-চানাচুরের টিনের বাক্স ও বৈয়াম', category: 'shop', cost: 800 },
  paan_bidi_stall: { key: 'paan_bidi_stall', nameBangla: 'খিলি পান ও সিগারেটের টং স্টল', category: 'shop', cost: 1000 },
  balloon_vendor: { key: 'balloon_vendor', nameBangla: 'রঙিন বেলুনের গুচ্ছ', category: 'shop', cost: 800 },
  book_stall: { key: 'book_stall', nameBangla: 'ফুটপাতের পুরান বই স্টল', category: 'shop', cost: 2500 },
  mobile_accessories: { key: 'mobile_accessories', nameBangla: 'মোবাইল ব্যাককভার ও হেডফোন পসরা', category: 'shop', cost: 3500 },
  flower_seller: { key: 'flower_seller', nameBangla: 'রজনীগন্ধা ও গাঁদা ফুলের ডালা', category: 'shop', cost: 1500 },

  // Footpath & City Public Property
  pedestrian_compensation: { key: 'pedestrian_compensation', nameBangla: 'পথচারীকে উড়ানোর ক্ষতিপূরণ দাবি', category: 'property', cost: 5000 },
  footpath_tile: { key: 'footpath_tile', nameBangla: 'ফুটপাতের কারুকাজ টাইলস', category: 'property', cost: 200 },
  planter: { key: 'planter', nameBangla: 'রোডসাইড ফুলের টব', category: 'property', cost: 800 },
  planter_box: { key: 'planter', nameBangla: 'সৌন্দর্যবর্ধক ফুলের টব', category: 'property', cost: 800 },
  bollard: { key: 'bollard', nameBangla: 'ফুটপাত লোহার বোলার্ড', category: 'property', cost: 1200 },
  kerb_block: { key: 'kerb_block', nameBangla: 'ডিভাইডার কার্ব ব্লক', category: 'property', cost: 600 },
  traffic_cone: { key: 'traffic_cone', nameBangla: 'ট্রাফিক কোন', category: 'property', cost: 150 },
  street_lamp: { key: 'street_lamp', nameBangla: 'সড়ক বাতি পোল (স্ট্রিট ল্যাম্প)', category: 'property', cost: 25000 },
  signboard: { key: 'signboard', nameBangla: 'দোকানের সাইনবোর্ড', category: 'property', cost: 3500 },
  billboard: { key: 'billboard', nameBangla: 'বড় মেগা বিলবোর্ড', category: 'property', cost: 20000 },
  electric_pole: { key: 'electric_pole', nameBangla: 'বৈদ্যুতিক খুঁটি ও তার', category: 'property', cost: 50000 },
  mural_panel: { key: 'mural_panel', nameBangla: 'মুরাল-দেয়ালের ক্ষতিগ্রস্ত প্যানেল', category: 'property', cost: 4000 },
  tree_branch: { key: 'tree_branch', nameBangla: 'ছায়াদায়ী নিমের ডালপালা', category: 'property', cost: 500 },

  // Other Vehicles
  car_dent: { key: 'car_dent', nameBangla: 'প্রাইভেট কার ডেন্ট', category: 'vehicle', cost: 10000 },
  bus_mirror: { key: 'bus_mirror', nameBangla: 'বাসের সাইড লুকিং গ্লাস', category: 'vehicle', cost: 2500 },
  rickshaw_damage: { key: 'rickshaw_damage', nameBangla: 'সাইকেল রিকশার চাকা ও ফ্রেম', category: 'vehicle', cost: 3000 },
};

export class LossLedger {
  private damages = new Map<string, DamageItem>();
  private total = 0;
  private storageKey = 'dhaka_cng_loss_records_v1';

  constructor() {
    this.reset();
  }

  public recordDamage(costKey: string, roadName: string, multiplier: number = 1): DamageItem {
    const def = COST_TABLE[costKey] || {
      key: costKey,
      nameBangla: 'অনুল্লেখিত সরকারি সম্পত্তি',
      category: 'property',
      cost: 500,
    };

    const cost = def.cost * multiplier;
    this.total += cost;

    let item = this.damages.get(costKey);
    if (!item) {
      item = {
        key: def.key,
        nameBangla: def.nameBangla,
        category: def.category,
        unitCost: def.cost,
        count: 0,
        totalCost: 0,
        roadName,
      };
      this.damages.set(costKey, item);
    }

    item.count += multiplier;
    item.totalCost += cost;
    item.roadName = roadName;

    return { ...item };
  }

  public getTotal(): number {
    return this.total;
  }

  public getItems(): DamageItem[] {
    return Array.from(this.damages.values()).sort((a, b) => b.totalCost - a.totalCost);
  }

  public reset() {
    this.damages.clear();
    this.total = 0;
  }

  // Save record to localStorage
  public saveRecord(headline: string, roadName: string): NationalLossRecord[] {
    const newRecord: NationalLossRecord = {
      totalLoss: this.total,
      date: new Date().toLocaleDateString('bn-BD'),
      headline,
      roadName,
    };

    let records: NationalLossRecord[] = [];
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        records = JSON.parse(stored);
      }
      records.push(newRecord);
      records.sort((a, b) => b.totalLoss - a.totalLoss);
      records = records.slice(0, 5); // Keep top 5 records
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch {
      // localStorage may fail in restricted iframes
    }
    return records;
  }

  public getHistoricalRecords(): NationalLossRecord[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [
      { totalLoss: 48500, date: '২৫ অক্টোবর ২০২৬', headline: 'মিরপুর-১০ এ সবজি ভ্যানের সাথে সংঘর্ষ', roadName: 'বেগম রোকেয়া সরণি' },
      { totalLoss: 32000, date: '২৩ অক্টোবর ২০২৬', headline: 'শাহবাগ রোডে ডিমের খাঁচি চুরমার', roadName: 'শাহবাগ রোড' },
      { totalLoss: 18500, date: '২০ অক্টোবর ২০২৬', headline: 'ফুটপাতের ৪টি ফুলের টব ভাঙা', roadName: 'শাহবাগ রোড' },
    ];
  }
}
