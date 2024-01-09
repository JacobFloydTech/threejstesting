"use client"
import { addBackgroundLandscape, addMiddleGround, addPlane, addText, addWater, animateText, createVideoElement, scaleFragShader, scaleVertexShader } from './functions';
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
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);
    let text = "Risos Enterprises LTD"
    scene.add(new THREE.AmbientLight());
    addPlane(scene);

    let material: THREE.Material | THREE.Material[] = (scene.getObjectByName('grass') as THREE.InstancedMesh)?.material;
    const water = scene.getObjectByName('waterMesh') as Water;

    camera.position.set(0, 15, 100);
    camera.lookAt(0, 15, 50);

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
        animateText(-5, -200, camera.position.z, text, scene);
        changeScale(camera.position, scene)


        requestAnimationFrame(animate);
        camera.position.z += velocity
        if (velocity < 0) {
            velocity += 0.025;
        } else if (velocity > 0) {
            velocity -= 0.025;
        }
        if (camera.position.z < -600) {
            camera.position.z = 0;
        }

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

function changeScale(position: THREE.Vector3, scene: THREE.Scene) {
    const mesh = scene.getObjectByName('grass') as THREE.InstancedMesh;
    let dummy = new THREE.Object3D()
    const minDistance = 0;
    const maxDistance = 100;
    console.log(position);

    for (var i = 0; i < mesh.count; i++) {
        let matrix = new THREE.Matrix4();
        mesh.getMatrixAt(i, matrix);
        dummy.position.setFromMatrixPosition(matrix);
        dummy.setRotationFromMatrix(matrix)
        dummy.updateMatrix()
        const distance = dummy.position.distanceTo(position)
        let per = Math.min(1, Math.max(0, maxDistance / distance));

        dummy.scale.set(per, per, per);
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true;
}