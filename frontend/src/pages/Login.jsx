import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import toast from "react-hot-toast";
import "./styles/SignupLogin.css";
import axios from "axios";

export default function Login() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const result = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      localStorage.setItem("token", result.data.token);
      toast.success("Logged in successfully");
      setTimeout(() => (window.location.href = "/book"), 1500);
    } catch (error) {
      console.log("ERROR Login page : ", error);
      toast.error("Unable to login");
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <h2>Login</h2>
      <div className="loginContainer">
        <div className="inputFields">
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              onChange={(e) => setUserName(e.target.value)}
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
          <button onClick={login}>Login</button>
          <button onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </div>
    </>
  );
}
