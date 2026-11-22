import { useState } from "react";
import { api } from "./api";
import ComplaintUpdates from "./ComplaintUpdates";
import { Badge, Brand, Icon, Modal, Notice } from "./ui";
import { dateText, dateKey, today, useOrders } from "./data";

export default function VendorDashboard({ onSignOut, signingOut }) {
  const { orders, loading, error, refresh } = useOrders();
  const [view, setView] = useState("queue");
  const [historyDate, setHistoryDate] = useState(today);
  const [dateBy, setDateBy] = useState("submitted");
  const history = view === "history";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [date, setDate] = useState(today);
  const [shift, setShift] = useState("MORNING");
  const [showComplaints, setShowComplaints] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [details, setDetails] = useState(null);
  const stock = orders.filter((o) => o.status === "RECEIVED");
  const tabs = [
    ["ALL", "All bags"],
    ["RECEIVED", "Received"],
    ["WASHING", "Washing"],
    ["READY", "Ready"],
    ["SUBMITTED", "Submitted"],
    ["COLLECTED", "Collected"],
  ];
  const collectedAt = (o) =>
    o.events?.find((e) => e.status === "COLLECTED")?.createdAt;
  const datedOrders = history
    ? orders.filter((o) => {
        if (!historyDate) {
          return true;
        }
        if (dateBy === "wash") {
          return o.lot?.date === historyDate;
        }
        const timestamp = dateBy === "collected" ? collectedAt(o) : o.createdAt;
        return timestamp && dateKey(timestamp) === historyDate;
      })
    : orders;
  const matchesStatus = (o, key) =>
    key === "ALL" ? history || o.status !== "COLLECTED" : o.status === key;
  const visible = datedOrders.filter(
    (o) =>
      matchesStatus(o, filter) &&
      `${o.bagNo} ${o.student.name}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  async function mutate(path, body, method = "PATCH") {
    setBusy(true);
    setMessage("");
    setActionError("");
    try {
      const result = await api(path, { method, body });
      setMessage(result.message || "Updated successfully.");
      setConfirm(null);
      await refresh();
    } catch (err) {
      setActionError(err.message);
      setConfirm(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  }
  function next(o) {
    if (o.status === "SUBMITTED") {
      return (
        <button
          className="table-action"
          disabled={busy}
          onClick={() =>
            mutate(`/orders/${o.id}/status`, { status: "RECEIVED" })
          }
        >
          Receive bag
        </button>
      );
    }
    if (o.status === "RECEIVED") {
      return <span className="muted">Awaiting wash</span>;
    }
    if (o.status === "WASHING") {
      return (
        <button
          className="table-action"
          disabled={busy}
          onClick={() => setConfirm({ order: o, type: "READY" })}
        >
          Mark ready
        </button>
      );
    }
    if (o.status === "READY") {
      return (
        <button
          className="table-action"
          disabled={busy}
          onClick={() => setConfirm({ order: o, type: "COLLECTED" })}
        >
          Mark collected
        </button>
      );
    }
    return <span className="muted">Handed over</span>;
  }
  return (
    <div className="staff-shell">
      <header className="staff-header">
        <div className="staff-brand-group">
          <Brand staff />
          <span className="workspace-label">Staff workspace</span>
        </div>
        <button
          className="table-action"
          disabled={signingOut}
          onClick={onSignOut}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </header>
      <main className="staff-main">
        <div className="staff-title">
          <div>
            <h1>{history ? "Laundry history" : "Laundry queue"}</h1>
            <p>
              {history
                ? "Find past orders by submission, wash or collection date."
                : "Manage incoming bags, wash batches and collections."}
            </p>
          </div>
          <time>{dateText(`${today()}T12:00:00+05:30`)}</time>
        </div>
        <nav
          className="staff-view-switch segments"
          aria-label="Staff view"
        >
          {[
            ["queue", "Current queue"],
            ["history", "History"],
          ].map(([value, text]) => (
            <button
              key={value}
              className={view === value ? "selected" : ""}
              aria-pressed={view === value}
              onClick={() => {
                setView(value);
                setFilter("ALL");
                setMessage("");
                setActionError("");
              }}
            >
              {text}
            </button>
          ))}
        </nav>
        <div
          className="staff-tabs"
          aria-label="Filter laundry queue"
        >
          {tabs.map(([key, label]) => (
            <button
              key={key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {label}
              <span>
                {datedOrders.filter((o) => matchesStatus(o, key)).length}
              </span>
            </button>
          ))}
        </div>
        <div className="staff-toolbar">
          <label className="search-input">
            <Icon name="search" />
            <input
              aria-label="Search bag or student"
              type="search"
              placeholder="Search bag or student"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {history ? (
            <div className="history-date-controls">
              <label>
                Date type
                <select
                  aria-label="History date type"
                  value={dateBy}
                  onChange={(e) => setDateBy(e.target.value)}
                >
                  <option value="submitted">Submitted on</option>
                  <option value="wash">Wash lot date</option>
                  <option value="collected">Collected on</option>
                </select>
              </label>
              <label>
                Date
                <input
                  aria-label="History date"
                  type="date"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                />
              </label>
              <button
                className="table-action"
                onClick={() => setHistoryDate("")}
              >
                All dates
              </button>
            </div>
          ) : (
            <div className="lot-controls">
              <input
                aria-label="Wash lot date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <div className="segments shift-tabs">
                {["MORNING", "EVENING"].map((s) => (
                  <button
                    key={s}
                    className={shift === s ? "selected" : ""}
                    onClick={() => setShift(s)}
                  >
                    {s === "MORNING" ? "Morning" : "Evening"}
                  </button>
                ))}
              </div>
              <button
                className="primary start-wash"
                disabled={busy || loading || !!error || !stock.length || !date}
                onClick={() => setConfirm({ type: "WASH" })}
              >
                Start wash · {stock.length}{" "}
                {stock.length === 1 ? "bag" : "bags"}
              </button>
            </div>
          )}
        </div>
        {history ? (
          <p className="stock-hint">
            <Icon
              name="history"
              size={17}
            />
            {historyDate
              ? `${dateBy === "submitted" ? "Submitted on" : dateBy === "wash" ? "Wash lot dated" : "Collected on"} ${dateText(`${historyDate}T12:00:00+05:30`)} · India time`
              : "Showing all dates"}
          </p>
        ) : (
          <p className="stock-hint">
            <Icon
              name="info"
              size={17}
            />
            All {stock.length} received bags will be assigned to the selected
            lot.
          </p>
        )}
        <Notice
          error={actionError || error}
          message={message}
          retry={error ? refresh : undefined}
        />
        <div className="table-container">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Bag number</th>
                  <th>Student</th>
                  <th>Clothes</th>
                  <th>Status</th>
                  <th>Wash lot</th>
                  {history && (
                    <>
                      <th>Submitted</th>
                      <th>Collected</th>
                    </>
                  )}
                  <th>{history ? "Details" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id}>
                    <td className="bag-cell">
                      <button
                        className="bag-link"
                        onClick={() => setDetails(o)}
                      >
                        {o.bagNo}
                      </button>
                    </td>
                    <td>{o.student.name}</td>
                    <td>{o.totalCount}</td>
                    <td>
                      <Badge status={o.status} />
                    </td>
                    <td>
                      {o.lot ? (
                        `${dateText(`${o.lot.date}T12:00:00+05:30`).replace(/ \d{4}/, "")} · ${o.lot.shift === "MORNING" ? "Morning" : "Evening"}`
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    {history && (
                      <>
                        <td>{dateText(o.createdAt, true)}</td>
                        <td>
                          {collectedAt(o)
                            ? dateText(collectedAt(o), true)
                            : "—"}
                        </td>
                      </>
                    )}
                    <td>
                      {history ? (
                        <button
                          className="table-action"
                          onClick={() => setDetails(o)}
                        >
                          View details
                        </button>
                      ) : (
                        next(o)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && (
            <div
              className="empty-state"
              role="status"
            >
              {loading
                ? "Loading the laundry queue…"
                : error
                  ? "Unable to load bags. Retry above."
                  : "No bags match this view."}
            </div>
          )}
          <div className="table-footer">
            <span>
              {visible.length} {visible.length === 1 ? "bag" : "bags"}
            </span>
            <button
              className="text-button muted"
              disabled={busy || loading}
              onClick={refresh}
            >
              Refresh queue
            </button>
          </div>
        </div>
        {!history && (
          <p className="staff-footnote">
            Bags received after this wash starts will stay in stock for the next
            lot.
          </p>
        )}
        <div className="staff-support">
          <button
            className="text-button"
            onClick={() => setShowComplaints(true)}
          >
            View complaints
          </button>
        </div>
      </main>
      {details && (
        <Modal
          title={`Bag ${details.bagNo}`}
          onClose={() => setDetails(null)}
        >
          <p>
            {details.student.name} · {details.totalCount} clothes
          </p>
          <p className="muted">Submitted {dateText(details.createdAt, true)}</p>
          <ol className="event-list">
            {details.events.map((event) => (
              <li key={event.id}>
                <strong>
                  {event.status === "READY"
                    ? "Ready for pickup"
                    : event.status.toLowerCase()}
                </strong>
                <time>{dateText(event.createdAt, true)}</time>
              </li>
            ))}
          </ol>
          {!history && (
            <form
              className="stack"
              onSubmit={async (e) => {
                e.preventDefault();
                const reason = new FormData(e.currentTarget).get("reason");
                await mutate(`/orders/${details.id}/delay`, { reason });
                setDetails(null);
              }}
            >
              <label className="field">
                Delay reason / update
                <textarea
                  name="reason"
                  defaultValue={details.delayReason}
                  maxLength={500}
                  rows="3"
                  placeholder="Explain a delay to the student…"
                  disabled={details.status === "COLLECTED"}
                />
              </label>
              <small className="muted">
                Leave blank to clear the delay note.
              </small>
              <button
                className="primary"
                disabled={busy || details.status === "COLLECTED"}
              >
                Save note
              </button>
            </form>
          )}
        </Modal>
      )}
      {showComplaints && (
        <ComplaintUpdates
          staff
          onClose={() => setShowComplaints(false)}
        />
      )}
      {confirm && (
        <Modal
          title={
            confirm.type === "WASH"
              ? "Start this wash lot?"
              : confirm.type === "READY"
                ? "Bag at the collection counter?"
                : "Confirm bag handover"
          }
          onClose={() => {
            if (!busy) {
              setConfirm(null);
            }
          }}
        >
          <p>
            {confirm.type === "WASH"
              ? `Move all ${stock.length} received bags into ${date}, ${shift.toLowerCase()}. This includes bags hidden by your search or filter.`
              : confirm.type === "READY"
                ? `Only mark ${confirm.order.bagNo} ready when the packed bag is at the counter for collection.`
                : `Confirm you have handed bag ${confirm.order.bagNo} to the student.`}
          </p>
          <div className="dialog-actions">
            <button
              className="table-action"
              disabled={busy}
              onClick={() => setConfirm(null)}
            >
              Cancel
            </button>
            <button
              className="primary"
              disabled={busy}
              onClick={() =>
                confirm.type === "WASH"
                  ? mutate("/lots/start-stock", { date, shift }, "POST")
                  : mutate(`/orders/${confirm.order.id}/status`, {
                      status: confirm.type,
                      atCounter: confirm.type === "READY",
                    })
              }
            >
              {busy
                ? "Updating…"
                : confirm.type === "WASH"
                  ? "Start wash"
                  : "Confirm"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
