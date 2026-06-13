import { useState, useEffect } from "react";
import axios from "axios";
import {
  ShieldCheck, Upload, UserRound, BarChart3, Download, TrendingUp,
  AlertTriangle, Activity, Users, ChevronRight, Loader2, Sparkles,
  Target, Eye, FileSpreadsheet, ArrowUpRight, Shield, Zap, Filter,
  PieChart as PieChartIcon, SlidersHorizontal, TrendingDown, ArrowRight,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ReferenceLine,
} from "recharts";
import "./index.css";

/* ===== API URL HELPER ===== */
const getApiUrl = (endpoint) => {
  const base = import.meta.env.VITE_API_URL || "";
  if (base) {
    return `${base}${endpoint}`;
  }
  return `/api${endpoint}`;
};

/* ===== CUSTOM TOOLTIP ===== */
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
        <p style={{ fontWeight: 700, color: "#F9FAFB", fontSize: 13, marginBottom: 6 }}>{label || payload[0]?.name}</p>
        {payload.map((e, i) => (
          <p key={i} style={{ color: e.color || "#9CA3AF", fontSize: 12, margin: "3px 0", display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span>{e.name}:</span>
            <span style={{ fontWeight: 600 }}>{typeof e.value === "number" ? e.value : e.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ===== RISK BADGE HELPER ===== */
const getRiskClass = (risk) => {
  switch (risk) {
    case "Critical Risk": return "risk-critical";
    case "High Risk": return "risk-high";
    case "Medium Risk": return "risk-medium";
    case "Low Risk": return "risk-low";
    default: return "";
  }
};

function App() {
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [manualResult, setManualResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [riskFilter, setRiskFilter] = useState("All");

  // Simulator
  const [simulatedResult, setSimulatedResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simForm, setSimForm] = useState({ Discount: 0, Contract: "Month-to-Month", "Satisfaction Score": 3, "Premium Tech Support": 0 });

  const [form, setForm] = useState({
    Age: 31, "Monthly Charge": 105.5, Contract: "Month-to-Month",
    "Satisfaction Score": 2, "Tenure in Months": 4, "Number of Referrals": 0,
    "Online Security": 0, "Premium Tech Support": 0, "Internet Type": "Fiber Optic",
    "Payment Method": "Bank Withdrawal",
  });

  const baseCustomer = {
    "Avg Monthly GB Download": 21, "Avg Monthly Long Distance Charges": 17.22,
    City: "Los Angeles", CLTV: 3500, Country: "United States", Dependents: 0,
    "Device Protection Plan": 0, Gender: "Male", "Internet Service": 1,
    Latitude: 34.0522, Longitude: -118.2437, Married: 0, "Multiple Lines": 1,
    "Number of Dependents": 0, Offer: "None", "Online Backup": 0,
    "Paperless Billing": 1, Partner: 0, "Phone Service": 1, Population: 50000,
    Quarter: "Q3", "Referred a Friend": 0, "Senior Citizen": 0, State: "California",
    "Streaming Movies": 1, "Streaming Music": 1, "Streaming TV": 1,
    "Total Charges": 422.0, "Total Extra Data Charges": 20,
    "Total Long Distance Charges": 68.88, "Total Refunds": 0,
    "Total Revenue": 510.88, "Under 30": 0, "Unlimited Data": 0, "Zip Code": 90001,
  };

  // ===== HANDLERS =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: isNaN(value) ? value : Number(value) });
  };

  const predictManual = async () => {
    setLoading(true);
    try {
      const res = await axios.post(getApiUrl("/predict"), { data: { ...baseCustomer, ...form } });
      setManualResult(res.data);
      setSimulatedResult(null);
      setSimForm({ Discount: 0, Contract: form.Contract, "Satisfaction Score": form["Satisfaction Score"], "Premium Tech Support": form["Premium Tech Support"] });
    } catch (err) {
      alert(JSON.stringify(err.response?.data || err.message));
    }
    setLoading(false);
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setLoading(true);
    try {
      const res = await axios.post(getApiUrl("/bulk_predict"), fd);
      setBulkResult(res.data);
      setRiskFilter("All");
    } catch (err) {
      alert(JSON.stringify(err.response?.data || err.message));
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!bulkResult) return;
    const h = ["customer_index", "prediction", "churn_probability", "risk_level"];
    const csv = [h.join(","), ...bulkResult.results.map((r) => h.map((k) => r[k]).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "churn_predictions.csv";
    a.click();
  };

  const viewBulkCustomerDetails = async (customerData) => {
    setLoading(true);
    try {
      const res = await axios.post(getApiUrl("/predict"), { data: customerData });
      setManualResult(res.data);
      setSimulatedResult(null);
      setSimForm({ Discount: 0, Contract: customerData.Contract || "Month-to-Month", "Satisfaction Score": customerData["Satisfaction Score"] || 3, "Premium Tech Support": customerData["Premium Tech Support"] || 0 });
      setPage("manual");
    } catch (err) { alert("Failed to load customer details."); }
    setLoading(false);
  };

  // Simulator debounce
  useEffect(() => {
    if (!manualResult) return;
    const timeout = setTimeout(async () => {
      setSimulating(true);
      try {
        const newCharge = Math.max(0, (form["Monthly Charge"] || 100) - simForm.Discount);
        const res = await axios.post(getApiUrl("/predict"), {
          data: { ...baseCustomer, ...form, "Monthly Charge": newCharge, Contract: simForm.Contract, "Satisfaction Score": simForm["Satisfaction Score"], "Premium Tech Support": simForm["Premium Tech Support"] },
        });
        setSimulatedResult(res.data);
      } catch (err) { console.error(err); }
      setSimulating(false);
    }, 600);
    return () => clearTimeout(timeout);
  }, [simForm]);

  // ===== DERIVED DATA =====
  const riskColors = ["#EF4444", "#F97316", "#EAB308", "#22C55E"];
  const churnDonutColors = ["#EF4444", "#22C55E"];

  const pieData = bulkResult ? [
    { name: "Critical", value: bulkResult.risk_distribution.critical_risk },
    { name: "High", value: bulkResult.risk_distribution.high_risk },
    { name: "Medium", value: bulkResult.risk_distribution.medium_risk },
    { name: "Low", value: bulkResult.risk_distribution.low_risk },
  ] : [];

  const churnVsRetain = bulkResult ? [
    { name: "Churn", value: bulkResult.predicted_churn_customers },
    { name: "Retained", value: bulkResult.predicted_not_churn_customers },
  ] : [];

  const distributionData = (() => {
    if (!bulkResult?.results) return [];
    const b = [{ range: "0-20%", count: 0, fill: "#22C55E" }, { range: "20-40%", count: 0, fill: "#84CC16" }, { range: "40-60%", count: 0, fill: "#EAB308" }, { range: "60-80%", count: 0, fill: "#F97316" }, { range: "80-100%", count: 0, fill: "#EF4444" }];
    bulkResult.results.forEach((r) => { const p = r.churn_probability; if (p <= 20) b[0].count++; else if (p <= 40) b[1].count++; else if (p <= 60) b[2].count++; else if (p <= 80) b[3].count++; else b[4].count++; });
    return b;
  })();

  const topRiskCustomers = bulkResult?.results ? [...bulkResult.results].sort((a, b) => b.churn_probability - a.churn_probability).slice(0, 5) : [];

  const filteredResults = bulkResult?.results ? (riskFilter === "All" ? bulkResult.results : bulkResult.results.filter((r) => r.risk_level === riskFilter)) : [];

  const filterCounts = bulkResult?.results ? { All: bulkResult.results.length, "Critical Risk": bulkResult.risk_distribution.critical_risk, "High Risk": bulkResult.risk_distribution.high_risk, "Medium Risk": bulkResult.risk_distribution.medium_risk, "Low Risk": bulkResult.risk_distribution.low_risk } : {};

  const hasData = bulkResult || manualResult;

  // SHAP bar max value for scaling
  const shapMax = manualResult?.shap_visualization ? Math.max(...manualResult.shap_visualization.map((s) => Math.abs(s.value)), 0.01) : 1;

  // ===== RENDER =====
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B1120 0%, #111827 40%, #0F172A 100%)" }}>
      {loading && (<div className="loading-overlay"><Loader2 className="loading-shield" /><p className="loading-text">Processing...</p></div>)}

      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo"><ShieldCheck size={24} /></div>
          <div>
            <h1 className="navbar-title">ChurnShield</h1>
            <p className="navbar-subtitle">Customer Retention Intelligence</p>
          </div>
        </div>
        <nav className="navbar-nav">
          {[["dashboard", Activity, "Dashboard"], ["manual", UserRound, "Manual Prediction"], ["bulk", FileSpreadsheet, "Bulk CSV"]].map(([p, Icon, label]) => (
            <button key={p} onClick={() => setPage(p)} className={`nav-btn ${page === p ? "active" : ""}`}><Icon size={16} />{label}</button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        {/* ==================== DASHBOARD ==================== */}
        {page === "dashboard" && (
          <section className="animate-fade-in">
            <div className="hero-section">
              <div className="hero-orbs"><div className="hero-orb hero-orb-1" /><div className="hero-orb hero-orb-2" /><div className="hero-orb hero-orb-3" /></div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="hero-badge animate-slide-down"><Sparkles size={14} />AI-Powered Churn Intelligence</div>
                <h2 className="hero-title animate-slide-up">Predict customer <span className="gradient-text">churn</span> intelligently</h2>
                <p className="hero-description animate-slide-up" style={{ animationDelay: "0.2s" }}>Manual prediction + bulk CSV churn analytics with SHAP explainability and actionable retention recommendations.</p>
                <div className="feature-grid" style={{ opacity: 0, animation: "slideUp 0.6s ease-out 0.3s forwards" }}>
                  <button onClick={() => setPage("manual")} className="feature-card">
                    <div className="feature-card-icon"><UserRound size={22} /></div>
                    <h3 className="feature-card-title">Manual Prediction</h3>
                    <p className="feature-card-desc">Enter customer values and predict churn with SHAP analysis.</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, fontSize: 13, fontWeight: 600, color: "#FF9500" }}>Get Started <ChevronRight size={14} /></div>
                  </button>
                  <button onClick={() => setPage("bulk")} className="feature-card">
                    <div className="feature-card-icon"><Upload size={22} /></div>
                    <h3 className="feature-card-title">Bulk CSV Analysis</h3>
                    <p className="feature-card-desc">Upload raw CSV and analyze all customers at once.</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, fontSize: 13, fontWeight: 600, color: "#FF9500" }}>Upload CSV <ChevronRight size={14} /></div>
                  </button>
                </div>
              </div>
            </div>

            {hasData && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: "linear-gradient(180deg, #FF6B00, #FF9500)" }} />
                  <div><h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800 }}>Analytics Overview</h3><p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Insights from your latest predictions</p></div>
                </div>

                {bulkResult && (<>
                  <div className="stats-grid">
                    {[
                      { label: "Total Customers", val: bulkResult.total_customers, color: "#60A5FA", icon: Users, sub: "Analyzed from CSV" },
                      { label: "Predicted Churn", val: bulkResult.predicted_churn_customers, color: "#F87171", icon: AlertTriangle, sub: `${((bulkResult.predicted_churn_customers / bulkResult.total_customers) * 100).toFixed(1)}% churn rate` },
                      { label: "Retained", val: bulkResult.predicted_not_churn_customers, color: "#4ADE80", icon: Shield, sub: `${((bulkResult.predicted_not_churn_customers / bulkResult.total_customers) * 100).toFixed(1)}% retention` },
                      { label: "Avg Probability", val: `${bulkResult.average_churn_probability}%`, color: "#FBBF24", icon: TrendingUp, sub: "Across all customers" },
                    ].map((s, i) => (
                      <div key={i} className="stat-card" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                        <p className="stat-card-label"><s.icon size={14} />{s.label}</p>
                        <p className="stat-card-value" style={{ color: s.color }}>{s.val}</p>
                        <p className="stat-card-sub">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Top Influencing Factors */}
                  {bulkResult.top_influencing_factors && (
                    <div className="chart-card" style={{ animationDelay: "0.2s", marginBottom: 24 }}>
                      <h4 className="chart-card-title"><Zap size={20} />Top Churn Drivers (Global SHAP)</h4>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {bulkResult.top_influencing_factors.map((f, i) => (
                          <span key={i} className="factor-chip" style={{ fontSize: 15, padding: "10px 22px" }}>#{i + 1} {f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="charts-grid">
                    <div className="chart-card" style={{ animationDelay: "0.2s" }}>
                      <h4 className="chart-card-title"><Target size={20} />Churn Rate</h4>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart><Pie data={churnVsRetain} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} stroke="none">{churnVsRetain.map((_, i) => <Cell key={i} fill={churnDonutColors[i]} />)}</Pie><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 13, color: "#9CA3AF" }} /></PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="chart-card" style={{ animationDelay: "0.3s" }}>
                      <h4 className="chart-card-title"><PieChartIcon size={20} />Risk Distribution</h4>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} label={({ value }) => value > 0 ? value : ""} stroke="none">{pieData.map((_, i) => <Cell key={i} fill={riskColors[i]} />)}</Pie><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 13, color: "#9CA3AF" }} /></PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="charts-grid">
                    <div className="chart-card" style={{ animationDelay: "0.3s" }}>
                      <h4 className="chart-card-title"><BarChart3 size={20} />Probability Distribution</h4>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={distributionData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" /><XAxis dataKey="range" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} /><YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="count" radius={[8, 8, 0, 0]}>{distributionData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {bulkResult.internet_churn_distribution && (
                      <div className="chart-card" style={{ animationDelay: "0.4s" }}>
                        <h4 className="chart-card-title"><Activity size={20} />Internet Type vs Churn</h4>
                        <div className="chart-container">
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={bulkResult.internet_churn_distribution}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" /><XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} /><YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="Churn" fill="#EF4444" radius={[4, 4, 0, 0]} /><Bar dataKey="Retained" fill="#22C55E" radius={[4, 4, 0, 0]} /><Legend wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }} /></BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="charts-grid">
                    {bulkResult.contract_distribution && (
                      <div className="chart-card" style={{ animationDelay: "0.4s" }}>
                        <h4 className="chart-card-title"><FileSpreadsheet size={20} />Contract Type Distribution</h4>
                        <div className="chart-container">
                          <ResponsiveContainer width="100%" height={280}>
                            <PieChart><Pie data={bulkResult.contract_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`} stroke="none"><Cell fill="#3B82F6" /><Cell fill="#8B5CF6" /><Cell fill="#EC4899" /></Pie><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }} /></PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    {bulkResult.monthly_charge_churn_distribution && (
                      <div className="chart-card" style={{ animationDelay: "0.5s" }}>
                        <h4 className="chart-card-title"><TrendingUp size={20} />Monthly Charge vs Churn</h4>
                        <div className="chart-container">
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={bulkResult.monthly_charge_churn_distribution}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" /><XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} /><YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="Churn" fill="#EF4444" radius={[4, 4, 0, 0]} /><Bar dataKey="Retained" fill="#22C55E" radius={[4, 4, 0, 0]} /><Legend wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }} /></BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Risk Customers */}
                  <div className="chart-card" style={{ animationDelay: "0.5s" }}>
                    <h4 className="chart-card-title"><AlertTriangle size={20} />Highest Risk Customers</h4>
                    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border-glass)" }}>
                      <table className="data-table"><thead><tr><th>Customer</th><th>Prediction</th><th>Probability</th><th>Risk Level</th><th>Action</th></tr></thead>
                        <tbody>{topRiskCustomers.map((row) => (
                          <tr key={row.customer_index}>
                            <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>#{row.customer_index}</td>
                            <td><span style={{ color: row.prediction === "Churn" ? "#F87171" : "#4ADE80", fontWeight: 600 }}>{row.prediction}</span></td>
                            <td style={{ fontWeight: 600 }}>{row.churn_probability}%</td>
                            <td><span className={`risk-badge ${getRiskClass(row.risk_level)}`}><span className="risk-dot" />{row.risk_level}</span></td>
                            <td><button onClick={() => viewBulkCustomerDetails(row.customer_data)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}><Eye size={14} />Details</button></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                </>)}

                {manualResult && !bulkResult && (
                  <div className="chart-card" style={{ animationDelay: "0.2s" }}>
                    <h4 className="chart-card-title"><Zap size={20} />Latest Prediction Result</h4>
                    <div className="results-grid" style={{ marginTop: 8 }}>
                      <div className="result-card" style={{ animationDelay: "0.1s", borderLeft: `3px solid ${manualResult.prediction === "Churn" ? "#EF4444" : "#22C55E"}` }}>
                        <p className="result-card-label">Prediction</p>
                        <p className="result-card-value" style={{ color: manualResult.prediction === "Churn" ? "#F87171" : "#4ADE80" }}>{manualResult.prediction}</p>
                      </div>
                      <div className="result-card" style={{ animationDelay: "0.2s" }}><p className="result-card-label">Churn Probability</p><p className="result-card-value" style={{ color: "#60A5FA" }}>{manualResult.churn_probability}%</p></div>
                      <div className="result-card" style={{ animationDelay: "0.3s" }}><p className="result-card-label">Risk Level</p><span className={`risk-badge ${getRiskClass(manualResult.risk_level)}`} style={{ fontSize: 16, padding: "8px 18px" }}><span className="risk-dot" />{manualResult.risk_level}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!hasData && (
              <div className="empty-dashboard animate-slide-up" style={{ marginTop: 32, animationDelay: "0.4s" }}>
                <div className="empty-icon"><Activity size={28} /></div>
                <h4 className="empty-title">No analytics yet</h4>
                <p className="empty-desc">Start by making a manual prediction or uploading a bulk CSV to see charts and insights here.</p>
              </div>
            )}
          </section>
        )}

        {/* ==================== MANUAL PREDICTION ==================== */}
        {page === "manual" && (
          <section className="animate-fade-in">
            <div className="section-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: "linear-gradient(180deg, #FF6B00, #FF9500)" }} />
                <h2 className="section-title">Manual Customer Prediction</h2>
              </div>
              <p className="section-desc" style={{ marginLeft: 16 }}>Enter customer details. Backend preprocesses data, predicts churn, and gives recommendations.</p>
            </div>

            <div className="form-grid">
              {/* Age */}
              <div className="form-group"><label className="form-label">Age (max 80)</label>
                <input name="Age" type="number" min="0" max="80" value={form.Age}
                  onChange={(e) => { let v = parseInt(e.target.value, 10); if (v > 80) v = 80; if (v < 0) v = 0; handleChange({ target: { name: "Age", value: isNaN(v) ? "" : v } }); }}
                  className="form-input" /></div>

              {/* Monthly Charge */}
              <div className="form-group"><label className="form-label">Monthly Charge</label>
                <input name="Monthly Charge" type="number" min="0" step="0.01" value={form["Monthly Charge"]} onChange={handleChange} className="form-input" /></div>

              {/* Satisfaction Score */}
              <div className="form-group"><label className="form-label">Satisfaction Score (0-5)</label>
                <input name="Satisfaction Score" type="number" min="0" max="5" step="1" value={form["Satisfaction Score"]}
                  onChange={(e) => { let v = parseInt(e.target.value, 10); if (v > 5) v = 5; if (v < 0) v = 0; handleChange({ target: { name: "Satisfaction Score", value: isNaN(v) ? "" : v } }); }}
                  className="form-input" /></div>

              {/* Tenure */}
              <div className="form-group"><label className="form-label">Tenure in Months</label>
                <input name="Tenure in Months" type="number" min="0" value={form["Tenure in Months"]} onChange={handleChange} className="form-input" /></div>

              {/* Referrals */}
              <div className="form-group"><label className="form-label">Number of Referrals</label>
                <select name="Number of Referrals" value={form["Number of Referrals"]} onChange={handleChange} className="form-select">
                  <option value={0}>0</option><option value={1}>1</option>
                </select></div>

              {/* Contract */}
              <div className="form-group"><label className="form-label">Contract</label>
                <select name="Contract" value={form.Contract} onChange={handleChange} className="form-select">
                  <option>Month-to-Month</option><option>One Year</option><option>Two Year</option>
                </select></div>

              {/* Online Security */}
              <div className="form-group"><label className="form-label">Online Security</label>
                <select name="Online Security" value={form["Online Security"]} onChange={handleChange} className="form-select">
                  <option value={0}>No Online Security</option><option value={1}>Has Online Security</option>
                </select></div>

              {/* Premium Tech Support */}
              <div className="form-group"><label className="form-label">Premium Tech Support</label>
                <select name="Premium Tech Support" value={form["Premium Tech Support"]} onChange={handleChange} className="form-select">
                  <option value={0}>No Premium Support</option><option value={1}>Has Premium Support</option>
                </select></div>

              {/* Internet Type */}
              <div className="form-group"><label className="form-label">Internet Type</label>
                <select name="Internet Type" value={form["Internet Type"]} onChange={handleChange} className="form-select">
                  <option>Fiber Optic</option><option>DSL</option><option>Cable</option><option>None</option>
                </select></div>

              {/* Payment Method */}
              <div className="form-group"><label className="form-label">Payment Method</label>
                <select name="Payment Method" value={form["Payment Method"]} onChange={handleChange} className="form-select">
                  <option>Bank Withdrawal</option><option>Credit Card</option><option>Mailed Check</option>
                </select></div>
            </div>

            <button onClick={predictManual} disabled={loading} className="btn-primary" style={{ marginTop: 28 }}>
              {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />Predicting...</> : <><Sparkles size={18} />Predict Churn</>}
            </button>

            {/* RESULTS */}
            {manualResult && (
              <div style={{ marginTop: 40 }}>
                <div className="results-grid">
                  <div className="result-card" style={{ animationDelay: "0.1s", borderLeft: `3px solid ${manualResult.prediction === "Churn" ? "#EF4444" : "#22C55E"}` }}>
                    <p className="result-card-label">Prediction</p>
                    <p className="result-card-value" style={{ color: manualResult.prediction === "Churn" ? "#F87171" : "#4ADE80" }}>{manualResult.prediction}</p>
                  </div>
                  <div className="result-card" style={{ animationDelay: "0.2s" }}><p className="result-card-label">Churn Probability</p><p className="result-card-value" style={{ color: "#60A5FA" }}>{manualResult.churn_probability}%</p></div>
                  <div className="result-card" style={{ animationDelay: "0.3s" }}><p className="result-card-label">Risk Level</p><span className={`risk-badge ${getRiskClass(manualResult.risk_level)}`} style={{ fontSize: 16, padding: "8px 18px", marginTop: 4, display: "inline-flex" }}><span className="risk-dot" />{manualResult.risk_level}</span></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginTop: 20 }}>
                  {/* Influencing Factors */}
                  <div className="glass-card" style={{ padding: 28, opacity: 0, animation: "slideUp 0.5s ease-out 0.4s forwards" }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><Target size={18} style={{ color: "var(--accent)" }} />Influencing Factors</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{manualResult.top_influencing_factors.map((f, i) => <span key={i} className="factor-chip">{f}</span>)}</div>
                  </div>

                  {/* Recommendations */}
                  <div className="glass-card" style={{ padding: 28, opacity: 0, animation: "slideUp 0.5s ease-out 0.5s forwards" }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={18} style={{ color: "var(--accent)" }} />Retention Recommendations</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{manualResult.retention_recommendations.map((rec, i) => <div key={i} className="rec-card"><p className="rec-issue">{rec.issue}</p><p className="rec-action">{rec.recommended_action}</p></div>)}</div>
                  </div>
                </div>

                {/* SHAP VISUALIZATION */}
                {manualResult.shap_visualization && manualResult.shap_visualization.length > 0 && (
                  <div className="glass-card" style={{ padding: 28, marginTop: 20, opacity: 0, animation: "slideUp 0.5s ease-out 0.6s forwards" }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                      <BarChart3 size={18} style={{ color: "var(--accent)" }} />SHAP Feature Impact
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                      <span style={{ color: "#F87171" }}>Red = pushes toward churn</span> · <span style={{ color: "#4ADE80" }}>Green = pushes toward retention</span>
                    </p>
                    <div className="shap-bar-wrap">
                      {manualResult.shap_visualization.map((s, i) => {
                        const pct = (Math.abs(s.value) / shapMax) * 45;
                        return (
                          <div key={i} className="shap-bar-row">
                            <div className="shap-bar-label">{s.feature}</div>
                            <div className="shap-bar-track">
                              <div className="shap-bar-center" />
                              <div className={`shap-bar-fill ${s.value > 0 ? "positive" : "negative"}`}
                                style={s.value > 0 ? { right: "50%", width: `${pct}%` } : { left: "50%", width: `${pct}%` }} />
                              <span className="shap-bar-val">{s.value > 0 ? "+" : ""}{s.value.toFixed(3)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SMART RETENTION SIMULATOR */}
                <div className="simulator-wrap" style={{ animationDelay: "0.7s" }}>
                  <h3 className="simulator-title"><SlidersHorizontal size={22} style={{ color: "var(--accent)" }} />Smart Retention Simulator</h3>
                  <p className="simulator-desc">Adjust levers below to see how changes reduce churn risk in real-time.</p>

                  <div className="simulator-grid">
                    <div className="form-group">
                      <label className="form-label">Discount ($)</label>
                      <input type="number" min="0" max={form["Monthly Charge"] || 200} step="5" value={simForm.Discount}
                        onChange={(e) => setSimForm({ ...simForm, Discount: Math.max(0, Number(e.target.value)) })} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Contract</label>
                      <select value={simForm.Contract} onChange={(e) => setSimForm({ ...simForm, Contract: e.target.value })} className="form-select">
                        <option>Month-to-Month</option><option>One Year</option><option>Two Year</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Satisfaction Score</label>
                      <select value={simForm["Satisfaction Score"]} onChange={(e) => setSimForm({ ...simForm, "Satisfaction Score": Number(e.target.value) })} className="form-select">
                        {[0, 1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="simulator-comparison">
                    <div className="sim-before">
                      <p className="sim-label">Before</p>
                      <p className="sim-value" style={{ color: "#F87171" }}>{manualResult.churn_probability}%</p>
                      <p className="sim-risk-label"><span className={`risk-badge ${getRiskClass(manualResult.risk_level)}`}><span className="risk-dot" />{manualResult.risk_level}</span></p>
                    </div>
                    <div className="sim-arrow"><ArrowRight size={32} /></div>
                    <div className="sim-after">
                      <p className="sim-label">{simulating ? "Calculating..." : "After"}</p>
                      <p className="sim-value" style={{ color: simulatedResult ? (simulatedResult.churn_probability < manualResult.churn_probability ? "#4ADE80" : "#FBBF24") : "#6B7280" }}>
                        {simulating ? "..." : simulatedResult ? `${simulatedResult.churn_probability}%` : "—"}
                      </p>
                      {simulatedResult && !simulating && (
                        <p className="sim-risk-label"><span className={`risk-badge ${getRiskClass(simulatedResult.risk_level)}`}><span className="risk-dot" />{simulatedResult.risk_level}</span></p>
                      )}
                    </div>
                  </div>
                  {simulatedResult && !simulating && (
                    <div className={`sim-change ${manualResult.churn_probability - simulatedResult.churn_probability > 0 ? "positive" : manualResult.churn_probability - simulatedResult.churn_probability < 0 ? "negative" : "neutral"}`}>
                      {manualResult.churn_probability - simulatedResult.churn_probability > 0
                        ? `↓ ${(manualResult.churn_probability - simulatedResult.churn_probability).toFixed(2)}% churn reduction`
                        : manualResult.churn_probability - simulatedResult.churn_probability < 0
                          ? `↑ ${(simulatedResult.churn_probability - manualResult.churn_probability).toFixed(2)}% churn increase`
                          : "No change"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ==================== BULK CSV ==================== */}
        {page === "bulk" && (
          <section className="animate-fade-in">
            <div className="section-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: "linear-gradient(180deg, #FF6B00, #FF9500)" }} />
                <h2 className="section-title">Bulk CSV Prediction</h2>
              </div>
              <p className="section-desc" style={{ marginLeft: 16 }}>Upload raw test.csv. Backend removes leakage columns, cleans data, and predicts all customers.</p>
            </div>

            <label className="upload-zone">
              <input type="file" accept=".csv" onChange={handleBulkUpload} style={{ display: "none" }} />
              <div className="upload-zone-icon">{loading ? <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={28} />}</div>
              <p className="upload-zone-title">{loading ? "Processing CSV..." : "Upload CSV File"}</p>
              <p className="upload-zone-hint">Click to browse (.csv files only)</p>
            </label>

            {bulkResult && (<>
              <div className="stats-grid" style={{ marginTop: 32 }}>
                {[
                  { label: "Total Customers", val: bulkResult.total_customers, color: "#60A5FA", icon: Users },
                  { label: "Predicted Churn", val: bulkResult.predicted_churn_customers, color: "#F87171", icon: AlertTriangle },
                  { label: "Not Churn", val: bulkResult.predicted_not_churn_customers, color: "#4ADE80", icon: Shield },
                  { label: "Avg Probability", val: `${bulkResult.average_churn_probability}%`, color: "#FBBF24", icon: TrendingUp },
                ].map((s, i) => (
                  <div key={i} className="stat-card" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                    <p className="stat-card-label"><s.icon size={14} />{s.label}</p>
                    <p className="stat-card-value" style={{ color: s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Top Influencing Factors */}
              {bulkResult.top_influencing_factors && (
                <div className="chart-card" style={{ animationDelay: "0.3s", marginBottom: 24 }}>
                  <h4 className="chart-card-title"><Zap size={20} />Top Churn Drivers</h4>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{bulkResult.top_influencing_factors.map((f, i) => <span key={i} className="factor-chip" style={{ fontSize: 15, padding: "10px 22px" }}>#{i + 1} {f}</span>)}</div>
                </div>
              )}

              <div className="charts-grid">
                <div className="chart-card" style={{ animationDelay: "0.3s" }}>
                  <h4 className="chart-card-title"><BarChart3 size={20} />Risk Distribution</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ value }) => value > 0 ? value : ""} stroke="none">{pieData.map((_, i) => <Cell key={i} fill={riskColors[i]} />)}</Pie><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 13, color: "#9CA3AF" }} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="chart-card" style={{ animationDelay: "0.4s" }}>
                  <h4 className="chart-card-title"><FileSpreadsheet size={20} />Bulk Summary</h4>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>Leakage columns (Churn Reason, Category, Score, Status) were removed before prediction.</p>
                  <div style={{ padding: 20, borderRadius: 14, background: "var(--glass-strong)", border: "1px solid var(--border-glass)", marginBottom: 20 }}>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Churn Rate</p>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: (bulkResult.predicted_churn_customers / bulkResult.total_customers) * 100 > 50 ? "#F87171" : "#FBBF24" }}>
                      {((bulkResult.predicted_churn_customers / bulkResult.total_customers) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <button onClick={downloadCSV} className="btn-primary"><Download size={18} />Download Results CSV</button>
                </div>
              </div>

              {/* RISK FILTER BAR */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 32, marginBottom: 4 }}>
                <Filter size={18} style={{ color: "var(--accent)" }} />
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700 }}>Filter by Risk Level</h4>
              </div>
              <div className="filter-bar">
                {["All", "Critical Risk", "High Risk", "Medium Risk", "Low Risk"].map((f) => (
                  <button key={f} onClick={() => setRiskFilter(f)} className={`filter-pill ${riskFilter === f ? "active" : ""}`}>
                    {f} <span className="pill-count">({filterCounts[f] || 0})</span>
                  </button>
                ))}
              </div>

              {/* FILTERED TABLE */}
              <div className="data-table-wrap" style={{ animationDelay: "0.5s" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-glass)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                    <Users size={18} style={{ color: "var(--accent)" }} />Customer Results
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>({filteredResults.length} shown)</span>
                  </h4>
                </div>
                <table className="data-table">
                  <thead><tr><th>Customer</th><th>Prediction</th><th>Probability</th><th>Risk Level</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredResults.map((row) => (
                      <tr key={row.customer_index}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>#{row.customer_index}</td>
                        <td><span style={{ color: row.prediction === "Churn" ? "#F87171" : "#4ADE80", fontWeight: 600 }}>{row.prediction}</span></td>
                        <td style={{ fontWeight: 600 }}>{row.churn_probability}%</td>
                        <td><span className={`risk-badge ${getRiskClass(row.risk_level)}`}><span className="risk-dot" />{row.risk_level}</span></td>
                        <td><button onClick={() => viewBulkCustomerDetails(row.customer_data)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}><Eye size={14} />View Details</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;