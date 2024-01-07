"use client"
import { addPlane } from "../river/page";
import { MutableRefObject, useEffect, useRef } from "react"
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { RGBELoader } from "three/examples/jsm/Addons.js";
export default function Page() { 
    const ref = useRef<any>(null);
    useEffect(() => {setScene(ref)},[])
    return (
        <div className="w-full h-screen"  ref={ref}/>

    )
}

function setScene(ref: MutableRefObject<any>) { 
    if (!ref.current) { return}
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update()
    addPlane(scene,0)
    camera.position.set(0,0,100)

    const loader = new RGBELoader();
    loader.load('/background.hdr', (texture) => { 
        scene.background = texture
    })


    function animate() {
        controls.update()
        requestAnimationFrame(animate);
        renderer.render(scene, camera)
        checkChildren(scene, camera.position.z)
    }
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