import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Hero() {
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
          <div className="route-visual" aria-label="Shipment journey from Kathmandu to worldwide destinations">
            <div className="route-grid" />
            <div className="route-glow route-glow-one" />
            <div className="route-glow route-glow-two" />
            <div className="route-line">
              <span className="route-line-progress" />
            </div>
            <div className="route-node route-origin">
              <span className="route-pin">KTM</span>
              <strong>Kathmandu</strong>
              <small>Fidelix hub</small>
            </div>
            <div className="route-node route-destination">
              <span className="route-pin">GLB</span>
              <strong>Worldwide</strong>
              <small>Connected routes</small>
            </div>
            <div className="parcel-marker" aria-hidden="true" />

            <div className="hero-feature-card route-status-card">
              <div className="route-status-topline">
                <img src={logo} alt="Fidelix" className="hero-logo" />
                <div>
                  <p className="mini-label">In motion</p>
                  <strong>Every shipment deserves a clear story.</strong>
                </div>
              </div>
              <div className="route-status-copy">
                <span className="status-pulse" />
                <p>From a Kathmandu pickup to a global delivery, stay close to every update.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
