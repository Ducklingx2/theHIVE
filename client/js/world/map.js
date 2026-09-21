import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/*
===========================================================
THE HIVE - WORLD MAP
===========================================================

The map is deliberately laid out like an actual facility.

                 NURSERY
                    |
                    |
       GARDEN -- CENTRAL -- STORAGE
                    |
             WORKSHOP -- WATER
                    |
              QUEEN CHAMBER

Every room has a physical doorway.
Corridors connect doorway-to-doorway.
*/

export const MAP = {

    rooms: [

        {
            id: "central",
            name: "Central Hive",
            type: "central",

            x: 0,
            z: 0,

            width: 20,
            depth: 18,
            height: 8,

            connections: [
                "nursery",
                "garden",
                "storage",
                "workshop",
                "water",
                "queen"
            ]
        },

        {
            id: "nursery",
            name: "Nursery",
            type: "nursery",

            x: 0,
            z: -28,

            width: 16,
            depth: 14,
            height: 7,

            connections: [
                "central"
            ]
        },

        {
            id: "garden",
            name: "Garden",
            type: "garden",

            x: -27,
            z: -11,

            width: 16,
            depth: 15,
            height: 7,

            connections: [
                "central"
            ]
        },

        {
            id: "storage",
            name: "Storage",
            type: "storage",

            x: 27,
            z: -11,

            width: 16,
            depth: 15,
            height: 7,

            connections: [
                "central"
            ]
        },

        {
            id: "workshop",
            name: "Workshop",
            type: "workshop",

            x: -25,
            z: 17,

            width: 17,
            depth: 15,
            height: 7,

            connections: [
                "central",
                "water"
            ]
        },

        {
            id: "water",
            name: "Water Processing",
            type: "water",

            x: 25,
            z: 17,

            width: 17,
            depth: 15,
            height: 7,

            connections: [
                "central",
                "workshop"
            ]
        },

        {
            id: "queen",
            name: "Queen Chamber",
            type: "queen",

            x: 0,
            z: 29,

            width: 18,
            depth: 15,
            height: 9,

            connections: [
                "central"
            ]
        }
    ],

    corridors: [
        {
            id: "central-nursery",
            from: "central",
            to: "nursery",
            width: 6
        },

        {
            id: "central-garden",
            from: "central",
            to: "garden",
            width: 6
        },

        {
            id: "central-storage",
            from: "central",
            to: "storage",
            width: 6
        },

        {
            id: "central-workshop",
            from: "central",
            to: "workshop",
            width: 6
        },

        {
            id: "central-water",
            from: "central",
            to: "water",
            width: 6
        },

        {
            id: "central-queen",
            from: "central",
            to: "queen",
            width: 6
        },

        {
            id: "workshop-water",
            from: "workshop",
            to: "water",
            width: 5
        }
    ]
};

export function getRoom(id) {

    return MAP.rooms.find(
        room => room.id === id
    );
}

export function getCorridor(id) {

    return MAP.corridors.find(
        corridor => corridor.id === id
    );
}

export function getRoomCenter(room) {

    return new THREE.Vector3(
        room.x,
        0,
        room.z
    );
}

export function getRoomByPosition(x, z) {

    for (const room of MAP.rooms) {

        const halfWidth =
            room.width / 2;

        const halfDepth =
            room.depth / 2;

        if (
            x >= room.x - halfWidth &&
            x <= room.x + halfWidth &&
            z >= room.z - halfDepth &&
            z <= room.z + halfDepth
        ) {

            return room;
        }
    }

    return null;
}
