"use client"
import { MutableRefObject, useEffect, useRef } from 'react'
import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BufferGeometry, ShaderMaterial, InstancedMesh } from 'three';
import { Water, WaterOptions } from 'three/examples/jsm/Addons.js';
//@ts-ignore
import { Noise } from 'noisejs';
import { Object3D, PlaneGeometry, SphereGeometry, WebGLRenderer } from 'three';

export default function Page() {
    const ref = useRef<any>();
    useEffect(() => { setScene(ref) }, [])
    return <div ref={ref} />
}

function setScene(ref: MutableRefObject<any>) {
    if (!ref.current) { return }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
    const renderer = new THREE.WebGLRenderer();
    camera.position.set(0, 0, 40);

    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0;
    ref.current.appendChild(renderer.domElement);

    addPlane(scene);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update()


    function animate() {
        controls.update()
        requestAnimationFrame(animate);
        renderer.render(scene, camera)

    }
    animate()
}

export function addWater(scene: THREE.Scene) {

    var waterGeometry = new THREE.PlaneGeometry(35, 100 * 10, 50, 50);
    var water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            alpha: 0.95, // Transparency
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 2,
        },
    );

    water.rotation.x = -Math.PI / 2;
    water.position.z -= 350;
    water.position.y -= 2.2
    water.name = 'waterMesh'
    scene.add(water);



}

export function addPlane(scene: THREE.Scene) {

    const geometry = new THREE.BoxGeometry(100, 50, 100, 25, 25, 25,);
    const texture = new THREE.TextureLoader().load('/grass.jpg')
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5)
    const planeMesh = new THREE.InstancedMesh(geometry, material, 10);
    const dummy = new THREE.Object3D();
    const offset = 100;
    for (var i = 0; i < planeMesh.count; i++) {
        let zOffset = -offset * (i - 1)
        dummy.position.set(0, 0, zOffset)
        dummy.rotation.set(Math.PI / 2, 0, Math.PI / 2)
        dummy.updateMatrix();
        planeMesh.setMatrixAt(i, dummy.matrix)
    }
    updatePoints(planeMesh.geometry.attributes.position.array, planeMesh)
    planeMesh.instanceMatrix.needsUpdate = true;
    scene.add(planeMesh)
}

function updatePoints(points: THREE.TypedArray, mesh: THREE.InstancedMesh) {
    const noise = new Noise();
    let divide = 8;
    for (var i = 0; i < points.length; i += 3) {
        let x = points[i] / divide;
        let y = points[i + 1] / divide;
        let z = points[i + 2] / divide;
        points[i + 2] = noise.perlin3(x, y, z) * 4;
        x *= divide;
        y *= divide;
        const percentageToCenter = (1 - Math.abs(x) / 25);

        const startingPoint = -5 + (percentageToCenter * 10);

        if (y > startingPoint && y < startingPoint + 10) {
            points[i + 2] += 6;

        }

        if (y == startingPoint || y == startingPoint + 10) {
            points[i + 2] += 4;
        }
    }
    mesh.instanceMatrix.needsUpdate = true;


}

export function addFlowers(points: THREE.TypedArray, scene: THREE.Scene, parent: THREE.Mesh) {
    for (var i = 0; i < points.length; i += 3) {
        if (Math.random() > 0.9) {
            const sphere = new SphereGeometry(0.2, 6, 6);
            const material = new THREE.MeshStandardMaterial({ color: "#D56262" })
            const mesh = new THREE.Mesh(sphere, material);
            const position = parent.localToWorld(new THREE.Vector3(points[i], points[i + 1], points[i + 2]));

            mesh.position.set(position.x, position.y + 3.4, position.z)

            scene.add(mesh);


        }

    }
}

class CustomWater extends InstancedMesh {
    //@ts-ignore
    material: ShaderMaterial;
    //@ts-ignore
    constructor(geometry: BufferGeometry, options: WaterOptions, count: count);
}