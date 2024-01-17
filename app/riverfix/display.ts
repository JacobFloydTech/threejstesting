import * as THREE from 'three'
import { FontLoader, GLTFLoader, TextGeometry} from 'three/examples/jsm/Addons.js';

export function addDisplayText(scene :THREE.Scene) { 
    const text = `Our mission by heart is to ensure everyone has \naccess to safe water in the world. About 20% of Kiwis \nare supplied with contaiminated drinking water and \n1 billion globally suffer from gastroenteritis \ncaused by dirty water. \n\n\nRapid sensing is the first step to avoid all that. \nHence we are developing revolutionary \ntechnology that can scan waterborne pathogens \nfaster than currently possible. \n\n\nResearch is a vorage beyond the known frontiers; \nwe explore strange new fields and boldy \ndo what no one has done before.`
                
    const loader = new FontLoader();
    loader.load('/font.json', (font) => { 

            const geometry = new TextGeometry(text, { 
                font: font,
                height: 0.1,
                size: 0.62
            })
            const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({transparent: true}));
            mesh.position.set(-1, 28, 0);
            mesh.name = 'text';
            mesh.renderOrder = 10;
            mesh.material.blending = THREE.NormalBlending;
            console.log(mesh);
            scene.add(mesh);
    })
}



export function constructBorder(scene: THREE.Scene) { 
    const radius = 0.2;

    const geometry = new THREE.CylinderGeometry(radius, radius, 40);
    const top = new THREE.Mesh(geometry, borderShaderMaterial);
    top.rotation.z = Math.PI/2;
    top.position.set(0,30,0)
    top.name = 'top'

    const bottom = new THREE.Mesh(geometry, borderShaderMaterial);
    bottom.rotation.z = Math.PI/2;
    bottom.position.set(0,10,0)
    bottom.name = 'bottom'

    const sideGeometry = new THREE.CylinderGeometry(radius, radius,20)
    const left = new THREE.Mesh(sideGeometry, borderShaderMaterial);
    left.position.set(-20, 20,0)
    left.name ='left'
    const right = new THREE.Mesh(sideGeometry, borderShaderMaterial);
    right.position.set(20, 20, 0)
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

export function addLines(scene: THREE.Scene) { 
    const radius = 0.1;

    const line = new THREE.CylinderGeometry(radius,radius, 10)
    const mesh = new THREE.Mesh(line, borderShaderMaterial);
    mesh.rotation.z = Math.PI/2;
    mesh.position.set(4, 16, 0)
    mesh.name = 'pointLineMesh'
    mesh.renderOrder = 10;
    mesh.material.blending = THREE.NormalBlending;
    
    const ring = new THREE.RingGeometry(1, 1.2, 20, 20);
    const ringMesh = new THREE.Mesh(ring, borderShaderMaterial);
    ringMesh.position.set(-2, 16, 0)
    ringMesh.name = 'ringMesh'
    ringMesh.renderOrder = 10;
    mesh.material.blending = THREE.NormalBlending;
    
    const diagonalLine = new THREE.CylinderGeometry(radius, radius, 1.2);
    const diagonalLineMesh = new THREE.Mesh(diagonalLine, borderShaderMaterial);
    diagonalLineMesh.rotation.z = -Math.PI/5;
    diagonalLineMesh.position.set(9.6, 16.5, 0)
    diagonalLineMesh.name = 'diagonalLineMesh'
    diagonalLineMesh.renderOrder = 10;
    mesh.material.blending = THREE.NormalBlending;

    scene.add(ringMesh)
    scene.add(mesh);
    scene.add(diagonalLineMesh)
}

export function addNewGrass(scene: THREE.Scene, offset: number) { 
    const plane = scene.getObjectByName('middle') as THREE.InstancedMesh;
    const loader = new GLTFLoader()
    if (!plane) {return}
    const points = plane.geometry.attributes.position.array.map(e => e*100)
    const count = 50;
    let index =0; 
    loader.load('newGrass.glb', (obj) => { 
        const child = obj.scene.children.pop() as THREE.Mesh;
        const mesh = new THREE.InstancedMesh(child.geometry, child.material, count);
        mesh.rotation.y = Math.PI/2;
        const dummy = new THREE.Object3D()
        while (index <= count) { 
                for (var i = 0;  i < points.length; i+=3) { 
                    if (Math.random() > 0.9) { 
                        dummy.position.set(points[i]+offset, points[i+1], points[i+2]);
                        dummy.scale.set(50,50,50)
                        dummy.rotation.x = Math.PI/2;
                        dummy.updateMatrix();
                        mesh.setMatrixAt(index, dummy.matrix)
                        index++;
                }
            }

        }
   
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh)
    })
}

export function addWaicorder(scene :THREE.Scene): Promise<THREE.AnimationMixer |  null> { 
    var mixer: THREE.AnimationMixer | null =null;
    return new Promise((resolve) => { 
        const loader = new GLTFLoader();
        loader.load('/waicorderanimation.glb', (obj) => { 
            mixer = new THREE.AnimationMixer(obj.scene);
            var action = mixer.clipAction(obj.animations.pop()!);
            obj.scene.name = 'waicorder'
            action.play();
            action.clampWhenFinished = true;
            action.repetitions = 1;
            obj.scene.scale.set(0,0,0); 
            obj.scene.position.set(-3, 10, 0)
             scene.add(obj.scene)
            resolve(mixer)
        })
    })
}


export function addTransparentBackground(scene: THREE.Scene) { 
    const plane = new THREE.PlaneGeometry(40, 20,1,1);
    const mesh = new THREE.Mesh(plane, gridMaterial)
    mesh.position.set(0, 20, 0);
    mesh.name = 'planeBackground'
    mesh.renderOrder = 10;
    mesh.material.blending = THREE.NormalBlending;
    scene.add(mesh)
}

export function changeTImeValue(scene: THREE.Scene, offset:number) { 
    const plane = scene.getObjectByName('planeBackground') as THREE.Mesh
    if (!plane) return
    let material: THREE.Material  | THREE.Material[] = plane.material
    if (!Array.isArray(material)) { 
        material = [material];
    }
    material.forEach((m) => { 
        if (m instanceof THREE.ShaderMaterial) { 
            (m as THREE.ShaderMaterial).uniforms.time.value -= offset;
        }
    })
}

export function handleAnimation(currentZ: number, scene: THREE.Scene) {
    const start = 0;
    const end = -100;
    const startFade = -300;
    const endFade = -500; 
    ['planeBackground','waicorder', 'text', 'top', 'left', 'right', 'bottom', 'pointLineMesh', 'ringMesh', 'diagonalLineMesh']
        .map((e) => scene.getObjectByName(e) as THREE.Mesh)
        .filter((x) => x)
        .forEach((e) => {
            if (currentZ > start) { e.position.z = currentZ-50; return changeOpacity(e, 0)};
            if (currentZ < end && currentZ > startFade) { e.position.z = currentZ-25; return changeOpacity(e, 1)}
            if (currentZ > end) { 
                const per = (currentZ-start)/(end-start);
                const offset = (1-per)*50+25;
                e.position.z = currentZ-offset;
                changeOpacity(e, per)
            } else { 
                const per = (currentZ-startFade)/(endFade-startFade);
                const offset = per*50+25;
                e.position.z = currentZ-offset;
                changeOpacity(e, 1-per);
            }
    })

    handleWaicorder();
    handleGrainMesh(scene, currentZ);
    handlePlane(scene);
    function handleWaicorder() { 
        const baseScale = 45;
        const waicorder = scene.getObjectByName('waicorder') as THREE.Group;
        if (!waicorder) return
        waicorder.position.z += 2;
        if (currentZ > start) { return waicorder.scale.set(0,0,0)}
        if (currentZ < end && currentZ > startFade) { return waicorder.scale.set(baseScale,baseScale,baseScale)}
        if (currentZ > end) { 
            const per = (currentZ-start)/(end-start);
            const scale = baseScale*per;
            waicorder.scale.set(scale, scale, scale)
        } else { 
            const per = (currentZ-startFade)/(endFade-startFade);
            const scale = baseScale*(1-per);
            waicorder.scale.set(scale,scale,scale)
        }
    }
}

function handleGrainMesh(scene: THREE.Scene, position: number) { 
    const mesh = scene.getObjectByName('grain') as THREE.InstancedMesh;
    const background = scene.getObjectByName('planeBackground') as THREE.Mesh;
    if (!mesh || !background) return
    const dummy = new THREE.Object3D();
    for (var i =0 ; i < mesh.count;i++) { 
        const matrix = new THREE.Matrix4();
        mesh.setMatrixAt(i, matrix);
        dummy.applyMatrix4(matrix);
        dummy.position.z = position-20
        dummy.position.y = 20-i*20/10;
        dummy.rotation.z = Math.PI/2;
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    console.log(position-20);
    mesh.instanceMatrix.needsUpdate = true;
}
export function addGrainToBackground(scene: THREE.Scene) { 
    const geometry = new THREE.CylinderGeometry(0.2, 0.2,40);
    const material = new THREE.MeshStandardMaterial({color: "blue"});
    const baseY = 20;
    const mesh  =new THREE.InstancedMesh(geometry, material, 10);
    mesh.position.set(0,baseY,0)
    const distanceJump = 20/mesh.count;
    mesh.name = 'grain'
    const dummy = new THREE.Object3D()
    for (var i = 0; i < mesh.count; i++) { 
        const matrix = new THREE.Matrix4()
        mesh.getMatrixAt(i, matrix);
        dummy.applyMatrix4(matrix);
        dummy.position.y = baseY-i*distanceJump;
        dummy.rotation.z = Math.PI/2;
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh)

}

function handlePlane(scene: THREE.Scene) { 
    const plane = scene.getObjectByName('planeBackground') as THREE.Mesh;
    if (!plane) { return}
    plane.position.z -= 0.4;
    let material: THREE.Material | THREE.Material[] = plane.material;
    if (!Array.isArray(material)) { 
        material = [material]
    }
    material.forEach((m) => { 
        m.opacity = m.opacity*0.8;
        if (m instanceof THREE.ShaderMaterial) { 
            try { 
                (m as THREE.ShaderMaterial).uniforms.opacity.value *= 0.5;
            } catch (e) {}

        }
    })
    
}

function changeOpacity(mesh: THREE.Mesh, opacity: number,) { 
    let material: THREE.Material | THREE.Material[] = mesh.material;
    if (!Array.isArray(material)) { 
        material = [material]
    }
    material.filter((m ) => m).forEach(m => {
        m.opacity = opacity;
        if (m instanceof THREE.ShaderMaterial) { 
            try { 
                (m as THREE.ShaderMaterial).uniforms.opacity.value = opacity;
            } catch (e) {}

        }
    });
}







const vertexShader = `
// Basic Vertex Shader for Three.js



// Varying variables to pass data from the vertex shader to the fragment shader
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    // Transform the vertex position from model space to camera space
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

    // Transform the normal from model space to camera space and normalize it
    vNormal = normalize(normalMatrix * normal);

    // Pass the texture coordinates to the fragment shader
    vUv = uv;

    // Set the output vertex position in clip space
    gl_Position = projectionMatrix * modelViewPosition;
}
`

const fragmentShader = `
    precision highp float;
    uniform float opacity;
    void main() { 
        gl_FragColor = vec4(0.,1.0,1.0, opacity);
    }
`
const borderShaderMaterial = new THREE.ShaderMaterial({
    uniforms: { 
        opacity: { value: 0}
    },
    fragmentShader: fragmentShader,
    vertexShader: vertexShader,
    transparent: true,
    opacity: 0,
    
})



const gridFragment = `
precision highp float;
varying vec2 vUv;
uniform float opacity;
uniform float time;
void main()
{

    // Adjust the spacing between lines
    float lineSpacing = 0.01;

    // Calculate the index of the line
    float lineIndex = floor((vUv.y+time*0.1) / lineSpacing);

    // Use modulo to create repeating pattern
    float modResult = mod(lineIndex, 2.0);

    // Set color based on the repeating pattern
    if (modResult < 1.0) {
        gl_FragColor = vec4(0.,1.,1., opacity); // Color for lines
    } else {
        gl_FragColor = vec4(0.,.7,.7,opacity); // Color for gaps
    }
}
`;

const gridMaterial = new THREE.ShaderMaterial({
    uniforms: {
        opacity: { value :0},
        time: {value: 0}
    },
    vertexShader: vertexShader,
    fragmentShader: gridFragment,
    transparent: true,
    opacity: 0,
});


export function loadDisplay(scene: THREE.Scene) { 
    constructBorder(scene);
    addLines(scene)
    addTransparentBackground(scene)
    addDisplayText(scene)
}