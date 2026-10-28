/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { Volume1, ArrowLeft, ArrowRight } from 'lucide-react';
import { soundEffects } from '../audio/SoundEffects';

interface MobileControlsProps {
  engine: GameEngine | null;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ engine }) => {
  if (!engine) return null;

  const handleGasStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    soundEffects.init();
    soundEffects.resume();
    engine.inputGas = true;
  };
  const handleGasEnd = () => {
    engine.inputGas = false;
  };

  const handleBrakeStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    soundEffects.init();
    soundEffects.resume();
    engine.inputBrake = true;
  };
  const handleBrakeEnd = () => {
    engine.inputBrake = false;
  };

  const handleLeftStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    engine.inputLeft = true;
  };
  const handleLeftEnd = () => {
    engine.inputLeft = false;
  };

  const handleRightStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    engine.inputRight = true;
  };
  const handleRightEnd = () => {
    engine.inputRight = false;
  };

  const handleHorn = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    soundEffects.playHorn();
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex justify-between items-end p-4 pb-16 md:pb-6">
      {/* Left side: Steer Left & Right */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onTouchStart={handleLeftStart}
          onTouchEnd={handleLeftEnd}
          onMouseDown={handleLeftStart}
          onMouseUp={handleLeftEnd}
          className="w-16 h-16 rounded-2xl bg-neutral-900/80 active:bg-emerald-600 border-2 border-emerald-500/60 flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform"
          aria-label="বাঁয়ে মোড়"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>

        <button
          onTouchStart={handleRightStart}
          onTouchEnd={handleRightEnd}
          onMouseDown={handleRightStart}
          onMouseUp={handleRightEnd}
          className="w-16 h-16 rounded-2xl bg-neutral-900/80 active:bg-emerald-600 border-2 border-emerald-500/60 flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform"
          aria-label="ডানে মোড়"
        >
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>

      {/* Center: Quick Horn */}
      <div className="pointer-events-auto mb-2">
        <button
          onTouchStart={handleHorn}
          onMouseDown={handleHorn}
          className="w-14 h-14 rounded-full bg-amber-500/90 active:bg-amber-400 border-2 border-white flex flex-col items-center justify-center text-neutral-950 font-bold shadow-2xl active:scale-95 transition-transform"
          aria-label="হর্ন"
        >
          <Volume1 className="w-6 h-6" />
          <span className="text-[9px] -mt-1 font-black">হর্ন</span>
        </button>
      </div>

      {/* Right side: Brake & Gas Pedals */}
      <div className="flex items-end gap-3 pointer-events-auto">
        {/* Brake / Reverse (Red) */}
        <button
          onTouchStart={handleBrakeStart}
          onTouchEnd={handleBrakeEnd}
          onMouseDown={handleBrakeStart}
          onMouseUp={handleBrakeEnd}
          className="w-16 h-20 rounded-2xl bg-red-600/85 active:bg-red-500 border-2 border-red-400 flex flex-col items-center justify-center text-white font-bold shadow-2xl active:scale-95 transition-transform"
          aria-label="ব্রেক ও রিভার্স"
        >
          <span className="text-sm font-black uppercase">ব্রেক</span>
          <span className="text-[10px] text-red-200">/ রিভার্স</span>
        </button>

        {/* Gas / Accelerator (Green) */}
        <button
          onTouchStart={handleGasStart}
          onTouchEnd={handleGasEnd}
          onMouseDown={handleGasStart}
          onMouseUp={handleGasEnd}
          className="w-18 h-24 rounded-2xl bg-emerald-600/90 active:bg-emerald-500 border-2 border-emerald-300 flex flex-col items-center justify-center text-white font-black shadow-2xl active:scale-95 transition-transform"
          aria-label="গ্যাস ও ড্রাইভ"
        >
          <span className="text-base font-black uppercase">গ্যাস</span>
          <span className="text-[11px] text-emerald-200 font-semibold">ড্রাইভ</span>
        </button>
      </div>
    </div>
  );
};
