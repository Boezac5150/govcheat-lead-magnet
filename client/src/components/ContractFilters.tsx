import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, X } from "lucide-react";

export interface ContractFilterState {
  contractType?: string;
  minValue?: number;
  maxValue?: number;
  difficulty?: string;
  agency?: string;
  setAside?: string;
  sortBy?: "newest" | "value-asc" | "value-desc" | "deadline" | "difficulty";
}

interface ContractFiltersProps {
  filters: ContractFilterState;
  onFiltersChange: (filters: ContractFilterState) => void;
  onReset: () => void;
}

export function ContractFilters({ filters, onFiltersChange, onReset }: ContractFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof ContractFilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined).length;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10"
      >
        <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        Filters & Sort {activeFilterCount > 0 && <span className="ml-2 bg-[#00FF88] text-[#0A0E17] px-2 py-0.5 rounded text-xs font-bold">{activeFilterCount}</span>}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Filter & Sort Options
              {activeFilterCount > 0 && (
                <Button
                  onClick={onReset}
                  variant="ghost"
                  size="sm"
                  className="text-[#00FF88] hover:bg-[#00FF88]/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contract Type */}
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Contract Type</label>
              <select
                value={filters.contractType || ""}
                onChange={(e) => handleFilterChange("contractType", e.target.value)}
                className="w-full bg-[#1a1f2e] border border-[#00FF88]/20 text-white px-3 py-2 rounded focus:outline-none focus:border-[#00FF88]"
              >
                <option value="">All Types</option>
                <option value="software">Software Development</option>
                <option value="consulting">Consulting</option>
                <option value="construction">Construction</option>
                <option value="supplies">Office Supplies</option>
                <option value="services">Professional Services</option>
                <option value="training">Training</option>
              </select>
            </div>

            {/* Contract Value Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Min Value ($)</label>
                <input
                  type="number"
                  value={filters.minValue || ""}
                  onChange={(e) => handleFilterChange("minValue", e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full bg-[#1a1f2e] border border-[#00FF88]/20 text-white px-3 py-2 rounded focus:outline-none focus:border-[#00FF88]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Max Value ($)</label>
                <input
                  type="number"
                  value={filters.maxValue || ""}
                  onChange={(e) => handleFilterChange("maxValue", e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="999999"
                  className="w-full bg-[#1a1f2e] border border-[#00FF88]/20 text-white px-3 py-2 rounded focus:outline-none focus:border-[#00FF88]"
                />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Difficulty</label>
              <select
                value={filters.difficulty || ""}
                onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                className="w-full bg-[#1a1f2e] border border-[#00FF88]/20 text-white px-3 py-2 rounded focus:outline-none focus:border-[#00FF88]"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy (Beginner-friendly)</option>
                <option value="medium">Medium (Some experience needed)</option>
                <option value="hard">Hard (Competitive)</option>
              </select>
            </div>

            {/* Agency */}
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Government Agency</label>
              <select
                value={filters.agency || ""}
                onChange={(e) => handleFilterChange("agency", e.target.value)}
                className="w-full bg-[#1a1f2e] border border-[#00FF88]/20 text-white px-3 py-2 rounded focus:outline-none focus:border-[#00FF88]"
              >
                <option value="">All Agencies</option>
                <option value="DoD">Department of Defense</option>
                <option value="GSA">General Services Administration</option>
                <option value="VA">Veterans Affairs</option>
                <option value="Commerce">Department of Commerce</option>
                <option value="HHS">Health & Human Services</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Set-Aside */}
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Set-Aside Type</label>
              <select
                value={filters.setAside || ""}
                onChange={(e) => handleFilterChange("setAside", e.target.value)}
                className="w-full bg-[#1a1f2e] border border-[#00FF88]/20 text-white px-3 py-2 rounded focus:outline-none focus:border-[#00FF88]"
              >
                <option value="">All Set-Asides</option>
                <option value="small-business">Small Business</option>
                <option value="8a">8(a) Program</option>
                <option value="hubzone">HUBZone</option>
                <option value="wosb">Women-Owned Small Business</option>
                <option value="vosb">Veteran-Owned Small Business</option>
                <option value="none">No Set-Aside</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Sort By</label>
              <select
                value={filters.sortBy || "newest"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full bg-[#1a1f2e] border border-[#00FF88]/20 text-white px-3 py-2 rounded focus:outline-none focus:border-[#00FF88]"
              >
                <option value="newest">Newest First</option>
                <option value="value-asc">Value: Low to High</option>
                <option value="value-desc">Value: High to Low</option>
                <option value="deadline">Deadline: Soonest First</option>
                <option value="difficulty">Difficulty: Easiest First</option>
              </select>
            </div>

            {/* Apply Button */}
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#00FF88] text-[#0A0E17] hover:bg-[#00FF88]/90 font-bold"
            >
              Apply Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
