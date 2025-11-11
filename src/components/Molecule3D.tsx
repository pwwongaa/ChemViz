import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Loader2, Tag } from "lucide-react";

interface Molecule3DProps {
  smiles: string;
}

declare global {
  interface Window {
    $3Dmol: any;
  }
}

// Load 3Dmol script once globally
if (typeof window !== 'undefined' && !window.$3Dmol) {
  const script = document.createElement("script");
  script.src = "https://3dmol.csb.pitt.edu/build/3Dmol-min.js";
  script.async = true;
  document.head.appendChild(script);
}

export const Molecule3D = ({ smiles }: Molecule3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const isDraggingRef = useRef(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!containerRef.current || !smiles) return;

    setIsLoading(true);
    setError(null);

    const initViewer = async () => {
      // Wait for 3Dmol to load
      if (typeof window.$3Dmol === "undefined") {
        setTimeout(initViewer, 100);
        return;
      }

      try {
        // Clear previous viewer
        if (viewerRef.current) {
          try { viewerRef.current.clear(); } catch {}
        }

        // Prefer 3D conformer; fallback to 2D SDF
        const base = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}`;
        const tryUrls = [
          `${base}/record/SDF?record_type=3d`,
          `${base}/SDF?record_type=3d`,
          `${base}/SDF`
        ];
        let sdfData = "";
        for (const url of tryUrls) {
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            if (text && text.includes("M  END")) {
              sdfData = text;
              break;
            }
          }
        }
        if (!sdfData) {
          throw new Error("No SDF data available");
        }

        // Create viewer with proper config
        const config = { 
          backgroundColor: 'white',
          antialias: true
        };
        
        // Clear container and create new viewer
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          viewerRef.current = window.$3Dmol.createViewer(containerRef.current, config);
          
          // Add model and style
          viewerRef.current.addModel(sdfData, "sdf");
          viewerRef.current.setStyle({}, { 
            stick: { colorscheme: "Jmol", radius: 0.2 },
            sphere: { scale: 0.25 }
          });
          
          viewerRef.current.zoomTo();
          viewerRef.current.render();
          viewerRef.current.spin('y', 0.5); // Half speed spinning
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading 3D structure:", error);
        setError("Unable to load 3D structure");
        setIsLoading(false);
      }
    };

    initViewer();

    const handleResize = () => {
      if (viewerRef.current) {
        try { viewerRef.current.resize(); viewerRef.current.render(); } catch {}
      }
    };
    
    const handleMouseDown = () => {
      isDraggingRef.current = true;
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      if (viewerRef.current) {
        viewerRef.current.spin(false);
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      // Resume spinning after 1 second of no interaction
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      dragTimeoutRef.current = setTimeout(() => {
        if (viewerRef.current && !isDraggingRef.current) {
          viewerRef.current.spin('y', 0.5);
        }
      }, 1000);
    };
    
    window.addEventListener('resize', handleResize);
    
    if (containerRef.current) {
      containerRef.current.addEventListener('mousedown', handleMouseDown);
      containerRef.current.addEventListener('touchstart', handleMouseDown);
      containerRef.current.addEventListener('mouseup', handleMouseUp);
      containerRef.current.addEventListener('touchend', handleMouseUp);
      containerRef.current.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      if (containerRef.current) {
        const container = containerRef.current;
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('touchstart', handleMouseDown);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('touchend', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseUp);
      }
      if (viewerRef.current) {
        try { viewerRef.current.clear(); } catch {}
      }
    };
  }, [smiles]);

  // Handle label toggling
  useEffect(() => {
    if (!viewerRef.current) return;

    try {
      // Remove all existing labels
      viewerRef.current.removeAllLabels();

      if (showLabels) {
        // Add labels
        const model = viewerRef.current.getModel(0);
        if (model) {
          const atoms = model.selectedAtoms({});
          atoms.forEach((atom: any) => {
            viewerRef.current.addLabel(atom.elem, {
              position: atom,
              backgroundColor: 'rgba(0,0,0,0.7)',
              fontColor: 'white',
              fontSize: 12,
              showBackground: true,
              backgroundOpacity: 0.7
            });
          });
        }
      }

      viewerRef.current.render();
    } catch (e) {
      console.error("Error toggling labels:", e);
    }
  }, [showLabels]);

  return (
    <Card className="bg-card border-border shadow-elevated h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            3D Interactive Model
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
            className="gap-2"
          >
            <Tag className="w-4 h-4" />
            {showLabels ? "Hide" : "Show"} Atoms
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] bg-white rounded-lg border border-border overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <p className="text-muted-foreground text-center">{error}</p>
            </div>
          )}
          <div 
            ref={containerRef}
            className="w-full h-full"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Click and drag to rotate • Scroll to zoom
        </p>
      </CardContent>
    </Card>
  );
};
