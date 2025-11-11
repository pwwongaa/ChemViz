import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SmilesDisplayProps {
  smiles: string;
  name: string;
}

export const SmilesDisplay = ({ smiles, name }: SmilesDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(smiles);
    setCopied(true);
    toast.success("SMILES notation copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-card border-border shadow-elevated">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          SMILES Notation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{name}</p>
          <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border border-border">
            <code className="flex-1 text-sm font-mono text-foreground break-all">
              {smiles}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-accent/10 rounded transition-smooth"
              title="Copy SMILES"
            >
              {copied ? (
                <Check className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
