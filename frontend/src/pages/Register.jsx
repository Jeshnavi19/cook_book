import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "../assets/stylesheets//styles.scss";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      await API.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch {
      console.error("Error registering");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Register</h2>

        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={register}>Register</button>
      </div>
    </div>
  );
}

export default Register;
