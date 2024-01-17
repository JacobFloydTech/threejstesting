"use client"
import { LoadTree, addLights, addMiddleGround, addWater, loadMountainGLB , scaleInThings, } from './functions';
import { MutableRefObject, useEffect, useRef } from "react"
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/Addons.js';
import {  addWaicorder, changeTImeValue, handleAnimation } from './display';


export default function Page() {
    const ref = useRef<any>(null);
    useEffect(() => { setScene(ref) }, [])
    return (
        <div className="w-full h-screen fixed" ref={ref} />

    )
}



async function setScene(ref: MutableRefObject<any>) {
    if (!ref.current) { return }
    let velocity = -0.05;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = false;
    ref.current.appendChild(renderer.domElement);
    await Promise.all([
        loadMountainGLB(scene),
        addMiddleGround(scene)
    ])
    addWater(scene)
    let material: THREE.Material | THREE.Material[] = (scene.getObjectByName('grass') as THREE.InstancedMesh)?.material;
    const water = scene.getObjectByName('waterMesh') as Water;

    camera.position.set(0, 20, 100);
    camera.lookAt(0, 20, 50);
    addLights(scene)
    LoadTree(scene)
    
    let mixer = await addWaicorder(scene);
    const waicorder = scene.getObjectByName('Armature003') as THREE.Object3D;
    const clock = new THREE.Clock();
    const grass = scene.getObjectByName('grass') as THREE.Mesh
    function animate() {
        changeTImeValue(scene, clock.getDelta());
        scaleInThings(scene, camera.position.z);
        handleAnimation(camera.position.z, scene);
        mixer?.update(clock.getDelta())
        requestAnimationFrame(animate);
        camera.position.z += velocity
        if (velocity < -0.05) { 
            velocity += 0.01;
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
        if (grass) { grass.rotation.z += 0.03;}
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

