"use client"

import { useEffect, useRef } from "react"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';



export default function RiverPage() { 
    const ref = useRef<any>();
    useEffect(() => { setScene(ref)},[])

    return (
        <div className="w-full h-screen" ref={ref}></div>
    )
}
function setScene(ref: any) {
    if (!ref.current) {
        return;
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);
    const box = new THREE.BoxGeometry(20, 20, 20);
    const mesh = new THREE.Mesh(box, new THREE.MeshStandardMaterial());
    mesh.position.set(0, 20, 30);
    mesh.name = 'box'
    scene.add(mesh);


    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    const hdriLoader = new RGBELoader();
    hdriLoader.load('/background.hdr', (texture) => { 
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        texture.dispose();
        scene.background = envMap;
    })


    var planeSize = 100;
    var planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 50, 50);

    var vertices = planeGeometry.attributes.position.array;

    var material = new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide });
    var planeMesh = new THREE.Mesh(planeGeometry, material);
    planeMesh.rotation.x = Math.PI/2;
    scene.add(planeMesh);

    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    camera.position.set(0, 20, 100);
    const obj = scene.getObjectByName('box')

    const intersectionPointsGroup = new THREE.Group();
    for (var i = 0; i < vertices.length; i += 3) {
        var x = vertices[i];
        var y = vertices[i + 1];
        var z = vertices[i + 2];
        const vector = new THREE.Vector3(x,y,z);
        const rayDirection = new THREE.Vector3(0, -1, 0)
        const raycaster = new THREE.Raycaster(vector, rayDirection);
        
        let intersects = raycaster.intersectObject(obj!);
        if (intersects[0]) { 
            vertices[i+2] -= 10;
        }
        // Create a line to visualize the ray
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([vector, vector.clone().add(rayDirection.multiplyScalar(50))]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        intersectionPointsGroup.add(line);

    }

    scene.add(intersectionPointsGroup)



    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}
