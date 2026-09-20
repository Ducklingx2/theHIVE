import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

function box(
    group,
    size,
    position,
    material,
    rotation = 0
) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
            size.x,
            size.y,
            size.z
        ),
        material
    );

    mesh.position.copy(position);
    mesh.rotation.y = rotation;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);

    return mesh;
}

function cylinder(
    group,
    radius,
    height,
    position,
    material
) {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            8
        ),
        material
    );

    mesh.position.copy(position);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);

    return mesh;
}

function createCrate(group, x, z, materials) {
    const crate = box(
        group,
        new THREE.Vector3(2, 1.6, 2),
        new THREE.Vector3(x, 0.8, z),
        materials.wood
    );

    const bandMaterial = materials.darkWood;

    box(
        group,
        new THREE.Vector3(2.1, 0.18, 0.18),
        new THREE.Vector3(x, 0.8, z - 0.9),
        bandMaterial
    );

    box(
        group,
        new THREE.Vector3(2.1, 0.18, 0.18),
        new THREE.Vector3(x, 0.8, z + 0.9),
        bandMaterial
    );

    return crate;
}

function createPlant(group, x, z, materials) {
    const stem = cylinder(
        group,
        0.18,
        2.2,
        new THREE.Vector3(x, 1.1, z),
        materials.plantStem
    );

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;

        const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(
                0.45,
                8,
                6
            ),
            materials.plant
        );

        leaf.scale.set(
            1.6,
            0.35,
            0.8
        );

        leaf.position.set(
            x + Math.cos(angle) * 0.65,
            1.8 + Math.sin(i) * 0.2,
            z + Math.sin(angle) * 0.65
        );

        group.add(leaf);
    }
}

function createMachine(group, x, z, materials) {
    box(
        group,
        new THREE.Vector3(2.8, 2.4, 2),
        new THREE.Vector3(x, 1.2, z),
        materials.machine
    );

    cylinder(
        group,
        0.55,
        0.35,
        new THREE.Vector3(x, 2.2, z - 1.05),
        materials.metal
    );

    cylinder(
        group,
        0.25,
        2.5,
        new THREE.Vector3(x + 0.8, 3.2, z),
        materials.pipe
    );
}

function createWaterTank(group, x, z, materials) {
    cylinder(
        group,
        2.1,
        3.5,
        new THREE.Vector3(x, 1.75, z),
        materials.waterTank
    );

    cylinder(
        group,
        1.75,
        0.1,
        new THREE.Vector3(x, 3.52, z),
        materials.water
    );
}

function createQueenPlatform(group, materials) {
    const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(
            4,
            4,
            0.8,
            6
        ),
        materials.queenPlatform
    );

    platform.position.y = 0.4;

    platform.castShadow = true;
    platform.receiveShadow = true;

    group.add(platform);

    const glow = new THREE.PointLight(
        0xffc928,
        4,
        15
    );

    glow.position.y = 3;

    group.add(glow);
}

export function decorateRoom(room, materials) {
    const group = new THREE.Group();

    group.position.set(
        room.x,
        0,
        room.z
    );

    switch (room.id) {
        case "nursery":

            for (let i = 0; i < 6; i++) {
                createCrate(
                    group,
                    -3 + (i % 3) * 3,
                    -2 + Math.floor(i / 3) * 3,
                    materials
                );
            }

            break;

        case "garden":

            for (let i = 0; i < 8; i++) {
                const angle = i * 0.8;

                createPlant(
                    group,
                    Math.cos(angle) * 4,
                    Math.sin(angle) * 4,
                    materials
                );
            }

            break;

        case "storage":

            for (let i = 0; i < 9; i++) {
                createCrate(
                    group,
                    -3 + (i % 3) * 3,
                    -3 + Math.floor(i / 3) * 2.5,
                    materials
                );
            }

            break;

        case "workshop":

            createMachine(
                group,
                -3,
                0,
                materials
            );

            createMachine(
                group,
                3,
                1,
                materials
            );

            break;

        case "water":

            createWaterTank(
                group,
                -3,
                0,
                materials
            );

            createWaterTank(
                group,
                3,
                0,
                materials
            );

            break;

        case "queen":

            createQueenPlatform(
                group,
                materials
            );

            break;

        case "central":

            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3;

                createCrate(
                    group,
                    Math.cos(angle) * 5,
                    Math.sin(angle) * 5,
                    materials
                );
            }

            break;
    }

    room.group.add(group);
}
