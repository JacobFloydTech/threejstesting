"use client"
import { MutableRefObject, useEffect, useRef } from 'react'
import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
//@ts-ignore
import { Noise } from 'noisejs';
import { Object3D, PlaneGeometry, SphereGeometry, WebGLRenderer } from 'three';

export default function Page() {
    const ref = useRef<any>();
    useEffect(() => { setScene(ref) }, [])
    return <div ref={ref} />
}

function setScene(ref: MutableRefObject<any>) {
    if (!ref.current) { return }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
    const renderer = new THREE.WebGLRenderer();
    camera.position.set(0, 0, 40);

    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0;
    ref.current.appendChild(renderer.domElement);

    addPlane(scene, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update()


    function animate() {
        controls.update()
        requestAnimationFrame(animate);
        renderer.render(scene, camera)

    }
    animate()
}

export function addPlane(scene: THREE.Scene, zPosition: number) {
    const geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
    const texture = new THREE.TextureLoader().load('/grass.jpg')
    const material = new THREE.MeshBasicMaterial({  map:texture, side: THREE.DoubleSide})
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5,5)
    const planeMesh = new THREE.Mesh(geometry, material);
    planeMesh.rotation.x = Math.PI / 2;
    planeMesh.position.z = zPosition;
    planeMesh.rotation.z = Math.PI / 2;
    const points = planeMesh.geometry.attributes.position.array;


    const uniforms = {
        time: { value: 0 },
    }

    const leaf = `
  varying vec2 vUv;
  uniform float time;
  
	void main() {

    vUv = uv;
    
    // VERTEX POSITION
    
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    	mvPosition = instanceMatrix * mvPosition;
    #endif
    
    // DISPLACEMENT
    
    // here the displacement is made stronger on the blades tips.
    float dispPower = 1.0 - cos( uv.y * 3.1416 / 2.0 );
    
    float displacement = sin( mvPosition.y + time * 10.0 ) * ( 0.1 * dispPower );
    mvPosition.y += displacement;
    
    //
    
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`;

    const leaf2 = `
  varying vec2 vUv;
  
  void main() {
  	vec3 baseColor = vec3( 0.41, 1.0, 0.5 );
    float clarity = ( vUv.y * 0.5 ) + 0.5;
    gl_FragColor = vec4( baseColor * clarity, 1 );
  }
`;

    const grassMaterial = new THREE.ShaderMaterial({
        vertexShader: leaf,
        fragmentShader: leaf2,
        uniforms: uniforms,
        side: THREE.DoubleSide,
    })

    const bloomFragmentShader = ` 
			uniform sampler2D baseTexture;
			uniform sampler2D bloomTexture;

			varying vec2 vUv;

			void main() {

				gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

            }`

    const bloomVertexShader = ` 
		varying vec2 vUv;

			void main() {

				vUv = uv;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}
`





    const noise = new Noise(Math.random())


    const divide = 8;

    const dummy = new Object3D();

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
            points[i + 2] += 6;

        }

        if (y == startingPoint || y == startingPoint + 10) {
            points[i + 2] += 4;
        }




    }

    addFlowers(points, scene, planeMesh);

    var waterGeometry = new THREE.PlaneGeometry(100, 100, 200, 200);
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
        }
    );

    water.rotation.x = -Math.PI / 2;
    water.position.y -= 3;
    water.position.z = zPosition;

    water.name = 'waterMesh'
    scene.add(water);



    scene.add(planeMesh);

}


export function addFlowers(points: THREE.TypedArray, scene: THREE.Scene, parent: THREE.Mesh) {
    for (var i = 0; i < points.length; i += 3) {
        if (Math.random() > 0.9) {
            const sphere = new SphereGeometry(0.2, 6, 6);
            const material = new THREE.MeshStandardMaterial({ color: "#D56262" })
            const mesh = new THREE.Mesh(sphere, material);
            const position = parent.localToWorld(new THREE.Vector3(points[i], points[i + 1], points[i + 2]));

            mesh.position.set(position.x, position.y + 3.4, position.z)

            scene.add(mesh);


        }

    }
}