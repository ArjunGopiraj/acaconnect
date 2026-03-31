import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/events").then(res => setEvents(res.data));
  }, []);

  const register = async (id) => {
    await axios.post(`/registrations/${id}`);
    alert("Registered");
  };

  return (
    <div>
      <h3>Events</h3>
      {events.map(e => (
        <div key={e.id}>
          {e.title}
          <button onClick={() => register(e.id)}>Register</button>
        </div>
      ))}
    </div>
  );
}
