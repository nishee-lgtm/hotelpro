import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const photos = {
  single: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80",
  double: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=80",
  deluxe: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80",
  suite: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80",
};

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/rooms")
      .then((res) => setRooms(res.data))
      .catch(() => setError("Could not load rooms. Is the backend running?"));
  }, []);

  return (
    <div>
      <section className="hero">
        <p className="eyebrow">Luxury Stay</p>
        <h1>Where Every Stay<br />Becomes a Story</h1>
        <p className="tagline">
          Elegant rooms, refined service and effortless booking, crafted for
          guests who expect the finest.
        </p>
        <a className="btn" href="#rooms">Explore Rooms</a>
      </section>

      <div className="section-head" id="rooms">
        <div className="divider">◆</div>
        <h2 className="section-title">Rooms &amp; Suites</h2>
        <p className="section-sub">Choose the space that suits your stay</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="rooms">
        {rooms.map((room) => (
          <div className="room-card" key={room._id}>
            <div
              className="room-img"
              style={{ backgroundImage: `url(${photos[room.type]})` }}
            >
              <span className={`status ${room.status}`}>{room.status}</span>
            </div>
            <div className="room-body">
              <h3>Room {room.roomNumber}</h3>
              <p className="type">
                {room.type} · Sleeps {room.capacity}
              </p>
              <div className="chips">
                {room.amenities.map((a) => (
                  <span className="chip" key={a}>{a}</span>
                ))}
              </div>
              <div className="room-footer">
                <div className="price">
                  ₹{room.price}
                  <small> / night</small>
                </div>
                {room.status !== "maintenance" && (
                  <Link className="btn" to={`/book/${room._id}`}>
                    Book now
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rooms;