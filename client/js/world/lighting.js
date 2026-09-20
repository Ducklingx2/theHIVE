import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export function createHiveLighting(scene) {
    const ambient = new THREE.HemisphereLight(
        0x5c3419,
        0x090604,
        1.5
    );

    scene.add(ambient);

    const main = new THREE.DirectionalLight(
        0xffc15a,
        2.0
    );

    main.position.set(
        0,
        35,
        5
    );

    main.castShadow = true;

    main.shadow.mapSize.width = 2048;
    main.shadow.mapSize.height = 2048;

    main.shadow.camera.near = 1;
    main.shadow.camera.far = 100;

    main.shadow.camera.left = -45;
    main.shadow.camera.right = 45;
    main.shadow.camera.top = 45;
    main.shadow.camera.bottom = -45;

    scene.add(main);

    /*
     * Warm central hive light.
     */
    const central = new THREE.PointLight(
        0xff9d18,
        5,
        30
    );

    central.position.set(
        0,
        5,
        0
    );

    central.castShadow = true;

    scene.add(central);

    /*
     * Cool secondary light.
     */
    const secondary = new THREE.PointLight(
        0xffd37a,
        2,
        45
    );

    secondary.position.set(
        0,
        10,
        20
    );

    scene.add(secondary);

    return {
        ambient,
        main,
        central,
        secondary
    };
}
