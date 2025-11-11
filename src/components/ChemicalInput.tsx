import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ChemicalInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const ChemicalInput = ({ onSearch, isLoading }: ChemicalInputProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter chemical name (e.g., caffeine, aspirin, glucose)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-card border-border shadow-soft transition-smooth focus:shadow-elevated"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="bg-gradient-primary shadow-soft hover:shadow-elevated transition-smooth"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>
    </form>
  );
};
