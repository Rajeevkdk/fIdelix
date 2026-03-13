import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function openMailClient(e: React.FormEvent) {
    e.preventDefault();

    const finalSubject = encodeURIComponent(subject || "Inquiry from Fidelix website");
    const finalBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:logisticsfidelix@gmail.com?subject=${finalSubject}&body=${finalBody}`;
  }

  return (
    <section className="section page-top-space">
      <div className="container">
        <div className="section-head center-head">
          <p className="eyebrow">Contact Us</p>
          <h1 className="page-title">Let’s talk about your shipment</h1>
          <p className="section-copy center-copy">
            Reach out to Fidelix Global Logistics for parcel support,
            international shipment inquiries, or business collaboration.
          </p>
        </div>

        <div className="contact-grid">
          <div className="premium-card contact-info-card">
            <h3>Office Information</h3>
            <p><b>Address:</b> Khadkagau, Kalanki-14, Kathmandu</p>
            <p><b>Postal Code:</b> 44600</p>
            <p><b>Email:</b> logisticsfidelix@gmail.com</p>

            <div className="contact-links-block">
              <a
                className="contact-action"
                href="https://wa.me/9779851430914"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp: +977 9851430914
              </a>

              <a
                className="contact-action"
                href="https://wa.me/9779700047788"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp: +977 9700047788
              </a>

              <a
                className="contact-action"
                href="mailto:logisticsfidelix@gmail.com"
              >
                Email Us Directly
              </a>

              <a
                className="contact-action"
                href="https://maps.app.goo.gl/d3fNmc8xPjuAGyx89"
                target="_blank"
                rel="noreferrer"
              >
                Get Directions
              </a>
            </div>

            <div className="social-row">
              <a href="https://www.facebook.com/profile.php?id=61587717066545" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://www.instagram.com/fidelixglobal/" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.tiktok.com/@fidelixglobal" target="_blank" rel="noreferrer">TikTok</a>
            </div>
          </div>

          <div className="premium-card contact-form-card">
            <h3>Send us a message</h3>
            <form className="contact-form" onSubmit={openMailClient}>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <textarea
                placeholder="Write your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />

              <button type="submit">Send Message</button>
            </form>

            <p className="form-note">
              This opens your email app with your message pre-filled.
            </p>
          </div>
        </div>

        <div className="map-block premium-card">
          <h3>Find us on the map</h3>
          <div className="map-frame-wrap">
            <iframe
              title="Fidelix location"
              src="https://maps.google.com/maps?q=Khadkagau%2C%20Kalanki-14%2C%20Kathmandu&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}