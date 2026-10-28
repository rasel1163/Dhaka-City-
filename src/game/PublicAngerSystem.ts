/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { soundEffects } from '../audio/SoundEffects';

export interface Pedestrian {
  id: string;
  mesh: THREE.Group;
  x: number;
  z: number;
  baseY: number;
  targetX: number;
  targetZ: number;
  speed: number;
  state: 'walking' | 'crossing' | 'startled' | 'angry' | 'chasing' | 'stumbling' | 'flying' | 'dizzy';
  stateTimer: number;
  attireColor: number;
  hasUmbrella: boolean;
  shoutCooldown: number;
  speechText?: string;
  activity?: 'walking' | 'shopping' | 'vlogging' | 'tea' | 'newspaper' | 'school' | 'vendor' | 'dancing';
  attireType?: 'lungi' | 'panjabi' | 'saree' | 'salwar' | 'burqa' | 'shirt_pant' | 'school';
  flyingVel?: { x: number; y: number; z: number };
  starsGroup?: THREE.Group;
  dizzyTimer?: number;
}

export class PublicAngerSystem {
  public anger: number = 0; // 0 - 100%
  public speechBubble: string | null = null;
  public speechTimer: number = 0;
  public isNearPolice: boolean = false;

  private angerDecayRate = 2.8; // % per second when driving carefully
  private speechTemplates40 = [
    'ভাই, দেইখা চালান!',
    'রাস্তা কি আপনার একার?!',
    'আরে আরে! গায়ে তুলে দিচ্ছিল!',
    'ধর ধর! ড্রাইভার বেপরোয়া!',
    'থামা গাড়ি!',
  ];
  private speechTemplates70 = [
    'জনতা ক্ষেপে গেছে! গাড়ি আটকান!',
    'আজকে এরে ছাড়া হবে না!',
    'পালাবি কই?! ধর!',
    'ফুটপাত দিয়ে গাড়ি চালায় কোত্থেকে?!',
  ];

  public update(dt: number, isDrivingSafely: boolean, isNearPolice: boolean): { caught: boolean } {
    this.isNearPolice = isNearPolice;

    // Decay over time
    if (isNearPolice) {
      this.anger = Math.max(0, this.anger - 18 * dt); // Rapid calm down near traffic police
    } else if (isDrivingSafely) {
      this.anger = Math.max(0, this.anger - this.angerDecayRate * dt);
    }

    if (this.speechTimer > 0) {
      this.speechTimer -= dt;
      if (this.speechTimer <= 0) {
        this.speechBubble = null;
      }
    }

    return { caught: this.anger >= 98 };
  }

  public addAnger(amount: number, reason?: string) {
    this.anger = Math.min(100, this.anger + amount);

    // Trigger speech bubbles based on threshold
    if (this.anger >= 70 && (!this.speechBubble || Math.random() > 0.6)) {
      this.triggerSpeech(this.speechTemplates70[Math.floor(Math.random() * this.speechTemplates70.length)]);
    } else if (this.anger >= 40 && (!this.speechBubble || Math.random() > 0.7)) {
      this.triggerSpeech(this.speechTemplates40[Math.floor(Math.random() * this.speechTemplates40.length)]);
    }
  }

  public triggerSpeech(text: string) {
    this.speechBubble = text;
    this.speechTimer = 3.5;
  }

  public getSettlementCost(): number {
    return Math.max(300, Math.round(250 + this.anger * 25));
  }

  public paySettlement(playerMoney: number): { success: boolean; cost: number; message: string } {
    const cost = this.getSettlementCost();
    if (playerMoney < cost) {
      return { success: false, cost, message: 'মিটমাট করার মতো পর্যাপ্ত টাকা নেই!' };
    }
    // Drop anger substantially
    this.anger = Math.max(0, this.anger - 55);
    this.triggerSpeech('টাকা পেয়ে জনতা শান্ত হলো! "যান ভাই, এবার ছাড়লাম"');
    soundEffects.playCoin();
    return { success: true, cost, message: `৳${cost} মিটমাট দেওয়া হয়েছে! জনরোষ কমেছে।` };
  }
}
