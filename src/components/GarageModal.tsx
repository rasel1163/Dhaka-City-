/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VehicleConfig, VehicleType } from '../types';
import { Check, X, Zap, Gauge, Users, Fuel } from 'lucide-react';
import { soundEffects } from '../audio/SoundEffects';

interface GarageModalProps {
  currentVehicle: VehicleType;
  playerMoney: number;
  onSelectVehicle: (type: VehicleType) => void;
  onClose: () => void;
}

const VEHICLES: VehicleConfig[] = [
  {
    id: 'cng_auto',
    name: 'ক্লাসিক সিএনজি অটো রিকশা',
    subName: 'মায়ের দোয়া স্পেশাল',
    description: 'ঢাকার ঐতিহ্যবাহী সবুজ রঙের সিএনজি। চার-স্ট্রোক ইঞ্জিন, জালি ফ্রেম ও পেছনে ফুল আঁকা আর্ট। ভারসাম্যপূর্ণ গতি ও আরামদায়ক ড্রাইভ।',
    topSpeed: 60,
    acceleration: 8,
    braking: 8,
    handling: 8,
    fuelCapacity: 100,
    passengerCapacity: 3,
    price: 0,
    unlocked: true,
    color: '#0f5b33',
  },
  {
    id: 'easy_bike',
    name: 'ইজি-বাইক (ব্যাটারি রিকশা)',
    subName: 'নীলপরী ব্যাটারি এক্সপ্রেস',
    description: 'নীল ক্যানোপি ও নিয়ন হলুদ বর্ডার। পরিবেশবান্ধব বিদ্যুৎচালিত মোটর, শান্ত চলাফেরা এবং মোড় নেওয়ার চমৎকার ক্ষিপ্রতা।',
    topSpeed: 38,
    acceleration: 6,
    braking: 9,
    handling: 10,
    fuelCapacity: 120,
    passengerCapacity: 4,
    price: 1500,
    unlocked: true,
    color: '#0077b6',
  },
  {
    id: 'cng_deluxe',
    name: 'ডিলাক্স স্পিড সিএনজি',
    subName: 'রাজধানী এক্সপ্রেস ভিআইপি',
    description: 'টিউন করা হাই-পাওয়ার সিএনজি ইঞ্জিন, ডাবল ক্রোম বাম্পার ও গোল্ডেন ক্যালিগ্রাফি। সর্বোচ্চ গতি ও প্রতি ট্রিপে বেশি ভাড়া!',
    topSpeed: 72,
    acceleration: 10,
    braking: 9,
    handling: 9,
    fuelCapacity: 130,
    passengerCapacity: 3,
    price: 3200,
    unlocked: false,
    color: '#094d2a',
  },
];

export const GarageModal: React.FC<GarageModalProps> = ({
  currentVehicle,
  playerMoney,
  onSelectVehicle,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="bg-neutral-900 border-2 border-emerald-500/60 rounded-2xl max-w-2xl w-full p-5 md:p-6 shadow-2xl flex flex-col text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-700/80 pb-3 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-emerald-400">মিরপুর অটো গ্যারেজ</h2>
            <p className="text-xs text-neutral-400">আপনার পছন্দের গাড়ি নির্বাচন ও আপগ্রেড করুন</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {VEHICLES.map((v) => {
            const isSelected = currentVehicle === v.id;
            const canAfford = playerMoney >= v.price || v.price === 0;

            return (
              <div
                key={v.id}
                className={`flex flex-col justify-between p-3.5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-950/40 shadow-emerald-900/50 shadow-lg'
                    : 'border-neutral-800 bg-neutral-800/50 hover:border-neutral-600'
                }`}
              >
                <div>
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/50"
                      style={{ backgroundColor: v.color }}
                    />
                    <span className="text-[10px] font-bold text-amber-300 bg-neutral-900/80 px-2 py-0.5 rounded">
                      {v.price === 0 ? 'ফ্রি' : `৳${v.price.toLocaleString()}`}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{v.name}</h3>
                  <div className="text-[11px] font-semibold text-emerald-300 mb-2">{v.subName}</div>
                  <p className="text-[11px] text-neutral-400 leading-snug mb-3">{v.description}</p>

                  {/* Specs */}
                  <div className="space-y-1.5 text-xs text-neutral-300 mb-3 bg-neutral-900/70 p-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" /> গতি
                      </span>
                      <span className="font-bold tabular-nums">{v.topSpeed} কিমি/ঘণ্টা</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> এক্সিলারেশন
                      </span>
                      <span className="font-bold">{v.acceleration}/১০</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Users className="w-3.5 h-3.5 text-sky-400" /> যাত্রী সিট
                      </span>
                      <span className="font-bold">{v.passengerCapacity} জন</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Fuel className="w-3.5 h-3.5 text-red-400" /> গ্যাস ক্যাপাসিটি
                      </span>
                      <span className="font-bold">{v.fuelCapacity} লি.</span>
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <button
                  disabled={!canAfford && !isSelected}
                  onClick={() => {
                    soundEffects.playCoin();
                    onSelectVehicle(v.id);
                  }}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-neutral-950 font-black cursor-default'
                      : canAfford
                      ? 'bg-neutral-700 hover:bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" /> চালিত হচ্ছে
                    </>
                  ) : canAfford ? (
                    'নির্বাচন করুন'
                  ) : (
                    'পর্যাপ্ত টাকা নেই'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 pt-3 text-xs text-neutral-400">
          <span>আপনার জমানো টাকা: <strong className="text-amber-400 font-bold">৳{playerMoney.toLocaleString()}</strong></span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors"
          >
            খেলায় ফিরুন
          </button>
        </div>
      </div>
    </div>
  );
};
