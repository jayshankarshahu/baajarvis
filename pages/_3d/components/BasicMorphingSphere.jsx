// components/BasicThreeScene.js
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three';

import { Suspense, useRef } from "react";
import { MeshWobbleMaterial } from '@react-three/drei';

export default function BasicMorphingSphere() {

  const meshRef = useRef();

  useFrame((state, delta, frame) => {
    meshRef.current.rotation.y += 0.01;
  })

  const baseColorTexture = useLoader(TextureLoader, '/textures/brickWall/Poliigon_BrickWallReclaimed_8320_BaseColor.jpg');
  const normalTexture = useLoader(TextureLoader, '/textures/brickWall/Poliigon_BrickWallReclaimed_8320_Normal.png');
  const roughnessTexture = useLoader(TextureLoader, '/textures/brickWall/Poliigon_BrickWallReclaimed_8320_Roughness.jpg');
  const metallicTexture = useLoader(TextureLoader, '/textures/brickWall/Poliigon_BrickWallReclaimed_8320_Metallic.jpg');
  // const displacementTexture = useLoader(TextureLoader, '/textures/brickWall/Poliigon_BrickWallReclaimed_8320_Displacement.tiff');

  return (
    <>
      <directionalLight intensity={3} position={[1, 1, 0.2]} />

      <mesh ref={meshRef}>

        <ambientLight intensity={1} />
        <sphereGeometry args={[2]} />
        <meshStandardMaterial
          map={baseColorTexture}
          normalMap={normalTexture}
          roughnessMap={roughnessTexture}
          metalnessMap={metallicTexture}
        // displacementMap={displacementTexture}
        />
      </mesh >
    </>

  )
}