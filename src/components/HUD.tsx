/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/GameEngine';
import { CameraMode, CAMERA_MODES, PlayerState, toBanglaNumber, WeatherType, WEATHER_PRESETS } from '../types';
import { Minimap } from './Minimap';
import { soundEffects } from '../audio/SoundEffects';
import {
  Volume2,
  VolumeX,
  Camera,
  Volume1,
  AlertTriangle,
  Navigation,
  Flame,
  Coins,
  ShieldAlert,
  MapPin,
  AlertOctagon,
  Users,
  Handshake,
  Languages,
  Newspaper,
  Sun,
  CloudRain,
  Sparkles,
  Sliders,
  Download,
  Check,
  X,
} from 'lucide-react';

import { LIVE_NEWS_HEADLINES, FICTIONAL_ADS } from '../game/NewsTickerData';

interface HUDProps {
  engine: GameEngine | null;
  playerState: PlayerState;
  alertMessage: string | null;
  onOpenGarage: () => void;
  onPause: () => void;
  onOpenNewspaper?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  playerState,
  alertMessage,
  onOpenGarage,
  onPause,
  onOpenNewspaper,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('low_chase');
  const [weather, setWeather] = useState<WeatherType>('morning');
  const [isWeatherDrawerOpen, setIsWeatherDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [fpsCap, setFpsCap] = useState<30 | 60>(60);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);

  // Directly read current camera mode & weather from engine if available without setState loops
  const activeCameraMode = engine?.cameraDirector?.mode ?? cameraMode;
  const activeWeather = engine?.weatherSystem?.currentWeather ?? weather;

  const [useEnglish, setUseEnglish] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    const newsInterval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % LIVE_NEWS_HEADLINES.length);
    }, 4500);
    return () => clearInterval(newsInterval);
  }, []);

  useEffect(() => {
    const adInterval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % FICTIONAL_ADS.length);
    }, 10000);
    return () => clearInterval(adInterval);
  }, []);

  const getActiveNews = () => {
    if (playerState.publicAnger >= 50) {
      return `⚠️ জরুরি জনরোষ: উত্তেজিত জনতা লাঠিসোঁটা নিয়ে ধাওয়া করছে! অবিলম্বে দ্রুত চালান বা জরিমানা দিয়ে মিটমাট করুন!`;
    }
    if (playerState.nationalLossTotal > 0 && newsIndex % 4 === 0) {
      return `🚨 ব্রেকিং ক্ষতি: এখন পর্যন্ত জাতীয় ক্ষয়ক্ষতির পরিমাণ ৳${toBanglaNumber(playerState.nationalLossTotal, useEnglish)}! অর্থ মন্ত্রণালয়ের গভীর উদ্বেগ!`;
    }
    return LIVE_NEWS_HEADLINES[newsIndex % LIVE_NEWS_HEADLINES.length];
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
  };

  
  const toggleCamera = () => {
    if (engine) {
      const next = engine.cycleCamera();
      setCameraMode(next);
    }
  };

  const handleSelectWeather = (w: WeatherType) => {
    if (engine) {
      engine.setWeather(w);
      setWeather(w);
    }
    setIsWeatherDrawerOpen(false);
  };

  const handleCapturePhoto = () => {
    if (!engine) return;
    const url = engine.captureScreenshot();
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dhaka_cng_mirpur10_' + Date.now() + '.jpg';
    link.click();
    setPhotoNotice('ছবি ডাউনলোড সম্পন্ন হয়েছে! 📸');
    setTimeout(() => setPhotoNotice(null), 2500);
  };

  const handleToggleQuality = (q: 'low' | 'medium' | 'high') => {
    setQuality(q);
    if (engine) engine.setQuality(q);
  };


  const honk = () => {
    soundEffects.playHorn();
  };

  const switchMap = () => {
    if (!engine) return;
    const isShahbagh = engine.posZ <= -240;
    engine.teleportToMap(isShahbagh ? 'begum_rokeya' : 'shahbagh_rd');
  };

  const handleSettle = () => {
    if (engine) {
      engine.settleWithCrowd();
    }
  };

  let waypointAngleDeg = 0;
  let distToTarget = 0;
  if (engine && playerState.currentMission) {
    const target = playerState.currentMission.status === 'available'
      ? playerState.currentMission.pickupLocation
      : playerState.currentMission.dropoffLocation;

    const dx = target.x - engine.posX;
    const dz = target.z - engine.posZ;
    distToTarget = Math.round(Math.sqrt(dx * dx + dz * dz));

    const targetHeading = Math.atan2(dx, dz);
    const diff = targetHeading - engine.headingAngle;
    waypointAngleDeg = (diff * 180) / Math.PI;
  }

  const fuelPercent = Math.max(0, Math.min(100, (playerState.fuel / playerState.maxFuel) * 100));
  const isShahbagh = engine ? engine.posZ <= -240 : false;
  const anger = playerState.publicAnger || 0;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Top Bar Status Clusters */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 w-full">
        {/* Left: Money, National Loss, Fuel & Anger */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Row 1: Money & National Loss */}
          <div className="flex items-center gap-2">
            {/* Money Display */}
            <div className="flex items-center gap-2 bg-neutral-900/90 border border-amber-500/50 px-3 py-1.5 rounded-lg shadow-lg">
              <Coins className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">টাকা / আয়</span>
                <span className="text-lg sm:text-xl font-bold text-amber-400 tabular-nums font-mono">
                  ৳{toBanglaNumber(playerState.money, useEnglish)}
                </span>
              </div>
            </div>

            {/* National Loss Ledger Live Counter */}
            <div className="flex items-center gap-2 bg-neutral-900/90 border border-red-500/60 px-3 py-1.5 rounded-lg shadow-lg">
              <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-red-300 font-semibold uppercase tracking-wider">জাতীয় ক্ষতি</span>
                <span className="text-base sm:text-lg font-bold text-red-400 tabular-nums font-mono">
                  ৳{toBanglaNumber(playerState.nationalLossTotal || 0, useEnglish)}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Fuel Gauge & Public Anger Gauge */}
          <div className="flex flex-wrap items-center gap-2">
            {/* CNG Fuel Gauge */}
            <div className="flex flex-col bg-neutral-900/90 border border-emerald-500/50 px-3 py-1.5 rounded-lg shadow-lg min-w-[130px]">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  সিএনজি
                </span>
                <span className="tabular-nums font-mono">{toBanglaNumber(Math.round(fuelPercent), useEnglish)}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
                <div
                  className={`h-full transition-all duration-200 ${
                    fuelPercent > 40 ? 'bg-emerald-500' : fuelPercent > 18 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${fuelPercent}%` }}
                />
              </div>
            </div>

            {/* Public Anger Meter */}
            <div className="flex flex-col bg-neutral-900/90 border border-orange-500/50 px-3 py-1.5 rounded-lg shadow-lg min-w-[130px]">
              <div className="flex items-center justify-between text-xs text-orange-400 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-orange-400" />
                  গণরোষ
                </span>
                <span className="tabular-nums font-mono font-bold text-orange-300">
                  {toBanglaNumber(anger, useEnglish)}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
                <div
                  className={`h-full transition-all duration-200 ${
                    anger < 40 ? 'bg-emerald-500' : anger < 70 ? 'bg-amber-500' : 'bg-red-600 animate-pulse'
                  }`}
                  style={{ width: `${Math.min(100, anger)}%` }}
                />
              </div>
            </div>

            {/* Dedicated Floating Quick-Settle ("মিটমাট") Button (Appears when Anger > 20%) */}
            {anger >= 20 && (
              <button
                onClick={handleSettle}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-neutral-950 font-black px-3 py-1.5 rounded-lg shadow-2xl text-xs border border-amber-300 animate-pulse transition-all cursor-pointer"
                title="টাকা দিয়ে জনতাকে শান্ত করুন"
              >
                <Handshake className="w-4 h-4 text-neutral-950 shrink-0" />
                <span>মিটমাট (৳{toBanglaNumber(playerState.settlementCost || 300, useEnglish)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Mission Waypoint & Passenger Goal */}
        {playerState.currentMission && (
          <div className="flex flex-col items-center pointer-events-auto">
            <div className="bg-neutral-950/90 border border-sky-500/60 rounded-xl px-3 sm:px-4 py-2 shadow-2xl flex items-center gap-2 sm:gap-3 max-w-md">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sky-950 border border-sky-400 flex items-center justify-center shrink-0 shadow-inner"
                style={{ transform: `rotate(${waypointAngleDeg}deg)` }}
              >
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 fill-sky-400" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    playerState.currentMission.status === 'available' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {playerState.currentMission.status === 'available' ? 'যাত্রী তুলুন' : 'যাত্রী গন্তব্যে নিন'}
                  </span>
                  <span className="text-xs text-sky-300 font-medium font-mono">
                    দূরত্ব: {toBanglaNumber(distToTarget, useEnglish)} মি.
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate max-w-[200px]">
                  {playerState.currentMission.status === 'available'
                    ? `${playerState.currentMission.passengerName} (${playerState.currentMission.pickupLocation.name})`
                    : `${playerState.currentMission.dropoffLocation.name}`}
                </div>

                <div className="text-xs text-amber-400 font-semibold font-mono">
                  ভাড়া: ৳{toBanglaNumber(playerState.currentMission.fare, useEnglish)} ({toBanglaNumber(playerState.currentMission.passengerCount, useEnglish)} জন)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right: Minimap */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <Minimap engine={engine} />
        </div>
      </div>

      {/* Shouting Cartoon Speech Bubble Popup */}
      {playerState.speechBubble && (
        <div className="self-center my-auto pointer-events-none z-30 animate-bounce">
          <div className="bg-white text-neutral-900 border-2 border-black font-extrabold text-sm sm:text-base px-4 py-2 rounded-2xl shadow-2xl relative font-sans">
            <span className="text-red-600 mr-1.5">📢</span>
            <span>"{playerState.speechBubble}"</span>
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-black" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-7 border-x-transparent border-t-7 border-t-white" />
          </div>
        </div>
      )}

      {/* Floating Cost & Shop Owner Reaction Popups ("-৳১,৫০০", "ভাই, আমার দোকান ভাইঙ্গা দিলেন!") */}
      {playerState.floatingCostTexts && playerState.floatingCostTexts.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-35 overflow-hidden">
          {playerState.floatingCostTexts.map((fc) => (
            <div
              key={fc.id}
              className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-75 select-none"
              style={{
                left: `${fc.screenX}px`,
                top: `${fc.screenY}px`,
                opacity: fc.opacity,
              }}
            >
              <span
                className="text-2xl sm:text-3xl font-black text-red-500 font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                style={{ WebkitTextStroke: '1.2px #ffffff' }}
              >
                {fc.text}
              </span>
              {fc.reaction && (
                <span className="text-xs sm:text-sm font-extrabold text-amber-200 bg-neutral-950/85 px-2.5 py-0.5 rounded-full border border-amber-400/60 shadow-xl mt-0.5 text-center max-w-xs truncate">
                  "{fc.reaction}"
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Slapstick Action Popups ("ধুপধাপ!", "ঠাস!", "ধ্যাড়ং!", "ফটাস!") */}
      {(playerState.isMobSmashing || (engine && engine.mobImpactTexts.length > 0)) && engine && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 overflow-hidden">
          {engine.mobImpactTexts.map((item) => (
            <div
              key={item.id}
              className="absolute text-4xl sm:text-6xl font-black text-amber-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] animate-ping font-serif select-none"
              style={{
                transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rot}deg)`,
                WebkitTextStroke: '2.5px #990000',
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}

      {/* Center Alert Notification Popups */}
      {alertMessage && (
        <div className="self-center bg-red-600/95 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-2xl border-2 border-white/80 animate-bounce pointer-events-auto flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex items-end justify-between w-full">
        {/* Left: Road & Vehicle Info Badge */}
        <div className="hidden sm:flex flex-col bg-neutral-900/85 border border-neutral-700/60 px-3 py-1.5 rounded-lg text-xs text-neutral-300 pointer-events-auto">
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {playerState.currentRoadName}
          </span>
          <span className="text-[11px] text-neutral-400">ঢাকা মেট্রো থ-১২-৭৮৯০ • সম্পন্ন ট্রিপ: {playerState.completedMissionsCount}</span>
        </div>

        {/* Center: Unified Collapsible Bottom Dock */}
        <div className="flex flex-col items-center pointer-events-auto mx-auto">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="text-[11px] font-semibold text-neutral-400 hover:text-white bg-neutral-900/90 border border-neutral-700 px-3 py-0.5 rounded-t-md transition-colors"
          >
            {isDockCollapsed ? '▴ কন্ট্রোল প্যানেল খুলুন' : '▾ গোপন করুন'}
          </button>

          {!isDockCollapsed && (
            <div className="flex items-center gap-2 bg-neutral-950/95 border border-neutral-700/80 px-3.5 py-2 rounded-xl shadow-2xl">
              <button
                onClick={honk}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow transition-colors active:scale-95"
                title="হর্ন বাজান (Space/H)"
              >
                <Volume1 className="w-4 h-4" />
                <span>হর্ন (পম-পম)</span>
              </button>

              <button
                onClick={switchMap}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition-colors active:scale-95"
                title="ম্যাপ স্থানান্তর করুন"
              >
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{isShahbagh ? 'মিরপুর-১০ এ যান' : 'শাহবাগ রোডে যান'}</span>
              </button>

              
              {/* Camera Cycle Button with Mode Badge */}
              <button
                onClick={toggleCamera}
                className="flex items-center gap-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-200 font-medium px-3 py-1.5 rounded-lg text-xs border border-sky-600/60 transition-colors active:scale-95 shadow-sm"
                title="ক্যামেরা ভিউ বদলান (শর্টকাট C)"
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <span>ক্যামেরা: {CAMERA_MODES.find(c => c.id === activeCameraMode)?.name || 'লো চেজ'}</span>
                <span className="text-[10px] bg-sky-800 px-1.5 py-0.2 rounded text-sky-100 font-mono">[C]</span>
              </button>

              {/* Weather & Sky Preset Button */}
              <button
                onClick={() => setIsWeatherDrawerOpen(!isWeatherDrawerOpen)}
                className="flex items-center gap-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-200 font-medium px-3 py-1.5 rounded-lg text-xs border border-amber-600/60 transition-colors active:scale-95 shadow-sm"
                title="আবহাওয়া ও আকাশ বদলান"
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span>আবহাওয়া: {WEATHER_PRESETS.find(w => w.id === activeWeather)?.name || 'দুপুর'}</span>
              </button>

              {/* Settings / Graphics Quality Button */}
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium px-2.5 py-1.5 rounded-lg text-xs border border-neutral-700 transition-colors"
                title="গ্রাফিক্স সেটিংস"
              >
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">গ্রাফিক্স</span>
              </button>


              <button
                onClick={onOpenGarage}
                className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs border border-neutral-600 transition-colors active:scale-95"
              >
                <span>গ্যারেজ</span>
              </button>

              {onOpenNewspaper && (
                <button
                  onClick={onOpenNewspaper}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-3 py-1.5 rounded-lg text-xs border border-amber-300 shadow-md transition-colors active:scale-95"
                  title="দৈনিক গেন্জাম পত্রিকা পড়ুন"
                >
                  <Newspaper className="w-4 h-4 text-neutral-950" />
                  <span>দৈনিক গেন্জাম</span>
                </button>
              )}

              <button
                onClick={toggleMute}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-600 transition-colors"
                title="শব্দ অন/অফ"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => setUseEnglish(!useEnglish)}
                className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold px-2 py-1.5 rounded-lg text-xs border border-neutral-600 transition-colors"
                title="সংখ্যা রূপান্তর (০-৯ / 0-9)"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{useEnglish ? '০-৯' : '0-9'}</span>
              </button>

              <button
                onClick={onPause}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold px-2.5 py-1.5 rounded-lg text-xs border border-neutral-600 transition-colors"
              >
                বিরতি
              </button>
            </div>
          )}
        </div>

        {/* Right: Digital Bengali Speedometer Dial */}
        <div className="flex flex-col items-center bg-neutral-950/90 border-2 border-emerald-500/60 p-3 rounded-2xl shadow-2xl pointer-events-auto min-w-[110px]">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">গতি</span>
          <span className="text-3xl md:text-4xl font-black text-emerald-400 tabular-nums font-mono leading-none my-1">
            {toBanglaNumber(playerState.speedKmh, useEnglish)}
          </span>
          <span className="text-[11px] font-semibold text-emerald-300">কিমি/ঘণ্টা</span>

          <div className="flex items-center gap-1.5 mt-2 border-t border-neutral-800 pt-1 w-full justify-center">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              engine && engine.speed >= 0 ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}>D</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              engine && engine.speed < 0 ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}>R</span>
          </div>
        </div>
      </div>

      {/* Live Dhaka Breaking News Ticker (দৈনিক গেন্জাম লাইভ) */}
      <div
        onClick={onOpenNewspaper}
        className="w-full mt-2 pointer-events-auto flex items-center bg-neutral-950/95 border-2 border-red-600/70 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md cursor-pointer hover:border-red-500 transition-colors"
        title="দৈনিক গেন্জাম পত্রিকা খুলতে ক্লিক করুন"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenNewspaper?.();
          }}
          className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-black px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>দৈনিক গেন্জাম লাইভ</span>
        </button>

        {/* Live National Loss and Public Anger in Ticker */}
        <div className="flex items-center gap-2 pl-2.5 pr-2 py-1 shrink-0 border-r border-neutral-800 text-[11px] font-sans">
          <div className="flex items-center gap-1 text-red-400 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-neutral-400">ক্ষতি:</span>
            <span className="text-white font-mono font-bold">৳{toBanglaNumber(playerState.nationalLossTotal, useEnglish)}</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-bold border-l border-neutral-800 pl-2">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-neutral-400">রোষ:</span>
            <span className={`font-mono font-bold ${playerState.publicAnger >= 70 ? 'text-red-500 animate-pulse' : 'text-amber-300'}`}>
              {toBanglaNumber(playerState.publicAnger, useEnglish)}%
            </span>
          </div>
        </div>

        {/* Scrolling/Live News Headline */}
        <div className="flex-1 px-3 py-1 overflow-hidden whitespace-nowrap text-xs text-amber-100 font-medium tracking-wide flex items-center">
          <span className="truncate">{getActiveNews()}</span>
        </div>

        {/* Rotating Classified Ad Every 10 Seconds */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border-l border-amber-500/30 text-[11px] text-amber-300 shrink-0 max-w-sm truncate">
          <span className="font-bold text-amber-400">📢 বিজ্ঞাপন:</span>
          <span className="truncate">
            {FICTIONAL_ADS[adIndex].title}: {FICTIONAL_ADS[adIndex].tagline} ({FICTIONAL_ADS[adIndex].phone})
          </span>
        </div>

        {onOpenNewspaper && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenNewspaper();
            }}
            className="text-[11px] text-amber-400 hover:text-white px-2.5 py-1 underline font-bold shrink-0 hidden sm:block"
          >
            পত্রিকা খুলুন »
          </button>
        )}
      </div>

      {/* Photo Mode Controls Overlay */}
      {activeCameraMode === 'photo_mode' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/90 backdrop-blur-md border border-sky-500/50 rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-3 animate-fade-in text-white min-w-[300px]">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Camera className="w-5 h-5" />
            <span>ফটো মোড (Photo Mode)</span>
          </div>
          <p className="text-xs text-neutral-300 text-center">
            ক্যামেরা স্বয়ংক্রিয়ভাবে সিএনজির চারপাশে ঘুরছে। আপনার পছন্দের কোণটিতে ছবি তুলুন!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCapturePhoto}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <Download className="w-4 h-4" />
              <span>ছবি ডাউনলোড করুন</span>
            </button>
            <button
              onClick={() => toggleCamera()}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-xl text-xs font-medium"
            >
              প্রস্থান (C)
            </button>
          </div>
          {photoNotice && (
            <span className="text-xs text-emerald-400 font-medium animate-pulse">{photoNotice}</span>
          )}
        </div>
      )}

      {/* 9 Bangladeshi Weather Presets Drawer */}
      {isWeatherDrawerOpen && (
        <div className="absolute inset-x-0 bottom-24 mx-auto max-w-xl z-50 bg-neutral-900/95 backdrop-blur-lg border border-neutral-700 rounded-3xl p-5 shadow-2xl animate-slide-up text-white">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm">ঢাকার আবহাওয়া ও সময় নির্বাচন করুন</h3>
            </div>
            <button
              onClick={() => setIsWeatherDrawerOpen(false)}
              className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mt-3 max-h-72 overflow-y-auto pr-1">
            {WEATHER_PRESETS.map((p) => {
              const isSelected = activeWeather === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectWeather(p.id)}
                  className={'flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ' +
                    (isSelected
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-md scale-102'
                      : 'bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-700 text-neutral-200')}
                >
                  <span className="text-2xl mb-1">{p.icon}</span>
                  <span className="font-bold text-xs">{p.name}</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Graphics & FPS Settings Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-x-0 bottom-24 mx-auto max-w-md z-50 bg-neutral-900/95 backdrop-blur-lg border border-neutral-700 rounded-3xl p-5 shadow-2xl animate-slide-up text-white">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-sm">গ্রাফিক্স ও কার্যক্ষমতা সেটিংস</h3>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-neutral-300 font-medium block mb-2">গ্রাফিক্স কোয়ালিটি:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleToggleQuality(q)}
                    className={'py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ' +
                      (quality === q
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700')}
                  >
                    {q === 'low' ? 'লো (দ্রুত)' : q === 'medium' ? 'মিডিয়াম' : 'হাই (বাস্তব PBR)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-300 font-medium block mb-2">ফ্রেমরেট লিমিট (FPS Cap):</label>
              <div className="grid grid-cols-2 gap-2">
                {([30, 60] as const).map((fps) => (
                  <button
                    key={fps}
                    onClick={() => {
                      setFpsCap(fps);
                      if (engine) engine.fpsCap = fps;
                    }}
                    className={'py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ' +
                      (fpsCap === fps
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700')}
                  >
                    {fps === 30 ? '৩০ FPS (ব্যাটারি সাশ্রয়ী)' : '৬০ FPS (স্মুথ মোশন)'}
                  </button>
                ))}
              </div>
            </div>


            <div>
              <label className="text-xs text-neutral-300 font-medium block mb-2">ক্যামেরা মোড নির্বাচন:</label>
              <div className="grid grid-cols-3 gap-2">
                {CAMERA_MODES.map((cm) => (
                  <button
                    key={cm.id}
                    onClick={() => {
                      if (engine) engine.setCameraMode(cm.id);
                      setCameraMode(cm.id);
                    }}
                    className={'py-1.5 px-2 rounded-xl text-[11px] font-medium border text-center transition-colors ' +
                      (cameraMode === cm.id
                        ? 'bg-amber-600 border-amber-400 text-white font-bold'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700')}
                  >
                    {cm.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
