"use client"
import { DustDetail, LoadTree, addLights, addMiddleGround, addStars, addWater, animateMountains, changeSunPosition, getMiddleGround, loadCloud, loadMountainGLB , scaleInThings, } from './functions';
import { MutableRefObject, useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { BokehPass, EffectComposer, OutputPass, RenderPass, ShaderPass, Water } from 'three/examples/jsm/Addons.js';
import { addDetailBehindWaicorder, addWaicorder,  animateRings,  changeTImeValue, depthShader, handleAnimation, loadHDR } from './display';
import Loading from './loading';
import { addWaicorderMobile } from './displayMobile';


export default function Page() {
    const ref = useRef<any>(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => { setScene(ref, setLoading) }, [])
    return (
        <>
            <div className={"w-full h-screen bg-black" + (loading ? " hidden" : ' fixed')} ref={ref} />
            {loading && <Loading/>}
        </>

    )
}




async function setScene(ref: MutableRefObject<any>, setLoading: Function) {
    if (!ref.current) { return }
    let velocity = -0.05;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = false;
    ref.current.appendChild(renderer.domElement);
    await Promise.all([
        loadMountainGLB(scene),
        addMiddleGround(scene),
        //loadHDR(scene, renderer)
    ])
    getMiddleGround(scene)
    setLoading(false)
    addStars(scene)
    addWater(scene)
   
    loadCloud(scene)
 
    scene.fog = new THREE.FogExp2( 0x000000, 0.008 );
    const water = scene.getObjectByName('waterMesh') as Water;

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
        aperture: 0.0002,
        maxblur: 0.004,
    })
    const outputPass = new OutputPass();
    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bokehPass)
    const postProccessing = { 
        composer,
        bokeh: bokehPass
    }

    composer.addPass(outputPass)

    function animate() {
        const scaleValue = 0.7+0.5* Math.abs(Math.sin(Date.now() * 0.0005));
        animateRings(scene, scaleValue)
        animateMountains(scene, camera.position.z);
        changeTImeValue(scene, clock.getDelta());
        scaleInThings(scene, camera.position.z);
        handleAnimation(camera.position.z, scene);
        changeSunPosition(scene, camera.position.z);
        mixer?.update(clock.getDelta());
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
        if (water) { water.material.uniforms.time.value += 0.01; console.log(water.material);}
        if (waicorder) { waicorder.rotation.y += 0.02}
        postProccessing.composer.render(0.1);


    }
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }
    function onWheel(e: WheelEvent) {

        velocity += roundToNearestIncrement(Math.round(e.deltaY), 0.05) * 0.001;

    }
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onWheel, false);

    animate()
}
function roundToNearestIncrement(number: number, increment: number) {
    return Math.floor(number / increment) * increment;
}

