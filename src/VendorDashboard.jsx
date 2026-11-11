import { useState, useMemo } from 'react'
import './VendorDashboard.css'

/* ─────────────────────────────────────────
   Inline SVG icons — no external dependencies
───────────────────────────────────────── */
function IconWash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="M4.93 4.93l3.54 3.54M15.54 15.54l3.54 3.54M19.07 4.93l-3.54 3.54M8.46 15.54l-3.54 3.54" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconWashing() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="2" width="18" height="20" rx="3" />
      <circle cx="12" cy="13" r="5" />
      <path d="M12 10a3 3 0 0 1 3 3" />
      <circle cx="7" cy="6" r="1" fill="currentColor" />
      <circle cx="10" cy="6" r="1" fill="currentColor" />
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function IconPackageCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  )
}

function IconLogOut() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconAlertTriangle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconClockWarning() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 15 15" />
    </svg>
  )
}

function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   Initial Mock Orders for Vendor
   Rules:
   - Exactly one service per order
   - Multiple services may be active at the same time
   - Clothes count strictly between 1 and 15
   - Laundry Bag No. (G for girls, B for boys)
   - No room numbers, no laundry stations, no weights, no detergent
───────────────────────────────────────── */
const INITIAL_VENDOR_ORDERS = [
  {
    id: 'WT-4832',
    bagNo: 'G285',
    service: 'Dry-cleaning',
    clothesCount: 3,
    submittedAt: 'Today, 9:00 AM',
    status: 'Ready',
    delayReason: null,
    complaint: null,
  },
  {
    id: 'WT-4830',
    bagNo: 'B442',
    service: 'Washing',
    clothesCount: 14,
    submittedAt: 'Today, 9:30 AM',
    status: 'Submitted',
    delayReason: null,
    complaint: null,
  },
  {
    id: 'WT-4828',
    bagNo: 'G108',
    service: 'Washing',
    clothesCount: 12,
    submittedAt: 'Today, 8:15 AM',
    status: 'Washing',
    delayReason: 'Wash cycle delayed 30 mins due to water pressure calibration',
    complaint: 'Student inquired: Washed batch taking longer than expected',
  },
  {
    id: 'WT-4826',
    bagNo: 'B215',
    service: 'Iron-only',
    clothesCount: 7,
    submittedAt: 'Today, 10:00 AM',
    status: 'Washing',
    delayReason: null,
    complaint: null,
  },
  {
    id: 'WT-4824',
    bagNo: 'G340',
    service: 'Iron-only',
    clothesCount: 6,
    submittedAt: 'Today, 10:30 AM',
    status: 'Submitted',
    delayReason: null,
    complaint: null,
  },
  {
    id: 'WT-4819',
    bagNo: 'B112',
    service: 'Dry-cleaning',
    clothesCount: 5,
    submittedAt: 'Yesterday, 3:45 PM',
    status: 'Ready',
    delayReason: 'Awaiting solvent batch processing',
    complaint: 'Reported delay past promised afternoon intake',
  },
  {
    id: 'WT-4814',
    bagNo: 'G285',
    service: 'Washing',
    clothesCount: 10,
    submittedAt: 'Nov 9, 2026, 9:00 AM',
    status: 'Collected',
    delayReason: null,
    complaint: null,
  },
  {
    id: 'WT-4798',
    bagNo: 'B304',
    service: 'Iron-only',
    clothesCount: 8,
    submittedAt: 'Nov 6, 2026, 11:00 AM',
    status: 'Collected',
    delayReason: null,
    complaint: null,
  },
  {
    id: 'WT-4782',
    bagNo: 'G192',
    service: 'Dry-cleaning',
    clothesCount: 4,
    submittedAt: 'Nov 2, 2026, 2:30 PM',
    status: 'Collected',
    delayReason: null,
    complaint: null,
  },
]

const STATUS_ORDER = ['Submitted', 'Washing', 'Ready', 'Collected']

export default function VendorDashboard({ userEmail, onSignOut }) {
  const [orders, setOrders] = useState(INITIAL_VENDOR_ORDERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [serviceFilter, setServiceFilter] = useState('All')
  const [selectedOrderForDelay, setSelectedOrderForDelay] = useState(null)
  const [delayInput, setDelayInput] = useState('')
  const [vendorNotice, setVendorNotice] = useState(null)

  /* Overview status counts */
  const countSubmitted = orders.filter(o => o.status === 'Submitted').length
  const countWashing = orders.filter(o => o.status === 'Washing').length
  const countReady = orders.filter(o => o.status === 'Ready').length
  const countCollected = orders.filter(o => o.status === 'Collected').length

  /* Filtered orders */
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search matching Bag No or Order ID
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        query === '' ||
        order.id.toLowerCase().includes(query) ||
        order.bagNo.toLowerCase().includes(query)

      // Filter by status
      const matchesStatus =
        statusFilter === 'All' || order.status.toLowerCase() === statusFilter.toLowerCase()

      // Filter by service
      const matchesService =
        serviceFilter === 'All' || order.service.toLowerCase() === serviceFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesService
    })
  }, [orders, searchQuery, statusFilter, serviceFilter])

  /* Status progression: Submitted -> Washing -> Ready -> Collected */
  function handleAdvanceStatus(orderId) {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order
        const currentIndex = STATUS_ORDER.indexOf(order.status)
        if (currentIndex < STATUS_ORDER.length - 1) {
          const nextStatus = STATUS_ORDER[currentIndex + 1]
          setVendorNotice(`Order ${order.id} status updated to "${nextStatus}".`)
          setTimeout(() => setVendorNotice(null), 4000)
          return { ...order, status: nextStatus }
        }
        return order
      })
    )
  }

  function handleSetStatus(orderId, newStatus) {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          setVendorNotice(`Order ${order.id} status set to "${newStatus}".`)
          setTimeout(() => setVendorNotice(null), 4000)
          return { ...order, status: newStatus }
        }
        return order
      })
    )
  }

  /* Open delay modal */
  function handleOpenDelayModal(order) {
    setSelectedOrderForDelay(order)
    setDelayInput(order.delayReason || '')
  }

  /* Save delay reason */
  function handleSaveDelayReason(e) {
    e.preventDefault()
    if (!selectedOrderForDelay) return

    const trimmed = delayInput.trim()
    setOrders(prev =>
      prev.map(o => (o.id === selectedOrderForDelay.id ? { ...o, delayReason: trimmed || null } : o))
    )

    setVendorNotice(
      trimmed
        ? `Delay reason recorded for order ${selectedOrderForDelay.id}.`
        : `Delay note cleared for order ${selectedOrderForDelay.id}.`
    )
    setTimeout(() => setVendorNotice(null), 4000)
    setSelectedOrderForDelay(null)
  }

  return (
    <div className="vendor-dashboard">
      {/* ── Top Navigation Bar ── */}
      <header className="dashboard-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon" aria-hidden="true">
              <IconWash />
            </span>
            <div className="brand-text">
              <span className="brand-name">WashTrack</span>
              <span className="brand-tag vendor-tag">Laundry Vendor Portal</span>
            </div>
          </div>

          <div className="nav-user">
            <div className="user-info">
              <span className="user-name">{userEmail ? userEmail.split('@')[0] : 'Vendor Operator'}</span>
              <span className="user-station-label">Central Station Operations</span>
            </div>
            <button
              type="button"
              className="btn-signout"
              onClick={onSignOut}
              title="Sign out to login screen"
            >
              <IconLogOut />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="dashboard-main">
        {vendorNotice && (
          <div className="vendor-notice-banner" role="status">
            <IconCheckCircle />
            <span>{vendorNotice}</span>
          </div>
        )}

        {/* ── Header Title Card ── */}
        <section className="dashboard-header-card">
          <div className="header-text">
            <h1 className="header-title">Vendor Order Queue</h1>
            <p className="header-subtitle">
              Manage incoming laundry bags, advance order statuses independently, and record delay reasons or review student inquiries.
            </p>
          </div>
        </section>

        {/* ── Status Overview Grid (4 Cards) ── */}
        <section className="status-overview" aria-label="Order status overview">
          <div className="status-card status-card--submitted">
            <div className="card-top">
              <span className="card-label">Submitted</span>
              <span className="card-icon" aria-hidden="true"><IconClock /></span>
            </div>
            <div className="card-count">{countSubmitted}</div>
            <div className="card-subtext">Awaiting intake</div>
          </div>

          <div className="status-card status-card--washing">
            <div className="card-top">
              <span className="card-label">Washing</span>
              <span className="card-icon" aria-hidden="true"><IconWashing /></span>
            </div>
            <div className="card-count">{countWashing}</div>
            <div className="card-subtext">In wash / dry / iron cycle</div>
          </div>

          <div className="status-card status-card--ready">
            <div className="card-top">
              <span className="card-label">Ready</span>
              <span className="card-icon" aria-hidden="true"><IconCheckCircle /></span>
            </div>
            <div className="card-count">{countReady}</div>
            <div className="card-subtext">Ready for student pickup</div>
          </div>

          <div className="status-card status-card--collected">
            <div className="card-top">
              <span className="card-label">Collected</span>
              <span className="card-icon" aria-hidden="true"><IconPackageCheck /></span>
            </div>
            <div className="card-count">{countCollected}</div>
            <div className="card-subtext">Completed & picked up</div>
          </div>
        </section>

        {/* ── Search & Filter Controls ── */}
        <section className="controls-card" aria-label="Search and filter orders">
          <div className="search-box">
            <span className="search-icon"><IconSearch /></span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by Laundry Bag No. (e.g. G285, B442) or Order ID (e.g. WT-4832)…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search query"
              >
                <IconClose />
              </button>
            )}
          </div>

          <div className="filters-row">
            {/* Filter by Status */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="status-filter-select">
                Status:
              </label>
              <div className="filter-pills" role="tablist" aria-label="Filter by status">
                {['All', 'Submitted', 'Washing', 'Ready', 'Collected'].map(st => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-pill${statusFilter === st ? ' filter-pill--active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Service */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="service-filter-select">
                Service:
              </label>
              <div className="filter-pills" role="tablist" aria-label="Filter by service">
                {['All', 'Washing', 'Dry-cleaning', 'Iron-only'].map(srv => (
                  <button
                    key={srv}
                    type="button"
                    className={`filter-pill${serviceFilter === srv ? ' filter-pill--active' : ''}`}
                    onClick={() => setServiceFilter(srv)}
                  >
                    {srv}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Order Queue Table ── */}
        <section className="queue-section">
          <div className="queue-header">
            <div>
              <h2 className="queue-title">Order Processing Queue</h2>
              <p className="queue-subtitle">
                Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </p>
            </div>
          </div>

          <div className="orders-card">
            {filteredOrders.length === 0 ? (
              <div className="empty-orders">
                <IconSearch />
                <p>No orders match the current search and filter criteria.</p>
                {(searchQuery || statusFilter !== 'All' || serviceFilter !== 'All') && (
                  <button
                    type="button"
                    className="btn-reset-filters"
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('All')
                      setServiceFilter('All')
                    }}
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="vendor-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Laundry Bag No.</th>
                      <th>Service</th>
                      <th>Clothes</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Update Status</th>
                      <th>Delays & Inquiries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => {
                      const nextStatus =
                        order.status === 'Submitted'
                          ? 'Washing'
                          : order.status === 'Washing'
                            ? 'Ready'
                            : order.status === 'Ready'
                              ? 'Collected'
                              : null

                      return (
                        <tr key={order.id} className="order-row">
                          {/* Order ID */}
                          <td className="col-id">
                            <span className="order-id-badge">{order.id}</span>
                          </td>

                          {/* Bag No */}
                          <td className="col-bag">
                            <span className="bag-badge">
                              {order.bagNo}
                            </span>
                          </td>

                          {/* Service (Exactly One) */}
                          <td className="col-service">
                            <span className="service-name-pill">
                              {order.service}
                            </span>
                            {order.service === 'Dry-cleaning' && (
                              <span className="paid-tag-small">Paid service</span>
                            )}
                          </td>

                          {/* Clothes Count (1 to 15) */}
                          <td className="col-count">
                            <span className="count-number">
                              {order.clothesCount} {order.clothesCount === 1 ? 'cloth' : 'clothes'}
                            </span>
                          </td>

                          {/* Submission Time */}
                          <td className="col-submitted">
                            <span className="submitted-time">{order.submittedAt}</span>
                          </td>

                          {/* Current Status Badge */}
                          <td className="col-status">
                            <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>
                              <span className="status-dot" aria-hidden="true" />
                              {order.status}
                            </span>
                          </td>

                          {/* Status Transition Control */}
                          <td className="col-actions">
                            <div className="status-control-wrap">
                              {nextStatus && (
                                <button
                                  type="button"
                                  className="btn-advance-status"
                                  onClick={() => handleAdvanceStatus(order.id)}
                                  title={`Advance status to ${nextStatus}`}
                                >
                                  <span>Move to {nextStatus}</span>
                                  <IconArrowRight />
                                </button>
                              )}
                              <select
                                className="status-select"
                                value={order.status}
                                onChange={e => handleSetStatus(order.id, e.target.value)}
                                aria-label={`Set status for order ${order.id}`}
                              >
                                <option value="Submitted">Submitted</option>
                                <option value="Washing">Washing</option>
                                <option value="Ready">Ready</option>
                                <option value="Collected">Collected</option>
                              </select>
                            </div>
                          </td>

                          {/* Delays & Student Complaints */}
                          <td className="col-issues">
                            <div className="issues-stack">
                              {order.complaint && (
                                <div className="complaint-pill" title={order.complaint}>
                                  <IconAlertTriangle />
                                  <span>Complaint: {order.complaint}</span>
                                </div>
                              )}
                              {order.delayReason ? (
                                <div className="delay-pill" title={order.delayReason}>
                                  <IconClockWarning />
                                  <span>Delay: {order.delayReason}</span>
                                </div>
                              ) : null}
                              <button
                                type="button"
                                className="btn-manage-delay"
                                onClick={() => handleOpenDelayModal(order)}
                                title="Record or update delay reason"
                              >
                                <IconEdit />
                                <span>{order.delayReason ? 'Edit Delay Reason' : 'Add Delay Reason'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Modal: Record Delay Reason & View Complaint ── */}
      {selectedOrderForDelay && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-delay-title">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon" aria-hidden="true">
                  <IconClockWarning />
                </span>
                <h3 id="modal-delay-title" className="modal-title">
                  Order Note & Delays: {selectedOrderForDelay.id}
                </h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setSelectedOrderForDelay(null)}
                aria-label="Close dialog"
              >
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleSaveDelayReason} className="modal-form">
              <div className="modal-order-summary">
                <div className="summary-item">
                  <span className="summary-lbl">Laundry Bag No.</span>
                  <strong className="summary-val">{selectedOrderForDelay.bagNo}</strong>
                </div>
                <div className="summary-item">
                  <span className="summary-lbl">Service</span>
                  <strong className="summary-val">{selectedOrderForDelay.service}</strong>
                </div>
                <div className="summary-item">
                  <span className="summary-lbl">Quantity</span>
                  <strong className="summary-val">
                    {selectedOrderForDelay.clothesCount} clothes
                  </strong>
                </div>
                <div className="summary-item">
                  <span className="summary-lbl">Status</span>
                  <span className={`status-badge status-badge--${selectedOrderForDelay.status.toLowerCase()}`}>
                    {selectedOrderForDelay.status}
                  </span>
                </div>
              </div>

              {/* Show student complaint if one exists */}
              {selectedOrderForDelay.complaint ? (
                <div className="modal-complaint-box">
                  <div className="complaint-box-title">
                    <IconAlertTriangle />
                    <span>Student Complaint / Inquiry</span>
                  </div>
                  <p className="complaint-box-content">{selectedOrderForDelay.complaint}</p>
                </div>
              ) : (
                <div className="modal-complaint-box modal-complaint-box--none">
                  <span>No student complaints recorded for this order.</span>
                </div>
              )}

              {/* Place to record/update delay reason */}
              <div className="form-group">
                <label className="form-label" htmlFor="vendor-delay-reason">
                  Record Delay Reason
                </label>
                <textarea
                  id="vendor-delay-reason"
                  rows="3"
                  className="modal-textarea"
                  placeholder="e.g. Dry-cleaning cycle waiting for solvent replenishment, pressing iron heating element check..."
                  value={delayInput}
                  onChange={e => setDelayInput(e.target.value)}
                />
                <span className="form-hint">
                  This explanation is logged for this order and visible in the processing queue.
                </span>
              </div>

              <div className="modal-actions">
                {selectedOrderForDelay.delayReason && (
                  <button
                    type="button"
                    className="btn-modal-clear"
                    onClick={() => setDelayInput('')}
                  >
                    Clear Note
                  </button>
                )}
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setSelectedOrderForDelay(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Save Delay Reason
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
