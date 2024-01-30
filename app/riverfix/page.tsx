"use client"
import { DustDetail, LoadTree, addCloud, addLights, addMiddleGround, addPlaneWithShader, addWater, changeSunPosition, getMiddleGround, loadMountainGLB , scaleInThings, updatePlaneShader, animateMountains, addUnderlyingLandscape } from './functions';
import { MutableRefObject, useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { BokehPass, EffectComposer, RenderPass, ShaderPass, Water, HorizontalBlurShader, } from 'three/examples/jsm/Addons.js';
import {   animateRings,  changeTImeValue, handleAnimation, loadHDR, loadDisplay, addWaicorder} from './display';
import { VignetteShader } from 'three/examples/jsm/Addons.js';
import Loading from './loading';
//@ts-ignore
import {Noise} from 'noisejs'

let velocity = -0.05;

export default function Page() {
    const ref = useRef<any>(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => { setScene(ref, setLoading) }, [])
    return (
        <div className='w-full h-screen fixed top-0 left-0'>

            <div className={"w-full h-screen" + (loading ? " hidden" : ' fixed')} ref={ref} />
            {loading ? <Loading/> : 
                <>
                    <img src='/sun.jpg' className='w-full -translate-y-40  md:-translate-y-80 object-cover h-full absolute top-0 left-0 -z-40 bg-black'/>
                    <img src='/sun.jpg' className='w-full  object-cover h-full absolute top-0 left-0 -z-50 bg-black'/>
                </>
            }
        </div>

    )
}




async function setScene(ref: MutableRefObject<any>, setLoading: Function) {
    if (!ref.current) { return }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({alpha: true})
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = false;
    renderer.shadowMap.enabled = true;
    ref.current.appendChild(renderer.domElement);
    await Promise.all([
        loadMountainGLB(scene),
        addMiddleGround(scene),
    ]) 
    getMiddleGround(scene)
    setTimeout(() => {
        setLoading(false)
    }, 200);
    addUnderlyingLandscape(scene)
    addWater(scene)
    DustDetail(scene, true)
    DustDetail(scene, false)
    addCloud(scene)
    scene.fog = new THREE.FogExp2( 0xd28032, 0.01 );
    const water = scene.getObjectByName('waterMesh') as Water;
    scene.background = null
    camera.position.set(0, 30, 100);
    camera.lookAt(0, 30, 50);
    addLights(scene)
    
    LoadTree(scene)
   // let mixer = await (window.outerWidth >= 1366 ? addWaicorder(scene) :addWaicorderMobile(scene) )

    const waicorder = scene.getObjectByName('Armature003') as THREE.Object3D;
    const clock = new THREE.Clock();
 
    const mesh = scene.getObjectByName('waterMesh') as THREE.InstancedMesh;
    const points = mesh.geometry.attributes.position.array;
    const divide=  10;
    const noise = new Noise()

    //postprocessing

    let composer = new EffectComposer( renderer );
    const bokehPass = new BokehPass(scene, camera, {
        focus: 100,   // Adjust focus distance (0 to 1)
        aperture: 0.0002,  // Adjust aperture size (0 to 1)
        maxblur: 0.005,  // Adjust maximum blur strength (0 to 1)
        
    });
   
    bokehPass.materialBokeh.transparent = true;
    bokehPass.materialBokeh.opacity = 0;
    bokehPass.materialBokeh.fragmentShader = fragmentShader;
	composer.addPass( new RenderPass( scene, camera ) );
	composer.addPass(bokehPass)
	var shaderVignette = VignetteShader;
	var effectVignette = new ShaderPass( shaderVignette );
	// larger values = darker closer to center
	// darkness < 1  => lighter edges
	effectVignette.uniforms[ "offset" ].value = 1;
	effectVignette.uniforms[ "darkness" ].value = 1;
    effectVignette.renderToScreen = true;
    //composer.addPass(blur)
	composer.addPass(effectVignette);

    

    function animate() {
        const scaleValue = 0.7+0.5* Math.abs(Math.sin(Date.now() * 0.0005));
        animateMountains(scene, camera.position)
        animateRings(scene, scaleValue)
        changeTImeValue(scene, clock.getDelta());
        scaleInThings(scene, camera.position.z);
        handleAnimation(camera.position.z, scene);
        changeSunPosition(scene, camera.position.z);
        for (var i = 0; i < points.length; i+=3) { 
            let time = clock.getElapsedTime()*0.6;
            const x = points[i]/divide-time
            const y = points[i+1]/divide-time
            points[i+2] = noise.perlin2(x,y)*3;
        }    mesh.geometry.attributes.position.needsUpdate = true;

        //mixer?.update(0.02);

        requestAnimationFrame(animate);
        camera.position.z += velocity
        if (velocity < -0.05) { 
            velocity += 0.01;
        }

        if (camera.position.z < -950 || camera.position.z > 1) {
            if (camera.position.z > 1) { 
                velocity = 0;
            }
            camera.position.z = 0;
        }
        camera.updateMatrix();
        camera.updateProjectionMatrix();
        if (water) { water.material.uniforms.time.value -= 0.05; }
        if (waicorder){ waicorder.rotation.y += 0.02}
        composer.render()


    }
    function onWindowResize() {
        //setBackground(scene)
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }
    function onWheel(e: WheelEvent) {

        velocity += roundToNearestIncrement(Math.round(e.deltaY), 0.05) * 0.001;

    }
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onWheel, false);
    addMobileListeners()

    animate()
}
function roundToNearestIncrement(number: number, increment: number) {
    return Math.floor(number / increment) * increment;
}





function addMobileListeners() { 

    let startY: number | null = 0;
    
    window.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });
    window.addEventListener('touchmove', (e) => { 
        if (!startY) return
        const newY = e.touches[0].clientY;
        const diff = startY-newY;
        if (diff > 0) { 
            velocity -= diff*0.0001;
        } else { 
            velocity += diff*0.0001;
        }
        
    })
    window.addEventListener('touchend', () => startY = null)
}

let fragmentShader = `

		#include <common>

		varying vec2 vUv;

		uniform sampler2D tColor;
		uniform sampler2D tDepth;

		uniform float maxblur; // max blur amount
		uniform float aperture; // aperture - bigger values for shallower depth of field

		uniform float nearClip;
		uniform float farClip;

		uniform float focus;
		uniform float aspect;

		#include <packing>

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, nearClip, farClip );
			#else
			return orthographicDepthToViewZ( depth, nearClip, farClip );
			#endif
		}


		void main() {

			vec2 aspectcorrect = vec2( 1.0, aspect );

			float viewZ = getViewZ( getDepth( vUv ) );

			float factor = ( focus + viewZ ); // viewZ is <= 0, so this is a difference equation

			vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );

			vec2 dofblur9 = dofblur * 0.9;
			vec2 dofblur7 = dofblur * 0.7;
			vec2 dofblur4 = dofblur * 0.4;

			vec4 col = vec4( 0.0 );

			col += texture2D( tColor, vUv.xy );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );

			gl_FragColor = col / 41.0;
	

		}`