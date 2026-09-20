import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const CORRIDOR_HEIGHT = 6;
const CORRIDOR_WIDTH = 5;

function createWall(length, material) {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(
            length,
            CORRIDOR_HEIGHT,
            0.7
        ),
        material
    );

    wall.castShadow = true;
    wall.receiveShadow = true;

    return wall;
}

export function createCorridor(scene, a, b, materials, options = {}) {
    const group = new THREE.Group();

    const start = new THREE.Vector3(a.x, 0, a.z);
    const end = new THREE.Vector3(b.x, 0, b.z);

    const direction = new THREE.Vector3()
        .subVectors(end, start);

    const length = direction.length();
    const angle = Math.atan2(direction.z, direction.x);

    const midpoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);

    /*
     * Floor
     */
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(
            length,
            0.25,
            CORRIDOR_WIDTH
        ),
        materials.corridorFloor
    );

    floor.position.copy(midpoint);
    floor.position.y = 0.12;

    floor.rotation.y = angle;

    floor.receiveShadow = true;

    group.add(floor);

    /*
     * Ceiling
     */
    const ceiling = new THREE.Mesh(
        new THREE.BoxGeometry(
            length,
            0.25,
            CORRIDOR_WIDTH
        ),
        materials.ceiling
    );

    ceiling.position.copy(midpoint);
    ceiling.position.y = CORRIDOR_HEIGHT;

    ceiling.rotation.y = angle;

    group.add(ceiling);

    /*
     * Walls
     */
    const leftWall = createWall(
        length,
        materials.corridorWall
    );

    const rightWall = createWall(
        length,
        materials.corridorWall
    );

    const sideOffset = CORRIDOR_WIDTH / 2;

    leftWall.position.set(
        0,
        CORRIDOR_HEIGHT / 2,
        sideOffset
    );

    rightWall.position.set(
        0,
        CORRIDOR_HEIGHT / 2,
        -sideOffset
    );

    leftWall.position.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angle
    );

    rightWall.position.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angle
    );

    leftWall.position.add(midpoint);
    rightWall.position.add(midpoint);

    leftWall.rotation.y = angle;
    rightWall.rotation.y = angle;

    group.add(leftWall, rightWall);

    /*
     * Ceiling lights
     */
    const lightCount = Math.max(2, Math.floor(length / 7));

    for (let i = 0; i < lightCount; i++) {
        const t = (i + 0.5) / lightCount;

        const position = new THREE.Vector3().lerpVectors(
            start,
            end,
            t
        );

        const light = new THREE.PointLight(
            0xffb52e,
            1.2,
            9
        );

        light.position.set(
            position.x,
            CORRIDOR_HEIGHT - 0.7,
            position.z
        );

        light.castShadow = true;

        group.add(light);

        const fixture = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.18, 0.7),
            materials.light
        );

        fixture.position.copy(light.position);

        group.add(fixture);
    }

    scene.add(group);

    return {
        group,
        start,
        end,
        width: CORRIDOR_WIDTH,
        length
    };
}

export { CORRIDOR_WIDTH };
