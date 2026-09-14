import { useState } from "react";

type Owner = {
  name: string;
  initials: string;
  photo: string;
};

const owners: Owner[] = [
  { name: "Rajeev Khadka", initials: "RK", photo: "/owners/rajee-khadka.jpg" },
  { name: "Nishant Shrestha", initials: "NS", photo: "/owners/nishant-shrestha.jpg" },
  { name: "Ronish Gurung", initials: "RG", photo: "/owners/ronish-gurung.jpg" },
];

function OwnerPortrait({ owner }: { owner: Owner }) {
  const [photoAvailable, setPhotoAvailable] = useState(true);

  return (
    <div className="owner-portrait">
      {photoAvailable ? (
        <img
          src={owner.photo}
          alt={owner.name}
          loading="lazy"
          onError={() => setPhotoAvailable(false)}
        />
      ) : (
        <span className="owner-monogram" aria-hidden="true">{owner.initials}</span>
      )}
      <span className="owner-portrait-shine" aria-hidden="true" />
    </div>
  );
}

export default function Ownership() {
  return (
    <section className="section ownership-section" id="ownership">
      <div className="container">
        <div className="section-head ownership-heading">
          <div>
            <p className="eyebrow">The People Behind Fidelix</p>
            <h2>Ownership &amp; leadership, close to every delivery.</h2>
          </div>
          <p className="section-copy">
            The team guiding Fidelix Global Logistics with a shared focus on dependable,
            customer-first service.
          </p>
        </div>

        <div className="owner-grid">
          {owners.map((owner, index) => (
            <article className={`owner-card owner-card-${index + 1}`} key={owner.name}>
              <OwnerPortrait owner={owner} />
              <div className="owner-card-copy">
                <span className="owner-label">Owner</span>
                <h3>{owner.name}</h3>
                <p>Fidelix Global Logistics</p>
              </div>
              <span className="owner-index" aria-hidden="true">0{index + 1}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
