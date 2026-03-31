import axios from "../api/axios";
import { useState } from "react";

export default function CreateEvent() {
  const [title, setTitle] = useState("");

  const create = async () => {
    await axios.post("/events", { title });
    alert("Event Created");
  };

  return (
    <div>
      <h3>Create Event</h3>
      <input placeholder="Event Title" onChange={e => setTitle(e.target.value)} />
      <button onClick={create}>Create</button>
    </div>
  );
}
