import * as THREE from 'three';
import {  FBXLoader, GLTFLoader, SVGLoader, TextGeometry, Water } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
//@ts-ignore
import { Noise } from 'noisejs'
import { instancedVertexShader, mountainShader, mountainVertex } from './mountaData';


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

export function addPlane(scene: THREE.Scene, cameraPosition: THREE.Vector3) {
    const geometry = new THREE.PlaneGeometry(100, 50, 120, 120,);
    const texture = new THREE.TextureLoader().load('/grass.jpg')
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5)
    const planeMesh = new THREE.InstancedMesh(geometry, material, 10);
    const dummy = new THREE.Object3D();
    const offset = 100;
    const position = new THREE.Vector3(0, 0, 0);
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
    addWater(scene);
    addGrass(scene, planeMesh, cameraPosition, true)
    addMiddleGround(scene);
    


}

function addGrass(scene: THREE.Scene, mesh: THREE.InstancedMesh, cameraPosition: THREE.Vector3, main: boolean) { 
    const count = (mesh.geometry.attributes.position.array.length / 3) * 10;
    const geometry = new THREE.BoxGeometry(0.8,1.2,0.8); 
    const boxMesh = new THREE.InstancedMesh(geometry, leavesMaterial, count);
    if (main) boxMesh.name = 'grass'
    boxMesh.rotation.set(Math.PI / 2, 0, Math.PI / 2)
    setPositions(scene, boxMesh, mesh.geometry.attributes.position.array, cameraPosition);

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

        const startingPoint = -8 + (percentageToCenter * 10);

        if (y > startingPoint && y < startingPoint + 15) {
            points[i + 2] += 100;

        }

        if (y == startingPoint || y == startingPoint + 15) {
            points[i + 2] += 4;
        }
    }
    mesh.instanceMatrix.needsUpdate = true;
}   

export function addMiddleGround(scene: THREE.Scene) { 
    const geo = new THREE.PlaneGeometry(400, 100, 200, 100);
    const texture = new THREE.TextureLoader().load('/grass.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5)
    const mesh = new THREE.InstancedMesh(geo, material, 10); 
    mesh.rotation.set(Math.PI / 2, 0, Math.PI); 
    mesh.position.y = -8;
    const dummy = new THREE.Object3D();
    for (var i = 0; i < mesh.count; i++) { 
        dummy.position.y = 100 * (i - 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    const points = mesh.geometry.attributes.position.array;
    const divide = 12;
    const noise = new Noise();
    for (var i = 0; i < points.length; i += 3) { 
        const x = points[i] / divide;
        const y = points[i + 1] / divide;
        const z = points[i + 2] / divide;
        points[i + 2] = noise.perlin3(x, y, z) * 4;
    }
    mesh.name = 'middle'
    mesh.instanceMatrix.needsUpdate = true
    scene.add(mesh)
    addGrassToMiddleGround(mesh.geometry.attributes.position.array, scene);
    
}
export function addGrassToMiddleGround(points: THREE.TypedArray, scene: THREE.Scene) { 

    const count = (points.length/3) * 10;
    const box = new THREE.BoxGeometry(1,1,2.1);
    const mesh = new THREE.InstancedMesh(box, leavesMaterial, count)
    mesh.position.y = -8;
    mesh.rotation.set(Math.PI / 2, 0, Math.PI); 
    const dummy = new THREE.Object3D()
    for (var instances = 0; instances <= 10; instances ++) { 
        for (var i = 0; i < points.length; i++) { 
            const x = points[i] + getRandomArbitrary(-1, 1);
            const y= points[i+1]  + (100*instances) + getRandomArbitrary(-1, 1);
            const z = points[i+2];
            dummy.position.set(x, y, z);
            dummy.rotation.z = Math.PI;
            dummy.scale.set(getRandomArbitrary(0.8, 2),getRandomArbitrary(0.8, 2),getRandomArbitrary(0.8, 2))
            dummy.updateMatrix();
            mesh.setMatrixAt(i / 3 + (instances * (points.length / 3)), dummy.matrix);
        }
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh)

}


export function setPositions(scene: THREE.Scene, mesh: THREE.InstancedMesh, points: THREE.TypedArray, cameraPosition: THREE.Vector3) { 
    const dummy = new THREE.Object3D();
   


    for (let instances = 0; instances <= 10; instances++) { 
        for (let i = 0; i < points.length; i += 3) { 
            const x = points[i] + (instances * -100) + getRandomArbitrary(-0.5, 0.5)
            const y = points[i + 1] + getRandomArbitrary(-0.5, 0.5)
            const originalZ = points[i + 2];

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

export function addText(scene: THREE.Scene, text: string) { 
    const loader = new FontLoader();
    loader.load('/font.json', (font) => { 
        const textGeo = new TextGeometry(text, {
            font: font,
            size: 5,
            height: 0,  
        })
     
        const textMesh = new THREE.Mesh(textGeo, textMaterial)
        textMesh.name = text;
        textMesh.position.set(-30, 10, -400);
        scene.add(textMesh);
    })
    
}


export function animateText(starting: number, ending: number, current: number, id: string, scene: THREE.Scene) { 
    const obj = scene.getObjectByName(id);
    if (!obj) { return }
    let mesh = scene.getObjectByName(id) as THREE.Mesh;
    let materials: THREE.Material | THREE.Material[] = (obj as THREE.Mesh).material;
   
    if (!Array.isArray(materials)) {
        materials = [materials];
    }
    materials.forEach((m) => { 
        let per = (current - starting) / (ending - starting) ;
        per = Math.min(1, Math.max(0, per));
        (m as THREE.ShaderMaterial).uniforms.opacity.value = per;
        m.needsUpdate = true
        mesh.position.y = per * 10 + 10;
    })
}

export function addLogo(scene: THREE.Scene) { 
    

    const geometry = new THREE.CircleGeometry(5, 50, 50);
    var texture = new THREE.TextureLoader().load('badge.webp');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 20, -200)
    const light = new THREE.PointLight(0xFFFFFF, 10);
    light.position.set(0, 20, -180);
    scene.add(light);
    scene.add(mesh);
}

export function addBackgroundLandscape() { 
   const geometry = new THREE.BoxGeometry(600, 1, 100, 200, 10, 200);

    let mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({roughness: 0, metalness: 1, color: "blue"}) , 10);
    mesh.position.y = -10;
    let dummy = new THREE.Object3D();
    for (var i = 0; i < mesh.count; i++) {
        dummy.position.z = -100 * (i - 1);
        dummy.position.y = -10;
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix)
    }
    addBackgroundNoise(mesh)
    return mesh;

}

function addBackgroundNoise(mesh: THREE.InstancedMesh) { 
    const noise = new Noise();
    const divide = 50;
    const points = mesh.geometry.attributes.position.array;

    for (var i = 0; i < points.length; i += 3) { 
        let x = points[i]/divide;
        const y = points[i + 1]/divide;
        const z = points[i + 2] / divide;
        const noiseValue = noise.simplex2(x, z);
        const distanceToCenter = Math.abs(x);
        const amp = 1 - distanceToCenter ** 3.5;
        points[i + 1] += noiseValue * amp;

    }
    mesh.instanceMatrix.needsUpdate = true;


  
  
}


export function createVideoElement() {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.src = '/h264test.webm'
    video.load();
    video.play()
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    const material = new THREE.MeshBasicMaterial({ map: videoTexture });
    const geometry = new THREE.PlaneGeometry(16, 9); // Adjust size as needed

    // Create a mesh with the video material and geometry
    const mesh = new THREE.Mesh(geometry, material);    
    mesh.position.set(0, 20,  -20);
    return mesh


}

function getXPosition() {
    let randomNumber: number;
    do {
        randomNumber = Math.random() * 280 - 280 / 2;
    } while (randomNumber >= -30 && randomNumber <= 30)
    return randomNumber
}

export function addBoulders(scene: THREE.Scene) { 

    const geometry = new THREE.SphereGeometry(3, 5, 5);
    const texture = new THREE.TextureLoader().load('rocks.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10)
    const material = new THREE.MeshStandardMaterial({map: texture});
    const mesh = new THREE.InstancedMesh(geometry, material, 100);
    const plane = scene.getObjectByName('middle') 
    if (!plane) { return }
    const dummy = new THREE.Object3D();
    for (var i = 0; i < mesh.count; i++) { 
        const z = Math.random() * -1000;
        const y = -5 + getRandomArbitrary(-1, 1);
        const x = getXPosition();
        dummy.position.set(x, y, z)
        const scale = getRandomArbitrary(1,2.5)
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }  
    mesh.name = 'boulders'

    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh)
}

export function LoadTree(scene: THREE.Scene) {
    const loader = new GLTFLoader();
    const count = 15;
    const positions: THREE.Vector3[] = Array.from({ length: count }).map(() => new THREE.Vector3(getXPosition(), -5, Math.random() * -1000));
    const dummy = new THREE.Object3D();
    loader.load('tree.glb', ({ scene: { children } }) => { 
        children[0].children.forEach((child, i) => { 
            console.log(child.name);
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



export function loadMountainGLB(scene: THREE.Scene) { 
    const loader = new GLTFLoader();
    loader.load('/mountain.glb', (gltf) => {
       
        console.log(gltf.scene);
      
        gltf.scene.children.forEach((e) => {
            addInstanceMesh(e as THREE.Mesh, scene, false)
        })
        gltf.scene.children.forEach((e) => {
            addInstanceMesh(e as THREE.Mesh, scene, true)
        })

    })
}

function addInstanceMesh(e: THREE.Mesh, scene: THREE.Scene, mirror: boolean) { 
    const texture = new THREE.TextureLoader().load('mountainMaterial.png');
    const material = new THREE.MeshStandardMaterial({ map:texture, metalness: 0})
    const instancedMesh = new THREE.InstancedMesh(e.geometry, material , 4);
    instancedMesh.position.y = -20;
    instancedMesh.position.x = mirror ? -350 : 350;
    instancedMesh.rotation.y = mirror ? -Math.PI/2 : Math.PI/2;
    instancedMesh.scale.set(250, 250, 250);
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



// Create a custom shader material
const textMaterial = new THREE.ShaderMaterial({
    uniforms: {
        opacity: { value: 0 }, // Set your initial opacity value
    },
    vertexShader: `
        precision highp float;
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float opacity;
        
        void main() {
            // Gradient effect from yellow to gold
            vec3 gradientColor = mix(vec3(1.0, 1.0, 0.0), vec3(0.97, 0.843, 0.0), vUv.y);
            
            // Combine with opacity
            vec4 finalColor = vec4(gradientColor, opacity);
            
            gl_FragColor = finalColor;
        }
    `,
    transparent: true, // Enable transparency in the material
});



let simpleNoise = `
    float N (vec2 st) { // https://thebookofshaders.com/10/
        return fract( sin( dot( st.xy, vec2(12.9898,78.233 ) ) ) *  43758.5453123);
    }
    
    float smoothNoise( vec2 ip ){ // https://www.youtube.com/watch?v=zXsWftRdsvU
    	vec2 lv = fract( ip );
      vec2 id = floor( ip );
      
      lv = lv * lv * ( 3. - 2. * lv );
      
      float bl = N( id );
      float br = N( id + vec2( 1, 0 ));
      float b = mix( bl, br, lv.x );
      
      float tl = N( id + vec2( 0, 1 ));
      float tr = N( id + vec2( 1, 1 ));
      float t = mix( tl, tr, lv.x );
      
      return mix( b, t, lv.y );
    }
  `;


const vertexShader = `
  varying vec2 vUv;
  uniform float time;
  
  ${simpleNoise}
  
	void main() {

    vUv = uv;
    float t = time * 2.;
    
    // VERTEX POSITION
    
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    	mvPosition = instanceMatrix * mvPosition;
    #endif
    
    // DISPLACEMENT
    
    float noise = smoothNoise(mvPosition.xz * 0.5 + vec2(0., t));
    noise = pow(noise * 0.5 + 0.5, 2.) * 3.;
    
    // here the displacement is made stronger on the blades tips.
    float dispPower = 1. - cos( uv.y * 3.1416 * 0.5 );
    
    float displacement = noise * ( 0.3 * dispPower );
    mvPosition.z -= displacement;
    
    //
    
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`;

const fragmentShader = `
  varying vec2 vUv;
  
  void main() {
  	vec3 baseColor = vec3( 0.41, 1.0, 0.3 );
    float clarity = ( vUv.y * 0.875 ) + 0.125;
    gl_FragColor = vec4( baseColor * clarity, 1 );
  }
`;

const uniforms = {
	time: {
  	value: 0
  }
}

const leavesMaterial = new THREE.ShaderMaterial({
	vertexShader,
  fragmentShader,
  uniforms,
  side: THREE.DoubleSide
});


// Assuming you have a ShaderMaterial
var material = new THREE.ShaderMaterial({
    fragmentShader: mountainShader,
    vertexShader: instancedVertexShader,
    uniforms: {
        snowHeight: { value: 0.7 },  // Adjust the snow height threshold
        rockHeight: { value: 0.4 }   // Adjust the rock height threshold
    }
});



export const scaleVertexShader = `
        varying vec2 vUv;
        uniform vec2 aspect;

        void main() {
            vUv = uv;
            vec3 newPosition = position;
            
            // Scale up each vertex based on camera distance
            float distance = length(newPosition);
            float scaleFactor = 1.  +  distance * 0.1; // Adjust the scaling factor as needed
            newPosition *= scaleFactor;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }`

export const scaleFragShader = `        
        varying vec2 vUv;
        uniform sampler2D tDiffuse;

        void main() {
            gl_FragColor = texture2D(tDiffuse, vUv);
        }`



export function addLights(scene: THREE.Scene) { 
    const light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(0, 30, 70);
    light.target.position.set(0, 10, -100);
    const sun = new THREE.DirectionalLight(0xffffff, 0.2);
    sun.position.set(0, 80, 40);
    sun.target.position.set(0, 10, -100);
    scene.add(sun)
    scene.add(light);
}


export function scaleInThings(scene: THREE.Scene, position: number) { 
    ["trees", "leaves", "boulders"].map((e) => scene.getObjectByName(e) as THREE.InstancedMesh).filter((e) => e).forEach((e) => { 
        console.log(e.name);
        const dummy = new THREE.Object3D()
        for ( var i = 0; i < e.count; i++) { 
            const matrix = new THREE.Matrix4()
            e.getMatrixAt(i, matrix);
            dummy.position.setFromMatrixPosition(matrix)
            const end = dummy.position.z+100;
            const start = end+200;
            const per = Math.min(Math.max(0, (position-start)/(end-start)),1);
            dummy.scale.set(per, per, per);
            dummy.updateMatrix();
            e.setMatrixAt(i, dummy.matrix);
        }
        e.instanceMatrix.needsUpdate = true;
    })
}