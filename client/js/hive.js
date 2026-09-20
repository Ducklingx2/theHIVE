import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


export function createHexShape(
    radius,
    height
) {

    const shape =
        new THREE.Shape();

    const points = [];

    for (let i = 0; i < 6; i++) {

        const angle =
            Math.PI / 6 +
            i * Math.PI / 3;

        points.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        });
    }


    shape.moveTo(
        points[0].x,
        points[0].y
    );

    for (let i = 1; i < points.length; i++) {

        shape.lineTo(
            points[i].x,
            points[i].y
        );
    }

    shape.closePath();


    const geometry =
        new THREE.ExtrudeGeometry(
            shape,
            {
                depth: height,
                bevelEnabled: true,
                bevelSegments: 2,
                bevelSize: 0.08,
                bevelThickness: 0.08
            }
        );


    geometry.rotateX(
        -Math.PI / 2
    );

    geometry.translate(
        0,
        height / 2,
        0
    );


    return geometry;
}


export function createHexRoom(
    radius,
    height,
    material
) {

    const geometry =
        createHexShape(
            radius,
            height
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
}


export function createHexOutline(
    radius,
    height,
    color = 0xffb52e
) {

    const geometry =
        new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            6
        );

    const edges =
        new THREE.EdgesGeometry(
            geometry
        );

    const material =
        new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.8
        });

    const outline =
        new THREE.LineSegments(
            edges,
            material
        );

    outline.rotation.y =
        Math.PI / 6;

    return outline;
}


export function createHexGlow(
    radius,
    color = 0xffa51c
) {

    const geometry =
        new THREE.CylinderGeometry(
            radius,
            radius,
            0.05,
            6
        );

    const material =
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.18
        });

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.rotation.y =
        Math.PI / 6;

    return mesh;
}
