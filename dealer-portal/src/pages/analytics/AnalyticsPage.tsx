import { TrendingUp, Eye, MessageSquare, Home, IndianRupee } from "lucide-react";
import { usePropertyStore } from "../../store/usePropertyStore";

function MetricCard({ label, value, icon: Icon, sub }: { label: string; value: string; icon: React.ElementType; sub?: string }) {
  return (
    <div className="dp-card p-5 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#5b21b6]/10 border border-[rgba(91,33,182,0.12)] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#5b21b6]" />
        </div>
        <p className="text-xs font-black text-[#111111]/40 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-black text-[#111111] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>{value}</p>
      {sub && <p className="text-xs font-bold text-emerald-600 mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
            style={{ height: `${(d.value / max) * 100}%`, background: "linear-gradient(to top, #5b21b6, rgba(91,33,182,0.4))", border: "1px solid rgba(91,33,182,0.2)" }}
          />
          <span className="text-[10px] font-bold text-[#111111]/30">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const MONTHLY_VIEWS = [
  { label: "Dec", value: 180 }, { label: "Jan", value: 220 }, { label: "Feb", value: 195 },
  { label: "Mar", value: 260 }, { label: "Apr", value: 310 }, { label: "May", value: 342 },
];

export function AnalyticsPage() {
  const { properties } = usePropertyStore();
  const totalViews = properties.reduce((s, p) => s + p.views, 0);
  const totalInquiries = properties.reduce((s, p) => s + p.inquiries, 0);
  const activeListings = properties.filter((p) => p.status === "active").length;
  const totalValue = properties.filter((p) => p.listingType === "sale" && p.status === "active").reduce((s, p) => s + p.price, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#111111] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Analytics</h1>
        <p className="text-sm font-medium text-[#111111]/40 mt-0.5">Performance overview for your listings</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total views"     value={totalViews.toLocaleString()} icon={Eye}          sub="+12% vs last month" />
        <MetricCard label="Inquiries"       value={String(totalInquiries)}      icon={MessageSquare} sub="+5 this week" />
        <MetricCard label="Active listings" value={String(activeListings)}      icon={Home} />
        <MetricCard label="Portfolio value" value={`₹${(totalValue / 1_00_00_000).toFixed(1)}Cr`} icon={IndianRupee} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="dp-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-[#5b21b6]" />
            <h2 className="text-sm font-black text-[#111111] uppercase tracking-widest" style={{ fontFamily: "Outfit, sans-serif" }}>Views (last 6 months)</h2>
          </div>
          <BarChart data={MONTHLY_VIEWS} />
        </div>

        <div className="dp-card p-6">
          <h2 className="text-sm font-black text-[#111111] uppercase tracking-widest mb-5" style={{ fontFamily: "Outfit, sans-serif" }}>Property Performance</h2>
          <div className="space-y-4">
            {properties.map((p) => {
              const pct = totalViews > 0 ? Math.round((p.views / totalViews) * 100) : 0;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-[#111111] truncate max-w-[180px]">{p.title}</p>
                    <span className="text-xs font-medium text-[#111111]/40">{p.views} views · {pct}%</span>
                  </div>
                  <div className="w-full bg-[#f8f9fa] border border-[rgba(91,33,182,0.06)] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: "linear-gradient(to right, #5b21b6, #7c3aed)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
