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

/* ─────────────────────────────────────────
   Services definition
   - Exactly one service per order
   - Three categories: Washing, Dry-cleaning, Iron-only
   - Dry-cleaning is optional and paid
───────────────────────────────────────── */
const SERVICES = [
  {
    id: 'Washing',
    title: 'Washing',
    badge: null,
    description: 'Standard wash & fold service',
  },
  {
    id: 'Dry-cleaning',
    title: 'Dry-cleaning',
    badge: 'Paid service',
    description: 'Optional • Extra charges apply, confirmed at intake',
  },
  {
    id: 'Iron-only',
    title: 'Iron-only',
    badge: null,
    description: 'Pressing and ironing service only',
  },
]

/* Quantity bounds per order */
const MIN_CLOTHES = 1
const MAX_CLOTHES = 15

/* ─────────────────────────────────────────
   Initial Mock Orders
   Rule: Each order contains clothes for exactly ONE service (1–15 clothes).
   Different services can be active simultaneously with independent statuses.
   No weights, detergents, wash methods, notes, or station info.
───────────────────────────────────────── */
const INITIAL_ORDERS = [
  {
    id: 'WT-4832',
    service: 'Dry-cleaning',
    clothesCount: 3,
    placedAt: 'Today, 9:00 AM',
    timeline: 'Ready for collection',
    status: 'Ready',
  },
  {
    id: 'WT-4828',
    service: 'Washing',
    clothesCount: 12,
    placedAt: 'Today, 8:15 AM',
    timeline: 'Est. Ready: Today, 3:00 PM',
    status: 'Washing',
  },
  {
    id: 'WT-4824',
    service: 'Iron-only',
    clothesCount: 6,
    placedAt: 'Today, 10:30 AM',
    timeline: 'Est. Ready: Today, 5:00 PM',
    status: 'Submitted',
  },
  {
    id: 'WT-4814',
    service: 'Washing',
    clothesCount: 14,
    placedAt: 'Nov 9, 2026, 9:00 AM',
    timeline: 'Collected: Nov 9, 2026',
    status: 'Collected',
  },
  {
    id: 'WT-4798',
    service: 'Iron-only',
    clothesCount: 8,
    placedAt: 'Nov 6, 2026, 11:00 AM',
    timeline: 'Collected: Nov 7, 2026',
    status: 'Collected',
  },
  {
    id: 'WT-4782',
    service: 'Dry-cleaning',
    clothesCount: 4,
    placedAt: 'Nov 2, 2026, 2:30 PM',
    timeline: 'Collected: Nov 3, 2026',
    status: 'Collected',
  },
]

export default function StudentDashboard({ userEmail, onSignOut }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [activeFilter, setActiveFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderNotice, setOrderNotice] = useState(null)

  /* New Order Form State: Exactly ONE service and 1–15 clothes */
  const [selectedService, setSelectedService] = useState('Washing')
  const [clothesCount, setClothesCount] = useState(8)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Dynamic status counts across all tracked orders */
  const countSubmitted = orders.filter(o => o.status === 'Submitted').length
  const countWashing = orders.filter(o => o.status === 'Washing').length
  const countReady = orders.filter(o => o.status === 'Ready').length
  const countCollected = orders.filter(o => o.status === 'Collected').length

  const filteredOrders = activeFilter === 'All'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase())

  /* Clothes counter validation helpers */
  const parsedCount = parseInt(clothesCount, 10)
  const isCountValid = !isNaN(parsedCount) && parsedCount >= MIN_CLOTHES && parsedCount <= MAX_CLOTHES
  const isMaxReached = parsedCount === MAX_CLOTHES
  const isOverMax = parsedCount > MAX_CLOTHES
  const isUnderMin = parsedCount < MIN_CLOTHES && clothesCount !== ''

  function handleDecrement() {
    setFormError('')
    setClothesCount(prev => Math.max(MIN_CLOTHES, (parseInt(prev, 10) || MIN_CLOTHES) - 1))
  }

  function handleIncrement() {
    setFormError('')
    setClothesCount(prev => Math.min(MAX_CLOTHES, (parseInt(prev, 10) || 0) + 1))
  }

  function handleQuantityChange(e) {
    setFormError('')
    const val = e.target.value
    if (val === '') {
      setClothesCount('')
      return
    }
    const num = parseInt(val, 10)
    if (!isNaN(num)) {
      setClothesCount(num)
    }
  }

  function handleCreateOrder(e) {
    e.preventDefault()

    if (!isCountValid) {
      setFormError(`Each order must contain between ${MIN_CLOTHES} and ${MAX_CLOTHES} clothes.`)
      return
    }

    setFormError('')
    setIsSubmitting(true)

    setTimeout(() => {
      const generatedId = `WT-${Math.floor(4835 + Math.random() * 90)}`
      const newOrder = {
        id: generatedId,
        service: selectedService,
        clothesCount: parsedCount,
        placedAt: 'Just now',
        timeline: 'Est. Ready: Tomorrow, 12:00 PM',
        status: 'Submitted',
      }

      setOrders(prev => [newOrder, ...prev])
      setIsSubmitting(false)
      setIsModalOpen(false)
      setClothesCount(8)
      setOrderNotice(`Order ${generatedId} (${selectedService} • ${parsedCount} ${parsedCount === 1 ? 'cloth' : 'clothes'}) submitted successfully!`)

      setTimeout(() => {
        setOrderNotice(null)
      }, 5000)
    }, 500)
  }

  /* Simulation helper: mark an uncollected order as Collected */
  function handleMarkCollected(orderId) {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'Collected', timeline: 'Collected: Just now' } : o))
    )
    setOrderNotice(`Order ${orderId} marked as Collected!`)
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
              Monitor individual Washing, Dry-cleaning, and Iron-only orders. Each service is tracked independently with its own schedule.
            </p>
          </div>
          <div className="header-action">
            <button
              type="button"
              className="btn-new-order"
              onClick={() => {
                setFormError('')
                setClothesCount(8)
                setIsModalOpen(true)
              }}
              title="Submit a new laundry order"
            >
              <IconPlus />
              <span>New laundry order</span>
            </button>
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
            <div className="card-subtext">Available for pickup</div>
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
                          <div className="service-details-row">
                            <span className="service-name-text">
                              <strong>{order.service}:</strong> {order.clothesCount}{' '}
                              {order.clothesCount === 1 ? 'cloth' : 'clothes'}
                            </span>
                            {order.service === 'Dry-cleaning' && (
                              <span className="paid-tag-small">Paid service</span>
                            )}
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

      {/* ── Modal: Create New Laundry Order (One Service & 1–15 Clothes) ── */}
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
                Students submit one order at a time with <strong>1–15 clothes</strong> for a single service. Assigned bag: <strong>G285</strong>.
              </p>

              {/* Service Selection: One service only */}
              <div className="form-section">
                <label className="section-label">Select Service (Choose one)</label>
                <div className="service-options-grid" role="radiogroup" aria-label="Select one service category">
                  {SERVICES.map(srv => {
                    const isSelected = selectedService === srv.id
                    return (
                      <div
                        key={srv.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`service-option-card${isSelected ? ' service-option-card--selected' : ''}`}
                        onClick={() => setSelectedService(srv.id)}
                        onKeyDown={e => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault()
                            setSelectedService(srv.id)
                          }
                        }}
                      >
                        <div className="service-card-radio">
                          <span className={`radio-dot${isSelected ? ' radio-dot--active' : ''}`} />
                        </div>
                        <div className="service-card-content">
                          <div className="service-card-title-row">
                            <span className="service-card-title">{srv.title}</span>
                            {srv.badge && <span className="paid-tag">{srv.badge}</span>}
                          </div>
                          <span className="service-card-desc">{srv.description}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Clothes Quantity Counter (Min 1, Max 15) */}
              <div className="form-section">
                <div className="quantity-header-row">
                  <label className="section-label" htmlFor="order-clothes-count">
                    Clothes Quantity
                  </label>
                  <span className="quantity-range-badge">Limit: 1 – 15 clothes</span>
                </div>

                <div className="clothes-counter-widget">
                  <button
                    type="button"
                    className="counter-btn counter-btn--minus"
                    onClick={handleDecrement}
                    disabled={!parsedCount || parsedCount <= MIN_CLOTHES}
                    title="Decrease count"
                    aria-label="Decrease clothes count"
                  >
                    −
                  </button>

                  <div className="counter-input-wrap">
                    <input
                      id="order-clothes-count"
                      type="number"
                      min={MIN_CLOTHES}
                      max={MAX_CLOTHES}
                      className="counter-number-input"
                      value={clothesCount}
                      onChange={handleQuantityChange}
                      aria-describedby="quantity-help"
                    />
                    <span className="counter-unit-text">
                      {parsedCount === 1 ? 'cloth' : 'clothes'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="counter-btn counter-btn--plus"
                    onClick={handleIncrement}
                    disabled={parsedCount >= MAX_CLOTHES}
                    title="Increase count"
                    aria-label="Increase clothes count"
                  >
                    +
                  </button>
                </div>

                {/* Clear message when maximum is reached */}
                {isMaxReached && (
                  <div className="counter-limit-message" role="status">
                    <IconInfo />
                    <span>Maximum limit reached: Each order can contain at most 15 clothes.</span>
                  </div>
                )}

                {/* Warning message if manually entered count exceeds maximum */}
                {isOverMax && (
                  <div className="counter-limit-message counter-limit-message--error" role="alert">
                    <IconInfo />
                    <span>Count exceeds the 15 clothes limit. Please enter a number between 1 and 15.</span>
                  </div>
                )}

                {/* Warning message if count is below minimum */}
                {isUnderMin && (
                  <div className="counter-limit-message counter-limit-message--error" role="alert">
                    <IconInfo />
                    <span>Each order must contain at least 1 cloth.</span>
                  </div>
                )}
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
                  disabled={isSubmitting || !isCountValid}
                >
                  {isSubmitting
                    ? 'Submitting…'
                    : isCountValid
                      ? `Submit ${selectedService} Order (${parsedCount} ${parsedCount === 1 ? 'cloth' : 'clothes'})`
                      : 'Enter 1–15 clothes to submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
