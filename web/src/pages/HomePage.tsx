import Hero from "../components/Hero";
import Services from "../components/Services";
import WhyChooseUs from "../components/WhyChooseUs";
import TrackingCard from "../components/TrackingCard";

function HomeLocation() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head center-head">
          <p className="eyebrow">Our Location</p>
          <h2>Visit our office in Kathmandu</h2>
          <p className="section-copy center-copy">
            Find Fidelix Global Logistics at Khadkagau, Kalanki-14, Kathmandu.
          </p>
        </div>

        <div className="contact-grid">
          <div className="premium-card contact-info-card">
            <h3>Office Address</h3>
            <p><b>Fidelix Global Logistics</b></p>
            <p>Khadkagau, Kalanki-14, Kathmandu</p>
            <p>Nepal, Postal Code: 44600</p>

            <div className="contact-links-block">
              <a
                className="contact-action"
                href="https://maps.app.goo.gl/d3fNmc8xPjuAGyx89"
                target="_blank"
                rel="noreferrer"
              >
                Get Directions
              </a>

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
            </div>
          </div>

          <div className="map-block premium-card" style={{ marginTop: 0 }}>
            <h3>Map Preview</h3>
            <div className="map-frame-wrap">
              <iframe
                title="Fidelix home location"
                src="https://maps.google.com/maps?q=Khadkagau%2C%20Kalanki-14%2C%20Kathmandu&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <WhyChooseUs />
      <TrackingCard />
      <HomeLocation />
    </>
  );
}