/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Shield, Wrench, Sparkles, Navigation } from 'lucide-react';
import { soundEffects } from '../audio/SoundEffects';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenGarage: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onOpenGarage }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleStart = () => {
    soundEffects.init();
    soundEffects.resume();
    soundEffects.playHorn();
    onStartGame();
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-6 md:p-12 bg-gradient-to-b from-neutral-950/80 via-neutral-950/40 to-neutral-950/90 pointer-events-auto select-none">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-neutral-900/90 border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-emerald-300">মিরপুর-১০ মেট্রোরেল জোন</span>
        </div>

        <div className="text-xs font-semibold text-neutral-400 bg-black/60 px-3 py-1 rounded-lg">
          বেগম রোকেয়া সরণি • ৩ডি ড্রাইভিং
        </div>
      </div>

      {/* Hero Title Lockup over 35% negative space */}
      <div className="max-w-xl mx-auto text-center flex flex-col items-center">
        {/* Custom SVG Auto Rickshaw Silhouette Lockup */}
        <div className="w-20 h-20 mb-3 text-emerald-400 flex items-center justify-center">
          <svg viewBox="0 0 100 70" className="w-full h-full fill-current filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.4)]">
            <path d="M15,48 L22,25 Q28,12 45,12 L75,12 Q82,12 85,22 L88,48 Z" fill="#0f5b33" />
            <path d="M45,16 L72,16 L75,32 L45,32 Z" fill="#2d6a4f" opacity="0.6" />
            <path d="M25,25 L40,25 L38,40 L20,40 Z" fill="#90e0ef" opacity="0.7" />
            <circle cx="28" cy="52" r="10" fill="#111" stroke="#ccc" strokeWidth="3" />
            <circle cx="75" cy="52" r="10" fill="#111" stroke="#ccc" strokeWidth="3" />
            <path d="M12,42 L25,42" stroke="#ffbe0b" strokeWidth="3" strokeLinecap="round" />
            <path d="M78,44 L92,44" stroke="#ffbe0b" strokeWidth="3" strokeLinecap="round" />
            <text x="50" y="44" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">CNG</text>
          </svg>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300 tracking-tight leading-tight mb-2 drop-shadow-md">
          ঢাকা সিএনজি ড্রাইভার ৩ডি
        </h1>

        <p className="text-sm md:text-base font-semibold text-neutral-300 max-w-md mb-6 leading-relaxed">
          বেগম রোকেয়া সরণিতে সিএনজি চালিয়ে যাত্রী নামান, ভাড়া আয় করুন এবং দোকান ও ভাঙচুর বাঁচিয়ে চলুন!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <button
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-black text-base shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>খেলা শুরু করুন (Space / Enter)</span>
          </button>

          <button
            onClick={onOpenGarage}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>গ্যারেজ</span>
          </button>
        </div>

        {/* Single Flat Control-Hint Line */}
        <div className="mt-6 text-xs text-neutral-400 font-medium tracking-wide bg-neutral-950/70 border border-neutral-800/80 px-4 py-1.5 rounded-full">
          WASD বা তীর বোতামে ড্রাইভ • Space হর্ন (পম-পম) • C ক্যামেরা পরিবর্তন
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-800/60 pt-4">
        <span>১০০% দেশীয় আবহ ও মিরপুর-১০ মেট্রো রেলওয়ে</span>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-emerald-400 hover:underline font-semibold"
        >
          {showInstructions ? 'নিয়মাবলী বন্ধ করুন' : 'খেলার নিয়ম ও টিপস'}
        </button>
      </div>

      {/* Rules Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-neutral-900 border-2 border-emerald-500 rounded-2xl max-w-md w-full p-6 text-white text-left">
            <h3 className="text-xl font-black text-emerald-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> খেলার নিয়মাবলী
            </h3>
            <ul className="space-y-2 text-xs text-neutral-300 leading-relaxed mb-5">
              <li>• <strong>যাত্রী সেবা:</strong> ফুটপাতে সবুজ গোল চিহ্নের কাছে গাড়ি থামিয়ে যাত্রী তুলুন এবং হলুদ চিহ্নের গন্তব্যে নামিয়ে ভাড়া ৳ নিন।</li>
              <li>• <strong>গ্যাস রিফুয়েল:</strong> ফুয়েল কমে গেলে রাস্তার পাশে মেঘনা সিএনজি ফিলিং স্টেশনে গিয়ে গ্যাস ভরুন।</li>
              <li>• <strong>দোকান ভাঙচুর:</strong> ফুটপাতের টং দোকান, ফল বিতান বা পানের দোকানে ধাক্কা দিলে দোকান চুরমার হবে এবং ক্ষতিপূরণ জরিমানা কাটা যাবে!</li>
              <li>• <strong>গেম ওভার:</strong> টাকা শূন্যের নিচে চলে গেলে আপনি ফতুর হয়ে যাবেন!</li>
            </ul>
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
