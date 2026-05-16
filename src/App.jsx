import { useState, useEffect } from "react";
import { ref, push, onValue, remove } from "firebase/database";
import { db } from "./firebase";
import "./App.css";

function App() {
  // =====================
  // STATE
  // =====================
  const [queue, setQueue] = useState([]);
  const [name, setName] = useState("");
  const [ticket, setTicket] = useState("");
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("isAdmin") === "true";
  });

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  const [password, setPassword] = useState("");
  const ADMIN_PASSWORD = "help123";

  // =====================
  // FIREBASE LISTENER
  // =====================
  useEffect(() => {
    const queueRef = ref(db, "queue");

    return onValue(queueRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setQueue([]);
        return;
      }

      const formatted = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      formatted.sort((a, b) => a.createdAt - b.createdAt);

      setQueue(formatted);
    });
  }, []);

  // =====================
  // ADD TO QUEUE
  // =====================
  const addToQueue = async () => {
    if (!name.trim()) return;

    await push(ref(db, "queue"), {
      name: name.trim(),
      ticket: ticket.trim(),
      createdAt: Date.now(),
    });

    setName("");
    setTicket("");
  };
  // =====================
  // Update time since every 30 sec
  // =====================
  useEffect(() => {
    const interval = setInterval(() => {
      setQueue((prev) => [...prev]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =====================
  // ADMIN FUNCTIONS
  // =====================
  const removeFromQueue = async (id) => {
    await remove(ref(db, `queue/${id}`));
  };

  const clearQueue = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear the entire queue? This cannot be undone."
    );

    if (!confirmClear) return;

    queue.forEach((item) => {
      remove(ref(db, `queue/${item.id}`));
    });
  };

  const nextPerson = async () => {
    if (queue.length === 0) return;
    await removeFromQueue(queue[0].id);
  };

  // =====================
  // Time since added
  // =====================
  const getTimeSince = (timestamp) => {
    const diff = Date.now() - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return `${seconds}s ago`;
    if (hours < 1) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  // =====================
  // RENDER
  // =====================
  return (
    <div className="container">

      <h1>Jesus Queue</h1>

      {/* =====================
        ADMIN PANEL (SIDE)
    ===================== */}
      <div className="adminPanel">
        <h3>Admin</h3>

        {!isAdmin ? (
          <>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (password === ADMIN_PASSWORD) {
                    setIsAdmin(true);
                    localStorage.setItem("isAdmin", "true");
                  }
                }
              }}
            />

            <button
              onClick={() => {
                if (password === ADMIN_PASSWORD) {
                  setIsAdmin(true);
                  localStorage.setItem("isAdmin", "true");
                }
              }}
            >
              Login
            </button>
          </>
        ) : (
          <>
            <button onClick={nextPerson}>Next</button>
            <button onClick={clearQueue}>Clear</button>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>

      {/* =====================
        INPUT FORM (PUBLIC ONLY)
    ===================== */}
      {!isAdmin && (
        <div className="form" style={{ marginBottom: 20 }}>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Ticket link (optional)"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
          />

          <button onClick={addToQueue}>Join Queue</button>
        </div>
      )}

      {/* =====================
        QUEUE LIST
    ===================== */}
      <h2>Current Queue</h2>

      {queue.length === 0 ? (
        <p>No one in queue</p>
      ) : (
        queue.map((item, index) => (
          <div
            key={item.id}
            className={`card ${index === 0 ? "activeCard" : ""}`}
          >
            <strong>
              {index + 1}. {item.name}
            </strong>

            {/* TIME SINCE ADDED */}
            <div className="time">
              {getTimeSince(item.createdAt)}
            </div>

            {/* TICKET LINK */}
            {item.ticket && (
              <div>
                <a href={item.ticket} target="_blank" rel="noreferrer">
                  Ticket
                </a>
              </div>
            )}

          </div>
        ))
      )}

    </div>
  );
}

export default App;