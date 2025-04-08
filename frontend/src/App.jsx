import {useEffect, useState} from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [seats, setSeats] = useState([]);
  const [count, setCount] = useState("");
  const [error, setError] = useState("");

  const fetchSeats = async () => {
    const res = await axios.get("http://localhost:5000/seats");
    setSeats(res.data);
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const handleBook = async () => {
    try {
      await axios.post("http://localhost:5000/book", {count: parseInt(count)});
      fetchSeats();
      setCount("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const resetSeats = async () => {
    await axios.post("http://localhost:5000/reset");
    fetchSeats();
  };

  return (
    <div className="App">
      <h1>Ticket Booking</h1>
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
          placeholder="Enter number of seats"
        />
        <button onClick={handleBook}>Book</button>
        <button onClick={resetSeats}>Reset Booking</button>
        {error && <p className="error">{error}</p>}
      </div>
      <p>Booked Seats = {seats.filter((s) => s.booked).length}</p>
      <p>Available Seats = {seats.filter((s) => !s.booked).length}</p>
    </div>
  );
}

export default App;
