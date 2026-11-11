import { useState } from 'react'
import './StudentDashboard.css'

/* ─────────────────────────────────────────
   Inline SVG icons
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

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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

function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   Initial Mock Orders
   Rule: At most ONE uncollected order (Submitted,
   Washing, or Ready) at any time. All other
   past orders are marked Collected.
   Categories: Washing, Dry-cleaning, Iron-only
   No weights, detergents, wash methods, notes, or station info.
───────────────────────────────────────── */
const INITIAL_ORDERS = [
  {
    id: 'WT-4825',
    services: [
      { category: 'Washing', count: 10 },
      { category: 'Dry-cleaning', count: 2 },
      { category: 'Iron-only', count: 4 },
    ],
    placedAt: 'Today, 8:15 AM',
    timeline: 'Est. Ready: Today, 3:00 PM',
    status: 'Washing',
  },
  {
    id: 'WT-4814',
    services: [
      { category: 'Washing', count: 12 },
    ],
    placedAt: 'Nov 9, 2026, 9:00 AM',
    timeline: 'Collected: Nov 9, 2026',
    status: 'Collected',
  },
  {
    id: 'WT-4798',
    services: [
      { category: 'Washing', count: 8 },
      { category: 'Iron-only', count: 5 },
    ],
    placedAt: 'Nov 6, 2026, 11:00 AM',
    timeline: 'Collected: Nov 7, 2026',
    status: 'Collected',
  },
  {
    id: 'WT-4782',
    services: [
      { category: 'Dry-cleaning', count: 4 },
    ],
    placedAt: 'Nov 2, 2026, 2:30 PM',
    timeline: 'Collected: Nov 3, 2026',
    status: 'Collected',
  },
  {
    id: 'WT-4760',
    services: [
      { category: 'Washing', count: 14 },
      { category: 'Iron-only', count: 6 },
    ],
    placedAt: 'Oct 28, 2026, 1:15 PM',
    timeline: 'Collected: Oct 29, 2026',
    status: 'Collected',
  },
  {
    id: 'WT-4735',
    services: [
      { category: 'Dry-cleaning', count: 3 },
      { category: 'Iron-only', count: 3 },
    ],
    placedAt: 'Oct 21, 2026, 10:00 AM',
    timeline: 'Collected: Oct 22, 2026',
    status: 'Collected',
  },
]

export default function StudentDashboard({ userEmail, onSignOut }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [activeFilter, setActiveFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderNotice, setOrderNotice] = useState(null)

  /* New Order Form State: Clothes count per category */
  const [washingCount, setWashingCount] = useState(6)
  const [dryCleaningCount, setDryCleaningCount] = useState(0)
  const [ironOnlyCount, setIronOnlyCount] = useState(2)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Rule: Check for any active (uncollected) order */
  const activeOrder = orders.find(o => o.status !== 'Collected')
  const hasActiveOrder = Boolean(activeOrder)

  /* Dynamic status counts */
  const countSubmitted = orders.filter(o => o.status === 'Submitted').length
  const countWashing = orders.filter(o => o.status === 'Washing').length
  const countReady = orders.filter(o => o.status === 'Ready').length
  const countCollected = orders.filter(o => o.status === 'Collected').length

  const filteredOrders = activeFilter === 'All'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase())

  /* Total clothes selected in order modal */
  const totalClothes = Number(washingCount || 0) + Number(dryCleaningCount || 0) + Number(ironOnlyCount || 0)

  function handleCreateOrder(e) {
    e.preventDefault()

    if (hasActiveOrder) {
      setFormError('You already have an active order. New orders can only be placed once the current one is Collected.')
      return
    }

    if (totalClothes <= 0) {
      setFormError('Please enter at least 1 cloth in any category.')
      return
    }

    setFormError('')
    setIsSubmitting(true)

    setTimeout(() => {
      const generatedId = `WT-${Math.floor(4830 + Math.random() * 90)}`
      const services = []
      if (Number(washingCount) > 0) {
        services.push({ category: 'Washing', count: Number(washingCount) })
      }
      if (Number(dryCleaningCount) > 0) {
        services.push({ category: 'Dry-cleaning', count: Number(dryCleaningCount) })
      }
      if (Number(ironOnlyCount) > 0) {
        services.push({ category: 'Iron-only', count: Number(ironOnlyCount) })
      }

      const newOrder = {
        id: generatedId,
        services,
        placedAt: 'Just now',
        timeline: 'Est. Ready: Tomorrow, 12:00 PM',
        status: 'Submitted',
      }

      setOrders(prev => [newOrder, ...prev])
      setIsSubmitting(false)
      setIsModalOpen(false)
      setWashingCount(6)
      setDryCleaningCount(0)
      setIronOnlyCount(2)
      setOrderNotice(`Order ${generatedId} created successfully!`)

      setTimeout(() => {
        setOrderNotice(null)
      }, 5000)
    }, 500)
  }

  /* Simulation helper: mark active order as Collected to allow testing */
  function handleMarkCollected(orderId) {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'Collected', timeline: 'Collected: Just now' } : o))
    )
    setOrderNotice(`Order ${orderId} marked as Collected. You can now place a new order!`)
    setTimeout(() => {
      setOrderNotice(null)
    }, 5000)
  }

  return (
    <div className="student-dashboard">
      {/* ── Top Navigation Bar ── */}
      <header className="dashboard-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon" aria-hidden="true">
              <IconWash />
            </span>
            <div className="brand-text">
              <span className="brand-name">WashTrack</span>
              <span className="brand-tag">Student Portal</span>
            </div>
          </div>

          <div className="nav-user">
            <div className="user-info">
              <span className="user-name">{userEmail ? userEmail.split('@')[0] : 'Alex Rivera'}</span>
              <span className="user-bag-no">Laundry Bag No. G285</span>
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
        {orderNotice && (
          <div className="success-banner" role="status">
            <IconCheckCircle />
            <span>{orderNotice}</span>
          </div>
        )}

        {/* ── Dashboard Hero Header ── */}
        <section className="dashboard-header-card">
          <div className="header-text">
            <h1 className="header-title">Student Laundry Dashboard</h1>
            <p className="header-subtitle">
              Monitor your laundry batches, check live washing stages, and submit clothes for processing.
            </p>
          </div>
          <div className="header-action">
            <button
              type="button"
              className="btn-new-order"
              disabled={hasActiveOrder}
              onClick={() => {
                if (!hasActiveOrder) {
                  setFormError('')
                  setIsModalOpen(true)
                }
              }}
              title={
                hasActiveOrder
                  ? `Active order ${activeOrder.id} (${activeOrder.status}) is in progress. Only one active order allowed at a time.`
                  : 'Submit a new laundry order'
              }
            >
              {hasActiveOrder ? <IconLock /> : <IconPlus />}
              <span>New laundry order</span>
            </button>

            {hasActiveOrder && (
              <div className="order-limit-notice" role="note">
                <span className="limit-badge">1 Order Limit</span>
                <span className="limit-text">
                  Order <strong>{activeOrder.id}</strong> is currently <strong>{activeOrder.status}</strong>. A new order can be submitted once this order is marked <strong>Collected</strong>.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Summary Status Cards ── */}
        <section className="status-overview" aria-label="Order summary counts">
          {/* 1. Submitted */}
          <div className="status-card status-card--submitted">
            <div className="card-top">
              <span className="card-label">Submitted</span>
              <span className="card-icon" aria-hidden="true"><IconClock /></span>
            </div>
            <div className="card-count">{countSubmitted}</div>
            <div className="card-subtext">Awaiting intake</div>
          </div>

          {/* 2. Washing */}
          <div className="status-card status-card--washing">
            <div className="card-top">
              <span className="card-label">Washing</span>
              <span className="card-icon" aria-hidden="true"><IconWashing /></span>
            </div>
            <div className="card-count">{countWashing}</div>
            <div className="card-subtext">In wash & dry cycle</div>
          </div>

          {/* 3. Ready */}
          <div className="status-card status-card--ready">
            <div className="card-top">
              <span className="card-label">Ready</span>
              <span className="card-icon" aria-hidden="true"><IconCheckCircle /></span>
            </div>
            <div className="card-count">{countReady}</div>
            <div className="card-subtext">Available for collection</div>
          </div>

          {/* 4. Collected */}
          <div className="status-card status-card--collected">
            <div className="card-top">
              <span className="card-label">Collected</span>
              <span className="card-icon" aria-hidden="true"><IconPackageCheck /></span>
            </div>
            <div className="card-count">{countCollected}</div>
            <div className="card-subtext">Past completed orders</div>
          </div>
        </section>

        {/* ── Recent Orders Section ── */}
        <section className="orders-section">
          <div className="orders-section-header">
            <div>
              <h2 className="orders-section-title">Recent Orders</h2>
              <p className="orders-section-subtitle">
                Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="filter-tabs" role="tablist" aria-label="Filter orders by status">
              {['All', 'Submitted', 'Washing', 'Ready', 'Collected'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === tab}
                  className={`filter-tab${activeFilter === tab ? ' filter-tab--active' : ''}`}
                  onClick={() => setActiveFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Card & Table */}
          <div className="orders-card">
            {filteredOrders.length === 0 ? (
              <div className="empty-orders">
                <IconInfo />
                <p>No orders found with status &ldquo;{activeFilter}&rdquo;.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Service Details</th>
                      <th>Submitted Date</th>
                      <th>Status</th>
                      <th>Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="order-row">
                        <td className="col-id">
                          <span className="order-id-badge">{order.id}</span>
                        </td>
                        <td className="col-service">
                          <div className="service-details-list">
                            {order.services.map(s => (
                              <span key={s.category} className="service-category-item">
                                <strong className="service-category-name">{s.category}:</strong>{' '}
                                <span className="service-category-count">
                                  {s.count} {s.count === 1 ? 'cloth' : 'clothes'}
                                </span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="col-date">
                          <div className="date-info">
                            <IconCalendar />
                            <span>{order.placedAt}</span>
                          </div>
                        </td>
                        <td className="col-status">
                          <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>
                            <span className="status-dot" aria-hidden="true" />
                            {order.status}
                          </span>
                        </td>
                        <td className="col-timeline">
                          <div className="timeline-info">
                            <span className="timeline-text">{order.timeline}</span>
                            {order.status !== 'Collected' && (
                              <button
                                type="button"
                                className="btn-mark-collected"
                                onClick={() => handleMarkCollected(order.id)}
                                title="Simulate collecting this order"
                              >
                                Mark Collected (Demo)
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Modal: Create New Laundry Order ── */}
      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon" aria-hidden="true">
                  <IconWash />
                </span>
                <h3 id="modal-title" className="modal-title">New Laundry Order</h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="modal-form">
              {formError && (
                <div className="form-error-banner" role="alert">
                  <IconInfo />
                  <span>{formError}</span>
                </div>
              )}

              <p className="modal-instructions">
                Specify the number of clothes for each service category. Laundry bag: <strong>G285</strong>.
              </p>

              <div className="modal-form-fields">
                {/* 1. Washing */}
                <div className="category-field-group">
                  <div className="category-header">
                    <label className="category-label" htmlFor="order-washing">
                      Washing
                    </label>
                    <span className="category-hint">Standard wash & fold</span>
                  </div>
                  <div className="quantity-input-wrap">
                    <input
                      id="order-washing"
                      type="number"
                      min="0"
                      max="100"
                      className="category-input"
                      value={washingCount}
                      onChange={e => setWashingCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    />
                    <span className="quantity-unit">clothes</span>
                  </div>
                </div>

                {/* 2. Dry-cleaning (Optional • Paid service) */}
                <div className="category-field-group category-field-group--paid">
                  <div className="category-header">
                    <label className="category-label" htmlFor="order-drycleaning">
                      Dry-cleaning
                      <span className="paid-tag">Paid service</span>
                    </label>
                    <span className="category-hint">Optional • Extra charges apply, confirmed at counter</span>
                  </div>
                  <div className="quantity-input-wrap">
                    <input
                      id="order-drycleaning"
                      type="number"
                      min="0"
                      max="100"
                      className="category-input"
                      value={dryCleaningCount}
                      onChange={e => setDryCleaningCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    />
                    <span className="quantity-unit">clothes</span>
                  </div>
                </div>

                {/* 3. Iron-only */}
                <div className="category-field-group">
                  <div className="category-header">
                    <label className="category-label" htmlFor="order-iron">
                      Iron-only
                    </label>
                    <span className="category-hint">Ironing and pressing only</span>
                  </div>
                  <div className="quantity-input-wrap">
                    <input
                      id="order-iron"
                      type="number"
                      min="0"
                      max="100"
                      className="category-input"
                      value={ironOnlyCount}
                      onChange={e => setIronOnlyCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    />
                    <span className="quantity-unit">clothes</span>
                  </div>
                </div>

                {/* Total clothes summary */}
                <div className="total-summary-card">
                  <span className="total-label">Total Clothes:</span>
                  <strong className="total-count">{totalClothes} {totalClothes === 1 ? 'cloth' : 'clothes'}</strong>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isSubmitting || totalClothes <= 0}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Laundry Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
