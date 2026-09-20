import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import {
    createRoom
} from "./rooms.js";

import {
    createCorridor
} from "./corridors.js";

import {
    CollisionSystem
} from "./collision.js";

import {
    createHiveLighting
} from "./lighting.js";

import {
    decorateRoom
} from "./props.js";

export class World {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;

        this.rooms = [];
        this.corridors = [];

        this.createMaterials();
        this.createGround();
        this.createRooms();
        this.createCorridors();

        this.lighting =
            createHiveLighting(this.scene);

        this.decorate();

        this.collision =
            new CollisionSystem(this);
    }

    createMaterials() {
        this.materials = {

            floor: new THREE.MeshStandardMaterial({
                color: 0x24140a,
                roughness: 0.82
            }),

            centralFloor: new THREE.MeshStandardMaterial({
                color: 0x38200d,
                roughness: 0.72
            }),

            gardenFloor: new THREE.MeshStandardMaterial({
                color: 0x33230e,
                roughness: 0.78
            }),

            waterFloor: new THREE.MeshStandardMaterial({
                color: 0x182019,
                roughness: 0.7
            }),

            wall: new THREE.MeshStandardMaterial({
                color: 0x5a3213,
                roughness: 0.78
            }),

            darkWall: new THREE.MeshStandardMaterial({
                color: 0x321a0a,
                roughness: 0.9
            }),

            ceiling: new THREE.MeshStandardMaterial({
                color: 0x180b05,
                roughness: 1
            }),

            corridorFloor: new THREE.MeshStandardMaterial({
                color: 0x2d1809,
                roughness: 0.8
            }),

            corridorWall: new THREE.MeshStandardMaterial({
                color: 0x48270e,
                roughness: 0.85
            }),

            doorFrame: new THREE.MeshStandardMaterial({
                color: 0xd28a17,
                metalness: 0.25,
                roughness: 0.5
            }),

            wood: new THREE.MeshStandardMaterial({
                color: 0x75451d,
                roughness: 0.8
            }),

            darkWood: new THREE.MeshStandardMaterial({
                color: 0x301607,
                roughness: 0.9
            }),

            machine: new THREE.MeshStandardMaterial({
                color: 0x35302a,
                metalness: 0.65,
                roughness: 0.4
            }),

            metal: new THREE.MeshStandardMaterial({
                color: 0x77716a,
                metalness: 0.8,
                roughness: 0.3
            }),

            pipe: new THREE.MeshStandardMaterial({
                color: 0xc47b18,
                metalness: 0.55,
                roughness: 0.38
            }),

            plant: new THREE.MeshStandardMaterial({
                color: 0x71832d,
                roughness: 0.9
            }),

            plantStem: new THREE.MeshStandardMaterial({
                color: 0x394719,
                roughness: 0.9
            }),

            waterTank: new THREE.MeshStandardMaterial({
                color: 0x5b4a34,
                metalness: 0.3,
                roughness: 0.55
            }),

            water: new THREE.MeshStandardMaterial({
                color: 0x7cc7c3,
                emissive: 0x163d3b,
                emissiveIntensity: 0.5,
                roughness: 0.2
            }),

            queenPlatform: new THREE.MeshStandardMaterial({
                color: 0xd89519,
                metalness: 0.25,
                roughness: 0.4
            }),

            light: new THREE.MeshStandardMaterial({
                color: 0xffc34a,
                emissive: 0xff9d00,
                emissiveIntensity: 3
            })
        };
    }

    createGround() {
        const ground = new THREE.Mesh(
            new THREE.CircleGeometry(65, 64),
            new THREE.MeshStandardMaterial({
                color: 0x080403,
                roughness: 1
            })
        );

        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.08;

        ground.receiveShadow = true;

        this.scene.add(ground);

        /*
         * Outer Hive boundary.
         */
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(
                62,
                63,
                6
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffa914,
                transparent: true,
                opacity: 0.25,
                side: THREE.DoubleSide
            })
        );

        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;

        this.scene.add(ring);
    }

    createRooms() {
        const roomData = [

            {
                id: "nursery",
                name: "Nursery",
                x: 0,
                z: -28,
                radius: 9,
                wall: "wall",
                floor: "floor",
                openings: [1, 2],
                glow: 0xffb82e
            },

            {
                id: "garden",
                name: "Garden",
                x: -19,
                z: -14,
                radius: 9,
                wall: "wall",
                floor: "gardenFloor",
                openings: [0, 2, 4],
                glow: 0xd4a932
            },

            {
                id: "storage",
                name: "Storage",
                x: 19,
                z: -14,
                radius: 9,
                wall: "darkWall",
                floor: "floor",
                openings: [0, 3, 5],
                glow: 0xff9f1a
            },

            {
                id: "central",
                name: "Central Hive",
                x: 0,
                z: 0,
                radius: 12,
                wall: "wall",
                floor: "centralFloor",
                openings: [0, 1, 2, 3, 4, 5],
                glow: 0xffc02c
            },

            {
                id: "workshop",
                name: "Workshop",
                x: -20,
                z: 15,
                radius: 9,
                wall: "darkWall",
                floor: "floor",
                openings: [1, 3, 5],
                glow: 0xffa51b
            },

            {
                id: "water",
                name: "Water",
                x: 20,
                z: 15,
                radius: 9,
                wall: "wall",
                floor: "waterFloor",
                openings: [0, 2, 4],
                glow: 0xffc23a
            },

            {
                id: "queen",
                name: "Queen Chamber",
                x: 0,
                z: 31,
                radius: 10,
                wall: "wall",
                floor: "centralFloor",
                openings: [1, 4],
                glow: 0xffd34f
            }
        ];

        for (const data of roomData) {
            const room = createRoom(
                this.scene,
                data,
                this.materials
            );

            this.rooms.push(room);
        }
    }

    createCorridors() {
        const byId = id =>
            this.rooms.find(room => room.id === id);

        const connections = [

            ["nursery", "garden"],
            ["nursery", "storage"],

            ["garden", "central"],
            ["storage", "central"],

            ["garden", "workshop"],
            ["storage", "water"],

            ["workshop", "water"],

            ["workshop", "queen"],
            ["water", "queen"],

            ["central", "workshop"],
            ["central", "water"]
        ];

        for (const [aId, bId] of connections) {
            const a = byId(aId);
            const b = byId(bId);

            const corridor = createCorridor(
                this.scene,
                a,
                b,
                this.materials
            );

            this.corridors.push(corridor);
        }
    }

    decorate() {
        for (const room of this.rooms) {
            decorateRoom(
                room,
                this.materials
                this.collision
            );
        }
    }

    update(delta) {
        /*
         * Subtle breathing/pulsing of the Hive lights.
         */
        const time = performance.now() * 0.001;

        for (const room of this.rooms) {
            const pulse =
                0.14 +
                Math.sin(time * 2 + room.x) * 0.025;

            room.glow.material.opacity = pulse;
        }
    }

    getRoomAt(x, z) {
        let nearest = null;
        let nearestDistance = Infinity;

        for (const room of this.rooms) {
            const distance = Math.hypot(
                x - room.x,
                z - room.z
            );

            if (
                distance <
                room.radius
            ) {
                if (distance < nearestDistance) {
                    nearest = room;
                    nearestDistance = distance;
                }
            }
        }

        return nearest;
    }

    getActiveRooms() {
        return this.rooms.filter(
            room => room.active
        );
    }
}
