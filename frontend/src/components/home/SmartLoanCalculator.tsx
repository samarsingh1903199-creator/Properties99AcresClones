import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import {
  Calculator, Zap, BarChart2, Sparkles, Trophy, Clock,
  TrendingUp, Home, CreditCard, FileText, Users,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(Math.round(n));

const fmtC = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${fmt(n)}`;
};

const calcEMI = (p: number, annualRate: number, months: number) => {
  const r = annualRate / 12 / 100;
  if (r === 0 || months === 0) return p / months;
  return (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

const simulateLoan = (
  principal: number,
  annualRate: number,
  tenureMonths: number,
  extraMonthly = 0,
  oneTime = 0
) => {
  const r = annualRate / 12 / 100;
  const emi = calcEMI(principal, annualRate, tenureMonths);
  let balance = Math.max(0, principal - oneTime);
  let months = 0;
  let totalInterest = 0;
  const timeline: { year: number; balance: number }[] = [];

  while (balance > 0.01 && months < tenureMonths) {
    const interest = balance * r;
    const payment = Math.min(emi + extraMonthly, balance + interest);
    balance -= payment - interest;
    totalInterest += interest;
    months++;
    if (months % 12 === 0) timeline.push({ year: months / 12, balance: Math.max(0, balance) });
  }
  return { months, totalInterest, timeline };
};

// ── Constants ─────────────────────────────────────────────────────────────────

const BANKS = [
  { name: "State Bank of India",   short: "SBI",   rate: 8.50, color: "#1e40af" },
  { name: "HDFC Bank",             short: "HDFC",  rate: 8.75, color: "#dc2626" },
  { name: "ICICI Bank",            short: "ICICI", rate: 8.75, color: "#ea580c" },
  { name: "Axis Bank",             short: "Axis",  rate: 8.75, color: "#5b21b6" },
  { name: "Punjab National Bank",  short: "PNB",   rate: 8.45, color: "#059669" },
  { name: "Bank of Baroda",        short: "BoB",   rate: 8.40, color: "#b45309" },
  { name: "Kotak Mahindra",        short: "Kotak", rate: 8.75, color: "#0369a1" },
  { name: "LIC Housing Finance",   short: "LIC",   rate: 8.50, color: "#15803d" },
];

const TABS = [
  { id: "calculator",  label: "EMI Calculator",   icon: Calculator },
  { id: "compare",     label: "Bank Compare",      icon: BarChart2  },
  { id: "accelerator", label: "Loan Accelerator",  icon: Zap        },
  { id: "tools",       label: "Smart Tools",       icon: Sparkles   },
] as const;

const STAMP_STATES = [
  { name: "Maharashtra",   male: 5.0, female: 4.0, reg: 1.0 },
  { name: "Delhi",         male: 6.0, female: 4.0, reg: 1.0 },
  { name: "Karnataka",     male: 5.6, female: 5.6, reg: 1.0 },
  { name: "Tamil Nadu",    male: 7.0, female: 7.0, reg: 1.0 },
  { name: "Gujarat",       male: 4.9, female: 4.9, reg: 1.0 },
  { name: "Rajasthan",     male: 5.0, female: 4.0, reg: 1.0 },
  { name: "Uttar Pradesh", male: 7.0, female: 6.0, reg: 1.0 },
  { name: "West Bengal",   male: 6.0, female: 6.0, reg: 1.0 },
  { name: "Haryana",       male: 7.0, female: 5.0, reg: 0.5 },
  { name: "Punjab",        male: 5.0, female: 3.0, reg: 1.0 },
];

type TabId = typeof TABS[number]["id"];

// ── Slider input ──────────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number; max: number; step: number;
  display: string;
}
const Slider = ({ label, value, onChange, min, max, step, display }: SliderProps) => (
  <div className="mb-5">
    <div className="flex justify-between items-center mb-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>
      <span className="text-xs font-black text-white bg-white/10 px-3 py-1 rounded-lg">{display}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{ accentColor: "#5b21b6" }}
    />
    <div className="flex justify-between mt-1">
      <span className="text-[9px] text-white/20">{fmtC(min)}</span>
      <span className="text-[9px] text-white/20">{fmtC(max)}</span>
    </div>
  </div>
);

// ── Tools tab sub-calculators ─────────────────────────────────────────────────

const AffordabilityCalc = () => {
  const [income, setIncome] = useState(100000);
  const [obligations, setObligations] = useState(10000);
  const [rate, setRate] = useState(8.75);
  const netIncome = income - obligations;
  const maxEMI = netIncome * 0.4;
  const months = 240;
  const r = rate / 12 / 100;
  const maxLoan = maxEMI * ((Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months)));

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <Home className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-white font-black text-sm">Affordability Calculator</p>
          <p className="text-white/30 text-[10px]">How much can you borrow?</p>
        </div>
      </div>
      <Slider label="Monthly Income" value={income} onChange={setIncome} min={30000} max={1000000} step={5000} display={fmtC(income)} />
      <Slider label="Existing Obligations" value={obligations} onChange={setObligations} min={0} max={income * 0.5} step={1000} display={fmtC(obligations)} />
      <Slider label="Expected Rate (%)" value={rate} onChange={setRate} min={7} max={14} step={0.25} display={`${rate}% p.a.`} />
      <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
        <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1">Max Eligible Loan</p>
        <p className="text-2xl font-black text-blue-400">{fmtC(maxLoan)}</p>
        <p className="text-[10px] text-white/30 mt-1">Max EMI: ₹{fmt(maxEMI)} / mo</p>
      </div>
    </div>
  );
};

const EligibilityChecker = () => {
  const [income, setIncome] = useState(80000);
  const [age, setAge] = useState(32);
  const [employed, setEmployed] = useState<"salaried" | "self">("salaried");
  const maxTenure = Math.min(30, 60 - age);
  const multiplier = employed === "salaried" ? 60 : 48;
  const eligible = income * multiplier;
  const eligibleBanks = BANKS.filter(b => b.rate <= 8.75).length;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center">
          <Users className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-white font-black text-sm">Eligibility Checker</p>
          <p className="text-white/30 text-[10px]">Know your loan eligibility</p>
        </div>
      </div>
      <Slider label="Monthly Income" value={income} onChange={setIncome} min={20000} max={500000} step={5000} display={fmtC(income)} />
      <Slider label="Your Age" value={age} onChange={setAge} min={21} max={58} step={1} display={`${age} yrs`} />
      <div className="mb-5">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Employment Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(["salaried", "self"] as const).map(t => (
            <button key={t} onClick={() => setEmployed(t)}
              className={cn("py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                employed === t ? "bg-luxury-purple text-white" : "bg-white/5 text-white/40 hover:text-white"
              )}>
              {t === "salaried" ? "Salaried" : "Self-Employed"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { label: "Eligible Loan", value: fmtC(eligible), color: "text-emerald-400" },
          { label: "Max Tenure", value: `${maxTenure} Yrs`, color: "text-white" },
          { label: "Eligible Banks", value: `${eligibleBanks}+`, color: "text-white" },
        ].map(item => (
          <div key={item.label} className="bg-white/5 rounded-2xl p-3 text-center">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
            <p className={cn("text-sm font-black", item.color)}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const StampDutyCalc = () => {
  const [price, setPrice] = useState(5000000);
  const [stateIdx, setStateIdx] = useState(0);
  const [gender, setGender] = useState<"male" | "female">("male");
  const s = STAMP_STATES[stateIdx];
  const dutyRate = gender === "male" ? s.male : s.female;
  const duty = price * dutyRate / 100;
  const reg = price * s.reg / 100;
  const total = duty + reg;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <FileText className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-white font-black text-sm">Stamp Duty Calculator</p>
          <p className="text-white/30 text-[10px]">State-wise registration costs</p>
        </div>
      </div>
      <Slider label="Property Value" value={price} onChange={setPrice} min={500000} max={50000000} step={100000} display={fmtC(price)} />
      <div className="mb-5">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">State</label>
        <select value={stateIdx} onChange={e => setStateIdx(Number(e.target.value))}
          className="w-full bg-white/10 border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 outline-none">
          {STAMP_STATES.map((st, i) => <option key={st.name} value={i} className="bg-[#1a1035]">{st.name}</option>)}
        </select>
      </div>
      <div className="mb-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Gender</label>
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map(g => (
            <button key={g} onClick={() => setGender(g)}
              className={cn("py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                gender === g ? "bg-amber-500/30 text-amber-400 border border-amber-500/30" : "bg-white/5 text-white/40"
              )}>
              {g === "male" ? "Male" : "Female"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 mt-4">
        {[
          { label: `Stamp Duty (${dutyRate}%)`, value: fmtC(duty) },
          { label: `Registration (${s.reg}%)`, value: fmtC(reg) },
        ].map(row => (
          <div key={row.label} className="flex justify-between bg-white/5 rounded-xl px-4 py-2.5">
            <span className="text-xs text-white/50">{row.label}</span>
            <span className="text-xs font-black text-white">{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
          <span className="text-xs text-amber-400 font-black">Total Charges</span>
          <span className="text-xs font-black text-amber-400">{fmtC(total)}</span>
        </div>
      </div>
    </div>
  );
};

const ROICalc = () => {
  const [purchasePrice, setPurchasePrice] = useState(5000000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [appreciation, setAppreciation] = useState(7);
  const annualRent = monthlyRent * 12;
  const grossYield = (annualRent / purchasePrice) * 100;
  const netYield = grossYield * 0.8;
  const val5yr = purchasePrice * Math.pow(1 + appreciation / 100, 5);
  const totalReturn5yr = val5yr + annualRent * 5 - purchasePrice;
  const roi5yr = (totalReturn5yr / purchasePrice) * 100;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-pink-500/20 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-pink-400" />
        </div>
        <div>
          <p className="text-white font-black text-sm">ROI Calculator</p>
          <p className="text-white/30 text-[10px]">Real estate investment returns</p>
        </div>
      </div>
      <Slider label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} min={1000000} max={50000000} step={500000} display={fmtC(purchasePrice)} />
      <Slider label="Monthly Rental Income" value={monthlyRent} onChange={setMonthlyRent} min={5000} max={200000} step={1000} display={`₹${fmt(monthlyRent)}`} />
      <Slider label="Annual Appreciation (%)" value={appreciation} onChange={setAppreciation} min={3} max={20} step={0.5} display={`${appreciation}% p.a.`} />
      <div className="grid grid-cols-2 gap-2 mt-4">
        {[
          { label: "Gross Yield", value: `${grossYield.toFixed(2)}%`, color: "text-pink-400" },
          { label: "Net Yield", value: `${netYield.toFixed(2)}%`, color: "text-pink-400" },
          { label: "5-Yr Value", value: fmtC(val5yr), color: "text-white" },
          { label: "5-Yr ROI", value: `${roi5yr.toFixed(1)}%`, color: "text-emerald-400" },
        ].map(item => (
          <div key={item.label} className="bg-white/5 rounded-2xl p-3 text-center">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
            <p className={cn("text-sm font-black", item.color)}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Custom recharts tooltip ───────────────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f0c24] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      {label && <p className="text-white/50 mb-1.5">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-white font-black">{fmtC(p.value)}</p>
      ))}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const SmartLoanCalculator = () => {
  const [tab, setTab] = useState<TabId>("calculator");

  // Core loan inputs
  const [propertyPrice, setPropertyPrice] = useState(5000000);
  const [downPayment, setDownPayment]     = useState(1000000);
  const [interestRate, setInterestRate]   = useState(8.5);
  const [tenure, setTenure]               = useState(20);
  const [extraMonthly, setExtraMonthly]   = useState(0);
  const [oneTimePre, setOneTimePre]       = useState(0);

  const loanAmount   = Math.max(0, propertyPrice - downPayment);
  const tenureMonths = tenure * 12;
  const emi          = useMemo(() => calcEMI(loanAmount, interestRate, tenureMonths), [loanAmount, interestRate, tenureMonths]);
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - loanAmount;

  const original   = useMemo(() => simulateLoan(loanAmount, interestRate, tenureMonths), [loanAmount, interestRate, tenureMonths]);
  const accelerated = useMemo(() => simulateLoan(loanAmount, interestRate, tenureMonths, extraMonthly, oneTimePre), [loanAmount, interestRate, tenureMonths, extraMonthly, oneTimePre]);

  const monthsSaved   = Math.max(0, original.months - accelerated.months);
  const interestSaved = Math.max(0, original.totalInterest - accelerated.totalInterest);

  const bankData = useMemo(() =>
    BANKS.map(b => {
      const e = calcEMI(loanAmount, b.rate, tenureMonths);
      return { ...b, emi: e, total: e * tenureMonths, interest: e * tenureMonths - loanAmount };
    }).sort((a, b) => a.rate - b.rate),
    [loanAmount, tenureMonths]
  );

  const pieData = [
    { name: "Principal", value: loanAmount,     color: "#5b21b6" },
    { name: "Interest",  value: totalInterest,  color: "#a855f7" },
  ];

  const timelineData = useMemo(() => {
    const len = Math.max(original.timeline.length, accelerated.timeline.length);
    return Array.from({ length: len }, (_, i) => ({
      year: i + 1,
      Original:     original.timeline[i]?.balance    ?? 0,
      Accelerated:  accelerated.timeline[i]?.balance ?? 0,
    }));
  }, [original, accelerated]);

  return (
    <section id="loan-calculator" className="relative bg-gradient-to-br from-[#0c0a1e] via-[#150f2e] to-[#0a0818] py-24 px-6 md:px-12 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-luxury-purple/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-luxury-purple/15 border border-luxury-purple/25 text-purple-300 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> Smart Financial Tools
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="text-4xl md:text-5xl xl:text-6xl font-display font-black text-white mb-4 leading-tight" style={{ letterSpacing: "-0.03em" }}>
            Calculate Smarter.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Own Faster.</span>
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
            className="text-white/40 text-lg max-w-lg mx-auto leading-relaxed">
            Reduce your home loan by years with intelligent EMI planning and real-time bank comparisons.
          </motion.p>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-1 p-1.5 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto hide-scrollbar">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id as TabId)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                    tab === t.id ? "bg-luxury-purple text-white shadow-lg shadow-luxury-purple/30" : "text-white/40 hover:text-white/70"
                  )}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Panels ── */}
        <AnimatePresence mode="wait">

          {/* ────────── EMI CALCULATOR ────────── */}
          {tab === "calculator" && (
            <motion.div key="calc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* LEFT — inputs */}
              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <p className="text-white font-black text-xl mb-7">Loan Details</p>

                <Slider label="Property Price" value={propertyPrice} onChange={setPropertyPrice} min={500000} max={50000000} step={100000} display={fmtC(propertyPrice)} />
                <Slider label="Down Payment" value={downPayment} onChange={v => setDownPayment(Math.min(v, propertyPrice - 500000))} min={0} max={propertyPrice * 0.8} step={50000} display={fmtC(downPayment)} />

                {/* Loan amount bar */}
                <div className="bg-luxury-purple/10 border border-luxury-purple/20 rounded-2xl p-4 mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-300/70">Loan Amount</span>
                    <span className="text-base font-black text-purple-300">{fmtC(loanAmount)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-luxury-purple to-purple-400 rounded-full"
                      animate={{ width: `${Math.min(100, (loanAmount / propertyPrice) * 100)}%` }}
                      transition={{ duration: 0.5 }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] text-purple-300/50">{Math.round((loanAmount / propertyPrice) * 100)}% financed</span>
                    <span className="text-[9px] text-purple-300/50">{Math.round((downPayment / propertyPrice) * 100)}% own</span>
                  </div>
                </div>

                <Slider label="Interest Rate" value={interestRate} onChange={setInterestRate} min={6} max={15} step={0.05} display={`${interestRate.toFixed(2)}% p.a.`} />
                <Slider label="Loan Tenure" value={tenure} onChange={setTenure} min={5} max={30} step={1} display={`${tenure} Years`} />

                {/* Smart insight */}
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl">
                  <div className="flex gap-3">
                    <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Smart Insight</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        You pay{" "}
                        <span className="text-white font-bold">{fmtC(totalInterest)}</span>{" "}
                        as interest — that's{" "}
                        <span className="text-amber-400 font-bold">{((totalInterest / loanAmount) * 100).toFixed(0)}%</span>{" "}
                        extra over the principal. Use the Loan Accelerator to reduce this.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — results */}
              <div className="flex flex-col gap-5">
                {/* EMI hero card */}
                <div className="bg-gradient-to-br from-luxury-purple/25 to-purple-900/20 border border-luxury-purple/25 rounded-3xl p-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Monthly EMI</p>
                  <motion.p key={Math.round(emi)} initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl md:text-6xl font-black text-white mb-1">
                    ₹{fmt(emi)}
                  </motion.p>
                  <p className="text-white/30 text-sm">per month · {tenure} years · {interestRate.toFixed(2)}% p.a.</p>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                      { label: "Loan",     value: fmtC(loanAmount) },
                      { label: "Interest", value: fmtC(totalInterest) },
                      { label: "Total",    value: fmtC(totalPayable) },
                    ].map(item => (
                      <div key={item.label} className="text-center bg-white/5 rounded-2xl py-3 px-2">
                        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-xs font-black text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown chart */}
                <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-5">Payment Breakdown</p>
                  <div className="flex items-center gap-6">
                    <div className="w-36 h-36 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3} dataKey="value" strokeWidth={0}>
                            {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {pieData.map(d => (
                        <div key={d.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                            <span className="text-xs text-white/50">{d.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-white">{fmtC(d.value)}</p>
                            <p className="text-[9px] text-white/25">{((d.value / totalPayable) * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-white/10 flex justify-between">
                        <span className="text-xs text-white/30">Total Cost</span>
                        <span className="text-sm font-black text-purple-400">{fmtC(totalPayable)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ────────── BANK COMPARE ────────── */}
          {tab === "compare" && (
            <motion.div key="compare" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}>

              {/* Loan config summary */}
              <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-white/50">
                <span>Loan: <b className="text-white">{fmtC(loanAmount)}</b></span>
                <span className="w-px h-4 bg-white/10" />
                <span>Tenure: <b className="text-white">{tenure} Yrs</b></span>
                <span className="w-px h-4 bg-white/10" />
                <span className="text-[10px] text-white/30 italic">Rates are indicative. Check bank websites for latest offers.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {bankData.map((bank, i) => (
                  <motion.div key={bank.short}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={cn("relative rounded-3xl p-6 border transition-all",
                      i === 0 ? "bg-gradient-to-br from-luxury-purple/20 to-pink-900/10 border-luxury-purple/30" : "bg-white/[0.04] border-white/10"
                    )}>
                    {i === 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-luxury-purple to-purple-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                        Best Rate
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: bank.color }}>
                        {bank.short.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-white text-xs font-black leading-tight">{bank.short}</p>
                        <p className="text-white/25 text-[9px] leading-tight truncate max-w-[80px]">{bank.name}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest">Rate</p>
                        <p className="text-2xl font-black" style={{ color: bank.color }}>{bank.rate}%</p>
                      </div>
                      <div className="h-px bg-white/10" />
                      {[
                        { label: "Monthly EMI",    value: `₹${fmt(bank.emi)}` },
                        { label: "Total Interest", value: fmtC(bank.interest) },
                        { label: "Total Payable",  value: fmtC(bank.total) },
                      ].map(row => (
                        <div key={row.label}>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest">{row.label}</p>
                          <p className="text-sm font-black text-white">{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-7">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Total Interest — Side by Side</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bankData} margin={{ top: 4, right: 4, left: 14, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="short" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => `₹${(v / 1e5).toFixed(0)}L`} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="interest" radius={[6, 6, 0, 0]}>
                        {bankData.map((b, i) => <Cell key={i} fill={i === 0 ? "#5b21b6" : "rgba(91,33,182,0.3)"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* ────────── LOAN ACCELERATOR ────────── */}
          {tab === "accelerator" && (
            <motion.div key="accel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* LEFT — extra payment inputs */}
              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 bg-luxury-purple/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-xl">Loan Accelerator</p>
                    <p className="text-white/30 text-xs">Pay more, own sooner</p>
                  </div>
                </div>

                {/* Base loan summary */}
                <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-2">
                  {[
                    { label: "Loan Amount",    value: fmtC(loanAmount) },
                    { label: "Standard EMI",   value: `₹${fmt(emi)} / mo` },
                    { label: "Original Tenure",value: `${tenure} Years` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">{row.label}</span>
                      <span className="text-xs font-black text-white">{row.value}</span>
                    </div>
                  ))}
                </div>

                <Slider label="Extra Monthly Payment" value={extraMonthly} onChange={setExtraMonthly} min={0} max={100000} step={1000} display={extraMonthly > 0 ? `+${fmtC(extraMonthly)}/mo` : "₹0"} />
                <Slider label="One-Time Prepayment" value={oneTimePre} onChange={setOneTimePre} min={0} max={loanAmount * 0.5} step={50000} display={oneTimePre > 0 ? fmtC(oneTimePre) : "₹0"} />

                {/* Savings cards */}
                {monthsSaved > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Interest Saved</p>
                      </div>
                      <p className="text-xl font-black text-emerald-400">{fmtC(interestSaved)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Time Saved</p>
                      </div>
                      <p className="text-xl font-black text-blue-400">
                        {Math.floor(monthsSaved / 12)}Y {monthsSaved % 12}M
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                    <p className="text-white/25 text-xs">Add extra payments above to see your savings</p>
                  </div>
                )}
              </div>

              {/* RIGHT — charts */}
              <div className="flex flex-col gap-5">
                {/* Area chart */}
                <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Loan Payoff Timeline</p>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1 text-white/25"><span className="inline-block w-4 h-0.5 bg-luxury-purple/50" />Original</span>
                      <span className="flex items-center gap-1 text-emerald-400"><span className="inline-block w-4 h-0.5 bg-emerald-400" />Accelerated</span>
                    </div>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: 14, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => fmtC(v)} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<DarkTooltip />} />
                        <Area type="monotone" dataKey="Original"    stroke="rgba(91,33,182,0.5)"  fill="rgba(91,33,182,0.1)"   strokeWidth={2} />
                        <Area type="monotone" dataKey="Accelerated" stroke="rgba(16,185,129,0.9)" fill="rgba(16,185,129,0.08)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tenure bar comparison */}
                <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-5">Tenure Comparison</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-white/40">Original</span>
                        <span className="text-xs font-black text-white">{Math.ceil(original.months / 12)} Yrs</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full">
                        <div className="h-full w-full bg-luxury-purple/30 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-emerald-400">Accelerated</span>
                        <span className="text-xs font-black text-emerald-400">{Math.ceil(accelerated.months / 12)} Yrs</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-emerald-500 rounded-full"
                          animate={{ width: original.months > 0 ? `${(accelerated.months / original.months) * 100}%` : "100%" }}
                          transition={{ duration: 1, ease: "easeOut" }} />
                      </div>
                    </div>
                  </div>
                  {monthsSaved > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-white/50">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Close your loan <span className="font-black text-white">{Math.floor(monthsSaved / 12)} years {monthsSaved % 12} months</span> ahead of schedule.
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ────────── SMART TOOLS ────────── */}
          {tab === "tools" && (
            <motion.div key="tools" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AffordabilityCalc />
              <EligibilityChecker />
              <StampDutyCalc />
              <ROICalc />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
};
