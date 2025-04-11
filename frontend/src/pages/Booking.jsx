import React, {useEffect, useState} from "react";
import axios from "axios";
import {Toaster} from "react-hot-toast";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import "./styles/Booking.css";

export default function Booking() {
  const [seats, setSeats] = useState([]);
  const [count, setCount] = useState("");
  const [bookedSeats, setBookedSeats] = useState([]);

  const navigate = useNavigate();

  const fetchSeats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/seats");
      setSeats(res.data);
    } catch (err) {
      toast.error("Failed to load seats.");
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    window.location.href = "/book";
  };

  const handleBook = async () => {
    if (!count || count < 1 || count > 7) {
      toast.error("You can book between 1 to 7 seats only.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/book",
        {
          count: parseInt(count),
        },
        {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}}
      );

      const {bookedSeats} = res.data;

      setBookedSeats(bookedSeats);
      setCount("");
      fetchSeats();
      toast.success("Seat successfully booked.");
    } catch (err) {
      setBookedSeats([]);
      toast.error(err.response.data.error);
    }
  };

  const resetSeats = async () => {
    await axios.post("http://localhost:5000/api/reset");
    fetchSeats();
    setBookedSeats([]);
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="container">
        {/* Seats */}
        <div className="App">
          <h3>Train Booking</h3>

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

          <div className="info">
            <span className="booked seat">
              Booked Seats ={" "}
              {80 - Number(seats.filter((s) => !s.booked).length)}
            </span>
            <span className="seat">
              Available Seats = {seats.filter((s) => !s.booked).length}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="bookedSeats">
            <p>Book Seats </p>
            <div className="bookedSeatNumbers">
              {bookedSeats.map((seat, index) => {
                return (
                  <div key={index} className="seat booked">
                    {seat}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="inputFldAndBookBtn">
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="Enter number of seats."
            />
            <button onClick={handleBook}>Book</button>
          </div>

          <button className="resetBtn" onClick={resetSeats}>
            Reset
          </button>
          <button className="logoutBtn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
