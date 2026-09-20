export class CharacterAnimation {
    constructor(character) {
        this.character = character;

        this.time = 0;
        this.speed = 0;

        this.walkCycle = 0;
    }

    update(delta, movementSpeed, moving) {
        this.time += delta;

        this.speed += (
            movementSpeed - this.speed
        ) * Math.min(delta * 10, 1);

        if (moving) {
            this.walkCycle +=
                delta * (5 + this.speed * 1.5);

            this.walk();
        } else {
            this.idle();
        }
    }

    walk() {
        const c = this.character.parts;

        const swing =
            Math.sin(this.walkCycle) * 0.55;

        const oppositeSwing =
            Math.sin(this.walkCycle + Math.PI) * 0.55;

        c.leftLeg.rotation.x = swing;
        c.rightLeg.rotation.x = oppositeSwing;

        c.leftArm.rotation.x =
            oppositeSwing * 0.65;

        c.rightArm.rotation.x =
            swing * 0.65;

        const bob =
            Math.abs(
                Math.sin(this.walkCycle)
            ) * 0.045;

        this.character.root.position.y =
            bob;

        c.head.rotation.z =
            Math.sin(this.walkCycle * 0.5) * 0.025;
    }

    idle() {
        const c = this.character.parts;

        c.leftLeg.rotation.x *= 0.82;
        c.rightLeg.rotation.x *= 0.82;

        c.leftArm.rotation.x *= 0.82;
        c.rightArm.rotation.x *= 0.82;

        const breathing =
            Math.sin(this.time * 2.2) * 0.018;

        this.character.root.position.y =
            breathing;

        c.head.rotation.z =
            Math.sin(this.time * 1.5) * 0.012;
    }

    sting() {
        const c = this.character.parts;

        c.rightArm.rotation.x = -1.2;
        c.rightArm.rotation.z = -0.25;
    }

    resetAction() {
        const c = this.character.parts;

        c.rightArm.rotation.x = 0;
        c.rightArm.rotation.z = 0;
    }
}
