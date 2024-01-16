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
            mesh.position.set(4, 28, 0);
            mesh.name = 'text';
            console.log(mesh);
            scene.add(mesh);
    })
}



export function constructBorder(scene: THREE.Scene) { 
    const radius = 0.2;

    const geometry = new THREE.CylinderGeometry(radius, radius, 40);
    const top = new THREE.Mesh(geometry, borderShaderMaterial);
    top.rotation.z = Math.PI/2;
    top.position.set(5,30,0)
    top.name = 'top'

    const bottom = new THREE.Mesh(geometry, borderShaderMaterial);
    bottom.rotation.z = Math.PI/2;
    bottom.position.set(5,10,0)
    bottom.name = 'bottom'

    const sideGeometry = new THREE.CylinderGeometry(radius, radius,20)
    const left = new THREE.Mesh(sideGeometry, borderShaderMaterial);
    left.position.set(-15, 20,0)
    left.name ='left'
    const right = new THREE.Mesh(sideGeometry, borderShaderMaterial);
    right.position.set(25, 20, 0)
    right.name = 'right'

    scene.add(right)
    scene.add(left)
    scene.add(bottom)
    scene.add(top)
    return borderShaderMaterial;
}

export function addLines(scene: THREE.Scene) { 
    const radius = 0.1;

    const line = new THREE.CylinderGeometry(radius,radius, 10)
    const mesh = new THREE.Mesh(line, borderShaderMaterial);
    mesh.rotation.z = Math.PI/2;
    mesh.position.set(8, 16, 0)
    scene.add(mesh);
    mesh.name = 'pointLineMesh'

    const ring = new THREE.RingGeometry(1, 1.2, 20, 20);
    const ringMesh = new THREE.Mesh(ring, borderShaderMaterial);
    ringMesh.position.set(2, 16, 0)
    scene.add(ringMesh)

    ringMesh.name = 'ringMesh'

    const diagonalLine = new THREE.CylinderGeometry(radius, radius, 1.2);
    const diagonalLineMesh = new THREE.Mesh(diagonalLine, borderShaderMaterial);
    diagonalLineMesh.rotation.z = -Math.PI/5;
    diagonalLineMesh.position.set(13.6, 16.5, 0)
    diagonalLineMesh.name = 'diagonalLineMesh'
    scene.add(diagonalLineMesh)
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
            obj.scene.position.set(5, 10, 0)
            scene.add(obj.scene)
            resolve(mixer)
        })
    })
}

export function handleAnimation(currentZ: number, scene: THREE.Scene) {
    const start = -100;
    const end = -500;
    const startFade = -700;
    const endFade = -900; 
    ['waicorder', 'text', 'top', 'left', 'right', 'bottom', 'pointLineMesh', 'ringMesh', 'diagonalLineMesh'].map((e) => scene.getObjectByName(e) as THREE.Mesh).filter((x) => x).forEach((e) => {
        if (currentZ > start) { e.position.z = currentZ-50; return changeOpacity(e, 0)};
        if (currentZ < end && currentZ > startFade) { e.position.z = currentZ-20; return changeOpacity(e, 1)}
        if (currentZ > end) { 
            const per = (currentZ-start)/(end-start);
            const offset = (1-per)*50+20;
            e.position.z = currentZ-offset;
            changeOpacity(e, per)
        } else { 
            const per = (currentZ-startFade)/(endFade-startFade);
            const offset = per*50+20;
            e.position.z = currentZ-offset;
            changeOpacity(e, 1-per);
        }
    })

    const waicorder = scene.getObjectByName('waicorder') as THREE.Group;
    if (!waicorder) return
    if (currentZ > start) { return waicorder.scale.set(0,0,0)}
    if (currentZ < end && currentZ > startFade) { return waicorder.scale.set(50,50,50)}
    if (currentZ > end) { 
        const per = (currentZ-start)/(end-start);
        const scale = 50*per;
        waicorder.scale.set(scale, scale, scale)
    } else { 
        const per = (currentZ-startFade)/(endFade-startFade);
        const scale = 50*(1-per);
        waicorder.scale.set(scale,scale,scale)
    }

}

function changeOpacity(mesh: THREE.Mesh, opacity: number) { 
    let material: THREE.Material | THREE.Material[] = mesh.material;
    if (!Array.isArray(material)) { 
        material = [material]
    }
    material.filter((m ) => m).forEach(m => {
        m.opacity = opacity;
        if (m instanceof THREE.ShaderMaterial) { 
            (m as THREE.ShaderMaterial).uniforms.opacity.value = opacity;
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
    
})

