"use client"
import { addPlane, addWater, loadObjGrassModel } from './functions';
import { MutableRefObject, useEffect, useRef } from "react"
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/Addons.js";
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
    const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 300);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight());
    addPlane(scene)
    const loader = new RGBELoader();
    loader.load('/background.hdr', (texture) => {
        scene.background = texture
    })
    camera.position.set(0, 20, 100);

    function animate() {


        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        camera.position.z += velocity;
        if (velocity > 0) { 
            velocity -= 1;
        } 
        if (velocity < 0) { 
            velocity += 1;
        }
        if (camera.position.z < -600) { 
            camera.position.z = 0;
        }

    }


    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }
    function onWheel(e: WheelEvent) {
        velocity += e.deltaY*0.05;
    }
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onWheel, false);

    animate()
}

function checkChildren(scene: THREE.Scene, position: number) {
    scene.children.forEach((x) => {
        if (x.position.z > position) {
            setTimeout(() => {
                scene.remove(x)
            }, 1000);
        }
    })
}