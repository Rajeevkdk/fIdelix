import { useState } from "react";

type TrackingEvent = {
  status: string;
  location: string;
  remarks: string | null;
  eventTime: string;
};

type TrackingResponse = {
  trackingNo: string;
  shipmentType: string;
  serviceType: string;
  receiverName: string;
  receiverCityCountry: string;
  status: string;
  forwardingTrackingNo: string | null;
  forwardingTrackingUrl: string | null;
  events: TrackingEvent[];
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function TrackingCard() {
  const [trackingNo, setTrackingNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<TrackingResponse | null>(null);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setData(null);

    if (!trackingNo.trim()) {
      setError("Please enter a tracking number.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/public/track/${encodeURIComponent(trackingNo.trim())}`
      );
      if (!res.ok) {
        throw new Error("Tracking number not found.");
      }
      const json = (await res.json()) as TrackingResponse;
      setData(json);
    } catch (err: any) {
      setError(err?.message ?? "Unable to fetch tracking details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section tracking-wrap">
      <div className="container">
        <div className="tracking-shell">
          <div className="section-head center-head">
            <p className="eyebrow">Track Shipment</p>
            <h2>Real-time tracking made simple</h2>
            <p className="section-copy center-copy">
              Enter your Fidelix tracking number below to view shipment progress.
            </p>
          </div>

          <div className="tracking-box premium-card">
            <form className="tracking-form" onSubmit={handleTrack}>
              <input
                type="text"
                placeholder="Enter Fidelix tracking number"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Tracking..." : "Track Now"}
              </button>
            </form>

            {error && <p className="tracking-message error">{error}</p>}

            {data && (
              <div className="tracking-result">
                <div className="tracking-summary premium-card">
                  <div className="summary-row">
                    <span>Fidelix Tracking No</span>
                    <strong>{data.trackingNo}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Current Status</span>
                    <strong className="status-badge">{data.status}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Shipment Type</span>
                    <strong>{data.shipmentType}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Service</span>
                    <strong>{data.serviceType || "—"}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Receiver</span>
                    <strong>{data.receiverName}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Destination</span>
                    <strong>{data.receiverCityCountry}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Forwarding Number</span>
                    <strong>{data.forwardingTrackingNo || "Will be updated once assigned by partner carrier"}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Official Carrier Tracking</span>
                    {data.forwardingTrackingUrl ? (
                      <a
                        href={data.forwardingTrackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="track-link-btn"
                      >
                        Open Carrier Tracking
                      </a>
                    ) : (
                      <span className="pending-text">Official carrier tracking link will be added once assigned.</span>
                    )}
                  </div>
                </div>

                <div className="timeline-wrap">
                  <h3>Shipment Timeline</h3>

                  {data.events.length === 0 ? (
                    <div className="card premium-card">
                      <p>No tracking events yet. Shipment has been created.</p>
                    </div>
                  ) : (
                    <div className="timeline">
                      {data.events.map((ev, idx) => (
                        <div className="timeline-item" key={idx}>
                          <div className="timeline-dot" />
                          <div className="timeline-card">
                            <h4>{ev.status}</h4>
                            <p><b>Location:</b> {ev.location || "—"}</p>
                            <p><b>Remarks:</b> {ev.remarks || "—"}</p>
                            <p><b>Time:</b> {new Date(ev.eventTime).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}