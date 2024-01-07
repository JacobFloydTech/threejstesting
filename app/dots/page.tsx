'use client'

import { MutableRefObject, useEffect, useRef } from "react";
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';




export default function DotPage() { 
    useEffect(() => {setScene(ref)},[])
    const ref = useRef<any>();
    return ( 
        <div ref={ref}/>
    )
}

function setScene(ref: MutableRefObject<any>) { 
    if (!ref.current) { return}
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 120);
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);
    camera.position.set(0, 0, -50)


    const controls = new OrbitControls( camera, renderer.domElement );

    const dots = addDots(scene)
    addLine(dots, scene)

    scene.add(new THREE.AmbientLight())
    let randomDestination: THREE.Vector3[] = [];
    const dummy = new THREE.Object3D();
    camera.position.set(80,20,100)   
    camera.lookAt(80,20,0)
    const lerpDuration = 1500;
    let lerpFactor =0;
    const clock = new THREE.Clock();

    const animate = () => { 

        const elapsedTime = clock.getElapsedTime()
        if (randomDestination.length == 0) {
            for (var i =0; i < 6**3; i++) { 
                const matrix = new THREE.Matrix4();
                dots.getMatrixAt(i, matrix)
                dummy.position.setFromMatrixPosition(matrix);
                dummy.updateMatrix();
                randomDestination.push(generateNewRandomPosition(dummy.position))
            }
        } 

  
        lerpFactor = Math.min(elapsedTime/lerpDuration, 1);
        for (var i =0; i < 6**3; i++) { 
            const matrix = new THREE.Matrix4()
            dots.getMatrixAt(i, matrix);
            dummy.position.setFromMatrixPosition(matrix);
            dummy.updateMatrix();
  
            const position = dummy.position;
            const newPosition = randomDestination[i];
            const inbetweenPosition = new THREE.Vector3().lerpVectors(position, newPosition, lerpFactor);
  
            dummy.position.set(inbetweenPosition.x, inbetweenPosition.y, inbetweenPosition.z);
            dummy.updateMatrix();
            dots.setMatrixAt(i, dummy.matrix);
        }
        if (lerpFactor >= 0.01) { 
            lerpFactor = 0;
            randomDestination = [];
            clock.elapsedTime = 0;
        }
        dots.instanceMatrix.needsUpdate = true;
        addLine(dots, scene)
     
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
        controls.update()

    }

    animate()
}



function addDots(scene: THREE.Scene) { 
    const sphere = new THREE.SphereGeometry(0.2, 4, 4);
    const instancedMesh = new THREE.InstancedMesh(sphere, new THREE.MeshBasicMaterial({color: 'white'}), 6**3);
    instancedMesh.geometry.computeVertexNormals();
    const dummy = new THREE.Object3D();
    let count = 0;
    for (var x = 0; x < 6; x++) { 
        for (var y = 0; y < 6; y++) { 
            for (var z = 0; z < 6; z++) { 
                dummy.position.set(x*16+getRandomInt(-10,10),y*16+getRandomInt(-10,10),z*16+getRandomInt(-10,10))
                dummy.updateMatrix();
       
                instancedMesh.setMatrixAt(count, dummy.matrix);
                count++;
            }
        }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);
    return instancedMesh;
}

function addLine(mesh: THREE.InstancedMesh, scene: THREE.Scene) { 
    const existing = scene.getObjectByName('lines');
    if (existing) { scene.remove(existing)}
    const vectors: THREE.Vector3[] = [];
    let connections = [];
    const dummy = new THREE.Object3D();
    for (var i =0; i < 6**3; i++) { 
        const matrix = new THREE.Matrix4();
        mesh.getMatrixAt(i, matrix);
        dummy.position.setFromMatrixPosition(matrix);
        dummy.updateMatrix();

        vectors.push(new THREE.Vector3(dummy.position.x, dummy.position.y, dummy.position.z))
    }
  
    for (var i = 0; i < vectors.length; i++) { 
        const currentVector = vectors[i]
        for (var j = 0; j < vectors.length; j++) { 
            const testingVector = vectors[j];
            const distance = testingVector.distanceTo(currentVector);
            if (distance < 15 && distance != 0) { 
                connections.push({currentVector, testingVector})
            } 

        }

    }

    const lines = new THREE.BufferGeometry();
    const positions = new Float32Array(connections.length*3*2);

    lines.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    for (var i =0; i < positions.length; i+=6) { 
        const currentPair = connections[i/6];

        positions[i] = currentPair?.currentVector.x;
        positions[i+1] = currentPair?.currentVector.y;
        positions[i+2] = currentPair?.currentVector.z;
        positions[i+3] = currentPair?.testingVector.x;
        positions[i+1+3] = currentPair?.testingVector.y;
        positions[i+2+3] = currentPair?.testingVector.z;
    }

    
    const lineMesh = new THREE.LineSegments(lines );
    lineMesh.geometry.computeVertexNormals();

    lineMesh.geometry.attributes.position.needsUpdate = true;
    lineMesh.name = 'lines';
    scene.add(lineMesh)
    addTriangleShape(vectors, scene)
    
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNewRandomPosition(position: THREE.Vector3) { 
    return new THREE.Vector3(position.x+getRandomInt(-10,10),position.y+getRandomInt(-10,10),position.z+getRandomInt(-10,10))
}


function addTriangleShape(vectors: Array<THREE.Vector3>, scene: THREE.Scene) { 
    let triangles = getTriangles(vectors);
    let length = triangles.length;
    
    let obj = scene.getObjectByName('triangles')
    if (obj) { scene.remove(obj)}

    const geometry = new THREE.InstancedBufferGeometry()
    geometry.instanceCount = length;
    const vertices = new Float32Array(length * 9);
    let numbers: number[] = []
    triangles.forEach((e) => { 
        numbers.push(e[0].x)
        numbers.push(e[0].y)
        numbers.push(e[0].z)
        numbers.push(e[1].x)
        numbers.push(e[1].y)
        numbers.push(e[1].z)
        numbers.push(e[2].x)
        numbers.push(e[2].y)
        numbers.push(e[2].z)
    })

    numbers.forEach((e,i) => { vertices[i] = e})

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
   
    const mesh = new THREE.InstancedMesh(geometry,  new THREE.MeshLambertMaterial(), length);
    mesh.name = 'triangles'
    scene.add(mesh)

    
}



function getTriangles(vectors: Array<THREE.Vector3>) { 
    let triangles: Array<Array<THREE.Vector3>> = [];
    let distance = 15;
    const uniqueCombinations = new Set();
    for (var i =0; i < vectors.length; i++) { 
        let connectionA = vectors[i]
        for (var j = 0; j < vectors.length; j++) { 
            let connectionB = vectors[j]
            for (var k = 0; k < vectors.length; k++) { 
                let connectionC = vectors[k]
                if (
                    connectionA.distanceTo(connectionB) < distance &&
                    connectionA.distanceTo(connectionC) < distance && 
                    connectionB.distanceTo(connectionA) < distance && 
                    connectionB.distanceTo(connectionC) < distance && 
                    connectionC.distanceTo(connectionA) < distance && 
                    connectionC.distanceTo(connectionB) < distance && 
                    i != j && i != k && j != k 
                ) { 
                    const combinationKey = [connectionA, connectionB, connectionC].sort((a, b) =>
                    	  a.x !== b.x ? a.x - b.x : a.y !== b.y ? a.y - b.y : a.z - b.z
                    ).map((vec) => vec.toArray().join(',')).join('|');
                    if (!uniqueCombinations.has(combinationKey)) {
                        triangles.push([connectionA, connectionB, connectionC]);
                        uniqueCombinations.add(combinationKey);
                    }
                }
            }
        }
    }
    return triangles;
} 

