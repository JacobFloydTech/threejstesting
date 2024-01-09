"use client"
import { MutableRefObject, useEffect, useRef } from 'react'
import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BufferGeometry, ShaderMaterial, InstancedMesh } from 'three';
import { Water, WaterOptions } from 'three/examples/jsm/Addons.js';
//@ts-ignore
import { Noise } from 'noisejs';

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
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0;
    ref.current.appendChild(renderer.domElement);
    const box = new THREE.BoxGeometry(2,2,2);
    const mesh = new THREE.Mesh(box);
    scene.add(mesh)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update()


    function animate() {
        controls.update()
        requestAnimationFrame(animate);
        renderer.render(scene, camera)
      

    }
    animate()
}

