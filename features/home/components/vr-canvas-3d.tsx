"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface VRCanvas3DProps {
  modelPath: string;
}

export default function VRCanvas3D({ modelPath }: VRCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store references for the animation loop to update when modelPath changes
  const modelRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    setIsLoading(true);
    setError(null);

    // Initialize Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 5, 4);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa30014, 0.4);
    dirLight2.position.set(-5, -2, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // Subtle background circle / target
    const ringGeom = new THREE.TorusGeometry(2.0, 0.01, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa30014,
      transparent: true,
      opacity: 0.15,
    });
    const backgroundRing = new THREE.Mesh(ringGeom, ringMat);
    backgroundRing.rotation.x = Math.PI / 2.2;
    scene.add(backgroundRing);

    // Load Model using GLTFLoader
    const loader = new GLTFLoader();
    let loadedModelScene: THREE.Group | null = null;
    let wrapper: THREE.Group | null = null;

    loader.load(
      modelPath,
      (gltf) => {
        loadedModelScene = gltf.scene;

        // Create an outer wrapper group to act as the pivot point
        wrapper = new THREE.Group();
        
        // Auto-center and auto-scale the loaded model
        const box = new THREE.Box3().setFromObject(loadedModelScene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Offset the inner loaded model so its bounding box center is at wrapper's origin (0,0,0)
        loadedModelScene.position.set(-center.x, -center.y, -center.z);
        wrapper.add(loadedModelScene);

        // Scale the wrapper to a standard height in the viewport
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 2.4 / maxDim : 1;
        wrapper.scale.setScalar(scale);

        // Reset wrapper position in the center of the scene
        wrapper.position.set(0, 0, 0);

        // Enable shadows for child meshes
        loadedModelScene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        scene.add(wrapper);
        modelRef.current = wrapper;
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error("Failed to load 3D model:", err);
        setError("Could not load 3D asset");
        setIsLoading(false);
      }
    );

    // Drag-to-Rotate Interaction (Mouse & Touch)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !modelRef.current) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      };

      // Adjust model rotation based on pixel delta dragged
      modelRef.current.rotation.y += deltaMove.x * 0.008;
      modelRef.current.rotation.x += deltaMove.y * 0.008;

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Touch Support for Mobile
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      isDragging = true;
      previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging || !modelRef.current || event.touches.length === 0) return;

      const deltaMove = {
        x: event.touches[0].clientX - previousMousePosition.x,
        y: event.touches[0].clientY - previousMousePosition.y,
      };

      modelRef.current.rotation.y += deltaMove.x * 0.008;
      modelRef.current.rotation.x += deltaMove.y * 0.008;

      previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // Animation Loop
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate background ring softly
      backgroundRing.rotation.z += 0.001;

      // Auto rotate model slowly when not dragging
      if (modelRef.current && !isDragging) {
        modelRef.current.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);

      // Remove drag listeners
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);

      // Clean up WebGL resources
      if (loadedModelScene) {
        loadedModelScene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });
      }

      ringGeom.dispose();
      ringMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelPath]);

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px]">
      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/50 backdrop-blur-sm rounded-3xl z-10">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Loading 3D Object...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-center p-6 bg-rose-50/80 rounded-3xl z-10">
          <p className="text-sm font-semibold text-brand-primary">{error}</p>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
