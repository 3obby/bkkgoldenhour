import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ClubMap({ onClose }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

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

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Add AxesHelper
    const axesHelper = new THREE.AxesHelper(30); // Increased size 3x
    scene.add(axesHelper);

    const radius = 90; // Increased radius 3x

    // Add a simple cube displayed as wireframe
    const cubeGeometry = new THREE.BoxGeometry(15, 15, 15); // Dimensions increased 3x
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    // Add a solid orange plane within the boundaries of the cube at y=0
    const planeGeometry = new THREE.PlaneGeometry(15, 15); // Dimensions increased 3x
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to lie on XZ plane
    plane.position.y = 0.01; // Slightly above y = 0
    scene.add(plane);

    // Add a smaller cube on the floor (labelled demosmallcube)
    const smallCubeGeometry = new THREE.BoxGeometry(3, 3, 3); // Dimensions increased 3x
    const smallCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const demosmallcube = new THREE.Mesh(smallCubeGeometry, smallCubeMaterial);
    demosmallcube.position.set(0, 1.5, 0); // Position adjusted for increased size
    scene.add(demosmallcube);

    // **Position the camera**
    const angle = Math.PI / 4; // 45 degrees in radians
    const y = 60; // Increased height 3x

    const x = radius * Math.sin(angle);
    const z = radius * Math.cos(angle);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);

    // Animation loop without rotation/movement
    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();
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
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;

      // Create 'ping' effect at the point
      const pingGeometry = new THREE.RingGeometry(0.3, 0.45, 32); // Sizes increased 3x
      const pingMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const ping = new THREE.Mesh(pingGeometry, pingMaterial);
      ping.position.copy(point);
      ping.rotation.x = -Math.PI / 2;
      sceneRef.current.add(ping);

      // Animate the ping effect
      let scale = 1;
      const pingAnimate = function () {
        scale += 0.06; // Speed increased 3x
        ping.scale.set(scale, scale, scale);
        ping.material.opacity = 1 - (scale - 1);
        if (ping.material.opacity <= 0) {
          sceneRef.current.remove(ping);
        } else {
          requestAnimationFrame(pingAnimate);
        }
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
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
