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

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
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
   Initial Mock Orders
───────────────────────────────────────── */
const INITIAL_ORDERS = [
  {
    id: 'WT-4829',
    service: 'Standard Wash & Fold',
    details: '1 Bag (~5.5 kg) • Cold water',
    hub: 'Central Station - Hub 1',
    placedAt: 'Today, 10:45 AM',
    estimatedReady: 'Today, 5:30 PM',
    status: 'Submitted',
    notes: 'Gentle detergent preferred',
  },
  {
    id: 'WT-4825',
    service: 'Bedding & Linens',
    details: '2 Bed sheets + 2 Pillow covers (4 kg)',
    hub: 'North Hall Laundry Hub',
    placedAt: 'Today, 8:15 AM',
    estimatedReady: 'Today, 3:00 PM',
    status: 'Washing',
    notes: 'Wash cycle 2 in progress',
  },
  {
    id: 'WT-4821',
    service: 'Daily Clothes Wash & Iron',
    details: '12 items • Folded & Hanged',
    hub: 'Central Station - Hub 2',
    placedAt: 'Yesterday, 4:20 PM',
    estimatedReady: 'Today, 1:30 PM',
    status: 'Washing',
    notes: 'In drying unit',
  },
  {
    id: 'WT-4814',
    service: 'Express Wash & Fold',
    details: '1 Small bag (3 kg)',
    hub: 'West Campus Express Station',
    placedAt: 'Nov 9, 2026, 9:00 AM',
    estimatedReady: 'Ready since Nov 9, 2:30 PM',
    status: 'Ready',
    notes: 'Stored in Locker #07 • Ready for collection',
  },
  {
    id: 'WT-4798',
    service: 'Standard Wash & Fold',
    details: '1 Medium bag (6 kg)',
    hub: 'Central Station - Hub 1',
    placedAt: 'Nov 6, 2026, 11:00 AM',
    estimatedReady: 'Collected Nov 7, 10:15 AM',
    status: 'Collected',
    notes: 'Picked up by student',
  },
  {
    id: 'WT-4782',
    service: 'Heavy Blankets & Quilts',
    details: '2 Double Quilts',
    hub: 'North Hall Laundry Hub',
    placedAt: 'Nov 2, 2026, 2:30 PM',
    estimatedReady: 'Collected Nov 3, 4:45 PM',
    status: 'Collected',
    notes: 'Completed',
  },
  {
    id: 'WT-4760',
    service: 'Standard Wash & Fold',
    details: '1 Bag (5 kg)',
    hub: 'Central Station - Hub 2',
    placedAt: 'Oct 28, 2026, 1:15 PM',
    estimatedReady: 'Collected Oct 29, 11:30 AM',
    status: 'Collected',
    notes: 'Completed',
  },
  {
    id: 'WT-4735',
    service: 'Delicates & Handwash',
    details: '8 items (2.5 kg)',
    hub: 'West Campus Express Station',
    placedAt: 'Oct 21, 2026, 10:00 AM',
    estimatedReady: 'Collected Oct 22, 12:00 PM',
    status: 'Collected',
    notes: 'Completed',
  },
]

export default function StudentDashboard({ userEmail, onSignOut }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [activeFilter, setActiveFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderNotice, setOrderNotice] = useState(null)

  /* New Order Form State */
  const [newService, setNewService] = useState('Standard Wash & Fold')
  const [newHub, setNewHub] = useState('Central Station - Hub 1')
  const [newBagSize, setNewBagSize] = useState('1 Bag (~5 kg)')
  const [newNotes, setNewNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Dynamic status counts */
  const countSubmitted = orders.filter(o => o.status === 'Submitted').length
  const countWashing = orders.filter(o => o.status === 'Washing').length
  const countReady = orders.filter(o => o.status === 'Ready').length
  const countCollected = orders.filter(o => o.status === 'Collected').length

  const filteredOrders = activeFilter === 'All'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase())

  function handleCreateOrder(e) {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      const generatedId = `WT-${Math.floor(4830 + Math.random() * 90)}`
      const newOrder = {
        id: generatedId,
        service: newService,
        details: `${newBagSize} • Standard cycle`,
        hub: newHub,
        placedAt: 'Just now',
        estimatedReady: 'Tomorrow, by 12:00 PM',
        status: 'Submitted',
        notes: newNotes.trim() || 'Standard laundry processing',
      }

      setOrders(prev => [newOrder, ...prev])
      setIsSubmitting(false)
      setIsModalOpen(false)
      setNewNotes('')
      setOrderNotice(`Order ${generatedId} created successfully!`)

      setTimeout(() => {
        setOrderNotice(null)
      }, 5000)
    }, 600)
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
              <span className="user-role">Hostel Block B • Room 204</span>
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
              Monitor your laundry batches, check live washing stages, and request new vendor pickups.
            </p>
          </div>
          <div className="header-action">
            <button
              type="button"
              className="btn-new-order"
              onClick={() => setIsModalOpen(true)}
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
            <div className="card-subtext">Awaiting vendor intake</div>
          </div>

          {/* 2. Washing */}
          <div className="status-card status-card--washing">
            <div className="card-top">
              <span className="card-label">Washing</span>
              <span className="card-icon" aria-hidden="true"><IconWashing /></span>
            </div>
            <div className="card-count">{countWashing}</div>
            <div className="card-subtext">Currently in wash & dry cycle</div>
          </div>

          {/* 3. Ready */}
          <div className="status-card status-card--ready">
            <div className="card-top">
              <span className="card-label">Ready</span>
              <span className="card-icon" aria-hidden="true"><IconCheckCircle /></span>
            </div>
            <div className="card-count">{countReady}</div>
            <div className="card-subtext">Available for counter pickup</div>
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

          {/* Orders Table & List */}
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
                      <th>Laundry Station</th>
                      <th>Submitted Date</th>
                      <th>Status</th>
                      <th>Timeline / Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="order-row">
                        <td className="col-id">
                          <span className="order-id-badge">{order.id}</span>
                        </td>
                        <td className="col-service">
                          <div className="service-name">{order.service}</div>
                          <div className="service-sub">{order.details}</div>
                        </td>
                        <td className="col-hub">
                          <div className="hub-info">
                            <IconMapPin />
                            <span>{order.hub}</span>
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
                            <span className="timeline-text">{order.estimatedReady}</span>
                            {order.notes && (
                              <span className="timeline-notes">{order.notes}</span>
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
              <div className="modal-form-fields">
                {/* Service Type */}
                <div className="form-group">
                  <label className="form-label" htmlFor="order-service">
                    Service Type
                  </label>
                  <select
                    id="order-service"
                    className="modal-select"
                    value={newService}
                    onChange={e => setNewService(e.target.value)}
                  >
                    <option value="Standard Wash & Fold">Standard Wash & Fold</option>
                    <option value="Daily Clothes Wash & Iron">Daily Clothes Wash & Iron</option>
                    <option value="Bedding & Linens">Bedding & Linens</option>
                    <option value="Express Wash & Fold">Express Wash & Fold</option>
                    <option value="Delicates & Handwash">Delicates & Handwash</option>
                  </select>
                </div>

                {/* Laundry Hub / Drop-off location */}
                <div className="form-group">
                  <label className="form-label" htmlFor="order-hub">
                    Laundry Station / Hub
                  </label>
                  <select
                    id="order-hub"
                    className="modal-select"
                    value={newHub}
                    onChange={e => setNewHub(e.target.value)}
                  >
                    <option value="Central Station - Hub 1">Central Station - Hub 1 (Main Quad)</option>
                    <option value="Central Station - Hub 2">Central Station - Hub 2 (Student Center)</option>
                    <option value="North Hall Laundry Hub">North Hall Laundry Hub (Block C)</option>
                    <option value="West Campus Express Station">West Campus Express Station</option>
                  </select>
                </div>

                {/* Quantity / Bag Size */}
                <div className="form-group">
                  <label className="form-label" htmlFor="order-size">
                    Estimated Quantity
                  </label>
                  <select
                    id="order-size"
                    className="modal-select"
                    value={newBagSize}
                    onChange={e => setNewBagSize(e.target.value)}
                  >
                    <option value="1 Small Bag (~3 kg)">1 Small Bag (~3 kg)</option>
                    <option value="1 Bag (~5 kg)">1 Standard Bag (~5 kg)</option>
                    <option value="2 Bags (~10 kg)">2 Standard Bags (~10 kg)</option>
                    <option value="Heavy Load (~12+ kg)">Heavy Load (~12+ kg)</option>
                  </select>
                </div>

                {/* Special Instructions */}
                <div className="form-group">
                  <label className="form-label" htmlFor="order-notes">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="order-notes"
                    rows="3"
                    className="modal-textarea"
                    placeholder="e.g. Mild detergent, cold wash only, handle jacket gently..."
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                  />
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
                  disabled={isSubmitting}
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
