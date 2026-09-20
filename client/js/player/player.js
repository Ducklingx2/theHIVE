import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { Character } from "./character.js";
import { CharacterAnimation } from "./animation.js";

export class Player {
    constructor(game, options = {}) {
        this.game = game;

        this.position = new THREE.Vector3(
            0,
            0,
            7
        );

        this.velocity = new THREE.Vector3();

        this.walkSpeed = 5.5;
        this.sprintSpeed = 8.5;

        this.rotationSpeed = 10;

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            sprint: false
        };

        this.moving = false;

        this.character =
            new Character(options);

        this.animation =
            new CharacterAnimation(
                this.character
            );

        this.object =
            this.character.getObject();

        this.object.position.copy(
            this.position
        );

        this.game.scene.add(
            this.object
        );

        this.setupInput();
    }

    setupInput() {
        window.addEventListener(
            "keydown",
            event => {
                switch (event.code) {
                    case "KeyW":
                    case "ArrowUp":
                        this.keys.forward = true;
                        break;

                    case "KeyS":
                    case "ArrowDown":
                        this.keys.backward = true;
                        break;

                    case "KeyA":
                    case "ArrowLeft":
                        this.keys.left = true;
                        break;

                    case "KeyD":
                    case "ArrowRight":
                        this.keys.right = true;
                        break;

                    case "ShiftLeft":
                    case "ShiftRight":
                        this.keys.sprint = true;
                        break;
                }
            }
        );

        window.addEventListener(
            "keyup",
            event => {
                switch (event.code) {
                    case "KeyW":
                    case "ArrowUp":
                        this.keys.forward = false;
                        break;

                    case "KeyS":
                    case "ArrowDown":
                        this.keys.backward = false;
                        break;

                    case "KeyA":
                    case "ArrowLeft":
                        this.keys.left = false;
                        break;

                    case "KeyD":
                    case "ArrowRight":
                        this.keys.right = false;
                        break;

                    case "ShiftLeft":
                    case "ShiftRight":
                        this.keys.sprint = false;
                        break;
                }
            }
        );
    }

    update(delta) {
        const input = new THREE.Vector3();

        if (this.keys.forward) {
            input.z -= 1;
        }

        if (this.keys.backward) {
            input.z += 1;
        }

        if (this.keys.left) {
            input.x -= 1;
        }

        if (this.keys.right) {
            input.x += 1;
        }

        this.moving =
            input.lengthSq() > 0;

        if (this.moving) {
            input.normalize();
        }

        const speed =
            this.keys.sprint
                ? this.sprintSpeed
                : this.walkSpeed;

        const movement =
            input.multiplyScalar(
                speed * delta
            );

        /*
         * World collision.
         */
        if (this.game.world?.collision) {
            this.position =
                this.game.world.collision
                    .resolveMovement(
                        this.position,
                        movement
                    );
        } else {
            this.position.add(
                movement
            );
        }

        /*
         * Character rotation.
         */
        if (this.moving) {
            const targetRotation =
                Math.atan2(
                    movement.x,
                    movement.z
                );

            let difference =
                targetRotation -
                this.object.rotation.y;

            difference =
                Math.atan2(
                    Math.sin(difference),
                    Math.cos(difference)
                );

            this.object.rotation.y +=
                difference *
                Math.min(
                    delta *
                    this.rotationSpeed,
                    1
                );
        }

        this.object.position.copy(
            this.position
        );

        this.animation.update(
            delta,
            speed,
            this.moving
        );
    }

    getPosition() {
        return this.position.clone();
    }
}
