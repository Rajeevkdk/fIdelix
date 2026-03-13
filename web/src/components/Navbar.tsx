import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand-wrap">
          <img src={logo} alt="Fidelix Global Logistics" className="brand-logo" />
          <div>
            <div className="brand">Fidelix Global Logistics</div>
            <div className="brand-sub">Fast. Reliable. Worldwide.</div>
          </div>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/track">Track</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="nav-right">
          <div className="social-mini">
            <a
              href="https://www.facebook.com/profile.php?id=61587717066545"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" className="social-icon" fill="currentColor">
                <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.6 1.7-1.6h1.8V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.3v2.4H7.5v3.2h2.7V22h3.3z" />
              </svg>
            </a>

            <a
              href="https://www.instagram.com/fidelixglobal/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" className="social-icon" fill="currentColor">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7zm10.2 1.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z" />
              </svg>
            </a>

            <a
              href="https://www.tiktok.com/@fidelixglobal"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              title="TikTok"
            >
              <svg viewBox="0 0 24 24" className="social-icon" fill="currentColor">
                <path d="M14.5 3c.2 1.7 1.2 3.2 2.8 4.1 1 .6 2.1.9 3.2.9v3.1c-1.7 0-3.4-.5-4.8-1.4v6.1a5.8 5.8 0 1 1-5.8-5.8c.4 0 .8 0 1.2.1v3.2a2.8 2.8 0 1 0 1.6 2.5V3h1.8z" />
              </svg>
            </a>
          </div>

          <Link to="/track" className="nav-cta">
            Track Now
          </Link>
        </div>
      </div>
    </header>
  );
}