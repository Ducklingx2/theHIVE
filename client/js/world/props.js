import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

function box(
    group,
    collision,
    x,
    y,
    z,
    width,
    height,
    depth,
    material,
    name = "prop"
) {
    const geometry = new THREE.BoxGeometry(
        width,
        height,
        depth
    );

    const mesh = new THREE.Mesh(
        geometry,
        material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = false;
    mesh.receiveShadow = false;

    group.add(mesh);

    collision.addBoxCollider(
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(width, depth, depth),
        {
            yMin: 0,
            yMax: height,
            name
        }
    );

    return mesh;
}

function cylinder(
    group,
    collision,
    x,
    y,
    z,
    radius,
    height,
    material,
    name = "prop"
) {
    const geometry = new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        16
    );

    const mesh = new THREE.Mesh(
        geometry,
        material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = false;
    mesh.receiveShadow = false;

    group.add(mesh);

    collision.addCylinderCollider(
        new THREE.Vector3(x, y, z),
        radius,
        {
            yMin: 0,
            yMax: height,
            name
        }
    );

    return mesh;
}

function createCrate(
    group,
    collision,
    x,
    z,
    materials,
    size = 1.6
) {
    box(
        group,
        collision,
        x,
        size / 2,
        z,
        size,
        size,
        size,
        materials.wood,
        "crate"
    );
}

function createPlant(
    group,
    collision,
    x,
    z,
    materials
) {
    cylinder(
        group,
        collision,
        x,
        0.45,
        z,
        0.45,
        0.9,
        materials.wood,
        "plant-pot"
    );

    cylinder(
        group,
        collision,
        x,
        1.35,
        z,
        0.18,
        1.0,
        materials.plantStem,
        "plant-stem"
    );

    const leaves = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.75, 1),
        materials.plant
    );

    leaves.position.set(x, 2.0, z);

    group.add(leaves);

    collision.addCylinderCollider(
        new THREE.Vector3(x, 2, z),
        0.75,
        {
            yMin: 0,
            yMax: 3,
            name: "plant"
        }
    );
}

function createMachine(
    group,
    collision,
    x,
    z,
    materials
) {
    box(
        group,
        collision,
        x,
        1.2,
        z,
        2.2,
        2.4,
        1.6,
        materials.machine,
        "workshop-machine"
    );

    cylinder(
        group,
        collision,
        x,
        2.8,
        z,
        0.35,
        0.7,
        materials.metal,
        "machine-cylinder"
    );
}

function createWaterTank(
    group,
    collision,
    x,
    z,
    materials
) {
    cylinder(
        group,
        collision,
        x,
        1.6,
        z,
        1.15,
        3.2,
        materials.waterTank,
        "water-tank"
    );

    cylinder(
        group,
        collision,
        x,
        3.35,
        z,
        0.5,
        0.35,
        materials.metal,
        "tank-cap"
    );
}

function createQueenPlatform(
    group,
    collision,
    x,
    z,
    materials
) {
    cylinder(
        group,
        collision,
        x,
        0.35,
        z,
        3.0,
        0.7,
        materials.queenPlatform,
        "queen-platform"
    );

    cylinder(
        group,
        collision,
        x,
        1.2,
        z,
        1.2,
        1.0,
        materials.queenPlatform,
        "queen-seat"
    );
}

export function decorateRoom(
    room,
    materials,
    collision
) {
    const group = new THREE.Group();

    group.name = `${room.name}-Props`;

    switch (room.name) {
        case "Nursery":
            createCrate(
                group,
                collision,
                room.x - 3,
                room.z - 2,
                materials
            );

            createCrate(
                group,
                collision,
                room.x + 2,
                room.z - 3,
                materials,
                1.2
            );

            break;

        case "Garden":
            createPlant(
                group,
                collision,
                room.x - 2,
                room.z - 2,
                materials
            );

            createPlant(
                group,
                collision,
                room.x + 2,
                room.z + 1,
                materials
            );

            createPlant(
                group,
                collision,
                room.x - 1,
                room.z + 3,
                materials
            );

            break;

        case "Storage":
            createCrate(
                group,
                collision,
                room.x - 2,
                room.z - 2,
                materials
            );

            createCrate(
                group,
                collision,
                room.x,
                room.z - 2,
                materials
            );

            createCrate(
                group,
                collision,
                room.x + 2,
                room.z - 2,
                materials
            );

            createCrate(
                group,
                collision,
                room.x + 1,
                room.z + 1,
                materials,
                1.3
            );

            break;

        case "Workshop":
            createMachine(
                group,
                collision,
                room.x - 2,
                room.z - 2,
                materials
            );

            createMachine(
                group,
                collision,
                room.x + 2,
                room.z + 1,
                materials
            );

            break;

        case "Water":
            createWaterTank(
                group,
                collision,
                room.x - 2,
                room.z - 1,
                materials
            );

            createWaterTank(
                group,
                collision,
                room.x + 2,
                room.z + 2,
                materials
            );

            break;

        case "Queen":
            createQueenPlatform(
                group,
                collision,
                room.x,
                room.z,
                materials
            );

            break;

        case "Central":
            createCrate(
                group,
                collision,
                room.x - 3,
                room.z + 2,
                materials,
                1.3
            );

            createCrate(
                group,
                collision,
                room.x + 3,
                room.z - 2,
                materials,
                1.3
            );

            break;
    }

    room.group.add(group);

    return group;
}
