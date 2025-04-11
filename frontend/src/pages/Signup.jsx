import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./styles/SignupLogin.css";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/signup", {
        username,
        password,
      });
      setSuccess(res.data.message);
      setError("");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <>
      <h2>Signup</h2>
      <div className="loginContainer">
        <div className="inputFields">
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="btns">
          <button onClick={handleSignup}>Signup</button>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
        {error && <p>{error}</p>}
        {success && <p>{success}</p>}
      </div>
    </>
  );
}
