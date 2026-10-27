import { Link } from "react-router-dom";
import { getUser, logout } from "../auth";

function Navbar() {
  const user = getUser();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">HotelPro</Link>
      <div className="nav-links">
        <Link to="/">Rooms</Link>
        {user ? (
          <>
            <Link to="/my-bookings">My Bookings</Link>
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            <span className="role">{user.role}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;