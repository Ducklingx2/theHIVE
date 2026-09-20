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

        this.yaw = 0;
        this.pitch = 0;

        this.walkSpeed = 5.5;
        this.sprintSpeed = 8.5;

        this.eyeHeight = 1.65;

        this.mouseSensitivity = 0.0022;

        this.character = new Character(options);

        this.object = this.character.getObject();

        this.object.position.copy(this.position);

        this.game.scene.add(this.object);

        this.animation = new CharacterAnimation(
            this.character
        );

        this.pointerLocked = false;

        this.setupMouse();
    }

    setupMouse() {
        document.addEventListener(
            "pointerlockchange",
            () => {
                this.pointerLocked =
                    document.pointerLockElement ===
                    this.game.renderer.domElement;
            }
        );

        document.addEventListener(
            "mousemove",
            event => {
                if (!this.pointerLocked) {
                    return;
                }

                this.yaw -=
                    event.movementX *
                    this.mouseSensitivity;

                this.pitch -=
                    event.movementY *
                    this.mouseSensitivity;

                const limit =
                    Math.PI / 2 - 0.08;

                this.pitch = THREE.MathUtils.clamp(
                    this.pitch,
                    -limit,
                    limit
                );
            }
        );
    }

    lockMouse() {
        if (!this.game.renderer.domElement) {
            return;
        }

        this.game.renderer.domElement.requestPointerLock();
    }

    update(delta) {
        const keys = this.game.keys;

        let forward = 0;
        let strafe = 0;

        if (keys.KeyW || keys.ArrowUp) {
            forward += 1;
        }

        if (keys.KeyS || keys.ArrowDown) {
            forward -= 1;
        }

        if (keys.KeyD || keys.ArrowRight) {
            strafe += 1;
        }

        if (keys.KeyA || keys.ArrowLeft) {
            strafe -= 1;
        }

        const moving =
            forward !== 0 ||
            strafe !== 0;

        if (moving) {
            const direction =
                new THREE.Vector3();

            const forwardVector =
                new THREE.Vector3(
                    -Math.sin(this.yaw),
                    0,
                    -Math.cos(this.yaw)
                );

            const rightVector =
                new THREE.Vector3(
                    Math.cos(this.yaw),
                    0,
                    -Math.sin(this.yaw)
                );

            direction
                .addScaledVector(
                    forwardVector,
                    forward
                )
                .addScaledVector(
                    rightVector,
                    strafe
                )
                .normalize();

            const sprint =
                keys.ShiftLeft ||
                keys.ShiftRight;

            const speed = sprint
                ? this.sprintSpeed
                : this.walkSpeed;

            const movement =
                direction.multiplyScalar(
                    speed * delta
                );

            const collision =
                this.game.world.collision;

            if (collision) {
                this.position =
                    collision.resolveMovement(
                        this.position,
                        movement
                    );
            } else {
                this.position.add(movement);
            }

            this.animation.update(
                delta,
                speed,
                true
            );
        } else {
            this.animation.update(
                delta,
                0,
                false
            );
        }

        this.object.position.copy(
            this.position
        );

        // Hide the body in first-person.
        this.object.visible = false;
    }

    getCameraPosition() {
        return new THREE.Vector3(
            this.position.x,
            this.position.y +
                this.eyeHeight,
            this.position.z
        );
    }

    getLookDirection() {
        const direction =
            new THREE.Vector3(
                -Math.sin(this.yaw) *
                    Math.cos(this.pitch),

                Math.sin(this.pitch),

                -Math.cos(this.yaw) *
                    Math.cos(this.pitch)
            );

        return direction.normalize();
    }

    getPosition() {
        return this.position;
    }
}
