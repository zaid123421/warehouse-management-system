# WMS — ترتيب الـ Endpoints (Inbound → Outbound)

> مسار تشغيل كامل بدون bodies. البادئة المشتركة: `/api/v1`  
> **Dealer** = `DEALER_TOKEN` · **Manager** = `WAREHOUSE_MANAGER` · **Staff** = `WAREHOUSE_STAFF`

---

## 0) تمهيد (مرة واحدة)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 0.1 | POST | `/auth/login` | الكل |
| 0.2 | POST | `/wms/warehouses` | Admin |
| 0.3 | POST | `/wms/my-warehouse/initiate` | Manager |
| 0.4 | PUT | `/dealers/{dealerId}/primary-warehouse` | Admin |

**Migrations مطلوبة للـ inbound الجديد:** V40 (scheduling city)، V41 (inbound trucks)، V42 (receiving ↔ truck)، V43 (putaway ↔ receiving).  
**Outbound:** V30–V32، V36، V37 (Picking Phase A)، V38 (Shipping Phase B).

---

## 1) Inbound — Dealer (إنشاء الطلب)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 1.1 | POST | `/dealer/shipment-requests/pickup` | Dealer |
| 1.2 | POST | `/dealer/shipment-requests/{pickupOrderId}/submit` | Dealer |

---

## 2) Inbound — Scheduling (Manager)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 2.1 | GET | `/wms/my-warehouse/scheduling/board` | Manager |
| 2.2 | GET | `/wms/my-warehouse/scheduling/cells/{schedulingCellId}` | Manager |
| 2.3 | POST | `/wms/my-warehouse/scheduling/cells/{schedulingCellId}/approve` | Manager |

> بعد approve cell: الطلبات → `SCHEDULE_APPROVED` (تظهر في planning pool).

---

## 3) Inbound — Truck Planning + Transit (Manager)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 3.1 | GET | `/wms/my-warehouse/inbound-trucks/planning-pool` | Manager |
| 3.2 | GET | `/wms/my-warehouse/inbound-trucks/planning-pool?schedulingCellId={id}` | Manager *(اختياري)* |
| 3.3 | POST | `/wms/my-warehouse/inbound-trucks` | Manager |
| 3.4 | GET | `/wms/my-warehouse/inbound-trucks/planning` | Manager |
| 3.5 | GET | `/wms/my-warehouse/inbound-trucks/{truckId}` | Manager |
| 3.6 | POST | `/wms/my-warehouse/inbound-trucks/{truckId}/assign/{inboundRequestId}` | Manager |
| 3.7 | DELETE | `/wms/my-warehouse/inbound-trucks/{truckId}/assign/{inboundRequestId}` | Manager *(اختياري)* |
| 3.8 | POST | `/wms/my-warehouse/inbound-trucks/{truckId}/approve` | Manager *(حجز المواقع)* |
| 3.9 | GET | `/wms/my-warehouse/inbound-trucks/transit` | Manager |
| 3.10 | POST | `/wms/my-warehouse/inbound-trucks/{truckId}/create-receiving-session` | Manager |

> **Handover عند الوكيل** (Dealer) مطلوب قبل create-receiving-session — shipment `RECEIVED`/`FULFILLED`، tires `SHIPPED`.  
> **معطّل:** `POST /inbound-requests/{id}/accept` · `POST /receiving-sessions` · `POST /scheduling/generate-receiving-sessions`

---

## 4) Inbound — Receiving Session (Manager)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 4.1 | GET | `/wms/my-warehouse/receiving-sessions` | Manager |
| 4.2 | GET | `/wms/my-warehouse/receiving-sessions/{receivingSessionId}` | Manager |
| 4.3 | POST | `/wms/my-warehouse/receiving-sessions/{receivingSessionId}/approve` | Manager |
| 4.4 | POST | `/wms/my-warehouse/receiving-sessions/{receivingSessionId}/reject` | Manager *(اختياري)* |
| 4.5 | POST | `/wms/my-warehouse/receiving-sessions/{receivingSessionId}/assign` | Manager |
| 4.6 | POST | `/wms/my-warehouse/receiving-sessions/{receivingSessionId}/start` | Manager |

> قراءة فقط (اختياري): `GET /inbound-requests?status=...` · `GET /inbound-requests/{id}`

---

## 5) Inbound — Receiving Task (Staff)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 5.1 | GET | `/wms/my-warehouse/tasks` | Staff *(inbox موحّد)* |
| 5.2 | GET | `/wms/my-warehouse/tasks/receiving` | Staff |
| 5.3 | GET | `/wms/my-warehouse/tasks/receiving/{receivingSessionId}` | Staff |
| 5.4 | POST | `/wms/my-warehouse/tasks/receiving/{receivingSessionId}/scan` | Staff *(كرّر لكل إطار)* |

---

## 6) Inbound — إغلاق الاستلام

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 6.1 | POST | `/wms/my-warehouse/receiving-sessions/{receivingSessionId}/complete` | Manager / Staff |

> بعد complete: putaway sessions تُنشأ تلقائياً (واحدة لكل zone) · truck → `COMPLETED`.

---

## 7) Inbound — Putaway Session (Manager)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 7.1 | GET | `/wms/my-warehouse/putaway-sessions` | Manager |
| 7.2 | GET | `/wms/my-warehouse/putaway-sessions?receivingSessionId={id}` | Manager |
| 7.3 | GET | `/wms/my-warehouse/putaway-sessions/{putawaySessionId}` | Manager |
| 7.4 | POST | `/wms/my-warehouse/putaway-sessions/{putawaySessionId}/approve` | Manager |
| 7.5 | POST | `/wms/my-warehouse/putaway-sessions/{putawaySessionId}/assign` | Manager *(1..N staff)* |
| 7.6 | POST | `/wms/my-warehouse/putaway-sessions/{putawaySessionId}/start` | Manager |

> receiving session واحدة → **عدة** putaway sessions (حسب zone).

---

## 8) Inbound — Putaway Task (Staff)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 8.1 | GET | `/wms/my-warehouse/tasks` | Staff *(inbox موحّد)* |
| 8.2 | GET | `/wms/my-warehouse/tasks/putaway` | Staff |
| 8.3 | GET | `/wms/my-warehouse/tasks/putaway/{putawaySessionId}` | Staff |
| 8.4 | POST | `/wms/my-warehouse/tasks/putaway/{putawaySessionId}/confirm` | Staff *(بعد start فقط)* |

> بعد آخر confirm: إطارات `STORED`، inbound `COMPLETED`، pickup → `FULFILLED`.

---

## 9) Inbound — مراقبة *(اختياري)*

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 9.1 | GET | `/wms/my-warehouse/operations/dashboard` | Manager |
| 9.2 | POST | `/wms/my-warehouse/operations/release-expired-reservations` | Manager |

---

## 10) Outbound — Dealer (إنشاء التسليم)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 10.1 | POST | `/dealer/shipment-requests/delivery` | Dealer |
| 10.2 | POST | `/dealer/shipment-requests/{deliveryOrderId}/submit` | Dealer |

---

## 11) Outbound — جدولة (Manager)

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 11.1 | GET | `/wms/my-warehouse/outbound-scheduling/board` | Manager |
| 11.2 | GET | `/wms/my-warehouse/outbound-scheduling/cells/{outboundSchedulingCellId}` | Manager |
| 11.3 | POST | `/wms/my-warehouse/outbound-scheduling/cells/{outboundSchedulingCellId}/approve` | Manager |

---

## 12) Outbound — Picking Session (Manager)

> **Phase A:** التجميع per-dealer — جلسة منفصلة لكل وكيل في نفس `deliveryDay`.

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 12.1 | POST | `/wms/my-warehouse/outbound-scheduling/generate-picking-sessions` | Manager |
| 12.2 | GET | `/wms/my-warehouse/picking-sessions` | Manager |
| 12.3 | GET | `/wms/my-warehouse/picking-sessions/{pickingSessionId}` | Manager |
| 12.4 | POST | `/wms/my-warehouse/picking-sessions/{pickingSessionId}/approve` | Manager |
| 12.5 | POST | `/wms/my-warehouse/picking-sessions/{pickingSessionId}/cancel` | Manager *(اختياري)* |
| 12.6 | POST | `/wms/my-warehouse/picking-sessions/{pickingSessionId}/assign` | Manager |
| 12.7 | POST | `/wms/my-warehouse/picking-sessions/{pickingSessionId}/start` | Manager |

---

## 13) Outbound — Picking Task (Staff)

> **Phase A:** مسح مزدوج — `tireRawCode` + `locationBarcode`.

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 13.1 | GET | `/wms/my-warehouse/tasks` | Staff *(inbox موحّد)* |
| 13.2 | GET | `/wms/my-warehouse/tasks/picking` | Staff |
| 13.3 | GET | `/wms/my-warehouse/tasks/picking/{pickingSessionId}` | Staff |
| 13.4 | POST | `/wms/my-warehouse/tasks/picking/{pickingSessionId}/scan` | Staff *(موقع + إطار)* |
| 13.5 | POST | `/wms/my-warehouse/tasks/picking/{pickingSessionId}/mark-missing` | Staff *(اختياري)* |

---

## 14) Outbound — إغلاق Picking

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 14.1 | POST | `/wms/my-warehouse/picking-sessions/{pickingSessionId}/complete` | Manager |
| 14.2 | POST | `/wms/my-warehouse/picking-sessions/{pickingSessionId}/dispatch` | Manager *(legacy — يفضّل §15)* |

---

## 15) Outbound — Shipping Session (Manager) — Phase B

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 15.1 | POST | `/wms/my-warehouse/shipping-sessions/generate` | Manager |
| 15.2 | GET | `/wms/my-warehouse/shipping-sessions` | Manager |
| 15.3 | GET | `/wms/my-warehouse/shipping-sessions/{shippingSessionId}` | Manager |
| 15.4 | POST | `/wms/my-warehouse/shipping-sessions/{shippingSessionId}/approve` | Manager |
| 15.5 | POST | `/wms/my-warehouse/shipping-sessions/{shippingSessionId}/cancel` | Manager *(اختياري)* |
| 15.6 | POST | `/wms/my-warehouse/shipping-sessions/{shippingSessionId}/assign` | Manager |
| 15.7 | POST | `/wms/my-warehouse/shipping-sessions/{shippingSessionId}/start` | Manager |
| 15.8 | POST | `/wms/my-warehouse/shipping-sessions/{shippingSessionId}/complete` | Manager |

---

## 16) Outbound — Shipping Task (Staff) — Phase B

| # | Method | Endpoint | من |
|---|--------|----------|-----|
| 16.1 | GET | `/wms/my-warehouse/tasks` | Staff *(inbox موحّد)* |
| 16.2 | GET | `/wms/my-warehouse/tasks/shipping` | Staff |
| 16.3 | GET | `/wms/my-warehouse/tasks/shipping/{shippingSessionId}` | Staff |
| 16.4 | POST | `/wms/my-warehouse/tasks/shipping/{shippingSessionId}/scan` | Staff *(إطار فقط)* |
| 16.5 | POST | `/wms/my-warehouse/tasks/shipping/{shippingSessionId}/mark-missing` | Staff *(اختياري)* |

---

## ملخص سريع — Staff Inbox

```
GET  /wms/my-warehouse/tasks                              → كل المهام (RECEIVING/PUTAWAY/PICKING/SHIPPING)
GET  /wms/my-warehouse/tasks/receiving/{id}             → تفاصيل استلام
POST /wms/my-warehouse/tasks/receiving/{id}/scan        → مسح استلام (بعد manager start)
GET  /wms/my-warehouse/tasks/putaway/{id}               → تفاصيل تخزين
POST /wms/my-warehouse/tasks/putaway/{id}/confirm       → تأكيد تخزين (بعد manager start)
GET  /wms/my-warehouse/tasks/picking/{id}               → تفاصيل سحب
POST /wms/my-warehouse/tasks/picking/{id}/scan          → مسح سحب (إطار + موقع)
POST /wms/my-warehouse/tasks/picking/{id}/mark-missing  → missing أثناء السحب
GET  /wms/my-warehouse/tasks/shipping/{id}              → تفاصيل شحن
POST /wms/my-warehouse/tasks/shipping/{id}/scan         → مسح شحن (إطار فقط)
POST /wms/my-warehouse/tasks/shipping/{id}/mark-missing → missing أثناء الشحن
```

---

## مسار Inbound الموصى به

```
Pickup submit → scheduling approve cell
  → planning pool → create truck → assign orders → approve truck (reserve)
  → dealer handover → transit IN_TRANSIT → create receiving session
  → approve → assign → start → scan → complete receiving
  → putaway per zone → approve → assign → start → confirm scans
  → inbound COMPLETED
```

---

## مسار Outbound الموصى به (Phase A + B)

```
Delivery submit → outbound scheduling approve
  → generate picking (per-dealer) → approve → assign → start
  → pick scan (tire + location) → [mark-missing] → complete picking
  → generate shipping → approve → assign → start
  → ship scan → [mark-missing] → complete shipping
  → outbound COMPLETED
```
