
import { useEffect, useRef, useState } from 'react';
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
          startOnLoad: true,
          logLevel: 'warn', // Use log level string for better error handling
        });
  
        if (mermaidRef.current) {
          try {
            const svgCode = await mermaid.render('mermaidChartId', chartCode);
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = typeof svgCode === 'string' ? svgCode : '';
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