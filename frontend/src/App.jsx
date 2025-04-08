import React, {useEffect, useState} from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [seats, setSeats] = useState([]);
  const [count, setCount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSeats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/seats");
      setSeats(res.data);
    } catch (err) {
      setError("Failed to load seats.");
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const handleBook = async () => {
    if (!count || count < 1 || count > 7) {
      setError("You can only book 1 to 7 seats.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/book", {
        count: parseInt(count),
      });

      const {bookedSeats, inSameRow, fallback} = res.data;

      if (inSameRow) infoMsg += " ✅ (Same row)";
      else if (fallback) infoMsg += " ⚠️ (Not in same row)";

      setMessage(infoMsg);
      setError("");
      setCount("");
      fetchSeats();
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.error || "Booking failed.");
    }
  };

  const resetSeats = async () => {
    await axios.post("http://localhost:5000/reset");
    fetchSeats();
    setMessage("All bookings reset.");
    setError("");
  };

  return (
    <div className="App">
      <h1>Train Seat Booking</h1>

      <div className="seat-container">
        {seats.map((seat) => (
          <div
            key={seat.id}
            className={`seat ${seat.booked ? "booked" : "available"}`}
          >
            {seat.id}
          </div>
        ))}
      </div>

      <div className="controls">
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          placeholder="Enter number of seats."
        />
        <button onClick={handleBook}>Book</button>
        <button onClick={resetSeats}>Reset</button>
      </div>

      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="info">
        <p>✅ Available Seats: {seats.filter((s) => !s.booked).length} / 80</p>
      </div>
    </div>
  );
}

export default App;
