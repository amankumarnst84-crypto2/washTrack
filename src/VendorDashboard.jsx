import { useState } from 'react'
import { api } from './api'
import { Header, Summary, Filters, filteredOrders, OrderDetails, Badge, Complaints, dateTime, orderLabel, useLaundry, today, label } from './shared'

export default function VendorDashboard({ user, onSignOut, signingOut }) {
  const { orders, lots, complaints, loading, error, refresh } = useLaundry(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [date, setDate] = useState(today)
  const [shift, setShift] = useState('MORNING')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  async function mutate(path, method, body, message) {
    setBusy(true); setActionError(''); setNotice('')
    try { await api(path, { method, body }); setNotice(message); await refresh(); return true }
    catch (err) { setActionError(err.message); return false }
    finally { setBusy(false) }
  }
  return <div className="wt-app"><Header user={user} onSignOut={onSignOut} signingOut={signingOut} /><main className="wt-main">
    <section className="wt-hero"><div><p className="wt-eyebrow">LAUNDRY STAFF</p><h1>Every bag, every handover</h1><p>Receive bags, manage washing lots and keep students informed.</p></div><button className="wt-secondary" onClick={refresh}>Refresh queue</button></section>
    {notice && <p className="wt-success" role="status">{notice}</p>}{(error || actionError) && <p className="wt-error" role="alert">{error || actionError}</p>}
    {loading ? <p role="status">Loading laundry queue…</p> : <><Summary orders={orders} />
      <section className="wt-section"><h2>Morning & evening washing lots</h2>
        <form className="wt-lot-form" onSubmit={e => { e.preventDefault(); mutate('/lots', 'POST', { date, shift }, 'Lot created. Assign received bags below.') }}>
          <label>Lot date<input type="date" required value={date} onChange={e => setDate(e.target.value)} /></label>
          <label>Shift<select value={shift} onChange={e => setShift(e.target.value)}><option value="MORNING">Morning</option><option value="EVENING">Evening</option></select></label>
          <button disabled={busy}>Create lot</button>
        </form>
        {!lots.length && <p className="wt-empty">No washing lots yet.</p>}
        <div className="wt-lot-list">{lots.map(lot => <div className="wt-lot" key={lot.id}><div><strong>{lot.date} · {label(lot.shift)}</strong><p>{lot.orders.length} bags {lot.orders.length > 0 && `(${lot.orders.map(o => o.bagNo).join(', ')})`}</p></div>{lot.startedAt ? <span className="wt-muted">Started {dateTime(lot.startedAt)}</span> : <button disabled={busy || !lot.orders.length} onClick={() => mutate(`/lots/${lot.id}/start`, 'POST', {}, 'Washing started for this lot.')}>Start washing</button>}</div>)}</div>
      </section>
      <section className="wt-section"><h2>Laundry queue</h2><Filters query={query} setQuery={setQuery} status={status} setStatus={setStatus} />
        <div className="wt-order-grid">{filteredOrders(orders, query, status).map(order => <StaffOrder key={order.id} order={order} lots={lots} busy={busy} mutate={mutate} />)}</div>
        {!filteredOrders(orders, query, status).length && <p className="wt-empty">No bags match this search or status.</p>}
      </section>
      <Complaints complaints={complaints} staff busy={busy} onChange={(id, next, message) => mutate(`/complaints/${id}`, 'PATCH', { status: next, message }, 'Complaint response saved.')} />
    </>}
  </main></div>
}
function StaffOrder({ order, lots, busy, mutate }) {
  const [lotId, setLotId] = useState('')
  const [atCounter, setAtCounter] = useState(false)
  const [delay, setDelay] = useState('')
  const [editingDelay, setEditingDelay] = useState(false)
  const move = status => mutate(`/orders/${order.id}/status`, 'PATCH', { status, atCounter }, `Bag ${order.bagNo}: ${label(status)}.`)
  return <article className="wt-order"><div className="wt-order-heading"><h3>Bag {order.bagNo}</h3><Badge status={order.status} /></div>
    <p>{order.student.name} · {orderLabel(order.id)}</p><p className="wt-muted">{order.totalCount} declared clothes · {dateTime(order.createdAt)}</p>
    {order.delayReason && <p className="wt-warning">Delay: {order.delayReason}</p>}<OrderDetails order={order} />
    {order.status === 'SUBMITTED' && <button disabled={busy} onClick={() => move('RECEIVED')}>Confirm bag received</button>}
    {order.status === 'RECEIVED' && <form className="wt-form" onSubmit={e => { e.preventDefault(); mutate(`/orders/${order.id}/lot`, 'PATCH', { lotId }, 'Bag assigned to lot.') }}>
      <label>Washing lot<select required value={lotId} onChange={e => setLotId(e.target.value)}><option value="">Choose an unstarted lot</option>{lots.filter(l => !l.startedAt).map(l => <option key={l.id} value={l.id}>{l.date} · {label(l.shift)}</option>)}</select></label><button disabled={busy || !lotId}>{order.lotId ? 'Change lot' : 'Assign lot'}</button><p className="wt-muted">Start washing from the lot controls above.</p>
    </form>}
    {order.status === 'WASHING' && <><label className="wt-check"><input type="checkbox" checked={atCounter} onChange={e => setAtCounter(e.target.checked)} /> Packed bag is at the collection counter</label><button disabled={busy || !atCounter} onClick={() => move('READY')}>Mark Ready</button></>}
    {order.status === 'READY' && <><p className="wt-info">Check the bag number on the student's logged-in phone before handover.</p><button disabled={busy} onClick={() => move('COLLECTED')}>Confirm bag handed over</button></>}
    {order.status !== 'COLLECTED' && <button className="wt-secondary" onClick={() => { setDelay(order.delayReason); setEditingDelay(!editingDelay) }}>Update delay reason</button>}
    {editingDelay && order.status !== 'COLLECTED' && <form className="wt-form" onSubmit={async e => { e.preventDefault(); if (await mutate(`/orders/${order.id}/delay`, 'PATCH', { reason: delay }, 'Delay reason updated.')) setEditingDelay(false) }}><label>Reason (blank clears it)<textarea maxLength={500} value={delay} onChange={e => setDelay(e.target.value)} /></label><button disabled={busy}>Save delay note</button></form>}
  </article>
}
