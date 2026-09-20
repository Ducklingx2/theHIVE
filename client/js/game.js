import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { World } from "./world.js";
import { Player } from "./player.js";
import { UI } from "./ui.js";

export class Game {

    constructor() {

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.world = null;
        this.player = null;
        this.ui = null;

        this.clock = new THREE.Clock();

        this.running = false;

        this.phase = "INTRUSION";

        this.timeRemaining = 300;

        this.keys = {};

        this.mouse = {
            x: 0,
            y: 0
        };

        this.init();
    }


    init() {

        // ---------------------------------------------------------
        // SCENE
        // ---------------------------------------------------------

        this.scene = new THREE.Scene();

        this.scene.background = new THREE.Color(0x090604);

        this.scene.fog = new THREE.FogExp2(
            0x090604,
            0.018
        );


        // ---------------------------------------------------------
        // CAMERA
        // ---------------------------------------------------------

        this.camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );

        this.camera.position.set(
            0,
            22,
            18
        );

        this.camera.lookAt(
            0,
            0,
            0
        );


        // ---------------------------------------------------------
        // RENDERER
        // ---------------------------------------------------------

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        this.renderer.shadowMap.enabled = true;

        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        this.renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        this.renderer.toneMappingExposure = 1.2;

        document
            .getElementById("game")
            .appendChild(this.renderer.domElement);


        // ---------------------------------------------------------
        // LIGHTING
        // ---------------------------------------------------------

        this.createLighting();


        // ---------------------------------------------------------
        // WORLD
        // ---------------------------------------------------------

        this.world = new World(this);

        this.scene.add(
            this.world.group
        );


        // ---------------------------------------------------------
        // PLAYER
        // ---------------------------------------------------------

        this.player = new Player(this);

        this.scene.add(
            this.player.group
        );


        // ---------------------------------------------------------
        // UI
        // ---------------------------------------------------------

        this.ui = new UI(this);

        this.ui.setPhase(
            this.phase,
            this.timeRemaining
        );


        // ---------------------------------------------------------
        // INPUT
        // ---------------------------------------------------------

        this.setupInput();


        // ---------------------------------------------------------
        // RESIZE
        // ---------------------------------------------------------

        window.addEventListener(
            "resize",
            () => this.resize()
        );
    }


    createLighting() {

        // Soft global light

        const ambient = new THREE.HemisphereLight(
            0xffd27a,
            0x100805,
            1.8
        );

        this.scene.add(ambient);


        // Main honey light

        const mainLight = new THREE.DirectionalLight(
            0xffc14a,
            3.0
        );

        mainLight.position.set(
            5,
            25,
            8
        );

        mainLight.castShadow = true;

        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;

        mainLight.shadow.camera.left = -60;
        mainLight.shadow.camera.right = 60;
        mainLight.shadow.camera.top = 60;
        mainLight.shadow.camera.bottom = -60;

        this.scene.add(mainLight);


        // Warm central Hive glow

        const hiveLight = new THREE.PointLight(
            0xff9f1c,
            15,
            35,
            2
        );

        hiveLight.position.set(
            0,
            5,
            0
        );

        this.scene.add(hiveLight);


        // Smaller atmospheric lights

        const lights = [
            [-18, 3, -12],
            [18, 3, -12],
            [-18, 3, 12],
            [18, 3, 12]
        ];

        for (const position of lights) {

            const light = new THREE.PointLight(
                0xffb52e,
                5,
                18,
                2
            );

            light.position.set(
                position[0],
                position[1],
                position[2]
            );

            this.scene.add(light);
        }
    }


    setupInput() {

        window.addEventListener(
            "keydown",
            event => {

                this.keys[event.code] = true;

                if (
                    [
                        "KeyW",
                        "KeyA",
                        "KeyS",
                        "KeyD",
                        "Space"
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


        const startButton =
            document.getElementById("start-button");

        if (startButton) {

            startButton.addEventListener(
                "click",
                () => this.beginGame()
            );
        }


        const restartButton =
            document.getElementById("restart-button");

        if (restartButton) {

            restartButton.addEventListener(
                "click",
                () => window.location.reload()
            );
        }
    }


    beginGame() {

        const startScreen =
            document.getElementById("start-screen");

        if (startScreen) {

            startScreen.classList.add("hidden");
        }

        this.running = true;

        this.clock.start();
    }


    update(delta) {

        if (!this.running) {
            return;
        }


        // ---------------------------------------------------------
        // PLAYER
        // ---------------------------------------------------------

        this.player.update(
            delta,
            this.keys
        );


        // ---------------------------------------------------------
        // CAMERA
        // ---------------------------------------------------------

        this.updateCamera();


        // ---------------------------------------------------------
        // WORLD
        // ---------------------------------------------------------

        this.world.update(
            delta
        );


        // ---------------------------------------------------------
        // TIMER
        // ---------------------------------------------------------

        this.timeRemaining -= delta;

        if (this.timeRemaining < 0) {

            this.timeRemaining = 0;
        }

        this.ui.updateTimer(
            this.timeRemaining
        );


        // ---------------------------------------------------------
        // UI
        // ---------------------------------------------------------

        this.ui.update(
            this.player
        );
    }


    updateCamera() {

        const target = this.player.group.position;

        const desiredPosition =
            new THREE.Vector3(
                target.x,
                target.y + 22,
                target.z + 18
            );

        this.camera.position.lerp(
            desiredPosition,
            0.08
        );

        this.camera.lookAt(
            target.x,
            target.y,
            target.z
        );
    }


    resize() {

        this.camera.aspect =
            window.innerWidth /
            window.innerHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
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


    start() {

        this.animate();
    }
}
