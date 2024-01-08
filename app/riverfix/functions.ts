import * as THREE from 'three';
import { Water } from 'three/examples/jsm/Addons.js';
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
//@ts-ignore
import { Noise } from 'noisejs'


export function addWater(scene: THREE.Scene) {

    var waterGeometry = new THREE.PlaneGeometry(35, 100 * 10, 50, 50);
    var water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            alpha: 0.95, // Transparency
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 2,
        },
    );

    water.rotation.x = -Math.PI / 2;
    water.position.z -= 350;
    water.position.y -= 2.2
    water.name = 'waterMesh'
    scene.add(water);



}

export function addPlane(scene: THREE.Scene) {

    const geometry = new THREE.PlaneGeometry(100, 50, 50, 50, );
    const texture = new THREE.TextureLoader().load('/grass.jpg')
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5)
    const planeMesh = new THREE.InstancedMesh(geometry, material, 20);
    const dummy = new THREE.Object3D();
    const offset = 100;
    for (var i = 0; i < planeMesh.count; i++) {
        let zOffset = -offset * (i - 1)
        dummy.position.set(0, 0, zOffset)
        dummy.rotation.set(Math.PI / 2, 0, Math.PI / 2)
        dummy.updateMatrix();
        planeMesh.setMatrixAt(i, dummy.matrix)
    }
    updatePoints(planeMesh.geometry.attributes.position.array, planeMesh)
    planeMesh.instanceMatrix.needsUpdate = true;
    planeMesh.name = 'plane'
    scene.add(planeMesh)
    addWater(scene)
    loadObjGrassModel(scene);

}

function updatePoints(points: THREE.TypedArray, mesh: THREE.InstancedMesh) {
    const noise = new Noise();
    let divide = 8;
    for (var i = 0; i < points.length; i += 3) {
        let x = points[i] / divide;
        let y = points[i + 1] / divide;
        let z = points[i + 2] / divide;
        points[i + 2] = noise.perlin3(x, y, z) * 4;
        x *= divide;
        y *= divide;
        const percentageToCenter = (1 - Math.abs(x) / 25);

        const startingPoint = -5 + (percentageToCenter * 10);

        if (y > startingPoint && y < startingPoint + 10) {
            points[i + 2] += 10;

        }

        if (y == startingPoint || y == startingPoint + 10) {
            points[i + 2] += 4;
        }
    }
    mesh.instanceMatrix.needsUpdate = true;


}

export function loadObjGrassModel(scene: THREE.Scene) { 
    const loader = new GLTFLoader();


    loader.load('/grass.glb', (gltf) => {
        const e = gltf.scene.children[0].children[1];
        const points = (scene.getObjectByName('plane') as THREE.InstancedMesh).geometry.attributes.position.array;
        const childMesh = new THREE.InstancedMesh((e as THREE.Mesh).geometry, (e as THREE.Mesh).material, (points.length / 3) * 10);
        childMesh.rotation.set(Math.PI / 2, 0, Math.PI / 2)
        setPositions(scene, childMesh, points);
    })
   
}   

function setPositions(scene: THREE.Scene, mesh: THREE.InstancedMesh, points: THREE.TypedArray) { 
    const dummy = new THREE.Object3D();
    for (var instances = 0; instances <= 10; instances++) { 
        for (var i = 0; i < points.length; i += 3) { 
            if (Math.random() > 0.8) { 
                const x = Math.random()*-1500;
                const y = points[i + 1] + getRandomArbitrary(-1, 1)
                const percentageToCenter = (1-Math.abs(x)/25);
                const startingPoint = -5+(percentageToCenter*10);
                let z;
                if (y > startingPoint && y < startingPoint + 10) { 
                    z = 100;
                } else { 
                    z = points[i + 2] -2;
                }
         
                const scale = getRandomArbitrary(1, 2);
                dummy.position.set(x, y, z);
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();
                mesh.setMatrixAt(i / 3 + (instances * (points.length / 3)), dummy.matrix);
            

            }
              
            

        }
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
}




function getRandomArbitrary(min:number, max: number) {
    return Math.random() * (max - min) + min;
}
