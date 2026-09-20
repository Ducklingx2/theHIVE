import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export function createCorridor(
    scene,
    from,
    to,
    width,
    materials
) {
    const group = new THREE.Group();

    const start = new THREE.Vector3(
        from.x,
        0,
        from.z
    );

    const end = new THREE.Vector3(
        to.x,
        0,
        to.z
    );

    const direction = new THREE.Vector3()
        .subVectors(end, start);

    const length = direction.length();

    const angle = Math.atan2(
        direction.x,
        direction.z
    );

    const midpoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);

    group.position.copy(midpoint);
    group.rotation.y = angle;

    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            0.3,
            length
        ),
        materials.corridorFloor
    );

    floor.position.y = -0.15;
    floor.name = "corridor-floor";

    group.add(floor);

    const ceiling = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            0.3,
            length
        ),
        materials.ceiling
    );

    ceiling.position.y = 6;
    ceiling.name = "corridor-ceiling";

    group.add(ceiling);

    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.55,
            6,
            length
        ),
        materials.corridorWall
    );

    leftWall.position.set(
        -width / 2,
        3,
        0
    );

    leftWall.name = "corridor-left-wall";

    group.add(leftWall);

    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.55,
            6,
            length
        ),
        materials.corridorWall
    );

    rightWall.position.set(
        width / 2,
        3,
        0
    );

    rightWall.name = "corridor-right-wall";

    group.add(rightWall);

    // Ceiling lights
    const lightCount = Math.max(
        2,
        Math.floor(length / 5)
    );

    for (let i = 0; i < lightCount; i++) {
        const t =
            (i + 0.5) / lightCount;

        const light = new THREE.Mesh(
            new THREE.BoxGeometry(
                2.2,
                0.12,
                0.5
            ),
            materials.light
        );

        light.position.set(
            0,
            5.78,
            -length / 2 + length * t
        );

        light.name = "corridor-light";

        group.add(light);
    }

    scene.add(group);

    return {
        group,
        start,
        end,
        width,
        length
    };
}
