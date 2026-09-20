import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const WALL = 0.6;

function addMesh(group, geometry, material, position, name) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.copy(position);
    mesh.name = name;

    mesh.castShadow = false;
    mesh.receiveShadow = false;

    group.add(mesh);

    return mesh;
}

function createFloor(group, room, material) {
    const floor = addMesh(
        group,
        new THREE.BoxGeometry(
            room.width,
            0.35,
            room.depth
        ),
        material,
        new THREE.Vector3(
            room.x,
            -0.18,
            room.z
        ),
        `${room.id}-floor`
    );

    return floor;
}

function createCeiling(group, room, material) {
    const ceiling = addMesh(
        group,
        new THREE.BoxGeometry(
            room.width,
            0.35,
            room.depth
        ),
        material,
        new THREE.Vector3(
            room.x,
            room.height,
            room.z
        ),
        `${room.id}-ceiling`
    );

    return ceiling;
}

function createWall(
    group,
    room,
    x,
    z,
    width,
    depth,
    material,
    name
) {
    return addMesh(
        group,
        new THREE.BoxGeometry(
            width,
            room.height,
            depth
        ),
        material,
        new THREE.Vector3(
            x,
            room.height / 2,
            z
        ),
        name
    );
}

function createDoorFrame(
    group,
    x,
    z,
    rotation,
    material
) {
    const frame = new THREE.Group();

    frame.position.set(x, 0, z);
    frame.rotation.y = rotation;

    const left = addMesh(
        frame,
        new THREE.BoxGeometry(
            0.35,
            4.8,
            0.35
        ),
        material,
        new THREE.Vector3(-2.35, 2.4, 0),
        "door-frame-left"
    );

    const right = addMesh(
        frame,
        new THREE.BoxGeometry(
            0.35,
            4.8,
            0.35
        ),
        material,
        new THREE.Vector3(2.35, 2.4, 0),
        "door-frame-right"
    );

    const top = addMesh(
        frame,
        new THREE.BoxGeometry(
            5.05,
            0.35,
            0.35
        ),
        material,
        new THREE.Vector3(0, 4.8, 0),
        "door-frame-top"
    );

    group.add(frame);

    return frame;
}

function createWallPanels(
    group,
    room,
    material,
    accentMaterial
) {
    const panelHeight = 3.2;

    const positions = [
        [
            room.x - room.width / 2 + 0.35,
            panelHeight / 2,
            room.z
        ],
        [
            room.x + room.width / 2 - 0.35,
            panelHeight / 2,
            room.z
        ]
    ];

    for (const position of positions) {
        const panel = addMesh(
            group,
            new THREE.BoxGeometry(
                0.12,
                panelHeight,
                room.depth - 1
            ),
            material,
            new THREE.Vector3(
                position[0],
                position[1],
                position[2]
            ),
            `${room.id}-wall-panel`
        );

        panel.userData.decorative = true;
    }

    const horizontal = addMesh(
        group,
        new THREE.BoxGeometry(
            room.width - 1,
            0.18,
            0.18
        ),
        accentMaterial,
        new THREE.Vector3(
            room.x,
            3.1,
            room.z - room.depth / 2 + 0.35
        ),
        `${room.id}-accent-strip`
    );

    horizontal.userData.decorative = true;
}

function createPillars(
    group,
    room,
    material,
    accentMaterial
) {
    const corners = [
        [-room.width / 2 + 0.8, -room.depth / 2 + 0.8],
        [room.width / 2 - 0.8, -room.depth / 2 + 0.8],
        [-room.width / 2 + 0.8, room.depth / 2 - 0.8],
        [room.width / 2 - 0.8, room.depth / 2 - 0.8]
    ];

    for (const [x, z] of corners) {
        const pillar = addMesh(
            group,
            new THREE.BoxGeometry(
                0.7,
                room.height,
                0.7
            ),
            material,
            new THREE.Vector3(
                room.x + x,
                room.height / 2,
                room.z + z
            ),
            `${room.id}-pillar`
        );

        const cap = addMesh(
            group,
            new THREE.BoxGeometry(
                0.95,
                0.25,
                0.95
            ),
            accentMaterial,
            new THREE.Vector3(
                room.x + x,
                room.height - 0.15,
                room.z + z
            ),
            `${room.id}-pillar-cap`
        );

        pillar.userData.decorative = true;
        cap.userData.decorative = true;
    }
}

function createCeilingStructure(
    group,
    room,
    material,
    accentMaterial
) {
    const beam1 = addMesh(
        group,
        new THREE.BoxGeometry(
            room.width - 1,
            0.3,
            0.35
        ),
        material,
        new THREE.Vector3(
            room.x,
            room.height - 0.35,
            room.z
        ),
        `${room.id}-ceiling-beam`
    );

    const beam2 = addMesh(
        group,
        new THREE.BoxGeometry(
            0.35,
            0.3,
            room.depth - 1
        ),
        material,
        new THREE.Vector3(
            room.x,
            room.height - 0.35,
            room.z
        ),
        `${room.id}-ceiling-beam-cross`
    );

    const light = addMesh(
        group,
        new THREE.BoxGeometry(
            2.2,
            0.12,
            0.5
        ),
        accentMaterial,
        new THREE.Vector3(
            room.x,
            room.height - 0.58,
            room.z
        ),
        `${room.id}-ceiling-light`
    );

    beam1.userData.decorative = true;
    beam2.userData.decorative = true;
    light.userData.decorative = true;
}

export function createRoomArchitecture(
    scene,
    room,
    materials
) {
    const group = new THREE.Group();

    group.name = `ROOM_${room.id.toUpperCase()}`;

    scene.add(group);

    createFloor(
        group,
        room,
        materials.floor
    );

    createCeiling(
        group,
        room,
        materials.ceiling
    );

    /*
        Each room is a REAL enclosed rectangular room.

        Doors are created separately.
        For now we leave a doorway in the
        center of each connected wall.
    */

    createWall(
        group,
        room,
        room.x,
        room.z - room.depth / 2,
        room.width,
        WALL,
        materials.wall,
        `${room.id}-north-wall`
    );

    createWall(
        group,
        room,
        room.x,
        room.z + room.depth / 2,
        room.width,
        WALL,
        materials.wall,
        `${room.id}-south-wall`
    );

    createWall(
        group,
        room,
        room.x - room.width / 2,
        room.z,
        WALL,
        room.depth,
        materials.wall,
        `${room.id}-west-wall`
    );

    createWall(
        group,
        room,
        room.x + room.width / 2,
        room.z,
        WALL,
        room.depth,
        materials.wall,
        `${room.id}-east-wall`
    );

    createWallPanels(
        group,
        room,
        materials.darkWall,
        materials.accent
    );

    createPillars(
        group,
        room,
        materials.darkWall,
        materials.accent
    );

    createCeilingStructure(
        group,
        room,
        materials.darkWall,
        materials.light
    );

    return group;
}

export function createDoor(
    scene,
    position,
    rotation,
    materials
) {
    return createDoorFrame(
        scene,
        position.x,
        position.z,
        rotation,
        materials.accent
    );
}
