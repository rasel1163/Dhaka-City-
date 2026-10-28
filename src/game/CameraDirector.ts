/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CameraMode } from '../types';

export class CameraDirector {
  public camera: THREE.PerspectiveCamera;
  public mode: CameraMode = 'low_chase';

  private currentCamPos = new THREE.Vector3(6.8, 2.5, 245);
  private currentLookAt = new THREE.Vector3(6.8, 1.2, 235);
  private targetCamPos = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();

  public bumpShake: number = 0;
  public slowMotionFactor: number = 1.0;
  private slowMoTimer: number = 0;

  public photoOrbitAngle: number = 0;
  public photoDistance: number = 5.2;
  public photoHeight: number = 1.8;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.fov = 70;
    this.camera.updateProjectionMatrix();
  }

  public orbitPhoto(deltaAngle: number, deltaHeight: number = 0) {
    this.photoOrbitAngle += deltaAngle;
    this.photoHeight = Math.max(0.6, Math.min(6.0, this.photoHeight + deltaHeight));
  }

  public zoomPhoto(deltaZoom: number) {
    this.photoDistance = Math.max(2.5, Math.min(14.0, this.photoDistance + deltaZoom));
  }

  public setMode(mode: CameraMode) {
    this.mode = mode;
  }


  public cycleNextMode(): CameraMode {
    const modes: CameraMode[] = [
      'low_chase',
      'high_chase',
      'cinematic_side',
      'first_person',
      'top_down',
      'photo_mode',
    ];
    const idx = modes.indexOf(this.mode);
    const next = modes[(idx + 1) % modes.length];
    this.setMode(next);
    return next;
  }

  public triggerCrashSlowMo(intensity: number = 1.0) {
    this.bumpShake = Math.min(this.bumpShake + 0.8 * intensity, 1.8);
    this.slowMotionFactor = 0.35;
    this.slowMoTimer = 0.8;
  }

  public triggerPotholeBump(intensity: number = 0.4) {
    this.bumpShake = Math.max(this.bumpShake, intensity);
  }

  public update(
    delta: number,
    playerX: number,
    playerZ: number,
    headingAngle: number,
    speedKmh: number,
    rollAngle: number = 0
  ) {
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= delta;
      if (this.slowMoTimer <= 0) {
        this.slowMotionFactor = 1.0;
      }
    }

    if (this.bumpShake > 0.001) {
      this.bumpShake *= Math.exp(-6.0 * delta);
    } else {
      this.bumpShake = 0;
    }

    // Dynamic speed-based FOV expansion (68 to 80 FOV)
    const targetFov = 68 + Math.min(speedKmh / 55, 1.0) * 12;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 4, delta);
    this.camera.updateProjectionMatrix();

    const fwdX = Math.sin(headingAngle);
    const fwdZ = Math.cos(headingAngle);
    const rightX = Math.cos(headingAngle);
    const rightZ = -Math.sin(headingAngle);

    switch (this.mode) {
      case 'low_chase': {
        const dist = 4.5;
        this.targetCamPos.set(playerX - fwdX * dist, 1.7, playerZ - fwdZ * dist);
        this.targetLookAt.set(playerX + fwdX * 7, 1.2, playerZ + fwdZ * 7);
        break;
      }
      case 'high_chase': {
        const dist = 8.5;
        this.targetCamPos.set(playerX - fwdX * dist, 4.2, playerZ - fwdZ * dist);
        this.targetLookAt.set(playerX + fwdX * 12, 1.5, playerZ + fwdZ * 12);
        break;
      }
      case 'cinematic_side': {
        const sideOffset = 4.2;
        const rearOffset = 2.0;
        this.targetCamPos.set(
          playerX + rightX * sideOffset - fwdX * rearOffset,
          1.25,
          playerZ + rightZ * sideOffset - fwdZ * rearOffset
        );
        this.targetLookAt.set(playerX + fwdX * 5, 1.1, playerZ + fwdZ * 5);
        break;
      }
      case 'first_person': {
        this.targetCamPos.set(playerX + fwdX * 0.25, 1.22, playerZ + fwdZ * 0.25);
        this.targetLookAt.set(playerX + fwdX * 15, 1.15, playerZ + fwdZ * 15);
        break;
      }
      case 'top_down': {
        this.targetCamPos.set(playerX - fwdX * 4, 26, playerZ - fwdZ * 4);
        this.targetLookAt.set(playerX + fwdX * 6, 0, playerZ + fwdZ * 6);
        break;
      }
      case 'photo_mode': {
        this.photoOrbitAngle += delta * 0.35;
        this.targetCamPos.set(
          playerX + Math.sin(this.photoOrbitAngle) * this.photoDistance,
          this.photoHeight,
          playerZ + Math.cos(this.photoOrbitAngle) * this.photoDistance
        );
        this.targetLookAt.set(playerX, 1.1, playerZ);
        break;
      }
    }

    // Direct Rear Follow: low_chase locks directly behind CNG for responsive forward driving
    const dampRate = this.mode === 'first_person' ? 24 : this.mode === 'low_chase' ? 18 : 9;
    this.currentCamPos.x = THREE.MathUtils.damp(this.currentCamPos.x, this.targetCamPos.x, dampRate, delta);
    this.currentCamPos.y = THREE.MathUtils.damp(this.currentCamPos.y, this.targetCamPos.y, dampRate, delta);
    this.currentCamPos.z = THREE.MathUtils.damp(this.currentCamPos.z, this.targetCamPos.z, dampRate, delta);

    this.currentLookAt.x = THREE.MathUtils.damp(this.currentLookAt.x, this.targetLookAt.x, dampRate, delta);
    this.currentLookAt.y = THREE.MathUtils.damp(this.currentLookAt.y, this.targetLookAt.y, dampRate, delta);
    this.currentLookAt.z = THREE.MathUtils.damp(this.currentLookAt.z, this.targetLookAt.z, dampRate, delta);

    const shakeY = (Math.random() - 0.5) * this.bumpShake * 0.45;
    const shakeX = (Math.random() - 0.5) * this.bumpShake * 0.3;

    this.camera.position.set(
      this.currentCamPos.x + shakeX,
      this.currentCamPos.y + shakeY,
      this.currentCamPos.z
    );

    this.camera.lookAt(this.currentLookAt);

    if (this.mode === 'low_chase' || this.mode === 'cinematic_side') {
      this.camera.rotation.z += rollAngle * 0.25;
    }
  }
}
