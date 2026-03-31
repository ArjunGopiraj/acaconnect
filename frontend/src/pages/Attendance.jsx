import axios from "../api/axios";

export default function Attendance({ eventId }) {
  const mark = () => {
    navigator.geolocation.getCurrentPosition(async pos => {
      await axios.post(`/attendance/${eventId}`, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      });
      alert("Attendance marked");
    });
  };

  return <button onClick={mark}>Mark Attendance</button>;
}
