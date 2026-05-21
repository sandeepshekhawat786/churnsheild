import { useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  Upload,
  UserRound,
  BarChart3,
  Download,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import "./index.css";

function App() {
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [manualResult, setManualResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);

  const [form, setForm] = useState({
    Age: 31,
    "Monthly Charge": 105.5,
    Contract: "Month-to-Month",
    "Satisfaction Score": 2,
    "Tenure in Months": 4,
    "Number of Referrals": 0,
    "Online Security": 0,
    "Premium Tech Support": 0,
    "Internet Type": "Fiber Optic",
    "Payment Method": "Bank Withdrawal",
  });

  const baseCustomer = {
    "Avg Monthly GB Download": 21,
    "Avg Monthly Long Distance Charges": 17.22,
    City: "Los Angeles",
    CLTV: 3500,
    Country: "United States",
    Dependents: 0,
    "Device Protection Plan": 0,
    Gender: "Male",
    "Internet Service": 1,
    Latitude: 34.0522,
    Longitude: -118.2437,
    Married: 0,
    "Multiple Lines": 1,
    "Number of Dependents": 0,
    Offer: "None",
    "Online Backup": 0,
    "Paperless Billing": 1,
    Partner: 0,
    "Phone Service": 1,
    Population: 50000,
    Quarter: "Q3",
    "Referred a Friend": 0,
    "Senior Citizen": 0,
    State: "California",
    "Streaming Movies": 1,
    "Streaming Music": 1,
    "Streaming TV": 1,
    "Total Charges": 422.0,
    "Total Extra Data Charges": 20,
    "Total Long Distance Charges": 68.88,
    "Total Refunds": 0,
    "Total Revenue": 510.88,
    "Under 30": 0,
    "Unlimited Data": 0,
    "Zip Code": 90001,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: isNaN(value) ? value : Number(value),
    });
  };

  const predictManual = async () => {
    setLoading(true);

    try {
      const customerData = { ...baseCustomer, ...form };

      const res = await axios.post("/api/predict", {
        data: customerData,
      });

      setManualResult(res.data);
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("BACKEND RESPONSE:", err.response?.data);
      alert(JSON.stringify(err.response?.data || err.message));
    }

    setLoading(false);
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post(
        "/api/bulk_predict",
        formData,
      );

      setBulkResult(res.data);
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("BACKEND RESPONSE:", err.response?.data);
      alert(JSON.stringify(err.response?.data || err.message));

    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!bulkResult) return;

    const headers = [
      "customer_index",
      "prediction",
      "churn_probability",
      "risk_level",
    ];

    const csv = [
      headers.join(","),
      ...bulkResult.results.map((row) =>
        headers.map((h) => row[h]).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "churn_predictions.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const viewBulkCustomerDetails = async (customerData) => {
    setLoading(true);

    try {
      const res = await axios.post("/api/predict", {
        data: customerData,
      });

      setManualResult(res.data);
      setPage("manual");
    } catch (err) {
      alert("Failed to load customer details.");
      console.error(err);
    }

    setLoading(false);
  };

  const pieData = bulkResult
    ? [
      {
        name: "Critical Risk",
        value: bulkResult.risk_distribution.critical_risk,
      },
      {
        name: "High Risk",
        value: bulkResult.risk_distribution.high_risk,
      },
      {
        name: "Medium Risk",
        value: bulkResult.risk_distribution.medium_risk,
      },
      {
        name: "Low Risk",
        value: bulkResult.risk_distribution.low_risk,
      },
    ]
    : [];

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6FA] to-[#EAF0F6] text-[#111] p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-[30px] shadow-xl min-h-[92vh] overflow-hidden">
        <header className="flex items-center justify-between px-8 py-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF6B00] text-white p-3 rounded-2xl">
              <ShieldCheck />
            </div>
            <div>
              <h1 className="text-2xl font-black">ChurnShield</h1>
              <p className="text-sm text-gray-500">
                Telecom Customer Retention Intelligence
              </p>
            </div>
          </div>

          <nav className="flex gap-3">
            <button
              onClick={() => setPage("dashboard")}
              className={`px-5 py-2 rounded-full font-bold ${page === "dashboard"
                ? "bg-[#FF6B00] text-white"
                : "bg-gray-100"
                }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setPage("manual")}
              className={`px-5 py-2 rounded-full font-bold ${page === "manual" ? "bg-[#FF6B00] text-white" : "bg-gray-100"
                }`}
            >
              Manual Prediction
            </button>

            <button
              onClick={() => setPage("bulk")}
              className={`px-5 py-2 rounded-full font-bold ${page === "bulk" ? "bg-[#FF6B00] text-white" : "bg-gray-100"
                }`}
            >
              Bulk CSV
            </button>
          </nav>
        </header>

        <main className="p-8">
          {page === "dashboard" && (
            <section className="text-center py-20">
              <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-[0_0_80px_rgba(124,58,237,0.45)] mb-8"></div>

              <h2 className="text-5xl font-black">
                Predict customer <span className="text-[#FF6B00]">churn</span>{" "}
                intelligently
              </h2>

              <p className="text-gray-500 mt-4 text-lg">
                Manual prediction + bulk CSV churn analytics with retention
                recommendations.
              </p>

              <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto mt-12">
                <button
                  onClick={() => setPage("manual")}
                  className="p-8 rounded-3xl border hover:shadow-lg text-left"
                >
                  <UserRound className="text-[#FF6B00]" />
                  <h3 className="font-black text-xl mt-4">Manual Prediction</h3>
                  <p className="text-gray-500 mt-2">
                    Enter customer values and predict churn.
                  </p>
                </button>

                <button
                  onClick={() => setPage("bulk")}
                  className="p-8 rounded-3xl border hover:shadow-lg text-left"
                >
                  <Upload className="text-[#FF6B00]" />
                  <h3 className="font-black text-xl mt-4">Bulk CSV Analysis</h3>
                  <p className="text-gray-500 mt-2">
                    Upload raw CSV and analyze all customers.
                  </p>
                </button>
              </div>
            </section>
          )}

          {page === "manual" && (
            <section>
              <h2 className="text-4xl font-black">Manual Customer Prediction</h2>
              <p className="text-gray-500 mt-2">
                Enter customer details. Backend will complete remaining values,
                preprocess data, predict churn, and give recommendations.
              </p>

              <div className="grid grid-cols-2 gap-5 mt-8 max-w-4xl">
                {[
                  "Age",
                  "Monthly Charge",
                  "Satisfaction Score",
                  "Tenure in Months",
                  "Number of Referrals",
                ].map((field) => (
                  <div key={field} className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">
                      {field}
                    </label>

                    <input
                      name={field}
                      type="number"
                      value={form[field]}
                      onChange={handleChange}
                      placeholder={field}
                      className="p-4 bg-gray-100 rounded-2xl outline-none"
                    />
                  </div>
                ))}

                <select
                  name="Contract"
                  value={form.Contract}
                  onChange={handleChange}
                  className="p-4 bg-gray-100 rounded-2xl outline-none"
                >
                  <option>Month-to-Month</option>
                  <option>One Year</option>
                  <option>Two Year</option>
                </select>

                <select
                  name="Online Security"
                  value={form["Online Security"]}
                  onChange={handleChange}
                  className="p-4 bg-gray-100 rounded-2xl outline-none"
                >
                  <option value={0}>No Online Security</option>
                  <option value={1}>Has Online Security</option>
                </select>

                <select
                  name="Premium Tech Support"
                  value={form["Premium Tech Support"]}
                  onChange={handleChange}
                  className="p-4 bg-gray-100 rounded-2xl outline-none"
                >
                  <option value={0}>No Premium Support</option>
                  <option value={1}>Has Premium Support</option>
                </select>

                <select
                  name="Internet Type"
                  value={form["Internet Type"]}
                  onChange={handleChange}
                  className="p-4 bg-gray-100 rounded-2xl outline-none"
                >
                  <option>Fiber Optic</option>
                  <option>DSL</option>
                  <option>Cable</option>
                  <option>None</option>
                </select>

                <select
                  name="Payment Method"
                  value={form["Payment Method"]}
                  onChange={handleChange}
                  className="p-4 bg-gray-100 rounded-2xl outline-none"
                >
                  <option>Bank Withdrawal</option>
                  <option>Credit Card</option>
                  <option>Mailed Check</option>
                </select>
              </div>

              <button
                onClick={predictManual}
                className="mt-6 bg-[#FF6B00] text-white px-8 py-4 rounded-full font-black"
              >
                {loading ? "Predicting..." : "Predict Churn"}
              </button>

              {manualResult && (
                <div className="grid grid-cols-3 gap-5 mt-10">
                  <div className="bg-orange-50 p-6 rounded-3xl">
                    <p className="text-gray-500">Prediction</p>
                    <h3 className="text-2xl font-black">
                      {manualResult.prediction}
                    </h3>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-3xl">
                    <p className="text-gray-500">Churn Probability</p>
                    <h3 className="text-2xl font-black">
                      {manualResult.churn_probability}%
                    </h3>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-3xl">
                    <p className="text-gray-500">Risk Level</p>
                    <h3 className="text-2xl font-black">
                      {manualResult.risk_level}
                    </h3>
                  </div>

                  <div className="col-span-1 border rounded-3xl p-6">
                    <h3 className="font-black text-xl mb-4">
                      Influencing Factors
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {manualResult.top_influencing_factors.map((f, i) => (
                        <span
                          key={i}
                          className="bg-orange-100 text-[#FF6B00] px-4 py-2 rounded-full font-bold"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 border rounded-3xl p-6">
                    <h3 className="font-black text-xl mb-4">
                      Retention Recommendations
                    </h3>

                    <div className="space-y-3">
                      {manualResult.retention_recommendations.map((rec, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-2xl">
                          <p className="font-bold">{rec.issue}</p>
                          <p className="text-gray-500 text-sm">
                            {rec.recommended_action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {page === "bulk" && (
            <section>
              <h2 className="text-4xl font-black">Bulk CSV Prediction</h2>
              <p className="text-gray-500 mt-2">
                Upload raw test.csv. Backend removes leakage columns, cleans
                data using preprocessor.pkl, and predicts all customers.
              </p>

              <label className="mt-8 block border-2 border-dashed border-orange-200 rounded-3xl p-12 text-center cursor-pointer hover:bg-orange-50">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkUpload}
                  className="hidden"
                />
                <Upload className="mx-auto text-[#FF6B00]" size={40} />
                <p className="text-xl font-black text-[#FF6B00] mt-4">
                  {loading ? "Processing CSV..." : "Upload CSV File"}
                </p>
              </label>

              {bulkResult && (
                <>
                  <div className="grid grid-cols-4 gap-5 mt-8">
                    <div className="bg-orange-50 p-6 rounded-3xl">
                      <p className="text-gray-500">Total Customers</p>
                      <h3 className="text-3xl font-black">
                        {bulkResult.total_customers}
                      </h3>
                    </div>

                    <div className="bg-red-50 p-6 rounded-3xl">
                      <p className="text-gray-500">Predicted Churn</p>
                      <h3 className="text-3xl font-black">
                        {bulkResult.predicted_churn_customers}
                      </h3>
                    </div>

                    <div className="bg-green-50 p-6 rounded-3xl">
                      <p className="text-gray-500">Not Churn</p>
                      <h3 className="text-3xl font-black">
                        {bulkResult.predicted_not_churn_customers}
                      </h3>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-3xl">
                      <p className="text-gray-500">Avg Probability</p>
                      <h3 className="text-3xl font-black">
                        {bulkResult.average_churn_probability}%
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="border rounded-3xl p-6">
                      <h3 className="font-black text-xl mb-4 flex gap-2">
                        <BarChart3 /> Risk Distribution
                      </h3>

                      <div className="h-72">
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              outerRadius={100}
                              label
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={index}
                                  fill={colors[index % colors.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="border rounded-3xl p-6">
                      <h3 className="font-black text-xl mb-4">
                        Bulk Summary
                      </h3>
                      <p className="text-gray-600">
                        The uploaded CSV was processed by removing leakage
                        columns such as Churn Reason, Churn Category, Churn
                        Score, Customer Status, and Churn before prediction.
                      </p>

                      <button
                        onClick={downloadCSV}
                        className="mt-6 bg-[#FF6B00] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2"
                      >
                        <Download size={18} />
                        Download Results CSV
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 border rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Prediction</th>
                          <th className="p-4">Probability</th>
                          <th className="p-4">Risk Level</th>
                          <th className="p-4">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {bulkResult.results.map((row) => (
                          <tr key={row.customer_index} className="border-t">
                            <td className="p-4">#{row.customer_index}</td>
                            <td className="p-4 font-bold">
                              {row.prediction}
                            </td>
                            <td className="p-4">
                              {row.churn_probability}%
                            </td>
                            <td className="p-4">
                              <span className="bg-orange-100 text-[#FF6B00] px-3 py-1 rounded-full font-bold">
                                {row.risk_level}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => viewBulkCustomerDetails(row.customer_data)}
                                className="bg-[#FF6B00] text-white px-4 py-2 rounded-full font-bold text-sm"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;