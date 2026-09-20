import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

function pointInHexagon(x, z, centerX, centerZ, radius) {
    const dx = Math.abs(x - centerX);
    const dz = Math.abs(z - centerZ);

    const qx = dx / radius;
    const qz = dz / radius;

    return (
        qx <= 0.866 &&
        qz <= 0.5 + 0.5 * (0.866 - qx)
    );
}

function pointNearCorridor(
    x,
    z,
    start,
    end,
    width
) {
    const px = x - start.x;
    const pz = z - start.z;

    const dx = end.x - start.x;
    const dz = end.z - start.z;

    const lengthSq = dx * dx + dz * dz;

    let t = 0;

    if (lengthSq > 0) {
        t = (px * dx + pz * dz) / lengthSq;
    }

    t = Math.max(0, Math.min(1, t));

    const closestX = start.x + dx * t;
    const closestZ = start.z + dz * t;

    const distance = Math.hypot(
        x - closestX,
        z - closestZ
    );

    return distance <= width / 2;
}

export class CollisionSystem {
    constructor(world) {
        this.world = world;
        this.playerRadius = 0.65;
    }

    isWalkable(x, z) {
        /*
         * Room interiors
         */
        for (const room of this.world.rooms) {
            if (
                pointInHexagon(
                    x,
                    z,
                    room.x,
                    room.z,
                    room.radius - 1.0
                )
            ) {
                return true;
            }
        }

        /*
         * Corridors
         */
        for (const corridor of this.world.corridors) {
            if (
                pointNearCorridor(
                    x,
                    z,
                    corridor.start,
                    corridor.end,
                    corridor.width - 1.0
                )
            ) {
                return true;
            }
        }

        return false;
    }

    canMoveTo(x, z) {
        if (!this.isWalkable(x, z)) {
            return false;
        }

        /*
         * Test around the player's body so the player
         * cannot partially clip through walls.
         */
        const r = this.playerRadius;

        const samples = [
            [x + r, z],
            [x - r, z],
            [x, z + r],
            [x, z - r],
            [x + r * 0.7, z + r * 0.7],
            [x - r * 0.7, z + r * 0.7],
            [x + r * 0.7, z - r * 0.7],
            [x - r * 0.7, z - r * 0.7]
        ];

        return samples.every(
            ([sx, sz]) => this.isWalkable(sx, sz)
        );
    }

    resolveMovement(position, movement) {
        const result = position.clone();

        const testX = position.clone();

        testX.x += movement.x;

        if (
            this.canMoveTo(
                testX.x,
                testX.z
            )
        ) {
            result.x = testX.x;
        }

        const testZ = result.clone();

        testZ.z += movement.z;

        if (
            this.canMoveTo(
                testZ.x,
                testZ.z
            )
        ) {
            result.z = testZ.z;
        }

        return result;
    }
}
