/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VehicleFactory } from '../world/VehicleFactory';
import { soundEffects } from '../audio/SoundEffects';

export interface TrafficVehicle {
  mesh: THREE.Group;
  type: string;
  speed: number;
  targetSpeed: number;
  lane: number;
  direction: 1 | -1;
  length: number;
  width: number;
  honkCooldown: number;
}

export class TrafficManager {
  public scene: THREE.Group;
  public vehicles: TrafficVehicle[] = [];
  private leftLanes = [-3.8, -6.8, -9.8]; // Southbound
  private rightLanes = [3.8, 6.8, 9.8];  // Northbound

  // Spans full connected network from Mirpur-10 (+540) to Shahbagh (-1060)
  private minZ = -1060;
  private maxZ = 520;

  constructor(parentScene: THREE.Scene) {
    this.scene = new THREE.Group();
    this.scene.name = 'Dhaka_Traffic';
    parentScene.add(this.scene);
    this.spawnInitialTraffic();
  }

  private spawnInitialTraffic() {
    const counts = 22; // Well-spaced authentic traffic
    for (let i = 0; i < counts; i++) {
      const isRight = Math.random() > 0.45;
      const lanes = isRight ? this.rightLanes : this.leftLanes;
      // "amar laine gari kom cholbe": keep player's central lane (6.8) less crowded
      let laneIdx: number;
      if (isRight) {
        laneIdx = Math.random() < 0.2 ? 1 : Math.random() < 0.6 ? 0 : 2;
      } else {
        laneIdx = Math.random() < 0.3 ? 1 : Math.random() < 0.65 ? 0 : 2;
      }
      const laneX = lanes[laneIdx];
      const direction = isRight ? -1 : 1;
      let z = this.minZ + Math.random() * (this.maxZ - this.minZ);

      // Prevent vehicle from spawning directly inside player's starting spot (6.8, 240)
      if (Math.abs(laneX - 6.8) < 1.8 && Math.abs(z - 240) < 35) {
        z = z < 240 ? z - 40 : z + 40;
      }

      this.spawnVehicle(laneX, z, direction, laneIdx);
    }
  }

  private spawnVehicle(x: number, z: number, direction: 1 | -1, laneIdx: number) {
    const rand = Math.random();
    let mesh: THREE.Group;
    let type = 'car';
    let length = 4.2;
    let width = 1.8;
    let speed = 9 + Math.random() * 8; // m/s

    // Vehicle variety matching both Shahbagh Road and Mirpur-10
    if (rand < 0.14) {
      // Black Toyota Minivan (Noah type) with tinted windows
      mesh = VehicleFactory.createBlackMinivan();
      type = 'minivan_noah';
      length = 4.8;
      width = 2.0;
      speed = 10 + Math.random() * 4;
    } else if (rand < 0.26) {
      // Silver Hybrid Hatchback
      mesh = VehicleFactory.createSilverHatchback();
      type = 'silver_hatchback';
      length = 4.2;
      width = 1.8;
      speed = 11 + Math.random() * 4;
    } else if (rand < 0.38) {
      // White Microbus (HiAce style)
      mesh = VehicleFactory.createWhiteMicrobus(Math.random() > 0.7);
      type = 'white_microbus';
      length = 4.9;
      width = 1.95;
      speed = 9 + Math.random() * 5;
    } else if (rand < 0.48) {
      // Blue Cargo Pickup with open back
      mesh = VehicleFactory.createBlueCargoPickup();
      type = 'blue_cargo_pickup';
      length = 4.6;
      width = 1.9;
      speed = 8 + Math.random() * 4;
    } else if (rand < 0.60) {
      // Delivery Motorbike with orange-vest rider
      mesh = VehicleFactory.createDeliveryMotorbike();
      type = 'delivery_motorbike';
      length = 1.8;
      width = 0.8;
      speed = 13 + Math.random() * 6;
    } else if (rand < 0.72) {
      // BRTC Single Decker Bus
      mesh = VehicleFactory.createBRTCBus();
      type = 'brtc_bus';
      length = 9.5;
      width = 2.5;
      speed = 8 + Math.random() * 4;
    } else if (rand < 0.82) {
      // AC Coach (Sagar Travels or Royal Express)
      mesh = Math.random() > 0.5 ? VehicleFactory.createACCoachSagar() : VehicleFactory.createACCoachRoyal();
      type = 'ac_coach';
      length = 10.5;
      width = 2.6;
      speed = 10 + Math.random() * 5;
    } else if (rand < 0.92) {
      // Ambient CNG Rickshaw
      mesh = VehicleFactory.createCNGRickshaw(false);
      type = 'cng_rickshaw';
      length = 2.8;
      width = 1.4;
      speed = 7 + Math.random() * 4;
    } else {
      // Cycle Rickshaw (in slow lane)
      mesh = VehicleFactory.createCycleRickshaw();
      type = 'cycle_rickshaw';
      length = 2.4;
      width = 1.2;
      speed = 3.5 + Math.random() * 2.5;
    }

    mesh.position.set(x, 0, z);
    if (direction === -1) {
      mesh.rotation.y = Math.PI;
    }

    this.scene.add(mesh);
    this.vehicles.push({
      mesh,
      type,
      speed,
      targetSpeed: speed,
      lane: x,
      direction,
      length,
      width,
      honkCooldown: Math.random() * 5,
    });
  }

  public update(dt: number, playerX: number, playerZ: number, playerSpeed: number) {
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];

      // Distance checking ahead in same lane
      let leadDist = 999;
      for (let j = 0; j < this.vehicles.length; j++) {
        if (i === j) continue;
        const other = this.vehicles[j];
        if (other.direction === v.direction && Math.abs(other.lane - v.lane) < 1.6) {
          const deltaZ = (other.mesh.position.z - v.mesh.position.z) * v.direction;
          if (deltaZ > 0 && deltaZ < leadDist) {
            leadDist = deltaZ;
          }
        }
      }

      // Check distance to player: "traffic behind player NEVER hits or rams the player CNG"
      const distToPlayerZ = (playerZ - v.mesh.position.z) * v.direction;
      const isBehindPlayer = distToPlayerZ > 0 && distToPlayerZ < 28 && Math.abs(playerX - v.mesh.position.x) < 3.2;

      if (isBehindPlayer) {
        v.honkCooldown -= dt;
        if (v.honkCooldown <= 0) {
          soundEffects.playHorn();
          v.honkCooldown = 4.0 + Math.random() * 3.0;
        }

        // AI vehicle behind player yields, decelerates strongly, or smoothly changes lane
        leadDist = Math.min(leadDist, Math.max(3.5, distToPlayerZ - 3.0));

        // Attempt overtaking / lane change if player is slow or stopped
        if (Math.abs(playerSpeed) < 3.0 && distToPlayerZ < 14) {
          const alternateLane = v.lane > 0 ? (v.lane === 6.8 ? 9.8 : 3.8) : (v.lane === -6.8 ? -9.8 : -3.8);
          v.lane = THREE.MathUtils.damp(v.lane, alternateLane, 2.5, dt);
          v.mesh.position.x = THREE.MathUtils.damp(v.mesh.position.x, v.lane, 2.5, dt);
        }
      }

      // Speed regulation
      if (leadDist < v.length + 3.0) {
        v.speed = Math.max(0, v.speed - 28 * dt);
      } else if (leadDist < v.length + 8.0) {
        v.speed = Math.max(1, v.speed - 14 * dt);
      } else {
        v.speed = THREE.MathUtils.damp(v.speed, v.targetSpeed, 2, dt);
      }

      v.mesh.position.z += v.speed * v.direction * dt;

      // Animate wheels if available
      const wheels = v.mesh.getObjectByName('wheels');
      if (wheels) {
        wheels.children.forEach(w => {
          w.rotation.x += (v.speed / 0.4) * dt * v.direction;
        });
      }

      // Recycle when out of world bounds
      if (v.mesh.position.z > this.maxZ) {
        v.mesh.position.z = this.minZ + 10;
      } else if (v.mesh.position.z < this.minZ) {
        v.mesh.position.z = this.maxZ - 10;
      }
    }
  }

  // "Accidents happen ONLY when the PLAYER drives into other vehicles (hits from front or sides)"
  public getCollisions(
    x: number,
    z: number,
    radius: number,
    playerSpeed: number = 0,
    headingAngle: number = 0
  ): { vehicle: TrafficVehicle; shout: string } | null {
    // Only noticeable forward motion causes an accident
    if (Math.abs(playerSpeed) < 1.0) return null;

    const fwdX = Math.sin(headingAngle);
    const fwdZ = Math.cos(headingAngle);

    const driverShouts = [
      'ভাই, দেখে চালাতে পারেন না?!',
      'আমার নতুন গাড়ির কী হাল করলেন!',
      'চোখ কি মাথায় না পায়ে?!',
      'গাড়ি চালানো না জানলে রাস্তায় নামছেন কেন?!',
      'আরে ভাই! নতুন রঙ করাইলাম কালকে!',
    ];

    for (const v of this.vehicles) {
      const dx = v.mesh.position.x - x;
      const dz = v.mesh.position.z - z;
      const distSq = dx * dx + dz * dz;
      const combinedRadius = radius + Math.max(v.width * 0.55, v.length * 0.42);

      if (distSq < combinedRadius * combinedRadius) {
        // Dot product to ensure vehicle was hit from player's front or sides (not rear-ended by AI)
        const dot = dx * fwdX + dz * fwdZ;
        if (dot > -0.2) {
          const shout = driverShouts[Math.floor(Math.random() * driverShouts.length)];
          return { vehicle: v, shout };
        }
      }
    }
    return null;
  }
}
