import React, {useEffect, useState} from "react";
import axios from "axios";
import {Toaster} from "react-hot-toast";
import toast from "react-hot-toast";
import "./App.css";

function App() {
  const [seats, setSeats] = useState([]);
  const [count, setCount] = useState("");
  const [bookedSeats, setBookedSeats] = useState([]);
  const [message, setMessage] = useState({});

  const fetchSeats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/seats");
      setSeats(res.data);
    } catch (err) {
      setMessage({msgType: "error", msgBody: "Failed to load seats."});
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  useEffect(() => {
    console.log("Message : ", message);
  }, [message]);

  const handleBook = async () => {
    if (!count || count < 1 || count > 7) {
      setMessage({
        msgType: "error",
        msgBody: "You can only book 1 to 7 seats.",
      });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/book", {
        count: parseInt(count),
      });

      console.log("Response: ", res.data);

      const {bookedSeats} = res.data;

      setBookedSeats(bookedSeats);
      setMessage({msgType: "success", msgBody: res.data.successMessage});
      setCount("");
      fetchSeats();
      message.msgType === "success"
        ? toast.success(message.msgBody)
        : toast.error(message.msgBody);
    } catch (err) {
      setBookedSeats([]);
      setMessage({
        msgType: "error",
        msgBody: err.response.data.error,
      });
      toast.error(message.msgBody);
    }
  };

  const resetSeats = async () => {
    await axios.post("http://localhost:5000/reset");
    fetchSeats();
    setBookedSeats([]);
    setMessage({});
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
        </div>
      </div>
    </>
  );
}

export default App;
