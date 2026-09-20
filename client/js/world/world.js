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

            floor:
                new THREE.MeshStandardMaterial({
                    color: 0x3b2410,
                    roughness: 0.82,
                    metalness: 0.15
                }),

            centralFloor:
                new THREE.MeshStandardMaterial({
                    color: 0x4b2d10,
                    roughness: 0.72,
                    metalness: 0.2
                }),

            ceiling:
                new THREE.MeshStandardMaterial({
                    color: 0x100b08,
                    roughness: 0.95,
                    metalness: 0.05
                }),

            wall:
                new THREE.MeshStandardMaterial({
                    color: 0x342116,
                    roughness: 0.76,
                    metalness: 0.12
                }),

            darkWall:
                new THREE.MeshStandardMaterial({
                    color: 0x17110d,
                    roughness: 0.82,
                    metalness: 0.22
                }),

            corridorFloor:
                new THREE.MeshStandardMaterial({
                    color: 0x2c1b0d,
                    roughness: 0.75,
                    metalness: 0.18
                }),

            corridorWall:
                new THREE.MeshStandardMaterial({
                    color: 0x21160f,
                    roughness: 0.8,
                    metalness: 0.2
                }),

            accent:
                new THREE.MeshStandardMaterial({
                    color: 0xffa51f,
                    emissive: 0xff7a00,
                    emissiveIntensity: 1.4,
                    roughness: 0.3,
                    metalness: 0.35
                }),

            light:
                new THREE.MeshStandardMaterial({
                    color: 0xffc04a,
                    emissive: 0xff8a00,
                    emissiveIntensity: 3,
                    roughness: 0.2
                }),

            darkWood:
                new THREE.MeshStandardMaterial({
                    color: 0x24150b,
                    roughness: 0.95
                }),

            wood:
                new THREE.MeshStandardMaterial({
                    color: 0x684019,
                    roughness: 0.88
                }),

            machine:
                new THREE.MeshStandardMaterial({
                    color: 0x302a23,
                    roughness: 0.45,
                    metalness: 0.65
                }),

            metal:
                new THREE.MeshStandardMaterial({
                    color: 0x5d554a,
                    roughness: 0.38,
                    metalness: 0.82
                }),

            plant:
                new THREE.MeshStandardMaterial({
                    color: 0x4f6b2c,
                    roughness: 0.85
                }),

            plantStem:
                new THREE.MeshStandardMaterial({
                    color: 0x384a1c,
                    roughness: 0.9
                }),

            waterTank:
                new THREE.MeshStandardMaterial({
                    color: 0x30434b,
                    roughness: 0.32,
                    metalness: 0.72
                }),

            water:
                new THREE.MeshStandardMaterial({
                    color: 0x26758a,
                    emissive: 0x0b3945,
                    emissiveIntensity: 1,
                    roughness: 0.2,
                    metalness: 0.3
                }),

            queenPlatform:
                new THREE.MeshStandardMaterial({
                    color: 0x5a2d0d,
                    emissive: 0x3b1603,
                    emissiveIntensity: 0.7,
                    roughness: 0.5,
                    metalness: 0.3
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
