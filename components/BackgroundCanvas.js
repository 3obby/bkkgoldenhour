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

    const circles = [];
    let lastCircleSpawnTime = 0;

    const spawnCircle = (timestamp) => {
      if (timestamp - lastCircleSpawnTime >= 4000 || circles.length === 0) {
        lastCircleSpawnTime = timestamp;
        const circle = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 20 + 10,
          speedX: (Math.random() * 2 - 1) / 4, // 1/4 speed
          speedY: (Math.random() * 2 - 1) / 4, // 1/4 speed
          angle: Math.random() * Math.PI * 2, // For arcing movement
          creationTime: timestamp,
          opacity: 0, // Start from 0 opacity
          colorHue: Math.random() * 360,
        };
        circles.push(circle);
      }

      animate(timestamp);
      animationFrameId = requestAnimationFrame(spawnCircle);
    };

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      circles.forEach((circle) => {
        const timeSinceCreation = timestamp - circle.creationTime;

        // Fade in over 4 seconds (4000 ms)
        if (timeSinceCreation < 4000) {
          circle.opacity = timeSinceCreation / 4000;
        } else {
          circle.opacity = 1;
        }

        // Update position for arcing movement
        const speed = Math.sqrt(circle.speedX ** 2 + circle.speedY ** 2);
        circle.angle += 0.01; // Adjust for more or less arc
        circle.x += speed * Math.cos(circle.angle);
        circle.y += speed * Math.sin(circle.angle);

        // Wrap around screen edges
        if (circle.x - circle.radius > canvas.width) circle.x = -circle.radius;
        if (circle.x + circle.radius < 0) circle.x = canvas.width + circle.radius;
        if (circle.y - circle.radius > canvas.height) circle.y = -circle.radius;
        if (circle.y + circle.radius < 0) circle.y = canvas.height + circle.radius;

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        ctx.fillStyle = `hsla(${circle.colorHue}, 70%, 50%, ${circle.opacity * 0.5})`;
        ctx.fill();
      });
    };

    // Start the animation
    animationFrameId = requestAnimationFrame(spawnCircle);

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