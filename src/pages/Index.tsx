import { useState } from "react";
import { ChemicalInput } from "@/components/ChemicalInput";
import { SmilesDisplay } from "@/components/SmilesDisplay";
import { Molecule2D } from "@/components/Molecule2D";
import { Molecule3D } from "@/components/Molecule3D";
import { PropertiesTable } from "@/components/PropertiesTable";
import { Atom, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MoleculeData {
  name: string;
  smiles: string;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [moleculeData, setMoleculeData] = useState<MoleculeData | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setMoleculeData(null);

    try {
      // Fetch compound data from PubChem
      const response = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/CanonicalSMILES,IUPACName/JSON`
      );

      if (!response.ok) {
        throw new Error("Compound not found");
      }

      const data = await response.json();
      const compound = data.PropertyTable.Properties[0];

      setMoleculeData({
        name: compound.IUPACName || query,
        smiles: compound.CanonicalSMILES || compound.ConnectivitySMILES,
      });

      toast.success(`Found: ${compound.IUPACName || query}`);
    } catch (error) {
      console.error("Error fetching compound:", error);
      toast.error("Could not find compound. Try another name.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ChemViz</h1>
              <p className="text-sm text-muted-foreground">
                Molecular Structure Visualization
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search Section */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-elevated">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Search Compound
            </h2>
            <ChemicalInput onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Results */}
          {moleculeData && !isLoading && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* SMILES Display */}
              <SmilesDisplay smiles={moleculeData.smiles} name={moleculeData.name} />

              {/* Properties Table */}
              <PropertiesTable smiles={moleculeData.smiles} />

              {/* Visualizations Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Molecule2D smiles={moleculeData.smiles} />
                <Molecule3D smiles={moleculeData.smiles} />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!moleculeData && !isLoading && (
            <div className="text-center py-16 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full">
                <Atom className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Ready to explore chemistry
                </h3>
                <p className="text-muted-foreground">
                  Enter a chemical compound name to visualize its molecular structure
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {["Caffeine", "Aspirin", "Glucose", "Ethanol"].map((example) => (
                  <button
                    key={example}
                    onClick={() => handleSearch(example)}
                    className="px-4 py-2 bg-muted hover:bg-accent/10 text-foreground rounded-lg border border-border transition-smooth text-sm"
                  >
                    Try: {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="container mx-auto px-4 py-6 space-y-1">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved • Developed by Lovable AI • For educational use only
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Powered by PubChem & 3Dmol.js
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
