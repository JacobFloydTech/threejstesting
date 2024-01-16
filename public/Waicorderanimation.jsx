/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 waicorderanimation.glb 
*/

import React, { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/waicorderanimation.glb')
  const { actions } = useAnimations(animations, group)
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="NurbsPath" position={[-0.678, -0.251, 0.017]} />
        <group name="Empty" position={[-0.511, 0.237, 0.026]} />
        <group name="Armature003" position={[-0.134, 0.105, 0.017]} scale={0.017}>
          <group name="Bone" rotation={[0, 1.571, 0]} />
          <group name="Bone001" position={[-1.24, -2.967, 0]} rotation={[-Math.PI, 1.571, 0]}>
            <group name="flap" position={[0, 1, 0]} rotation={[0.359, 0, Math.PI]}>
              <mesh name="Flap009" geometry={nodes.Flap009.geometry} material={materials.Metal} position={[0, 3.766, 0.263]} rotation={[-0.197, -1.57, 0.681]} scale={58.807} />
              <group name="Screen012" position={[-0.074, 0.079, 0.882]} rotation={[1.339, -Math.PI / 2, 0]} scale={58.807}>
                <mesh name="Cube030" geometry={nodes.Cube030.geometry} material={materials['Glass.001']} />
                <mesh name="Cube030_1" geometry={nodes.Cube030_1.geometry} material={materials.Screen} />
              </group>
            </group>
            <group name="Bone003" position={[0, 1, 0]} rotation={[1.463, 0, 0]}>
              <group name="Bone004" position={[0, 0.316, 0]} rotation={[-2.727, 0, 0]}>
                <mesh name="Hinge009" geometry={nodes.Hinge009.geometry} material={materials.Metal} position={[0.074, 0.314, -0.01]} rotation={[-0.252, 1.57, 0]} scale={58.807} />
              </group>
            </group>
            <group name="Base009" position={[0.074, -3.544, -0.615]} rotation={[-Math.PI, 1.571, 0]} scale={58.807}>
              <mesh name="Cube012" geometry={nodes.Cube012.geometry} material={materials.Metal} />
              <mesh name="Cube012_1" geometry={nodes.Cube012_1.geometry} material={materials.led3} />
              <mesh name="Cube012_2" geometry={nodes.Cube012_2.geometry} material={materials.led2} />
              <mesh name="Cube012_3" geometry={nodes.Cube012_3.geometry} material={materials.led1} />
              <mesh name="Cube012_4" geometry={nodes.Cube012_4.geometry} material={materials.led1} />
              <mesh name="Cuvette009" geometry={nodes.Cuvette009.geometry} material={materials['Glass.002']} rotation={[-2.225, 0.577, 2.087]} scale={0.992}>
                <mesh name="fake_water" geometry={nodes.fake_water.geometry} material={materials['Glass.002']} rotation={[0.227, -0.103, 0.034]} />
                <mesh name="Plane001" geometry={nodes.Plane001.geometry} material={materials['Glass.001']} position={[0.018, 0.311, -0.043]} rotation={[3.014, -1.217, 2.499]} scale={1.008} />
              </mesh>
              <mesh name="Heatsink009" geometry={nodes.Heatsink009.geometry} material={materials.Heatsink} rotation={[0.033, 0.081, 1.61]} />
              <mesh name="Rubber_Lid009" geometry={nodes.Rubber_Lid009.geometry} material={materials['rubber.002']} rotation={[-2.225, 0.577, 2.087]} />
              <group name="Screen011" position={[-0.001, -0.075, -0.002]} rotation={[0.033, 0.081, 1.612]}>
                <mesh name="Cube029" geometry={nodes.Cube029.geometry} material={materials['Glass.001']} />
                <mesh name="Cube029_1" geometry={nodes.Cube029_1.geometry} material={materials.Screen} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/waicorderanimation.glb')