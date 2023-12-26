'use client'
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { RenderPass, ShaderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { OutputPass } from 'three/examples/jsm/Addons.js';
type RGB = { 
    r: number;
    g: number;
    b: number;
}

const originalPositions: THREE.Vector3[] = [];


export function Scene() { 
    const container = useRef<any>();
    useEffect(() => {
        setScene();
     },[])

    function setScene() { 
        if (!container.current) { return }
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
        var renderer = new THREE.WebGLRenderer();
        renderer.toneMapping = THREE.CineonToneMapping;
        renderer.toneMappingExposure = 1.5;
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.current.appendChild(renderer.domElement);
        const boxes = addBoxes();
        scene.add(boxes)


        const light = new THREE.AmbientLight( 0x404040 , 3.0);
        scene.add(light)
        const controls = new OrbitControls(camera, renderer.domElement);
        camera.position.set(0,0,30)
        camera.lookAt(new THREE.Vector3(20, 20, -20))

        controls.update()

    
        const raycaster = new THREE.Raycaster();
        const mousePosition = new THREE.Vector2();
        

        window.addEventListener('pointermove', ({clientX, clientY}) => { 
            mousePosition.x = ( clientX / window.innerWidth ) * 2 - 1;
            mousePosition.y = - ( clientY / window.innerHeight ) * 2 + 1;
           
        }, false)
        const animationDuration = 10;
        const clock = new THREE.Clock();
        let start: number | undefined; 
        let goBack: number | undefined;
        let newPositions: THREE.Vector3[] = [];

        const animate = () => {
          const currentTime = clock.getElapsedTime();

          requestAnimationFrame(animate);
          controls.update();

          raycaster.setFromCamera(mousePosition, camera);
          const intersects = raycaster.intersectObjects(scene.children);
          if (intersects[0]?.instanceId) {
            if (!newPositions || !start) { 
                const matrix = new THREE.Matrix4();
                boxes.getMatrixAt(intersects[0].instanceId, matrix);
                const position = new THREE.Vector3().setFromMatrixPosition(matrix);
                newPositions = getPositions(position);
                start = currentTime;
            }
            const timeDiff = currentTime-start;
            if (timeDiff < animationDuration) { 
                for (var i =0; i < 1000; i++) { 
                    const matrix = new THREE.Matrix4();
                    boxes.getMatrixAt(i, matrix);
                    const oldPosition = new THREE.Vector3().setFromMatrixPosition(matrix);
                    const newPosition = newPositions[i];
    
              
                    const interpolatedPosition = new THREE.Vector3().lerpVectors(
                        oldPosition,
                        newPosition,
                        timeDiff/animationDuration
                    )
                    matrix.setPosition(interpolatedPosition);
                    boxes.setMatrixAt(i, matrix);
                }
                boxes.instanceMatrix.needsUpdate = true;
            } else { 
                start = undefined;
                newPositions = [];
            }
   
          } else { 

                if (intersects[0]) { return}
                if (!goBack) { goBack = currentTime}
                const timeDiff = currentTime-goBack;
                for (var i =0; i < 1000; i++) { 
                    const matrix = new THREE.Matrix4();
                    boxes.getMatrixAt(i, matrix);
                    const currentPosition = new THREE.Vector3().setFromMatrixPosition(matrix);
                    const originalPosition = originalPositions[i];
              
                    const interpolatedPosition = new THREE.Vector3().lerpVectors(
                        currentPosition,
                        originalPosition,
                        timeDiff/animationDuration
                    )
                    matrix.setPosition(interpolatedPosition);
                    boxes.setMatrixAt(i, matrix);
                }
                boxes.instanceMatrix.needsUpdate = true;
   

          }

          

          renderer.render(scene, camera);
        };
        
        animate();
    }

  



    



    function setMaterial(camera: THREE.PerspectiveCamera, group: THREE.Group) { 
        const position = camera.position as THREE.Vector3;
   
        const rOffset = 244;
        const gOffset = 41;
        let distanceBetweenAllCubes = group.children.map((e) => { 
            const elementPosition = e.position as THREE.Vector3;
            return CalculateDistance(position, elementPosition);
        })
        const diff = Math.max(...distanceBetweenAllCubes)-Math.min(...distanceBetweenAllCubes);
        
        distanceBetweenAllCubes = distanceBetweenAllCubes.map((e) => {return e/diff});

        group.children.forEach((e,i) => { 
            let percent = distanceBetweenAllCubes[i]/6;
            let red = 11+rOffset*percent;
            let green = 52-gOffset*percent;
        

            (e as THREE.Mesh).material = new THREE.MeshBasicMaterial({color: rgbToHex(red, green, 255) });
           
        
        })
    }
    const rgbToHex = (r: number, g: number, b: number) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      }



    return (  
        <div ref={container}></div>
    )
}



function addBoxes() { 
    const boxGeometry = new THREE.BoxGeometry(0.5,0.5,0.5);
    const boxMesh = new THREE.InstancedMesh(boxGeometry, new THREE.MeshBasicMaterial({color: getRandomHexCode()}), 1000);
    let count = 0;
    const dummy = new THREE.Object3D();

    for (var x = 0; x < 10; x++) { 
        for (var y = 0; y < 10; y++) { 
            for (var z =0; z < 10; z++) { 
                dummy.position.set(x,y,z);
                originalPositions.push(new THREE.Vector3(x,y,z));
                dummy.updateMatrix();
                boxMesh.setMatrixAt(count, dummy.matrix);
                count++;
            }
        }
    }
    boxMesh.instanceMatrix.needsUpdate = true;
    return boxMesh;
}


function getPositions(oldPosition:  THREE.Vector3) { 
    const newPositions: THREE.Vector3[] = [];
    const offset = 20;
    for( var i = 0 ; i < 1000; i++) { 
        const position = originalPositions[i]
        const distancePercentage = CalculateDistance(oldPosition, position)/offset;
        const xDiff = position.x-oldPosition.x;
        const yDiff = position.y-oldPosition.y;
        const zDiff = position.z-oldPosition.z;
        const azimuthAngle = Math.atan2(yDiff, xDiff);
        const r = Math.sqrt(xDiff**2+yDiff**2+zDiff**2);

        const inclinationAngle = Math.acos(zDiff/r);
        let {x,y,z} = getNewPosition((1-distancePercentage)* offset, inclinationAngle, azimuthAngle, position);
        console.log(x,y,z);
        newPositions.push(new THREE.Vector3(x,y,z));
    }
    return newPositions;
}



function getRandomHexCode() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  }

  

  function getNewPosition(distance: number, inclinationAngle: number, azimuthAngle: number, position: THREE.Vector3) { 
    const x = position.x + distance * Math.sin(inclinationAngle) * Math.cos(azimuthAngle);
    const y = position.y +  distance * Math.sin(inclinationAngle) * Math.sin(azimuthAngle);
    const z = position.z + distance * Math.cos(inclinationAngle) 
    return { x, y ,z}
}



function CalculateDistance(a: THREE.Vector3, b: THREE.Vector3): number { 
    let x = (b.x-a.x)**2;
    let y = (b.y-a.y)**2;
    let z = (b.z-a.z)**2;
    return Math.sqrt(x+y+z);
}
