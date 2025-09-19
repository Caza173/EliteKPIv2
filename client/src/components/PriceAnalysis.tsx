// components/PriceAnalysis.tsx
import * as React from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

// ===== Types =====
type Currency = number;

export interface Comp {
  id: string;
  address: string;
  mlsId?: string;
  listPrice: Currency;
  soldPrice?: Currency;       // undefined => Active/Pending
  listDate?: string;          // ISO
  closeDate?: string;         // ISO
  town?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
}

interface VarianceRow extends Comp {
  varianceAmt: number;        // sold - list
  variancePct: number | null; // null if soldPrice undefined or listPrice === 0
  status: "Closed" | "Pending/Active";
}

// ===== Sample Data (replace with your feed) =====
const SAMPLE: Comp[] = [
  // Closed sales with various variances
  { 
    id: "1", 
    address: "1736 Stockton Street, San Francisco, CA", 
    mlsId: "ML81920456",
    listPrice: 780000, 
    soldPrice: 765000, 
    listDate: "2025-07-15",
    closeDate: "2025-08-14",
    town: "San Francisco",
    beds: 3,
    baths: 2,
    sqft: 1850
  },
  { 
    id: "2", 
    address: "2847 Fillmore Street, Pacific Heights, CA", 
    mlsId: "ML81921134",
    listPrice: 960000, 
    soldPrice: 920000, 
    listDate: "2025-07-22",
    closeDate: "2025-08-28",
    town: "San Francisco",
    beds: 2,
    baths: 2,
    sqft: 1400
  },
  { 
    id: "3", 
    address: "25 S Mayhew Turnpike, Manchester, NH", 
    mlsId: "ML81922789",
    listPrice: 350000, 
    soldPrice: 360000, 
    listDate: "2025-08-10",
    closeDate: "2025-09-05",
    town: "Manchester",
    beds: 4,
    baths: 2,
    sqft: 2100
  },
  { 
    id: "4", 
    address: "142 Elm Street, Boston, MA", 
    mlsId: "ML81923456",
    listPrice: 725000, 
    soldPrice: 750000, 
    listDate: "2025-06-18",
    closeDate: "2025-07-22",
    town: "Boston",
    beds: 3,
    baths: 1,
    sqft: 1650
  },
  { 
    id: "5", 
    address: "89 Maple Avenue, Portland, OR", 
    mlsId: "ML81924123",
    listPrice: 485000, 
    soldPrice: 465000, 
    listDate: "2025-07-05",
    closeDate: "2025-08-10",
    town: "Portland",
    beds: 2,
    baths: 2,
    sqft: 1200
  },
  { 
    id: "6", 
    address: "567 Pine Street, Seattle, WA", 
    mlsId: "ML81924789",
    listPrice: 820000, 
    soldPrice: 835000, 
    listDate: "2025-08-01",
    closeDate: "2025-09-08",
    town: "Seattle",
    beds: 4,
    baths: 3,
    sqft: 2400
  },
  // Active listings (no sold price)
  { 
    id: "7", 
    address: "19 Oak Ridge Drive, Austin, TX", 
    mlsId: "ML81925234",
    listPrice: 595000,
    listDate: "2025-08-20",
    town: "Austin",
    beds: 3,
    baths: 2,
    sqft: 1900
  },
  { 
    id: "8", 
    address: "234 Harbor View Lane, Miami, FL", 
    mlsId: "ML81925567",
    listPrice: 1250000,
    listDate: "2025-09-01",
    town: "Miami",
    beds: 5,
    baths: 4,
    sqft: 3200
  },
  { 
    id: "9", 
    address: "88 Mountain View Road, Denver, CO", 
    mlsId: "ML81925890",
    listPrice: 675000,
    listDate: "2025-08-25",
    town: "Denver",
    beds: 3,
    baths: 2,
    sqft: 2000
  },
  // More closed sales for variety
  { 
    id: "10", 
    address: "456 Sunset Boulevard, Los Angeles, CA", 
    mlsId: "ML81926123",
    listPrice: 1100000, 
    soldPrice: 1080000, 
    listDate: "2025-06-10",
    closeDate: "2025-07-15",
    town: "Los Angeles",
    beds: 4,
    baths: 3,
    sqft: 2600
  },
  { 
    id: "11", 
    address: "321 River Road, Nashville, TN", 
    mlsId: "ML81926456",
    listPrice: 425000, 
    soldPrice: 440000, 
    listDate: "2025-07-12",
    closeDate: "2025-08-20",
    town: "Nashville",
    beds: 3,
    baths: 2,
    sqft: 1750
  },
  { 
    id: "12", 
    address: "777 State Street, Chicago, IL", 
    mlsId: "ML81926789",
    listPrice: 650000, 
    soldPrice: 620000, 
    listDate: "2025-08-05",
    closeDate: "2025-09-02",
    town: "Chicago",
    beds: 2,
    baths: 2,
    sqft: 1300
  }
];

// ===== Utils =====
const formatMoney = (n?: number) =>
  typeof n === "number" ? n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "—";

const formatPct = (n?: number | null) =>
  n === null || typeof n === "undefined" ? "—" : `${(n * 100).toFixed(1)}%`;

function computeVarianceRows(comps: Comp[]): VarianceRow[] {
  return comps
    .filter(c => typeof c.listPrice === "number" && c.listPrice > 0)
    .map(c => {
      const closed = typeof c.soldPrice === "number";
      const varianceAmt = closed ? (c.soldPrice! - c.listPrice) : 0;
      const variancePct = closed ? (c.listPrice ? varianceAmt / c.listPrice : null) : null;
      return {
        ...c,
        varianceAmt,
        variancePct,
        status: closed ? "Closed" : "Pending/Active",
      };
    });
}

function statusBadge(varianceAmt: number | undefined, status: VarianceRow["status"]) {
  if (status !== "Closed") return <Badge variant="secondary">Pending/Active</Badge>;
  if ((varianceAmt ?? 0) > 0) return <Badge className="bg-green-600 text-white hover:bg-green-600/90">Over Ask</Badge>;
  if ((varianceAmt ?? 0) < 0) return <Badge className="bg-red-600 text-white hover:bg-red-600/90">Under Ask</Badge>;
  return <Badge variant="outline">At Ask</Badge>;
}

// ===== Mini Chart for one property =====
function PropertyVarianceDetail({ comp }: { comp: VarianceRow | null }) {
  if (!comp) return null;

  const data = [
    { name: "List Price", value: comp.listPrice },
    ...(typeof comp.soldPrice === "number" ? [{ name: "Sold Price", value: comp.soldPrice }] : []),
  ];

  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-gray-900">{comp.address}</div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span>{comp.status}</span>
              {statusBadge(comp.varianceAmt, comp.status)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 font-medium">
              List: {formatMoney(comp.listPrice)}
            </span>
            <span className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 font-medium">
              Sold: {formatMoney(comp.soldPrice)}
            </span>
            {comp.status === "Closed" && (
              <span className={cn(
                "px-3 py-1 rounded-md font-medium",
                comp.varianceAmt > 0 ? "bg-green-100 text-green-800" : 
                comp.varianceAmt < 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
              )}>
                Δ: {formatMoney(comp.varianceAmt)} ({formatPct(comp.variancePct)})
              </span>
            )}
          </div>
        </div>

        <div className="h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <YAxis 
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <Tooltip 
                formatter={(v: number) => formatMoney(v)}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '6px',
                  color: '#374151'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Main Chart for all comps =====
function VarianceChart({ rows }: { rows: VarianceRow[] }) {
  const chartData = React.useMemo(
    () =>
      rows.map(r => ({
        address: r.address.length > 20 ? r.address.slice(0, 20) + "..." : r.address,
        list: r.listPrice,
        sold: typeof r.soldPrice === "number" ? r.soldPrice : undefined,
      })),
    [rows]
  );

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="address" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12, fill: '#374151' }}
          />
          <YAxis 
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12, fill: '#374151' }}
          />
          <Tooltip
            formatter={(v: any, name) => (typeof v === "number" ? formatMoney(v) : "—")}
            labelFormatter={(l) => l}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '6px',
              color: '#374151'
            }}
          />
          <Legend />
          <Bar dataKey="list" name="List Price" fill="#3b82f6" />
          <Bar dataKey="sold" name="Sold Price" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ===== Table =====
function VarianceTable({ rows }: { rows: VarianceRow[] }) {
  const [sortKey, setSortKey] = React.useState<keyof VarianceRow>("closeDate");
  const [asc, setAsc] = React.useState(false);

  const sorted = React.useMemo(() => {
    return [...rows].sort((a, b) => {
      const A = (a[sortKey] ?? 0) as any;
      const B = (b[sortKey] ?? 0) as any;
      if (A < B) return asc ? -1 : 1;
      if (A > B) return asc ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, asc]);

  const header = (label: string, key: keyof VarianceRow) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-gray-50 text-gray-700 font-semibold"
      onClick={() => {
        if (sortKey === key) setAsc(!asc);
        else { setSortKey(key); setAsc(false); }
      }}
    >
      {label} {sortKey === key ? (asc ? "↑" : "↓") : ""}
    </TableHead>
  );

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No property data available for analysis
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {header("Address", "address")}
            {header("List Price", "listPrice")}
            {header("Sold Price", "soldPrice")}
            {header("$ Variance", "varianceAmt")}
            {header("% Variance", "variancePct")}
            {header("Status", "status")}
            {header("Close Date", "closeDate")}
            <TableHead className="text-gray-700 font-semibold">Beds</TableHead>
            <TableHead className="text-gray-700 font-semibold">Baths</TableHead>
            <TableHead className="text-gray-700 font-semibold">SqFt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={r.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">{r.address}</TableCell>
              <TableCell className="text-gray-900">{formatMoney(r.listPrice)}</TableCell>
              <TableCell className="text-gray-900">{formatMoney(r.soldPrice)}</TableCell>
              <TableCell className={cn(
                "font-medium",
                (r.varianceAmt ?? 0) > 0 ? "text-green-700" : 
                (r.varianceAmt ?? 0) < 0 ? "text-red-700" : "text-gray-900"
              )}>
                {r.status === "Closed" ? formatMoney(r.varianceAmt) : "—"}
              </TableCell>
              <TableCell className={cn(
                "font-medium",
                r.variancePct !== null && r.variancePct > 0 ? "text-green-700" :
                r.variancePct !== null && r.variancePct < 0 ? "text-red-700" : "text-gray-900"
              )}>
                {formatPct(r.variancePct)}
              </TableCell>
              <TableCell>{statusBadge(r.varianceAmt, r.status)}</TableCell>
              <TableCell className="text-gray-900">{r.closeDate ?? "—"}</TableCell>
              <TableCell className="text-gray-900">{r.beds ?? "—"}</TableCell>
              <TableCell className="text-gray-900">{r.baths ?? "—"}</TableCell>
              <TableCell className="text-gray-900">{r.sqft?.toLocaleString() ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ===== Property Select =====
function PropertySelect({
  comps,
  value,
  onChange,
}: {
  comps: VarianceRow[];
  value: string; // "all" or comp.id
  onChange: (id: string) => void;
}) {
  return (
    <div className="w-full md:w-72">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select property" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All properties</SelectItem>
          {comps.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.address}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ===== Main Component =====
export default function PriceAnalysis({
  comps = SAMPLE,
  title = "Price Analysis",
  description = "Compare list vs sold prices and variance."
}: {
  comps?: Comp[];
  title?: string;
  description?: string;
}) {
  const rows = React.useMemo(() => computeVarianceRows(comps), [comps]);
  const [selectedId, setSelectedId] = React.useState<string>("all");
  const [showTable, setShowTable] = React.useState(false);
  
  const selected = React.useMemo(
    () => (selectedId === "all" ? null : rows.find(r => r.id === selectedId) ?? null),
    [rows, selectedId]
  );

  const displayRows = selectedId === "all" ? rows : (selected ? [selected] : []);

  return (
    <Card className="border border-gray-200">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-gray-50/50">
        <div>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <span>{title}</span>
          </CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </div>
        <div className="flex gap-2">
          <PropertySelect comps={rows} value={selectedId} onChange={setSelectedId} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Per-property detail panel (only when a property is selected) */}
        {selected && <PropertyVarianceDetail comp={selected} />}

        {/* Main chart */}
        {displayRows.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedId === "all" ? "All Properties" : "Selected Property"}
              </h3>
              <button
                onClick={() => setShowTable(!showTable)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                {showTable ? "Hide Details" : "Show Details"}
              </button>
            </div>
            <VarianceChart rows={displayRows} />
          </div>
        )}

        {/* Table (conditionally shown) */}
        {showTable && displayRows.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
            <VarianceTable rows={displayRows} />
          </div>
        )}

        {/* No data message */}
        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No Properties Available</p>
            <p className="text-sm">Add some properties to see price analysis data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
