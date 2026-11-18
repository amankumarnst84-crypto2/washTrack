import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
export const STATUSES = ['SUBMITTED', 'RECEIVED', 'WASHING', 'READY', 'COLLECTED']
export const ITEMS = ['Shirt', 'T-shirt', 'Pant', 'Shorts', 'Kurta', 'Bedsheet', 'Towel', 'Other']
export const ISSUE_TYPES = { MISSING: 'Missing clothes', EXTRA: 'Extra clothes', WASH_QUALITY: 'Poor washing / stain', COLOUR_DAMAGE: 'Colour damage' }
export const label = value => (value || '').toLowerCase().replaceAll('_', ' ').replace(/^./, c => c.toUpperCase())
export const dateTime = value => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(value))
export const orderLabel = id => `WT-${id.slice(0, 8).toUpperCase()}`
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

export function useLaundry(staff = false) {
  const [orders, setOrders] = useState([])
  const [complaints, setComplaints] = useState([])
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    try {
      const [o, c, l] = await Promise.all([api('/orders'), api('/complaints'), staff ? api('/lots') : Promise.resolve({ lots: [] })])
      setOrders(o.orders); setComplaints(c.complaints); setLots(l.lots); setError('')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [staff])
  useEffect(() => {
    refresh()
    // Poll so staff updates appear on student phones without a page reload.
    const timer = setInterval(refresh, 10000)
    window.addEventListener('focus', refresh)
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [refresh])
  return { orders, complaints, lots, loading, error, refresh }
}
export function Header({ user, onSignOut, signingOut }) {
  return <header className="wt-nav"><div className="wt-nav-inner">
    <div><strong className="wt-brand">WashTrack</strong><span className="wt-nav-sub">{user.role === 'STAFF' ? 'Laundry staff' : 'Rishihood hostel laundry'}</span></div>
    <div className="wt-account"><div><strong>{user.name}</strong>{user.bagNo && <span>Bag {user.bagNo}</span>}</div><button className="wt-secondary" onClick={onSignOut} disabled={signingOut}>Sign out</button></div>
  </div></header>
}
export function Badge({ status }) { return <span className={`wt-badge wt-${status.toLowerCase()}`}>{label(status)}</span> }
export function Summary({ orders }) {
  return <section className="wt-stats" aria-label="Order counts">{STATUSES.map(status => <div className="wt-stat" key={status}><span>{label(status)}</span><strong>{orders.filter(o => o.status === status).length}</strong></div>)}</section>
}
export function Filters({ query, setQuery, status, setStatus }) {
  return <div className="wt-filters"><label>Search orders<input type="search" placeholder="Order ID or bag number" value={query} onChange={e => setQuery(e.target.value)} /></label><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">All statuses</option>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select></label></div>
}
export function filteredOrders(orders, query, status) {
  const q = query.trim().toLowerCase()
  return orders.filter(o => (status === 'ALL' || o.status === status) && `${orderLabel(o.id)} ${o.id} ${o.bagNo}`.toLowerCase().includes(q))
}
export function OrderDetails({ order }) {
  return <details className="wt-details"><summary>Items & status timeline</summary>
    <ul className="wt-items">{order.items.map(i => <li key={i.type}><span>{i.type}</span><strong>{i.quantity}</strong></li>)}</ul>
    <p className="wt-muted">Declared count: {order.totalCount}. Receipt confirms bag handover, not a verified item count.</p>
    {order.lot && <p>Lot: {order.lot.date}, {label(order.lot.shift)}</p>}
    <ol className="wt-timeline">{order.events.map(e => <li key={e.id}><strong>{label(e.status)}</strong><time>{dateTime(e.createdAt)}</time></li>)}</ol>
  </details>
}
export function Complaints({ complaints, staff, onChange, busy }) {
  return <section className="wt-section"><h2>Complaints & recovery</h2>
    <p className="wt-muted">Collected bags can still have open complaints. Only the student confirms the final resolution.</p>
    {!complaints.length && <p className="wt-empty">No complaints yet.</p>}
    <div className="wt-order-grid">{complaints.map(c => <Complaint key={c.id} complaint={c} staff={staff} onChange={onChange} busy={busy} />)}</div>
  </section>
}
function Complaint({ complaint: c, staff, onChange, busy }) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('IN_PROGRESS')
  async function submit(event) {
    event.preventDefault()
    const ok = await onChange(c.id, status, message)
    if (ok) setMessage('')
  }
  return <article className="wt-order"><div className="wt-order-heading"><h3>{ISSUE_TYPES[c.type]}</h3><Badge status={c.status} /></div>
    <p className="wt-muted">{orderLabel(c.orderId)} · Bag {c.order.bagNo}</p>
    {c.itemType && <p>{c.quantity} × {c.itemType}</p>}
    <p>{c.description}</p>
    <details className="wt-details"><summary>Responses ({c.events.length})</summary><ol className="wt-timeline">{c.events.map(e => <li key={e.id}><strong>{label(e.actorRole)} · {label(e.status)}</strong><p>{e.message}</p><time>{dateTime(e.createdAt)}</time></li>)}</ol></details>
    {staff && ['OPEN', 'IN_PROGRESS'].includes(c.status) && <form onSubmit={submit} className="wt-form">
      <label>Response<textarea required maxLength={1000} placeholder={c.type === 'EXTRA' ? 'Record return to staff and handover to the owner here.' : 'Explain progress or the proposed resolution.'} value={message} onChange={e => setMessage(e.target.value)} /></label>
      <label>Next status<select value={status} onChange={e => setStatus(e.target.value)}><option value="IN_PROGRESS">In progress</option>{c.status === 'IN_PROGRESS' && <option value="AWAITING_CONFIRMATION">Ask student to confirm resolution</option>}</select></label>
      <button disabled={busy}>Save response</button>
    </form>}
    {!staff && c.status === 'AWAITING_CONFIRMATION' && <div className="wt-form">
      <label>Your response<textarea maxLength={1000} placeholder="Tell staff if the issue is still unresolved" value={message} onChange={e => setMessage(e.target.value)} /></label>
      <div className="wt-actions"><button disabled={busy} onClick={() => onChange(c.id, 'RESOLVED', message.trim() || 'I confirm that my issue is resolved.')}>Yes, resolved</button><button className="wt-secondary" disabled={busy || !message.trim()} onClick={() => onChange(c.id, 'IN_PROGRESS', message)}>Still unresolved</button></div>
    </div>}
  </article>
}
