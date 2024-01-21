import * as THREE from 'three';
import {  FBXLoader, GLTFLoader, SVGLoader, TextGeometry, Water } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
//@ts-ignore
import { Noise } from 'noisejs'
import { addNewGrass } from './display';
import { loadDisplay } from './display';


export function addWater(scene: THREE.Scene) {

    var waterGeometry = new THREE.PlaneGeometry(100, 100*20 , 50, 50);
    var water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            alpha: 0.95, // Transrency
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 2,
        },
    );

    water.rotation.x = -Math.PI / 2;
    water.position.z -= 400;
    water.position.y -= 9;
    water.name = 'waterMesh'
    scene.add(water);



}




export async function addMiddleGround(scene: THREE.Scene) { 
    return new Promise<void>((resolve, reject) => { 
        const loader = new GLTFLoader()
        loader.load('/testlandscape.glb', (obj) => { 
            const texture = new THREE.TextureLoader().load('/testlandscapematerial.png')
            const child = obj.scene.children[0] as THREE.Mesh;
            const scale = 100;
            const instancedMesh = new THREE.InstancedMesh(child.geometry, new THREE.MeshStandardMaterial({map: texture}), 7);
            const dummy = new THREE.Object3D();
            for (var i = 0; i < instancedMesh.count; i++) { 
                dummy.rotation.y = Math.PI/2;
                dummy.position.z = -200*i-1;
                dummy.scale.set(scale,scale,scale)
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(i, dummy.matrix);
            }
            instancedMesh.instanceMatrix.needsUpdate = true;
            instancedMesh.name = 'middle'
            scene.add(instancedMesh)
            addBoulders(scene)
            addNewGrass(scene)
            loadDisplay(scene)
            
            resolve();
        })
        
    })
    
}

export function setPositions(scene: THREE.Scene, mesh: THREE.InstancedMesh, points: THREE.TypedArray, cameraPosition: THREE.Vector3) { 
    const dummy = new THREE.Object3D();
    for (let instances = 0; instances <= 10; instances++) { 
        for (let i = 0; i < points.length; i += 3) { 
            const x = points[i] + (instances * -100) + getRandomArbitrary(-0.5, 0.5)
            const y = points[i + 1] + getRandomArbitrary(0, 0.5)
            const originalZ = points[i + 2];
            dummy.scale.set(1.5,1.5,1.5);

            dummy.rotation.set(Math.PI / 2, 0, Math.PI);
            dummy.position.set(x, y, originalZ);
            dummy.updateMatrix();


            mesh.setMatrixAt(i / 3 + (instances * (points.length / 3)), dummy.matrix);
        }
    }
    mesh.name = 'grass'
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
}


function getXPosition() {
    let randomNumber: number;
    do {
        randomNumber = Math.random() * 220 - 220 / 2;
    } while (randomNumber >= -35 && randomNumber <= 35)
    return randomNumber
}

export function addBoulders(scene: THREE.Scene) { 

    const geometry = new THREE.SphereGeometry(3, 5, 5);
    const texture = new THREE.TextureLoader().load('rocks.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10)
    const count = 200;
    let index =0 ;
    const material = new THREE.MeshStandardMaterial({map: texture});
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.rotation.y = Math.PI/2;
    const plane = scene.getObjectByName('middle') as THREE.InstancedMesh
    if (!plane) return
    const points = plane.geometry.attributes.position.array.map((e) => e*100)

    const dummy = new THREE.Object3D();
    while (index <= count) {
        for (var instances = 0; instances < plane.count; instances++) { 
            for (var i =0 ; i < points.length; i+=3) { 
                if (Math.random() > 0.99) { 
                    dummy.position.set(points[i]+(instances*200), points[i+1], points[i+2])
                    dummy.updateMatrix();
                    dummy.scale.set(0,0,0)
                    mesh.setMatrixAt(index, dummy.matrix);
                    index++;
                    if (index >= count) break
                }
                if (index >= count) break
            }
            if (index >= count) break
        }

    }
    mesh.name = 'boulders'

    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh)
}

export function LoadTree(scene: THREE.Scene) {
    const loader = new GLTFLoader();
    const count = 60;
    const positions: THREE.Vector3[] = Array.from({ length: count }).map(() => new THREE.Vector3(getXPosition(), -5, Math.random() * -1000));
    const dummy = new THREE.Object3D();
    
    loader.load('tree.glb', ({ scene: { children } }) => { 
        children[0].children.forEach((child, i) => { 
            
            const instancedmesh = new THREE.InstancedMesh((child as THREE.Mesh).geometry, (child as THREE.Mesh).material, count);
            for (var i = 0; i < instancedmesh.count; i++) { 
                dummy.position.copy(positions[i]);
                dummy.updateMatrix();
                instancedmesh.setMatrixAt(i, dummy.matrix);
            }
            instancedmesh.name = child.name == 'Cylinder000' ? 'trees' : 'leaves';
            instancedmesh.instanceMatrix.needsUpdate = true;
            scene.add(instancedmesh);

        })

    })
}



export async function loadMountainGLB(scene: THREE.Scene) { 
    return new Promise<void>((resolve, reject) => { 
        const loader = new GLTFLoader();
        loader.load('/mountain.glb', (gltf) => {
        
          
            gltf.scene.children.forEach((e) => {
                addInstanceMesh(e as THREE.Mesh, scene, false)
            })
            gltf.scene.children.forEach((e) => {
                addInstanceMesh(e as THREE.Mesh, scene, true)
            })
            resolve();
    
        })
    })

}

function addInstanceMesh(e: THREE.Mesh, scene: THREE.Scene, mirror: boolean) { 
    const texture = new THREE.TextureLoader().load('mountainMaterial.png');
    const material = new THREE.MeshStandardMaterial({ map:texture, metalness: 0})
    const instancedMesh = new THREE.InstancedMesh(e.geometry, material , 10);
    instancedMesh.position.y = -20;
    instancedMesh.position.x = mirror ? -400 : 400;
    instancedMesh.rotation.y = mirror ? -Math.PI/2 : Math.PI/2;
    instancedMesh.scale.set(300, 300, 300);
    const dummy = new THREE.Object3D()
    for (var i =0 ; i <instancedMesh.count; i++) { 
        const matrix = new THREE.Matrix4()
        instancedMesh.getMatrixAt(i, matrix);
        dummy.applyMatrix4(matrix)
      
        dummy.position.x = mirror ? -1*i : 1*i;
        dummy.updateMatrix()
        instancedMesh.setMatrixAt(i, dummy.matrix)
    }
    instancedMesh.instanceMatrix.needsUpdate = true
    scene.add(instancedMesh)
}


function getRandomArbitrary(min:number, max: number) {
    return Math.random() * (max - min) + min;
}



export function addGrassGLB(scene: THREE.Scene, offset: number) { 
    const loader = new GLTFLoader();
    const planeMesh = scene.getObjectByName('middle') as THREE.InstancedMesh;
    const water = scene.getObjectByName('waterMesh') as THREE.Mesh;
    if (!planeMesh || !water) return
    let count = 500;
    let index =0 ;
    loader.load('smallgrass.glb', (obj ) => { 
        let meshes = obj.scene.children[0].children[0].children[0].children.map((e) => e.children[0] as THREE.Mesh).map((e) => new THREE.InstancedMesh(e.geometry, e.material, count));
        meshes.forEach((m) => {m.rotation.y = Math.PI/2; m.renderOrder = 1;})
        let points = planeMesh.geometry.attributes.position.array.map((e) => e*100);
        const dummy = new THREE.Object3D()
        while (index <= count) { 

                for (var i =0 ; i < points.length; i+=3) {
                    if (Math.random() > 0.9) { 
                        
                        const vector = new THREE.Vector3(points[i]-offset,  points[i+1], points[i+2]);

                        dummy.scale.set(0.2,0.2,0.2)
                        dummy.position.set(vector.x, vector.y+4, vector.z);
                        dummy.rotation.y = Math.PI/2;
                        dummy.rotation.z = Math.PI;
            
                        dummy.updateMatrix();
                        meshes.forEach((m) => m.setMatrixAt(i/3, dummy.matrix))
                        index++;
                    }
  
                }

        }
        meshes.forEach(m => {
            m.instanceMatrix.needsUpdate = true;
            scene.add(m);
        })
    })
}


export function addLights(scene: THREE.Scene) { 
    const light = new THREE.DirectionalLight(0xffffff, 0.4);
    light.position.set(0, 30, 70);
    light.target.position.set(0, 10, -100);
    const sun = new THREE.DirectionalLight(0xe8f8ff, 1.5);
    sun.position.set(60, 200, -300);
    sun.name = 'sun'
    sun.lookAt(0, 20, -10);
    const helper = new THREE.DirectionalLightHelper(sun, 1);
    scene.add(helper)
    scene.add(sun)
    scene.add(light);
}

export function changeSunPosition(scene: THREE.Scene, position: number) { 
    const light = scene.getObjectByName('sun') as THREE.DirectionalLight
    if (!light) return
    light.position.z = position-100;
}


export function scaleInThings(scene: THREE.Scene, position: number) { 
    ["trees", "leaves", "boulders", "grass"].map((e) => scene.getObjectByName(e) as THREE.InstancedMesh).filter((e) => e).forEach((e) => { 
        const dummy = new THREE.Object3D()
        for ( var i = 0; i < e.count; i++) { 
            const matrix = new THREE.Matrix4()
            e.getMatrixAt(i, matrix);
            dummy.position.setFromMatrixPosition(matrix)
            let per: number;
            let scale = 1;
            if (e.name == 'boulders') { 
                scale = 1.25;
            } else if (e.name == 'grass') { 
                scale = 50;
                dummy.rotation.x = Math.PI/2;
            }
            const end = dummy.position.z+50;
            const start = end+100;
            per = (position-start)/(end-start)*scale;
            per = Math.min(Math.max(0,per),scale)
            dummy.scale.set(per, per, per);
            dummy.updateMatrix();
            e.setMatrixAt(i, dummy.matrix);
        }
        e.instanceMatrix.needsUpdate = true;
    })
}
