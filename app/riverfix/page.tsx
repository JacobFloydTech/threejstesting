"use client"
import { LoadTree, addBackgroundLandscape, addBoulders, addLogo, addMiddleGround, addPlane, addText, addWater, animateText, createVideoElement, loadMountainGLB, scaleFragShader, scaleVertexShader, setPositions, } from './functions';
import { MutableRefObject, useEffect, useRef } from "react"
import * as THREE from 'three'
import { EffectComposer, OrbitControls, RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";
import { Water } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from "three/examples/jsm/Addons.js";


export default function Page() {
    const ref = useRef<any>(null);
    useEffect(() => { setScene(ref) }, [])
    return (
        <div className="w-full h-screen" ref={ref} />

    )
}

function setScene(ref: MutableRefObject<any>) {
    if (!ref.current) { return }
    let velocity = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);
    let text = "Risos Enterprises LTD"

    loadMountainGLB(scene)
    addPlane(scene, camera.position);
    addLogo(scene)
    let material: THREE.Material | THREE.Material[] = (scene.getObjectByName('grass') as THREE.InstancedMesh)?.material;
    const water = scene.getObjectByName('waterMesh') as Water;

    camera.position.set(0, 15, 100);
    camera.lookAt(0, 15, 50);
    const light = new THREE.AmbientLight(0xFFFFFF, 4);
    scene.add(light);
    addBoulders(scene);
    LoadTree(scene);


    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const cameraShader = {
        uniforms: {
            tDiffuse: { value: null },
            aspect: { value: new THREE.Vector2 }
        }, vertexShader: scaleVertexShader, fragmentShader: scaleFragShader
    }
    const globeEffectPass = new ShaderPass(cameraShader);
    globeEffectPass.renderToScreen = true;
    composer.addPass(globeEffectPass);

    function animate() {



        requestAnimationFrame(animate);
        camera.position.z += velocity
        if (velocity < 0) {
            velocity += 0.025;
        } else if (velocity > 0.1) {
            velocity -= 0.001;
        }
        if (camera.position.z < -600) {
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

