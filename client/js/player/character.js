import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

function material(color, roughness = 0.7, metalness = 0) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness
    });
}

function mesh(geometry, mat) {
    const object = new THREE.Mesh(geometry, mat);

    object.castShadow = true;
    object.receiveShadow = true;

    return object;
}

export class Character {
    constructor(options = {}) {
        this.root = new THREE.Group();

        this.style = {
            suit: options.suit ?? 0x282016,
            suitSecondary: options.suitSecondary ?? 0x4a3215,
            visor: options.visor ?? 0xffb51b,
            visorGlow: options.visorGlow ?? 0xff8a00,
            equipment: options.equipment ?? 0x17120e,
            accent: options.accent ?? 0xd58b19
        };

        this.parts = {};

        this.materials = {
            suit: material(this.style.suit),
            suitSecondary: material(this.style.suitSecondary),
            visor: new THREE.MeshStandardMaterial({
                color: this.style.visor,
                emissive: this.style.visorGlow,
                emissiveIntensity: 2.2,
                roughness: 0.2,
                metalness: 0.25
            }),
            equipment: material(
                this.style.equipment,
                0.55,
                0.55
            ),
            accent: material(
                this.style.accent,
                0.45,
                0.25
            ),
            black: material(0x080706, 0.9),
            skin: material(0x9b6d42),
            eye: new THREE.MeshStandardMaterial({
                color: 0xffd35a,
                emissive: 0xff9c00,
                emissiveIntensity: 3
            })
        };

        this.build();
    }

    build() {
        this.createBody();
        this.createHead();
        this.createArms();
        this.createLegs();
        this.createBackpack();
        this.createAntennae();
    }

    createBody() {
        const body = new THREE.Group();

        body.position.y = 1.85;

        const torso = mesh(
            new THREE.CapsuleGeometry(
                0.72,
                1.15,
                6,
                12
            ),
            this.materials.suit
        );

        torso.scale.set(
            0.85,
            1,
            0.62
        );

        body.add(torso);

        /*
         * Chest armor.
         */
        const chest = mesh(
            new THREE.BoxGeometry(
                1.0,
                0.85,
                0.18
            ),
            this.materials.suitSecondary
        );

        chest.position.set(
            0,
            0.12,
            -0.57
        );

        chest.rotation.x = -0.08;

        body.add(chest);

        /*
         * Honey emblem.
         */
        const emblem = mesh(
            new THREE.CylinderGeometry(
                0.22,
                0.22,
                0.08,
                6
            ),
            this.materials.accent
        );

        emblem.rotation.x = Math.PI / 2;

        emblem.position.set(
            0,
            0.12,
            -0.7
        );

        body.add(emblem);

        this.parts.body = body;
        this.root.add(body);
    }

    createHead() {
        const head = new THREE.Group();

        head.position.y = 3.35;

        const helmet = mesh(
            new THREE.SphereGeometry(
                0.76,
                12,
                8
            ),
            this.materials.equipment
        );

        helmet.scale.set(
            0.95,
            1,
            0.85
        );

        head.add(helmet);

        /*
         * Front visor.
         */
        const visor = mesh(
            new THREE.SphereGeometry(
                0.55,
                12,
                8
            ),
            this.materials.visor
        );

        visor.scale.set(
            1.0,
            0.52,
            0.22
        );

        visor.position.set(
            0,
            0.02,
            -0.62
        );

        head.add(visor);

        /*
         * Visor highlight.
         */
        const visorLine = mesh(
            new THREE.BoxGeometry(
                0.7,
                0.045,
                0.025
            ),
            this.materials.eye
        );

        visorLine.position.set(
            0,
            0.08,
            -0.84
        );

        head.add(visorLine);

        this.parts.head = head;
        this.root.add(head);
    }

    createArms() {
        const createArm = side => {
            const arm = new THREE.Group();

            arm.position.set(
                side * 0.76,
                2.15,
                0
            );

            const upper = mesh(
                new THREE.CapsuleGeometry(
                    0.22,
                    0.65,
                    5,
                    8
                ),
                this.materials.suit
            );

            upper.rotation.z =
                side * -0.08;

            upper.position.y = -0.38;

            arm.add(upper);

            const forearm = mesh(
                new THREE.CapsuleGeometry(
                    0.2,
                    0.55,
                    5,
                    8
                ),
                this.materials.suitSecondary
            );

            forearm.position.set(
                side * -0.02,
                -0.98,
                0
            );

            arm.add(forearm);

            const hand = mesh(
                new THREE.SphereGeometry(
                    0.25,
                    8,
                    6
                ),
                this.materials.skin
            );

            hand.position.set(
                side * -0.02,
                -1.42,
                0
            );

            arm.add(hand);

            return arm;
        };

        this.parts.leftArm = createArm(-1);
        this.parts.rightArm = createArm(1);

        this.root.add(
            this.parts.leftArm,
            this.parts.rightArm
        );
    }

    createLegs() {
        const createLeg = side => {
            const leg = new THREE.Group();

            leg.position.set(
                side * 0.34,
                0.95,
                0
            );

            const thigh = mesh(
                new THREE.CapsuleGeometry(
                    0.28,
                    0.7,
                    5,
                    8
                ),
                this.materials.suit
            );

            thigh.position.y = -0.45;

            leg.add(thigh);

            const boot = mesh(
                new THREE.CapsuleGeometry(
                    0.25,
                    0.55,
                    5,
                    8
                ),
                this.materials.equipment
            );

            boot.position.set(
                0,
                -1.15,
                -0.08
            );

            leg.add(boot);

            const sole = mesh(
                new THREE.BoxGeometry(
                    0.5,
                    0.18,
                    0.75
                ),
                this.materials.black
            );

            sole.position.set(
                0,
                -1.45,
                -0.12
            );

            leg.add(sole);

            return leg;
        };

        this.parts.leftLeg = createLeg(-1);
        this.parts.rightLeg = createLeg(1);

        this.root.add(
            this.parts.leftLeg,
            this.parts.rightLeg
        );
    }

    createBackpack() {
        const backpack = mesh(
            new THREE.BoxGeometry(
                1.0,
                1.35,
                0.4
            ),
            this.materials.equipment
        );

        backpack.position.set(
            0,
            2.0,
            0.58
        );

        this.root.add(backpack);

        /*
         * Small hive power cells.
         */
        for (let i = 0; i < 3; i++) {
            const cell = mesh(
                new THREE.CylinderGeometry(
                    0.12,
                    0.12,
                    0.38,
                    6
                ),
                this.materials.accent
            );

            cell.rotation.x = Math.PI / 2;

            cell.position.set(
                -0.3 + i * 0.3,
                2.1,
                0.82
            );

            this.root.add(cell);
        }

        this.parts.backpack = backpack;
    }

    createAntennae() {
        const createAntenna = side => {
            const group = new THREE.Group();

            group.position.set(
                side * 0.3,
                3.9,
                0
            );

            const stalk = mesh(
                new THREE.CylinderGeometry(
                    0.045,
                    0.06,
                    0.55,
                    6
                ),
                this.materials.accent
            );

            stalk.rotation.z =
                side * 0.25;

            stalk.position.y = 0.25;

            group.add(stalk);

            const tip = mesh(
                new THREE.SphereGeometry(
                    0.11,
                    8,
                    6
                ),
                this.materials.visor
            );

            tip.position.set(
                side * 0.14,
                0.55,
                0
            );

            group.add(tip);

            return group;
        };

        this.parts.leftAntenna =
            createAntenna(-1);

        this.parts.rightAntenna =
            createAntenna(1);

        this.root.add(
            this.parts.leftAntenna,
            this.parts.rightAntenna
        );
    }

    setVisible(visible) {
        this.root.visible = visible;
    }

    getObject() {
        return this.root;
    }
}
