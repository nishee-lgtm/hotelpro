import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { getUser } from "../auth";

function BookRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: 1 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getUser()) {
      navigate("/login");
      return;
    }
    api
      .get(`/rooms/${id}`)
      .then((res) => setRoom(res.data))
      .catch(() => setError("Room not found"));
  }, [id, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  let nights = 0;
  if (form.checkIn && form.checkOut) {
    const diff = new Date(form.checkOut) - new Date(form.checkIn);
    nights = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/bookings", {
        room: id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
      });
      navigate("/my-bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  };

  if (!room) return <p>{error || "Loading..."}</p>;

  const today = new Date().toISOString().split("T")[0];

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Book Room {room.roomNumber}</h2>
      <p>
        {room.type} · ₹{room.price} / night · Sleeps {room.capacity}
      </p>
      {error && <p className="error">{error}</p>}

      <label>Check-in</label>
      <input type="date" name="checkIn" min={today} value={form.checkIn} onChange={handleChange} required />

      <label>Check-out</label>
      <input type="date" name="checkOut" min={form.checkIn || today} value={form.checkOut} onChange={handleChange} required />

      <label>Guests</label>
      <input type="number" name="guests" min="1" max={room.capacity} value={form.guests} onChange={handleChange} required />

      {nights > 0 && (
        <p>
          <strong>{nights} night(s) = ₹{nights * room.price}</strong>
        </p>
      )}

      <button type="submit">Confirm Booking</button>
    </form>
  );
}

export default BookRoom;