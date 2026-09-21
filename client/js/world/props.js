import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/*
===========================================================
 HIVE PROPS
 Bright honey architecture + black industrial structure
===========================================================
*/

function addBox(
    group,
    collision,
    x,
    y,
    z,
    width,
    height,
    depth,
    material,
    name = "prop",
    collider = true
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

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);

    if (collider && collision) {
        collision.addBoxCollider(
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(width, depth, height),
            {
                yMin: 0,
                yMax: height,
                name
            }
        );
    }

    return mesh;
}


function addCylinder(
    group,
    collision,
    x,
    y,
    z,
    radius,
    height,
    material,
    name = "prop",
    collider = true,
    segments = 24
) {
    const geometry = new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        segments
    );

    const mesh = new THREE.Mesh(
        geometry,
        material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);

    if (collider && collision) {
        collision.addCylinderCollider(
            new THREE.Vector3(x, y, z),
            radius,
            {
                yMin: 0,
                yMax: height,
                name
            }
        );
    }

    return mesh;
}


function addBeam(
    group,
    collision,
    x,
    y,
    z,
    width,
    height,
    depth,
    materials,
    name
) {
    return addBox(
        group,
        collision,
        x,
        y,
        z,
        width,
        height,
        depth,
        materials.black,
        name
    );
}


/* ========================================================
   CRATE
======================================================== */

function createCrate(
    group,
    collision,
    x,
    z,
    materials,
    size = 1.6
) {
    addBox(
        group,
        collision,
        x,
        size / 2,
        z,
        size,
        size,
        size,
        materials.honey,
        "crate"
    );

    const band = 0.08;

    // vertical black bands
    addBeam(
        group,
        collision,
        x - size / 2 + band,
        size / 2,
        z,
        band,
        size,
        size + 0.02,
        materials,
        "crate-band"
    );

    addBeam(
        group,
        collision,
        x + size / 2 - band,
        size / 2,
        z,
        band,
        size,
        size + 0.02,
        materials,
        "crate-band"
    );

    // horizontal bands
    addBeam(
        group,
        collision,
        x,
        size * 0.25,
        z - size / 2 - 0.02,
        size,
        band,
        band
            ? size
            : size,
        materials,
        "crate-band"
    );

    // top inset
    addBox(
        group,
        collision,
        x,
        size + 0.035,
        z,
        size * 0.72,
        0.06,
        size * 0.72,
        materials.darkHoney,
        "crate-top",
        false
    );
}


/* ========================================================
   SHELF
======================================================== */

function createShelf(
    group,
    collision,
    x,
    z,
    materials
) {
    const width = 3.6;
    const depth = 0.8;
    const height = 3.2;

    // uprights
    for (const px of [-width / 2, width / 2]) {

        addBeam(
            group,
            collision,
            x + px,
            height / 2,
            z,
            0.18,
            height,
            0.18,
            materials,
            "shelf-frame"
        );
    }

    // shelves
    for (const y of [0.5, 1.45, 2.4, 3.2]) {

        addBox(
            group,
            collision,
            x,
            y,
            z,
            width,
            0.15,
            depth,
            materials.black,
            "shelf"
        );
    }

    // stored containers
    for (let row = 0; row < 3; row++) {

        for (let col = -1; col <= 1; col++) {

            addBox(
                group,
                collision,
                x + col * 0.9,
                0.72 + row * 0.95,
                z,
                0.65,
                0.45,
                0.55,
                materials.honey,
                "storage-container"
            );
        }
    }
}


/* ========================================================
   WORKBENCH
======================================================== */

function createWorkbench(
    group,
    collision,
    x,
    z,
    materials
) {
    const width = 3.8;
    const depth = 1.4;

    addBox(
        group,
        collision,
        x,
        1.15,
        z,
        width,
        0.25,
        depth,
        materials.black,
        "workbench"
    );

    for (const px of [-1.5, 1.5]) {

        addBeam(
            group,
            collision,
            x + px,
            0.55,
            z,
            0.2,
            1.1,
            0.2,
            materials,
            "workbench-leg"
        );
    }

    // golden work surface
    addBox(
        group,
        collision,
        x,
        1.31,
        z,
        width - 0.15,
        0.12,
        depth - 0.15,
        materials.honey,
        "workbench-surface"
    );

    // tools
    for (let i = -1; i <= 1; i++) {

        addCylinder(
            group,
            collision,
            x + i * 0.65,
            1.48,
            z,
            0.07,
            0.55,
            materials.metal,
            "tool",
            false,
            12
        );
    }
}


/* ========================================================
   MACHINE
======================================================== */

function createMachine(
    group,
    collision,
    x,
    z,
    materials
) {
    // main body
    addBox(
        group,
        collision,
        x,
        1.25,
        z,
        2.3,
        2.5,
        1.6,
        materials.black,
        "machine"
    );

    // golden front panel
    addBox(
        group,
        collision,
        x,
        1.35,
        z - 0.83,
        1.7,
        1.4,
        0.08,
        materials.honey,
        "machine-panel",
        false
    );

    // control buttons
    for (let i = -1; i <= 1; i++) {

        addCylinder(
            group,
            collision,
            x + i * 0.35,
            1.9,
            z - 0.9,
            0.09,
            0.08,
            materials.glow,
            "machine-button",
            false,
            16
        );
    }

    // top pipe
    addCylinder(
        group,
        collision,
        x,
        2.85,
        z,
        0.28,
        0.7,
        materials.metal,
        "machine-pipe",
        true
    );

    // black cap
    addCylinder(
        group,
        collision,
        x,
        3.25,
        z,
        0.38,
        0.12,
        materials.black,
        "machine-cap",
        false
    );
}


/* ========================================================
   WATER TANK
======================================================== */

function createWaterTank(
    group,
    collision,
    x,
    z,
    materials
) {
    addCylinder(
        group,
        collision,
        x,
        1.8,
        z,
        1.15,
        3.6,
        materials.honey,
        "water-tank"
    );

    // black support rings
    for (const y of [0.35, 1.8, 3.25]) {

        addCylinder(
            group,
            collision,
            x,
            y,
            z,
            1.22,
            0.12,
            materials.black,
            "tank-ring",
            false
        );
    }

    // top
    addCylinder(
        group,
        collision,
        x,
        3.7,
        z,
        0.55,
        0.3,
        materials.black,
        "tank-cap"
    );

    // pipe
    addCylinder(
        group,
        collision,
        x + 1.1,
        1.0,
        z,
        0.13,
        1.8,
        materials.metal,
        "tank-pipe"
    );
}


/* ========================================================
   PLANT
======================================================== */

function createPlant(
    group,
    collision,
    x,
    z,
    materials
) {
    // pot
    addCylinder(
        group,
        collision,
        x,
        0.45,
        z,
        0.55,
        0.9,
        materials.black,
        "plant-pot"
    );

    // soil
    addCylinder(
        group,
        collision,
        x,
        0.92,
        z,
        0.45,
        0.08,
        materials.darkHoney,
        "plant-soil",
        false
    );

    // stem
    addCylinder(
        group,
        collision,
        x,
        1.45,
        z,
        0.11,
        1.1,
        materials.plantStem,
        "plant-stem"
    );

    // leaves
    for (let i = 0; i < 5; i++) {

        const angle =
            (i / 5) * Math.PI * 2;

        const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(
                0.38,
                12,
                8
            ),
            materials.plant
        );

        leaf.scale.set(
            1.5,
            0.45,
            0.7
        );

        leaf.position.set(
            x + Math.cos(angle) * 0.35,
            1.9 + Math.sin(i) * 0.12,
            z + Math.sin(angle) * 0.35
        );

        leaf.rotation.y = angle;

        leaf.castShadow = true;
        leaf.receiveShadow = true;

        group.add(leaf);
    }

    // shared foliage collision
    if (collision) {
        collision.addCylinderCollider(
            new THREE.Vector3(x, 1.5, z),
            0.75,
            {
                yMin: 0,
                yMax: 2.5,
                name: "plant"
            }
        );
    }
}


/* ========================================================
   PIPE
======================================================== */

function createPipe(
    group,
    collision,
    x,
    z,
    materials,
    length = 3
) {
    addCylinder(
        group,
        collision,
        x,
        1.8,
        z,
        0.16,
        length,
        materials.metal,
        "pipe",
        true
    );
}


/* ========================================================
   LIGHT
======================================================== */

function createLight(
    group,
    x,
    y,
    z,
    materials
) {
    addCylinder(
        group,
        null,
        x,
        y,
        z,
        0.16,
        0.12,
        materials.glow,
        "hive-light",
        false
    );

    const light = new THREE.PointLight(
        0xffc247,
        1.4,
        7,
        2
    );

    light.position.set(
        x,
        y,
        z
    );

    group.add(light);
}


/* ========================================================
   HEX WALL PANEL
======================================================== */

function createHexPanel(
    group,
    x,
    y,
    z,
    materials,
    scale = 1
) {
    const geometry =
        new THREE.CylinderGeometry(
            1.0 * scale,
            1.0 * scale,
            0.12,
            6
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            materials.honey
        );

    mesh.rotation.x =
        Math.PI / 2;

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;

    group.add(mesh);

    return mesh;
}


/* ========================================================
   ROOM DECORATION
======================================================== */

export function decorateRoom(
    room,
    materials,
    collision
) {
    const group =
        room.object ||
        room.group ||
        new THREE.Group();

    group.name =
        `${room.name}-Props`;

    const x = room.x;
    const z = room.z;

    switch (room.name) {

        /* ---------------- NURSERY ---------------- */

        case "Nursery":

            createCrate(
                group,
                collision,
                x - 3,
                z - 2,
                materials,
                1.5
            );

            createCrate(
                group,
                collision,
                x + 2.5,
                z - 2.5,
                materials,
                1.2
            );

            createPlant(
                group,
                collision,
                x - 2,
                z + 2,
                materials
            );

            createPlant(
                group,
                collision,
                x + 2,
                z + 2,
                materials
            );

            createLight(
                group,
                x,
                3.8,
                z,
                materials
            );

            break;


        /* ---------------- GARDEN ---------------- */

        case "Garden":

            createPlant(
                group,
                collision,
                x - 3,
                z - 2,
                materials
            );

            createPlant(
                group,
                collision,
                x,
                z - 2,
                materials
            );

            createPlant(
                group,
                collision,
                x + 3,
                z,
                materials
            );

            createPlant(
                group,
                collision,
                x - 1,
                z + 2.5,
                materials
            );

            createWaterTank(
                group,
                collision,
                x + 3,
                z + 2,
                materials
            );

            break;


        /* ---------------- STORAGE ---------------- */

        case "Storage":

            createShelf(
                group,
                collision,
                x - 2.4,
                z + 2,
                materials
            );

            createShelf(
                group,
                collision,
                x + 2.4,
                z + 2,
                materials
            );

            createCrate(
                group,
                collision,
                x - 2,
                z - 2,
                materials
            );

            createCrate(
                group,
                collision,
                x,
                z - 2,
                materials,
                1.3
            );

            createCrate(
                group,
                collision,
                x + 2,
                z - 2,
                materials,
                1.1
            );

            break;


        /* ---------------- WORKSHOP ---------------- */

        case "Workshop":

            createWorkbench(
                group,
                collision,
                x - 2,
                z - 2,
                materials
            );

            createMachine(
                group,
                collision,
                x + 2,
                z + 1,
                materials
            );

            createMachine(
                group,
                collision,
                x - 1,
                z + 2.5,
                materials
            );

            createPipe(
                group,
                collision,
                x + 3,
                z - 2,
                materials
            );

            break;


        /* ---------------- WATER ---------------- */

        case "Water":

            createWaterTank(
                group,
                collision,
                x - 2.3,
                z - 1.5,
                materials
            );

            createWaterTank(
                group,
                collision,
                x + 2,
                z + 2,
                materials
            );

            createPipe(
                group,
                collision,
                x,
                z,
                materials
            );

            break;


        /* ---------------- QUEEN ---------------- */

        case "Queen Chamber":

            addCylinder(
                group,
                collision,
                x,
                0.3,
                z,
                3.4,
                0.6,
                materials.black,
                "queen-platform"
            );

            addCylinder(
                group,
                collision,
                x,
                0.42,
                z,
                3.1,
                0.12,
                materials.honey,
                "queen-platform-top",
                false
            );

            addCylinder(
                group,
                collision,
                x,
                1.1,
                z,
                1.4,
                1.2,
                materials.black,
                "queen-seat"
            );

            createLight(
                group,
                x,
                4.5,
                z,
                materials
            );

            break;


        /* ---------------- CENTRAL HIVE ---------------- */

        case "Central Hive":

            createWorkbench(
                group,
                collision,
                x - 3,
                z + 2,
                materials
            );

            createCrate(
                group,
                collision,
                x + 3,
                z - 2,
                materials,
                1.3
            );

            createLight(
                group,
                x,
                5,
                z,
                materials
            );

            // decorative wall panels
            for (let i = -2; i <= 2; i++) {

                createHexPanel(
                    group,
                    x + i * 2,
                    2.8,
                    z - 5.5,
                    materials,
                    0.7
                );
            }

            break;
    }

    return group;
}
