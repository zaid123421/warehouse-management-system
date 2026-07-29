# WMS Manual Smoke Test — Swagger (Routing + Inbound Phases S, 1–6)

> **الغرض:** اختبار يدوي end-to-end عبر Swagger UI بدون unit tests وبدون `MockWarehouseGateway`.  
> **التاريخ:** 2026-07-06  
> **Swagger:** `http://localhost:9003/swagger-ui/index.html`  
> **Base URL:** `http://localhost:9003`

---

## 0) قبل البدء

### 0.1 Migrations (يدوياً — Flyway معطّل في `pom.xml`)

طبّق على PostgreSQL `treadx` على الأقل:


| الملف                                            | الغرض                                         |
| ------------------------------------------------ | --------------------------------------------- |
| `V27__wms_inbound_foundation.sql`                | inbound + sessions + staging                  |
| `V28__dealer_address_for_routing.sql`            | `dealer.address_id`                           |
| `V29__wms_inbound_scheduling.sql`                | scheduling + `receiving_day`                  |
| `V30__wms_outbound_scheduling.sql`               | outbound scheduling + `delivery_day`          |
| `V31__wms_picking_sessions.sql`                  | picking sessions + links                      |
| `V32__wms_picking_execution.sql`                 | picking assignments + scans                   |
| `V36__storage_position_history_action_check.sql` | CHECK يشمل `RESERVED`                         |
| `V37__wms_picking_phase_a.sql`                   | picking per-dealer + double scan + MISSING    |
| `V38__wms_shipping_sessions.sql`                 | shipping sessions + scans + outbound statuses |


```powershell
psql -h localhost -U postgres -d treadx -f src\main\resources\db\migration\V29__wms_inbound_scheduling.sql
```

**تحقق سريع:**

```sql
SELECT column_name FROM information_schema.columns
 WHERE table_schema='wms' AND table_name='inbound_request'
   AND column_name IN ('receiving_day','schedule_status');
-- يجب صفّان
```



### 0.2 تشغيل التطبيق

```powershell
mvn spring-boot:run
```

يجب أن يبدأ بدون `Schema-validation: missing column`.

### 0.3 المصادقة في Swagger

1. نفّذ **Login** (قسم 1) واحفظ `accessToken`.
2. في Swagger اضغط **Authorize** وأدخل: `Bearer <accessToken>` (مع كلمة Bearer).



### 0.4 متغيرات تسجّلها أثناء الاختبار


| المتغير                             | من أين                                                |
| ----------------------------------- | ----------------------------------------------------- |
| `DEALER_TOKEN`                      | login وكيل                                            |
| `MANAGER_TOKEN`                     | login مدير مستودع                                     |
| `ADMIN_TOKEN`                       | login system admin                                    |
| `dealerId`                          | tenant أو GET dealers                                 |
| `warehouseId`                       | GET warehouses أو routing                             |
| `customerId`, `vehicleId`, `setIds` | GET customers / vehicles / tire-sets                  |
| `pickupOrderId`, `version`          | POST pickup / GET order                               |
| `deliveryOrderId`                   | POST delivery / GET order                             |
| `inboundRequestId`                  | SQL أو GET inbound-requests                           |
| `schedulingCellId`                  | GET scheduling/board                                  |
| `outboundSchedulingCellId`          | GET outbound-scheduling/board                         |
| `pickingSessionId`                  | POST outbound-scheduling/generate-picking-sessions    |
| `shippingSessionId`                 | POST shipping-sessions/generate                       |
| `receivingSessionId`                | POST receiving-sessions                               |
| `STAFF_TOKEN`                       | login موظف مستودع                                     |
| `staffUserId`                       | من إنشاء المستودع أو تعيين يدوي                       |
| `putawaySessionId`                  | تلقائي بعد complete receiving أو GET putaway-sessions |
| `tireUniqueId`                      | من GET inbound-requests بعد accept أو manifest        |
| `locationBarcode`                   | من `reservedPositionBarcode` في accept res            |




### 0.5 حسابات Demo (إن كان `treadx.seeder.demo.enabled=true`)


| الدور                    | Email                         | Password     |
| ------------------------ | ----------------------------- | ------------ |
| Dealer Admin (Westwind)  | `westwind.admin@treadx.demo`  | `Password!1` |
| Dealer Admin (Northwind) | `northwind.admin@treadx.demo` | `Password!1` |
| Dealer Technician        | `westwind.tech@treadx.demo`   | `Password!1` |


> **SYSTEM_ADMIN** و **WAREHOUSE_MANAGER**: أنشئهما عبر النظام أو استخدم حساباتك المحلية. عند إنشاء مستودع جديد يُنشأ مدير المستودع تلقائياً (قسم 2).

---



## 1) المصادقة



### 1.1 Login — Dealer

`POST /api/v1/auth/login`

```json
{
  "email": "westwind.admin@treadx.demo",
  "password": "Password!1"
}
```

**متوقّع** `200`**:**

```json
{
  "accessToken": "eyJ...",
  "role": "DEALER_ADMIN",
  "tenantType": "DEALER",
  "tenantId": 4
}
```

احفظ `accessToken` → `DEALER_TOKEN` و `tenantId` → `dealerId`.

---



### 1.2 Login — Warehouse Manager

```json
{
  "email": "<warehouse-manager-email>",
  "password": "<password>"
}
```

**متوقّع** `200`**:** `role` = `WAREHOUSE_MANAGER`

---



### 1.3 Login — Warehouse Staff

```json
{
  "email": "<warehouse-staff-email>",
  "password": "<password>"
}
```

**متوقّع** `200`**:** `role` = `WAREHOUSE_STAFF`

احفظ `accessToken` → `STAFF_TOKEN` و `userId` → `staffUserId`.

> إن لم يكن لديك موظف: أنشئ مستخدم `WAREHOUSE_STAFF` واربطه بالمستودع عبر `warehouse_user_assignment` (SQL أو واجهة الإدارة).

---



### 1.4 Login — System Admin

```json
{
  "email": "<system-admin-email>",
  "password": "<password>"
}
```

**متوقّع** `200`**:** `role` = `SYSTEM_ADMIN`

---



## 2) إعداد البيئة (مرة واحدة — SYSTEM_ADMIN)

> تخطَّ هذا القسم إن كان لديك مستودع فعّال + مواقع تخزين + وكيل بعنوان.



### 2.1 قائمة الدول (للعنوان)

`GET /api/v1/addresses/base/countries` — بدون auth أو مع token

**متوقّع** `200`**:** مصفوفة دول → احفظ `countryId`.

### 2.2 محافظات ومدن

`GET /api/v1/addresses/countries/{countryId}/provinces`  
`GET /api/v1/addresses/provinces/{provinceId}/cities`

احفظ `stateId` (province) و `cityId`.

### 2.3 إنشاء مستودع + مدير

`POST /api/v1/wms/warehouses` — `ADMIN_TOKEN`

```json
{
  "warehouseName": "Test Warehouse Calgary",
  "warehouseCode": "WH-CAL-TEST",
  "email": "wh-cal@test.local",
  "phoneNumber": "+14035550000",
  "address": {
    "streetName": "Warehouse Rd",
    "streetNumber": "100",
    "postalCode": "T2P1A1",
    "cityId": 1,
    "stateId": 1,
    "countryId": 1
  },
  "manager": {
    "firstName": "WH",
    "lastName": "Manager",
    "email": "wh.manager.cal@test.local",
    "password": "Password!1"
  }
}
```

**متوقّع** `201`**:** `warehouse.id` → `warehouseId`، ومدير يمكنه تسجيل الدخول بالإيميل أعلاه.

### 2.4 تهيئة هيكل المستودع (مواقع تخزين)

سجّل دخول كـ **WAREHOUSE_MANAGER** ثم:

`POST /api/v1/wms/my-warehouse/initiate`

```json
{
  "zonesCount": 2,
  "rowsPerZone": 1,
  "racksPerRow": 1,
  "slotsPerRack": 2,
  "positionsPerSlot": 4
}
```

**متوقّع** `202`**:** `jobId` + `status` (PENDING/RUNNING). انتظر حتى `COMPLETED` عبر:

`GET /api/v1/wms/warehouse-init-jobs/{jobId}`

**تحقق SQL:**

```sql
SELECT COUNT(*) FROM wms.storage_position sp
JOIN wms.slot s ON s.id=sp.slot_id
JOIN wms.rack r ON r.id=s.rack_id
JOIN wms.wms_row rw ON rw.id=r.row_id
JOIN wms.zone z ON z.id=rw.zone_id
WHERE z.warehouse_id = <warehouseId>
  AND sp.status='AVAILABLE' AND sp.is_occupied=false;
-- يجب > 0
```



### 2.5 (اختياري) Staging area للوكيل — لاختبار خوارزمية التجميع

لا يوجد API بعد؛ نفّذ SQL:

```sql
INSERT INTO wms.staging_area (warehouse_id, name, zone_id, dealer_id, created_by)
SELECT <warehouseId>, 'Dealer-Westwind-Staging', z.id, <dealerId>, 0
### 2.6 عنوان منظّم للوكيل (مهم لـ submit PICKUP)

الوكلاء القدامى (قبل V28) قد يكون `dealer.address_id` = NULL → submit يفشل أو inbound لا يُجدول.

**تحقق:**

```sql
SELECT id, legal_name, address_id FROM dealer.dealer WHERE id = <dealerId>;
```

**إن كان NULL** — اربط عنواناً من Lead أو نفّذ SQL (مثال):

```sql
-- استبدل city_id / province_id / country_id بقيم صحيحة من system_city / system_province
INSERT INTO address (street_name, city_id, province_id, country_id, postal_code, created_by)
VALUES ('Main St', 1, 1, 1, 'T2P1A1', 0)
RETURNING id;  -- احفظ address_id

UPDATE dealer.dealer SET address_id = <address_id> WHERE id = <dealerId>;
```

---

## 3) Routing — توجيه الوكيل للمستودع (اختياري)

### 3.1 أول طلب يُفعّل التوجيه التلقائي

عند أول `findPrimaryForDealer` (مثلاً عند إنشاء pickup)، النظام يشغّل `CompositeScoreRoutingStrategy` ويكتب `dealer_warehouse_assignment`.

**تحقق بعد أول pickup:**

```sql
SELECT dealer_id, warehouse_id, is_primary
FROM wms.dealer_warehouse_assignment
WHERE dealer_id = <dealerId>;
-- صف واحد is_primary=true
```

### 3.2 GET primary (Admin override — قراءة)

`GET /api/v1/dealers/{dealerId}/primary-warehouse` — `ADMIN_TOKEN`

**متوقّع** `200`**:**

```json
{
  "dealerId": 4,
  "warehouseId": 1,
  "warehouseName": "...",
  "warehouseCode": "...",
  "primary": true
}
```

### 3.3 PUT override يدوي

`PUT /api/v1/dealers/{dealerId}/primary-warehouse`

```json
{ "warehouseId": 2 }
```

**متوقّع** `200`**:** `warehouseId` = 2، `primary` = true

### 3.4 DELETE — إرجاع للتلقائي

`DELETE /api/v1/dealers/{dealerId}/primary-warehouse`

**متوقّع** `204`

---

## 4) المسار الرئيسي — Inbound End-to-End

### المخطط

```
PICKUP create → submit → inbound_request (SCHEDULED)
  → approve scheduling cell → PENDING_ACCEPTANCE
  → accept + reserve → RESERVATIONS_COMPLETE
  → receiving session → approve → RECEIVING_APPROVED
  → assign staff → start → scan tires (mobile) → complete receiving
  → putaway sessions (auto per zone) → approve → assign
  → confirm tire + location (mobile) → inbound COMPLETED
```

---

### 4.1 اكتشاف بيانات الوكيل (Dealer)

#### أ) عملاء الوكيل

`GET /api/v1/dealerCustomers/my-dealer?page=0&size=10` — `DEALER_TOKEN`

**متوقّع** `200`**:** `content[0].id` → `customerId`

#### ب) مركبات العميل

`GET /api/v1/dealerCustomers/{customerId}/vehicles` — `DEALER_TOKEN`

**متوقّع** `200`**:** `content[0].id` → `vehicleId`

#### ج) مجموعات إطارات

`GET /api/v1/dealerCustomers/{customerId}/vehicles/{vehicleId}/tire-sets` — `DEALER_TOKEN`

**متوقّع** `200`**:** `content[0].id` → ضعه في `setIds`

---

### 4.2 إنشاء طلب PICKUP

`POST /api/v1/dealer/shipment-requests/pickup` — `DEALER_TOKEN`

```json
{
  "dealerCustomerId": 1,
  "vehicleId": 1,
  "setIds": [1],
  "preferredDispatchDay": "MONDAY",
  "notes": "Smoke test inbound"
}
```

**متوقّع** `201`**:**

```json
{
  "id": 42,
  "direction": "PICKUP",
  "status": "IN_CART",
  "warehouseId": 1,
  "preferredDeliveryDay": "MONDAY",
  "version": 0
}
```

احفظ `id` → `pickupOrderId`، `version`.

> إن فشل بـ 404 «No warehouse assigned»: راجع قسم 3 أو 2 (مستودع + سعة + عنوان وكيل).

---

### 4.3 Submit الطلب (يُنشئ inbound_request)

`POST /api/v1/dealer/shipment-requests/{pickupOrderId}/submit` — `DEALER_TOKEN`

```json
{ "version": 0 }
```

**متوقّع** `200`**:**

```json
{
  "id": 42,
  "status": "SUBMITTED",
  "submittedAt": "2026-07-03T..."
}
```

**تحقق SQL (خلال ثوانٍ):**

```sql
SELECT ir.id, ir.status, ir.schedule_status, ir.receiving_day,
       ir.total_volume, ir.dealer_region_province_id
FROM wms.inbound_request ir
JOIN dealer.shipment_request sr ON sr.id = ir.shipment_request_id
WHERE sr.id = <pickupOrderId>;
```


| الحقل             | متوقّع                                                |
| ----------------- | ----------------------------------------------------- |
| `status`          | `SCHEDULED` (أو `PENDING_SCHEDULING` إن لا يوم/منطقة) |
| `schedule_status` | `SCHEDULED`                                           |
| `receiving_day`   | `MONDAY`                                              |
| `total_volume`    | عدد إطارات الـ manifest (>0)                          |


احفظ `ir.id` → `inboundRequestId`.

```sql
SELECT sc.id, sc.receiving_day, sc.total_volume, sc.estimated_trucks, sc.status
FROM wms.scheduling_cell sc
JOIN wms.scheduling_cell_request scr ON scr.scheduling_cell_id = sc.id
WHERE scr.inbound_request_id = <inboundRequestId>;
-- صف واحد على الأقل، status=PLANNED
```

---

### 4.4 مسار بديل: استخدام Demo الجاهز

إن كان الـ seeder فعّالاً، الوكيل `westwind` لديه pickup `SUBMITTED`:

`GET /api/v1/dealer/shipment-requests?status=SUBMITTED&direction=PICKUP` — `DEALER_TOKEN`

ابحث عن طلب `westwind` بـ `preferredDeliveryDay=MONDAY` واستخدم `id` كـ `pickupOrderId` ثم تابع من 4.5.

---

### 4.5 جدولة — Scheduling Board (Warehouse Manager)

`GET /api/v1/wms/my-warehouse/scheduling/board` — `MANAGER_TOKEN`

**متوقّع** `200`**:**

```json
{
  "warehouseId": 1,
  "cells": [
    {
      "cellId": 5,
      "receivingDay": "MONDAY",
      "regionProvinceName": "Alberta",
      "totalVolume": 4,
      "estimatedTrucks": 1,
      "status": "PLANNED",
      "requestCount": 1
    }
  ]
}
```

احفظ `cellId` → `schedulingCellId`.

#### تفاصيل الخلية

`GET /api/v1/wms/my-warehouse/scheduling/cells/{schedulingCellId}`

**متوقّع** `200`**:** `requests[]` تحتوي `inboundRequestId` و `status=SCHEDULED`.

#### اعتماد الخلية

`POST /api/v1/wms/my-warehouse/scheduling/cells/{schedulingCellId}/approve`

**متوقّع** `200`**:**

```json
{
  "status": "APPROVED",
  "requests": [
    { "inboundRequestId": 10, "status": "PENDING_ACCEPTANCE", "scheduleStatus": "APPROVED" }
  ]
}
```

---

### 4.6 قبول الطلب + حجز المواقع (Phase 1)

#### قائمة الانتظار

`GET /api/v1/wms/my-warehouse/inbound-requests` — `MANAGER_TOKEN`

**متوقّع** `200`**:** مصفوفة فيها `status=PENDING_ACCEPTANCE`.

#### تفاصيل

`GET /api/v1/wms/my-warehouse/inbound-requests/{inboundRequestId}`

**متوقّع** `200`**:** `expectedTireCount` > 0، `lines` فارغة قبل accept.

#### Accept + Reserve (خوارزمية ClusteredZone)

`POST /api/v1/wms/my-warehouse/inbound-requests/{inboundRequestId}/accept`

**متوقّع** `200`**:**

```json
{
  "id": 10,
  "status": "RESERVATIONS_COMPLETE",
  "acceptedAt": "2026-07-03T...",
  "lines": [
    {
      "tireId": 100,
      "tireUniqueId": "278...",
      "reservedPositionId": 501,
      "reservedPositionBarcode": "WH-ZN01-RW01-...",
      "status": "RESERVED"
    }
  ]
}
```

**تحقق SQL — التجميع في zone واحدة:**

```sql
SELECT z.id AS zone_id, z.zone_name, COUNT(*) AS tires_reserved
FROM wms.inbound_request_line irl
JOIN wms.storage_position sp ON sp.id = irl.reserved_position_id
JOIN wms.slot s ON s.id = sp.slot_id
JOIN wms.rack r ON r.id = s.rack_id
JOIN wms.wms_row rw ON rw.id = r.row_id
JOIN wms.zone z ON z.id = rw.zone_id
WHERE irl.inbound_request_id = <inboundRequestId>
GROUP BY z.id, z.zone_name;
-- يُفضّل صف واحد بعدد = expected_tire_count
```

```sql
SELECT sp.status, sp.reserved_for_tire_id IS NOT NULL AS reserved
FROM wms.storage_position sp
JOIN wms.inbound_request_line irl ON irl.reserved_position_id = sp.id
WHERE irl.inbound_request_id = <inboundRequestId>;
-- status=RESERVED لكل صف
```

#### Reject (اختبار سلبي — طلب جديد)

`POST /api/v1/wms/my-warehouse/inbound-requests/{otherInboundId}/reject`

**متوقّع** `200`**:** `status=CANCELLED`

---

### 4.7 Receiving Session (Phase 2)

#### إنشاء جلسة يدوياً

`POST /api/v1/wms/my-warehouse/receiving-sessions` — `MANAGER_TOKEN`

```json
{
  "inboundRequestIds": [10]
}
```

**متوقّع** `201`**:**

```json
{
  "id": 3,
  "status": "PENDING_APPROVAL",
  "expectedTires": 4,
  "receivedTires": 0,
  "inboundRequests": [
    { "inboundRequestId": 10, "status": "RECEIVING_SESSION_PENDING" }
  ]
}
```

احفظ `id` → `receivingSessionId`.

#### أو: توليد تلقائي من الجدولة

`POST /api/v1/wms/my-warehouse/scheduling/generate-receiving-sessions`

```json
{ "receivingDay": "MONDAY" }
```

**متوقّع** `201`**:** `sessions[]` مع `receivingSessionId`.

> يتطلّب طلبات بحالة `RESERVATIONS_COMPLETE` لنفس اليوم.

#### قائمة الجلسات

`GET /api/v1/wms/my-warehouse/receiving-sessions`

**متوقّع** `200`**:** مصفوفة جلسات للمستودع.

#### تفاصيل جلسة

`GET /api/v1/wms/my-warehouse/receiving-sessions/{receivingSessionId}`

**متوقّع** `200`**:** `status=PENDING_APPROVAL`، `inboundRequests` مرتبطة.

#### اعتماد الجلسة

`POST /api/v1/wms/my-warehouse/receiving-sessions/{receivingSessionId}/approve`

**متوقّع** `200`**:**

```json
{
  "status": "APPROVED",
  "approvedAt": "...",
  "inboundRequests": [
    { "status": "RECEIVING_APPROVED" }
  ]
}
```

#### رفض الجلسة (اختبار سلبي)

`POST /api/v1/wms/my-warehouse/receiving-sessions/{receivingSessionId}/reject`

**متوقّع** `200`**:** `status=CANCELLED`، inbound يرجع `RESERVATIONS_COMPLETE`.

---

### 4.8 Receiving — إسناد + موبايل + مسح (Phase 3)

> بعد اعتماد الجلسة (`APPROVED`). المدير يُسند الموظفين؛ الموظف يمسح الإطارات على الموبايل.

#### إسناد موظفين

`POST /api/v1/wms/my-warehouse/receiving-sessions/{receivingSessionId}/assign` — `MANAGER_TOKEN`

```json
{
  "staffUserIds": [451]
}
```

**متوقّع** `200`**:**

```json
{
  "status": "APPROVED",
  "assignedStaffUserIds": [451]
}
```

#### بدء الجلسة

`POST /api/v1/wms/my-warehouse/receiving-sessions/{receivingSessionId}/start` — `MANAGER_TOKEN`

**متوقّع** `200`**:** `status=IN_PROGRESS`، `startedAt` معبّأ، inbound → `RECEIVING_IN_PROGRESS`.

#### قائمة مهام الموظف (موبايل)

`GET /api/v1/wms/my-warehouse/tasks/receiving` — `STAFF_TOKEN`

**متوقّع** `200`**:**

```json
[
  {
    "sessionId": 3,
    "status": "IN_PROGRESS",
    "expectedTires": 4,
    "receivedTires": 0,
    "progressPercent": 0
  }
]
```

#### تفاصيل المهمة + manifest

`GET /api/v1/wms/my-warehouse/tasks/receiving/{receivingSessionId}` — `STAFF_TOKEN`

**متوقّع** `200`**:** `manifest[]` فيها `tireUniqueId`، `status=PUTAWAY_PENDING` أو `AT_STAGING` قبل المسح.

احفظ كل `tireUniqueId` من الـ manifest.

#### مسح إطار (استلام)

`POST /api/v1/wms/my-warehouse/tasks/receiving/{receivingSessionId}/scan` — `STAFF_TOKEN`

```json
{
  "rawCode": "<tireUniqueId>"
}
```

**متوقّع** `200` **(نجاح):**

```json
{
  "result": "MATCH",
  "lineStatus": "AT_STAGING",
  "matchedCount": 1,
  "expectedCount": 4
}
```

**نتائج أخرى:** `UNKNOWN` | `NOT_IN_MANIFEST` | `DUPLICATE`

كرّر المسح لكل إطار في الـ manifest حتى `matchedCount` = `expectedCount`.

**تحقق SQL بعد كل MATCH:**

```sql
SELECT t.id, t.status FROM dealer.tire t WHERE t.tire_unique_id = '<tireUniqueId>';
-- status = RECEIVED
```

SELECT irl.status, irl.staging_area_id
FROM wms.inbound_request_line irl
JOIN dealer.tire t ON t.id = irl.tire_id
WHERE t.tire_unique_id = '';
-- status = AT_STAGING

```

```



```



#### إغلاق جلسة الاستلام

`POST /api/v1/wms/my-warehouse/receiving-sessions/{receivingSessionId}/complete` — `MANAGER_TOKEN` أو `STAFF_TOKEN`

**متوقّع** `200`**:**

```json
{
  "status": "COMPLETED",
  "receivedTires": 4,
  "inboundRequests": [
    { "status": "RECEIVING_COMPLETED" }
  ]
}
```

> عند استلام جزئي: inbound → `PARTIALLY_RECEIVED`، خطوط غير الممسوحة → `MISSING` + تحرير الحجز.

**بعد complete:** يُنشأ تلقائياً `putaway_session` لكل zone (Phase 4).

```sql
SELECT ps.id, ps.status, ps.zone_id, ps.tire_count
FROM wms.putaway_session ps
WHERE ps.warehouse_id = <warehouseId>
ORDER BY ps.created_at DESC;
-- صف واحد على الأقل، status=PENDING_APPROVAL
```

احفظ `ps.id` → `putawaySessionId`.

---

### 4.9 Putaway Session — اعتماد + إسناد (Phase 4)

#### قائمة جلسات Putaway

`GET /api/v1/wms/my-warehouse/putaway-sessions` — `MANAGER_TOKEN`

**متوقّع** `200`**:**

```json
[
  {
    "id": 1,
    "zoneId": 10,
    "zoneName": "ZN01",
    "status": "PENDING_APPROVAL",
    "tireCount": 4,
    "completedCount": 0,
    "progressPercent": 0
  }
]
```

#### تفاصيل جلسة

`GET /api/v1/wms/my-warehouse/putaway-sessions/{putawaySessionId}` — `MANAGER_TOKEN`

**متوقّع** `200`**:** `lines[]` مع `tireUniqueId` و `reservedLocationBarcode` لكل إطار.

احفظ `reservedLocationBarcode` → `locationBarcode` لكل إطار.

#### اعتماد جلسة Putaway

`POST /api/v1/wms/my-warehouse/putaway-sessions/{putawaySessionId}/approve` — `MANAGER_TOKEN`

**متوقّع** `200`**:**

```json
{
  "status": "APPROVED",
  "approvedAt": "...",
  "lines": [
    { "lineStatus": "PUTAWAY_PENDING", "reservedLocationBarcode": "WH-ZN01-..." }
  ]
}
```

#### إسناد موظفين (round-robin على الخطوط)

`POST /api/v1/wms/my-warehouse/putaway-sessions/{putawaySessionId}/assign` — `MANAGER_TOKEN`

```json
{
  "staffUserIds": [451]
}
```

**متوقّع** `200`**:** `assignedStaffUserIds` يحتوي الموظفين، كل line فيها `assignedStaffUserId`.

**تحقق SQL:**

```sql
SELECT ir.status FROM wms.inbound_request ir WHERE ir.id = <inboundRequestId>;
-- PUTAWAY_APPROVED (بعد اعتماد كل جلسات putaway للطلب)
```

---

### 4.10 Putaway — موبايل + تأكيد تخزين (Phase 5)

> الموظف المسند يؤكد كل إطار بمسح `tireUniqueId` + باركود الموقع المحجوز.

#### قائمة مهام Putaway

`GET /api/v1/wms/my-warehouse/tasks/putaway` — `STAFF_TOKEN`

**متوقّع** `200`**:**

```json
[
  {
    "sessionId": 1,
    "zoneName": "ZN01",
    "status": "APPROVED",
    "tireCount": 4,
    "completedCount": 0,
    "myAssignedCount": 4,
    "myCompletedCount": 0,
    "progressPercent": 0
  }
]
```

#### تفاصيل مهمة Putaway

`GET /api/v1/wms/my-warehouse/tasks/putaway/{putawaySessionId}` — `STAFF_TOKEN`

**متوقّع** `200`**:** `myLines[]` مع `tireUniqueId` و `reservedLocationBarcode`.

#### تأكيد تخزين إطار

`POST /api/v1/wms/my-warehouse/tasks/putaway/{putawaySessionId}/confirm` — `STAFF_TOKEN`

```json
{
  "tireRawCode": "<tireUniqueId>",
  "locationBarcode": "<reservedLocationBarcode>"
}
```

**متوقّع** `200` **(نجاح):**

```json
{
  "result": "MATCH",
  "lineStatus": "STORED",
  "confirmedLocationBarcode": "WH-ZN01-RW01-...",
  "completedCount": 1,
  "tireCount": 4,
  "sessionStatus": "IN_PROGRESS"
}
```

**نتائج أخرى:** `UNKNOWN` | `MISMATCH` | `WRONG_POSITION` | `DUPLICATE`

> `locationBarcode` **يجب** يطابق الموقع المحجوز بالضبط (MVP).

كرّر لكل إطار. عند آخر إطار: `sessionStatus=COMPLETED`.

**تحقق SQL بعد كل MATCH:**

```sql
SELECT t.status FROM dealer.tire t WHERE t.tire_unique_id = '<tireUniqueId>';
-- STORED

SELECT sp.status, sp.is_occupied, sp.tire_id
FROM wms.storage_position sp
WHERE sp.location_barcode = '<locationBarcode>';
-- status=OCCUPIED, is_occupied=true

SELECT irl.status FROM wms.inbound_request_line irl
JOIN dealer.tire t ON t.id = irl.tire_id
WHERE t.tire_unique_id = '<tireUniqueId>';
-- STORED
```

**بعد اكتمال كل الإطارات:**

```sql
SELECT ir.status, ir.stored_tire_count, ir.completed_at
FROM wms.inbound_request ir WHERE ir.id = <inboundRequestId>;
-- status = COMPLETED
```

---

### 4.10 لوحة العمليات (Phase 6)

> بعد إكمال putaway (أو أثناء التشغيل) — نظرة المدير على الجلسات والعدادات والاستثناءات.

#### Dashboard

`GET /api/v1/wms/my-warehouse/operations/dashboard` — `MANAGER_TOKEN`

**متوقّع** `200`**:**

```json
{
  "warehouseId": 1,
  "counters": {
    "activeInboundRequestCount": 1,
    "totalExpectedTires": 4,
    "totalReceivedTires": 4,
    "totalStoredTires": 4,
    "reservedLineCount": 0,
    "expiredReservationCount": 0,
    "receivingExceptionScanCount": 0,
    "putawayExceptionScanCount": 0,
    "pickingMissingLineCount": 0,
    "pickingExceptionScanCount": 0,
    "shippingMissingLineCount": 0,
    "shippingExceptionScanCount": 0,
    "openShippingSessionCount": 0
  },
  "alerts": [],
  "receivingSessions": [
    {
      "sessionId": 3,
      "status": "COMPLETED",
      "expectedTires": 4,
      "receivedTires": 4,
      "progressPercent": 100,
      "assignedStaffCount": 1,
      "exceptionScanCount": 0
    }
  ],
  "putawaySessions": [
    {
      "sessionId": 1,
      "zoneId": 5,
      "zoneName": "ZN01",
      "status": "COMPLETED",
      "tireCount": 4,
      "completedCount": 4,
      "progressPercent": 100,
      "assignedStaffCount": 1,
      "exceptionScanCount": 0
    }
  ],
  "pickingSessions": [
    {
      "sessionId": 8,
      "dealerId": 52,
      "dealerName": "ABC",
      "deliveryDay": "WEDNESDAY",
      "status": "IN_PROGRESS",
      "expectedTires": 2,
      "pickedTires": 1,
      "missingTires": 0,
      "progressPercent": 50,
      "assignedStaffCount": 1,
      "exceptionScanCount": 0
    }
  ],
  "shippingSessions": [
    {
      "sessionId": 60,
      "deliveryDay": "WEDNESDAY",
      "status": "IN_PROGRESS",
      "expectedTires": 2,
      "shippedTires": 1,
      "missingTires": 0,
      "progressPercent": 50,
      "assignedStaffCount": 1,
      "exceptionScanCount": 0
    }
  ],
  "attentionInboundRequests": []
}
```

**تحقق:**

- `counters.totalStoredTires` = مجموع `stored_tire_count` للطلبات النشطة (غير `COMPLETED`/`CANCELLED`)
- `receivingSessions[].progressPercent` = `receivedTires / expectedTires`
- `putawaySessions[].progressPercent` = `completedCount / tireCount`
- `pickingSessions[]` — تقدم per-dealer (`pickedTires`, `missingTires`)
- `shippingSessions[]` — تقدم الشحن (`shippedTires`, `missingTires`)
- `pickingExceptionScanCount` / `shippingExceptionScanCount` > 0 عند مسوحات فاشلة
- `attentionInboundRequests` يحتوي طلبات `PARTIALLY_RECEIVED` أو `EXPIRED_RESERVATION`

#### فلتر inbound بحالة (اختياري)

`GET /api/v1/wms/my-warehouse/inbound-requests?status=PARTIALLY_RECEIVED` — `MANAGER_TOKEN`

**متوقّع** `200`**:** مصفوفة طلبات بحالة `PARTIALLY_RECEIVED` (فارغة إذا اكتمل الاستلام).

> بدون `status` يبقى السلوك كما كان: قائمة `PENDING_ACCEPTANCE` فقط.

---

## 5) (اختياري) Handover عند الوكيل — قبل الاستلام الفعلي

ليس شرطاً لإنشاء inbound (يُنشأ عند submit)، لكنه يقرّب السيناريو الحقيقي:

### 5.1 فتح جلسة handover

`POST /api/v1/dealer/handover` — `DEALER_TOKEN`

```json
{
  "direction": "OUTBOUND_PICKUP",
  "shipmentRequestIds": [42]
}
```

**متوقّع** `201`**:** `sessionId`, `status=OPEN`

### 5.2 مسح الإطارات

`POST /api/v1/dealer/handover/{sessionId}/scans`

```json
{
  "rawCodes": ["<tireUniqueId1>", "<tireUniqueId2>"]
}
```

**متوقّع** `200`**:** نتائج `MATCH` لكل إطار في الـ manifest.

### 5.3 إغلاق الجلسة

`POST /api/v1/dealer/handover/{sessionId}/close`

```json
{ "version": 0 }
```

**متوقّع** `200`**:** shipment → `RECEIVED` (من منظور الوكيل)، tires → `SHIPPED`.

> **لا يغيّر** `inbound_request.status` بعد `RECEIVING_APPROVED` — استلام المستودع الفعلي يبدأ في §4.8 (Phase 3).

---

## 10) Outbound Scheduling — OS-2

> **المتطلبات:** V30 مطبّق، إطارات `STORED` في المستودع، طلب DELIVERY مُرسَل (`SUBMITTED`) مع `preferredDeliveryDay` وعنوان وكيل (province).

### 10.1 إنشاء طلب تسليم (Dealer)

> **المتطلبات السابقة:** إطارات في المستودع بحالة `STORED` (أكمل مسار inbound §4 أو استخدم مجموعة إطارات مخزّنة).  
> `customerId` / `vehicleId` / `setIds` من §4.1 (نفس خطوات pickup).

`POST /api/v1/dealer/shipment-requests/delivery` — `DEALER_TOKEN`

```json
{
  "dealerCustomerId": 1,
  "vehicleId": 1,
  "swapAppointment": "2026-07-21T10:00:00",
  "preferredDeliveryDay": "WEDNESDAY",
  "setIds": [1],
  "notes": "Smoke test outbound"
}
```


| الحقل                  | مطلوب    | ملاحظة                                                                 |
| ---------------------- | -------- | ---------------------------------------------------------------------- |
| `dealerCustomerId`     | نعم      | من `GET .../dealerCustomers`                                           |
| `vehicleId`            | نعم      | من `GET .../vehicles`                                                  |
| `swapAppointment`      | نعم      | تاريخ مستقبلي؛ SLA ≥ 48 ساعة عند submit                                |
| `preferredDeliveryDay` | اختياري* | `MONDAY`…`SUNDAY` — مطلوب للجدولة التلقائية                            |
| `setIds`               | اختياري  | مجموعات إطارات؛ يجب أن تكون إطاراتها `STORED` لإنشاء `OutboundRequest` |
| `notes`                | اختياري  |                                                                        |


**متوقّع** `201`**:**

```json
{
  "id": 55,
  "direction": "DELIVERY",
  "status": "IN_CART",
  "warehouseId": 1,
  "preferredDeliveryDay": "WEDNESDAY",
  "version": 0
}
```

احفظ `id` → `deliveryOrderId`، `version`.

`POST /api/v1/dealer/shipment-requests/{deliveryOrderId}/submit` — `DEALER_TOKEN`

```json
{ "version": 0 }
```

**متوقّع** `200`**:** `status=SUBMITTED`

> إن لم تُنشأ `outbound_request`: تحقق أن كل إطار في الـ manifest `STORED` وأن `swapAppointment` يحقق SLA 48 ساعة.

**تحقق SQL (اختياري):**

```sql
SELECT orq.id, orq.status, orq.schedule_status, orq.delivery_day
FROM wms.outbound_request orq
JOIN dealer.shipment_request sr ON sr.id = orq.shipment_request_id
WHERE sr.id = <deliveryOrderId>;
-- status=SCHEDULED, schedule_status=SCHEDULED
```

### 10.2 لوحة جدولة الصادر

`GET /api/v1/wms/my-warehouse/outbound-scheduling/board` — `MANAGER_TOKEN`

**متوقّع** `200`**:**

```json
{
  "warehouseId": 1,
  "cells": [
    {
      "cellId": 5,
      "deliveryDay": "WEDNESDAY",
      "regionProvinceId": 10,
      "regionProvinceName": "Damascus",
      "totalVolume": 2,
      "estimatedTrucks": 1,
      "status": "PLANNED",
      "requestCount": 1
    }
  ]
}
```

احفظ `cellId` → `outboundSchedulingCellId`.

### 10.3 تفاصيل الخلية

`GET /api/v1/wms/my-warehouse/outbound-scheduling/cells/{outboundSchedulingCellId}`

**متوقّع** `200`**:** قائمة `requests` مع `outboundRequestId`, `dealerName`, `totalVolume`, `status=SCHEDULED`.

### 10.4 اعتماد الخلية

`POST /api/v1/wms/my-warehouse/outbound-scheduling/cells/{outboundSchedulingCellId}/approve`

**متوقّع** `200`**:**

- `status=APPROVED` على الخلية
- كل طلب: `status=SCHEDULE_APPROVED`, `scheduleStatus=APPROVED`

**تحقق SQL:**

```sql
SELECT status, schedule_status FROM wms.outbound_request WHERE id = <outboundRequestId>;
-- SCHEDULE_APPROVED / APPROVED
```

> **الخطوة التالية (OS-3):** `POST .../outbound-scheduling/generate-picking-sessions`

### 10.5 إنشاء جلسات Picking مقترحة (تجميع per-dealer)

`POST /api/v1/wms/my-warehouse/outbound-scheduling/generate-picking-sessions` — `MANAGER_TOKEN`

Body اختياري:

```json
{ "deliveryDay": "WEDNESDAY" }
```

> **Phase A:** كل وكيل يحصل على جلسة picking مستقلة لنفس `deliveryDay` (لا تُخلط طلبات وكلاء متعددين في جلسة واحدة).

**متوقّع** `201`**:**

```json
{
  "sessions": [
    {
      "pickingSessionId": 8,
      "dealerId": 52,
      "dealerName": "ABC",
      "deliveryDay": "WEDNESDAY",
      "outboundRequestCount": 1,
      "expectedTires": 2,
      "status": "PENDING_APPROVAL"
    }
  ]
}
```

احفظ `pickingSessionId`.

**تحقق SQL:**

```sql
SELECT ps.id, ps.dealer_id, ps.delivery_day, ps.status
FROM wms.picking_session ps WHERE ps.id = <pickingSessionId>;
-- dealer_id NOT NULL
```



SELECT status FROM wms.outbound_request WHERE id = ;
-- PICKING_SESSION_PENDING

```



### 10.6 قائمة جلسات Picking

`GET /api/v1/wms/my-warehouse/picking-sessions` — `MANAGER_TOKEN`

**متوقّع** `200`**:** جلسة `PENDING_APPROVAL` مع `dealerId`, `dealerName`, `expectedTires`, `pickedTires`, `missingTires`, `progressPercent`, `outboundRequests`.

### 10.7 اعتماد جلسة Picking

`POST /api/v1/wms/my-warehouse/picking-sessions/{pickingSessionId}/approve`

**متوقّع** `200`**:**

- `status=APPROVED` على الجلسة
- كل طلب مرتبط: `status=PICKING_APPROVED`



### 10.8 (اختياري) إلغاء جلسة مقترحة

`POST /api/v1/wms/my-warehouse/picking-sessions/{pickingSessionId}/cancel`

**متوقّع** `200`**:** الجلسة `CANCELLED` والطلبات تعود إلى `SCHEDULE_APPROVED`.

### 10.9 إسناد موظفين وبدء الالتقاط (OS-4)

`POST /api/v1/wms/my-warehouse/picking-sessions/{pickingSessionId}/assign` — `MANAGER_TOKEN`

```json
{ "staffUserIds": [42] }
```

`POST /api/v1/wms/my-warehouse/picking-sessions/{pickingSessionId}/start`

**متوقّع** `200`**:** `status=IN_PROGRESS`

### 10.10 مسح الالتقاط — مسح مزدوج (Phase A — OS-4)

> **Phase A:** المسح يتطلب **باركود الموقع + معرّف الإطار** معاً.

#### Inbox موحّد (اختياري)

`GET /api/v1/wms/my-warehouse/tasks` — `STAFF_TOKEN`

**متوقّع** `200`**:** مصفوفة مهام `RECEIVING` / `PUTAWAY` / `PICKING` / `SHIPPING` مع `detailPath` و `actionPath`.

#### قائمة مهام Picking

`GET /api/v1/wms/my-warehouse/tasks/picking` — `STAFF_TOKEN`

**متوقّع** `200`**:** `dealerId`, `dealerName`, `expectedTires`, `pickedTires`, `missingTires`, `progressPercent`.

#### تفاصيل المهمة + manifest

`GET /api/v1/wms/my-warehouse/tasks/picking/{pickingSessionId}` — `STAFF_TOKEN`

**متوقّع** `200`**:** `manifestLines[]` فيها `storageLocationBarcode` و `status=PENDING_PICK`.

احفظ من الـ manifest: `tireUniqueId` + `storageLocationBarcode`.

#### مسح إطار (موقع + إطار)

`POST /api/v1/wms/my-warehouse/tasks/picking/{pickingSessionId}/scan` — `STAFF_TOKEN`

```json
{
  "tireRawCode": "<tireUniqueId>",
  "locationBarcode": "<storageLocationBarcode>"
}
```

**متوقّع** `200` **(نجاح):**

```json
{
  "result": "MATCH",
  "lineStatus": "PICKED",
  "expectedLocationBarcode": "WH-ZN01-...",
  "pickedTires": 1,
  "missingTires": 0,
  "expectedTires": 2,
  "progressPercent": 50
}
```

**نتائج scan أخرى:**


| `result`          | المعنى                                                              |
| ----------------- | ------------------------------------------------------------------- |
| `MATCH`           | إطار + موقع صحيحان → `PICKED`، إطار `OUTBOUND_PICKED`، موقع يُحرَّر |
| `WRONG_LOCATION`  | الإطار في الـ manifest لكن الباركود ≠ الموقع المتوقع                |
| `NOT_IN_MANIFEST` | الإطار غير مدرج في جلسة هذا الوكيل                                  |
| `DUPLICATE`       | الإطار ممسوح مسبقاً                                                 |
| `MISMATCH`        | حالة غير صالحة (مثلاً ليس `STORED`)                                 |


#### وسم إطار missing (Phase A)

`POST /api/v1/wms/my-warehouse/tasks/picking/{pickingSessionId}/mark-missing` — `STAFF_TOKEN`

```json
{
  "outboundRequestLineId": 301,
  "reason": "Not on shelf"
}
```

**متوقّع** `200`**:** `lineStatus=MISSING`، `missingTires` يزيد، إشعار لمدير المستودع.

**تحقق SQL بعد MATCH:**

```sql
SELECT status FROM dealer.tire WHERE tire_unique_id = '<tireUniqueId>';
-- OUTBOUND_PICKED

SELECT status FROM wms.outbound_request_line WHERE id = <lineId>;
-- PICKED أو MISSING
```

### 10.11 إكمال الالتقاط (OS-5)

`POST /api/v1/wms/my-warehouse/picking-sessions/{pickingSessionId}/complete` — `MANAGER_TOKEN`

**متوقّع** `200`**:** جلسة `COMPLETED`، طلب `PICKING_COMPLETED` (أو `PARTIALLY_PICKED` إن وُجد missing).

---

## 11) Shipping Session — Phase B

> **المسار الجديد الموصى به** بعد اكتمال picking. يستبدل `dispatch` على picking session للتدفق الكامل.

### المخطط

```
Picking COMPLETED → generate shipping → approve → assign → start
  → staff scan tires (tire only) → (optional mark-missing) → complete
  → outbound COMPLETED, tires SHIPPED
```

### 11.1 إنشاء جلسات Shipping

`POST /api/v1/wms/my-warehouse/shipping-sessions/generate` — `MANAGER_TOKEN`

Body اختياري:

```json
{ "deliveryDay": "WEDNESDAY" }
```

> **توضيح مهم:** `deliveryDay` هنا **ليس** لإعادة تحديد يوم جديد، لأن الطلبات الجاهزة للشحن لديها يوم تسليم محدد مسبقاً من مراحل scheduling/picking.  
> هذا الحقل يعمل فقط كـ **فلتر اختياري** وقت التوليد:
>
> - بدون Body: النظام يولّد جلسات لكل الأيام الجاهزة.
> - مع `deliveryDay`: النظام يولّد جلسات لهذا اليوم فقط.

> التجميع حسب **warehouse + deliveryDay** (قد تشمل عدة وكلاء في جلسة واحدة).

**متوقّع** `201`**:**

```json
{
  "sessions": [
    {
      "shippingSessionId": 60,
      "deliveryDay": "WEDNESDAY",
      "outboundRequestCount": 2,
      "expectedTires": 3,
      "status": "PENDING_APPROVAL"
    }
  ]
}
```

احفظ `shippingSessionId`.

**تحقق SQL:**

```sql
SELECT status FROM wms.outbound_request WHERE id = <outboundRequestId>;
-- SHIPPING_SESSION_PENDING
```

### 11.2 قائمة وتفاصيل جلسة Shipping (Manager)

`GET /api/v1/wms/my-warehouse/shipping-sessions` — `MANAGER_TOKEN`

`GET /api/v1/wms/my-warehouse/shipping-sessions/{shippingSessionId}`

**متوقّع** `200`**:** `expectedTires`, `shippedTires`, `missingTires`, `progressPercent`, `outboundRequests[]`.

### 11.3 اعتماد + إسناد + بدء

`POST /api/v1/wms/my-warehouse/shipping-sessions/{shippingSessionId}/approve`

**متوقّع** `200`**:** جلسة `APPROVED`، outbound → `SHIPPING_APPROVED`.

`POST /api/v1/wms/my-warehouse/shipping-sessions/{shippingSessionId}/assign`

```json
{ "staffUserIds": [42] }
```

`POST /api/v1/wms/my-warehouse/shipping-sessions/{shippingSessionId}/start`

**متوقّع** `200`**:** `status=IN_PROGRESS`، outbound → `SHIPPING_IN_PROGRESS`.

### 11.4 (اختياري) إلغاء جلسة مقترحة

`POST /api/v1/wms/my-warehouse/shipping-sessions/{shippingSessionId}/cancel`

**متوقّع** `200`**:** جلسة `CANCELLED`، outbound يعود `PICKING_COMPLETED` / `PARTIALLY_PICKED`.

### 11.5 مسح الشحن (Staff — إطار فقط)

`GET /api/v1/wms/my-warehouse/tasks/shipping` — `STAFF_TOKEN`

`GET /api/v1/wms/my-warehouse/tasks/shipping/{shippingSessionId}`

**متوقّع** `200`**:** manifest يعرض إطارات `PICKED` فقط (جاهزة للشحن).

`POST /api/v1/wms/my-warehouse/tasks/shipping/{shippingSessionId}/scan` — `STAFF_TOKEN`

```json
{
  "tireRawCode": "<tireUniqueId>"
}
```

**متوقّع** `200` **(نجاح):**

```json
{
  "result": "MATCH",
  "lineStatus": "SHIPPED",
  "shippedTires": 1,
  "missingTires": 0,
  "expectedTires": 3,
  "progressPercent": 33
}
```

**نتائج scan أخرى:** `DUPLICATE` | `NOT_IN_MANIFEST` | `MISSING` | `MISMATCH`

#### وسم missing أثناء الشحن

`POST /api/v1/wms/my-warehouse/tasks/shipping/{shippingSessionId}/mark-missing` — `STAFF_TOKEN`

```json
{
  "outboundRequestLineId": 301,
  "reason": "Not loaded on truck"
}
```

**متوقّع** `200`**:** `lineStatus=MISSING`، إشعار لمدير المستودع.

**تحقق SQL بعد MATCH:**

```sql
SELECT status FROM dealer.tire WHERE tire_unique_id = '<tireUniqueId>';
-- SHIPPED

SELECT status FROM wms.outbound_request_line WHERE id = <lineId>;
-- SHIPPED
```

### 11.6 إكمال الشحن

`POST /api/v1/wms/my-warehouse/shipping-sessions/{shippingSessionId}/complete` — `MANAGER_TOKEN`

**متوقّع** `200`**:**

- جلسة `COMPLETED`
- outbound → `COMPLETED` (إن شُحن/وُسم missing كل الخطوط) أو `PARTIALLY_SHIPPED`

---

### 10.12 (Legacy) Dispatch من Picking — بديل قديم

> **Legacy:** ما زال موجوداً لكن **Phase B** يفضّل shipping session بدلاً منه.

`POST /api/v1/wms/my-warehouse/picking-sessions/{pickingSessionId}/dispatch` — `MANAGER_TOKEN`

**متوقّع** `200`**:** خطوط `SHIPPED`، إطارات `SHIPPED`، طلب `COMPLETED` — **بدون** جلسة shipping.

---

## 6) جدول النتائج المتوقعة (ملخّص)


| الخطوة                | API                                                      | HTTP | حالة الكيان الرئيسية                   |
| --------------------- | -------------------------------------------------------- | ---- | -------------------------------------- |
| Login                 | `POST /auth/login`                                       | 200  | token                                  |
| Create pickup         | `POST .../pickup`                                        | 201  | `IN_CART`                              |
| Submit                | `POST .../submit`                                        | 200  | `SUBMITTED` + inbound `SCHEDULED`      |
| Scheduling board      | `GET .../scheduling/board`                               | 200  | cells `PLANNED`                        |
| Approve cell          | `POST .../cells/{id}/approve`                            | 200  | inbound `PENDING_ACCEPTANCE`           |
| Accept                | `POST .../inbound-requests/{id}/accept`                  | 200  | `RESERVATIONS_COMPLETE`                |
| Create session        | `POST .../receiving-sessions`                            | 201  | session `PENDING_APPROVAL`             |
| Approve session       | `POST .../receiving-sessions/{id}/approve`               | 200  | `RECEIVING_APPROVED`                   |
| Assign receiving      | `POST .../receiving-sessions/{id}/assign`                | 200  | `assignedStaffUserIds`                 |
| Start receiving       | `POST .../receiving-sessions/{id}/start`                 | 200  | session `IN_PROGRESS`                  |
| Scan tire             | `POST .../tasks/receiving/{id}/scan`                     | 200  | `MATCH` → tire `RECEIVED`              |
| Complete receiving    | `POST .../receiving-sessions/{id}/complete`              | 200  | `RECEIVING_COMPLETED` + putaway auto   |
| List putaway          | `GET .../putaway-sessions`                               | 200  | `PENDING_APPROVAL`                     |
| Approve putaway       | `POST .../putaway-sessions/{id}/approve`                 | 200  | `APPROVED`                             |
| Assign putaway        | `POST .../putaway-sessions/{id}/assign`                  | 200  | lines مسندة                            |
| Confirm putaway       | `POST .../tasks/putaway/{id}/confirm`                    | 200  | `MATCH` → tire `STORED`                |
| Operations dashboard  | `GET .../operations/dashboard`                           | 200  | counters + sessions + alerts           |
| Outbound board        | `GET .../outbound-scheduling/board`                      | 200  | cells `PLANNED`                        |
| Approve outbound cell | `POST .../outbound-scheduling/cells/{id}/approve`        | 200  | outbound `SCHEDULE_APPROVED`           |
| Generate picking      | `POST .../outbound-scheduling/generate-picking-sessions` | 201  | session per-dealer `PENDING_APPROVAL`  |
| Approve picking       | `POST .../picking-sessions/{id}/approve`                 | 200  | outbound `PICKING_APPROVED`            |
| Pick scan (double)    | `POST .../tasks/picking/{id}/scan`                       | 200  | `MATCH` → `PICKED` / `OUTBOUND_PICKED` |
| Pick mark-missing     | `POST .../tasks/picking/{id}/mark-missing`               | 200  | line `MISSING` + manager notify        |
| Complete picking      | `POST .../picking-sessions/{id}/complete`                | 200  | `PICKING_COMPLETED`                    |
| Generate shipping     | `POST .../shipping-sessions/generate`                    | 201  | session `PENDING_APPROVAL`             |
| Approve shipping      | `POST .../shipping-sessions/{id}/approve`                | 200  | outbound `SHIPPING_APPROVED`           |
| Ship scan             | `POST .../tasks/shipping/{id}/scan`                      | 200  | `MATCH` → `SHIPPED`                    |
| Complete shipping     | `POST .../shipping-sessions/{id}/complete`               | 200  | outbound `COMPLETED`                   |
| Dispatch (legacy)     | `POST .../picking-sessions/{id}/dispatch`                | 200  | outbound `COMPLETED` *(بدون shipping)* |
| End state             | SQL outbound_request                                     | —    | `COMPLETED`, tire `SHIPPED`            |


---

## 7) أخطاء شائعة


| الخطأ                                         | السبب                                      | الحل                                        |
| --------------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| `missing column receiving_day`                | V29 غير مطبّق                              | طبّق migration §0.1                         |
| `No warehouse assigned to this dealer`        | لا مستودع / لا سعة / لا عنوان              | قسم 2 + routing                             |
| `Insufficient warehouse capacity`             | لا مواقع AVAILABLE                         | `POST .../my-warehouse/initiate`            |
| inbound `PENDING_SCHEDULING` بلا جدولة        | لا `preferredDispatchDay` أو لا عنوان وكيل | أرسل `MONDAY` + تأكد `dealer.address_id`    |
| `Only PENDING_ACCEPTANCE` on accept           | لم تُعتمد الخلية                           | §4.5 approve                                |
| `must be RESERVATIONS_COMPLETE` on session    | لم يُقبل الطلب بعد                         | §4.6 accept                                 |
| `Transaction silently rolled back` على submit | وكيل بدون `address_id` (province)          | §2.6                                        |
| `Putaway session is not assigned to you`      | staff غير مسند                             | §4.9 assign                                 |
| `WRONG_POSITION` على confirm                  | باركود ≠ المحجوز                           | استخدم `reservedLocationBarcode` من accept  |
| `Receiving session is not in progress`        | لم يُستدعَ start                           | §4.8 start                                  |
| `WRONG_LOCATION` على pick scan                | `locationBarcode` ≠ الموقع المتوقع         | استخدم `storageLocationBarcode` من manifest |
| `tireRawCode is empty` / `locationBarcode`    | body scan قديم `{ rawCode }`               | استخدم Phase A body §10.10                  |
| `storage_position_history` CHECK على accept   | V36 غير مطبّق على السيرفر                  | طبّق V36                                    |
| `dealer_id` NULL على picking_session          | V37 غير مطبّق                              | طبّق V37                                    |
| `SHIPPING_SESSION_PENDING` constraint fail    | V38 غير مطبّق                              | طبّق V38                                    |
| 403 على WMS APIs                              | token دور خاطئ                             | Manager/Staff token لـ `my-warehouse/*`     |


---

## 8) ما لم يُختبر هنا (قادم)

- `@Scheduled` لتحرير الحجوزات المنتهية (موجود — release-expired-reservations يدوياً)
- integration test كامل: picking → shipping في CI

---

## 9) Checklist سريع

- [x] V27–V32 + V36 + V37 + V38 مطبّقة
- [x] التطبيق يعمل على `:9003`
- [x] مستودع + مواقع متاحة
- [x] وكيل لديه `address_id` (§2.6)
- [x] pickup submitted → inbound_request موجود
- [x] scheduling cell معتمدة
- [x] accept → حجز في zone واحدة
- [x] receiving session معتمدة → assign → start
- [ ] scan كل الإطارات → `RECEIVED` / `AT_STAGING`
- [ ] complete receiving → putaway sessions أُنشئت
- [ ] putaway approve + assign
- [ ] confirm كل إطار → `STORED` + inbound `COMPLETED`
- [ ] dashboard يعرض counters + picking/shipping sessions
- [ ] delivery submitted → outbound_request `SCHEDULE_APPROVED`
- [ ] generate picking (per-dealer) → approve → assign → start
- [ ] pick scan (tire + location) → `PICKED`
- [ ] (optional) mark-missing على pick → `MISSING`
- [ ] complete picking → `PICKING_COMPLETED`
- [ ] generate shipping → approve → assign → start
- [ ] ship scan → `SHIPPED`
- [ ] complete shipping → outbound `COMPLETED`