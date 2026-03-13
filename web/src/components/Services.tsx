const services = [
  {
    title: "Document Delivery",
    text: "Secure and time-sensitive shipment support for important documents.",
  },
  {
    title: "Parcel Shipping",
    text: "Reliable parcel forwarding with careful handling and shipment visibility.",
  },
  {
    title: "Cargo Service",
    text: "Flexible cargo solutions for larger and business-oriented shipments.",
  },
];

export default function Services() {
  return (
    <section id="services" className="section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Services</p>
          <h2>Solutions designed for global movement</h2>
          <p className="section-copy">
            We help customers move urgent documents, important parcels, and larger cargo
            through a service experience that feels clear and dependable.
          </p>
        </div>

        <div className="cards three-col">
          {services.map((item) => (
            <div className="card premium-card" key={item.title}>
              <div className="service-icon">{item.title.charAt(0)}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}