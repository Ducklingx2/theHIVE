import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { CollisionSystem } from "./collision.js";
import { createHiveLighting } from "./lighting.js";
import { decorateRoom } from "./props.js";

import {
    MAP,
    getRoom
} from "./map.js";

import {
    createRoomArchitecture
} from "./architecture.js";

import {
    createCorridor
} from "./corridors.js";

export class World {

    constructor(game) {

        this.game = game;

        this.scene = game.scene;

        this.rooms = [];
        this.corridors = [];

        this.createMaterials();

        this.collision =
            new CollisionSystem();

        this.createGround();

        this.createRooms();

        this.createCorridors();

        this.createLighting();

        this.decorate();
    }

createMaterials() {

    this.materials = {

        // =====================================================
        // HIVE CORE
        // =====================================================

        honey: new THREE.MeshStandardMaterial({
            color: 0xffc12b,
            roughness: 0.48,
            metalness: 0.05
        }),

        darkHoney: new THREE.MeshStandardMaterial({
            color: 0xb87912,
            roughness: 0.55,
            metalness: 0.08
        }),

        black: new THREE.MeshStandardMaterial({
            color: 0x17130b,
            roughness: 0.32,
            metalness: 0.65
        }),

        blackSoft: new THREE.MeshStandardMaterial({
            color: 0x29241b,
            roughness: 0.42,
            metalness: 0.5
        }),

        // =====================================================
        // ARCHITECTURE
        // =====================================================

        floor: new THREE.MeshStandardMaterial({
            color: 0xe2a91f,
            roughness: 0.58,
            metalness: 0.12
        }),

        centralFloor: new THREE.MeshStandardMaterial({
            color: 0xf2bd2d,
            roughness: 0.48,
            metalness: 0.16
        }),

        ceiling: new THREE.MeshStandardMaterial({
            color: 0x18140e,
            roughness: 0.7,
            metalness: 0.25
        }),

        wall: new THREE.MeshStandardMaterial({
            color: 0xf0b928,
            roughness: 0.5,
            metalness: 0.12
        }),

        darkWall: new THREE.MeshStandardMaterial({
            color: 0x17130b,
            roughness: 0.45,
            metalness: 0.55
        }),

        corridorFloor: new THREE.MeshStandardMaterial({
            color: 0xc88d16,
            roughness: 0.58,
            metalness: 0.18
        }),

        corridorWall: new THREE.MeshStandardMaterial({
            color: 0xe2a91f,
            roughness: 0.5,
            metalness: 0.12
        }),

        // =====================================================
        // ACCENTS / LIGHTS
        // =====================================================

        accent: new THREE.MeshStandardMaterial({
            color: 0xffb51b,
            emissive: 0xff7a00,
            emissiveIntensity: 1.5,
            roughness: 0.3,
            metalness: 0.25
        }),

        light: new THREE.MeshStandardMaterial({
            color: 0xffe18a,
            emissive: 0xffb21c,
            emissiveIntensity: 3.5,
            roughness: 0.18,
            metalness: 0.1
        }),

        glow: new THREE.MeshStandardMaterial({
            color: 0xffd45a,
            emissive: 0xffa800,
            emissiveIntensity: 2.2,
            roughness: 0.3,
            metalness: 0.05
        }),

        // =====================================================
        // MATERIALS / PROPS
        // =====================================================

        darkWood: new THREE.MeshStandardMaterial({
            color: 0x24180b,
            roughness: 0.85
        }),

        wood: new THREE.MeshStandardMaterial({
            color: 0x8a591c,
            roughness: 0.72
        }),

        machine: new THREE.MeshStandardMaterial({
            color: 0x24221d,
            roughness: 0.38,
            metalness: 0.78
        }),

        metal: new THREE.MeshStandardMaterial({
            color: 0x68635a,
            roughness: 0.28,
            metalness: 0.9
        }),

        metalDark: new THREE.MeshStandardMaterial({
            color: 0x302e29,
            roughness: 0.3,
            metalness: 0.85
        }),

        // =====================================================
        // NATURE
        // =====================================================

        plant: new THREE.MeshStandardMaterial({
            color: 0x628d36,
            roughness: 0.72
        }),

        plantStem: new THREE.MeshStandardMaterial({
            color: 0x3b5420,
            roughness: 0.8
        }),

        // =====================================================
        // WATER
        // =====================================================

        waterTank: new THREE.MeshStandardMaterial({
            color: 0x3f4946,
            roughness: 0.28,
            metalness: 0.82
        }),

        water: new THREE.MeshStandardMaterial({
            color: 0x54a8ad,
            emissive: 0x164c4f,
            emissiveIntensity: 1.1,
            roughness: 0.15,
            metalness: 0.35
        }),

        // =====================================================
        // QUEEN
        // =====================================================

        queenPlatform: new THREE.MeshStandardMaterial({
            color: 0xffc52f,
            emissive: 0x7d4100,
            emissiveIntensity: 0.65,
            roughness: 0.38,
            metalness: 0.25
        })
    };
}
    
    createGround() {

        const groundMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x080604,
                roughness: 1
            });

        const ground =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    65,
                    64
                ),
                groundMaterial
            );

        ground.rotation.x =
            -Math.PI / 2;

        ground.position.y = -0.4;

        ground.name = "HiveGround";

        this.scene.add(ground);
    }

    createRooms() {

        for (const roomData of MAP.rooms) {

            const room =
                createRoomArchitecture(
                    this.scene,
                    roomData,
                    this.materials
                );

            room.userData.roomId =
                roomData.id;

            room.userData.roomName =
                roomData.name;

            this.rooms.push({
                ...roomData,
                object: room
            });

            this.collision.addRoom({
                ...roomData,
                object: room
            });
        }
    }

    createCorridors() {

        for (const data of MAP.corridors) {

            const from =
                getRoom(data.from);

            const to =
                getRoom(data.to);

            if (!from || !to) {
                console.warn(
                    "Invalid corridor:",
                    data
                );

                continue;
            }

            const corridor =
                createCorridor(
                    this.scene,
                    from,
                    to,
                    data.width,
                    this.materials
                );

            corridor.from = data.from;
            corridor.to = data.to;

            this.corridors.push(
                corridor
            );

            this.collision.addCorridor(
                corridor
            );
        }
    }

    decorate() {

        for (const room of this.rooms) {

            decorateRoom(
                room,
                this.materials,
                this.collision
            );
        }
    }

    createLighting() {

        this.lighting =
            createHiveLighting(
                this.scene
            );
    }

    getRoomAtPosition(x, z) {

        for (const room of this.rooms) {

            const halfWidth =
                room.width / 2;

            const halfDepth =
                room.depth / 2;

            if (
                x >= room.x - halfWidth &&
                x <= room.x + halfWidth &&
                z >= room.z - halfDepth &&
                z <= room.z + halfDepth
            ) {
                return room;
            }
        }

        return null;
    }

    getActiveRooms() {
    // For now, every constructed room is considered active.
    // The phase/sabotage system can later change this dynamically.
    return this.rooms;
    }

    update(delta) {
    // World-level animation/update hook.
    // Props and environmental animations can be added here later.
    }
}
