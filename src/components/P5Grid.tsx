import React, { useRef, useEffect, useState } from "react";
import p5 from "p5";

const P5Grid: React.FC<{ cursorRange?: number }> = ({ cursorRange = 200 }) => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const p5InstanceRef = useRef<p5 | null>(null);
  const isMouseOverCanvasRef = useRef<boolean>(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (sketchRef.current) {
        setDimensions({
          width: sketchRef.current.clientWidth,
          height: sketchRef.current.clientHeight,
        });
      }
    };

    const sketch = (p: p5) => {
      const xScale = 0.015;
      const yScale = 0.02;
      const gap = 20;
      const maxExpansion = 1.5; // Maximum expansion factor

      p.setup = () => {
        const canvas = p.createCanvas(dimensions.width, dimensions.height);
        canvas.mouseOver(() => {
          isMouseOverCanvasRef.current = true;
        });
        canvas.mouseOut(() => {
          isMouseOverCanvasRef.current = false;
        });
      };

      p.draw = () => {
        p.background(245, 239, 255);
        p.noStroke();

        for (let x = gap / 2; x < p.width; x += gap) {
          for (let y = gap / 2; y < p.height; y += gap) {
            const noiseValue = p.noise(
              x * xScale,
              y * yScale,
              p.frameCount * 0.01
            );
            let diameter = noiseValue * gap;

            if (isMouseOverCanvasRef.current) {
              // Calculate distance from mouse
              const d = p.dist(x, y, p.mouseX, p.mouseY);

              // Expand circle based on mouse proximity, using cursorRange
              const expansionFactor = p.map(
                d,
                0,
                cursorRange,
                maxExpansion,
                1,
                true
              );
              diameter *= expansionFactor;
            }

            p.fill(205, 193, 255); // Circle color
            p.circle(x, y, diameter);
          }
        }
      };

      p.windowResized = () => {
        updateDimensions();
      };
    };

    updateDimensions();
    if (sketchRef.current && !p5InstanceRef.current) {
      p5InstanceRef.current = new p5(sketch, sketchRef.current);
    }

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      p5InstanceRef.current?.remove();
      p5InstanceRef.current = null;
    };
  }, [cursorRange, dimensions.height, dimensions.width]);

  useEffect(() => {
    if (
      p5InstanceRef.current &&
      dimensions.width > 0 &&
      dimensions.height > 0
    ) {
      p5InstanceRef.current.resizeCanvas(dimensions.width, dimensions.height);
    }
  }, [dimensions]);

  return (
    <div ref={sketchRef} style={{ width: "100%", height: "100vh" }}>
      {dimensions.width === 0 && <p>Loading...</p>}
    </div>
  );
};

export default P5Grid;
