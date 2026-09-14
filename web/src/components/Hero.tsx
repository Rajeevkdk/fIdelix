import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const routeStages = [
  {
    label: "Pickup",
    place: "Kathmandu hub",
    detail: "Shipment received and verified",
    code: "01",
  },
  {
    label: "Transit",
    place: "Global route",
    detail: "Route handoff in progress",
    code: "02",
  },
  {
    label: "Handoff",
    place: "Destination network",
    detail: "Ready for the final carrier",
    code: "03",
  },
];

export default function Hero() {
  const [activeStage, setActiveStage] = useState(0);
  const currentStage = routeStages[activeStage];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStage((stage) => (stage + 1) % routeStages.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero premium-hero">
      <div className="container hero-grid">
        <div className="hero-left reveal reveal-first">
          <p className="eyebrow">Premium Logistics Services</p>
          <h1>
            Delivering trust
            <br />
            across borders.
          </h1>
          <p className="hero-text">
            Fidelix Global Logistics provides international shipping support for
            documents, parcels, and cargo with reliable service, professional
            handling, and modern tracking.
          </p>

          <div className="hero-actions">
            <Link className="btn-primary" to="/track">
              Track Shipment
            </Link>
            <Link className="btn-secondary" to="/contact">
              Contact Us
            </Link>
          </div>

          <div className="hero-badges hero-proof-points">
            <span>Documents</span>
            <span>Parcels</span>
            <span>Cargo</span>
            <span>Global Reach</span>
          </div>
        </div>

        <div className="hero-right reveal reveal-second">
          <div className={`command-visual stage-${activeStage}`}>
            <div className="command-grid" />
            <div className="command-topline">
              <div className="command-brand">
                <img src={logo} alt="Fidelix" />
                <span>Route flow</span>
              </div>
              <span className="command-live"><i /> Updating</span>
            </div>

            <div className="command-map" aria-hidden="true">
              <div className="map-orbit map-orbit-one" />
              <div className="map-orbit map-orbit-two" />
              <svg viewBox="0 0 560 270" className="route-svg">
                <defs>
                  <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6be2ff" />
                    <stop offset="52%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#43b3ff" />
                  </linearGradient>
                </defs>
                <path className="route-path-shadow" d="M70 205 C170 28 370 38 488 97" />
                <path className="route-path" d="M70 205 C170 28 370 38 488 97" />
                <path className="route-path-flow" d="M70 205 C170 28 370 38 488 97" />
              </svg>
              <span className="route-hub route-hub-origin"><b>KTM</b><small>Origin</small></span>
              <span className="route-hub route-hub-destination"><b>GLB</b><small>Network</small></span>
              <span className="shipment-token"><b>FX</b></span>
              <span className="map-coordinate coordinate-one">27.7172 N</span>
              <span className="map-coordinate coordinate-two">85.3240 E</span>
            </div>

            <div className="command-readout">
              <div>
                <p className="mini-label">Route stage {currentStage.code} / 03</p>
                <h3>{currentStage.label}</h3>
                <p>{currentStage.detail}</p>
              </div>
              <div className="readout-location">
                <span>Now at</span>
                <strong>{currentStage.place}</strong>
              </div>
            </div>

            <div className="stage-switcher" role="tablist" aria-label="Fidelix route flow stages">
              {routeStages.map((stage, index) => (
                <button
                  type="button"
                  className={index === activeStage ? "is-active" : ""}
                  onClick={() => setActiveStage(index)}
                  role="tab"
                  aria-selected={index === activeStage}
                  key={stage.label}
                >
                  <span>{stage.code}</span>
                  {stage.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
