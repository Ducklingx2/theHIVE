import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { World } from "./world/world.js";
import { Player } from "./player/player.js";

export class Game {
    constructor() {
        this.container =
            document.getElementById("game");

        if (!this.container) {
            throw new Error(
                'Missing #game element.'
            );
        }

        this.clock = new THREE.Clock();

        this.started = false;

        this.phase = "INTRUSION";
        this.phaseTime = 300;

        this.keys = {};

        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupWorld();
        this.setupPlayer();
        this.setupInput();
        this.setupResize();
    }

    setupScene() {
        this.scene = new THREE.Scene();

        this.scene.background =
            new THREE.Color(0x080403);

        this.scene.fog =
            new THREE.FogExp2(
                0x080403,
                0.012
            );
    }

    setupCamera() {
        this.camera =
            new THREE.PerspectiveCamera(
                65,
                window.innerWidth /
                    window.innerHeight,
                0.1,
                200
            );

        this.camera.position.set(
            0,
            8,
            14
        );

        this.cameraTarget =
            new THREE.Vector3();
    }

    setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    this.renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    this.renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    // IMPORTANT:
    // Disable shadow maps for compatibility.
    this.renderer.shadowMap.enabled = false;

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);
}

    setupWorld() {
        this.world =
            new World(this);
    }

    setupPlayer() {
        this.player =
            new Player(this, {
                suit: 0x292018,
                suitSecondary: 0x4d3212,
                visor: 0xffb82e,
                visorGlow: 0xff8a00,
                equipment: 0x15110d,
                accent: 0xd99118
            });
    }

    setupInput() {
        window.addEventListener(
            "keydown",
            event => {
                this.keys[event.code] = true;

                /*
                 * Prevent browser scrolling with
                 * movement keys.
                 */
                if (
                    [
                        "Space",
                        "ArrowUp",
                        "ArrowDown",
                        "ArrowLeft",
                        "ArrowRight"
                    ].includes(event.code)
                ) {
                    event.preventDefault();
                }
            }
        );

        window.addEventListener(
            "keyup",
            event => {
                this.keys[event.code] = false;
            }
        );

        /*
         * Start game.
         */
        const startButton =
            document.getElementById(
                "start-button"
            );

        if (startButton) {
            startButton.addEventListener(
                "click",
                () => {
                    this.beginGame();
                }
            );
        }

        /*
         * Restart.
         */
        const restartButton =
            document.getElementById(
                "restart-button"
            );

        if (restartButton) {
            restartButton.addEventListener(
                "click",
                () => {
                    window.location.reload();
                }
            );
        }
    }

    setupResize() {
        window.addEventListener(
            "resize",
            () => {
                this.camera.aspect =
                    window.innerWidth /
                    window.innerHeight;

                this.camera.updateProjectionMatrix();

                this.renderer.setSize(
                    window.innerWidth,
                    window.innerHeight
                );

                this.renderer.setPixelRatio(
                    Math.min(
                        window.devicePixelRatio,
                        2
                    )
                );
            }
        );
    }

    beginGame() {
        if (this.started) {
            return;
        }

        this.started = true;

        this.clock.start();

        const startScreen =
            document.getElementById(
                "start-screen"
            );

        if (startScreen) {
            startScreen.classList.add(
                "hidden"
            );
        }

        this.phase = "INTRUSION";
        this.phaseTime = 300;

        this.updateHUD();
    }

    update(delta) {
        if (!this.started) {
            return;
        }

        /*
         * Update player.
         */
        this.player.update(delta);

        /*
         * Update world.
         */
        this.world.update(delta);

        /*
         * Phase timer.
         */
        this.phaseTime -= delta;

        if (this.phaseTime <= 0) {
            this.phaseTime = 0;

            this.handlePhaseTimeout();
        }

        /*
         * Camera.
         */
        this.updateCamera(delta);

        /*
         * HUD.
         */
        this.updateHUD();
    }

    updateCamera(delta) {
        const playerPosition =
            this.player.getPosition();

        /*
         * Smooth third-person camera.
         */
        const desiredPosition =
            new THREE.Vector3(
                playerPosition.x,
                playerPosition.y + 8.5,
                playerPosition.z + 11
            );

        this.camera.position.lerp(
            desiredPosition,
            Math.min(delta * 5, 1)
        );

        this.cameraTarget.lerp(
            new THREE.Vector3(
                playerPosition.x,
                playerPosition.y + 1.7,
                playerPosition.z
            ),
            Math.min(delta * 7, 1)
        );

        this.camera.lookAt(
            this.cameraTarget
        );
    }

    handlePhaseTimeout() {
        /*
         * Phase rules will be connected once
         * multiplayer/combat exists.
         *
         * For now, prevent the timer from
         * repeatedly firing.
         */
        if (this.phase === "INTRUSION") {
            this.phaseTime = 0;
        }
    }

    updateHUD() {
        const phaseName =
            document.getElementById(
                "phase-name"
            );

        const phaseDescription =
            document.getElementById(
                "phase-description"
            );

        const timer =
            document.getElementById(
                "timer"
            );

        const activeChamber =
            document.getElementById(
                "active-chamber"
            );

        if (phaseName) {
            phaseName.textContent =
                this.phase;
        }

        if (phaseDescription) {
            if (
                this.phase ===
                "INTRUSION"
            ) {
                phaseDescription.textContent =
                    "Find the Wasp.";
            }

            if (
                this.phase ===
                "ASSASSINATION"
            ) {
                phaseDescription.textContent =
                    "The Queen must die.";
            }

            if (
                this.phase ===
                "TRUE COLOURS"
            ) {
                phaseDescription.textContent =
                    "The Queen is running.";
            }
        }

        if (timer) {
            const minutes =
                Math.floor(
                    this.phaseTime / 60
                );

            const seconds =
                Math.floor(
                    this.phaseTime % 60
                );

            timer.textContent =
                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }

        if (activeChamber) {
            const rooms =
                this.world.getActiveRooms();

            if (rooms.length > 0) {
                activeChamber.textContent =
                    rooms[0].name;
            } else {
                activeChamber.textContent =
                    "NONE";
            }
        }
    }

    start() {
        this.animate();
    }

    animate() {
        requestAnimationFrame(
            () => this.animate()
        );

        const delta =
            Math.min(
                this.clock.getDelta(),
                0.05
            );

        this.update(delta);

        this.renderer.render(
            this.scene,
            this.camera
        );
    }
}
