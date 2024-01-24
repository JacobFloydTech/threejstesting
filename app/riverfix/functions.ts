import * as THREE from 'three';
import {  FBXLoader, GLTFLoader, Reflector, SVGLoader, TextGeometry, Water } from 'three/examples/jsm/Addons.js';
//@ts-ignore
import { Noise } from 'noisejs'
import { addNewGrass } from './display';
import { loadDisplay } from './display';
import { loadDisplayMobile } from './displayMobile';
import { ImprovedNoise } from 'three/examples/jsm/Addons.js';


export function addWater(scene: THREE.Scene) {

    var waterGeometry = new THREE.PlaneGeometry(100, 100*20 , 100, 100);
    const texture =  new THREE.TextureLoader().load('waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.rotation = Math.PI;
    })
    var water = new Water(
        waterGeometry,

        {
            textureWidth: 1024,
            textureHeight: 1024,
            waterNormals: texture,
            alpha: 0.8,// Transrency
            sunColor: 0xffffff,
            waterColor: 0x5858BC,
            distortionScale: 1,
            fog: true,
        },
    );
    console.log(water.geometry.attributes.position.array);
    water.rotation.x = -Math.PI / 2;
    water.position.z -= 400;
    water.position.y -= 9;
    water.name = 'waterMesh'
    scene.add(water);
}

export function animateWater(time: number, scene: THREE.Scene) { 
    const mesh = scene.getObjectByName('waterMesh') as THREE.Mesh
    if (!mesh) return
    const points = mesh.geometry.attributes.position.array;
    for (var i =0 ; i < points.length; i+=3) { 
        const x = points[i]
        points[i+1] = Math.sin(x+time)*0.5;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    
}

export async function addMiddleGround(scene: THREE.Scene) { 
    return new Promise<void>((resolve, reject) => { 
        const loader = new GLTFLoader()
        loader.load('/testlandscape.glb', (obj) => { 
            const texture = new THREE.TextureLoader().load('/test.png')
            texture.flipY = false
            const child = obj.scene.children[0] as THREE.Mesh;
            const scale = 100;
            const instancedMesh = new THREE.InstancedMesh(child.geometry, new THREE.MeshStandardMaterial({map: texture}), 7);
            const dummy = new THREE.Object3D();
            for (var i = 0; i < instancedMesh.count; i++) { 
                dummy.rotation.y = Math.PI/2;
                dummy.position.z = -190*i-1;
                dummy.scale.set(scale,scale,scale)
                dummy.receiveShadow = true;
            
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(i, dummy.matrix);
            }
            instancedMesh.castShadow = true;
            instancedMesh.receiveShadow = true
            instancedMesh.instanceMatrix.needsUpdate = true;
            instancedMesh.name = 'middle'
            scene.add(instancedMesh)
            addBoulders(scene)
            addNewGrass(scene)
        
            window.outerWidth >= 1366 ? loadDisplay(scene) : loadDisplayMobile(scene)
            
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
    } while (randomNumber >= -46 && randomNumber <= 46)
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
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const plane = scene.getObjectByName('middle') as THREE.InstancedMesh
    if (!plane) return
    const points = plane.geometry.attributes.position.array.map((e) => e*100)

    const dummy = new THREE.Object3D();
    while (index <= count) {
        for (var instances = 0; instances < plane.count; instances++) { 
            for (var i =0 ; i < points.length; i+=3) { 
                if (Math.random() > 0.99) { 
                    dummy.position.set(points[i]+(instances*200), points[i+1]-2, points[i+2])
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
    const positions: THREE.Vector3[] = Array.from({ length: count }).map(() => new THREE.Vector3(getXPosition(), getRandomArbitrary(0, -2), Math.random() * -1000));
    const dummy = new THREE.Object3D();
    
    loader.load('tree.glb', ({ scene: { children } }) => { 
        children[0].children.forEach((child, i) => { 
            (child as THREE.Mesh).castShadow = true;
            (child as THREE.Mesh).receiveShadow = true;
            const material = new THREE.MeshStandardMaterial({color: i == 1 ? "green" : "brown"}) 
            const instancedmesh = new THREE.InstancedMesh((child as THREE.Mesh).geometry,material, count);
            for (var i = 0; i < instancedmesh.count; i++) { 
                dummy.position.copy(positions[i]);
                dummy.updateMatrix();
                instancedmesh.setMatrixAt(i, dummy.matrix);
            }
            instancedmesh.castShadow = true;
            instancedmesh.receiveShadow = true
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
    instancedMesh.name = mirror ? "mountainRight" : "mountainLeft";
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


    
export function DustDetail(scene: THREE.Scene, mirror :boolean) { 
    const texture = new THREE.TextureLoader().load('smoke.png');
    const box = new THREE.PlaneGeometry(25,100,200,200);
    
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(10,10);
    const mesh = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: texture, transparent: true, opacity: 0.05, fog: true   }), 6);
    mesh.rotation.x= -Math.PI/2;
    mesh.position.set(mirror ? -80 : 80, -1.6 , -100)
    const dummy = new THREE.Object3D();
    for (var i =0; i <mesh.count;i++) { 
        dummy.position.y = i*50;
        dummy.scale.set(2,2,2)
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix)
    }
    const points = mesh.geometry.attributes.position.array;
    const noise = new Noise();

    for (var instances = 0; instances <= mesh.count; instances++) { 
        for (let i =0 ;i  < points.length; i+=3) { 
            const x = points[i];
            const y = points[i+1]+instances*50;
            const z = points[i+2];
            const divider = 2;
            points[i+2] += noise.perlin3(x/divider,y/divider,z/divider)/2
            
        }
    }
    mesh.instanceMatrix.needsUpdate = true
    scene.add(mesh)

    const addParticles = () => { 
        const num = 3000;
        const positions = new Float32Array(num * 3);
        const geometry = new THREE.BufferGeometry()
        for (let i = 0; i < num; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;  // Random x coordinate within [-10, 10]
            positions[i * 3 + 1] = Math.random()  * 50;  // Random y coordinate within [-10, 10]
            positions[i * 3 + 2] = Math.random() * -900;  // Random z coordinate within [-10, 10]
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({size: 0.1, color: 0xB2996E});
        const mesh = new THREE.Points(geometry, material);
        mesh.name = 'dust'
        scene.add(mesh)
    }
    //addParticles()
}





export function getMiddleGround(scene: THREE.Scene) { 
    const middle = scene.getObjectByName('middle') as THREE.InstancedMesh;
    if (!middle) { return}
    let points: THREE.Vector3[] = []
    let data = middle.geometry.attributes.position.array;
    for (var i =0 ; i < data.length; i+=3) { 
        points.push(
            middle.localToWorld(new THREE.Vector3(data[i], data[i+1], data[i+2]))
        )
    }
}


export function animateMountains(scene: THREE.Scene, zPosition: number) {
    zPosition = Math.abs(zPosition)/100;
    const getDecimal = (input: number) => Math.abs(Math.floor(input)-input);
    ["mountainRight", "mountainLeft"].map(e => scene.getObjectByName(e) as THREE.InstancedMesh).filter(e => e).forEach((e) => { 
        const dummy = new THREE.Object3D();
        for (var i = 0; i < e.count-1;i++) { 
            const matrix = new THREE.Matrix4();
            e.getMatrixAt(i+1, matrix);
            dummy.position.setFromMatrixPosition(matrix)

                if (i < Math.floor(zPosition)) { 
                    dummy.scale.set(1,1,1);
                } else if (i > Math.ceil(zPosition)*i) { 
                    dummy.scale.set(0,0,0)
                } else { 
                    const per = getDecimal(zPosition);
          
                    dummy.scale.set(1,per,1)
                }
            
 
            dummy.updateMatrix();
            e.setMatrixAt(i+1, dummy.matrix);
        }
        e.instanceMatrix.needsUpdate = true;
    })
}

export function addCloud(scene: THREE.Scene) { 
    const loader = new GLTFLoader();
    loader.load('fluffy_cloud.glb', (obj) => { 
        const c = obj.scene.children[0] as THREE.Mesh;
        const mesh = new THREE.InstancedMesh(c.geometry, new THREE.MeshBasicMaterial({color:"white", transparent: true, opacity: 0.2, side: THREE.DoubleSide}), 10)
        mesh.scale.set(20,20,20);
        const dummy = new THREE.Object3D()
        for (var i = 0; i < mesh.count ;i++) { 
            dummy.position.set(getRandomArbitrary(-10, 10), 10, Math.random()*-120);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix)
        }
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
    })
}

export function addLights(scene: THREE.Scene) { 
    const light = new THREE.PointLight(undefined, 5, 300, 0.1);
    light.position.set(0, 120, 20);
    light.castShadow = true
    light.shadow.mapSize.width = 2500;
    light.shadow.mapSize.height = 2500;
    light.name = 'light'

    const sun = new THREE.DirectionalLight(0x89CFF0, 2);
    sun.position.set(100, 200, -600);
    sun.target.position.set(0, 30, -100);
    sun.castShadow = true;
    scene.add(sun)
    scene.add(light)
}

export function changeSunPosition(scene: THREE.Scene, position: number) { 
    const light = scene.getObjectByName('light');
    if (!light) return
    light.position.z = position+50;
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


export function addStars(scene: THREE.Scene){ 
    const starGeo = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 350; i++) {
        const x = getRandomArbitrary(-900, 900);
        const y = getRandomArbitrary(200, 900);
        const z = getRandomArbitrary(-1800, -50);
        starVertices.push(x, y, z);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
    const starMaterial = new THREE.PointsMaterial({fog: false,  color: 0xFFFFFF, size: 2});
    const stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars)
}
