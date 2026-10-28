/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { MainMenu } from './components/MainMenu';
import { GarageModal } from './components/GarageModal';
import { GameOverModal } from './components/GameOverModal';
import { NewspaperModal } from './components/NewspaperModal';
import { PauseModal } from './components/PauseModal';
import { PlayerState, VehicleType } from './types';
import { soundEffects } from './audio/SoundEffects';

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameMode, setGameMode] = useState<'menu' | 'playing' | 'paused' | 'garage'>('menu');
  const [playerState, setPlayerState] = useState<PlayerState>({
    money: 2500,
    fuel: 100,
    maxFuel: 100,
    speedKmh: 0,
    activeVehicle: 'cng_auto',
    currentMission: null,
    completedMissionsCount: 0,
    damageIncurred: 0,
    nationalLossTotal: 0,
    publicAnger: 0,
    settlementCost: 300,
    speechBubble: null,
    isGameOver: false,
    gameOverReason: '',
    currentRoadName: 'বেগম রোকেয়া সরণি (মিরপুর-১০)',
    isMobSmashing: false,
    newspaperData: null,
    floatingCostTexts: [],
  });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Detect mobile touch capability
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touch);

    // Initialize 3D Game Engine in isolated container
    if (mountRef.current && !engineRef.current) {
      const engine = new GameEngine(mountRef.current);
      engine.onStateChange = (state, alert) => {
        setPlayerState(state);
        setAlertMessage(alert);
      };
      engineRef.current = engine;
    }

    // Keyboard shortcuts for Pause (Escape)
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setGameMode((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
      soundEffects.dispose();
    };
  }, []);

  const [liveNewspaperData, setLiveNewspaperData] = useState<any>(null);
  const [isLiveNewspaperOpen, setIsLiveNewspaperOpen] = useState(false);

  const handleOpenLiveNewspaper = () => {
    if (engineRef.current) {
      soundEffects.playNewsTing();
      const news = engineRef.current.generateLiveNewspaper();
      setLiveNewspaperData(news);
      setIsLiveNewspaperOpen(true);
    }
  };

  const handleStartGame = () => {
    setGameMode('playing');
    soundEffects.init();
    soundEffects.resume();
  };

  const handleSelectVehicle = (type: VehicleType) => {
    if (engineRef.current) {
      engineRef.current.setPlayerVehicle(type);
    }
    setPlayerState((prev) => ({ ...prev, activeVehicle: type }));
  };

  const handleRestart = () => {
    setIsLiveNewspaperOpen(false);
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
    setGameMode('playing');
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
  };

  return (
    <div className="relative w-full h-full bg-neutral-950 overflow-hidden font-sans">
      {/* 3D WebGL Canvas Viewport Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Main Menu Overlay */}
      {gameMode === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenGarage={() => setGameMode('garage')}
        />
      )}

      {/* In-Game HUD (Zero Viewport Occlusion) */}
      {(gameMode === 'playing' || gameMode === 'paused') && (
        <>
          <HUD
            engine={engineRef.current}
            playerState={playerState}
            alertMessage={alertMessage}
            onOpenGarage={() => setGameMode('garage')}
            onPause={() => setGameMode('paused')}
            onOpenNewspaper={handleOpenLiveNewspaper}
          />

          {/* On-screen touch buttons for mobile users */}
          {isTouchDevice && gameMode === 'playing' && (
            <MobileControls engine={engineRef.current} />
          )}
        </>
      )}

      {/* Pause Modal */}
      {gameMode === 'paused' && (
        <PauseModal
          onResume={() => setGameMode('playing')}
          onRestart={handleRestart}
          onGoHome={() => setGameMode('menu')}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* Garage Vehicle Select Modal */}
      {gameMode === 'garage' && (
        <GarageModal
          currentVehicle={playerState.activeVehicle}
          playerMoney={playerState.money}
          onSelectVehicle={handleSelectVehicle}
          onClose={() => setGameMode('playing')}
        />
      )}

      {/* Live Newspaper Modal Opened Mid-Game via Ticker */}
      {isLiveNewspaperOpen && liveNewspaperData && !playerState.isGameOver && (
        <NewspaperModal
          data={liveNewspaperData}
          onRestart={handleRestart}
          onClose={() => setIsLiveNewspaperOpen(false)}
          onGoHome={() => {
            setIsLiveNewspaperOpen(false);
            setGameMode('menu');
          }}
        />
      )}

      {/* Game Over Screen: Newspaper "দৈনিক গেন্জাম" or fallback summary */}
      {playerState.isGameOver && playerState.newspaperData && (
        <NewspaperModal
          data={playerState.newspaperData}
          onRestart={handleRestart}
          onGoHome={() => setGameMode('menu')}
        />
      )}

      {playerState.isGameOver && !playerState.newspaperData && (
        <GameOverModal
          playerState={playerState}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
