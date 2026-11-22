import { useEffect, useState } from "react";
import { api } from "./api";
import { dateText, shortId } from "./data";
import { Modal, Notice } from "./ui";
const names = {
  MISSING: "Missing clothes",
  EXTRA: "Extra clothes",
  WASH_QUALITY: "Poor washing / stains",
  COLOUR_DAMAGE: "Colour damage",
};
const states = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  AWAITING_CONFIRMATION: "Awaiting student confirmation",
  RESOLVED: "Resolved",
};
export default function ComplaintUpdates({ staff = false, onClose }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api("/complaints")
      .then((data) => {
        if (active) {
          setComplaints(data.complaints);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  async function respond(id, status, message) {
    setBusy(true);
    setError("");
    try {
      await api(`/complaints/${id}`, {
        method: "PATCH",
        body: { status, message },
      });
      setComplaints((await api("/complaints")).complaints);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={staff ? "Laundry complaints" : "My complaints"}
      onClose={onClose}
    >
      <Notice error={error} />
      {loading ? (
        <p role="status">Loading complaints…</p>
      ) : !complaints.length ? (
        <p className="muted">No complaints yet.</p>
      ) : (
        complaints.map((c) => (
          <article
            className="complaint-update"
            key={c.id}
          >
            <div className="row between">
              <strong>{names[c.type]}</strong>
              <span className="muted">{states[c.status]}</span>
            </div>
            <small className="muted">
              {shortId(c.orderId)} · {c.order.bagNo}
            </small>
            <p>{c.description}</p>
            <details>
              <summary>Updates ({c.events.length})</summary>
              {c.events.map((e) => (
                <div
                  className="complaint-event"
                  key={e.id}
                >
                  <p>{e.message}</p>
                  <small className="muted">
                    {e.actorRole === "STAFF" ? "Staff" : "Student"} ·{" "}
                    {dateText(e.createdAt, true)}
                  </small>
                </div>
              ))}
            </details>
            {((staff && ["OPEN", "IN_PROGRESS"].includes(c.status)) ||
              (!staff && c.status === "AWAITING_CONFIRMATION")) && (
              <form
                className="stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  respond(c.id, f.get("status"), f.get("message"));
                }}
              >
                <label className="field">
                  Response
                  <textarea
                    name="message"
                    rows="2"
                    required
                    maxLength={1000}
                    placeholder={
                      staff
                        ? "Share an update with the student…"
                        : "Has the issue been resolved?"
                    }
                  />
                </label>
                <label className="field">
                  Status
                  <select
                    name="status"
                    aria-label="Complaint status"
                  >
                    {staff ? (
                      <>
                        <option value="IN_PROGRESS">In progress</option>
                        {c.status === "IN_PROGRESS" && (
                          <option value="AWAITING_CONFIRMATION">
                            Ask student to confirm
                          </option>
                        )}
                      </>
                    ) : (
                      <>
                        <option value="RESOLVED">Yes, resolved</option>
                        <option value="IN_PROGRESS">Still unresolved</option>
                      </>
                    )}
                  </select>
                </label>
                <button
                  className="primary"
                  disabled={busy}
                >
                  Save response
                </button>
              </form>
            )}
          </article>
        ))
      )}
    </Modal>
  );
}
