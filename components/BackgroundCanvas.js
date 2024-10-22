                // Start of Selection
                import { useRef, useEffect } from 'react';

                function BackgroundCanvas({ speedMultiplier = 1 }) {
                  const canvasRef = useRef(null);
                  const speedRef = useRef(speedMultiplier); // Create a ref for speedMultiplier

                  useEffect(() => {
                    speedRef.current = speedMultiplier; // Update the ref when prop changes
                  }, [speedMultiplier]);

                  useEffect(() => {
                    let animationFrameId;
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');

                    // Adjust canvas size
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    let rings = [];
                    let frameCount = 0;
                    let pathX = Math.random() * canvas.width;
                    let pathY = Math.random() * canvas.height;
                    let pathDirectionX = Math.random() < 0.5 ? -1 : 1; // Initial X direction
                    let pathDirectionY = Math.random() < 0.5 ? -1 : 1; // Initial Y direction
                    let turnTimerX = 0;
                    let turnDurationX = Math.floor(Math.random() * 200) + 100;
                    let turnTimerY = 0;
                    let turnDurationY = Math.floor(Math.random() * 200) + 100;

                    // Function to create a new ring
                    function createRing() {
                      // Soft, soothing colors (blues and purples)
                      let hue = Math.floor(Math.random() * 60) + 200; // Hue between 200 and 260
                      let saturation = Math.floor(Math.random() * 20) + 40; // Saturation between 40% and 60%
                      let lightness = Math.floor(Math.random() * 20) + 60; // Lightness between 60% and 80%
                      const opacity = Math.random() * 0.3 + 0.2; // Opacity between 0.2 and 0.5
                      const ring = {
                        xOffset: pathX,
                        yOffset: pathY,
                        zPosition: 1000, // Start far away
                        hue: hue,
                        saturation: saturation,
                        lightness: lightness,
                        initialOpacity: opacity,
                        thickness: Math.random() * 5 + 2, // Random thickness between 2 and 7
                      };
                      rings.push(ring);
                    }

                    function animate() {
                      frameCount++;

                      // Update path turning for X
                      turnTimerX++;
                      if (turnTimerX > turnDurationX) {
                        turnTimerX = 0;
                        turnDurationX = Math.floor(Math.random() * 200) + 100;
                        pathDirectionX = Math.random() < 0.5 ? -1 : 1;
                      }
                      pathX += pathDirectionX * 0.1; // Slower movement

                      // Keep pathX within canvas bounds
                      if (pathX < 0 || pathX > canvas.width) {
                        pathDirectionX *= -1;
                      }

                      // Update path turning for Y
                      turnTimerY++;
                      if (turnTimerY > turnDurationY) {
                        turnTimerY = 0;
                        turnDurationY = Math.floor(Math.random() * 200) + 100;
                        pathDirectionY = Math.random() < 0.5 ? -1 : 1;
                      }
                      pathY += pathDirectionY * 0.1; // Slower movement

                      // Keep pathY within canvas bounds
                      if (pathY < 0 || pathY > canvas.height) {
                        pathDirectionY *= -1;
                      }

                      // Create new rings periodically
                      if (frameCount % 150 === 0) { // Slow down ring creation
                        createRing();
                      }

                      // Set background color to a soft gradient
                      ctx.fillStyle = '#1a1a1a'; // Dark background
                      ctx.fillRect(0, 0, canvas.width, canvas.height);

                      // Update and draw rings
                      rings.forEach((ring) => {
                        ring.zPosition -= 0.2 * speedRef.current; // Use speedRef.current

                        // Interpolate x and y positions towards center as rings approach
                        const t = (1000 - ring.zPosition) / 1000;
                        const centeredX = ring.xOffset * (1 - t) + (canvas.width / 2) * t;
                        const centeredY = ring.yOffset * (1 - t) + (canvas.height / 2) * t;

                        // Calculate scale based on zPosition
                        const scale = 2 + t * 3;
                        const radius = 60 * scale;

                        // Calculate fade-out factor
                        const fadeOutStart = -100; // Start fading out when zPosition reaches this value
                        const fadeOutEnd = -500; // Completely faded out at this zPosition
                        let fadeOutFactor = 1;
                        if (ring.zPosition < fadeOutStart) {
                          fadeOutFactor = Math.max(0, (ring.zPosition - fadeOutEnd) / (fadeOutStart - fadeOutEnd));
                        }

                        // Draw ring with fade-in and fade-out effects
                        const fadeInFactor = Math.pow(t, 0.8); // Slower fade-in
                        const opacity = ring.initialOpacity * fadeInFactor * fadeOutFactor;
                        ctx.strokeStyle = `hsla(${ring.hue}, ${ring.saturation}%, ${ring.lightness}%, ${opacity})`;
                        ctx.lineWidth = ring.thickness * scale; // Use the ring's thickness
                        ctx.beginPath();
                        ctx.arc(centeredX, centeredY, radius, 0, Math.PI * 2);
                        ctx.stroke();
                      });

                      // Remove rings that have completely faded out
                      rings = rings.filter((ring) => ring.zPosition > -500);

                      animationFrameId = requestAnimationFrame(animate);
                    }

                    // Start the animation
                    animate();

                    // Cleanup on unmount
                    return () => {
                      cancelAnimationFrame(animationFrameId);
                    };
                  }, []); // Remove speedMultiplier from dependencies

                  return (
                    <canvas
                      ref={canvasRef}
                      style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}
                    />
                  );
                }

                export default BackgroundCanvas;
