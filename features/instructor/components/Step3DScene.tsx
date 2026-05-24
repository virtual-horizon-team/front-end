"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Step3DSceneProps {
  step: number;
}

export default function Step3DScene({ step }: Step3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Store references to objects so we can transition them on step change
  const currentGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 350;

    // 1. Create Scene
    const scene = new THREE.Scene();
    // Dark transparent background to blend in with our premium design
    scene.background = null;

    // 2. Create Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    // 3. Create WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Cyberpunk themed lights (Blue and Pink)
    const blueLight = new THREE.DirectionalLight(0x00f2fe, 1.5);
    blueLight.position.set(-5, 5, 5);
    scene.add(blueLight);

    const pinkLight = new THREE.DirectionalLight(0x4facfe, 1.5);
    pinkLight.position.set(5, -5, 5);
    scene.add(pinkLight);

    const pointLight = new THREE.PointLight(0xff0844, 2, 10);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // 5. Particle System (Background dust)
    const particleCount = 60;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    // Round particles texture
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      map: particleTexture,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 6. Step-specific 3D objects group
    const stepGroup = new THREE.Group();
    scene.add(stepGroup);
    currentGroupRef.current = stepGroup;

    // Build the step mesh
    if (step === 1) {
      // Identity Avatar Wireframe
      const headGeo = new THREE.SphereGeometry(1, 16, 16);
      const headMat = new THREE.MeshPhongMaterial({
        color: 0x00f2fe,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      stepGroup.add(headMesh);

      // Cyber scanning ring
      const ringGeo = new THREE.RingGeometry(1.4, 1.45, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff0844,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.name = "scanRing";
      stepGroup.add(ringMesh);

      // Torso mesh outline
      const torsoGeo = new THREE.ConeGeometry(1.2, 2, 16, 2, true);
      const torsoMesh = new THREE.Mesh(torsoGeo, headMat);
      torsoMesh.position.y = -2;
      stepGroup.add(torsoMesh);
    } else if (step === 2) {
      // Classroom / Books
      // Create three styled floating books
      const bookColors = [0x4facfe, 0x00f2fe, 0xff0844];
      bookColors.forEach((color, index) => {
        const bookGroup = new THREE.Group();
        
        // Book Cover
        const coverGeo = new THREE.BoxGeometry(1.6, 0.15, 1.1);
        const coverMat = new THREE.MeshPhongMaterial({
          color: color,
          shininess: 100,
        });
        const coverMesh = new THREE.Mesh(coverGeo, coverMat);
        bookGroup.add(coverMesh);

        // Book Pages
        const pagesGeo = new THREE.BoxGeometry(1.5, 0.12, 1.0);
        const pagesMat = new THREE.MeshPhongMaterial({
          color: 0xffffff,
        });
        const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
        pagesMesh.position.x = 0.03; // slightly offset to show cover spine
        bookGroup.add(pagesMesh);

        // Position offset
        bookGroup.position.set(0, (index - 1) * 0.8, 0);
        bookGroup.rotation.y = (index - 1) * 0.3;
        bookGroup.rotation.x = 0.1;
        bookGroup.name = `book_${index}`;

        stepGroup.add(bookGroup);
      });
    } else if (step === 3) {
      // Floating 3D Primitives (VR & 3D familiarity)
      // Central floating orb
      const orbGeo = new THREE.SphereGeometry(0.8, 32, 32);
      const orbMat = new THREE.MeshPhongMaterial({
        color: 0xff0844,
        emissive: 0x440011,
        shininess: 100,
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      stepGroup.add(orbMesh);

      // Surrounding orbiting primitives
      const torusGeo = new THREE.TorusGeometry(0.4, 0.12, 8, 24);
      const torusMat = new THREE.MeshPhongMaterial({ color: 0x00f2fe, wireframe: true });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      torusMesh.position.set(2, 1, 0);
      torusMesh.name = "orbitTorus";
      stepGroup.add(torusMesh);

      const boxGeo = new THREE.OctahedronGeometry(0.5, 0);
      const boxMat = new THREE.MeshPhongMaterial({ color: 0x4facfe, flatShading: true });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.position.set(-2, -1, 0.5);
      boxMesh.name = "orbitOcta";
      stepGroup.add(boxMesh);

      const coneGeo = new THREE.ConeGeometry(0.4, 0.8, 4);
      const coneMat = new THREE.MeshPhongMaterial({ color: 0xfff, wireframe: true });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.position.set(1.5, -1.2, -1);
      coneMesh.name = "orbitCone";
      stepGroup.add(coneMesh);
    } else {
      // Step 4: Verification Shield / Secure Upload Box
      // Secure cylinder container
      const containerGeo = new THREE.CylinderGeometry(1.2, 1.2, 2, 32, 1, true);
      const containerMat = new THREE.MeshPhongMaterial({
        color: 0x00f2fe,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const containerMesh = new THREE.Mesh(containerGeo, containerMat);
      stepGroup.add(containerMesh);

      // Solid central core representing security/data
      const coreGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const coreMat = new THREE.MeshPhongMaterial({
        color: 0xff0844,
        shininess: 150,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.name = "secureCore";
      stepGroup.add(coreMesh);

      // Glowing floating rings
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.05, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x4facfe, transparent: true, opacity: 0.8 })
      );
      ring1.rotation.x = Math.PI / 2;
      ring1.name = "shieldRing1";
      stepGroup.add(ring1);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.05, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.8 })
      );
      ring2.rotation.y = Math.PI / 2;
      ring2.name = "shieldRing2";
      stepGroup.add(ring2);
    }

    // 7. Mouse Interaction logic
    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current = { x, y };
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 8. Animation loop
    let clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Slow rotation based on mouse position
      if (stepGroup) {
        // Target rotation based on mouse coordinates
        const targetX = mouseRef.current.y * 0.5;
        const targetY = mouseRef.current.x * 0.5;

        stepGroup.rotation.x += (targetX - stepGroup.rotation.x) * 0.05;
        stepGroup.rotation.y += (targetY - stepGroup.rotation.y) * 0.05;

        // Base continuous rotation
        stepGroup.rotation.y += 0.005;

        // Step-specific animation updates
        if (step === 1) {
          // Scan ring moving up and down
          const scanRing = stepGroup.getObjectByName("scanRing");
          if (scanRing) {
            scanRing.position.y = Math.sin(elapsedTime * 2) * 1.5;
            scanRing.rotation.z += 0.01;
          }
        } else if (step === 2) {
          // Make books bobble up and down gently
          for (let i = 0; i < 3; i++) {
            const book = stepGroup.getObjectByName(`book_${i}`);
            if (book) {
              book.position.y = (i - 1) * 0.8 + Math.sin(elapsedTime + i) * 0.12;
              book.rotation.y += 0.002 * (i + 1);
            }
          }
        } else if (step === 3) {
          // Orbiting animations
          const torus = stepGroup.getObjectByName("orbitTorus");
          if (torus) {
            torus.position.x = Math.cos(elapsedTime) * 2;
            torus.position.z = Math.sin(elapsedTime) * 2;
            torus.rotation.x += 0.01;
            torus.rotation.y += 0.01;
          }

          const octa = stepGroup.getObjectByName("orbitOcta");
          if (octa) {
            octa.position.x = -Math.cos(elapsedTime + 1) * 2.2;
            octa.position.y = Math.sin(elapsedTime + 1) * 1.2;
            octa.rotation.x -= 0.015;
            octa.rotation.z += 0.01;
          }

          const cone = stepGroup.getObjectByName("orbitCone");
          if (cone) {
            cone.position.z = -Math.cos(elapsedTime + 2) * 1.8;
            cone.position.y = -Math.sin(elapsedTime + 2) * 1.2;
            cone.rotation.y += 0.02;
          }
        } else if (step === 4) {
          // Secure core rotation and pulsing scale
          const core = stepGroup.getObjectByName("secureCore");
          if (core) {
            core.rotation.y += 0.01;
            core.rotation.x += 0.008;
            const pulse = 1 + Math.sin(elapsedTime * 3) * 0.08;
            core.scale.set(pulse, pulse, pulse);
          }

          const ring1 = stepGroup.getObjectByName("shieldRing1");
          if (ring1) ring1.rotation.z += 0.015;

          const ring2 = stepGroup.getObjectByName("shieldRing2");
          if (ring2) ring2.rotation.z -= 0.01;
        }
      }

      // Rotate background particles
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.015;

      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // 10. Clean up
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      // Deep dispose Three.js scene
      scene.remove(stepGroup);
      scene.remove(particles);

      // Traverse and dispose geometries and materials
      stepGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [step]);

  return (
    <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-primary/10 via-transparent to-transparent pointer-events-none rounded-2xl" />
      
      {/* Canvas container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
