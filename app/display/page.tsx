"use client"
import { useRef, useEffect, MutableRefObject } from "react";
import * as THREE from 'three'
import { ImprovedNoise } from "three/examples/jsm/Addons.js";
//@ts-ignore
import {Noise} from 'noisejs'
import { FontLoader, GLTFLoader, OrbitControls, TextGeometry } from "three/examples/jsm/Addons.js";
let originalPosition: THREE.TypedArray


export default function Page() {
    const ref = useRef<any>(null);
    useEffect(() => { setScene(ref) }, [])
    return (
        <div className="w-full h-screen fixed" ref={ref} />

    )
}





async function setScene(ref: MutableRefObject<any>) { 
    if (!ref.current) { return}
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);
    camera.position.z = 50;
    camera.position.y = 10;
    const light = new THREE.PointLight(undefined, 4, 1000, 0.5);
    const mixer = await loadWaicorder(scene);
    const helper = new THREE.PointLightHelper(light, 1)
    scene.add(helper)
    scene.add(new THREE.AmbientLight(undefined, 12))

    light.position.set(0, 20, 0);
    scene.add(light)

    function animate() { 
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
        mixer?.update(0.02)
    }
    animate();
    document.addEventListener('wheel', (e) => { 
        camera.position.z += e.deltaY*0.01;
    })
}

function loadWaicorder(scene: THREE.Scene): Promise<THREE.AnimationMixer | null>  { 
    return new Promise(resolve => { 
        const loader = new GLTFLoader();
        loader.load('waicorderfinal.glb', obj => { 
            const mixer = new THREE.AnimationMixer(obj.scene)
            obj.scene.scale.set(50,50,50);
            obj.scene.position.y -= 10;
            console.log(obj.animations);
            obj.animations.filter(e => ["Cuvette.013Action.001", "Rubber Lid.013Action.001","Armature.003Action.003"].includes(e.name)).forEach((e) => { 
                let action = mixer.clipAction(e);
                action.repetitions = 1;
                action.clampWhenFinished = true;
                action.play();
            })
            resolve(mixer)
        })
    })
}

function loadMountain(scene: THREE.Scene): Promise<THREE.AnimationMixer | null> { 
    return new Promise((resolve, reject) => { 
        const loader = new GLTFLoader();
        loader.load('mountainanimation.glb', (obj) => { 
            //scene.add(obj.scene)
            console.log(obj);
            const e = obj.scene.children[0] as THREE.Mesh;
            const mesh = new THREE.Mesh(e.geometry, e.material);
            scene.add(mesh)
            const animation = obj.animations[0];
            console.log(animation);
            const mixer = new THREE.AnimationMixer(mesh);
            const action = mixer.clipAction(animation);
            action.clampWhenFinished = true;
            action.repetitions = 1;
            action.play()
            resolve(mixer);

        })
    })
}


function animatePointsIn(scene: THREE.Scene, position: THREE.Vector3) { 
    const mesh = scene.getObjectByName('plane') as THREE.Mesh;
    if (!mesh) return
    const points = mesh.geometry.attributes.position.array;
    for (var i = 0; i < points.length; i+=3) { 
        const x = points[i];
        const y = points[i+1];
        const distance = position.distanceTo(new THREE.Vector3(x,y, points[i+2]));
        const elevation = Math.pow(distance, 4) / 1000000; // Adjust the exponent for the desired effect
        console.log(elevation);
        points[i + 2] = -elevation;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
}


function addPlane(scene: THREE.Scene, position: THREE.Vector3) { 
    const geometry = new THREE.PlaneGeometry(50,50,100,100);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({side: THREE.DoubleSide}))
    mesh.name = 'plane'
    mesh.rotation.x = Math.PI/2;
    const noise = new Noise();
    const points = mesh.geometry.attributes.position.array;
    originalPosition = points;
    for (var i =0 ; i < points.length; i+=3) { 
        const x = points[i];
        const y = points[i+1];
        const distance = position.distanceTo(new THREE.Vector3(x,y, points[i+2]));
        const elevation = Math.pow(distance, 4) / 1000000; // Adjust the exponent for the desired effect
        console.log(elevation);
        points[i + 2] = -elevation;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    scene.add(mesh)
}

