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

        this.scene =
            game.scene;

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

    // =====================================================
    // MATERIALS
    // =====================================================

    createMaterials() {

        this.materials = {

            honey:
                new THREE.MeshStandardMaterial({
                    color: 0xffc12b,
                    roughness: 0.45,
                    metalness: 0.08
                }),

            darkHoney:
                new THREE.MeshStandardMaterial({
                    color: 0xb8750e,
                    roughness: 0.55
                }),

            black:
                new THREE.MeshStandardMaterial({
                    color: 0x17130b,
                    roughness: 0.32,
                    metalness: 0.65
                }),

            metal:
                new THREE.MeshStandardMaterial({
                    color: 0x5d554a,
                    roughness: 0.35,
                    metalness: 0.85
                }),

            glow:
                new THREE.MeshStandardMaterial({
                    color: 0xffd45a,
                    emissive: 0xffa800,
                    emissiveIntensity: 2.5,
                    roughness: 0.25,
                    metalness: 0.1
                }),

            floor:
                new THREE.MeshStandardMaterial({
                    color: 0x3c2410,
                    roughness: 0.82,
                    metalness: 0.12
                }),

            centralFloor:
                new THREE.MeshStandardMaterial({
                    color: 0x50300f,
                    roughness: 0.7,
                    metalness: 0.2
                }),

            ceiling:
                new THREE.MeshStandardMaterial({
                    color: 0x100b08,
                    roughness: 0.92,
                    metalness: 0.08
                }),

            wall:
                new THREE.MeshStandardMaterial({
                    color: 0x5a3615,
                    roughness: 0.68,
                    metalness: 0.15
                }),

            darkWall:
                new THREE.MeshStandardMaterial({
                    color: 0x20150d,
                    roughness: 0.78,
                    metalness: 0.22
                }),

            corridorFloor:
                new THREE.MeshStandardMaterial({
                    color: 0x30200f,
                    roughness: 0.76,
                    metalness: 0.18
                }),

            corridorWall:
                new THREE.MeshStandardMaterial({
                    color: 0x21160f,
                    roughness: 0.78,
                    metalness: 0.2
                }),

            accent:
                new THREE.MeshStandardMaterial({
                    color: 0xffa51f,
                    emissive: 0xff7900,
                    emissiveIntensity: 1.5,
                    roughness: 0.28,
                    metalness: 0.35
                }),

            light:
                new THREE.MeshStandardMaterial({
                    color: 0xffc04a,
                    emissive: 0xff8a00,
                    emissiveIntensity: 3.5,
                    roughness: 0.18
                }),

            darkWood:
                new THREE.MeshStandardMaterial({
                    color: 0x24150b,
                    roughness: 0.94
                }),

            wood:
                new THREE.MeshStandardMaterial({
                    color: 0x684019,
                    roughness: 0.86
                }),

            machine:
                new THREE.MeshStandardMaterial({
                    color: 0x302a23,
                    roughness: 0.42,
                    metalness: 0.7
                }),

            plant:
                new THREE.MeshStandardMaterial({
                    color: 0x557c2f,
                    roughness: 0.82
                }),

            plantStem:
                new THREE.MeshStandardMaterial({
                    color: 0x35491d,
                    roughness: 0.88
                }),

            waterTank:
                new THREE.MeshStandardMaterial({
                    color: 0x30434b,
                    roughness: 0.3,
                    metalness: 0.75
                }),

            water:
                new THREE.MeshStandardMaterial({
                    color: 0x26758a,
                    emissive: 0x0b3945,
                    emissiveIntensity: 1.1,
                    roughness: 0.18,
                    metalness: 0.3
                }),

            queenPlatform:
                new THREE.MeshStandardMaterial({
                    color: 0x5a2d0d,
                    emissive: 0x3b1603,
                    emissiveIntensity: 0.7,
                    roughness: 0.45,
                    metalness: 0.35
                })
        };
    }

    // =====================================================
    // GROUND
    // =====================================================

    createGround() {

        const geometry =
            new THREE.CircleGeometry(
                75,
                64
            );

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x100b08,
                roughness: 0.95
            });

        const ground =
            new THREE.Mesh(
                geometry,
                material
            );

        ground.rotation.x =
            -Math.PI / 2;

        ground.position.y =
            -0.35;

        ground.receiveShadow = false;

        ground.name =
            "HiveGround";

        this.scene.add(ground);

        // Large outer honey ring.
        const ring =
            new THREE.Mesh(
                new THREE.RingGeometry(
                    48,
                    48.8,
                    64
                ),
                this.materials.accent
            );

        ring.rotation.x =
            -Math.PI / 2;

        ring.position.y =
            -0.32;

        this.scene.add(ring);
    }

    // =====================================================
    // ROOMS
    // =====================================================

    createRooms() {

        for (const roomData of MAP.rooms) {

            const object =
                createRoomArchitecture(
                    this.scene,
                    roomData,
                    this.materials
                );

            const room = {

                ...roomData,

                object,

                active: true
            };

            object.userData.roomId =
                room.id;

            object.userData.roomType =
                room.type;

            object.userData.roomName =
                room.name;

            this.rooms.push(room);

            this.collision.addRoom(
                room
            );
        }
    }

    // =====================================================
    // CORRIDORS
    // =====================================================

    createCorridors() {

        for (
            const corridorData
            of MAP.corridors
        ) {

            const corridor =
                createCorridor(
                    this.scene,
                    corridorData,
                    this.materials
                );

            if (!corridor) {
                continue;
            }

            corridor.id =
                corridorData.id;

            this.corridors.push(
                corridor
            );

            this.collision.addCorridor(
                corridor
            );
        }
    }

    // =====================================================
    // LIGHTING
    // =====================================================

    createLighting() {

        this.lighting =
            createHiveLighting(
                this.scene
            );
    }

    // =====================================================
    // PROPS
    // =====================================================

    decorate() {

        for (const room of this.rooms) {

            decorateRoom(
                room,
                this.materials,
                this.collision
            );
        }
    }

    // =====================================================
    // ROOM DETECTION
    // =====================================================

    getRoomAtPosition(
        x,
        z
    ) {

        for (const room of this.rooms) {

            const halfWidth =
                room.width / 2;

            const halfDepth =
                room.depth / 2;

            if (
                x >=
                    room.x - halfWidth &&

                x <=
                    room.x + halfWidth &&

                z >=
                    room.z - halfDepth &&

                z <=
                    room.z + halfDepth
            ) {

                return room;
            }
        }

        // Check corridors.
        for (
            const corridor
            of this.corridors
        ) {

            if (
                this.pointInsideCorridor(
                    x,
                    z,
                    corridor
                )
            ) {

                return {
                    id:
                        `corridor-${corridor.id}`,

                    name:
                        `${getRoom(corridor.from)?.name ?? ""} Corridor`,

                    type:
                        "corridor",

                    corridor: true
                };
            }
        }

        return null;
    }

    pointInsideCorridor(
        x,
        z,
        corridor
    ) {

        const start =
            corridor.start;

        const end =
            corridor.end;

        const dx =
            end.x - start.x;

        const dz =
            end.z - start.z;

        const lengthSquared =
            dx * dx +
            dz * dz;

        if (lengthSquared === 0) {
            return false;
        }

        let t =
            (
                (x - start.x) * dx +
                (z - start.z) * dz
            ) /
            lengthSquared;

        t =
            THREE.MathUtils.clamp(
                t,
                0,
                1
            );

        const closestX =
            start.x + dx * t;

        const closestZ =
            start.z + dz * t;

        const distance =
            Math.hypot(
                x - closestX,
                z - closestZ
            );

        return (
            distance <=
            corridor.width / 2
        );
    }

    // =====================================================
    // ACTIVE ROOMS
    // =====================================================

    getActiveRooms() {

        return this.rooms.filter(
            room =>
                room.active !== false
        );
    }

    // =====================================================
    // UPDATE
    // =====================================================

    update(delta) {

        // Future room animations can live here.
        // Keeping this method means Game.update()
        // always has a valid world update.

        for (const room of this.rooms) {

            const animations =
                room.object.userData.animations;

            if (!animations) {
                continue;
            }

            for (
                const animation
                of animations
            ) {

                if (
                    typeof animation ===
                    "function"
                ) {

                    animation(delta);
                }
            }
        }
    }
}
