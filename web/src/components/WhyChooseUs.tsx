const reasons = [
  "Professional and customer-focused support",
  "Clean and simple shipment tracking",
  "Reliable handling for documents, parcels, and cargo",
  "Built for local trust and international reach",
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="section soft-section">
      <div className="container why-grid">
        <div>
          <p className="eyebrow">Why Choose Fidelix</p>
          <h2>A modern logistics brand built on reliability</h2>
          <p className="section-copy">
            We are building Fidelix to give customers a more professional,
            transparent, and dependable logistics experience.
          </p>

          <div className="why-list">
            {reasons.map((reason) => (
              <div className="why-item" key={reason}>
                <span className="check-mark">✓</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card why-card">
          <p className="mini-label">Our promise</p>
          <h3>Simple shipping process. Strong customer confidence.</h3>
          <p>
            Fidelix is designed to combine operational reliability with a clean
            and customer-friendly experience, both online and offline.
          </p>

          <div className="why-metrics">
            <div>
              <strong>Customer-first</strong>
              <span>Clear support and communication</span>
            </div>
            <div>
              <strong>Tracking-ready</strong>
              <span>Modern shipment visibility</span>
            </div>
            <div>
              <strong>Growth-ready</strong>
              <span>Built for long-term expansion</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}