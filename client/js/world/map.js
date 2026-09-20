import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export const MAP = {
    rooms: [
        {
            id: "central",
            name: "Central Hive",
            x: 0,
            z: 0,
            width: 18,
            depth: 16,
            height: 7,
            type: "central",
            connections: ["nursery", "garden", "storage", "workshop", "water", "queen"]
        },

        {
            id: "nursery",
            name: "Nursery",
            x: 0,
            z: -25,
            width: 14,
            depth: 13,
            height: 6,
            type: "nursery",
            connections: ["central"]
        },

        {
            id: "garden",
            name: "Garden",
            x: -23,
            z: -12,
            width: 14,
            depth: 13,
            height: 6,
            type: "garden",
            connections: ["central"]
        },

        {
            id: "storage",
            name: "Storage",
            x: 23,
            z: -12,
            width: 14,
            depth: 13,
            height: 6,
            type: "storage",
            connections: ["central"]
        },

        {
            id: "workshop",
            name: "Workshop",
            x: -23,
            z: 14,
            width: 15,
            depth: 14,
            height: 6,
            type: "workshop",
            connections: ["central"]
        },

        {
            id: "water",
            name: "Water Processing",
            x: 23,
            z: 14,
            width: 15,
            depth: 14,
            height: 6,
            type: "water",
            connections: ["central"]
        },

        {
            id: "queen",
            name: "Queen Chamber",
            x: 0,
            z: 27,
            width: 16,
            depth: 13,
            height: 8,
            type: "queen",
            connections: ["central"]
        }
    ],

    corridors: [
        {
            from: "central",
            to: "nursery",
            width: 5
        },

        {
            from: "central",
            to: "garden",
            width: 5
        },

        {
            from: "central",
            to: "storage",
            width: 5
        },

        {
            from: "central",
            to: "workshop",
            width: 5
        },

        {
            from: "central",
            to: "water",
            width: 5
        },

        {
            from: "central",
            to: "queen",
            width: 5
        }
    ]
};

export function getRoom(id) {
    return MAP.rooms.find(room => room.id === id);
}

export function getRoomCenter(room) {
    return new THREE.Vector3(
        room.x,
        0,
        room.z
    );
}
