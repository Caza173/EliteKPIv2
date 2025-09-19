import React, { useState, useEffect } from "react";

export default function AgentEfficiencyScore() {
  const [inputs, setInputs] = useState({
    closedDeals: 32,
    prospectingCalls: 2500,
    hoursWorked: 1440,
    revenue: 185000,
    workingDays: 340,
  });

  const [scoreData, setScoreData] = useState({ score: "0", tier: "" });
  const [history, setHistory] = useState([]);

  const getTier = (score: number): string => {
    if (score >= 85) return "Platinum";
    if (score >= 70) return "Gold";
    if (score >= 55) return "Silver";
    if (score >= 40) return "Bronze";
    return "Needs Work";
  };

  const calculateScore = () => {
    const { closedDeals, prospectingCalls, hoursWorked, revenue, workingDays } = inputs;
    const closingRate = (closedDeals / prospectingCalls) * 100;
    const revenuePerHour = revenue / hoursWorked;
    const dealsPerDay = closedDeals / workingDays;
    const callsPerDay = prospectingCalls / workingDays;
    const revenuePerDeal = revenue / closedDeals;
    const callsPerDeal = prospectingCalls / closedDeals;

    const score = {
      closingRate: closingRate >= 4 ? 100 : closingRate >= 2 ? 60 : closingRate >= 1 ? 35 : 15,
      revenuePerHour: revenuePerHour >= 300 ? 100 : revenuePerHour >= 200 ? 80 : revenuePerHour >= 100 ? 60 : 40,
      dealsPerDay: dealsPerDay >= 0.25 ? 100 : dealsPerDay >= 0.15 ? 75 : dealsPerDay >= 0.1 ? 55 : 35,
      callsPerDay: callsPerDay >= 20 ? 100 : callsPerDay >= 15 ? 75 : callsPerDay >= 10 ? 50 : 30,
      revenuePerDeal: revenuePerDeal >= 10000 ? 100 : revenuePerDeal >= 8000 ? 75 : revenuePerDeal >= 6000 ? 60 : 40,
      callsPerDeal: callsPerDeal <= 40 ? 100 : callsPerDeal <= 60 ? 70 : callsPerDeal <= 80 ? 50 : 30,
    };

    const weightedTotal =
      score.closingRate * 0.25 +
      score.revenuePerHour * 0.25 +
      score.dealsPerDay * 0.15 +
      score.callsPerDay * 0.10 +
      score.revenuePerDeal * 0.10 +
      score.callsPerDeal * 0.15;

    return weightedTotal;
  };

  const saveScoreToDatabase = async (finalScore: number, finalTier: string) => {
    const today = new Date().toISOString().split("T")[0];
    const payload = {
      date: today,
      userId: "user-123", // Replace with dynamic user ID if using auth
      score: finalScore.toFixed(1),
      tier: finalTier,
      inputs,
    };

    try {
      const res = await fetch("/api/efficiency-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Network response was not ok");
    } catch (err) {
      console.error("Failed to save score to Neon DB", err);
    }
  };

  useEffect(() => {
    const score = calculateScore();
    const tier = getTier(score);
    setScoreData({ score: score.toFixed(1), tier });
    saveScoreToDatabase(score, tier);
  }, [inputs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Agent Efficiency Calculator</h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(inputs).map(([key, value]) => (
          <div key={key}>
            <label className="block font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
            <input
              type="number"
              name={key}
              value={value}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-lg font-semibold">
          Efficiency Score: <span className="text-blue-600">{scoreData.score} / 100</span>
        </p>
        <p className="text-md font-medium text-gray-700">Tier: <span className="text-green-600">{scoreData.tier}</span></p>
      </div>

      <div className="mt-8">
        <h3 className="text-md font-semibold mb-2">Efficiency Tiers</h3>
        <ul className="list-disc ml-6 text-sm">
          <li><strong>Platinum</strong>: 85–100</li>
          <li><strong>Gold</strong>: 70–84.9</li>
          <li><strong>Silver</strong>: 55–69.9</li>
          <li><strong>Bronze</strong>: 40–54.9</li>
          <li><strong>Needs Work</strong>: Below 40</li>
        </ul>
      </div>
    </div>
  );
}
