import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { getUser } from "../auth";

const emptyRoom = {
  roomNumber: "",
  type: "single",
  price: "",
  capacity: 2,
  description: "",
  amenities: "",
};

function Admin() {
  const navigate = useNavigate();
  const user = getUser();
  const [tab, setTab] = useState("bookings");
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyRoom);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const loadRooms = () => api.get("/rooms").then((res) => setRooms(res.data));
  const loadBookings = () =>
    api.get("/bookings").then((res) => setBookings(res.data));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "admin") {
      loadRooms();
      loadBookings();
    }
    // eslint-disable-next-line
  }, []);

  if (!user) return null;
  if (user.role !== "admin") {
    return <p className="error">Admin access only.</p>;
  }

  const show = (ok, text) => {
    setMsg(ok ? text : "");
    setError(ok ? "" : text);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post("/rooms", {
        ...form,
        price: Number(form.price),
        capacity: Number(form.capacity),
        amenities: form.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      });
      setForm(emptyRoom);
      show(true, "Room added");
      loadRooms();
    } catch (err) {
      show(false, err.response?.data?.message || "Could not add room");
    }
  };

  const setStatus = async (id, status) => {
    try {
      await api.put(`/rooms/${id}`, { status });
      loadRooms();
    } catch (err) {
      show(false, err.response?.data?.message || "Update failed");
    }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await api.delete(`/rooms/${id}`);
      show(true, "Room deleted");
      loadRooms();
    } catch (err) {
      show(false, err.response?.data?.message || "Delete failed");
    }
  };

  const bookingAction = async (id, action) => {
    try {
      await api.put(`/bookings/${id}/${action}`);
      show(true, `Booking ${action} done`);
      loadBookings();
      loadRooms();
    } catch (err) {
      show(false, err.response?.data?.message || "Action failed");
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN");

  return (
    <div>
      <div className="section-head">
        <h2 className="section-title">Admin Panel</h2>
        <p className="section-sub">Manage rooms and guest bookings</p>
      </div>

      <div className="tabs">
        <button className={tab === "bookings" ? "active" : ""} onClick={() => setTab("bookings")}>
          Bookings ({bookings.length})
        </button>
        <button className={tab === "rooms" ? "active" : ""} onClick={() => setTab("rooms")}>
          Rooms ({rooms.length})
        </button>
      </div>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      {tab === "bookings" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    {b.user?.name || "Unknown"}
                    <div className="small">{b.user?.email}</div>
                  </td>
                  <td>{b.room?.roomNumber}</td>
                  <td>{fmt(b.checkIn)} to {fmt(b.checkOut)}</td>
                  <td>₹{b.totalPrice}</td>
                  <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                  <td><span className={`badge pay-${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                  <td className="row-actions">
                    {b.status === "confirmed" && (
                      <>
                        <button onClick={() => bookingAction(b._id, "checkin")}>Check-in</button>
                        <button className="danger" onClick={() => bookingAction(b._id, "cancel")}>Cancel</button>
                      </>
                    )}
                    {b.status === "checked-in" && (
                      <button onClick={() => bookingAction(b._id, "checkout")}>Check-out</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <p className="small">No bookings yet.</p>}
        </div>
      )}

      {tab === "rooms" && (
        <div>
          <form className="admin-form" onSubmit={addRoom}>
            <h3>Add a room</h3>
            <input name="roomNumber" placeholder="Room number" value={form.roomNumber} onChange={handleChange} required />
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
            <input name="price" type="number" min="0" placeholder="Price per night" value={form.price} onChange={handleChange} required />
            <input name="capacity" type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={handleChange} />
            <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <input name="amenities" placeholder="Amenities, separated by commas" value={form.amenities} onChange={handleChange} />
            <button type="submit">Add Room</button>
          </form>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r._id}>
                    <td>{r.roomNumber}</td>
                    <td style={{ textTransform: "capitalize" }}>{r.type}</td>
                    <td>₹{r.price}</td>
                    <td>
                      <select value={r.status} onChange={(e) => setStatus(r._id, e.target.value)}>
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="row-actions">
                      <button className="danger" onClick={() => deleteRoom(r._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;