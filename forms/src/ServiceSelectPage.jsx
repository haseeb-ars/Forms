import { services } from "./servicesConfig";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import "./ServiceSelectPage.css";

export default function ServiceSelectPage() {
  const navigate = useNavigate();
  const { setSelectedFormType } = useApp(); // get setter

  const handleSelect = (serviceId) => {
    setSelectedFormType(serviceId); // update context

    // 🔹 Special case for Travel service → start with consultation
    if (serviceId === "travel") {
      navigate(`/service/travel/consultation`);
    } else {
      // all other services go directly to patient form
      navigate(`/service/${serviceId}/patient`);
    }
  };

  // Placeholder services for the bento box layout
  const placeholderServices = [
    { id: "placeholder1", name: "Lorem Ipsum", color: "#6366f1", placeholder: true },
    { id: "placeholder2", name: "Dolor Sit", color: "#8b5cf6", placeholder: true },
    { id: "placeholder3", name: "Amet Consectetur", color: "#f59e0b", placeholder: true },
    { id: "placeholder4", name: "Adipiscing Elit", color: "#10b981", placeholder: true },
    { id: "placeholder5", name: "Sed Do Eiusmod", color: "#ef4444", placeholder: true },
    { id: "placeholder6", name: "Tempor Incididunt", color: "#06b6d4", placeholder: true }
  ];

  // Combine real services with placeholders
  const allServices = [...services, ...placeholderServices];

  return (
    <div className="bento-grid">
      {allServices.map((s) => (
        <div
          key={s.id}
          className={`bento-card ${s.placeholder ? "placeholder" : "service"}`}
          style={{ backgroundColor: s.color }}
          onClick={() => !s.placeholder && handleSelect(s.id)}
        >
          <div className="bento-content">
            <h3>{s.name}</h3>
            {s.placeholder && <p>Coming Soon</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
