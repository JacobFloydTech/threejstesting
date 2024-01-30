'use client'

import { MutableRefObject, useEffect, useRef } from "react";
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BufferGeometryUtils } from "three/examples/jsm/Addons.js";
import { UnrealBloomPass, RenderPass, OutputPass, EffectComposer } from "three/examples/jsm/Addons.js";
const params = {
    threshold: 0,
    strength: 0.8,
    radius: 0.00001,
    exposure: 1,    
};

const color = 0xEF00FF


export default function DotPage() {
    useEffect(() => { setScene(ref) }, [])
    const ref = useRef<any>();
    return (
        <div ref={ref} />
    )
}
function setScene(ref: MutableRefObject<any>) {
    if (!ref.current) { return }
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 99999999);
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);
    camera.position.z = 50;
    camera.position.y = 20; 
    scene.add(new THREE.AmbientLight(undefined, 0.4))
    addGridOfPlanes(scene)
    randomFilling(scene)
    
    const renderScene = new RenderPass( scene, camera );

    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = params.threshold;
    bloomPass.strength = params.strength;
    bloomPass.radius = params.radius;

    const outputPass = new OutputPass();

    let composer = new EffectComposer( renderer );
    composer.addPass( renderScene );
    composer.addPass( bloomPass );
    composer.addPass( outputPass );
    setInterval(() => {
        randomFilling(scene)
     },1000)

    const controls = new OrbitControls(camera, renderer.domElement);
    const clock = new THREE.Clock()
    controls.update()
    const animate = ( ) => { 
        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera)
        composer.render()
        animateGrid(scene, clock.getElapsedTime())
    }
    animate()
}


function animateGrid(scene: THREE.Scene, time: number) { 
    const mesh = scene.getObjectByName('plane') as THREE.InstancedMesh, box = scene.getObjectByName('highlight') as THREE.Mesh
    if (!mesh || !box) return
    const dummy = new THREE.Object3D()
    for (var i =0 ;i < mesh.count;i++) { 
        const matrix = new THREE.Matrix4();
        mesh.getMatrixAt(i, matrix);
        const position = new THREE.Vector3();
        matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
        dummy.position.copy(position);
     
        dummy.position.z += Math.sin(dummy.position.x+dummy.position.y+time)*0.2;
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix)
        if (i == box.userData.index) { 
            box.position.y = -dummy.position.z;
            box.position.y -= 10;

        }
        
    }
    mesh.instanceMatrix.needsUpdate = true;
}

function randomFilling(scene: THREE.Scene) { 
    const mesh = scene.getObjectByName('plane') as THREE.InstancedMesh;
    const previous = scene.getObjectByName('highlight') as THREE.Mesh;
    if (previous) { scene.remove(previous)}
    if (!mesh) return

    const box = new THREE.PlaneGeometry(10,11);
    const remainderMesh  = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({color: 'blue'}), mesh.count-1);

    const randomValue = Math.round(Math.random()*mesh.count)
    const dummy = new THREE.Object3D();
    for (var i = 0; i < mesh.count; i++) { 
        if (i == randomValue) { 
            const matrix = new THREE.Matrix4();
            mesh.getMatrixAt(i, matrix);
            const position = new THREE.Vector3();
            matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
            const boxmesh = new THREE.Mesh(box, new THREE.MeshStandardMaterial({side: THREE.DoubleSide, color: color}));
            boxmesh.position.x = position.x;
            boxmesh.position.z = position.y;
            boxmesh.position.y = -position.z;
            boxmesh.position.x += 50;
            boxmesh.position.z += 50;
            boxmesh.position.y -= 500;
            boxmesh.rotation.x = Math.PI/2;
            scene.add(boxmesh);
            boxmesh.scale.set(10,10,10)
            boxmesh.name = 'highlight'
            boxmesh.userData.index = randomValue;
            break;
        } else { 
            const matrix = new THREE.Matrix4();
            mesh.getMatrixAt(i, matrix);
            const position = new THREE.Vector3();
            matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
            console.log(position);
            dummy.position.x = position.x;
            dummy.position.z = position.y;
            dummy.position.y = -position.z;
            dummy.position.x += 50;
            dummy.position.z += 50;
            dummy.position.y -= 500;
            dummy.rotation.x = Math.PI/2;
            dummy.scale.set(10,10,10);
            dummy.updateMatrix();
            remainderMesh.setMatrixAt(i, dummy.matrix);
        }
    }
    remainderMesh.instanceMatrix.needsUpdate = true;
}




function addGridOfPlanes(scene: THREE.Scene) {
    let start = 8;
    const count = start**3;
    const geometry = getGeometry();
    const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({side: THREE.DoubleSide, color: color}), count);
    mesh.name = 'plane';
    mesh.rotation.x = Math.PI/2;
    const dummy = new THREE.Object3D()
    const multipler = 400;
    let index =0;
    for (var x = 0; x <start; x++) { 
        for (var  y = 0; y <start; y++) { 
            for (var z = 0; z <start; z++) { 
                dummy.position.set(x*multipler+Math.random()*12, y*multipler+Math.random()*12, z*multipler+Math.random()*5);
                dummy.updateMatrix();
                console.log(dummy.position);
                mesh.setMatrixAt(index, dummy.matrix)
                index++
            }

        }
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh)
    
}

function getGeometry() { 
    
    
    const vertices = new Float32Array( [
        -0.5, -1.0,  1.0, // v0
         0.5, -1.0,  1.0, // v1
         0.5,  10.0,  1.0, // v2
    
         0.5,  10.0,  1.0, // v3
        -0.5,  10.0,  1.0, // v4
        -0.5, -1.0,  1.0  // v5
    ] );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    const top = geometry.clone();
    const bottom = geometry.clone();
    const left = geometry.clone();
    const right = geometry.clone();

    top.rotateZ(Math.PI/2);
    bottom.rotateZ(Math.PI/2);
    top.translate(9.5, 10, 0)
    bottom.translate(9.5, -1, 0)
    right.translate(10, 0, 0)
    top.scale(10,10,10)
    bottom.scale(10,10,10)
    left.scale(10,10,10)
    right.scale(10,10,10)
    const combined = BufferGeometryUtils.mergeGeometries([top, bottom, left, right]);
    return combined;
}
