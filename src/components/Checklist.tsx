"use client";
import { useEffect, useState } from "react";

export function Checklist() {
  const [today, setToday] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/schedule/today").then(r => r.json()).then(setToday);
  }, []);
  return (
    <div className="space-y-4">
      {today.map((item) => (
        <div key={item.id} className="p-4 rounded-2xl shadow" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{item.med.name}</div>
              <div className="text-sm text-gray-500">{item.med.dosage}</div>
            </div>
            <button className="px-3 py-2 bg-black text-white rounded-xl" onClick={() => confirmDose(item.id)}>Taken</button>
          </div>
        </div>
      ))}
    </div>
  );
}

async function confirmDose(id: string) {
  await fetch("/api/schedule/confirm", { method: "POST", body: JSON.stringify({ doseLogId: id }) });
}
