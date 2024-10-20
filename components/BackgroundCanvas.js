    import { useRef, useEffect } from 'react';

    function BackgroundCanvas() {
      const canvasRef = useRef(null);

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
          const hue = Math.floor(Math.random() * 360); // Random hue between 0 and 359
          const saturation = Math.floor(Math.random() * 50) + 50; // Random saturation between 50% and 100%
          const lightness = Math.floor(Math.random() * 50) + 25; // Random lightness between 25% and 75%
          const opacity = Math.random(); // Random opacity between 0 and 1
          const ring = {
            xOffset: pathX,
            yOffset: pathY,
            zPosition: 1000, // Start far away
            hue: hue,
            saturation: saturation,
            lightness: lightness,
            initialOpacity: opacity,
            thickness: Math.random() * 30 + 20, // Random thickness between 20 and 50
          };
          rings.push(ring);
        }

        function animate() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          frameCount++;

          // Update path turning for X
          turnTimerX++;
          if (turnTimerX > turnDurationX) {
            turnTimerX = 0;
            turnDurationX = Math.floor(Math.random() * 200) + 100;
            pathDirectionX = Math.random() < 0.5 ? -1 : 1;
          }
          pathX += pathDirectionX * 0.3; // Adjust the turning speed (1/10th)

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
          pathY += pathDirectionY * 0.3; // Adjust the turning speed (1/10th)

          // Keep pathY within canvas bounds
          if (pathY < 0 || pathY > canvas.height) {
            pathDirectionY *= -1;
          }

          // Create new rings periodically
          if (frameCount % 50 === 0) { // Slow down ring creation (1/10th)
            createRing();
          }

          // Update and draw rings
          rings.forEach((ring) => {
            ring.zPosition -= 1; // Move rings towards the viewer (1/10th speed)

            // Interpolate x and y positions towards center as rings approach
            const t = (1000 - ring.zPosition) / 1000;
            const centeredX = ring.xOffset * (1 - t) + (canvas.width / 2) * t;
            const centeredY = ring.yOffset * (1 - t) + (canvas.height / 2) * t;

            // Calculate scale based on zPosition
            const scale = 4 + t * 6;
            const radius = 60 * scale;

            // Calculate fade-out factor
            const fadeOutStart = -100; // Start fading out when zPosition reaches this value
            const fadeOutEnd = -500; // Completely faded out at this zPosition
            let fadeOutFactor = 1;
            if (ring.zPosition < fadeOutStart) {
              fadeOutFactor = Math.max(0, (ring.zPosition - fadeOutEnd) / (fadeOutStart - fadeOutEnd));
            }

            // Draw ring with fade-in and fade-out effects
            const fadeInFactor = Math.pow(t, 0.3); // Adjust this exponent to control fade-in speed (smaller value = slower fade-in)
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
      }, []);

      return (
        <canvas
          ref={canvasRef}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}
        />
      );
    }

    export default BackgroundCanvas;