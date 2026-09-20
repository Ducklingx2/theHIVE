import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const ROOM_HEIGHT = 7;
const WALL_THICKNESS = 0.8;

function hexPoints(radius, rotation = Math.PI / 6) {
    const points = [];

    for (let i = 0; i < 6; i++) {
        const angle = rotation + (Math.PI * 2 * i) / 6;

        points.push(
            new THREE.Vector2(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            )
        );
    }

    return points;
}

function createHexGeometry(radius, height) {
    const shape = new THREE.Shape();
    const points = hexPoints(radius);

    shape.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].y);
    }

    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: false
    });

    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, height / 2, 0);

    return geometry;
}

function createWallSegment(length, height, thickness, material) {
    const geometry = new THREE.BoxGeometry(
        length,
        height,
        thickness
    );

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
}

function createHexWalls(room, radius, material, openings = []) {
    const points = hexPoints(radius);

    for (let i = 0; i < 6; i++) {
        const a = points[i];
        const b = points[(i + 1) % 6];

        const midpoint = new THREE.Vector2(
            (a.x + b.x) / 2,
            (a.y + b.y) / 2
        );

        const length = a.distanceTo(b);
        const angle = Math.atan2(b.y - a.y, b.x - a.x);

        const wall = createWallSegment(
            length,
            ROOM_HEIGHT,
            WALL_THICKNESS,
            material
        );

        wall.position.set(
            room.x + midpoint.x,
            ROOM_HEIGHT / 2,
            room.z + midpoint.y
        );

        wall.rotation.y = -angle;

        /*
         * Door openings are represented by removing the wall segment.
         * For now the opening is determined by the side index.
         */
        if (!openings.includes(i)) {
            room.group.add(wall);
        }
    }
}

function createDoor(room, side, radius, materials) {
    const points = hexPoints(radius);

    const a = points[side];
    const b = points[(side + 1) % 6];

    const midpoint = new THREE.Vector2(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2
    );

    const angle = Math.atan2(b.y - a.y, b.x - a.x);

    const door = new THREE.Group();

    const frameMaterial = materials.doorFrame;

    const left = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 4.5, 0.65),
        frameMaterial
    );

    const right = left.clone();

    const top = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.45, 0.65),
        frameMaterial
    );

    left.position.set(-1.8, 2.25, 0);
    right.position.set(1.8, 2.25, 0);
    top.position.set(0, 4.5, 0);

    door.add(left, right, top);

    door.position.set(
        room.x + midpoint.x,
        0,
        room.z + midpoint.y
    );

    door.rotation.y = -angle;

    room.group.add(door);

    return door;
}

export function createRoom(scene, data, materials) {
    const group = new THREE.Group();

    group.position.set(data.x, 0, data.z);

    const floorMaterial = materials[data.floor] || materials.floor;

    const floor = new THREE.Mesh(
        createHexGeometry(data.radius, 0.25),
        floorMaterial
    );

    floor.position.y = 0.12;
    floor.receiveShadow = true;

    group.add(floor);

    /*
     * Ceiling
     */
    const ceilingMaterial = materials.ceiling;

    const ceiling = new THREE.Mesh(
        createHexGeometry(data.radius - 0.35, 0.18),
        ceilingMaterial
    );

    ceiling.position.y = ROOM_HEIGHT;

    group.add(ceiling);

    /*
     * Inner glow ring
     */
    const glowGeometry = new THREE.RingGeometry(
        data.radius - 1.0,
        data.radius - 0.8,
        6
    );

    const glowMaterial = new THREE.MeshBasicMaterial({
        color: data.glow || 0xffb300,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide
    });

    const glow = new THREE.Mesh(
        glowGeometry,
        glowMaterial
    );

    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.3;

    group.add(glow);

    const room = {
        ...data,
        group,
        glow,
        doors: []
    };

    createHexWalls(
        room,
        data.radius,
        materials[data.wall] || materials.wall,
        data.openings || []
    );

    for (const side of data.openings || []) {
        room.doors.push(
            createDoor(
                room,
                side,
                data.radius,
                materials
            )
        );
    }

    scene.add(group);

    return room;
}

export function getRoomInteriorRadius(room) {
    return room.radius - WALL_THICKNESS - 0.45;
}

export { ROOM_HEIGHT };
