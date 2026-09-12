import { Link } from "react-router-dom";

const companyFacts = [
  {
    label: "Based in",
    value: "Kathmandu, Nepal",
    detail: "Local support for every question before, during, and after shipping.",
  },
  {
    label: "Reach us directly",
    value: "Phone, WhatsApp, email",
    detail: "Real people available when your shipment needs attention.",
  },
  {
    label: "Built around",
    value: "Clear updates",
    detail: "A simple view of the information that matters to your delivery.",
  },
];

export default function CompanyStory() {
  return (
    <section className="section company-story-section">
      <div className="container company-story-grid">
        <div className="company-story-copy reveal reveal-first">
          <p className="eyebrow">The Fidelix Difference</p>
          <h2>Logistics feels better when the company feels reachable.</h2>
          <p className="section-copy">
            Fidelix Global Logistics is built around a simple idea: shipping should come
            with a clear answer, a direct contact, and a confident next step.
          </p>
          <Link className="text-link" to="/contact">
            Talk with our team <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>

        <div className="company-facts reveal reveal-second">
          {companyFacts.map((fact) => (
            <article className="company-fact" key={fact.label}>
              <p>{fact.label}</p>
              <h3>{fact.value}</h3>
              <span>{fact.detail}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
