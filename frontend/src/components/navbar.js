import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import API from "../api";
import "../assets/stylesheets//styles.scss";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const token = localStorage.getItem("token");
  const [searchValue, setSearchValue] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const profileRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get("q") || "");
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!token) {
        setUserEmail("");
        return;
      }

      try {
        const res = await API.get("/auth/me");
        if (isMounted) {
          setUserEmail(res.data.email || "");
        }
      } catch (err) {
        console.log(err);
        if (isMounted) {
          setUserEmail("");
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setProfileOpen(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchValue.trim();
    const path = location.pathname === "/favorites" ? "/favorites" : "/";

    if (!query) {
      setSearchParams({});
      navigate(path);
      return;
    }

    navigate(`${path}?q=${encodeURIComponent(query)}`);
  };

  const getInitial = () => {
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }

    return "U";
  };

  return (
    <div className="navbar">
      <h2 className="logo">CookBook</h2>

      {token ? (
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            className="navbar-search__input"
            type="search"
            placeholder="Search recipes or favorites"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button type="submit" className="navbar-search__button">
            Search
          </button>
        </form>
      ) : null}

      <div className="nav-right">
        {token ? (
          <Link to={{ pathname: "/", search: location.search }}>Home</Link>
        ) : null}

        {token && <Link to="/create">Create</Link>}
        {token && (
          <Link to={{ pathname: "/favorites", search: location.search }}>
            Favorites
          </Link>
        )}

        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <div className="profile-menu" ref={profileRef}>
            <button
              type="button"
              className="profile-trigger"
              aria-label="Open profile menu"
              onClick={() => setProfileOpen((current) => !current)}
            >
              {getInitial()}
            </button>

            {profileOpen ? (
              <div className="profile-dropdown">
                <div className="profile-dropdown__email">
                  {userEmail || "Loading profile..."}
                </div>

                <Link
                  to="/myrecipies"
                  className="profile-dropdown__link"
                  onClick={() => setProfileOpen(false)}
                >
                  My Recipes
                </Link>

                <button
                  type="button"
                  className="profile-dropdown__logout"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
