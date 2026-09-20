import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class CollisionSystem {
    constructor() {
        this.playerRadius = 0.42;

        this.roomRegions = [];
        this.corridors = [];
        this.colliders = [];
    }

    addRoom(room) {
        this.roomRegions.push(room);
    }

    addCorridor(corridor) {
        this.corridors.push(corridor);
    }

    addBoxCollider(position, size, options = {}) {
        const collider = {
            type: "box",
            minX: position.x - size.x / 2,
            maxX: position.x + size.x / 2,
            minZ: position.z - size.z / 2,
            maxZ: position.z + size.z / 2,
            yMin: options.yMin ?? 0,
            yMax: options.yMax ?? 6,
            name: options.name || "prop"
        };

        this.colliders.push(collider);

        return collider;
    }

    addCylinderCollider(position, radius, options = {}) {
        const collider = {
            type: "circle",
            x: position.x,
            z: position.z,
            radius,
            yMin: options.yMin ?? 0,
            yMax: options.yMax ?? 6,
            name: options.name || "prop"
        };

        this.colliders.push(collider);

        return collider;
    }

    isInsideRoom(x, z, room) {
        const dx = x - room.x;
        const dz = z - room.z;

        const radius = room.radius - this.playerRadius;

        const qx = Math.abs(dx);
        const qz = Math.abs(dz);

        // Point-in-regular-hexagon approximation.
        const hexHeight = radius * Math.sqrt(3);

        if (qz > hexHeight / 2) {
            return false;
        }

        if (qx > radius) {
            return false;
        }

        return (
            qz <=
            Math.sqrt(3) * Math.min(
                radius - qx,
                radius / 2
            )
        );
    }

    isInsideCorridor(x, z, corridor) {
        const dx = corridor.end.x - corridor.start.x;
        const dz = corridor.end.z - corridor.start.z;

        const lengthSquared = dx * dx + dz * dz;

        if (lengthSquared === 0) {
            return false;
        }

        let t =
            ((x - corridor.start.x) * dx +
                (z - corridor.start.z) * dz) /
            lengthSquared;

        t = Math.max(0, Math.min(1, t));

        const closestX = corridor.start.x + dx * t;
        const closestZ = corridor.start.z + dz * t;

        const distance = Math.hypot(
            x - closestX,
            z - closestZ
        );

        return distance <= corridor.width / 2 - this.playerRadius;
    }

    isWalkable(x, z) {
        for (const room of this.roomRegions) {
            if (this.isInsideRoom(x, z, room)) {
                return true;
            }
        }

        for (const corridor of this.corridors) {
            if (this.isInsideCorridor(x, z, corridor)) {
                return true;
            }
        }

        return false;
    }

    collidesWithBox(x, z, collider) {
        const closestX = Math.max(
            collider.minX,
            Math.min(x, collider.maxX)
        );

        const closestZ = Math.max(
            collider.minZ,
            Math.min(z, collider.maxZ)
        );

        const dx = x - closestX;
        const dz = z - closestZ;

        return (
            dx * dx + dz * dz <
            this.playerRadius * this.playerRadius
        );
    }

    collidesWithCircle(x, z, collider) {
        const dx = x - collider.x;
        const dz = z - collider.z;

        const radius =
            collider.radius + this.playerRadius;

        return dx * dx + dz * dz < radius * radius;
    }

    collidesWithProps(x, z) {
        for (const collider of this.colliders) {
            if (collider.type === "box") {
                if (this.collidesWithBox(x, z, collider)) {
                    return true;
                }
            }

            if (collider.type === "circle") {
                if (this.collidesWithCircle(x, z, collider)) {
                    return true;
                }
            }
        }

        return false;
    }

    canMoveTo(x, z) {
        if (!this.isWalkable(x, z)) {
            return false;
        }

        if (this.collidesWithProps(x, z)) {
            return false;
        }

        return true;
    }

    resolveMovement(position, movement) {
        const result = position.clone();

        const targetX = result.x + movement.x;

        if (this.canMoveTo(targetX, result.z)) {
            result.x = targetX;
        }

        const targetZ = result.z + movement.z;

        if (this.canMoveTo(result.x, targetZ)) {
            result.z = targetZ;
        }

        return result;
    }

    debugMeshes(scene) {
        const group = new THREE.Group();
        group.name = "CollisionDebug";

        for (const collider of this.colliders) {
            let geometry;

            if (collider.type === "box") {
                geometry = new THREE.BoxGeometry(
                    collider.maxX - collider.minX,
                    0.08,
                    collider.maxZ - collider.minZ
                );
            } else {
                geometry = new THREE.CylinderGeometry(
                    collider.radius,
                    collider.radius,
                    0.08,
                    16
                );
            }

            const material = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.25,
                wireframe: true
            });

            const mesh = new THREE.Mesh(
                geometry,
                material
            );

            if (collider.type === "box") {
                mesh.position.set(
                    (collider.minX + collider.maxX) / 2,
                    0.05,
                    (collider.minZ + collider.maxZ) / 2
                );
            } else {
                mesh.position.set(
                    collider.x,
                    0.05,
                    collider.z
                );
            }

            group.add(mesh);
        }

        scene.add(group);

        return group;
    }
}
