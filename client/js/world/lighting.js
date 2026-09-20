import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export function createHiveLighting(scene) {
    const hemisphere = new THREE.HemisphereLight(
        0xffd27a,
        0x120805,
        2.4
    );

    scene.add(hemisphere);

    const mainLight = new THREE.DirectionalLight(
        0xffc15a,
        3.5
    );

    mainLight.position.set(20, 35, 15);

    // Shadows are intentionally disabled for now.
    mainLight.castShadow = false;

    scene.add(mainLight);

    const centralGlow = new THREE.PointLight(
        0xff9f24,
        28,
        55,
        2
    );

    centralGlow.position.set(0, 7, 0);
    centralGlow.castShadow = false;

    scene.add(centralGlow);

    const secondaryGlow = new THREE.PointLight(
        0xffc45c,
        12,
        40,
        2
    );

    secondaryGlow.position.set(0, 5, 25);
    secondaryGlow.castShadow = false;

    scene.add(secondaryGlow);

    return {
        hemisphere,
        mainLight,
        centralGlow,
        secondaryGlow
    };
}
