/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerState } from '../types';
import { RotateCcw, AlertOctagon, Trophy } from 'lucide-react';

interface GameOverModalProps {
  playerState: PlayerState;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  playerState,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md pointer-events-auto">
      <div className="bg-neutral-900 border-2 border-red-500 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center text-white flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center mb-3">
          <AlertOctagon className="w-9 h-9 text-red-500" />
        </div>

        <h2 className="text-2xl font-black text-red-400 mb-1">
          গেম ওভার — আপনি ফতুর হয়ে গেছেন!
        </h2>
        <p className="text-xs text-neutral-400 mb-5">
          {playerState.gameOverReason || 'আপনার কাছে কোনো টাকা অবশিষ্ট নেই! দোকান ও ট্রাফিকের ক্ষতিপূরণ দিয়ে সর্বস্বান্ত!'}
        </p>

        {/* Daily Summary Box */}
        <div className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 mb-5 text-left space-y-2.5">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            দিনের হিসাব ও পরিসংখ্যান
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">সম্পন্ন যাত্রী ট্রিপ:</span>
            <span className="font-bold text-emerald-400">{playerState.completedMissionsCount} টি</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">মোট ক্ষয়ক্ষতি ও জরিমানা:</span>
            <span className="font-bold text-red-400">৳{playerState.damageIncurred.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-sm border-t border-neutral-800 pt-2">
            <span className="text-neutral-300 font-semibold">অবশিষ্ট ব্যালেন্স:</span>
            <span className="font-bold text-amber-400 text-base">৳{playerState.money.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-base rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>পুনরায় খেলুন (নতুন দিন শুরু)</span>
        </button>
      </div>
    </div>
  );
};
