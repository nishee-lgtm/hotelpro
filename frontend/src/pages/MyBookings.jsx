import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { getUser } from "../auth";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [method, setMethod] = useState("upi");
  const [error, setError] = useState("");

  const load = () => {
    api
      .get("/bookings/my")
      .then((res) => setBookings(res.data))
      .catch(() => setError("Could not load bookings"));
  };

  useEffect(() => {
    if (!getUser()) {
      navigate("/login");
      return;
    }
    load();
  }, [navigate]);

  const pay = async (id) => {
    setError("");
    try {
      await api.put(`/bookings/${id}/pay`, { method });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    }
  };

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setError("");
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Cancel failed");
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN");

  return (
    <div>
      <h2>My Bookings</h2>
      {error && <p className="error">{error}</p>}
      {bookings.length === 0 && <p>No bookings yet.</p>}

      <div className="rooms">
        {bookings.map((b) => (
          <div className="room-card" key={b._id}>
            <h3>Room {b.room?.roomNumber}</h3>
            <p>
              {fmt(b.checkIn)} to {fmt(b.checkOut)}
            </p>
            <p>Guests: {b.guests}</p>
            <p>Total: ₹{b.totalPrice}</p>
            <p>
              <span className={`badge ${b.status}`}>{b.status}</span>{" "}
              <span className={`badge pay-${b.paymentStatus}`}>
                {b.paymentStatus}
              </span>
            </p>
            {b.transactionId && <p className="small">Txn: {b.transactionId}</p>}

            {b.status !== "cancelled" && b.paymentStatus === "pending" && (
              <div className="actions">
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
                <button onClick={() => pay(b._id)}>Pay ₹{b.totalPrice}</button>
              </div>
            )}

            {b.status === "confirmed" && (
              <button className="danger" onClick={() => cancel(b._id)}>
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;