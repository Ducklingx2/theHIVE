import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import {
    createHexRoom,
    createHexOutline,
    createHexGlow
} from "./hive.js";


export class World {

    constructor(game) {

        this.game = game;

        this.group =
            new THREE.Group();

        this.rooms = [];

        this.colliders = [];

        this.time = 0;

        this.createMaterials();
        this.createFloor();
        this.createRooms();
        this.createHoneycombDecor();
    }


    createMaterials() {

        this.materials = {

            floor: new THREE.MeshStandardMaterial({
                color: 0x140b06,
                roughness: 0.92,
                metalness: 0.05
            }),

            room: new THREE.MeshStandardMaterial({
                color: 0x261308,
                roughness: 0.78,
                metalness: 0.08
            }),

            roomInner: new THREE.MeshStandardMaterial({
                color: 0x3b1d0a,
                roughness: 0.7,
                metalness: 0.05
            }),

            wall: new THREE.MeshStandardMaterial({
                color: 0x6b350b,
                roughness: 0.62,
                metalness: 0.15
            }),

            gold: new THREE.MeshStandardMaterial({
                color: 0xf4a51c,
                emissive: 0x8c4b00,
                emissiveIntensity: 1.5,
                roughness: 0.38,
                metalness: 0.35
            }),

            darkGold: new THREE.MeshStandardMaterial({
                color: 0x7d430b,
                emissive: 0x301500,
                emissiveIntensity: 0.5,
                roughness: 0.6
            })
        };
    }


    createFloor() {

        const geometry =
            new THREE.CircleGeometry(
                75,
                64
            );

        const floor =
            new THREE.Mesh(
                geometry,
                this.materials.floor
            );

        floor.rotation.x =
            -Math.PI / 2;

        floor.receiveShadow = true;

        this.group.add(floor);


        // Large honeycomb floor cells

        for (
            let x = -60;
            x <= 60;
            x += 8.5
        ) {

            for (
                let z = -60;
                z <= 60;
                z += 7.4
            ) {

                const offset =
                    Math.round(
                        (z + 60) / 7.4
                    ) % 2 === 0
                        ? 0
                        : 4.25;

                const cell =
                    createHexGlow(
                        3.8,
                        0x7b3e08
                    );

                cell.position.set(
                    x + offset,
                    0.015,
                    z
                );

                cell.material.opacity = 0.06;

                this.group.add(cell);
            }
        }
    }


    createRooms() {

        const roomData = [

            {
                name: "NURSERY",
                x: 0,
                z: -27,
                radius: 9,
                active: false
            },

            {
                name: "GARDEN",
                x: -18,
                z: -13,
                radius: 9,
                active: true
            },

            {
                name: "STORAGE",
                x: 18,
                z: -13,
                radius: 9,
                active: false
            },

            {
                name: "CENTRAL HIVE",
                x: 0,
                z: 0,
                radius: 11,
                active: true
            },

            {
                name: "WORKSHOP",
                x: -18,
                z: 13,
                radius: 9,
                active: false
            },

            {
                name: "WATER",
                x: 18,
                z: 13,
                radius: 9,
                active: false
            },

            {
                name: "QUEEN CHAMBER",
                x: 0,
                z: 27,
                radius: 9,
                active: false
            }
        ];


        for (const data of roomData) {

            this.createRoom(data);
        }
    }


    createRoom(data) {

        const room =
            new THREE.Group();

        room.position.set(
            data.x,
            0,
            data.z
        );


        // Main chamber floor

        const floor =
            createHexRoom(
                data.radius,
                0.5,
                data.active
                    ? this.materials.roomInner
                    : this.materials.room
            );

        floor.position.y = 0;

        room.add(floor);


        // Hex outline

        const outline =
            createHexOutline(
                data.radius,
                0.52,
                data.active
                    ? 0xffc247
                    : 0x70400e
            );

        outline.position.y =
            0.3;

        room.add(outline);


        // Active glow

        if (data.active) {

            const glow =
                createHexGlow(
                    data.radius * 0.88,
                    0xffa51c
                );

            glow.position.y =
                0.3;

            glow.material.opacity =
                0.15;

            room.add(glow);

            room.userData.glow =
                glow;
        }


        // Room label

        const label =
            this.createRoomLabel(
                data.name,
                data.active
            );

        label.position.set(
            0,
            0.65,
            0
        );

        room.add(label);


        // Room metadata

        room.userData.name =
            data.name;

        room.userData.active =
            data.active;

        room.userData.radius =
            data.radius;

        room.userData.x =
            data.x;

        room.userData.z =
            data.z;


        this.group.add(room);

        this.rooms.push(room);
    }


    createRoomLabel(
        text,
        active
    ) {

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width = 512;
        canvas.height = 128;

        const context =
            canvas.getContext("2d");

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.font =
            "bold 32px Arial";

        context.textAlign =
            "center";

        context.textBaseline =
            "middle";

        context.fillStyle =
            active
                ? "#ffd166"
                : "#a66b25";

        context.fillText(
            text,
            256,
            64
        );


        const texture =
            new THREE.CanvasTexture(
                canvas
            );

        texture.colorSpace =
            THREE.SRGBColorSpace;


        const material =
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthWrite: false
            });


        const sprite =
            new THREE.Sprite(
                material
            );

        sprite.scale.set(
            7,
            1.75,
            1
        );

        return sprite;
    }


    createHoneycombDecor() {

        const positions = [

            [-32, -27],
            [32, -27],

            [-34, 0],
            [34, 0],

            [-32, 27],
            [32, 27],

            [-45, -14],
            [45, -14],

            [-45, 14],
            [45, 14]
        ];


        for (const [x, z] of positions) {

            const cell =
                createHexGlow(
                    4.2,
                    0xff9e18
                );

            cell.position.set(
                x,
                0.1,
                z
            );

            cell.material.opacity =
                0.08;

            this.group.add(cell);
        }
    }


    update(delta) {

        this.time += delta;


        for (const room of this.rooms) {

            if (
                room.userData.active &&
                room.userData.glow
            ) {

                const pulse =
                    0.12 +
                    Math.sin(
                        this.time * 2.5
                    ) * 0.05;

                room.userData.glow
                    .material
                    .opacity = pulse;
            }
        }
    }


    getActiveRooms() {

        return this.rooms.filter(
            room =>
                room.userData.active
        );
    }


    getRoomAt(
        x,
        z
    ) {

        let closest = null;
        let closestDistance = Infinity;

        for (const room of this.rooms) {

            const dx =
                x - room.userData.x;

            const dz =
                z - room.userData.z;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dz * dz
                );

            if (
                distance <
                room.userData.radius &&
                distance <
                closestDistance
            ) {

                closest =
                    room;

                closestDistance =
                    distance;
            }
        }

        return closest;
    }
}
