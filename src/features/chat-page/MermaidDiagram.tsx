import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chartCode: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chartCode }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const renderMermaid = async () => {
      mermaid.initialize({
        startOnLoad: false,
        logLevel: 'warn', // Use logLevel for better error handling
      });

      const elementId = `mermaid-${Math.random().toString(36).substr(2, 9)}`; // Unique ID for the diagram

      if (mermaidRef.current) {
        try {
          // Using callback method according to Mermaid's latest documentation at the time of writing
          const svgContainer = document.createElement('div');
          mermaid.render(elementId, chartCode, svgContainer);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svgContainer.innerHTML;
            setLoaded(true);
          }
        } catch (err) {
          console.error('Mermaid diagram rendering failed', err);
        }
      }
    };

    renderMermaid();
  }, [chartCode]);

  if (!loaded) {
    return <div>Loading Mermaid diagram...</div>;
  }

  return (
    <div>
      <div ref={mermaidRef} />
    </div>
  );
};

export default MermaidDiagram;
