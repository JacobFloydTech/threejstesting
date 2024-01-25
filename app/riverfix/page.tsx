"use client"
import { DustDetail, LoadTree, addCloud, addLights, addMiddleGround, addWater, changeSunPosition, getMiddleGround, loadMountainGLB , scaleInThings, } from './functions';
import { MutableRefObject, useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { BokehPass, EffectComposer, OutputPass, RenderPass, ShaderPass, Water } from 'three/examples/jsm/Addons.js';
import {   animateRings,  changeTImeValue, handleAnimation, loadHDR, loadDisplay, addWaicorder} from './display';
import Loading from './loading';
//@ts-ignore
import {Noise} from 'noisejs'
import { addWaicorderMobile } from './displayMobile';


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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 400);
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

    addWater(scene)
    DustDetail(scene, true)
    DustDetail(scene, false)
    addCloud(scene)
    scene.fog = new THREE.FogExp2( 0xd28032, 0.006 );
    const water = scene.getObjectByName('waterMesh') as Water;
    scene.background = null
    camera.position.set(0, 30, 100);
    camera.lookAt(0, 30, 50);
    addLights(scene)
    
    LoadTree(scene)
    let mixer = await (window.outerWidth >= 1366 ? addWaicorder(scene) :addWaicorderMobile(scene) )

    const waicorder = scene.getObjectByName('Armature003') as THREE.Object3D;
    const clock = new THREE.Clock();
    //Post processing init
    const renderPass = new RenderPass(scene, camera);
    const bokehPass = new BokehPass(scene, camera, { 
        focus: 12,
        aperture: 0.00001,
        maxblur: 0.001, 
    })
    var width = window.innerWidth || 1;
    var height = window.innerHeight || 1;
    var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };

    var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
    renderPass.clearAlpha = 0;
    renderPass.clearColor = new THREE.Color( 0, 0, 0 );
    const outputPass = new OutputPass();
    const composer = new EffectComposer(renderer, renderTarget);
    composer.addPass(renderPass);
    composer.addPass(bokehPass);
    

    const postProccessing = { 
        composer,
        bokeh: bokehPass
    }
    const mesh = scene.getObjectByName('waterMesh') as THREE.InstancedMesh;
    const points = mesh.geometry.attributes.position.array;
    const divide=  10;
    const noise = new Noise()
        composer.addPass(outputPass)

    function animate() {
        const scaleValue = 0.7+0.5* Math.abs(Math.sin(Date.now() * 0.0005));
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

        mixer?.update(0.02);

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
        renderer.render(scene, camera)


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