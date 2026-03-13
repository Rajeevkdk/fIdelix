import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Hero() {
  return (
    <section className="hero premium-hero">
      <div className="container hero-grid">
        <div className="hero-left">
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

          <div className="hero-badges">
            <span>Document Delivery</span>
            <span>Parcel Shipping</span>
            <span>Cargo Service</span>
            <span>Global Reach</span>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-feature-card">
            <img src={logo} alt="Fidelix" className="hero-logo" />
            <p className="mini-label">Trusted logistics partner</p>
            <h3>Built for customers who want speed, clarity, and confidence.</h3>
            <p>
              From local support in Kathmandu to international delivery flow,
              Fidelix is built to help customers ship with confidence.
            </p>

            <div className="hero-card-grid">
              <div>
                <strong>Fast</strong>
                <span>Responsive support</span>
              </div>
              <div>
                <strong>Secure</strong>
                <span>Handled with care</span>
              </div>
              <div>
                <strong>Trackable</strong>
                <span>Status visibility</span>
              </div>
              <div>
                <strong>Global</strong>
                <span>Worldwide coverage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}