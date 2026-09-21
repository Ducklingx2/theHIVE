import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { Character } from "./character.js";
import { CharacterAnimation } from "./animation.js";

export class Player {

    constructor(game, options = {}) {

        this.game = game;

        // -------------------------------------------------
        // POSITION
        // -------------------------------------------------

        this.position = new THREE.Vector3(
            options.x ?? 0,
            options.y ?? 0,
            options.z ?? 7
        );

        this.velocity = new THREE.Vector3();

        // -------------------------------------------------
        // LOOK
        // -------------------------------------------------

        this.yaw = 0;
        this.pitch = 0;

        this.mouseSensitivity = 0.0022;

        // -------------------------------------------------
        // MOVEMENT
        // -------------------------------------------------

        this.walkSpeed = 5.5;
        this.sprintSpeed = 8.5;
        this.crouchSpeed = 2.8;

        this.gravity = 24;
        this.jumpForce = 8.5;

        this.isGrounded = false;
        this.isCrouching = false;

        // -------------------------------------------------
        // CAMERA HEIGHT
        // -------------------------------------------------

        this.standingHeight = 1.65;
        this.crouchHeight = 0.95;

        this.currentEyeHeight = this.standingHeight;

        // -------------------------------------------------
        // STING
        // -------------------------------------------------

        this.maxStings = options.maxStings ?? 1;
        this.stings = this.maxStings;

        this.stingCooldown = 0;
        this.stingCooldownTime = 0.8;

        this.stingRange = 4.5;

        // -------------------------------------------------
        // CHARACTER
        // -------------------------------------------------

        this.character = new Character(options);

        this.object = this.character.getObject();

        this.object.position.copy(this.position);

        this.game.scene.add(this.object);

        this.animation = new CharacterAnimation(this.character);

        // -------------------------------------------------
        // POINTER LOCK
        // -------------------------------------------------

        this.pointerLocked = false;

        this.setupMouse();

        // Prevent context menu when using RMB.
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        // Keyboard input.
        document.addEventListener("keydown", (event) => {
            this.handleKeyDown(event);
        });

        document.addEventListener("keyup", (event) => {
            this.handleKeyUp(event);
        });
    }

    // =====================================================
    // POINTER LOCK / MOUSE
    // =====================================================

    setupMouse() {

        document.addEventListener("pointerlockchange", () => {

            this.pointerLocked =
                document.pointerLockElement ===
                this.game.renderer.domElement;

        });

        document.addEventListener("mousemove", (event) => {

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
        });

        // ---------------------------------------------
        // RIGHT MOUSE
        // ---------------------------------------------

        document.addEventListener("mousedown", (event) => {

            if (event.button !== 2) {
                return;
            }

            if (!this.pointerLocked) {
                return;
            }

            // RMB alone = nothing.
            // SHIFT + RMB = STING.
            const shiftHeld =
                this.game.keys.ShiftLeft ||
                this.game.keys.ShiftRight;

            if (shiftHeld) {
                this.trySting();
            }
        });
    }

    lockMouse() {

        if (
            document.pointerLockElement !==
            this.game.renderer.domElement
        ) {

            this.game.renderer.domElement.requestPointerLock();

        }
    }

    // =====================================================
    // KEYBOARD
    // =====================================================

    handleKeyDown(event) {

        if (!this.game.keys) {
            this.game.keys = {};
        }

        this.game.keys[event.code] = true;

        // SPACE = JUMP
        if (
            event.code === "Space" &&
            !event.repeat
        ) {

            event.preventDefault();

            this.jump();
        }

        // CTRL = CROUCH
        if (
            event.code === "ControlLeft" ||
            event.code === "ControlRight"
        ) {

            this.setCrouching(true);
        }
    }

    handleKeyUp(event) {

        if (!this.game.keys) {
            return;
        }

        this.game.keys[event.code] = false;

        if (
            event.code === "ControlLeft" ||
            event.code === "ControlRight"
        ) {

            this.setCrouching(false);
        }
    }

    // =====================================================
    // JUMP
    // =====================================================

    jump() {

        // Can't jump while airborne.
        if (!this.isGrounded) {
            return;
        }

        // Jumping automatically stands up.
        if (this.isCrouching) {
            this.setCrouching(false);
        }

        this.velocity.y = this.jumpForce;

        this.isGrounded = false;
    }

    // =====================================================
    // CROUCH
    // =====================================================

    setCrouching(value) {

        if (value === this.isCrouching) {
            return;
        }

        // If trying to stand, check ceiling clearance.
        if (!value) {

            if (!this.canStand()) {
                return;
            }
        }

        this.isCrouching = value;
    }

    canStand() {

        const collision =
            this.game.world?.collision;

        if (!collision) {
            return true;
        }

        // Ask the collision system whether the
        // player's standing capsule/box fits.
        if (
            typeof collision.canFitPlayer === "function"
        ) {

            return collision.canFitPlayer(
                this.position.x,
                this.position.z,
                this.standingHeight
            );
        }

        return true;
    }

    // =====================================================
    // STING
    // =====================================================

    trySting() {

        if (!this.game.started) {
            return;
        }

        if (this.stings <= 0) {
            return;
        }

        if (this.stingCooldown > 0) {
            return;
        }

        this.stings--;

        this.stingCooldown =
            this.stingCooldownTime;

        // Tell the Game system that this player
        // attempted a sting.
        if (
            typeof this.game.handleSting === "function"
        ) {

            this.game.handleSting(this);

        }

        // Small visual feedback.
        this.stingAnimation();

        if (
            typeof this.game.updateHUD === "function"
        ) {

            this.game.updateHUD();
        }
    }

    stingAnimation() {

        if (!this.character) {
            return;
        }

        // Optional animation hook.
        if (
            typeof this.character.sting === "function"
        ) {

            this.character.sting();
        }
    }

    replenishStings(amount = this.maxStings) {

        this.stings = Math.min(
            amount,
            this.maxStings
        );

        this.stingCooldown = 0;
    }

    // =====================================================
    // UPDATE
    // =====================================================

    update(delta) {

        const keys = this.game.keys || {};

        // ---------------------------------------------
        // STING COOLDOWN
        // ---------------------------------------------

        if (this.stingCooldown > 0) {

            this.stingCooldown -= delta;

            if (this.stingCooldown < 0) {
                this.stingCooldown = 0;
            }
        }

        // ---------------------------------------------
        // CROUCH
        // ---------------------------------------------

        const wantsCrouch =
            keys.ControlLeft ||
            keys.ControlRight;

        if (wantsCrouch !== this.isCrouching) {

            this.setCrouching(wantsCrouch);
        }

        // ---------------------------------------------
        // SMOOTH CAMERA HEIGHT
        // ---------------------------------------------

        const targetEyeHeight =
            this.isCrouching
                ? this.crouchHeight
                : this.standingHeight;

        this.currentEyeHeight =
            THREE.MathUtils.lerp(
                this.currentEyeHeight,
                targetEyeHeight,
                Math.min(delta * 12, 1)
            );

        // ---------------------------------------------
        // MOVEMENT INPUT
        // ---------------------------------------------

        let forward = 0;
        let strafe = 0;

        if (
            keys.KeyW ||
            keys.ArrowUp
        ) {
            forward += 1;
        }

        if (
            keys.KeyS ||
            keys.ArrowDown
        ) {
            forward -= 1;
        }

        if (
            keys.KeyD ||
            keys.ArrowRight
        ) {
            strafe += 1;
        }

        if (
            keys.KeyA ||
            keys.ArrowLeft
        ) {
            strafe -= 1;
        }

        const moving =
            forward !== 0 ||
            strafe !== 0;

        // ---------------------------------------------
        // CAMERA RELATIVE MOVEMENT
        // ---------------------------------------------

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

            const sprinting =
                !this.isCrouching &&
                (
                    keys.ShiftLeft ||
                    keys.ShiftRight
                );

            let speed;

            if (this.isCrouching) {

                speed = this.crouchSpeed;

            } else if (sprinting) {

                speed = this.sprintSpeed;

            } else {

                speed = this.walkSpeed;
            }

            const movement =
                direction.multiplyScalar(
                    speed * delta
                );

            // -----------------------------------------
            // COLLISION
            // -----------------------------------------

            const collision =
                this.game.world?.collision;

            if (collision) {

                const resolved =
                    collision.resolveMovement(
                        this.position,
                        movement
                    );

                this.position.copy(resolved);

            } else {

                this.position.add(movement);
            }
        }

        // ---------------------------------------------
        // GRAVITY
        // ---------------------------------------------

        this.velocity.y -=
            this.gravity * delta;

        this.position.y +=
            this.velocity.y * delta;

        // ---------------------------------------------
        // FLOOR
        // ---------------------------------------------

        if (this.position.y <= 0) {

            this.position.y = 0;

            this.velocity.y = 0;

            this.isGrounded = true;

        } else {

            this.isGrounded = false;
        }

        // ---------------------------------------------
        // ANIMATION
        // ---------------------------------------------

        const sprinting =
            !this.isCrouching &&
            (
                keys.ShiftLeft ||
                keys.ShiftRight
            );

        if (this.animation) {

            this.animation.update(
                delta,
                moving
                    ? (
                        sprinting
                            ? this.sprintSpeed
                            : this.isCrouching
                                ? this.crouchSpeed
                                : this.walkSpeed
                    )
                    : 0,
                moving
            );
        }

        // ---------------------------------------------
        // CHARACTER
        // ---------------------------------------------

        this.object.position.copy(
            this.position
        );

        // First-person mode.
        this.object.visible = false;
    }

    // =====================================================
    // CAMERA
    // =====================================================

    getCameraPosition() {

        return new THREE.Vector3(
            this.position.x,
            this.position.y +
                this.currentEyeHeight,
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

    // =====================================================
    // RESET
    // =====================================================

    reset(position = new THREE.Vector3(0, 0, 7)) {

        this.position.copy(position);

        this.velocity.set(0, 0, 0);

        this.yaw = 0;
        this.pitch = 0;

        this.isGrounded = true;
        this.isCrouching = false;

        this.currentEyeHeight =
            this.standingHeight;

        this.replenishStings();
    }
}
