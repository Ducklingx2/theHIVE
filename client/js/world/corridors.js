import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import {
    getRoom
} from "./map.js";

function roomExitPoint(
    room,
    other,
    corridorWidth
) {

    const dx =
        other.x - room.x;

    const dz =
        other.z - room.z;

    if (Math.abs(dx) > Math.abs(dz)) {

        const direction =
            Math.sign(dx);

        return new THREE.Vector3(
            room.x +
                direction *
                (room.width / 2),
            0,
            room.z
        );
    }

    const direction =
        Math.sign(dz);

    return new THREE.Vector3(
        room.x,
        0,
        room.z +
            direction *
            (room.depth / 2)
    );
}

function createSegment(
    group,
    position,
    size,
    material,
    name
) {

    const mesh =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                size.x,
                size.y,
                size.z
            ),
            material
        );

    mesh.position.copy(position);

    mesh.name = name;

    mesh.castShadow = false;
    mesh.receiveShadow = false;

    group.add(mesh);

    return mesh;
}

function createCorridorLight(
    group,
    position,
    rotation,
    materials
) {

    const light =
        createSegment(
            group,
            position,
            new THREE.Vector3(
                1.8,
                0.08,
                0.35
            ),
            materials.light,
            "CorridorLight"
        );

    light.rotation.y =
        rotation;

    return light;
}

export function createCorridor(
    scene,
    corridor,
    materials
) {

    const from =
        getRoom(corridor.from);

    const to =
        getRoom(corridor.to);

    if (!from || !to) {
        return null;
    }

    const start =
        roomExitPoint(
            from,
            to,
            corridor.width
        );

    const end =
        roomExitPoint(
            to,
            from,
            corridor.width
        );

    const direction =
        new THREE.Vector3()
            .subVectors(end, start);

    const length =
        direction.length();

    const angle =
        Math.atan2(
            direction.x,
            direction.z
        );

    const midpoint =
        start.clone()
            .add(end)
            .multiplyScalar(0.5);

    const group =
        new THREE.Group();

    group.name =
        `Corridor-${corridor.id}`;

    group.position.copy(midpoint);

    group.rotation.y =
        angle;

    // -----------------------------------------------
    // FLOOR
    // -----------------------------------------------

    createSegment(
        group,
        new THREE.Vector3(
            0,
            -0.15,
            0
        ),
        new THREE.Vector3(
            corridor.width,
            0.3,
            length
        ),
        materials.corridorFloor,
        "CorridorFloor"
    );

    // -----------------------------------------------
    // CEILING
    // -----------------------------------------------

    createSegment(
        group,
        new THREE.Vector3(
            0,
            7,
            0
        ),
        new THREE.Vector3(
            corridor.width,
            0.4,
            length
        ),
        materials.ceiling,
        "CorridorCeiling"
    );

    // -----------------------------------------------
    // WALLS
    // -----------------------------------------------

    createSegment(
        group,
        new THREE.Vector3(
            -corridor.width / 2,
            3.5,
            0
        ),
        new THREE.Vector3(
            0.8,
            7,
            length
        ),
        materials.corridorWall,
        "CorridorWallLeft"
    );

    createSegment(
        group,
        new THREE.Vector3(
            corridor.width / 2,
            3.5,
            0
        ),
        new THREE.Vector3(
            0.8,
            7,
            length
        ),
        materials.corridorWall,
        "CorridorWallRight"
    );

    // -----------------------------------------------
    // HONEY STRIP
    // -----------------------------------------------

    createSegment(
        group,
        new THREE.Vector3(
            0,
            0.025,
            0
        ),
        new THREE.Vector3(
            0.22,
            0.06,
            length
        ),
        materials.accent,
        "CorridorCenterLine"
    );

    // -----------------------------------------------
    // LIGHTS
    // -----------------------------------------------

    const lightCount =
        Math.max(
            2,
            Math.floor(length / 7)
        );

    for (
        let i = 0;
        i < lightCount;
        i++
    ) {

        const t =
            (i + 0.5) /
            lightCount;

        const z =
            -length / 2 +
            length * t;

        createCorridorLight(
            group,
            new THREE.Vector3(
                0,
                6.72,
                z
            ),
            0,
            materials
        );
    }

    scene.add(group);

    return {
        group,
        start,
        end,
        width: corridor.width,
        length,
        from: corridor.from,
        to: corridor.to
    };
}
