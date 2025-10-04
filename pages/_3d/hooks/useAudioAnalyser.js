import { useEffect, useState, useRef } from 'react'

export default function useAudioAnalyser(audioStream) {
  const [audioData, setAudioData] = useState(null)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const animationFrameIdRef = useRef(null)

  useEffect(() => {    

    if (!audioStream) return

    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioContext.createMediaStreamSource(audioStream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    source.connect(analyser)
    analyserRef.current = analyser
    dataArrayRef.current = dataArray

    const update = () => {
      analyser.getByteFrequencyData(dataArray)
      setAudioData([...dataArray]) // Copy array to trigger React update
      animationFrameIdRef.current = requestAnimationFrame(update)
    }
    update()

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current)
      analyser.disconnect()
      source.disconnect()
      audioContext.close()
    }
  }, [audioStream])

  return audioData
}
