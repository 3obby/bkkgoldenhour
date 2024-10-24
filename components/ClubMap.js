import { useEffect, useRef, useState, useContext } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OrderContext } from '../contexts/OrderContext'; // Import OrderContext

export default function ClubMap({ onClose, setCoordinates, comments, selectedOptions, customerId, onCloseOrderModal }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const currentPingRef = useRef(null); // Keep as an object to store ping components
  const animationRef = useRef(null); // For animation frame
  const timeRef = useRef(0); // Track animation time
  const wallsRef = useRef([]); // Track wall meshes
  const pickableObjects = useRef([]); // Correctly define pickableObjects with useRef

  // Add state variable to track if there's an existing ping
  const [hasPing, setHasPing] = useState(false);

  // Add state variable to store the selected point
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Add these refs at the top level of your component
  const pingScaleRef = useRef(1);
  const bobbingOffsetRef = useRef(0);

  // Add a ref to store emoji sprites
  const emojiSpritesRef = useRef([]);

  const { order, removeItem, submitOrder } = useContext(OrderContext); // Access OrderContext

  // Add state for loading and submission complete
  const [isLoading, setIsLoading] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  useEffect(() => {
    const currentMount = mountRef.current;

    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Adjust the camera's field of view (FOV) if necessary
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

    // Remove or comment out the AxesHelper if not needed
    // const axesHelper = new THREE.AxesHelper(30);
    // scene.add(axesHelper);

    const radius = 20; // Decrease the radius to zoom in closer
    const roomSize = 10; // Room size remains the same
    const wallHeight = 3; // Wall height remains the same

    // Create walls
    const wallGeometry = new THREE.PlaneGeometry(roomSize, wallHeight);
    const wallMaterial = new THREE.MeshBasicMaterial({
      color: 0x007F00,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });

    // Create walls without divisions
    const walls = [];

    // Front Wall
    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
    frontWall.position.set(0, 0, 5);
    walls.push(frontWall);
    scene.add(frontWall);

    // Right Wall
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
    rightWall.position.set(5, 0, 0);
    rightWall.rotation.y = Math.PI / 2;
    walls.push(rightWall);
    scene.add(rightWall);

    // Back Wall
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
    backWall.position.set(0, 0, -5); // Positioned at z = -5
    walls.push(backWall);
    scene.add(backWall);

    // Left Wall
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
    leftWall.position.set(-5, 0, 0); // Positioned at x = -5
    leftWall.rotation.y = Math.PI / 2;
    walls.push(leftWall);
    scene.add(leftWall);

    wallsRef.current = walls;

    // Load and parse the template data
    const templateData = `
    X X X X X X X 💨 💨 💨
    X 🍻 🍻 🍻 🍻 🍻 X 💨 💨 💨
    X X X X X X X 💨 💨 💨
    X X X X X X X 💨 💨 💨
    X X 🪑 🪑 X X X 💨 💨 💨
    X X X X X X X 💨 💨 💨
    X 🪑 🪑 X X X X 💨 💨 💨
    X X X X X 🪜 🪜 💨 💨 💨
    X X X X X 🪜 🪜 💨 💨 💨
    X X 🪑 🪑 X 🪜 🪜 💨 💨 💨
    `;

    // Parse the template data into an array of rows and columns
    const templateRows = templateData
    .trim()
    .split('\n')
    .map((line) =>
      line
        .trim()
        .split(/\s+/) // Split by whitespace
        .map((symbol) => symbol || 'X')
    );
    // Set the desired grid size
    const gridRows = 10;
    const gridCols = 10;

    // Create a 10x10 grid filled with empty tiles ('X')
    const gridData = Array.from({ length: gridRows }, () => Array(gridCols).fill('X'));

    // Overlay the template data onto the grid, centered
    const templateRowsCount = templateRows.length;
    const templateColsCount = Math.max(...templateRows.map(row => row.length));

    const rowOffset = Math.floor((gridRows - templateRowsCount) / 2);
    const colOffset = Math.floor((gridCols - templateColsCount) / 2);

    for (let row = 0; row < templateRowsCount; row++) {
      const templateRow = templateRows[row];
      for (let col = 0; col < templateRow.length; col++) {
        const symbol = templateRow[col] || 'X'; // Default to 'X' if undefined
        const gridRow = row + rowOffset;
        const gridCol = col + colOffset;
        if (
          gridRow >= 0 &&
          gridRow < gridRows &&
          gridCol >= 0 &&
          gridCol < gridCols
        ) {
          gridData[gridRow][gridCol] = symbol;
        }
      }
    }

    // Instead of a single floor plane, create a grid of tiles based on the gridData
    const tileSize = roomSize / gridCols; // Size allocated per tile
    const tileScaleFactor = 0.9; // Tiles will be 90% of the allocated size
    const tileGeometrySize = tileSize * tileScaleFactor; // Actual size of each tile
    const tiles = []; // To store all tile meshes

    // Initialize emoji sprites array
    emojiSpritesRef.current = [];

    // Create the grid of tiles based on gridData
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const symbol = gridData[row][col];

        // Create tile geometry
        const tileGeometry = new THREE.PlaneGeometry(
          tileGeometrySize,
          tileGeometrySize
        );

        // Create tile material without symbols
        const tileMaterial = new THREE.MeshBasicMaterial({
          color: '#004e00', // Tile color
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 1,
        });

        // Create the tile mesh
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);

        // Calculate the position of the tile
        const adjustedCol = gridCols - 1 - col;
        const xPos =
          -roomSize / 2 + tileSize / 2 + adjustedCol * tileSize;
        const zPos =
          roomSize / 2 - tileSize / 2 - row * tileSize;

        tile.position.set(xPos, 0.02, zPos); // Slightly above y=0 to "float"

        // Rotate to be horizontal
        tile.rotation.x = -Math.PI / 2;

        scene.add(tile);
        tiles.push(tile);

        // If the tile has a symbol, create an emoji sprite above it
        if (symbol !== 'X') {
          createEmojiSpriteAtPosition(symbol, xPos, zPos);

          // **Add neon green wireframe cube for '🍻' symbols**
          if (symbol === '🍻') {
            const cubeSize = tileGeometrySize; // Same size as the tile
            const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            const cubeMaterial = new THREE.MeshBasicMaterial({
              color: 0x39ff14, // Neon green color
              wireframe: true,
            });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set(xPos, cubeSize / 2, zPos); // Position it on the ground
            scene.add(cube);
          }
        }
      }
    }

    // Assign the tiles to pickableObjects.current
    pickableObjects.current = tiles;

    // Initial camera position (Zoomed in)
    camera.position.set(
      radius * Math.sin(Math.PI / 4),
      8, // Lower the y-position to zoom in vertically
      radius * Math.cos(Math.PI / 4)
    );
    camera.lookAt(0, 0, 0);

    // Animation loop with camera control
    const animate = function () {
      // Get the time elapsed since the last frame
      const deltaTime = clock.getDelta();

      animationRef.current = requestAnimationFrame(animate);

      // Camera controls update
      if (isUserInteracting) {
        controls.update();
      } else if (isTransitioning) {
        // Transitioning back to automatic rotation
        const elapsedTime = clock.getElapsedTime() - transitionStartTime;
        const t = Math.min(elapsedTime / transitionDuration, 1);

        // Easing function for smooth interpolation
        const easeInOutQuad = (t) =>
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const easedT = easeInOutQuad(t);

        // Compute target camera position and quaternion for automatic rotation
        const tempTime = timeRef.current + deltaTime * fullRotationSpeed;

        const baseRadius =
          radius + Math.sin(tempTime * 0.5) * 2; // Adjusted zoom effect
        const heightOffset = Math.sin(tempTime * 0.7) * 1; // Adjusted bobbing
        const angle = tempTime;

        targetPosition.set(
          baseRadius * Math.sin(angle),
          8 + heightOffset, // Adjusted height
          baseRadius * Math.cos(angle)
        );

        // Calculate the target quaternion
        targetQuaternion.setFromRotationMatrix(
          new THREE.Matrix4().lookAt(
            targetPosition,
            new THREE.Vector3(0, 0, 0),
            camera.up
          )
        );

        // Interpolate position and quaternion
        camera.position.lerpVectors(startPosition, targetPosition, easedT);
        camera.quaternion.slerpQuaternions(
          startQuaternion,
          targetQuaternion,
          easedT
        );

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
        const baseRadius =
          radius + Math.sin(timeRef.current * 0.5) * 2; // Adjusted zoom effect
        const heightOffset = Math.sin(timeRef.current * 0.7) * 1; // Adjusted bobbing
        const angle = timeRef.current;

        // Update camera position
        camera.position.set(
          baseRadius * Math.sin(angle),
          8 + heightOffset, // Adjusted height
          baseRadius * Math.cos(angle)
        );

        // Ensure the camera looks at the center
        camera.lookAt(0, 0, 0);
      }

      // **Ping effect animation**
      if (currentPingRef.current) {
        const { ping, emojiSprite } = currentPingRef.current;

        // Update ping scaling and opacity
        if (ping) {
          pingScaleRef.current += 0.01;
          const scale = pingScaleRef.current;
          ping.scale.set(scale, scale, scale);
          ping.material.opacity = 1 - (scale - 1);
          if (ping.material.opacity <= 0) {
            pingScaleRef.current = 1;
            ping.scale.set(1, 1, 1);
            ping.material.opacity = 1;
          }
        }

        // Update emoji sprite bobbing animation
        if (emojiSprite) {
          bobbingOffsetRef.current += 0.05; // bobbingSpeed
          emojiSprite.position.y =
            emojiSprite.userData.baseY +
            Math.sin(bobbingOffsetRef.current) * 0.2;
        }
      }

      // Animate emoji sprites
      emojiSpritesRef.current.forEach((emojiSprite) => {
        // Update rotation around Y-axis
        emojiSprite.rotation.y += emojiSprite.userData.rotationSpeed;

        // Apply bobbing only if enabled
        if (emojiSprite.userData.bobbingEnabled) {
          emojiSprite.userData.bobbingOffset += deltaTime * 2; // Bobbing speed
          emojiSprite.position.y =
            emojiSprite.userData.baseY +
            Math.sin(emojiSprite.userData.bobbingOffset) * 0.2;
        } else {
          // Ensure the sprite stays at baseY if bobbing is disabled
          emojiSprite.position.y = emojiSprite.userData.baseY;
        }
      });

      // Render the scene
      renderer.render(scene, camera);
    };

    animate();
    // Create background layer
    const backgroundGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      color: 0x1fc700, // Changed to neon green
      side: THREE.DoubleSide,
    });
    const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundPlane.rotation.x = -Math.PI / 2;
    backgroundPlane.position.y = 0.01; // Slightly below the bottom green tiles
    scene.add(backgroundPlane);

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
    mouse.x =
      ((event.clientX - rect.left) / mountRef.current.clientWidth) * 2 - 1;
    mouse.y =
      -((event.clientY - rect.top) / mountRef.current.clientHeight) * 2 + 1;

    // Raycasting to find intersecting objects
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Use pickableObjects.current instead of pickableObjects
    const intersects = raycaster.intersectObjects(pickableObjects.current);

    // Find intersection with the floor plane specifically
    const floorIntersect = intersects.find(
      (intersect) => intersect.object.geometry instanceof THREE.PlaneGeometry
    );

    if (floorIntersect) {
      const point = floorIntersect.point;

      // **Check if the point is within x and z between -5 and +5**
      if (
        point.x >= -5 &&
        point.x <= 5 &&
        point.z >= -5 &&
        point.z <= 5
      ) {
        // **Remove existing ping and related resources if there is one**
        if (currentPingRef.current) {
          const { ping, emojiSprite, textSprite } = currentPingRef.current;

          if (ping) {
            sceneRef.current.remove(ping);
          }
          if (emojiSprite) {
            sceneRef.current.remove(emojiSprite);
          }
          if (textSprite) {
            sceneRef.current.remove(textSprite);
          }
          currentPingRef.current = null; // Reset the reference
        }

        // **Store the selected point in state**
        setSelectedPoint(point);

        // **Create the new ping effect**
        // Create white 'ping' effect at the point
        const pingGeometry = new THREE.RingGeometry(0.9, 1.35, 32);
        const pingMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
        });
        const ping = new THREE.Mesh(pingGeometry, pingMaterial);
        ping.position.copy(point);
        ping.position.y += 0.3;
        ping.rotation.x = -Math.PI / 2;
        sceneRef.current.add(ping);

        // No need for separate animation loops; animations are handled in the main animate function
        currentPingRef.current = {
          ping,
          emojiSprite: createEmojiSprite(point),
          textSprite: createTextSprite(point),
        };

        setHasPing(true); // Set hasPing to true when a ping is created
      }
    }
  };

  // Modify the handleConfirm function
  const handleConfirm = async () => {
    // Ensure that a point has been selected
    if (selectedPoint) {
      const xCoord = selectedPoint.x.toFixed(2);
      const zCoord = selectedPoint.z.toFixed(2);

      setIsLoading(true);

      try {
        // Call submitOrder from context
        await submitOrder(null, comments, selectedOptions, customerId, { x: xCoord, z: zCoord });

        setIsLoading(false);
        setSubmissionComplete(true);

        // Remove existing ping and related resources
        if (currentPingRef.current) {
          const { ping, emojiSprite, textSprite } = currentPingRef.current;

          if (ping) {
            sceneRef.current.remove(ping);
          }
          if (emojiSprite) {
            sceneRef.current.remove(emojiSprite);
          }
          if (textSprite) {
            sceneRef.current.remove(textSprite);
          }

          currentPingRef.current = null; // Reset the reference
        }

        // Wait for 1 second before closing both modals
        setTimeout(() => {
          setHasPing(false);
          setSubmissionComplete(false);
          onClose(); // Close ClubMap
          if (onCloseOrderModal) {
            onCloseOrderModal(); // Close OrderModal
          }
        }, 1000);

      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    }
  };

  // **Helper functions to create sprites**
  function createEmojiSprite(point) {
    // Create a canvas to render the emoji
    const emojiCanvas = document.createElement('canvas');
    emojiCanvas.width = 64;
    emojiCanvas.height = 64;
    const emojiContext = emojiCanvas.getContext('2d');
    emojiContext.font = '48px Arial';
    emojiContext.textAlign = 'center';
    emojiContext.textBaseline = 'middle';
    emojiContext.fillText('👇', 32, 32);

    // Create a texture from the canvas
    const emojiTexture = new THREE.CanvasTexture(emojiCanvas);

    // Create a sprite material with the texture
    const emojiMaterial = new THREE.SpriteMaterial({
      map: emojiTexture,
      transparent: true,
    });

    // Create the sprite
    const emojiSprite = new THREE.Sprite(emojiMaterial);

    // Position the sprite above the ping
    emojiSprite.position.copy(point);
    emojiSprite.position.y += 2; // Adjust height as needed
    emojiSprite.scale.set(2, 2, 1); // Adjust size as needed

    // Store the base Y position for bobbing animation
    emojiSprite.userData.baseY = emojiSprite.position.y;

    // Add the sprite to the scene
    sceneRef.current.add(emojiSprite);

    return emojiSprite;
  }

  function createTextSprite(point) {
    // Create a canvas to render the coordinates text
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 256;
    textCanvas.height = 64;
    const textContext = textCanvas.getContext('2d');

    // Set font properties
    textContext.font = 'Bold 24px Arial';
    textContext.fillStyle = '#ffffff'; // White color
    textContext.textAlign = 'center';
    textContext.textBaseline = 'middle';

    // Prepare the text showing x and z coordinates, rounded to two decimal places
    const xCoord = point.x.toFixed(2);
    const zCoord = point.z.toFixed(2);
    const coordText = `X: ${xCoord}, Z: ${zCoord}`;

    // Fill text into the canvas
    textContext.fillText(
      coordText,
      textCanvas.width / 2,
      textCanvas.height / 2
    );

    // Create a texture from the canvas
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.minFilter = THREE.LinearFilter; // Improve text quality

    // Create a sprite material with the texture
    const textMaterial = new THREE.SpriteMaterial({
      map: textTexture,
      transparent: true,
    });

    // Create the sprite
    const textSprite = new THREE.Sprite(textMaterial);

    // Position the sprite near the emoji sprite
    textSprite.position.copy(point);
    textSprite.position.y += 3.5; // Adjust height as needed (above the emoji)
    textSprite.scale.set(4, 1, 1); // Adjust size as needed

    // Add the sprite to the scene
    sceneRef.current.add(textSprite);

    return textSprite;
  }

  // Helper function to create emoji sprites at given positions
  function createEmojiSpriteAtPosition(symbol, xPos, zPos) {
    // Create a canvas to render the emoji
    const emojiCanvas = document.createElement('canvas');
    emojiCanvas.width = 64;
    emojiCanvas.height = 64;
    const emojiContext = emojiCanvas.getContext('2d');
    emojiContext.font = '48px Arial';
    emojiContext.textAlign = 'center';
    emojiContext.textBaseline = 'middle';
    emojiContext.fillText(symbol, 32, 32);

    // Create a texture from the canvas
    const emojiTexture = new THREE.CanvasTexture(emojiCanvas);

    // Create a sprite material with the texture
    const emojiMaterial = new THREE.SpriteMaterial({
      map: emojiTexture,
      transparent: true,
    });

    // Create the sprite
    const emojiSprite = new THREE.Sprite(emojiMaterial);

    // Set initial y position and bobbing behavior based on the symbol
    let yPos = 0.5;            // Default height for bobbing emojis
    let bobbingEnabled = true; // Enable bobbing by default

    // Check if the symbol should not bob
    if (symbol === '🪜' || symbol === '🪑') {
      yPos = 0.5;              // Adjust yPos so they sit on the floor
      bobbingEnabled = false;  // Disable bobbing
    }

    // Position the sprite
    emojiSprite.position.set(xPos, yPos, zPos);
    emojiSprite.scale.set(1, 1, 1); // Adjust size as needed

    // Store animation data
    emojiSprite.userData = {
      baseY: yPos,
      rotationSpeed: Math.random() * 0.01 + 0.005, // Random rotation speed
      bobbingOffset: Math.random() * Math.PI * 2,  // Random phase
      bobbingEnabled: bobbingEnabled,              // Bobbing flag
    };

    // Add the sprite to the scene
    sceneRef.current.add(emojiSprite);
    emojiSpritesRef.current.push(emojiSprite);
  }

  return (
    <div className="club-map-overlay" onClick={onClose}>
      <div
        className="club-map-content"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <div
          ref={mountRef}
          className="club-map"
          onClick={handleClick}
          style={{ width: '100%', height: '100%' }}
        ></div>

     
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '2.2em',
              zIndex: 10,
            }}
          >
            🫵🗺️❓
            </div>
    
  

        {hasPing && (
          <div
            style={{
              position: 'absolute',
              bottom: '15%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            {isLoading ? (
              <div className="loading-animation">⏳</div>
            ) : submissionComplete ? (
              <div>🧑‍🍳👍</div>
            ) : (
              <button
                className="submit-button-new"
                onClick={handleConfirm}
                style={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '2em',
                  zIndex: 10,
                }}
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span style={{ fontSize: '2em' }}>🗺️</span>
                  <span
                    style={{
                      position: 'absolute',
                      top: '25%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                    }}
                  >
                    📍
                  </span>
                </div>
                <span
                  style={{
                    position: 'absolute',
                    top: '65%',
                    left: '80%',
                    transform: 'translate(-50%, -50%) rotate(-13deg)',
                    zIndex: 2,
                    width: '100px',
                  }}
                >
                  👨‍🍳👍
                </span>
              </button>
            )}
          </div>
        )}

        <button className="close-button" onClick={onClose} style={{ color: 'white' }}>
          X
        </button>
      </div>
    </div>
  );
}
