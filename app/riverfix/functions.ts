import * as THREE from 'three';
import {  TextGeometry, Water } from 'three/examples/jsm/Addons.js';
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
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
    addGrass(scene, planeMesh)
    addMiddleGround(scene);
    


}

function addGrass(scene: THREE.Scene, mesh: THREE.InstancedMesh) { 
    const count = (mesh.geometry.attributes.position.array.length / 3) * 10;
    const geometry = new THREE.BoxGeometry(Math.random()*0.7,1.2,Math.random()*0.7); 
    const boxMesh = new THREE.InstancedMesh(geometry, leavesMaterial, count);
    boxMesh.name = 'grass'
    boxMesh.rotation.set(Math.PI / 2, 0, Math.PI / 2)
    setPositions(scene, boxMesh, mesh.geometry.attributes.position.array);

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
    const geo = new THREE.PlaneGeometry(400, 100, 100, 100);
    const texture = new THREE.TextureLoader().load('/grass.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5)
    const mesh = new THREE.InstancedMesh(geo, material, 1); 
    mesh.rotation.set(Math.PI / 2, 0, Math.PI); 
    mesh.position.y = -5;
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
    mesh.instanceMatrix.needsUpdate = true;


    scene.add(mesh)
}



function setPositions(scene: THREE.Scene, mesh: THREE.InstancedMesh, points: THREE.TypedArray) { 
    const dummy = new THREE.Object3D();
   

    for (var instances = 0; instances <= 10; instances++) { 
        for (var i = 0; i < points.length; i += 3) { 
                const x = points[i] + (instances * -100) +  getRandomArbitrary(-1, 1)
                const y = points[i + 1] + getRandomArbitrary(-1, 1)
                const z = points[i + 2];
                dummy.rotation.set(Math.PI / 2, 0, Math.PI)
                
                dummy.position.set(x, y, z);
               
             
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

export function addBackgroundLandscape() { 
   const geometry = new THREE.BoxGeometry(600, 1, 100, 200, 10, 200);
    let mesh = new THREE.InstancedMesh(geometry,new  THREE.MeshLambertMaterial({color: 0x3c3951}), 10);
    let dummy = new THREE.Object3D();
    for (var i = 0; i < mesh.count; i++) {
        dummy.position.z = -100 * (i - 1);
        dummy.position.y = -10;
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix)

    }
    addBackgroundNoise(mesh);
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
        const amp = 1 - distanceToCenter ** 3.2;
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

