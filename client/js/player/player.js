import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


export class Player {

    constructor(game) {

        this.game = game;

        this.group =
            new THREE.Group();

        this.speed = 7;

        this.sprintSpeed = 11;

        this.radius = 0.65;

        this.velocity =
            new THREE.Vector3();

        this.direction =
            new THREE.Vector3();

        this.createBody();

        this.group.position.set(
            0,
            0,
            0
        );
    }


    createBody() {

        // ---------------------------------------------------------
        // BODY
        // ---------------------------------------------------------

        const bodyGeometry =
            new THREE.CylinderGeometry(
                0.55,
                0.7,
                1.2,
                6
            );

        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xf2a51c,
                emissive: 0x3b1c00,
                emissiveIntensity: 0.35,
                roughness: 0.5
            });

        const body =
            new THREE.Mesh(
                bodyGeometry,
                bodyMaterial
            );

        body.position.y =
            0.85;

        body.castShadow = true;

        this.group.add(body);


        // ---------------------------------------------------------
        // HEAD
        // ---------------------------------------------------------

        const headGeometry =
            new THREE.CylinderGeometry(
                0.55,
                0.55,
                0.55,
                6
            );

        const headMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xffc43d,
                roughness: 0.45
            });

        const head =
            new THREE.Mesh(
                headGeometry,
                headMaterial
            );

        head.position.y =
            1.7;

        head.castShadow = true;

        this.group.add(head);


        // ---------------------------------------------------------
        // VISOR
        // ---------------------------------------------------------

        const visorGeometry =
            new THREE.BoxGeometry(
                0.65,
                0.18,
                0.08
            );

        const visorMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x090604,
                emissive: 0xffa31a,
                emissiveIntensity: 0.8,
                metalness: 0.7,
                roughness: 0.2
            });

        const visor =
            new THREE.Mesh(
                visorGeometry,
                visorMaterial
            );

        visor.position.set(
            0,
            1.75,
            -0.5
        );

        this.group.add(visor);


        // ---------------------------------------------------------
        // HEX BADGE
        // ---------------------------------------------------------

        const badgeGeometry =
            new THREE.CylinderGeometry(
                0.22,
                0.22,
                0.08,
                6
            );

        const badgeMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xffd15a,
                emissive: 0xb76500,
                emissiveIntensity: 1
            });

        const badge =
            new THREE.Mesh(
                badgeGeometry,
                badgeMaterial
            );

        badge.rotation.x =
            Math.PI / 2;

        badge.position.set(
            0,
            1.05,
            -0.68
        );

        this.group.add(badge);


        // ---------------------------------------------------------
        // SHADOW / BASE
        // ---------------------------------------------------------

        const baseGeometry =
            new THREE.CylinderGeometry(
                0.75,
                0.75,
                0.08,
                6
            );

        const baseMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.35
            });

        const base =
            new THREE.Mesh(
                baseGeometry,
                baseMaterial
            );

        base.position.y =
            0.05;

        this.group.add(base);
    }


    update(
        delta,
        keys
    ) {

        this.direction.set(
            0,
            0,
            0
        );


        // ---------------------------------------------------------
        // INPUT
        // ---------------------------------------------------------

        if (keys.KeyW) {

            this.direction.z -= 1;
        }

        if (keys.KeyS) {

            this.direction.z += 1;
        }

        if (keys.KeyA) {

            this.direction.x -= 1;
        }

        if (keys.KeyD) {

            this.direction.x += 1;
        }


        // ---------------------------------------------------------
        // NORMALIZE
        // ---------------------------------------------------------

        if (
            this.direction.lengthSq() > 0
        ) {

            this.direction.normalize();
        }


        // ---------------------------------------------------------
        // SPEED
        // ---------------------------------------------------------

        const sprinting =
            keys.ShiftLeft ||
            keys.ShiftRight;

        const speed =
            sprinting
                ? this.sprintSpeed
                : this.speed;


        // ---------------------------------------------------------
        // MOVEMENT
        // ---------------------------------------------------------

        this.velocity.copy(
            this.direction
        );

        this.velocity.multiplyScalar(
            speed * delta
        );


        const nextX =
            this.group.position.x +
            this.velocity.x;

        const nextZ =
            this.group.position.z +
            this.velocity.z;


        // ---------------------------------------------------------
        // WORLD BOUNDARY
        // ---------------------------------------------------------

        const maxDistance = 62;

        const distance =
            Math.sqrt(
                nextX * nextX +
                nextZ * nextZ
            );

        if (
            distance <
            maxDistance
        ) {

            this.group.position.x =
                nextX;

            this.group.position.z =
                nextZ;
        }


        // ---------------------------------------------------------
        // ROTATION
        // ---------------------------------------------------------

        if (
            this.direction.lengthSq() > 0
        ) {

            const targetRotation =
                Math.atan2(
                    this.direction.x,
                    this.direction.z
                );

            let difference =
                targetRotation -
                this.group.rotation.y;

            difference =
                Math.atan2(
                    Math.sin(difference),
                    Math.cos(difference)
                );

            this.group.rotation.y +=
                difference * 0.18;
        }


        // ---------------------------------------------------------
        // WALKING BOB
        // ---------------------------------------------------------

        if (
            this.direction.lengthSq() > 0
        ) {

            const bob =
                Math.sin(
                    performance.now() * 0.012
                ) * 0.035;

            this.group.position.y =
                bob;
        }
        else {

            this.group.position.y = 0;
        }


        // ---------------------------------------------------------
        // DEBUG
        // ---------------------------------------------------------

        const debug =
            document.getElementById(
                "debug-position"
            );

        if (debug) {

            debug.textContent =
                `X: ${this.group.position.x.toFixed(1)} | Z: ${this.group.position.z.toFixed(1)}`;
        }
    }
}
