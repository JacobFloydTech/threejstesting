"use client"
import { LoadTree, addBoulders, addLights, addMiddleGround, addPlane, addWater, loadMountainGLB , scaleInThings, setPositions, } from './functions';
import { MutableRefObject, useEffect, useRef } from "react"
import * as THREE from 'three'
import { EffectComposer, OrbitControls, RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";
import { Water } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from "three/examples/jsm/Addons.js";
import { addDisplayText, addLines, addWaicorder, constructBorder, handleAnimation } from './display';


export default function Page() {
    const ref = useRef<any>(null);
    useEffect(() => { setScene(ref) }, [])
    return (
        <div className="w-full h-screen fixed" ref={ref} />

    )
}

async function setScene(ref: MutableRefObject<any>) {
    if (!ref.current) { return }
    let velocity = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);
    loadMountainGLB(scene)
    addPlane(scene, camera.position);
    let material: THREE.Material | THREE.Material[] = (scene.getObjectByName('grass') as THREE.InstancedMesh)?.material;
    const water = scene.getObjectByName('waterMesh') as Water;

    camera.position.set(0, 20, 100);
    camera.lookAt(0, 20, 50);

    addLights(scene)
    addBoulders(scene);
    LoadTree(scene);
    constructBorder(scene)
    addLines(scene);
    addDisplayText(scene);
    let mixer = await addWaicorder(scene);
    const waicorder = scene.getObjectByName('Armature003') as THREE.Object3D;
    const clock = new THREE.Clock()
    function animate() {
        scaleInThings(scene, camera.position.z);
        handleAnimation(camera.position.z, scene);
        mixer?.update(clock.getDelta())
        requestAnimationFrame(animate);
        camera.position.z += velocity
        if (velocity < 0) {
            velocity += 0.025;
        } else if (velocity > 0) {
            velocity -= 0.001;
        }
        if (camera.position.z < -1200) {
            camera.position.z = 0;
        }
        camera.updateMatrix();
        camera.updateProjectionMatrix();

        if (material) {
            if (!Array.isArray(material)) {
                material = [material]
            }
            material.forEach((x) => {
                (x as THREE.ShaderMaterial).uniforms.time.value += 0.01;
                x.needsUpdate = true;
            })
        }
        if (water) {
            water.material.uniforms.time.value += 0.01

        }
        if (waicorder) { waicorder.rotation.y += 0.02}
        renderer.render(scene, camera)

    }
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }
    function onWheel(e: WheelEvent) {

        velocity += roundToNearestIncrement(Math.round(e.deltaY), 0.05) * 0.001;

    }
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onWheel, false);

    animate()
}
function roundToNearestIncrement(number: number, increment: number) {
    return Math.floor(number / increment) * increment;
}

