import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { MAP, getRoom } from "./map.js";

const DOOR_WIDTH = 6;
const WALL_THICKNESS = 0.8;

function addBox(
    group,
    size,
    position,
    material,
    name
) {

    const geometry =
        new THREE.BoxGeometry(
            size.x,
            size.y,
            size.z
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.copy(position);

    mesh.name = name;

    mesh.castShadow = false;
    mesh.receiveShadow = false;

    group.add(mesh);

    return mesh;
}

function addFloorPattern(
    group,
    room,
    materials
) {

    const floorMaterial =
        room.type === "central"
            ? materials.centralFloor
            : materials.floor;

    const floor =
        addBox(
            group,
            new THREE.Vector3(
                room.width,
                0.35,
                room.depth
            ),
            new THREE.Vector3(
                room.x,
                -0.175,
                room.z
            ),
            floorMaterial,
            `${room.id}-Floor`
        );

    floor.userData.isFloor = true;

    // Honeycomb floor strips.
    const stripeMaterial =
        materials.darkHoney;

    const spacing = 3;

    for (
        let x = room.x - room.width / 2 + spacing;
        x < room.x + room.width / 2;
        x += spacing
    ) {

        const strip =
            addBox(
                group,
                new THREE.Vector3(
                    0.08,
                    0.025,
                    room.depth - 1
                ),
                new THREE.Vector3(
                    x,
                    0.015,
                    room.z
                ),
                stripeMaterial,
                `${room.id}-FloorStripe`
            );

        strip.userData.decorative = true;
    }
}

function getConnectionDirection(
    room,
    other
) {

    const dx =
        other.x - room.x;

    const dz =
        other.z - room.z;

    if (Math.abs(dx) > Math.abs(dz)) {

        return dx > 0
            ? "east"
            : "west";
    }

    return dz > 0
        ? "south"
        : "north";
}

function hasDoor(room, direction) {

    for (const connectionId of room.connections) {

        const other =
            getRoom(connectionId);

        if (!other) {
            continue;
        }

        if (
            getConnectionDirection(
                room,
                other
            ) === direction
        ) {

            return true;
        }
    }

    return false;
}

function createWallWithDoor(
    group,
    room,
    direction,
    materials
) {

    const width = room.width;
    const depth = room.depth;
    const height = room.height;

    const hasOpening =
        hasDoor(
            room,
            direction
        );

    const wallMaterial =
        direction === "north" ||
        direction === "south"
            ? materials.wall
            : materials.darkWall;

    const y =
        height / 2;

    if (!hasOpening) {

        if (
            direction === "north" ||
            direction === "south"
        ) {

            addBox(
                group,
                new THREE.Vector3(
                    width,
                    height,
                    WALL_THICKNESS
                ),
                new THREE.Vector3(
                    room.x,
                    y,
                    room.z +
                        (
                            direction === "north"
                                ? -depth / 2
                                : depth / 2
                        )
                ),
                wallMaterial,
                `${room.id}-${direction}-Wall`
            );

        } else {

            addBox(
                group,
                new THREE.Vector3(
                    WALL_THICKNESS,
                    height,
                    depth
                ),
                new THREE.Vector3(
                    room.x +
                        (
                            direction === "west"
                                ? -width / 2
                                : width / 2
                        ),
                    y,
                    room.z
                ),
                wallMaterial,
                `${room.id}-${direction}-Wall`
            );
        }

        return;
    }

    /*
    -------------------------------------------------------
    DOORWAY

    Instead of one solid wall:

    ███████      ███████
                 DOOR
    ███████      ███████

    -------------------------------------------------------
    */

    const doorWidth =
        Math.min(
            DOOR_WIDTH,
            width - 2
        );

    if (
        direction === "north" ||
        direction === "south"
    ) {

        const sideWidth =
            (width - doorWidth) / 2;

        const wallZ =
            room.z +
            (
                direction === "north"
                    ? -depth / 2
                    : depth / 2
            );

        // Left section.
        addBox(
            group,
            new THREE.Vector3(
                sideWidth,
                height,
                WALL_THICKNESS
            ),
            new THREE.Vector3(
                room.x -
                    (doorWidth / 2 +
                    sideWidth / 2),
                y,
                wallZ
            ),
            wallMaterial,
            `${room.id}-${direction}-WallLeft`
        );

        // Right section.
        addBox(
            group,
            new THREE.Vector3(
                sideWidth,
                height,
                WALL_THICKNESS
            ),
            new THREE.Vector3(
                room.x +
                    (doorWidth / 2 +
                    sideWidth / 2),
                y,
                wallZ
            ),
            wallMaterial,
            `${room.id}-${direction}-WallRight`
        );

        // Door frame.
        createDoorFrame(
            group,
            room.x - doorWidth / 2,
            y,
            wallZ,
            doorWidth,
            height,
            direction,
            materials
        );

        createDoorFrame(
            group,
            room.x + doorWidth / 2,
            y,
            wallZ,
            doorWidth,
            height,
            direction,
            materials,
            true
        );

    } else {

        const sideDepth =
            (depth - doorWidth) / 2;

        const wallX =
            room.x +
            (
                direction === "west"
                    ? -width / 2
                    : width / 2
            );

        // Back section.
        addBox(
            group,
            new THREE.Vector3(
                WALL_THICKNESS,
                height,
                sideDepth
            ),
            new THREE.Vector3(
                wallX,
                y,
                room.z -
                    (
                        doorWidth / 2 +
                        sideDepth / 2
                    )
            ),
            wallMaterial,
            `${room.id}-${direction}-WallBack`
        );

        // Front section.
        addBox(
            group,
            new THREE.Vector3(
                WALL_THICKNESS,
                height,
                sideDepth
            ),
            new THREE.Vector3(
                wallX,
                y,
                room.z +
                    (
                        doorWidth / 2 +
                        sideDepth / 2
                    )
            ),
            wallMaterial,
            `${room.id}-${direction}-WallFront`
        );

        createDoorFrame(
            group,
            wallX,
            y,
            room.z - doorWidth / 2,
            doorWidth,
            height,
            direction,
            materials
        );

        createDoorFrame(
            group,
            wallX,
            y,
            room.z + doorWidth / 2,
            doorWidth,
            height,
            direction,
            materials,
            true
        );
    }
}

function createDoorFrame(
    group,
    x,
    y,
    z,
    doorWidth,
    height,
    direction,
    materials,
    second = false
) {

    const verticalWidth = 0.35;

    let position;

    if (
        direction === "north" ||
        direction === "south"
    ) {

        position =
            new THREE.Vector3(
                x,
                y,
                z
            );

        addBox(
            group,
            new THREE.Vector3(
                verticalWidth,
                height,
                0.9
            ),
            position,
            materials.black,
            "DoorFrame"
        );

    } else {

        position =
            new THREE.Vector3(
                x,
                y,
                z
            );

        addBox(
            group,
            new THREE.Vector3(
                0.9,
                height,
                verticalWidth
            ),
            position,
            materials.black,
            "DoorFrame"
        );
    }
}

function createDoorTop(
    group,
    room,
    direction,
    materials
) {

    const height =
        room.height;

    const doorWidth =
        Math.min(
            DOOR_WIDTH,
            room.width - 2
        );

    let position;
    let size;

    if (
        direction === "north" ||
        direction === "south"
    ) {

        position =
            new THREE.Vector3(
                room.x,
                height - 0.4,
                room.z +
                    (
                        direction === "north"
                            ? -room.depth / 2
                            : room.depth / 2
                    )
            );

        size =
            new THREE.Vector3(
                doorWidth,
                0.8,
                0.9
            );

    } else {

        position =
            new THREE.Vector3(
                room.x +
                    (
                        direction === "west"
                            ? -room.width / 2
                            : room.width / 2
                    ),
                height - 0.4,
                room.z
            );

        size =
            new THREE.Vector3(
                0.9,
                0.8,
                doorWidth
            );
    }

    addBox(
        group,
        size,
        position,
        materials.black,
        `${room.id}-${direction}-DoorHeader`
    );

    // Glowing doorway strip.
    const glow =
        addBox(
            group,
            size.clone().multiplyScalar(0.72),
            position.clone().add(
                new THREE.Vector3(
                    0,
                    -0.05,
                    0
                )
            ),
            materials.glow,
            `${room.id}-${direction}-DoorGlow`
        );

    glow.material.emissiveIntensity = 3;
}

function createPillars(
    group,
    room,
    materials
) {

    const pillarMaterial =
        materials.black;

    const inset = 1.2;

    const positions = [

        [
            room.x - room.width / 2 + inset,
            room.z - room.depth / 2 + inset
        ],

        [
            room.x + room.width / 2 - inset,
            room.z - room.depth / 2 + inset
        ],

        [
            room.x - room.width / 2 + inset,
            room.z + room.depth / 2 - inset
        ],

        [
            room.x + room.width / 2 - inset,
            room.z + room.depth / 2 - inset
        ]
    ];

    for (const [x, z] of positions) {

        addBox(
            group,
            new THREE.Vector3(
                0.65,
                room.height,
                0.65
            ),
            new THREE.Vector3(
                x,
                room.height / 2,
                z
            ),
            pillarMaterial,
            `${room.id}-Pillar`
        );
    }
}

function createCeiling(
    group,
    room,
    materials
) {

    addBox(
        group,
        new THREE.Vector3(
            room.width,
            0.5,
            room.depth
        ),
        new THREE.Vector3(
            room.x,
            room.height,
            room.z
        ),
        materials.ceiling,
        `${room.id}-Ceiling`
    );

    // Bright central ceiling panel.
    addBox(
        group,
        new THREE.Vector3(
            Math.min(room.width - 3, 10),
            0.08,
            0.45
        ),
        new THREE.Vector3(
            room.x,
            room.height - 0.18,
            room.z
        ),
        materials.light,
        `${room.id}-CeilingLight`
    );
}

function createRoomSign(
    group,
    room,
    materials
) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 1024;
    canvas.height = 256;

    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "#17110b";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.strokeStyle = "#ffbd32";
    ctx.lineWidth = 10;

    ctx.strokeRect(
        8,
        8,
        canvas.width - 16,
        canvas.height - 16
    );

    ctx.fillStyle = "#ffd35c";

    ctx.font =
        "bold 76px Arial";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        room.name.toUpperCase(),
        canvas.width / 2,
        canvas.height / 2
    );

    const texture =
        new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        THREE.SRGBColorSpace;

    const material =
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: false
        });

    const geometry =
        new THREE.PlaneGeometry(
            Math.min(room.width - 3, 12),
            3
        );

    const sign =
        new THREE.Mesh(
            geometry,
            material
        );

    sign.position.set(
        room.x,
        Math.min(room.height - 1, 6),
        room.z - room.depth / 2 + 0.55
    );

    sign.rotation.y = Math.PI;

    sign.name =
        `${room.id}-RoomSign`;

    group.add(sign);
}

export function createRoomArchitecture(
    scene,
    room,
    materials
) {

    const group =
        new THREE.Group();

    group.name =
        `${room.name}-Architecture`;

    // -----------------------------------------------
    // FLOOR
    // -----------------------------------------------

    addFloorPattern(
        group,
        room,
        materials
    );

    // -----------------------------------------------
    // WALLS WITH REAL DOORWAYS
    // -----------------------------------------------

    createWallWithDoor(
        group,
        room,
        "north",
        materials
    );

    createWallWithDoor(
        group,
        room,
        "south",
        materials
    );

    createWallWithDoor(
        group,
        room,
        "east",
        materials
    );

    createWallWithDoor(
        group,
        room,
        "west",
        materials
    );

    // -----------------------------------------------
    // DOOR HEADERS
    // -----------------------------------------------

    for (const direction of [
        "north",
        "south",
        "east",
        "west"
    ]) {

        if (
            hasDoor(
                room,
                direction
            )
        ) {

            createDoorTop(
                group,
                room,
                direction,
                materials
            );
        }
    }

    // -----------------------------------------------
    // PILLARS
    // -----------------------------------------------

    createPillars(
        group,
        room,
        materials
    );

    // -----------------------------------------------
    // CEILING
    // -----------------------------------------------

    createCeiling(
        group,
        room,
        materials
    );

    // -----------------------------------------------
    // ROOM SIGN
    // -----------------------------------------------

    createRoomSign(
        group,
        room,
        materials
    );

    // -----------------------------------------------
    // ROOM ACCENT
    // -----------------------------------------------

    const accent =
        addBox(
            group,
            new THREE.Vector3(
                room.width - 2,
                0.18,
                0.35
            ),
            new THREE.Vector3(
                room.x,
                0.14,
                room.z
            ),
            materials.accent,
            `${room.id}-CenterAccent`
        );

    accent.userData.decorative = true;

    scene.add(group);

    return group;
}

/*
Small compatibility helper used by older code.
*/
export function createDoor(
    scene,
    position,
    rotation,
    materials
) {

    const group =
        new THREE.Group();

    group.position.copy(position);

    group.rotation.y =
        rotation || 0;

    const frameMaterial =
        materials.black;

    const glowMaterial =
        materials.glow;

    const left =
        addBox(
            group,
            new THREE.Vector3(
                0.35,
                5.5,
                0.7
            ),
            new THREE.Vector3(
                -3,
                2.75,
                0
            ),
            frameMaterial,
            "DoorLeft"
        );

    const right =
        addBox(
            group,
            new THREE.Vector3(
                0.35,
                5.5,
                0.7
            ),
            new THREE.Vector3(
                3,
                2.75,
                0
            ),
            frameMaterial,
            "DoorRight"
        );

    addBox(
        group,
        new THREE.Vector3(
            6.35,
            0.35,
            0.7
        ),
        new THREE.Vector3(
            0,
            5.25,
            0
        ),
        frameMaterial,
        "DoorTop"
    );

    addBox(
        group,
        new THREE.Vector3(
            5.2,
            0.08,
            0.15
        ),
        new THREE.Vector3(
            0,
            4.95,
            0
        ),
        glowMaterial,
        "DoorGlow"
    );

    scene.add(group);

    return group;
}
