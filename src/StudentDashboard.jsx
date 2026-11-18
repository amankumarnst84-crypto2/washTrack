import { useEffect, useRef, useState } from 'react'
import { api } from './api'
import { Header, Summary, Filters, filteredOrders, OrderDetails, Badge, Complaints, ITEMS, ISSUE_TYPES, dateTime, orderLabel, useLaundry } from './shared'

export default function StudentDashboard({ user, onSignOut, signingOut }) {
  const { orders, complaints, loading, error, refresh } = useLaundry()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [showEntry, setShowEntry] = useState(false)
  const [counts, setCounts] = useState({})
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [complaintOrder, setComplaintOrder] = useState(null)
  const reportRef = useRef(null)
  useEffect(() => {
    if (complaintOrder) { reportRef.current?.scrollIntoView({ block: 'start' }); reportRef.current?.focus() }
  }, [complaintOrder])
  const [issue, setIssue] = useState('MISSING')
  const [itemType, setItemType] = useState('Shirt')
  const [quantity, setQuantity] = useState('1')
  const [description, setDescription] = useState('')
  const total = Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0)
  const validCounts = Object.values(counts).every(value => value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 15))
  const active = orders.find(o => o.status !== 'COLLECTED')
  const ready = orders.find(o => o.status === 'READY')
  async function mutate(path, method, body, message) {
    setBusy(true); setActionError(''); setNotice('')
    try { await api(path, { method, body }); setNotice(message); await refresh(); return true }
    catch (err) { setActionError(err.message); return false }
    finally { setBusy(false) }
  }
  async function submitOrder(event) {
    event.preventDefault()
    if (!validCounts || total < 1 || total > 15 || active) return
    const items = Object.entries(counts).filter(([, n]) => Number(n) > 0).map(([type, n]) => ({ type, quantity: Number(n) }))
    if (await mutate('/orders', 'POST', { items }, 'Entry saved. Hand your bag to staff so they can confirm receipt.')) { setShowEntry(false); setCounts({}) }
  }
  async function submitComplaint(event) {
    event.preventDefault()
    const body = { type: issue, description, itemType, quantity: Number(quantity) }
    if (await mutate(`/orders/${complaintOrder.id}/complaints`, 'POST', body, 'Complaint submitted. Track staff responses below.')) { setComplaintOrder(null); setDescription('') }
  }
  return <div className="wt-app wt-student"><Header user={user} onSignOut={onSignOut} signingOut={signingOut} />
    <main className="wt-main">
      <section className="wt-hero"><div><p className="wt-eyebrow">STUDENT DASHBOARD</p><h1>Your laundry, without the guesswork</h1><p>Bag <strong>{user.bagNo}</strong> · Maximum 15 clothes · Included in hostel fees</p></div><button disabled={busy || loading || !!error || !!active} onClick={() => { setShowEntry(!showEntry); setActionError('') }}>{showEntry ? 'Close entry form' : '+ New laundry entry'}</button></section>
      {notice && <p className="wt-success" role="status">{notice}</p>}
      {(error || actionError) && <div className="wt-error" role="alert">{error || actionError}{error && <button className="wt-secondary" onClick={refresh}>Retry</button>}</div>}
      {ready && <section className="wt-ready" role="status"><h2>Your bag is ready at the counter</h2><p>Show bag number <strong>{user.bagNo}</strong> on this screen to collect {orderLabel(ready.id)}. Staff will record the handover.</p></section>}
      {active && !ready && <p className="wt-info">Your bag already has an active entry ({orderLabel(active.id)}). You can submit again after collection.</p>}
      {showEntry && !active && <section className="wt-section"><h2>What are you sending?</h2><p className="wt-muted">Enter each type before handing in your bag. Count is student-declared. For more than 15 clothes, speak to staff.</p><form className="wt-form" onSubmit={submitOrder}>
        <div className="wt-item-inputs">{ITEMS.map(type => <label key={type}>{type}<input type="number" min="0" max="15" step="1" inputMode="numeric" placeholder="0" value={counts[type] ?? ''} onChange={e => setCounts({ ...counts, [type]: e.target.value })} /></label>)}</div>
        <p className={total > 15 || !validCounts ? 'wt-field-error' : 'wt-total'} aria-live="polite">Total: {total} / 15 clothes{!validCounts && ' · Use whole numbers only.'}</p>
        <div className="wt-actions"><button disabled={busy || !validCounts || total < 1 || total > 15}>Submit entry</button><button type="button" className="wt-secondary" onClick={() => setShowEntry(false)}>Cancel</button></div>
      </form></section>}
      {loading ? <p role="status">Loading your laundry…</p> : <><Summary orders={orders} />
        <section className="wt-section"><h2>Your laundry entries</h2><p className="wt-muted">Status refreshes every 10 seconds. Check your clothes after collection.</p><Filters query={query} setQuery={setQuery} status={status} setStatus={setStatus} />
          <div className="wt-order-grid">{filteredOrders(orders, query, status).map(order => <article className="wt-order" key={order.id}>
            <div className="wt-order-heading"><h3>{orderLabel(order.id)}</h3><Badge status={order.status} /></div>
            <p>Bag {order.bagNo} · {order.totalCount} clothes</p><p className="wt-muted">Submitted {dateTime(order.createdAt)}</p>
            {order.delayReason && <p className="wt-warning">Delay: {order.delayReason}</p>}
            <OrderDetails order={order} />
            {order.status === 'COLLECTED' && <p className="wt-muted">Bag handed over. Missing or wrong clothes? You can still report an issue.</p>}
            {order.status !== 'SUBMITTED' && <button className="wt-secondary" disabled={busy} onClick={() => { setComplaintOrder(order); setDescription(''); setIssue('MISSING'); setItemType(order.items[0].type); setQuantity('1') }}>Report an issue</button>}
          </article>)}</div>
          {!filteredOrders(orders, query, status).length && <p className="wt-empty">No entries match. {orders.length ? 'Try another search or status.' : 'Create your first laundry entry above.'}</p>}
        </section>
        {complaintOrder && <section ref={reportRef} tabIndex={-1} className="wt-section wt-report" aria-label="Report a laundry issue"><h2>Report an issue: {orderLabel(complaintOrder.id)}</h2><form className="wt-form" onSubmit={submitComplaint}>
          <label>Issue type<select value={issue} onChange={e => setIssue(e.target.value)}>{Object.entries(ISSUE_TYPES).map(([value, name]) => <option value={value} key={value}>{name}</option>)}</select></label>
          {['MISSING', 'EXTRA'].includes(issue) && <div className="wt-form-row"><label>Clothing type<select value={itemType} onChange={e => setItemType(e.target.value)}>{ITEMS.map(type => <option key={type}>{type}</option>)}</select></label><label>Quantity<input type="number" required min="1" max="15" step="1" inputMode="numeric" value={quantity} onChange={e => setQuantity(e.target.value)} /></label></div>}
          <label>Describe the issue<textarea required maxLength={1000} value={description} onChange={e => setDescription(e.target.value)} placeholder="For example: one blue shirt is missing from my bag." /></label>
          {issue === 'EXTRA' && <p className="wt-info">Return the extra clothing to staff. They can record its return and handover in the complaint responses.</p>}
          <div className="wt-actions"><button disabled={busy}>Submit complaint</button><button type="button" className="wt-secondary" onClick={() => setComplaintOrder(null)}>Cancel</button></div>
        </form></section>}
        <Complaints complaints={complaints} busy={busy} onChange={(id, next, message) => mutate(`/complaints/${id}`, 'PATCH', { status: next, message }, 'Your response was saved.')} />
      </>}
    </main>
  </div>
}
