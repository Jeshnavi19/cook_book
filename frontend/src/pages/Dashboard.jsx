import { useEffect, useState } from "react";
import API from "../api";
import "../assets/stylesheets//styles.scss";

function Dashboard() {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    const res = await API.get("/history");
    setHistory(res.data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="page">
      <div className="card">
        <h2>Dashboard</h2>

        <div className="section">
          <h3>Search History</h3>
          <div className="list">
            {history.map((h) => (
              <p key={h._id}>{h.searchQuery}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
