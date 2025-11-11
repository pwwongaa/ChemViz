import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface Molecule2DProps {
  smiles: string;
}

export const Molecule2D = ({ smiles }: Molecule2DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formulaType, setFormulaType] = useState<"skeletal" | "full">("skeletal");

  useEffect(() => {
    if (!containerRef.current || !smiles) return;

    // Using PubChem's structure image service
    const img = document.createElement("img");
    // For skeletal: default rendering
    // For full: add atom_label=1 parameter to show all atoms
    const labelParam = formulaType === "full" ? "&atom_label=1" : "";
    img.src = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/PNG?image_size=500x500${labelParam}`;
    img.alt = "2D Molecular Structure";
    img.className = "w-full h-full object-contain";
    img.onerror = () => {
      containerRef.current!.innerHTML = '<p class="text-muted-foreground text-center">Unable to load 2D structure</p>';
    };

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(img);
  }, [smiles, formulaType]);

  return (
    <Card className="bg-card border-border shadow-elevated h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            2D Structure
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={formulaType === "skeletal" ? "default" : "outline"}
              onClick={() => setFormulaType("skeletal")}
            >
              Skeletal
            </Button>
            <Button
              size="sm"
              variant={formulaType === "full" ? "default" : "outline"}
              onClick={() => setFormulaType("full")}
            >
              Full
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="w-full h-[400px] bg-white rounded-lg border border-border flex items-center justify-center"
        >
          <p className="text-muted-foreground">Loading 2D structure...</p>
        </div>
      </CardContent>
    </Card>
  );
};
