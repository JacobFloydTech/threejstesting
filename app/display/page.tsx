"use client"
import { useRef, useEffect, MutableRefObject } from "react";
import * as THREE from 'three'
import { FontLoader, GLTFLoader, OrbitControls, TextGeometry } from "three/examples/jsm/Addons.js";
const radius = 0.2


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

    //let material: THREE.ShaderMaterial = constructBorder(scene)
    addRiverGLB(scene)
    addLight(scene)

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update()
    const waicorder = scene.getObjectByName('Armature003') as THREE.Object3D;
    const clock = new THREE.Clock();
    function animate() { 
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        controls.update()
        //mixer?.update(clock.getDelta())
        //material.uniforms.time.value += 0.05;
        if (waicorder) { waicorder.rotation.y += 0.02;}

    }
    animate();
}

function addRiverGLB(scene: THREE.Scene) { 
    const loader = new GLTFLoader();
    loader.load('/newLandscape.glb', (obj) =>{ 
        const child = obj.scene.children[0] as THREE.Mesh;
        const newMesh = new THREE.Mesh(child.geometry, new THREE.MeshBasicMaterial({side: THREE.DoubleSide}));
        newMesh.scale.set(20,20,20)
        console.log(newMesh);
        scene.add(newMesh)
        addWater(scene)
    })
}

function addWater(scene: THREE.Scene) { 
    const planeWater = new THREE.PlaneGeometry(40,40);
    const mesh = new THREE.Mesh(planeWater, new THREE.MeshBasicMaterial({color: "blue", side: THREE.DoubleSide}));
    mesh.rotation.x = Math.PI/2;
    mesh.position.y -= 2;
    scene.add(mesh)
}

function addLight(scene: THREE.Scene) { 
    const light = new THREE.AmbientLight(0xffffff, 1)
    scene.add(light)
}

function addWaicorder(scene: THREE.Scene): Promise<THREE.AnimationMixer | null> {
    return new Promise((resolve) => {
        const loader = new GLTFLoader();
        let mixer: THREE.AnimationMixer | null = null;

        loader.load('/waicorderanimation.glb', (obj) => {
            mixer = new THREE.AnimationMixer(obj.scene);
            var action = mixer.clipAction(obj.animations.pop()!);
            obj.scene.name = 'waicorder';
            console.log(action);
            action.play();
            action.clampWhenFinished = true;
            action.repetitions = 1;
            obj.scene.scale.set(50, 50, 50);
            obj.scene.position.set(5, -20, 0)
            scene.add(obj.scene);

            resolve(mixer);
        });
    });
}


function addText(scene :THREE.Scene) { 
    const text = `Our mission by heart is to ensure everyone has \naccess to safe water in the world. About 20% of Kiwis \nare supplied with contaiminated drinking water and \n1 billion globally suffer from gastroenteritis \ncaused by dirty water. \n\n\nRapid sensing is the first step to avoid all that. \nHence we are developing revolutionary \ntechnology that can scan waterborne pathogens \nfaster than currently possible. \n\n\nResearch is a vorage beyond the known frontiers; \nwe explore strange new fields and boldy \ndo what no one has done before.`
                
    const loader = new FontLoader();
    loader.load('/font.json', (font) => { 

            const geometry = new TextGeometry(text, { 
                font: font,
                height: 0.1,
                size: 0.62
            })
            const mesh = new THREE.Mesh(geometry);
            mesh.position.set(9, -2, 0);
            scene.add(mesh);

    })
}


function constructBorder(scene: THREE.Scene) { 


    const geometry = new THREE.CylinderGeometry(radius, radius, 40);
    const top = new THREE.Mesh(geometry, borderShaderMaterial);
    top.rotation.z = Math.PI/2;
    top.position.set(10,0,0)

    const bottom = new THREE.Mesh(geometry, borderShaderMaterial);
    bottom.rotation.z = Math.PI/2;
    bottom.position.set(10,-20,0)

    const sideGeometry = new THREE.CylinderGeometry(radius, radius,20)
    const left = new THREE.Mesh(sideGeometry, borderShaderMaterial);
    left.position.set(-10, -10,0)
    const right = new THREE.Mesh(sideGeometry, borderShaderMaterial);
    right.position.set(30, -10, 0)
    scene.add(right)
    scene.add(left)
    scene.add(bottom)
    scene.add(top)
    return borderShaderMaterial;
}

function addLines(scene: THREE.Scene) { 
    const radius = 0.1;

    const line = new THREE.CylinderGeometry(radius,radius, 10)
    const mesh = new THREE.Mesh(line, borderShaderMaterial);
    mesh.rotation.z = Math.PI/2;
    mesh.position.set(12, -14, 0)
    scene.add(mesh);

    const ring = new THREE.RingGeometry(1, 1.2, 20, 20);
    const ringMesh = new THREE.Mesh(ring, borderShaderMaterial);
    ringMesh.position.set(6, -14, 0)
    scene.add(ringMesh)

    const diagonalLine = new THREE.CylinderGeometry(radius, radius, 1.2);
    const diagonalLineMesh = new THREE.Mesh(diagonalLine, borderShaderMaterial);
    diagonalLineMesh.rotation.z = -Math.PI/5;
    diagonalLineMesh.position.set(17.3, -13.6, 0)
    scene.add(diagonalLineMesh)
}


const vertexShader = `
// Basic Vertex Shader for Three.js



// Varying variables to pass data from the vertex shader to the fragment shader
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    // Transform the vertex position from model space to camera space
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

    // Transform the normal from model space to camera space and normalize it
    vNormal = normalize(normalMatrix * normal);

    // Pass the texture coordinates to the fragment shader
    vUv = uv;

    // Set the output vertex position in clip space
    gl_Position = projectionMatrix * modelViewPosition;
}
`

const fragmentShader = `
    precision highp float;
    uniform float time;
    void main() { 
        float opacity = 0.8+0.5*sin(time);
        gl_FragColor = vec4(0.,1.0,1.0, opacity);
    }
`
const borderShaderMaterial = new THREE.ShaderMaterial({
    uniforms: { 
        time: { value: 0}
    },
    fragmentShader: fragmentShader,
    vertexShader: vertexShader,
    transparent: true,
    
})