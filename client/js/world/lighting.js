import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export function createHiveLighting(scene) {
    // Soft overall illumination
    const hemisphere = new THREE.HemisphereLight(
        0xffd27a,
        0x160b05,
        2.2
    );

    scene.add(hemisphere);

    // ONE shadow-casting light.
    // Keeping shadows limited to a single light avoids excessive
    // shadow-map texture samplers on lower-end GPUs.
    const mainLight = new THREE.DirectionalLight(
        0xffc15a,
        3.2
    );

    mainLight.position.set(20, 35, 15);
    mainLight.castShadow = true;

    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;

    mainLight.shadow.camera.near = 1;
    mainLight.shadow.camera.far = 100;

    mainLight.shadow.camera.left = -55;
    mainLight.shadow.camera.right = 55;
    mainLight.shadow.camera.top = 55;
    mainLight.shadow.camera.bottom = -55;

    mainLight.shadow.bias = -0.0005;

    scene.add(mainLight);

    // Ambient Hive glow
    const hiveGlow = new THREE.PointLight(
        0xff9f24,
        35,
        55,
        2
    );

    hiveGlow.position.set(0, 7, 0);
    hiveGlow.castShadow = false;

    scene.add(hiveGlow);

    // Secondary warm light.
    // No shadows here.
    const secondaryGlow = new THREE.PointLight(
        0xffc45c,
        18,
        40,
        2
    );

    secondaryGlow.position.set(0, 4, 25);
    secondaryGlow.castShadow = false;

    scene.add(secondaryGlow);

    return {
        hemisphere,
        mainLight,
        hiveGlow,
        secondaryGlow
    };
}
