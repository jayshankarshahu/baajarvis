// components/AudioMorphingMesh.js
import React, { useRef, useState, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAudioAnalyser from '../hooks/useAudioAnalyser'

export default function AudioMorphingMesh({ audioStream }) {
    const meshRef = useRef()
    const audioData = useAudioAnalyser(audioStream)

    // Threshold to determine if user is speaking
    const SPEAKING_THRESHOLD = 10

    // State if user is speaking
    const [isSpeaking, setIsSpeaking] = useState(false)

    // Create base geometries for sheet and sphere
    const sheetGeometry = useMemo(() => {
        return new THREE.PlaneGeometry(3, 3, 64, 64)
    }, [])

    const sphereGeometry = useMemo(() => {
        return new THREE.SphereGeometry(1.5, 64, 64)
    }, [])

    // Current geometry buffer attribute references for morphing
    // We'll morph vertex positions based on audio data
    const [currentPositions, setCurrentPositions] = useState()

    // Detect speaking based on average audio data
    useEffect(() => {
        if (!audioData) return
        const avg = audioData.reduce((a, b) => a + b, 0) / audioData.length
        setIsSpeaking(avg > SPEAKING_THRESHOLD)
    }, [audioData])

    useFrame(() => {

        if (!audioData || !meshRef.current) return

        const positionAttribute = meshRef.current.geometry.attributes.position
        const count = positionAttribute.count

        if (!currentPositions) {
            // Initialize current positions buffer to sheet vertices initially
            setCurrentPositions([...sheetGeometry.attributes.position.array])
            return
        }

        // Morph between sheet and sphere vertices based on speaking state and audio data
        for (let i = 0; i < count; i++) {
            // Sheet position for vertex i (x,y,z)
            const sheetIndex = i * 3
            const sx = sheetGeometry.attributes.position.array[sheetIndex]
            const sy = sheetGeometry.attributes.position.array[sheetIndex + 1]
            const sz = sheetGeometry.attributes.position.array[sheetIndex + 2]

            // Sphere position for vertex i (x,y,z)
            const spx = sphereGeometry.attributes.position.array[sheetIndex]
            const spy = sphereGeometry.attributes.position.array[sheetIndex + 1]
            const spz = sphereGeometry.attributes.position.array[sheetIndex + 2]

            // Audio factor 0-1 from audioData, loop audioData if shorter than vertex count
            const audioIndex = i % audioData.length
            const audioFactor = audioData[audioIndex] / 255

            // Morph amount between sheet (0) and sphere (1)
            const morphAmount = isSpeaking ? 1 : 0

            // Displacement along sphere normal scaled by audioFactor for bulging effect
            const normalVector = new THREE.Vector3(spx - sx, spy - sy, spz - sz).normalize()

            // Interpolate position: start at sheet vertex, then add morph towards sphere & bulge by audio
            const x = sx + morphAmount * (spx - sx) + normalVector.x * morphAmount * audioFactor * 0.5
            const y = sy + morphAmount * (spy - sy) + normalVector.y * morphAmount * audioFactor * 0.3
            const z = sz + morphAmount * (spz - sz) + normalVector.z * morphAmount * audioFactor * 0.3

            positionAttribute.array[sheetIndex] = x
            positionAttribute.array[sheetIndex + 1] = y
            positionAttribute.array[sheetIndex + 2] = z

        }

        setTimeout(() => {
            
            positionAttribute.needsUpdate = true;

        }, 500);

        meshRef.current.geometry.computeVertexNormals()
    })

    return (
        <mesh ref={meshRef} geometry={sheetGeometry} castShadow receiveShadow>
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 10, 7]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <sphereGeometry args={[1.5, 64, 64]} />
            <meshStandardMaterial color="white" roughness={0.5} metalness={0} />
        </mesh>
    )
}
