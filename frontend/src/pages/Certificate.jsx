import axios from "../api/axios";

export default function Certificate({ eventId }) {
  const generate = async () => {
    await axios.post(`/certificates/${eventId}`);
    alert("Certificate generated");
  };

  return <button onClick={generate}>Get Certificate</button>;
}
