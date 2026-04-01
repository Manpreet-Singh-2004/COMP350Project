import {
  getProducts,
  getCategories,
  getSummary,
  getRecentActivity,
  getStoreInfo,
} from "@/lib/inventory";
import { ProductStatus } from "@/lib/inventory";

function StatusBadge({ status }: { status: ProductStatus }) {
  const styles: Record<ProductStatus, string> = {
    ok: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    low: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    out: "bg-red-50 text-red-700 ring-1 ring-red-200",
  };
  const labels: Record<ProductStatus, string> = {
    ok: "In Stock",
    low: "Low Stock",
    out: "Out of Stock",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function StockBar({
  stock,
  reorderPoint,
  safetyStock,
}: {
  stock: number;
  reorderPoint: number;
  safetyStock: number;
}) {
  const max = reorderPoint * 2.5;
  const pct = Math.min((stock / max) * 100, 100);
  const safetyPct = (safetyStock / max) * 100;
  const reorderPct = (reorderPoint / max) * 100;

  const barColor =
    stock === 0
      ? "bg-red-500"
      : stock <= safetyStock
        ? "bg-amber-400"
        : "bg-emerald-500";

  return (
    <div className="relative h-1.5 w-24 rounded-full bg-zinc-100 overflow-visible">
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-all ${barColor}`}
        style={{ width: `${pct}%` }}
      />
      {/* Safety stock marker */}
      <div
        className="absolute top-[-3px] h-[9px] w-px bg-amber-500 opacity-70"
        style={{ left: `${safetyPct}%` }}
      />
      {/* Reorder point marker */}
      <div
        className="absolute top-[-3px] h-[9px] w-px bg-zinc-400"
        style={{ left: `${reorderPct}%` }}
      />
    </div>
  );
}

export default function ManagerDashboard() {
  const store = getStoreInfo();
  const summary = getSummary();
  const products = getProducts();
  const categories = getCategories();
  const activity = getRecentActivity();

  const alertProducts = products.filter(
    (p) => p.status === "out" || p.status === "low"
  );

  const syncTime = new Date(store.lastSync).toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
        <div className="mx-auto max-w-screen-xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-400 uppercase tracking-widest">
                Stock‑Sync Pro
              </span>
            </div>
            <span className="text-zinc-700">|</span>
            <span className="text-sm text-zinc-300">Command Centre</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <span>{store.location}</span>
            <span>Manager: {store.manager}</span>
            <span>Last sync {syncTime}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-screen-xl px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-5 gap-3">
          {[
            {
              label: "Total SKUs",
              value: summary.totalSKUs,
              sub: "active items",
              accent: "text-zinc-100",
            },
            {
              label: "Low Stock",
              value: summary.lowStockItems,
              sub: "items below reorder pt",
              accent: "text-amber-400",
            },
            {
              label: "Out of Stock",
              value: summary.outOfStockItems,
              sub: "items — action required",
              accent: "text-red-400",
            },
            {
              label: "Inventory Value",
              value: `$${summary.totalValue.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              sub: "CAD estimated",
              accent: "text-emerald-400",
            },
            {
              label: "Pending POs",
              value: summary.pendingOrders,
              sub: "purchase orders",
              accent: "text-sky-400",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-4"
            >
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                {kpi.label}
              </p>
              <p className={`text-2xl font-bold tabular-nums ${kpi.accent}`}>
                {kpi.value}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Main SKU Table — spans 2 cols */}
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                SKU Performance
              </h2>
              <span className="text-xs text-zinc-500">{products.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                    <th className="text-left px-5 py-2.5 font-medium">SKU</th>
                    <th className="text-left px-3 py-2.5 font-medium">Name</th>
                    <th className="text-left px-3 py-2.5 font-medium">Category</th>
                    <th className="text-right px-3 py-2.5 font-medium">Stock</th>
                    <th className="text-left px-4 py-2.5 font-medium">Level</th>
                    <th className="text-right px-3 py-2.5 font-medium">Velocity/wk</th>
                    <th className="text-right px-3 py-2.5 font-medium">Price</th>
                    <th className="text-center px-3 py-2.5 font-medium">Status</th>
                    <th className="text-right px-5 py-2.5 font-medium">Lead</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        product.status === "out"
                          ? "bg-red-950/20"
                          : product.status === "low"
                            ? "bg-amber-950/10"
                            : ""
                      }`}
                    >
                      <td className="px-5 py-2.5 text-zinc-500 font-mono">
                        {product.id}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-200 max-w-[160px] truncate">
                        {product.name}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-500">
                        {product.category}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-zinc-200">
                        {product.stock}
                      </td>
                      <td className="px-4 py-2.5">
                        <StockBar
                          stock={product.stock}
                          reorderPoint={product.reorderPoint}
                          safetyStock={product.safetyStock}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-zinc-400">
                        {product.weeklyVelocity}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-5 py-2.5 text-right text-zinc-500">
                        {product.leadTimeDays}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Alerts panel */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                  Action Required
                </h2>
                <span className="rounded-full bg-red-900/60 text-red-300 text-xs px-2 py-0.5">
                  {alertProducts.length}
                </span>
              </div>
              <ul className="divide-y divide-zinc-800">
                {alertProducts.map((p) => (
                  <li key={p.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-zinc-300 leading-snug">
                          {p.name}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5">
                          {p.id} · {p.vendor}
                        </p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                      <span>
                        Stock:{" "}
                        <span className={p.stock === 0 ? "text-red-400" : "text-amber-400"}>
                          {p.stock}
                        </span>
                      </span>
                      <span>Reorder at: {p.reorderPoint}</span>
                      <span>Lead: {p.leadTimeDays}d</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category breakdown */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                  Categories
                </h2>
              </div>
              <ul className="divide-y divide-zinc-800">
                {categories.map((cat) => {
                  const pct = (cat.value / summary.totalValue) * 100;
                  return (
                    <li key={cat.id} className="px-4 py-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-zinc-300">{cat.name}</span>
                        <span className="text-zinc-500">{cat.skuCount} SKUs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-sky-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-zinc-500 w-16 text-right">
                          ${(cat.value / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Activity feed */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                  Recent Activity
                </h2>
              </div>
              <ul className="divide-y divide-zinc-800">
                {activity.map((item) => {
                  const icons = {
                    restock: "↑",
                    alert: "!",
                    sale: "↓",
                  };
                  const colors = {
                    restock: "text-emerald-400",
                    alert: "text-amber-400",
                    sale: "text-sky-400",
                  };
                  const time = new Date(item.timestamp).toLocaleTimeString(
                    "en-CA",
                    { hour: "2-digit", minute: "2-digit" }
                  );
                  return (
                    <li key={item.id} className="px-4 py-2.5 flex items-start gap-3">
                      <span
                        className={`text-sm font-bold w-4 mt-0.5 ${colors[item.type]}`}
                      >
                        {icons[item.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-300 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5">
                          {item.message ??
                            (item.quantity
                              ? `${item.type === "restock" ? "+" : "-"}${item.quantity} units`
                              : "")}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-600 shrink-0">{time}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}