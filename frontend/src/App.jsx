import React from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import "./App.css";
import Booking from "./pages/Booking.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  const token = localStorage.getItem("token");
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/book" /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/book" />}
        />

        <Route
          path="/signup"
          element={!token ? <Signup /> : <Navigate to="/book" />}
        />

        <Route
          path="/book"
          element={token ? <Booking /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
