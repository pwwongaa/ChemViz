import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface PropertiesTableProps {
  smiles: string;
}

interface Properties {
  molecularFormula?: string;
  molecularWeight?: string;
  iupacName?: string;
  boilingPoint?: string;
  meltingPoint?: string;
  density?: string;
  solubility?: string;
}

export const PropertiesTable = ({ smiles }: PropertiesTableProps) => {
  const [properties, setProperties] = useState<Properties | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        // First get the CID from SMILES
        const cidResponse = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/cids/JSON`
        );
        const cidData = await cidResponse.json();
        const cid = cidData.IdentifierList.CID[0];

        // Fetch properties
        const propsResponse = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`
        );
        const propsData = await propsResponse.json();
        const compound = propsData.PropertyTable.Properties[0];

        setProperties({
          molecularFormula: compound.MolecularFormula,
          molecularWeight: compound.MolecularWeight ? `${parseFloat(compound.MolecularWeight).toFixed(2)} g/mol` : undefined,
          iupacName: compound.IUPACName,
        });
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (smiles) {
      fetchProperties();
    }
  }, [smiles]);

  return (
    <Card className="bg-card border-border shadow-elevated">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Chemical Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : properties ? (
          <Table>
            <TableBody>
              {properties.molecularFormula && (
                <TableRow>
                  <TableCell className="font-medium text-foreground">Molecular Formula</TableCell>
                  <TableCell className="text-muted-foreground">{properties.molecularFormula}</TableCell>
                </TableRow>
              )}
              {properties.molecularWeight && (
                <TableRow>
                  <TableCell className="font-medium text-foreground">Molecular Weight</TableCell>
                  <TableCell className="text-muted-foreground">{properties.molecularWeight}</TableCell>
                </TableRow>
              )}
              {properties.iupacName && (
                <TableRow>
                  <TableCell className="font-medium text-foreground">IUPAC Name</TableCell>
                  <TableCell className="text-muted-foreground">{properties.iupacName}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">Unable to load properties</p>
        )}
      </CardContent>
    </Card>
  );
};
