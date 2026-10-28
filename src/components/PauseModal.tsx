/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '../audio/SoundEffects';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onGoHome,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto select-none">
      <div className="bg-neutral-900 border-2 border-emerald-500/70 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center text-white flex flex-col items-center">
        <h2 className="text-2xl font-black text-emerald-400 mb-1">খেলা সাময়িক বিরতি</h2>
        <p className="text-xs text-neutral-400 mb-6">মিরপুর-১০ মেট্রোরেল ও বেগম রোকেয়া সরণি</p>

        <div className="flex flex-col gap-2.5 w-full mb-4">
          <button
            onClick={onResume}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>খেলা চালিয়ে যান</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-neutral-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>পুনরায় শুরু করুন</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-neutral-700 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>শব্দ: {isMuted ? 'নিঃশব্দ (Muted)' : 'চালু (Sound On)'}</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-neutral-700 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>প্রধান মেনুতে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
