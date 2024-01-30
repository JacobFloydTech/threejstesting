import * as THREE from 'three'
import { FontLoader, TextGeometry, GLTFLoader } from 'three/examples/jsm/Addons.js';

import { borderShaderMaterial, gridMaterial } from './display';
export function addDisplayTextMobile(scene: THREE.Scene) {
    const text = `Our mission by heart is to ensure \neveryone has access to safe water \nin the world. About 20% of Kiwis are \nsupplied with contaiminated \ndrinking water and 1 billion \nglobally suffer from gastroenteritis \ncaused by dirty water. \n\n\nRapid sensing is the first step \nto avoid all that. Hence we are \ndeveloping revolutionary technology \nthat can scan waterborne \npathogens faster than \ncurrently possible.`
                
    const loader = new FontLoader();
    loader.load('/font.json', (font) => { 

            const geometry = new TextGeometry(text, { 
                font: font,
                height: 0.05,
                size: 0.8,
            })
            const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({transparent: true, color: 'black'}));
            mesh.position.set(-9, 47, 0);
            mesh.name = 'text';
            mesh.renderOrder = 10;
            mesh.material.blending = THREE.NormalBlending;
            console.log(mesh);
            scene.add(mesh);
    }) 
}

export function addWaicorderMobile(scene :THREE.Scene): Promise<THREE.AnimationMixer |  null> { 
    return new Promise((resolve) => { 
        const loader = new GLTFLoader();
        loader.load('/waicorderfinal.glb', (obj) => { 
            const mixer = new THREE.AnimationMixer(obj.scene);
            console.log(obj.scene.children);
            obj.animations.filter(e => ["Cuvette.013Action.001", "Rubber Lid.013Action.001","Armature.003Action.003", 'fake water.001Action.001'].includes(e.name)).forEach((e) => { 
                let action = mixer.clipAction(e);
                action.repetitions = 1;
                action.clampWhenFinished = true;
                action.play();
            })
            console.log(obj.scene);
            obj.scene.name = 'waicorder'
            obj.scene.scale.set(0,0,0); 
            obj.scene.position.set(-3, 10, 0)
            scene.add(obj.scene)
            resolve(mixer)
        })
    })
}

export function addDetailBehindWaicorderMobile(scene: THREE.Scene) { 
    const halfRing = new THREE.RingGeometry(5, 6, 32, 8,0, 2.5)
    const halfRingLower = new THREE.RingGeometry(5,6,32,8,3.14,2.5)
    const topRing = new THREE.Mesh(halfRing, borderShaderMaterial);
    const bottomRing = new THREE.Mesh(halfRingLower, borderShaderMaterial);
    const scale = 1.2;
    topRing.scale.set(scale, scale, scale);
    bottomRing.scale.set(scale,scale,scale)
    topRing.name = 'topRing'
    bottomRing.name = 'bottomRing'
    topRing.position.set(0, 19, 0)
    bottomRing.position.set(0, 19, 0);
    
    scene.add(topRing)
    scene.add(bottomRing)
}

function addTransparentBackgroundMobile(scene :THREE.Scene) {
    gridMaterial.uniforms.mobile.value = 1;
    const plane = new THREE.PlaneGeometry(20, 40,1,1);
    const mesh = new THREE.Mesh(plane, gridMaterial)
    mesh.position.set(0, 30, 0);
    mesh.name = 'planeBackground'
    mesh.renderOrder = 10;
    mesh.material.blending = THREE.NormalBlending;
    scene.add(mesh)
}



export function constructBorderMobile(scene: THREE.Scene) { 
    const radius = 0.2;

    const geometry = new THREE.CylinderGeometry(radius, radius, 20);
    const top = new THREE.Mesh(geometry, borderShaderMaterial);
    top.rotation.z = Math.PI/2;
    top.position.set(0,50,0)
    top.name = 'top'

    const bottom = new THREE.Mesh(geometry, borderShaderMaterial);
    bottom.rotation.z = Math.PI/2;
    bottom.position.set(0,10,0)
    bottom.name = 'bottom'

    const sideGeometry = new THREE.CylinderGeometry(radius, radius,40)
    const left = new THREE.Mesh(sideGeometry, borderShaderMaterial);
    left.position.set(-10, 30,0)
    left.name ='left'
    const right = new THREE.Mesh(sideGeometry, borderShaderMaterial);
    right.position.set(10, 30, 0)
    right.name = 'right'

    scene.add(right)
    scene.add(left)
    scene.add(bottom)
    scene.add(top)

    const instanceMesh = new THREE.InstancedMesh(geometry, borderShaderMaterial, 10);
    instanceMesh.position.set(0, 20,0)
    const dummy = new THREE.Object3D()
    for (var i =0 ; i < instanceMesh.count; i++) { 
        const matrix = new THREE.Matrix4();
        instanceMesh.getMatrixAt(i, matrix);
        dummy.applyMatrix4(matrix);
        dummy.position.y = 20-i*2;
        dummy.updateMatrix()
        instanceMesh.setMatrixAt(i, dummy.matrix)
    }
    instanceMesh.instanceMatrix.needsUpdate = true;
    instanceMesh.name = 'grain'
    return borderShaderMaterial;
}


export function loadDisplayMobile(scene: THREE.Scene) { 
    constructBorderMobile(scene)
    addDisplayTextMobile(scene)
    addDetailBehindWaicorderMobile(scene)
    addTransparentBackgroundMobile(scene)
}