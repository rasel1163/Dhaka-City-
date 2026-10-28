/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DamageItem, NationalLossRecord, NewspaperData } from '../types';
import { LossLedger } from './LossLedger';

export class NewspaperGenerator {
  public static createNewspaperData(
    screenshotUrl: string,
    lossLedger: LossLedger,
    remainingMoney: number,
    roadName: string,
    reason: string
  ): NewspaperData {
    const totalLoss = lossLedger.getTotal();
    const items = lossLedger.getItems();
    const topItem = items.length > 0 ? items[0] : null;

    // Count breakable shops destroyed
    let shopCount = 0;
    items.forEach((it) => {
      if (it.category === 'shop') shopCount += it.count;
    });

    let headline = `${roadName}-এ অটোরিকশার তাণ্ডব: ${shopCount > 0 ? shopCount + 'টি দোকান উধাও, ' : ''}জনতার হাতে গাড়ির চা-নাস্তা!`;
    let subHeadline = 'উত্তেজিত জনতার ধাওয়া খেয়ে চালক চটি ফেলে পলাতক, কেটলির গরম পানিতে সয়লাব ফুটপাত!';

    if (totalLoss > 40000) {
      headline = `রেকর্ড জাতীয় ক্ষতি! ${roadName}-এ বেপরোয়া সিএনজির ৳${totalLoss.toLocaleString()} টাকার মহাধ্বংসযজ্ঞ!`;
      subHeadline = `অর্থ মন্ত্রণালয় ও ঢাকা সিটি কর্পোরেশনের যৌথ শোক প্রকাশ, তদন্ত কমিটি গঠন!`;
    } else if (topItem && topItem.category === 'shop') {
      headline = `${roadName}-এ ${topItem.nameBangla} গুঁড়িয়ে দিল সিএনজি: জনতার ভালোবাসায় গাড়ি চুরমার!`;
    }

    // 4-6 funny satirical article paragraphs
    const paragraphs: string[] = [
      `আজ অপরাহ্ণে রাজধানীর ব্যস্ততম ${roadName}-এ এক অভাবনীয় কাণ্ড ঘটিয়েছে একটি বেপরোয়া সবুজ সিএনজি অটোরিকশা। প্রত্যক্ষদর্শীদের ভাষ্যমতে, চালক গাড়িটিকে এমনভাবে চালাচ্ছিলেন যেন তিনি ঢাকা শহরের রাজপথে নয়, কোনো অ্যাকশন সিনেমার ক্লাইম্যাক্স দৃশ্যে অভিনয় করছেন। রাস্তার মাঝের ফাঁকা লেন ছেড়ে তিনি ফুটপাত, ফলমূলের পসরা এবং চায়ের টং দোকানের ওপর দিয়ে সাঁই সাঁই করে গাড়ি চালিয়ে এক ঐতিহাসিক বিশৃঙ্খলা সৃষ্টি করেন।`,
      `স্থানীয় ফল ও চায়ের দোকানদারদের দাবি, গাড়িটি নিয়ন্ত্রণ হারিয়ে সরাসরি চায়ের স্টলের নীল ত্রিপল ভেদ করে ভেতরে ঢুকে পড়ে। অন্তত কয়েক ডজন দেশি ডিম ও একটি সিলভারের ফুটন্ত কেটলি মুহূর্তে রাজপথে গড়াগড়ি খায়। চারপাশে গরম লাল চা ও ডিমের কুসুমের নদী বয়ে যায়, যাতে কয়েকজন পথচারীর নতুন স্পঞ্জের স্যান্ডেল ভিজে নষ্ট হয়।`,
      `পরিস্থিতি বেগতিক দেখে ক্ষুব্ধ পথচারী ও স্থানীয় হকাররা চারদিক থেকে "ধর ধর!" রবে ছুটে আসেন। সিএনজিটির গতি কমতেই উত্তেজিত জনতা চারপাশ থেকে ঘিরে ধরে বিখ্যাত ঢাকাইয়া কায়দায় চাকা, সাইডের সবুজ জালি ও সামনের হুড খুলে আলাদা করে ফেলে। চালক অবশ্য অত্যন্ত ক্ষিপ্রতার সাথে নিজের দুই পাটি স্যান্ডেল ঘটনাস্থলে বিসর্জন দিয়ে রুদ্ধশ্বাস দৌড়ে গলির ভেতরে অদৃশ্য হয়ে যান।`,
      `ঘটনাস্থলে উপস্থিত ট্রাফিক পুলিশ সদস্য জানান, "আমি বাঁশি বাজাচ্ছিলাম, কিন্তু উনি উল্টো আমাকে হাত নেড়ে বললেন 'মামা পরে কথা কই, তাড়া আছে!'। এখন দুমড়ে যাওয়া গাড়িটি জব্দ করা হয়েছে এবং ভাঙারি হিসেবে নিলামে তোলার চিন্তা চলছে।"`,
      `সব মিলিয়ে এই ঘটনায় ফুটপাতের টাইলস, ডিম, চায়ের কেটলি ও যানবাহনের ক্ষতি মিলিয়ে মোট ৳${totalLoss.toLocaleString()} টাকার জাতীয় ক্ষতি সাধিত হয়েছে। এই বিপুল ক্ষতিপূরণ কার পকেট থেকে যাবে, তা নিয়ে ঢাকা সিটি কর্পোরেশনে জরুরি বৈঠক ডাকা হয়েছে।`,
      `এদিকে প্রত্যক্ষদর্শীরা জানিয়েছেন, চালক সম্পূর্ণ অক্ষত আছেন এবং ইতোমধ্যে পাশের এলাকার এক চায়ের দোকানে বসে ঠান্ডা পানি পান করতে দেখা গেছে।`,
    ];

    // Slapstick equivalencies
    const eggCount = Math.max(1, Math.round(totalLoss / 15));
    const kettleCount = Math.max(1, Math.round(totalLoss / 450));
    const bridgeBolts = (totalLoss / 18500).toFixed(1);

    // Eyewitness Quotes (matching user prompt requirements)
    const quotes = [
      {
        speaker: 'রহিম মিয়া (চায়ের দোকানি)',
        quote: 'আমার ১৪ বছরের ঐতিহ্যবাহী কেটলি আজ শহীদ হইলো! এই শোক আমি কেমনে সইবো?!',
      },
      {
        speaker: 'সালেহা বেগম (যাত্রী)',
        quote: 'বললাম ভাই আস্তে চালান, কয় আপা ব্রেক ফেল, কলমা পড়েন! জীবনে আর সিএনজিতে উঠমু না!',
      },
      {
        speaker: 'কালাম (পথচারী ও জুতো ব্যবসায়ী)',
        quote: 'জনতা যখন ঘিরে ধরলো, ড্রাইভার ভাই চটি ফেলে এমন স্পিডে দৌড় দিছে উসাইন বোল্ট দেখলেও লজ্জা পাইত!',
      },
      {
        speaker: 'কনস্টেবল রফিকুল (ট্রাফিক পুলিশ)',
        quote: 'আমি বাঁশি বাজাচ্ছিলাম, কিন্তু উনি উল্টো বললেন "মামা পরে কথা কই, তাড়া আছে!"',
      },
    ];

    // 4 Fictional Ads matching prompt exactly
    const ads = [
      {
        title: 'ভাঙারি মামা সার্ভিস',
        text: 'দুমড়ে মুচড়ে যাওয়া সিএনজি, ফুটপাতের রড ও বাঁকা খাঁচি কেজি দরে ক্রয়! স্পট ক্যাশ পেমেন্ট।',
        phone: '০১৭১১-ভাঙারি',
      },
      {
        title: 'হাকিম সাহেবের ঔষধালয়',
        text: 'উত্তেজিত জনতা ধাওয়া দিলে এক দৌড়ে ১০০ মিটার ৮ সেকেন্ডে পার করার মহৌষধ ভেষজ হালুয়া!',
        phone: '০১৯১১-দৌড়-হালুয়া',
      },
      {
        title: 'জিনের বাদশা বাবা',
        text: 'বিশেষ তদ্বির: চালকের কোনো লাইসেন্স না থাকিলেও ট্রাফিক সার্জেন্ট দেখিবে না!',
        phone: '০১৮২২-তদ্বির-বাবা',
      },
      {
        title: 'ধৈর্য কোচিং সেন্টার',
        text: 'ফার্মগেটের জ্যামে বসে একটানা ৪ ঘণ্টা মাথা ঠান্ডা রাখার বিশেষ সান্ধ্য ডিপ্লোমা কোর্স!',
        phone: '০১৬৩৩-ধৈর্য-ক্লাস',
      },
    ];

    // Save record to localStorage
    const historicalRecords = lossLedger.saveRecord(headline, roadName);

    return {
      screenshotUrl,
      headline,
      subHeadline,
      dateStr: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      issueNo: `সংখ্যা ${Math.floor(100 + Math.random() * 899)}`,
      roadName,
      totalLoss,
      remainingMoney,
      items,
      articleParagraphs: paragraphs,
      eggComparison: eggCount,
      kettleComparison: kettleCount,
      bridgeBoltComparison: `পদ্মা সেতুর প্রায় ${bridgeBolts}টি অতিরিক্ত নাট-বোল্ট!`,
      quotes,
      sideStories: [
        { icon: '🚌', title: 'মিরপুর-১০ গোলচত্বর', snippet: 'জ্যামের চোটে বাসচালক ঘুমিয়ে পড়লেন, যাত্রীরা ঠেলে বাস সরালেন!' },
        { icon: '🌶️', title: 'ফার্মগেটের কাঁচাবাজার', snippet: 'কাঁচামরিচ ও পেঁয়াজের কথাকাটাকাটি, রসুন এসে পরিস্থিতি শান্ত করল!' },
        { icon: '🚇', title: 'মেট্রোরেল বনাম সিএনজি', snippet: 'উপর দিয়ে সাঁই সাঁই ট্রেন ছুটছে, নিচে চালক নিশ্চিন্তে চা খাচ্ছেন!' },
      ],
      ads,
      horoscope: 'আজ তৃতীয় নয়নে ট্রাফিক সার্জেন্ট ও উত্তেজিত জনতা এড়িয়ে চলুন। ফুটপাতকে হাইওয়ে মনে করলে গণধোলাইয়ের সমূহ সম্ভাবনা।',
      sportsScore: 'ঢাকা গর্ত একাদশ ২ - ১ ফুটপাত বিজয়ী (ম্যান অফ দ্য ম্যাচ: ভাঙা ম্যানহোল ঢাকনা)',
      readersLetter: 'মাননীয় সম্পাদক, ফুটপাতে সিএনজি চালানোকে কি অলিম্পিক ফর্মুলা রেসিংয়ে অন্তর্ভুক্ত করা যায় না? সংশ্লিষ্ট মহলে আকুল আবেদন। — এক ভুক্তভোগী পথচারী।',
      historicalRecords,
    };
  }
}
