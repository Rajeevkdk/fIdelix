import { useState, type CSSProperties } from "react";

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
const journeySteps = ["Booking created", "With Fidelix", "In transit", "Delivered"];

function getJourneyProgress(data: TrackingResponse) {
  const status = `${data.status} ${data.events.map((event) => event.status).join(" ")}`.toLowerCase();

  if (/(delivered|complete)/.test(status)) return 3;
  if (/(out for delivery|arrived|transit|forwarded|departed)/.test(status)) return 2;
  if (/(picked|received|processing|collected)/.test(status) || data.events.length > 0) return 1;
  return 0;
}

function formatEventTime(eventTime: string) {
  const date = new Date(eventTime);
  if (Number.isNaN(date.getTime())) return "Time pending";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function TrackingCard() {
  const [trackingNo, setTrackingNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<TrackingResponse | null>(null);

  async function handleTrack(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setData(null);

    if (!trackingNo.trim()) {
      setError("Please enter a tracking number.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/public/track/${encodeURIComponent(trackingNo.trim())}`
      );
      if (!response.ok) {
        throw new Error("Tracking number not found.");
      }
      setData((await response.json()) as TrackingResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to fetch tracking details."
      );
    } finally {
      setLoading(false);
    }
  }

  const progressIndex = data ? getJourneyProgress(data) : 0;
  const progressPercent = (progressIndex / (journeySteps.length - 1)) * 100;
  const sortedEvents = data
    ? [...data.events].sort(
        (first, second) => new Date(second.eventTime).getTime() - new Date(first.eventTime).getTime()
      )
    : [];

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

          <div className="tracking-box premium-card tracking-search-card">
            <form className="tracking-form" onSubmit={handleTrack}>
              <label className="tracking-input-wrap">
                <span className="tracking-input-label">Fidelix tracking number</span>
                <input
                  type="text"
                  placeholder="Enter tracking number"
                  value={trackingNo}
                  onChange={(inputEvent) => setTrackingNo(inputEvent.target.value)}
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? <><span className="button-spinner" /> Finding shipment</> : "Track shipment"}
              </button>
            </form>

            {error && <p className="tracking-message error">{error}</p>}

            {data && (
              <div className="tracking-result" aria-live="polite">
                <div className="tracking-status-header">
                  <div>
                    <p className="mini-label">Shipment {data.trackingNo}</p>
                    <h3>{data.status}</h3>
                    <p>Latest movement and delivery progress in one view.</p>
                  </div>
                  <div className="delivery-crest" aria-hidden="true">
                    <span>{data.receiverCityCountry.slice(0, 2).toUpperCase()}</span>
                    <small>Destination</small>
                  </div>
                </div>

                <div
                  className="journey-progress"
                  style={{ "--journey-progress": `${progressPercent}%` } as CSSProperties}
                  aria-label={`Shipment progress: ${journeySteps[progressIndex]}`}
                >
                  <div className="journey-track"><span /></div>
                  {journeySteps.map((step, index) => (
                    <div
                      className={`journey-step ${index <= progressIndex ? "is-complete" : ""} ${index === progressIndex ? "is-current" : ""}`}
                      key={step}
                    >
                      <span className="journey-dot">{index + 1}</span>
                      <strong>{step}</strong>
                    </div>
                  ))}
                </div>

                <div className="tracking-detail-grid">
                  <div className="tracking-summary premium-card">
                    <div className="summary-header">
                      <h3>Shipment details</h3>
                      <strong className="status-badge"><span className="status-pulse" />{data.status}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Shipment type</span>
                      <strong>{data.shipmentType}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Service</span>
                      <strong>{data.serviceType || "Not assigned"}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Receiver</span>
                      <strong>{data.receiverName}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Destination</span>
                      <strong>{data.receiverCityCountry}</strong>
                    </div>
                    <div className="summary-row summary-row-partner">
                      <span>Partner carrier</span>
                      <strong>{data.forwardingTrackingNo || "Assignment pending"}</strong>
                    </div>
                    {data.forwardingTrackingUrl && (
                      <a
                        href={data.forwardingTrackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="track-link-btn"
                      >
                        Open official carrier tracking <span aria-hidden="true">-&gt;</span>
                      </a>
                    )}
                  </div>

                  <div className="timeline-wrap">
                    <div className="timeline-heading">
                      <div>
                        <p className="mini-label">Movement history</p>
                        <h3>Shipment timeline</h3>
                      </div>
                      <span>{sortedEvents.length} update{sortedEvents.length === 1 ? "" : "s"}</span>
                    </div>

                    {sortedEvents.length === 0 ? (
                      <div className="empty-timeline">
                        <span className="empty-timeline-orbit" aria-hidden="true" />
                        <h4>Your shipment is being prepared.</h4>
                        <p>The first scan will appear here as soon as it is received.</p>
                      </div>
                    ) : (
                      <div className="timeline">
                        {sortedEvents.map((shipmentEvent, index) => (
                          <article className="timeline-item" key={`${shipmentEvent.eventTime}-${index}`}>
                            <div className="timeline-marker">
                              <div className="timeline-dot" />
                              {index < sortedEvents.length - 1 && <div className="timeline-stem" />}
                            </div>
                            <div className="timeline-card">
                              <div className="timeline-card-topline">
                                <h4>{shipmentEvent.status}</h4>
                                <time dateTime={shipmentEvent.eventTime}>{formatEventTime(shipmentEvent.eventTime)}</time>
                              </div>
                              <p className="event-location">{shipmentEvent.location || "Location update pending"}</p>
                              {shipmentEvent.remarks && <p className="event-remarks">{shipmentEvent.remarks}</p>}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
