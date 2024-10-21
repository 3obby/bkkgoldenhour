import React, { useEffect, useRef } from 'react';

export default function EmojiIcon({ iconIndex, setIconIndex, icons }) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    function updateIcon() {
      if (!isMounted) return;

      // Update icon index
      setIconIndex((prevIndex) => (prevIndex + 1) % icons.length);

      // Calculate new delay for cyclic timing (fast to slow to fast)
      const maxDelay = 300; // Maximum delay in ms
      const minDelay = 3;   // Minimum delay in ms
      const period = 5000;  // Full cycle period in ms
      const time = Date.now() % period;
      const sineValue = Math.sin((2 * Math.PI * time) / period); // Ranges from -1 to 1
      const newDelay = minDelay + ((maxDelay - minDelay) * (1 - sineValue) / 2);

      // Schedule next update
      timeoutRef.current = setTimeout(updateIcon, newDelay);
    }

    // Start the animation
    timeoutRef.current = setTimeout(updateIcon, 200); // Initial delay

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [setIconIndex, icons.length]);

  return (
    <>
      <div className="emoji-icon-container">
        {/* Custom Dotted Circle with SVG */}
        <svg
          className="dotted-circle-svg"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="15,5"  /* Adjust lengths: 15 units dash, 5 units gap */
          />
        </svg>
        <span className="emoji-icon">{icons[iconIndex]}</span>
      </div>
      <style jsx>{`
        .emoji-icon-container {
          position: fixed; /* Fixed positioning relative to the viewport */
          bottom: 20px;    /* 20px from the bottom of the viewport */
          left: 20px;      /* 20px from the left of the viewport */
          width: 4em;
          height: 4em;
          z-index: 1000;   /* Ensure it stays above other elements */
        }

        .emoji-icon {
          font-size: 4em;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: float 4s ease-in-out infinite, rotate 8s ease-in-out infinite;
          transform-origin: center;
          z-index: 1;
        }

        /* Dotted Circle SVG */
        .dotted-circle-svg {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%);
          transform-origin: center;
          animation: spin 20s linear infinite;
          z-index: 0;
        }

        @keyframes spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-10px);
          }
        }

        @keyframes rotate {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(-10deg);
          }
          50% {
            transform: translate(-50%, -50%) rotate(10deg);
          }
        }
      `}</style>
    </>
  );
}
