import TrackingCard from "../components/TrackingCard";

export default function TrackingPage() {
  return (
    <section className="section page-top-space">
      <div className="container">
        <div className="section-head center-head">
          <p className="eyebrow">Track Shipment</p>
          <h1 className="page-title">Shipment Tracking</h1>
          <p className="section-copy center-copy">
            Use your Fidelix tracking number to check the latest shipment
            status and movement updates.
          </p>
        </div>
      </div>

      <TrackingCard />
    </section>
  );
}