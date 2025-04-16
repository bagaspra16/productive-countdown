import React, { useEffect, useRef, useState } from 'react';

// Define the types of productivity icons we'll use
const PRODUCTIVITY_ICONS = [
  'clock',
  'calendar',
  'checkmark',
  'task',
  'star',
  'bulb',
  'graph',
  'trophy',
  'target',
  'rocket',
];

// Icon animation properties
interface FloatingIcon {
  id: number;
  type: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  speed: number;
  delay: number;
  color: string;
  direction: number; // 1 for up, -1 for down
}

const AnimatedBackground: React.FC = () => {
  const [icons, setIcons] = useState<FloatingIcon[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientStep = useRef(0);

  // Generate random colors within our theme
  const getRandomColor = () => {
    const colors = [
      'rgba(59, 130, 246, 0.5)', // primary (blue)
      'rgba(16, 185, 129, 0.5)', // secondary (green)
      'rgba(139, 92, 246, 0.5)', // info (purple)
      'rgba(245, 158, 11, 0.5)', // warning (amber)
      'rgba(34, 197, 94, 0.5)', // success (green)
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Initialize floating icons
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      const newIcons: FloatingIcon[] = [];
      const count = Math.min(40, Math.floor((width * height) / 15000)); // More icons, responsive to screen size
      
      for (let i = 0; i < count; i++) {
        newIcons.push({
          id: i,
          type: PRODUCTIVITY_ICONS[Math.floor(Math.random() * PRODUCTIVITY_ICONS.length)],
          x: Math.random() * width,
          y: Math.random() * height,
          size: 16 + Math.random() * 24, // 16-40px
          opacity: 0.1 + Math.random() * 0.25, // 0.1-0.35
          rotation: Math.random() * 360,
          speed: 0.4 + Math.random() * 1.2,
          delay: Math.random() * 5000,
          color: getRandomColor(),
          direction: Math.random() > 0.5 ? 1 : -1,
        });
      }
      
      setIcons(newIcons);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Animation loop for icons and gradient
  useEffect(() => {
    if (!icons.length) return;
    
    let lastTimestamp = 0;
    const animate = (timestamp: number) => {
      if (!containerRef.current) return;
      
      // Only update every 40ms for better performance
      if (timestamp - lastTimestamp > 40) {
        lastTimestamp = timestamp;
        
        const { height } = containerRef.current.getBoundingClientRect();
        
        // Update gradient animation - slower to be more subtle
        gradientStep.current = (gradientStep.current + 0.1) % 360;
        containerRef.current.style.background = `
          linear-gradient(
            ${gradientStep.current}deg,
            rgba(15, 23, 42, 1) 0%,
            rgba(30, 41, 59, 0.95) 40%,
            rgba(51, 65, 85, 0.85) 70%,
            rgba(15, 23, 42, 0.95) 100%
          )
        `;
        
        // Update icons
        setIcons(prevIcons => 
          prevIcons.map(icon => {
            // Apply movement pattern with delay
            const now = timestamp % 10000;
            const active = now > icon.delay;
            
            // Calculate new position with bounds checking
            let newY = icon.y;
            if (active) {
              newY = icon.y - (icon.speed * icon.direction);
              
              // Reverse direction if it hits boundaries
              if (newY < -50 || newY > height + 50) {
                icon.direction *= -1;
                newY = icon.y + (icon.speed * icon.direction);
              }
            }
            
            // Apply slight horizontal movement and rotation
            const newX = icon.x + Math.sin(timestamp / 1000 + icon.id) * 0.8;
            const newRotation = icon.rotation + 0.2;
            
            return {
              ...icon,
              x: newX,
              y: newY,
              rotation: newRotation,
            };
          })
        );
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [icons.length]);

  // Render the appropriate SVG icon based on type
  const renderIcon = (type: string, color: string) => {
    switch (type) {
      case 'clock':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-18c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm1 8V7h-2v6h5v-2h-3z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 12h5v5H7v-5z" />
          </svg>
        );
      case 'checkmark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        );
      case 'task':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
      case 'star':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      case 'bulb':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
          </svg>
        );
      case 'graph':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
          </svg>
        );
      case 'trophy':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
          </svg>
        );
      case 'target':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
          </svg>
        );
      case 'rocket':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M12 2.5s4.5 2.04 4.5 10.5c0 2.49-1.04 5.57-1.6 7H9.1c-.56-1.43-1.6-4.51-1.6-7C7.5 4.54 12 2.5 12 2.5zm2 8.5c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-6.31 9.52c-.48-1.23-1.52-4.17-1.67-6.87L4 15v7l3.69-1.48zM20 22v-7l-2.02-1.35c-.15 2.69-1.2 5.64-1.67 6.87L20 22z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-8c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z" />
          </svg>
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 transition-colors duration-1000"
      style={{ 
        backgroundSize: '400% 400%', 
        backgroundPosition: 'center center'
      }}
    >
      {/* Dynamic moving gradient will be applied via inline style in the animation loop */}
      
      {/* Floating icons */}
      {icons.map((icon) => (
        <div
          key={icon.id}
          className="absolute pointer-events-none transition-transform duration-300"
          style={{
            left: `${icon.x}px`,
            top: `${icon.y}px`,
            width: `${icon.size}px`,
            height: `${icon.size}px`,
            opacity: icon.opacity,
            transform: `rotate(${icon.rotation}deg)`,
            zIndex: 1,
            filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.2))',
          }}
        >
          {renderIcon(icon.type, icon.color)}
        </div>
      ))}
      
      {/* Glow effects */}
      <div className="absolute top-0 left-0 w-1/2 h-2/5 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/4 right-1/4 w-1/3 h-1/3 bg-info/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/3 left-1/4 w-1/3 h-1/2 bg-success/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
    </div>
  );
};

export default AnimatedBackground; 