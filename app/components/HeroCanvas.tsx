'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    THREE: any
  }
}

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    function initThree() {
      const THREE = window.THREE
      if (!THREE || !container) return

      const width = container.clientWidth
      const height = container.clientHeight

      // Scene
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
      camera.position.z = 5

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      container.appendChild(renderer.domElement)

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
      scene.add(ambientLight)

      const pointLight1 = new THREE.PointLight(0xd4a843, 3, 20)
      pointLight1.position.set(3, 3, 3)
      scene.add(pointLight1)

      const pointLight2 = new THREE.PointLight(0xf0c060, 2, 20)
      pointLight2.position.set(-3, -2, 2)
      scene.add(pointLight2)

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
      rimLight.position.set(0, 5, -5)
      scene.add(rimLight)

      // Octahedron crystal
      const octGeo = new THREE.OctahedronGeometry(1.2, 0)
      const octMat = new THREE.MeshStandardMaterial({
        color: 0xd4a843,
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1,
      })
      const octahedron = new THREE.Mesh(octGeo, octMat)
      scene.add(octahedron)

      // Orbiting rings
      const rings: any[] = []
      const ringData = [
        { radius: 1.9, tube: 0.015, rotation: { x: Math.PI / 2, y: 0, z: 0 } },
        { radius: 2.3, tube: 0.01, rotation: { x: Math.PI / 4, y: Math.PI / 4, z: 0 } },
        { radius: 2.7, tube: 0.008, rotation: { x: -Math.PI / 6, y: Math.PI / 3, z: Math.PI / 6 } },
      ]

      ringData.forEach((rd) => {
        const ringGeo = new THREE.TorusGeometry(rd.radius, rd.tube, 8, 80)
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xd4a843,
          transparent: true,
          opacity: 0.6,
        })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = rd.rotation.x
        ring.rotation.y = rd.rotation.y
        ring.rotation.z = rd.rotation.z
        scene.add(ring)
        rings.push(ring)
      })

      // Particle field
      const particleCount = 300
      const positions = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 14
        positions[i * 3 + 1] = (Math.random() - 0.5) * 14
        positions[i * 3 + 2] = (Math.random() - 0.5) * 14
      }
      const partGeo = new THREE.BufferGeometry()
      partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const partMat = new THREE.PointsMaterial({
        color: 0xd4a843,
        size: 0.025,
        transparent: true,
        opacity: 0.6,
      })
      const particles = new THREE.Points(partGeo, partMat)
      scene.add(particles)

      // Mouse parallax
      let mouseX = 0
      let mouseY = 0
      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener('mousemove', handleMouseMove)

      // Resize
      const handleResize = () => {
        if (!container) return
        const w = container.clientWidth
        const h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', handleResize)

      // Animation
      let frameId: number
      const clock = new THREE.Clock()

      const animate = () => {
        frameId = requestAnimationFrame(animate)
        const elapsed = clock.getElapsedTime()

        octahedron.rotation.x = elapsed * 0.3
        octahedron.rotation.y = elapsed * 0.4

        rings.forEach((ring, i) => {
          ring.rotation.z = elapsed * (0.15 + i * 0.05)
          ring.rotation.x += Math.sin(elapsed * 0.2 + i) * 0.001
        })

        particles.rotation.y = elapsed * 0.02
        particles.rotation.x = elapsed * 0.01

        // Parallax
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05
        camera.lookAt(scene.position)

        // Pulse point light
        pointLight1.intensity = 3 + Math.sin(elapsed * 2) * 0.5

        renderer.render(scene, camera)
      }
      animate()

      cleanupRef.current = () => {
        cancelAnimationFrame(frameId)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('resize', handleResize)
        if (container && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
    }

    // Load Three.js from CDN
    if (window.THREE) {
      initThree()
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      script.onload = initThree
      document.head.appendChild(script)
    }

    return () => {
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    />
  )
}
