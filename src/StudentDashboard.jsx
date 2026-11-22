import { useState } from "react";
import { api } from "./api";
import ComplaintUpdates from "./ComplaintUpdates";
import { Badge, Brand, Icon, Modal, Notice } from "./ui";
import { dateText, shortId, statusName, useOrders, usePage } from "./data";

export default function StudentDashboard({ user, onSignOut, signingOut }) {
  const { orders, loading, error, refresh } = useOrders();
  const [route, go] = usePage("/home");
  const page = ["/new", "/history"].includes(route) ? route : "/home";
  const [count, setCount] = useState(1);
  const [filter, setFilter] = useState("All");
  const [showComplaints, setShowComplaints] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const active = orders.find((o) => o.status !== "COLLECTED");
  async function submit(e) {
    e.preventDefault();
    if (busy || active || !Number.isInteger(count) || count < 1 || count > 15) {
      return;
    }
    setBusy(true);
    setActionError("");
    setNotice("");
    try {
      await api("/orders", { method: "POST", body: { totalCount: count } });
      await refresh();
      setCount(1);
      go("/home");
      setNotice("Order submitted. Hand your bag to the laundry staff.");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const shown = orders.filter(
    (o) =>
      filter === "All" ||
      (filter === "Active"
        ? o.status !== "COLLECTED"
        : o.status === "COLLECTED"),
  );
  const collectedAt = (order) =>
    order.events?.find((e) => e.status === "COLLECTED")?.createdAt;
  return (
    <div className="student-shell">
      <header className="student-header">
        <div>
          <Brand />
          <span className="bag-pill">Bag {user.bagNo || "Unassigned"}</span>
        </div>
        <button
          className="sign-out"
          disabled={signingOut}
          onClick={onSignOut}
        >
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </header>
      <main className="student-main">
        <div className="page-heading">
          <h1>
            {page === "/new"
              ? "New order"
              : page === "/history"
                ? "Order history"
                : "My laundry"}
          </h1>
          <p>
            {page === "/new"
              ? "Count your clothes before handing over your bag."
              : page === "/history"
                ? "All your laundry, in one place."
                : "Keep track of your current bag."}
          </p>
        </div>
        <Notice
          error={actionError || error}
          message={notice}
          retry={error ? refresh : undefined}
        />
        {loading ? (
          <div
            className="empty-state"
            role="status"
          >
            Loading your laundry…
          </div>
        ) : (
          <>
            {page === "/home" &&
              (active ? (
                <>
                  <article className="card current-order">
                    <p className="eyebrow">CURRENT ORDER</p>
                    <div className="row between">
                      <h2>{shortId(active.id)}</h2>
                      <Badge status={active.status} />
                    </div>
                    <div className="order-summary">
                      <div>
                        <strong className="count-large">
                          {active.totalCount}
                        </strong>
                        <span>Total clothes</span>
                      </div>
                      <div>
                        <span>Submitted</span>
                        <strong>{dateText(active.createdAt, true)}</strong>
                      </div>
                    </div>
                    <Progress status={active.status} />
                  </article>
                  <article className="card collection-card">
                    <h2>Collection update</h2>
                    <div className="collection-message">
                      <Icon
                        name={active.status === "READY" ? "check" : "clock"}
                        size={32}
                      />
                      <div>
                        <strong>
                          {active.status === "READY"
                            ? "Your bag is ready to collect."
                            : active.status === "WASHING"
                              ? "Your bag is being washed."
                              : active.status === "RECEIVED"
                                ? "Your bag is with the staff."
                                : "Waiting for staff to receive your bag."}
                        </strong>
                        <p>
                          {active.delayReason ||
                            (active.status === "READY"
                              ? `Show bag ${user.bagNo} on your phone at the counter.`
                              : active.status === "SUBMITTED"
                                ? "Hand your bag to the laundry staff to begin."
                                : "Once it reaches the counter, its status will change to Ready for pickup.")}
                        </p>
                      </div>
                    </div>
                  </article>
                  {active.status !== "SUBMITTED" && (
                    <p className="help-line">
                      Need help?{" "}
                      <button
                        className="text-button"
                        onClick={() => setReport(active)}
                      >
                        Raise a complaint
                      </button>
                    </p>
                  )}
                </>
              ) : (
                <div className="card empty-state">
                  <Icon
                    name="bag"
                    size={42}
                  />
                  <h2>No bag in the laundry</h2>
                  <p>
                    Ready for a fresh start? Count your clothes and create a new
                    order.
                  </p>
                  <button
                    className="primary"
                    onClick={() => go("/new")}
                  >
                    New Order <Icon name="plus" />
                  </button>
                </div>
              ))}
            {page === "/new" && (
              <form onSubmit={submit}>
                <div className="card new-order-card">
                  <label className="field">
                    Bag number
                    <span className="readonly-input">
                      {user.bagNo || "Not assigned"}
                      <Icon name="lock" />
                    </span>
                    <small>Linked to your account</small>
                  </label>
                  <label
                    className="field count-label"
                    htmlFor="total-clothes"
                  >
                    Total clothes
                  </label>
                  <div className="count-stepper">
                    <button
                      type="button"
                      aria-label="Remove one clothing item"
                      disabled={busy || count <= 1 || !!active}
                      onClick={() => setCount(count - 1)}
                    >
                      <Icon
                        name="minus"
                        size={30}
                      />
                    </button>
                    <input
                      id="total-clothes"
                      aria-label="Total clothes"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="15"
                      step="1"
                      required
                      value={count}
                      disabled={busy || !!active}
                      onChange={(e) =>
                        setCount(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                    <button
                      type="button"
                      aria-label="Add one clothing item"
                      disabled={busy || count >= 15 || !!active}
                      onClick={() => setCount(Number(count) + 1)}
                    >
                      <Icon
                        name="plus"
                        size={30}
                      />
                    </button>
                  </div>
                  <p className="count-hint">Minimum 1 · Maximum 15 clothes</p>
                  <div className="info-box">
                    <Icon
                      name="info"
                      size={27}
                    />
                    <p>Enter the total number of clothes in your bag.</p>
                  </div>
                </div>
                {active && (
                  <div className="notice">
                    Your bag already has an active order. Collect it before
                    submitting again.{" "}
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => go("/home")}
                    >
                      View current order
                    </button>
                  </div>
                )}
                <button
                  className="primary wide submit-order"
                  disabled={
                    busy ||
                    !!active ||
                    !!error ||
                    !user.bagNo ||
                    !Number.isInteger(count) ||
                    count < 1 ||
                    count > 15
                  }
                >
                  {busy ? "Submitting…" : "Submit Order"}
                  <Icon name="arrow" />
                </button>
                <p className="form-caption">
                  Submit when you hand your bag to the laundry staff.
                </p>
              </form>
            )}
            {page === "/history" && (
              <>
                <div
                  className="filter-pills"
                  aria-label="Filter orders"
                >
                  {["All", "Active", "Collected"].map((f) => (
                    <button
                      key={f}
                      className={filter === f ? "active" : ""}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="history-list">
                  {shown.map((o) => (
                    <button
                      className="card history-card"
                      key={o.id}
                      onClick={() => setSelected(o)}
                    >
                      <div className="row">
                        <strong>{shortId(o.id)}</strong>
                        <Badge status={o.status} />
                      </div>
                      <p>Submitted {dateText(o.createdAt)}</p>
                      <div className="row between">
                        <h2>{o.totalCount} clothes</h2>
                        <Icon name="chevron" />
                      </div>
                      <div className="history-foot">
                        {o.status === "COLLECTED" && collectedAt(o)
                          ? `Collected ${dateText(collectedAt(o))}`
                          : statusName[o.status]}
                      </div>
                    </button>
                  ))}
                </div>
                {!shown.length && (
                  <div className="card empty-state">
                    <Icon
                      name="history"
                      size={36}
                    />
                    <h2>No orders here yet</h2>
                    <p>Your laundry history will appear here.</p>
                  </div>
                )}
                <p className="help-line">
                  <button
                    className="text-button"
                    onClick={() => setShowComplaints(true)}
                  >
                    My complaints & updates
                  </button>
                </p>
                <p className="history-caption">
                  Showing {shown.length}{" "}
                  {shown.length === 1 ? "order" : "orders"}
                </p>
              </>
            )}
          </>
        )}
      </main>
      <nav
        className="bottom-nav"
        aria-label="Student navigation"
      >
        {[
          ["/home", "home", "Home"],
          ["/new", "plus", "New Order"],
          ["/history", "history", "History"],
        ].map(([path, icon, text]) => (
          <button
            key={path}
            className={`${page === path ? "active" : ""} ${path === "/new" ? "nav-new" : ""}`}
            aria-current={page === path ? "page" : undefined}
            onClick={() => {
              go(path);
              setActionError("");
              setNotice("");
            }}
          >
            <span>
              <Icon
                name={icon}
                size={27}
              />
            </span>
            {text}
          </button>
        ))}
      </nav>
      {selected && (
        <Modal
          title={shortId(selected.id)}
          onClose={() => setSelected(null)}
        >
          <p>
            Bag {selected.bagNo} · {selected.totalCount} clothes
          </p>
          <ol className="event-list">
            {selected.events.map((e) => (
              <li key={e.id}>
                <strong>{statusName[e.status]}</strong>
                <time>{dateText(e.createdAt, true)}</time>
              </li>
            ))}
          </ol>
          {selected.status !== "SUBMITTED" && (
            <button
              className="primary wide"
              onClick={() => {
                setReport(selected);
                setSelected(null);
              }}
            >
              Report an issue
            </button>
          )}
        </Modal>
      )}
      {showComplaints && (
        <ComplaintUpdates onClose={() => setShowComplaints(false)} />
      )}
      {report && (
        <ComplaintForm
          order={report}
          onClose={() => setReport(null)}
        />
      )}
    </div>
  );
}
function Progress({ status }) {
  const step = status === "READY" ? 2 : status === "WASHING" ? 1 : 0;
  return (
    <ol className="progress-track">
      {["Pending", "Washing", "Ready to collect"].map((text, i) => (
        <li
          key={text}
          className={i < step ? "complete" : i === step ? "current" : ""}
        >
          <span>
            {i < step && (
              <Icon
                name="check"
                size={16}
              />
            )}
          </span>
          <p>{text}</p>
        </li>
      ))}
    </ol>
  );
}
function ComplaintForm({ order, onClose }) {
  const [type, setType] = useState("MISSING");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(`/orders/${order.id}/complaints`, {
        method: "POST",
        body: {
          type,
          description: fields.description,
          quantity: Number(fields.quantity),
        },
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Raise a complaint"
      onClose={onClose}
    >
      <p className="muted">
        {shortId(order.id)} · Bag {order.bagNo}
      </p>
      {sent ? (
        <div
          className="notice success"
          role="status"
        >
          Complaint submitted. Laundry staff can now review your issue.
        </div>
      ) : (
        <form
          className="stack"
          onSubmit={submit}
        >
          <Notice error={error} />
          <label className="field">
            Issue
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="MISSING">Missing clothes</option>
              <option value="EXTRA">Extra clothes</option>
              <option value="WASH_QUALITY">Poor washing / stains</option>
              <option value="COLOUR_DAMAGE">Colour damage</option>
            </select>
          </label>
          {["MISSING", "EXTRA"].includes(type) && (
            <label className="field">
              Number of clothes
              <input
                type="number"
                name="quantity"
                min="1"
                max={type === "MISSING" ? order.totalCount : 15}
                defaultValue="1"
                required
              />
            </label>
          )}
          <label className="field">
            Describe the issue
            <textarea
              name="description"
              placeholder="Tell the staff what happened…"
              required
              maxLength={1000}
              rows="4"
            />
          </label>
          <button
            className="primary wide"
            disabled={busy}
          >
            {busy ? "Submitting…" : "Submit complaint"}
          </button>
        </form>
      )}
    </Modal>
  );
}
