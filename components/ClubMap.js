import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ClubMap({ onClose }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const currentPingRef = useRef(null);
  const animationRef = useRef(null); // For animation frame
  const timeRef = useRef(0); // Track animation time
  const wallsRef = useRef([]); // Track wall meshes
  const pickableObjects = useRef([]); // Correctly define pickableObjects with useRef

  useEffect(() => {
    const currentMount = mountRef.current;

    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.2,
      1000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);

    // Enable clipping planes to hide anything below the 2D plane (y=0)
    renderer.localClippingEnabled = true;
    renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)];

    currentMount.appendChild(renderer.domElement);

    // Add OrbitControls but enable user controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = true; // Enable user controls

    // Initialize a clock to track time
    const clock = new THREE.Clock();

    // Variables to track user interaction and transition
    let isUserInteracting = false;
    let isTransitioning = false;
    let transitionStartTime = 0;
    let transitionDuration = 2.0; // Duration of the transition in seconds
    let inactivityTimeout;
    const fullRotationSpeed = 0.05; // Modify as needed for rotation speed

    // Variables to store camera states
    let startPosition = new THREE.Vector3();
    let startQuaternion = new THREE.Quaternion();
    let targetPosition = new THREE.Vector3();
    let targetQuaternion = new THREE.Quaternion();

    // Add event listeners to OrbitControls
    controls.addEventListener('start', () => {
      isUserInteracting = true;
      isTransitioning = false;
      clearTimeout(inactivityTimeout); // Clear any existing timeout
    });

    controls.addEventListener('end', () => {
      // Start inactivity timer
      inactivityTimeout = setTimeout(() => {
        isUserInteracting = false;
        isTransitioning = true;
        transitionStartTime = clock.getElapsedTime();

        // Store the starting state of the camera
        startPosition.copy(camera.position);
        startQuaternion.copy(camera.quaternion);
      }, 3000); // 3 seconds of inactivity
    });

    // Remove or comment out the AxesHelper
    // const axesHelper = new THREE.AxesHelper(30);
    // scene.add(axesHelper);

    const radius = 38;
    const roomSize = 15;

    // Create walls
    const wallGeometry = new THREE.PlaneGeometry(roomSize, roomSize/3);
    const wallMaterial = new THREE.MeshBasicMaterial({
      color: 0x007F00,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });

    // Create 4 walls
    const walls = [];
    for (let i = 0; i < 4; i++) {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
 
      walls.push(wall);
      scene.add(wall);
    }

    // Position walls
    walls[0].position.z = roomSize / 2;
    walls[1].position.x = roomSize / 2;
    walls[1].rotation.y = Math.PI / 2;
    walls[2].position.z = -roomSize / 2;
    walls[3].position.x = -roomSize / 2;
    walls[3].rotation.y = Math.PI / 2;

    wallsRef.current = walls;

    // Add a neon green plane within the boundaries of the cube at y=0 (this is the ground)
    const planeGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x007F00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0.01;
    scene.add(plane);

    // Assign the plane to pickableObjects.current
    pickableObjects.current = [plane]; // <-- Keep this line

    // Add a smaller cube on the floor as wireframe with same green color
    const smallCubeGeometry = new THREE.BoxGeometry(3, 1, 3);
    const smallCubeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      wireframe: true 
    });
    // const demosmallcube = new THREE.Mesh(smallCubeGeometry, smallCubeMaterial);
    // demosmallcube.position.set(0, 1.5, 0);
    // scene.add(demosmallcube);

    // Initial camera position
    camera.position.set(radius * Math.sin(Math.PI / 4), 20, radius * Math.cos(Math.PI / 4));
    camera.lookAt(0, 0, 0);

    // Animation loop with camera control
    const animate = function () {
      // Get the time elapsed since the last frame
      const deltaTime = clock.getDelta();

      requestAnimationFrame(animate);

      if (isUserInteracting) {
        // User is interacting
        controls.update();
      } else if (isTransitioning) {
        // Transitioning back to automatic rotation
        const elapsedTime = clock.getElapsedTime() - transitionStartTime;
        const t = Math.min(elapsedTime / transitionDuration, 1);

        // Easing function for smooth interpolation
        const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const easedT = easeInOutQuad(t);

        // Compute target camera position and quaternion for automatic rotation
        const tempTime = timeRef.current + deltaTime * fullRotationSpeed;

        const baseRadius = radius + Math.sin(tempTime * 0.5) * 5; // Breathing zoom effect
        const heightOffset = Math.sin(tempTime * 0.7) * 3; // Gentle bobbing
        const angle = tempTime;

        targetPosition.set(
          baseRadius * Math.sin(angle),
          20 + heightOffset,
          baseRadius * Math.cos(angle)
        );

        // Calculate the target quaternion
        targetQuaternion.setFromRotationMatrix(
          new THREE.Matrix4().lookAt(targetPosition, new THREE.Vector3(0, 0, 0), camera.up)
        );

        // Interpolate position and quaternion
        camera.position.lerpVectors(startPosition, targetPosition, easedT);
        camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, easedT);

        if (t >= 1) {
          // Transition complete
          isTransitioning = false;
          // Sync timeRef.current with tempTime to continue automatic rotation smoothly
          timeRef.current = tempTime;
        }
      } else {
        // Automatic camera movement
        // Update the time reference
        timeRef.current += deltaTime * fullRotationSpeed;

        // Calculate camera position for automatic rotation
        const baseRadius = radius + Math.sin(timeRef.current * 0.5) * 5; // Breathing zoom effect
        const heightOffset = Math.sin(timeRef.current * 0.7) * 3; // Gentle bobbing
        const angle = timeRef.current;

        // Update camera position
        camera.position.set(
          baseRadius * Math.sin(angle),
          20 + heightOffset,
          baseRadius * Math.cos(angle)
        );

        // Ensure the camera looks at the center
        camera.lookAt(0, 0, 0);
      }

      // Render scene
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      renderer.dispose();
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle click event to generate 'ping' effect
  const handleClick = (event) => {
    event.preventDefault();

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / mountRef.current.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / mountRef.current.clientHeight) * 2 + 1;

    // Raycasting to find intersecting objects
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Use pickableObjects.current instead of pickableObjects
    const intersects = raycaster.intersectObjects(pickableObjects.current);

    // Find intersection with the floor plane specifically
    const floorIntersect = intersects.find(intersect => 
      intersect.object.geometry instanceof THREE.PlaneGeometry
    );

    if (floorIntersect) {
      // Remove existing ping if there is one
      if (currentPingRef.current) {
        sceneRef.current.remove(currentPingRef.current);
      }

      const point = floorIntersect.point;

      // Create white 'ping' effect at the point
      const pingGeometry = new THREE.RingGeometry(0.9, 1.35, 32);
      const pingMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const ping = new THREE.Mesh(pingGeometry, pingMaterial);
      ping.position.copy(point);
      ping.position.y = 0.02;
      ping.rotation.x = -Math.PI / 2;
      sceneRef.current.add(ping);
      currentPingRef.current = ping;

      // Animate the ping effect continuously but slower
      let scale = 1;
      const pingAnimate = function () {
        scale += 0.02;
        ping.scale.set(scale, scale, scale);
        ping.material.opacity = 1 - (scale - 1);
        if (ping.material.opacity <= 0) {
          scale = 1;
          ping.scale.set(scale, scale, scale);
          ping.material.opacity = 1;
        }
        requestAnimationFrame(pingAnimate);
      };
      pingAnimate();
    }
  };

  return (
    <div className="club-map-overlay" onClick={onClose}>
      <div className="club-map-content" onClick={(e) => e.stopPropagation()}>
        <div
          ref={mountRef}
          className="club-map"
          onClick={handleClick}
          style={{ width: '100%', height: '100%' }}
        ></div>
        <button className="close-button" onClick={onClose} style={{ color: 'white' }}>
          X
        </button>
      </div>
    </div>
  );
}
