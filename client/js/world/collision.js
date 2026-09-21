import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class CollisionSystem {

    constructor() {

        this.playerRadius = 0.42;

        this.roomRegions = [];
        this.corridors = [];
        this.colliders = [];
    }

    // =====================================================
    // WORLD REGIONS
    // =====================================================

    addRoom(room) {

        this.roomRegions.push(room);
    }

    addCorridor(corridor) {

        this.corridors.push(corridor);
    }

    // =====================================================
    // PROP COLLIDERS
    // =====================================================

    addBoxCollider(
        position,
        size,
        options = {}
    ) {

        this.colliders.push({

            type: "box",

            position:
                position.clone(),

            size:
                size.clone(),

            name:
                options.name ?? "BoxCollider",

            enabled:
                options.enabled !== false
        });
    }

    addCylinderCollider(
        position,
        radius,
        options = {}
    ) {

        this.colliders.push({

            type: "circle",

            position:
                position.clone(),

            radius,

            name:
                options.name ?? "CylinderCollider",

            enabled:
                options.enabled !== false
        });
    }

    // =====================================================
    // ROOM TEST
    // =====================================================

    isInsideRoom(
        x,
        z,
        room
    ) {

        const halfWidth =
            room.width / 2;

        const halfDepth =
            room.depth / 2;

        return (

            x >=
                room.x -
                halfWidth +

                this.playerRadius &&

            x <=
                room.x +
                halfWidth -

                this.playerRadius &&

            z >=
                room.z -
                halfDepth +

                this.playerRadius &&

            z <=
                room.z +
                halfDepth -

                this.playerRadius
        );
    }

    // =====================================================
    // CORRIDOR TEST
    // =====================================================

    isInsideCorridor(
        x,
        z,
        corridor
    ) {

        const start =
            corridor.start;

        const end =
            corridor.end;

        const dx =
            end.x - start.x;

        const dz =
            end.z - start.z;

        const lengthSquared =
            dx * dx +
            dz * dz;

        if (lengthSquared <= 0.0001) {
            return false;
        }

        let t =
            (
                (x - start.x) * dx +
                (z - start.z) * dz
            ) /
            lengthSquared;

        t =
            THREE.MathUtils.clamp(
                t,
                0,
                1
            );

        const closestX =
            start.x +
            dx * t;

        const closestZ =
            start.z +
            dz * t;

        const distance =
            Math.hypot(
                x - closestX,
                z - closestZ
            );

        return (
            distance <=
            corridor.width / 2 -
            this.playerRadius
        );
    }

    // =====================================================
    // WALKABLE AREA
    // =====================================================

    isWalkable(
        x,
        z
    ) {

        // ---------------------------------------------
        // ROOMS
        // ---------------------------------------------

        for (
            const room
            of this.roomRegions
        ) {

            if (
                this.isInsideRoom(
                    x,
                    z,
                    room
                )
            ) {

                return true;
            }
        }

        // ---------------------------------------------
        // CORRIDORS
        // ---------------------------------------------

        for (
            const corridor
            of this.corridors
        ) {

            if (
                this.isInsideCorridor(
                    x,
                    z,
                    corridor
                )
            ) {

                return true;
            }
        }

        return false;
    }

    // =====================================================
    // BOX COLLISION
    // =====================================================

    collidesWithBox(
        x,
        z,
        collider
    ) {

        const halfX =
            collider.size.x / 2;

        const halfZ =
            collider.size.z / 2;

        const closestX =
            THREE.MathUtils.clamp(
                x,
                collider.position.x - halfX,
                collider.position.x + halfX
            );

        const closestZ =
            THREE.MathUtils.clamp(
                z,
                collider.position.z - halfZ,
                collider.position.z + halfZ
            );

        const dx =
            x - closestX;

        const dz =
            z - closestZ;

        return (
            dx * dx +
            dz * dz
            <
            this.playerRadius *
            this.playerRadius
        );
    }

    // =====================================================
    // CYLINDER COLLISION
    // =====================================================

    collidesWithCircle(
        x,
        z,
        collider
    ) {

        const dx =
            x -
            collider.position.x;

        const dz =
            z -
            collider.position.z;

        const distance =
            Math.sqrt(
                dx * dx +
                dz * dz
            );

        return (
            distance <
            collider.radius +
            this.playerRadius
        );
    }

    // =====================================================
    // PROP COLLISION
    // =====================================================

    collidesWithProps(
        x,
        z
    ) {

        for (
            const collider
            of this.colliders
        ) {

            if (
                !collider.enabled
            ) {
                continue;
            }

            if (
                collider.type ===
                "box"
            ) {

                if (
                    this.collidesWithBox(
                        x,
                        z,
                        collider
                    )
                ) {

                    return true;
                }
            }

            if (
                collider.type ===
                "circle"
            ) {

                if (
                    this.collidesWithCircle(
                        x,
                        z,
                        collider
                    )
                ) {

                    return true;
                }
            }
        }

        return false;
    }

    // =====================================================
    // FINAL MOVEMENT TEST
    // =====================================================

    canMoveTo(
        x,
        z
    ) {

        // First, the position must be inside
        // a legitimate room or corridor.

        if (
            !this.isWalkable(
                x,
                z
            )
        ) {

            return false;
        }

        // Then check props.

        if (
            this.collidesWithProps(
                x,
                z
            )
        ) {

            return false;
        }

        return true;
    }

    // =====================================================
    // MOVEMENT RESOLUTION
    // =====================================================

    resolveMovement(
        position,
        movement
    ) {

        const result =
            position.clone();

        // ---------------------------------------------
        // X
        // ---------------------------------------------

        const nextX =
            result.x +
            movement.x;

        if (
            this.canMoveTo(
                nextX,
                result.z
            )
        ) {

            result.x =
                nextX;
        }

        // ---------------------------------------------
        // Z
        // ---------------------------------------------

        const nextZ =
            result.z +
            movement.z;

        if (
            this.canMoveTo(
                result.x,
                nextZ
            )
        ) {

            result.z =
                nextZ;
        }

        return result;
    }

    // =====================================================
    // PLAYER HEIGHT CHECK
    // =====================================================

    canFitPlayer(
        x,
        z,
        height
    ) {

        /*
        For now the Hive has no low ceilings that
        prevent standing.

        This method exists so crouching can later
        support vents, low machinery, etc.
        */

        return true;
    }

    // =====================================================
    // DEBUG
    // =====================================================

    debugMeshes(scene) {

        const material =
            new THREE.MeshBasicMaterial({
                color: 0xff0000,
                wireframe: true
            });

        for (
            const collider
            of this.colliders
        ) {

            if (
                !collider.enabled
            ) {
                continue;
            }

            if (
                collider.type ===
                "box"
            ) {

                const mesh =
                    new THREE.Mesh(
                        new THREE.BoxGeometry(
                            collider.size.x,
                            1,
                            collider.size.z
                        ),
                        material
                    );

                mesh.position.copy(
                    collider.position
                );

                scene.add(mesh);
            }

            if (
                collider.type ===
                "circle"
            ) {

                const mesh =
                    new THREE.Mesh(
                        new THREE.CylinderGeometry(
                            collider.radius,
                            collider.radius,
                            1,
                            20
                        ),
                        material
                    );

                mesh.position.copy(
                    collider.position
                );

                scene.add(mesh);
            }
        }
    }
}
