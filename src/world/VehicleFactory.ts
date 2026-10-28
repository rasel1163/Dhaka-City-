/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CanvasTextureFactory } from '../textures/CanvasTextureFactory';

export class VehicleFactory {
  // --- PLAYER & TRAFFIC CNG AUTO RICKSHAW ---
  public static createCNGRickshaw(isDeluxe: boolean = false): THREE.Group {
    const group = new THREE.Group();
    group.name = 'CNG_Rickshaw';

    const greenPaint = isDeluxe ? 0x094d2a : 0x0f5b33;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: greenPaint,
      roughness: 0.35,
      metalness: 0.15,
    });
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x1b281f,
      roughness: 0.85,
      metalness: 0.05,
    });
    const blackRubber = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.2,
      metalness: 0.9,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xddeeff,
      transmission: 0.85,
      opacity: 0.6,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
    });

    // 1. Lower Chassis & Floor Plate
    const floorGeo = new THREE.BoxGeometry(1.3, 0.12, 2.3);
    const floorMesh = new THREE.Mesh(floorGeo, bodyMat);
    floorMesh.position.y = 0.35;
    floorMesh.castShadow = true;
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // 2. Cabin Lower Half
    const cabinLowerGeo = new THREE.BoxGeometry(1.28, 0.55, 1.45);
    const cabinLower = new THREE.Mesh(cabinLowerGeo, bodyMat);
    cabinLower.position.set(0, 0.65, -0.3);
    cabinLower.castShadow = true;
    group.add(cabinLower);

    // Side Decal Stripe
    const stripeTex = CanvasTextureFactory.getCNGSideStripe();
    const stripeMat = new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.4 });
    const sidePlateGeo = new THREE.PlaneGeometry(1.4, 0.25);
    const sidePlateL = new THREE.Mesh(sidePlateGeo, stripeMat);
    sidePlateL.position.set(-0.645, 0.65, -0.3);
    sidePlateL.rotation.y = -Math.PI / 2;
    group.add(sidePlateL);

    const sidePlateR = new THREE.Mesh(sidePlateGeo, stripeMat);
    sidePlateR.position.set(0.645, 0.65, -0.3);
    sidePlateR.rotation.y = Math.PI / 2;
    group.add(sidePlateR);

    // 3. Front Nose
    const noseGeo = new THREE.BoxGeometry(0.85, 0.6, 0.85);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.65, 0.75);
    nose.castShadow = true;
    group.add(nose);

    // Front mudguard
    const mudguardGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.26, 12, 1, false, 0, Math.PI);
    const mudguard = new THREE.Mesh(mudguardGeo, bodyMat);
    mudguard.rotation.z = Math.PI / 2;
    mudguard.position.set(0, 0.36, 1.05);
    group.add(mudguard);

    // 4. Fabric Hood
    const hoodGeo = new THREE.BoxGeometry(1.3, 0.75, 1.6);
    const hood = new THREE.Mesh(hoodGeo, canopyMat);
    hood.position.set(0, 1.25, -0.35);
    hood.castShadow = true;
    group.add(hood);

    const frontRoofGeo = new THREE.BoxGeometry(1.1, 0.1, 0.85);
    const frontRoof = new THREE.Mesh(frontRoofGeo, canopyMat);
    frontRoof.position.set(0, 1.5, 0.65);
    frontRoof.rotation.x = 0.22;
    group.add(frontRoof);

    // 5. Rear Back Art Panel
    const rearArtTex = CanvasTextureFactory.getCNGHoodBackTexture();
    const rearArtMat = new THREE.MeshStandardMaterial({ map: rearArtTex, roughness: 0.5 });
    const rearArtGeo = new THREE.PlaneGeometry(1.26, 1.05);
    const rearArtMesh = new THREE.Mesh(rearArtGeo, rearArtMat);
    rearArtMesh.position.set(0, 1.02, -1.16);
    rearArtMesh.rotation.y = Math.PI;
    group.add(rearArtMesh);

    // 6. Mesh (Jali)
    const meshTex = CanvasTextureFactory.getDiamondMeshTexture();
    meshTex.repeat.set(3, 2);
    const meshMat = new THREE.MeshStandardMaterial({
      map: meshTex,
      transparent: true,
      roughness: 0.4,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });
    const jaliGeo = new THREE.PlaneGeometry(1.35, 0.5);
    const jaliL = new THREE.Mesh(jaliGeo, meshMat);
    jaliL.position.set(-0.648, 1.15, -0.3);
    jaliL.rotation.y = -Math.PI / 2;
    const jaliR = new THREE.Mesh(jaliGeo, meshMat);
    jaliR.position.set(0.648, 1.15, -0.3);
    jaliR.rotation.y = Math.PI / 2;
    group.add(jaliL, jaliR);

    // 7. Windshield
    const windshieldFrameGeo = new THREE.BoxGeometry(0.88, 0.55, 0.05);
    const windshield = new THREE.Mesh(windshieldFrameGeo, glassMat);
    windshield.position.set(0, 1.2, 0.95);
    windshield.rotation.x = -0.15;
    group.add(windshield);

    // 8. Handlebar & Seats
    const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8), chromeMat);
    handlebar.rotation.z = Math.PI / 2;
    handlebar.position.set(0, 0.9, 0.72);
    group.add(handlebar);

    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.8 });
    const driverSeat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.4), seatMat);
    driverSeat.position.set(0, 0.55, 0.35);
    const passengerSeat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.2, 0.45), seatMat);
    passengerSeat.position.set(0, 0.6, -0.7);
    group.add(driverSeat, passengerSeat);

    // 9. Wheels
    const wheelGroup = new THREE.Group();
    wheelGroup.name = 'wheels';
    const tyreGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 16);
    const rimGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.15, 12);

    const makeWheel = (x: number, y: number, z: number) => {
      const w = new THREE.Group();
      const tyre = new THREE.Mesh(tyreGeo, blackRubber);
      tyre.rotation.z = Math.PI / 2;
      tyre.castShadow = true;
      w.add(tyre);
      const rim = new THREE.Mesh(rimGeo, chromeMat);
      rim.rotation.z = Math.PI / 2;
      w.add(rim);
      w.position.set(x, y, z);
      return w;
    };

    wheelGroup.add(
      makeWheel(0, 0.24, 1.05),
      makeWheel(-0.62, 0.24, -0.65),
      makeWheel(0.62, 0.24, -0.65)
    );
    group.add(wheelGroup);

    // Bumper guard & lights
    const rearBumper = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.025, 8, 16, Math.PI), chromeMat);
    rearBumper.rotation.x = Math.PI / 2;
    rearBumper.position.set(0, 0.35, -1.18);
    group.add(rearBumper);

    const headlightMat = new THREE.MeshStandardMaterial({ color: 0xfffaed, emissive: 0xfffaed, emissiveIntensity: 0.9 });
    const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 12), headlightMat);
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 0.72, 1.18);
    group.add(headlight);

    // Contact shadow
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 2.5),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    group.add(shadowMesh);

    return group;
  }

  // --- EASY-BIKE (BATTERY RICKSHAW) ---
  public static createEasyBike(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Easy_Bike';

    const blueCanopyMat = new THREE.MeshStandardMaterial({ color: 0x0077b6, roughness: 0.7 });
    const greenBodyMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.4 });
    const yellowStripeMat = new THREE.MeshStandardMaterial({ color: 0xffea00, roughness: 0.3 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.85, roughness: 0.2 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x023e8a, roughness: 0.8 });
    const tyreMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 2.1), greenBodyMat);
    base.position.set(0, 0.42, 0);
    base.castShadow = true;
    group.add(base);

    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.15, 0.45), seatMat);
    bench1.position.set(0, 0.68, -0.65);
    const bench2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.15, 0.45), seatMat);
    bench2.position.set(0, 0.68, 0.15);
    group.add(bench1, bench2);

    const pillarPositions = [
      [-0.55, 0.95], [0.55, 0.95],
      [-0.55, -0.95], [0.55, -0.95],
      [-0.55, 0], [0.55, 0]
    ];
    pillarPositions.forEach(([px, pz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.2, 8), steelMat);
      p.position.set(px, 1.1, pz);
      group.add(p);
    });

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.15, 2.3), blueCanopyMat);
    roof.position.set(0, 1.72, 0);
    roof.castShadow = true;
    group.add(roof);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.05, 2.33), yellowStripeMat);
    trim.position.set(0, 1.67, 0);
    group.add(trim);

    const spear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.4, 8), steelMat);
    spear.position.set(0, 1.95, 0.5);
    group.add(spear);

    const wheels = new THREE.Group();
    wheels.name = 'wheels';
    const makeW = (x: number, y: number, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 16), tyreMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, y, z);
      w.castShadow = true;
      return w;
    };
    wheels.add(makeW(0, 0.26, 1.0), makeW(-0.6, 0.26, -0.7), makeW(0.6, 0.26, -0.7));
    group.add(wheels);

    return group;
  }

  // --- BLACK TOYOTA MINIVAN (NOAH TYPE) ---
  public static createBlackMinivan(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Minivan_Noah';

    const blackPaint = new THREE.MeshStandardMaterial({ color: 0x111315, roughness: 0.25, metalness: 0.6 });
    const tintedGlass = new THREE.MeshPhysicalMaterial({ color: 0x0a1017, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.92 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.9 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });

    // Lower Van Body
    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 4.8), blackPaint);
    lower.position.set(0, 0.7, 0);
    lower.castShadow = true;
    group.add(lower);

    // Upper Cabin & Tinted Windows
    const upper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 3.2), tintedGlass);
    upper.position.set(0, 1.5, -0.4);
    group.add(upper);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.12, 3.3), blackPaint);
    roof.position.set(0, 1.95, -0.4);
    group.add(roof);

    // Front Windshield & Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 1.1), blackPaint);
    hood.position.set(0, 1.0, 1.8);
    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.8, 0.05), tintedGlass);
    frontGlass.position.set(0, 1.5, 1.25);
    frontGlass.rotation.x = -0.3;
    group.add(hood, frontGlass);

    // Chrome Grille & Headlights
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.05), chromeMat);
    grille.position.set(0, 0.75, 2.42);
    group.add(grille);

    // 4 Wheels
    const wheels = new THREE.Group();
    wheels.name = 'wheels';
    const makeW = (x: number, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.35, z);
      w.castShadow = true;
      return w;
    };
    wheels.add(makeW(-0.95, 1.4), makeW(0.95, 1.4), makeW(-0.95, -1.4), makeW(0.95, -1.4));
    group.add(wheels);

    return group;
  }

  // --- SILVER HYBRID HATCHBACK ---
  public static createSilverHatchback(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Car_SilverHatchback';

    const silverMat = new THREE.MeshStandardMaterial({ color: 0xced4da, roughness: 0.2, metalness: 0.75 });
    const tintedGlass = new THREE.MeshPhysicalMaterial({ color: 0x112233, roughness: 0.05, transparent: true, opacity: 0.85 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c });

    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 4.2), silverMat);
    lower.position.set(0, 0.55, 0);
    lower.castShadow = true;

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.68, 2.4), tintedGlass);
    cabin.position.set(0, 1.15, -0.2);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 2.4), silverMat);
    roof.position.set(0, 1.5, -0.2);

    group.add(lower, cabin, roof);

    const wheels = new THREE.Group();
    wheels.name = 'wheels';
    const makeW = (x: number, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 14), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.32, z);
      return w;
    };
    wheels.add(makeW(-0.85, 1.2), makeW(0.85, 1.2), makeW(-0.85, -1.2), makeW(0.85, -1.2));
    group.add(wheels);

    return group;
  }

  // --- WHITE MICROBUS (HIACE STYLE, REAR DOORS OPEN) ---
  public static createWhiteMicrobus(rearDoorOpen: boolean = false): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Microbus_White';

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.3, metalness: 0.2 });
    const tintedGlass = new THREE.MeshPhysicalMaterial({ color: 0x001d3d, roughness: 0.1, transparent: true, opacity: 0.88 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c });

    // Main Boxy Microbus Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.85, 4.9), whiteMat);
    body.position.set(0, 1.25, 0);
    body.castShadow = true;
    group.add(body);

    // Continuous Side Windows
    const winGeo = new THREE.BoxGeometry(0.06, 0.65, 3.8);
    const winL = new THREE.Mesh(winGeo, tintedGlass);
    winL.position.set(-0.99, 1.45, -0.2);
    const winR = new THREE.Mesh(winGeo, tintedGlass);
    winR.position.set(0.99, 1.45, -0.2);
    group.add(winL, winR);

    // Front Windshield
    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.75, 0.05), tintedGlass);
    frontGlass.position.set(0, 1.45, 2.46);
    group.add(frontGlass);

    // Rear Doors open if requested (as in Shahbagh Street View image!)
    if (rearDoorOpen) {
      const doorLeafMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa });
      const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.9), doorLeafMat);
      doorL.position.set(-0.95, 1.2, -2.9);
      doorL.rotation.y = 0.85;
      group.add(doorL);

      // Person standing at rear of microbus
      const person = new THREE.Group();
      person.position.set(0.3, 0, -3.1);
      const pBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x1d3557 }));
      pBody.position.y = 0.8;
      const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0x8d5b4c }));
      pHead.position.y = 1.35;
      person.add(pBody, pHead);
      group.add(person);
    }

    const wheels = new THREE.Group();
    wheels.name = 'wheels';
    const makeW = (x: number, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 14), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.36, z);
      return w;
    };
    wheels.add(makeW(-0.95, 1.5), makeW(0.95, 1.5), makeW(-0.95, -1.5), makeW(0.95, -1.5));
    group.add(wheels);

    return group;
  }

  // --- BLUE SMALL CARGO TRUCK / PICKUP WITH OPEN BACK ---
  public static createBlueCargoPickup(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Cargo_Pickup_Blue';

    const blueCabMat = new THREE.MeshStandardMaterial({ color: 0x0077b6, roughness: 0.4 });
    const woodBedMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 });
    const tintedGlass = new THREE.MeshPhysicalMaterial({ color: 0x112233, transparent: true, opacity: 0.8 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c });

    // Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.4, 1.6), blueCabMat);
    cab.position.set(0, 1.1, 1.4);
    cab.castShadow = true;
    group.add(cab);

    const win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.05), tintedGlass);
    win.position.set(0, 1.35, 2.21);
    group.add(win);

    // Open cargo bed
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.15, 2.6), woodBedMat);
    bedFloor.position.set(0, 0.65, -0.7);
    bedFloor.castShadow = true;

    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 2.6), blueCabMat);
    sideL.position.set(-0.92, 0.95, -0.7);
    const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 2.6), blueCabMat);
    sideR.position.set(0.92, 0.95, -0.7);
    group.add(bedFloor, sideL, sideR);

    // Wheels
    const wheels = new THREE.Group();
    wheels.name = 'wheels';
    const makeW = (x: number, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 14), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.38, z);
      return w;
    };
    wheels.add(makeW(-0.92, 1.3), makeW(0.92, 1.3), makeW(-0.92, -1.2), makeW(0.92, -1.2));
    group.add(wheels);

    return group;
  }

  // --- MOTORBIKE WITH ORANGE-VEST DELIVERY RIDER ---
  public static createDeliveryMotorbike(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Delivery_Motorbike';

    const bikeMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.3 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const vestMat = new THREE.MeshStandardMaterial({ color: 0xfb8500 }); // High-vis orange vest
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2 });
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x2ec4b6 });

    // Bike Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 1.4), bikeMat);
    frame.position.set(0, 0.5, 0);
    group.add(frame);

    // Wheels
    const makeW = (z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 14), rubberMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(0, 0.28, z);
      return w;
    };
    group.add(makeW(0.65), makeW(-0.65));

    // Rider with Orange Vest
    const rider = new THREE.Group();
    rider.position.set(0, 0.65, 0.05);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.55, 8), vestMat);
    torso.position.y = 0.45;
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), helmetMat);
    helmet.position.y = 0.85;

    // Food/Delivery box on back
    const deliveryBag = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), bagMat);
    deliveryBag.position.set(0, 0.45, -0.42);

    rider.add(torso, helmet, deliveryBag);
    group.add(rider);

    return group;
  }

  // --- BRTC BUS, COACHES & AMBIENT MODELS (RETAINED) ---
  public static createBRTCBus(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'BRTC_Bus';
    const redMat = new THREE.MeshStandardMaterial({ color: 0xd00000, roughness: 0.4, metalness: 0.2 });
    const darkGlass = new THREE.MeshPhysicalMaterial({ color: 0x112233, roughness: 0.1, metalness: 0.7, transparent: true, opacity: 0.85 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 9.2), redMat);
    body.position.set(0, 1.7, 0);
    body.castShadow = true;
    group.add(body);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 0.08), darkGlass);
    windshield.position.set(0, 2.05, 4.61);
    group.add(windshield);

    const busTex = CanvasTextureFactory.getBRTCBusTexture();
    const busTexMat = new THREE.MeshStandardMaterial({ map: busTex, roughness: 0.4 });
    const liveryPlaneGeo = new THREE.PlaneGeometry(8.5, 1.8);
    const liveryL = new THREE.Mesh(liveryPlaneGeo, busTexMat);
    liveryL.position.set(-1.22, 1.4, 0);
    liveryL.rotation.y = -Math.PI / 2;
    const liveryR = new THREE.Mesh(liveryPlaneGeo, busTexMat);
    liveryR.position.set(1.22, 1.4, 0);
    liveryR.rotation.y = Math.PI / 2;
    group.add(liveryL, liveryR);

    const wheels = new THREE.Group();
    wheels.name = 'wheels';
    const makeBusWheel = (x: number, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.28, 16), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.45, z);
      return w;
    };
    wheels.add(
      makeBusWheel(-1.15, 2.8), makeBusWheel(1.15, 2.8),
      makeBusWheel(-1.15, -2.6), makeBusWheel(1.15, -2.6),
      makeBusWheel(-1.15, -3.4), makeBusWheel(1.15, -3.4)
    );
    group.add(wheels);
    return group;
  }

  public static createBRTCDoubleDecker(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Double_Decker_Bus';
    const redMat = new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.4 });
    const greenBandMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.4 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x1a2b3c, roughness: 0.1, transparent: true, opacity: 0.8 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });

    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 9.4), redMat);
    lowerBody.position.set(0, 1.35, 0);
    const greenBelt = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.35, 9.42), greenBandMat);
    greenBelt.position.set(0, 2.3, 0);
    const upperBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 9.4), redMat);
    upperBody.position.set(0, 3.25, 0);
    group.add(lowerBody, greenBelt, upperBody);

    const wheels = new THREE.Group();
    wheels.name = 'wheels';
    const makeBW = (x: number, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.48, z);
      return w;
    };
    wheels.add(makeBW(-1.18, 2.9), makeBW(1.18, 2.9), makeBW(-1.18, -2.8), makeBW(1.18, -2.8));
    group.add(wheels);
    return group;
  }

  public static createACCoachSagar(): THREE.Group {
    const group = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.25 });
    const tintedGlass = new THREE.MeshPhysicalMaterial({ color: 0x050f1a, roughness: 0.05, transparent: true, opacity: 0.9 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.7, 10.5), whiteMat);
    body.position.set(0, 1.85, 0);
    group.add(body);

    const liveryTex = CanvasTextureFactory.getCoachSagarTexture();
    const liveryMat = new THREE.MeshStandardMaterial({ map: liveryTex });
    const sidePlaneGeo = new THREE.PlaneGeometry(9.8, 2.1);
    const sideL = new THREE.Mesh(sidePlaneGeo, liveryMat);
    sideL.position.set(-1.26, 1.75, 0);
    sideL.rotation.y = -Math.PI / 2;
    const sideR = new THREE.Mesh(sidePlaneGeo, liveryMat);
    sideR.position.set(1.26, 1.75, 0);
    sideR.rotation.y = Math.PI / 2;
    group.add(sideL, sideR);

    const wheels = new THREE.Group();
    wheels.name = 'wheels';
    const makeW = (x: number, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.28, 16), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.48, z);
      return w;
    };
    wheels.add(makeW(-1.2, 3.3), makeW(1.2, 3.3), makeW(-1.2, -3.1), makeW(1.2, -3.1));
    group.add(wheels);
    return group;
  }

  public static createACCoachRoyal(): THREE.Group {
    const group = new THREE.Group();
    const champagneMat = new THREE.MeshStandardMaterial({ color: 0xd6cbb0, roughness: 0.2, metalness: 0.35 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.8, 10.6), champagneMat);
    body.position.set(0, 1.9, 0);
    group.add(body);

    const liveryTex = CanvasTextureFactory.getCoachRoyalTexture();
    const liveryMat = new THREE.MeshStandardMaterial({ map: liveryTex });
    const sidePlane = new THREE.PlaneGeometry(9.9, 2.2);
    const sideL = new THREE.Mesh(sidePlane, liveryMat);
    sideL.position.set(-1.26, 1.7, 0);
    sideL.rotation.y = -Math.PI / 2;
    const sideR = new THREE.Mesh(sidePlane, liveryMat);
    sideR.position.set(1.26, 1.7, 0);
    sideR.rotation.y = Math.PI / 2;
    group.add(sideL, sideR);

    const wheels = new THREE.Group();
    wheels.name = 'wheels';
    const makeW = (x: number, z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.48, z);
      return w;
    };
    wheels.add(makeW(-1.2, 3.4), makeW(1.2, 3.4), makeW(-1.2, -3.2), makeW(1.2, -3.2));
    group.add(wheels);
    return group;
  }

  public static createMetroTrain(): THREE.Group {
    const group = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xefefef, roughness: 0.2, metalness: 0.7 });
    const greenStripeMat = new THREE.MeshStandardMaterial({ color: 0x007f5f });
    for (let i = 0; i < 4; i++) {
      const coach = new THREE.Group();
      coach.position.z = i * 16.5;
      const carBody = new THREE.Mesh(new THREE.BoxGeometry(3.1, 2.6, 16.0), steelMat);
      carBody.position.y = 1.35;
      coach.add(carBody);
      const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 15.9), greenStripeMat);
      stripeL.position.set(-1.56, 1.4, 0);
      const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 15.9), greenStripeMat);
      stripeR.position.set(1.56, 1.4, 0);
      coach.add(stripeL, stripeR);
      group.add(coach);
    }
    return group;
  }

  public static createCycleRickshaw(): THREE.Group {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 1.6), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    frame.position.set(0, 0.45, 0);
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.85, 12, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x0077b6 }));
    hood.rotation.z = Math.PI / 2;
    hood.position.set(0, 1.1, -0.3);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.45), new THREE.MeshStandardMaterial({ color: 0xee9b00 }));
    seat.position.set(0, 0.65, -0.3);
    group.add(frame, hood, seat);

    const makeW = (x: number, z: number) => {
      const w = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.025, 8, 16), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      w.rotation.y = Math.PI / 2;
      w.position.set(x, 0.35, z);
      return w;
    };
    group.add(makeW(0, 0.8), makeW(-0.48, -0.4), makeW(0.48, -0.4));
    return group;
  }

  public static createMotorbike(): THREE.Group {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 1.3), new THREE.MeshStandardMaterial({ color: 0x023e8a }));
    frame.position.set(0, 0.55, 0);
    const makeWheel = (z: number) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 14), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      w.rotation.z = Math.PI / 2;
      w.position.set(0, 0.3, z);
      return w;
    };
    group.add(frame, makeWheel(0.65), makeWheel(-0.65));
    return group;
  }
}
