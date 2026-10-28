/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';

interface MinimapProps {
  engine: GameEngine | null;
}

export const Minimap: React.FC<MinimapProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderMinimap = () => {
      if (!engine) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dark map background with border
      ctx.fillStyle = 'rgba(18, 22, 26, 0.88)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#3a506b';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w - 2, h - 2);

      const scale = 0.52;
      const cx = w / 2;
      const cy = h / 2;

      ctx.save();
      ctx.translate(cx, cy);

      const pX = engine.posX;
      const pZ = engine.posZ;

      // Draw Roadway
      const roadW = 24 * scale;
      ctx.fillStyle = '#3a3d40';
      ctx.fillRect(-roadW / 2 - pX * scale, -cy, roadW, h);

      // Begum Rokeya Median (if visible in range Z > -220)
      const medianY = (-220 - pZ) * scale;
      ctx.fillStyle = '#007f5f';
      ctx.fillRect(-1.2 * scale - pX * scale, -cy, 2.4 * scale, Math.max(0, cy - medianY));

      // Draw CNG Station icon
      const cngX = (engine.city.cngStationPosition.x - pX) * scale;
      const cngY = (engine.city.cngStationPosition.z - pZ) * scale;
      if (cngY > -cy && cngY < cy) {
        ctx.fillStyle = '#2ec4b6';
        ctx.beginPath();
        ctx.arc(cngX, cngY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('CNG', cngX - 8, cngY - 5);
      }

      // Draw Mission Target Waypoint (Pickup or Destination)
      const mission = engine.playerState.currentMission;
      if (mission) {
        const target = mission.status === 'available' ? mission.pickupLocation : mission.dropoffLocation;
        const tx = (target.x - pX) * scale;
        const ty = (target.z - pZ) * scale;

        ctx.fillStyle = mission.status === 'available' ? '#00f5d4' : '#ffb703';
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Traffic Vehicles as dots
      engine.traffic.vehicles.forEach(v => {
        const vx = (v.mesh.position.x - pX) * scale;
        const vy = (v.mesh.position.z - pZ) * scale;
        if (vy > -cy && vy < cy) {
          ctx.fillStyle = v.type.includes('bus') || v.type.includes('coach') ? '#e63946' : '#f1faee';
          ctx.fillRect(vx - 2, vy - 2, 4, 4);
        }
      });

      // Draw Player CNG icon
      ctx.rotate(-engine.headingAngle);
      ctx.fillStyle = '#52b788';
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.lineTo(-4, -6);
      ctx.lineTo(4, -6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(renderMinimap);
    };

    animId = requestAnimationFrame(renderMinimap);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  const isShahbagh = engine && engine.posZ <= -240;

  return (
    <div className="relative rounded-lg overflow-hidden border border-emerald-500/40 shadow-lg">
      <canvas ref={canvasRef} width={135} height={135} className="block" />
      <div className="absolute bottom-1 left-2 text-[10px] font-bold text-emerald-400 bg-black/75 px-1.5 py-0.5 rounded flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {isShahbagh ? 'শাহবাগ রোড' : 'মিরপুর-১০'}
      </div>
    </div>
  );
};
