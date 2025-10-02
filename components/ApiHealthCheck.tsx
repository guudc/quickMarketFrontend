import { useEffect, useState } from "react";

export default function ApiHealthCheck() {
  const [status, setStatus] = useState<string>("Loading...");

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/health")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status + " - " + data.service);
      })
      .catch(() => setStatus("Failed to connect to backend"));
  }, []);

  return (
    <div style={{ padding: 16, background: "#f6f6f6", borderRadius: 8 }}>
      <strong>API Health Check:</strong>
      <div>{status}</div>
    </div>
  );
}
