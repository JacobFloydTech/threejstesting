import * as THREE from 'three';
import {  FBXLoader, GLTFLoader, Reflector, SVGLoader, TextGeometry, Water, DRACOLoader} from 'three/examples/jsm/Addons.js';
//@ts-ignore
import { Noise } from 'noisejs'
import { addNewGrass } from './display';
import { loadDisplay } from './display';
import { loadDisplayMobile } from './displayMobile';

export function addWater(scene: THREE.Scene) {

    var waterGeometry = new THREE.PlaneGeometry(200, 100*20 , 40, 40);
    const texture =  new THREE.TextureLoader().load('waternormals1.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.rotation = Math.PI;
    })
    var water = new Water(
        waterGeometry,
        {
            textureWidth: 1024,
            textureHeight: 1024,
            waterNormals: texture,
            alpha: 1,// Transrency
            sunColor: 0xF5F5F5,
            sunDirection: new THREE.Vector3(3,3,-3),
            waterColor: 0x0000FF,
            distortionScale: 1,
            fog: true,
          
        },
    );
    water.geometry.computeVertexNormals();
    const points = water.geometry.attributes.position.array;
    const noise = new Noise();
    let divide = 10;
    for (var i =0 ; i < points.length; i+=3) { 
        const x = points[i]/divide, y = points[i+1]/divide;
        points[i+2] = noise.perlin2(x,y)*10;
    }
    water.geometry.attributes.position.needsUpdate = true
    water.rotation.x = -Math.PI / 2;
    water.position.z -= 400;
    water.position.y -= 9;
    water.name = 'waterMesh'
    scene.add(water);
}


export async function addMiddleGround(scene: THREE.Scene) { 
    return new Promise<void>((resolve, reject) => { 
        const loader = new GLTFLoader()
        loader.load('/widerRiver.glb', (obj) => { 
            const texture = new THREE.TextureLoader().load('/testlandscape2.png')
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

export function addUnderlyingLandscape(scene: THREE.Scene) {
    const loader = new GLTFLoader();
    loader.load('underlyingLandscape.glb', gltf => { 
        const child = gltf.scene.children[0] as THREE.Mesh;
        const mesh = new THREE.InstancedMesh(child.geometry, child.material, 30)
        mesh.position.set(0,20,-100)
        mesh.scale.set(100,100,100);
        let zOffset =0;
        let yOffset = -0.2;
        const xOffset = 2.1
        const dummy = new THREE.Object3D();
        for (var i =0 ; i < mesh.count/2; i++) { 
        
            dummy.position.set(xOffset,yOffset, zOffset); 
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            zOffset -=1;
      
        }
        zOffset= 0 ;
        for (var i =mesh.count/2 ; i < mesh.count; i++) { 
    
            dummy.position.set(-xOffset,yOffset, zOffset); 
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            zOffset -=1;
      
        }
        scene.add(mesh)
    })
}

export function animateMountains(scene: THREE.Scene, position: THREE.Vector3) { 
    let z = Math.abs(position.z);
    let maxOffset = 1.2;
    const maxDistance = 500;
    ['mountainRight', 'mountainLeft'].map((e) => scene.getObjectByName(e) as THREE.InstancedMesh).filter((e) => e).forEach((e) => { 
        const dummy = new THREE.Object3D();
        for (var i = 0; i < e.count;i++) { 
            const matrix = new THREE.Matrix4();
            e.getMatrixAt(i, matrix);
            dummy.applyMatrix4(matrix);
            dummy.updateMatrix();
            dummy.rotation.set(0, 0, 0);  
            dummy.position.setFromMatrixPosition(matrix)
            let x = Math.abs(dummy.position.x*250)-100;
            let distance = x-z;
            let per = Math.min(Math.max((distance/maxDistance),0),1)*maxOffset;
            dummy.position.y = -per;
            dummy.updateMatrix();
            e.setMatrixAt(i, dummy.matrix)
        }
        e.instanceMatrix.needsUpdate = true;
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
    } while (randomNumber >= -50 && randomNumber <= 50)
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
                    dummy.position.set(points[i]+(instances*200), points[i+1]-4, points[i+2])
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

function calculatePercentageToCenter(value: number, min: number, max: number) {
    // Ensure the value is within the specified range
    if (value >= min && value <= max) {
      // Calculate the distance from the center
      const center = (max + min) / 2;
      const distanceToCenter = Math.abs(value - center);
  
      // Calculate the percentage based on the distance
      const percentageToCenter = ((max - distanceToCenter) / (max - min)) * 100;
  
      return percentageToCenter;
    } else {
      console.error('Value is outside the specified range.');
      return null;
    }
  }

  


export function LoadTree(scene: THREE.Scene) {
    const loader = new GLTFLoader();
    const count = 60;
    const positions: THREE.Vector3[] = Array.from({ length: count }).map(() => new THREE.Vector3(getXPosition(), -2, Math.random()*-1000));
    const dummy = new THREE.Object3D();

    const parent = scene.getObjectByName('middle') as THREE.InstancedMesh;
    if (!parent) return
    let points = parent.geometry.attributes.position.array;
    let normalPoints: THREE.Vector3[] = [];
    for (var i = 0; i < points.length; i+=3) { 
        normalPoints.push(parent.localToWorld(new THREE.Vector3(points[i], points[i+1], points[i+2])))
    }

    
    loader.load('tree.glb', ({ scene: { children } }) => { 
        children[0].children.forEach((child, i) => { 
            (child as THREE.Mesh).castShadow = true;
            (child as THREE.Mesh).receiveShadow = true;
            const material = new THREE.MeshStandardMaterial({color: i == 1 ? "green" : "#63462D"  }) 
            const instancedmesh = new THREE.InstancedMesh((child as THREE.Mesh).geometry,material, count);
            for (var i = 0; i < instancedmesh.count; i++) { 
                dummy.position.copy(positions[i])
         
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
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
        dracoLoader.setDecoderConfig({type: 'js'})
        loader.setDRACOLoader( dracoLoader );
        loader.load('/testingmountain.glb', (gltf) => {
        for (var i = 0; i < 2; i++) { 
            gltf.scene.children.forEach((e) => addInstanceMesh(e as THREE.Mesh, scene, !!i))
        }
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
    instancedMesh.position.x = mirror ? -440 : 440;
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
                        dummy.position.y -= 4;
            
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



export function addPlaneWithShader(scene: THREE.Scene) { 

    let vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `
    const shader = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: `
        varying vec2 vUv;
        
        void main() {
            float opacity = 0.12;
            float exponent = 3.0;
            vec2 center = vec2(0.5, 0.5);
            float distance = length(vUv-center)*15.;
            float darkness = exp(-exponent * distance)-0.2;
            vec3 color = vec3(darkness);
            gl_FragColor = vec4(color, opacity);
        }
        `, transparent: true,
    })
    const geometry = new THREE.PlaneGeometry(50, 50);
    const mesh = new THREE.Mesh(geometry, shader);
    mesh.position.set(0, 30, -100)
    mesh.name = 'planeShader'
    scene.add(mesh);
}
export function updatePlaneShader(scene: THREE.Scene, position: number) {
    const plane = scene.getObjectByName('planeShader');
    if (!plane) return
    plane.position.z = position-10;
}


export function addCloud(scene: THREE.Scene) { 
    const loader = new GLTFLoader();
    loader.load('fluffy_cloud.glb', (obj) => { 
        const c = obj.scene.children[0] as THREE.Mesh;
        const mesh = new THREE.InstancedMesh(c.geometry, new THREE.MeshBasicMaterial({color:"white", transparent: true, opacity: 0.1, side: THREE.DoubleSide}), 20)
        mesh.position.set(0,20,-100);
        mesh.scale.set(80,80,80)
        const dummy = new THREE.Object3D()
        for (var i = 0; i < mesh.count ;i++) { 
            dummy.position.set(getRandomArbitrary(-5,5 ),2, Math.random()*-200)
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix)
        }
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
    })
}

export function addLights(scene: THREE.Scene) { 
    const light = new THREE.PointLight(undefined, 3, 300, 0.1);
    light.position.set(-100, 150, -200);
    light.castShadow = true
    light.shadow.mapSize.width = 2500;
    light.shadow.mapSize.height = 2500;
    light.name = 'light'
    const waicorderLight = new THREE.PointLight(0xFFFFFF, 1, 300, 0.1);
    waicorderLight.position.set(0, 40, 0)
    waicorderLight.name = 'waicorderLight';
    scene.add(waicorderLight)
    scene.add(light)

}

export function changeSunPosition(scene: THREE.Scene, position: number) { 
    const light = scene.getObjectByName('light');
    if (!light) return
    light.position.z = position-200;
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

