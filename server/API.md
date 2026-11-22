# WashTrack API contract

Base path: `/api`. All writes use `Content-Type: application/json`. Login sets an HttpOnly cookie. Browser clients call same-origin `/api` through Vite and use `credentials:'same-origin'`. API clients such as Postman should retain the cookie jar.

All `:id` parameters use full UUIDs. Errors return `{ "message": "..." }`. No credentials are embedded in these examples.

## Registration and authentication

### Student registration

`POST /api/auth/register` (public, rate-limited)

```json
{
  "name":"Student Name",
  "email":"new.student@example.edu",
  "bagNo":"B-601",
  "password":"<chosen password>",
  "confirmPassword":"<same password>"
}
```

201:

```json
{"user":{"id":"<uuid>","name":"Student Name","email":"new.student@example.edu","role":"STUDENT","bagNo":"B-601"},"message":"Account created. Sign in with your email and password."}
```

Email is trimmed/lowercased; bag number is trimmed/uppercased. Role defaults to STUDENT on the server; STAFF requests fail. Invalid input: 400. No invitation code is required. Email/bag already registered: 409.

### Login

`POST /api/auth/login`

```json
{"email":"new.student@example.edu","password":"<chosen password>"}
```

200: `{ "user": { "id":"<uuid>", "name":"Student Name", "email":"new.student@example.edu", "role":"STUDENT", "bagNo":"B-601" } }` plus `washtrack_session` cookie. Staff role is STAFF, with bagNo normally null. Password hash, JWT and tokenVersion are not returned in the JSON body.

`GET /api/auth/me` returns the same user envelope. `POST /api/auth/logout` with `{}` returns `{"message":"Signed out."}` and revokes prior account tokens.

## Laundry endpoints

| Method | Path | Access and request |
| --- | --- | --- |
| GET | /health | Public database readiness; `{status:"ok"}` |
| GET | /meta | Signed in; itemTypes, maxClothes, complaintTypes, orderStatuses |
| GET | /orders | Student's own orders or all orders for staff; optional `?q=B-601&status=READY` |
| GET | /orders/:id | Owner/staff; `{order}` with items, lot, events and student display fields |
| GET | /orders/:id/history | Owner/staff; `{events:[...]}` chronological status history |
| POST | /orders | STUDENT; `{items:[{type:"Shirt",quantity:4},{type:"Pant",quantity:3}]}` |
| PATCH | /orders/:id/status | STAFF; `{status:"RECEIVED"}`, `{status:"READY",atCounter:true}` or `{status:"COLLECTED"}` |
| PATCH | /orders/:id/delay | STAFF; `{reason:"Packing pending"}`; empty string clears it |
| GET | /lots | STAFF; `{lots:[...]}` with assigned bags |
| POST | /lots | STAFF; `{date:"2026-11-18",shift:"MORNING"}` or EVENING |
| PATCH | /orders/:id/lot | STAFF; `{lotId:"<uuid>"}`; Received bags, unstarted lot only |
| POST | /lots/:id/start | STAFF; `{}`; Received bags in lot become Washing together |
| GET | /complaints | Student's own complaints or all for staff; `{complaints:[...]}` with response events |
| POST | /orders/:id/complaints | Owner STUDENT; complaint body below |
| PATCH | /complaints/:id | Owner/student or STAFF depending on transition; `{status,message}` |

Create-order response: 201 `{order}`. Lists return `{orders:[...]}`. Orders contain id, studentId, bagNo, totalCount, status, delayReason, lotId, createdAt, updatedAt, items, events, lot and student display fields. Mutations to existing orders/lots generally return `{message}`. Creating a lot returns 201 `{lot}`.

Clothing types: Shirt, T-shirt, Pant, Shorts, Kurta, Bedsheet, Towel, Other. Quantities must be integers. Total is calculated server-side and limited to 1–15. Backend obtains bag/student from the authenticated user. Duplicate active submissions return 409, including parallel requests.

Allowed order progression: SUBMITTED, RECEIVED, WASHING, READY, COLLECTED. RECEIVED to WASHING happens through the lot-start endpoint. Staff must set atCounter=true before READY; only READY can become COLLECTED. Invalid jumps return 409.

## Complaints

```json
{"type":"MISSING","itemType":"Shirt","quantity":1,"description":"One blue shirt is missing after collection."}
```

Types: MISSING, EXTRA, WASH_QUALITY, COLOUR_DAMAGE. itemType and quantity are required for MISSING/EXTRA; quality complaints need type and description. Missing count must not exceed the submitted quantity of that type. Complaints require a Received-or-later order and remain possible after collection.

Create response: 201 `{complaint}`. `GET /complaints` includes order.id, order.bagNo and the event history.

Staff transitions:
- OPEN to IN_PROGRESS, with a message.
- IN_PROGRESS to IN_PROGRESS for updates, or AWAITING_CONFIRMATION for proposed resolution.

Student transitions:
- AWAITING_CONFIRMATION to RESOLVED, or IN_PROGRESS if unresolved, with a message.

Example `PATCH /api/complaints/:id`:

```json
{"status":"AWAITING_CONFIRMATION","message":"Missing shirt returned. Please confirm receipt."}
```

Staff cannot directly mark a complaint RESOLVED. Successful updates return `{"message":"Complaint updated."}`.

## Error handling

400 invalid input/JSON/code; 401 missing, expired or revoked login; 403 wrong role or Origin; 404 missing/inaccessible record; 409 active-order, uniqueness or state conflict; 413 oversized body; 415 non-JSON write; 429 rate limit (Retry-After header); 500 generic server failure.

UI should disable duplicate submissions, show the message on failure, and refresh after successful mutations. Do not redirect based on a role typed in the form. Use the role returned by login. The signup frontend uses the public registration endpoint above.
