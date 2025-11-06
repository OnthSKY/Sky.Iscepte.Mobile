# API Documentation - Sky.Template.Mobile

Bu dokümantasyon, Sky.Template.Mobile projesindeki tüm API endpoint'lerinin request/response yapılarını içerir. Backend ve DB'ye geçiş için hazırlanmıştır.

**Son Güncelleme:** 2025-02-18

**Not:** Tüm API response'ları `BaseControllerResponse<T>` formatında döner. HTTP status code başarı kontrolü için kullanılır (200-299 başarılı, 400-499 client errors, 500+ server errors).

**Database Field Mapping:**
- API'de `camelCase` kullanılır (örn: `trackStock`, `productId`, `ownerId`)
- Database'de `snake_case` kullanılır (örn: `track_stock`, `product_id`, `owner_id`)
- Backend implementasyonunda bu mapping yapılmalıdır

---

## İçindekiler

1. [Authentication APIs](#authentication-apis)
2. [User APIs](#user-apis)
3. [Customers APIs](#customers-apis)
4. [Sales APIs](#sales-apis)
5. [Products/Stock APIs](#productsstock-apis)
6. [Employees APIs](#employees-apis)
7. [Suppliers APIs](#suppliers-apis)
8. [Purchases APIs](#purchases-apis)
9. [Expenses APIs](#expenses-apis)
10. [Revenue APIs](#revenue-apis)
11. [Income APIs](#income-apis)
12. [Reports APIs](#reports-apis)
13. [Modules APIs](#modules-apis)
14. [Form Templates APIs](#form-templates-apis)
15. [Dashboard APIs](#dashboard-apis)
16. [Permissions System](#permissions-system)
17. [Roles & Packages APIs](#roles--packages-apis)
18. [Common Types](#common-types)

---

## Authentication APIs

### POST /auth/login

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": "number",
      "username": "string",
      "role": "admin" | "owner" | "staff"
    }
  }
}
```

**Mock Token Format:** `mock-access-token-{userId}` and `mock-refresh-token-{userId}`

---

### POST /auth/refresh

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

---

### POST /auth/logout

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## User APIs

### GET /users/me

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "name": "string",
    "username": "string",
    "email": "string",
    "phone": "string",
    "role": "string",
    "package": "string",
    "ownerId": "number | null",
    "company": "string | null",
    "ownerCompanyName": "string | null",
    "customPermissions": {
      "moduleName": {
        "actions": ["string"],
        "notifications": ["string"]
      }
    }
  }
}
```

---

### PUT /users/me

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string"
}
```

**Response:** `200 OK` (UserProfile object)

---

## Customers APIs

### GET /customers

**Query Parameters:**
- `page`: number (1-based, default: 1)
- `pageSize`: number (default: 20)
- `search` or `q`: string (search query)
- `orderColumn`: string (column name for sorting)
- `orderDirection`: "asc" | "desc" (default: "desc")
- `filters[key]`: string (filter by field, e.g., `filters[status]=active`)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "address": "string",
      "isActive": "boolean",
      "totalOrders": "number",
      "ownerId": "number",
      "balance": "number",
      "currency": "TRY | USD | EUR",
      "group": "string",
      "debtLimit": "number",
      "customFields": [
        {
          "key": "string",
          "label": "string",
          "type": "text | number | date | select | boolean",
          "value": "any",
          "options": [{"label": "string", "value": "any"}],
          "isGlobal": "boolean"
        }
      ]
    }
  ],
  "total": "number"
}
```

**Mock Data Example:**
```json
{
  "id": "1",
  "name": "Ahmet Usta",
  "email": "ahmet@example.com",
  "phone": "0532 111 2233",
  "address": "İstanbul, Kadıköy",
  "isActive": true,
  "totalOrders": 5,
  "ownerId": 2,
  "balance": 1500,
  "currency": "TRY",
  "group": "Premium",
  "debtLimit": 5000,
  "customFields": []
}
```

---

### GET /customers/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "isActive": "boolean",
    "totalOrders": "number",
    "ownerId": "number",
    "balance": "number",
    "currency": "TRY | USD | EUR",
    "group": "string",
    "debtLimit": "number",
    "customFields": [
      {
        "key": "string",
        "label": "string",
        "type": "text | number | date | select | boolean",
        "value": "any",
        "options": [{"label": "string", "value": "any"}],
        "isGlobal": "boolean"
      }
    ]
  }
}
```

---

### GET /customers/stats

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "totalCustomers": "number",
    "activeCustomers": "number",
    "totalOrders": "number"
  }
}
```

---

### POST /customers

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "isActive": "boolean",
  "balance": "number",
  "currency": "TRY | USD | EUR",
  "group": "string",
  "debtLimit": "number",
  "customFields": [
    {
      "key": "string",
      "label": "string",
      "type": "text | number | date | select | boolean",
      "value": "any",
      "options": [{"label": "string", "value": "any"}],
      "isGlobal": "boolean"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "isActive": "boolean",
    "totalOrders": "number",
    "ownerId": "number",
    "balance": "number",
    "currency": "TRY | USD | EUR",
    "group": "string",
    "debtLimit": "number",
    "customFields": [
      {
        "key": "string",
        "label": "string",
        "type": "text | number | date | select | boolean",
        "value": "any",
        "options": [{"label": "string", "value": "any"}],
        "isGlobal": "boolean"
      }
    ]
  }
}
```

---

### PUT /customers/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:** (Partial Customer object)
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "isActive": "boolean",
  "balance": "number",
  "currency": "TRY | USD | EUR",
  "group": "string",
  "debtLimit": "number",
  "customFields": [
    {
      "key": "string",
      "label": "string",
      "type": "text | number | date | select | boolean",
      "value": "any",
      "options": [{"label": "string", "value": "any"}],
      "isGlobal": "boolean"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "isActive": "boolean",
    "totalOrders": "number",
    "ownerId": "number",
    "balance": "number",
    "currency": "TRY | USD | EUR",
    "group": "string",
    "debtLimit": "number",
    "customFields": [
      {
        "key": "string",
        "label": "string",
        "type": "text | number | date | select | boolean",
        "value": "any",
        "options": [{"label": "string", "value": "any"}],
        "isGlobal": "boolean"
      }
    ]
  }
}
```

---

### DELETE /customers/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

---

### GET /customers/report

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [],
    "total": 0
  }
}
```

**Not:** Customers report endpoint'i henüz tam implement edilmemiş.

---

## Sales APIs

**Important Notes:**
- **Stock Control**: Satış işlemlerinde stok kontrolü, ürünün `trackStock` alanına göre yapılır:
  - `trackStock: false` olan ürünler için stok kontrolü yapılmaz ve herhangi bir miktarda satış yapılabilir
  - `trackStock: true` (veya belirtilmemiş) olan ürünler için normal stok kontrolü yapılır
  - Yetersiz stok durumunda `400 Bad Request` hatası döner
- **Stockless Sales**: Stok takibi yapılmayan ürünler (hizmetler, dijital ürünler vb.) için `trackStock: false` ayarlanabilir

### GET /sales

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [
      {
        "id": "string",
        "customerId": "string",
        "customerName": "string",
        "productId": "string (optional - single product sale)",
        "productName": "string (optional - single product sale)",
        "quantity": "number (optional - single product sale)",
        "price": "number (optional - single product sale)",
        "currency": "TRY" | "USD" | "EUR",
        "total": "number",
        "date": "string (YYYY-MM-DD)",
        "status": "string (completed | pending)",
        "debtCollectionDate": "string (YYYY-MM-DD, optional)",
        "isPaid": "boolean (optional)",
        "items": [
          {
            "productId": "string",
            "productName": "string",
            "quantity": "number",
            "price": "number",
            "subtotal": "number",
            "currency": "TRY" | "USD" | "EUR"
          }
        ],
        "customFields": [
          {
            "key": "string",
            "label": "string",
            "type": "text" | "number" | "date" | "select" | "boolean",
            "value": "any",
            "options": [{"label": "string", "value": "any"}],
            "isGlobal": "boolean"
          }
        ],
        "ownerId": "number"
      }
    ],
    "totalCount": "number",
    "page": "number",
    "pageSize": "number",
    "totalPage": "number",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean"
  }
}
```

**Mock Data Example (Single Product Sale):**
```json
{
  "id": "1",
  "customerId": "1",
  "customerName": "Ahmet Usta",
  "productId": "1",
  "productName": "iPhone 14 Pro",
  "quantity": 1,
  "price": 35000,
  "currency": "TRY",
  "total": 35000,
  "date": "2025-01-15",
  "status": "completed",
  "ownerId": 2
}
```

**Mock Data Example (Bulk Sale with Items Array):**
```json
{
  "id": "2",
  "customerId": "1",
  "customerName": "Ahmet Usta",
  "currency": "TRY",
  "total": 85000,
  "date": "2025-01-15",
  "status": "completed",
  "debtCollectionDate": null,
  "isPaid": true,
  "items": [
    {
      "productId": "1",
      "productName": "iPhone 14 Pro",
      "quantity": 1,
      "price": 35000,
      "subtotal": 35000,
      "currency": "TRY"
    },
    {
      "productId": "2",
      "productName": "AirPods Pro",
      "quantity": 2,
      "price": 25000,
      "subtotal": 50000,
      "currency": "TRY"
    }
  ],
  "ownerId": 2
}
```

---

### GET /sales/:id

**Response:** `200 OK` (Single Sale object)

---

### GET /sales/stats

**Response:** `200 OK`
```json
{
  "totalSales": "number",
  "totalRevenue": "number",
  "monthlySales": "number",
  "averageOrderValue": "number"
}
```

---

### POST /sales

**Request:**
```json
{
  "customerId": "string (optional)",
  "productId": "string (optional - for single product sale, ignored when items array is provided)",
  "quantity": "number (optional - for single product sale, ignored when items array is provided)",
  "price": "number (optional - for single product sale, ignored when items array is provided)",
  "currency": "TRY" | "USD" | "EUR",
  "date": "string (YYYY-MM-DD)",
  "status": "string (completed | pending)",
  "debtCollectionDate": "string (YYYY-MM-DD, optional)",
  "isPaid": "boolean (optional, default: false)",
  "items": [
    {
      "productId": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "customFields": [
    {
      "key": "string",
      "label": "string",
      "type": "text" | "number" | "date" | "select" | "boolean",
      "value": "any",
      "options": [{"label": "string", "value": "any"}],
      "isGlobal": "boolean"
    }
  ]
}
```

**Not:** 
- When `items` array is provided, multiple products can be sold in a single sale
- When `items` is provided, `productId`, `quantity`, and `price` fields are ignored
- `total` is automatically calculated: `sum(items[i].quantity * items[i].price)`

**Response:** `201 Created`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "customerId": "string",
    "customerName": "string",
    "productId": "string",
    "productName": "string",
    "quantity": "number",
    "price": "number",
    "currency": "TRY" | "USD" | "EUR",
    "total": "number",
    "date": "string (YYYY-MM-DD)",
    "status": "string (completed | pending)",
    "ownerId": "number"
  }
}
```

---

### PUT /sales/:id

**Request:** (Partial Sale object)

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "customerId": "string",
    "customerName": "string",
    "productId": "string",
    "productName": "string",
    "quantity": "number",
    "price": "number",
    "currency": "TRY" | "USD" | "EUR",
    "total": "number",
    "date": "string (YYYY-MM-DD)",
    "status": "string (completed | pending)",
    "ownerId": "number"
  }
}
```

---

### DELETE /sales/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

---

### GET /sales/report

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [],
    "total": 0
  }
}
```

**Not:** Sales report endpoint'i henüz tam implement edilmemiş.

---

### GET /sales/debt

Borçlu satışlar listesi. Sadece `debtCollectionDate` olan ve `isPaid !== true` olan satışları döner.

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [
      {
        "id": "string",
        "customerId": "string",
        "customerName": "string",
        "currency": "TRY" | "USD" | "EUR",
        "total": "number",
        "date": "string (YYYY-MM-DD)",
        "debtCollectionDate": "string (YYYY-MM-DD)",
        "isPaid": false,
        "items": [
          {
            "productId": "string",
            "productName": "string",
            "quantity": "number",
            "price": "number",
            "subtotal": "number",
            "currency": "TRY" | "USD" | "EUR"
          }
        ],
        "ownerId": "number"
      }
    ],
    "totalCount": "number",
    "page": "number",
    "pageSize": "number",
    "totalPage": "number",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean"
  }
}
```

**Not:** Bu endpoint sadece borçlu satışları döner (`debtCollectionDate` var ve `isPaid !== true`).

---

### PUT /sales/:id/mark-paid

Borçlu satışın ödemesini alındı olarak işaretler.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "isPaid": true
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "customerId": "string",
    "customerName": "string",
    "currency": "TRY" | "USD" | "EUR",
    "total": "number",
    "date": "string (YYYY-MM-DD)",
    "debtCollectionDate": "string (YYYY-MM-DD)",
    "isPaid": true,
    "items": [],
    "ownerId": "number"
  }
}
```

**Not:** Bu endpoint, satışın `isPaid` field'ını `true` yapar ve satış artık borçlu satışlar listesinde görünmez.

---

## Products/Stock APIs

### GET /stock

**Query Parameters:** (Same as Customers)

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [
      {
        "id": "string",
        "name": "string",
        "sku": "string",
        "category": "string",
        "price": "number",
        "currency": "TRY" | "USD" | "EUR",
        "stock": "number",
        "trackStock": "boolean (optional, default: true) - Stok takibi yapılsın mı? false ise stoksuz satış yapılabilir",
        "moq": "number (Minimum Order Quantity)",
        "isActive": "boolean",
        "hasSales": "boolean",
        "customFields": [
          {
            "key": "string",
            "label": "string",
            "type": "text" | "number" | "date" | "select" | "boolean",
            "value": "any",
            "options": [
              {
                "label": "string",
                "value": "any"
              }
            ],
            "isGlobal": "boolean"
          }
        ],
        "ownerId": "number"
      }
    ],
    "totalCount": "number",
    "page": "number",
    "pageSize": "number",
    "totalPage": "number",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean"
  }
}
```

**Mock Data Example:**
```json
{
  "id": "1",
  "name": "iPhone 14 Pro",
  "sku": "IPH14P",
  "category": "Telefon",
  "price": 35000,
  "currency": "TRY",
  "stock": 15,
  "trackStock": true,
  "moq": 1,
  "isActive": true,
  "hasSales": true,
  "ownerId": 2
}
```

**Not:** `/products` endpoint'i `/stock` ile aynı (backward compatibility için)

---

### GET /stock/:id

**Response:** `200 OK` (Single Product object)

---

### GET /stock/stats

**Response:** `200 OK`
```json
{
  "totalStockItems": "number",
  "totalCategories": "number",
  "lowStock": "number",
  "totalStockValue": "number (optional)"
}
```

---

### POST /stock

**Request:**
```json
{
  "name": "string",
  "sku": "string",
  "category": "string",
  "price": "number",
  "currency": "TRY" | "USD" | "EUR",
  "stock": "number",
  "trackStock": "boolean (optional, default: true) - Stok takibi yapılsın mı? false ise stoksuz satış yapılabilir",
  "moq": "number",
  "isActive": "boolean",
  "customFields": []
}
```

**Response:** `201 Created`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "name": "string",
    "sku": "string",
    "category": "string",
    "price": "number",
    "currency": "TRY" | "USD" | "EUR",
    "stock": "number",
    "trackStock": "boolean (optional, default: true) - Stok takibi yapılsın mı? false ise stoksuz satış yapılabilir",
    "moq": "number",
    "isActive": "boolean",
    "hasSales": "boolean",
    "customFields": [],
    "ownerId": "number"
  }
}
```

**Not:** 
- `trackStock: false` olan ürünler için stok kontrolü yapılmaz ve herhangi bir miktarda satış yapılabilir
- `trackStock: true` (veya belirtilmemiş) olan ürünler için normal stok kontrolü yapılır
- `stock: null` veya `stock: undefined` olan ürünler için de stok kontrolü yapılmaz (backward compatibility)

---

### PUT /stock/:id

**Request:** (Partial Product object)
```json
{
  "name": "string",
  "sku": "string",
  "category": "string",
  "price": "number",
  "currency": "TRY" | "USD" | "EUR",
  "stock": "number",
  "trackStock": "boolean (optional, default: true) - Stok takibi yapılsın mı? false ise stoksuz satış yapılabilir",
  "moq": "number",
  "isActive": "boolean",
  "customFields": []
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "name": "string",
    "sku": "string",
    "category": "string",
    "price": "number",
    "currency": "TRY" | "USD" | "EUR",
    "stock": "number",
    "trackStock": "boolean (optional, default: true) - Stok takibi yapılsın mı? false ise stoksuz satış yapılabilir",
    "moq": "number",
    "isActive": "boolean",
    "hasSales": "boolean",
    "customFields": [],
    "ownerId": "number"
  }
}
```

---

### DELETE /stock/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

**Not:** `hasSales: true` olan ürünler silinemez.

---

### GET /stock/report

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [],
    "total": 0
  }
}
```

**Not:** Stock report endpoint'i henüz tam implement edilmemiş.

---

### GET /stock/:id/history

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": [
    {
      "id": "string | number",
      "action": "string",
      "description": "string",
      "user": "string",
      "timestamp": "string (ISO)",
      "changes": {
        "fieldName": {
          "old": "any",
          "new": "any"
        }
      }
    }
  ]
}
```

**Not:** Bu endpoint sadece stok işlemlerini (artırma/azaltma) döndürür.

---

### GET /stock/:id/movements

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": [
    {
      "id": "string | number",
      "type": "stock" | "purchase" | "sale",
      "action": "string",
      "description": "string (optional)",
      "user": "string (optional)",
      "timestamp": "string (ISO)",
      "changes": {
        "fieldName": {
          "old": "any",
          "new": "any"
        }
      },
      "quantity": "number (optional - purchase/sale için)",
      "price": "number (optional - purchase/sale için)",
      "currency": "string (optional - purchase/sale için)",
      "total": "number (optional - purchase/sale için)",
      "supplierName": "string (optional - purchase için)",
      "customerName": "string (optional - sale için)",
      "purchaseId": "string | number (optional - purchase için)",
      "saleId": "string | number (optional - sale için)"
    }
  ]
}
```

**Not:** Bu endpoint tüm hareketleri birleştirilmiş şekilde döndürür:
- Stok işlemleri (artırma/azaltma) - `type: "stock"`
- Alış işlemleri (tekli ve toplu) - `type: "purchase"`
- Satış işlemleri (tekli ve toplu) - `type: "sale"`

Tüm kayıtlar `timestamp` alanına göre azalan sırada (en yeni önce) döner.

**Example Response:**
```json
{
  "message": "OperationSuccessful",
  "data": [
    {
      "id": "sale-123",
      "type": "sale",
      "action": "sale",
      "description": "Satış",
      "timestamp": "2025-01-20T10:30:00Z",
      "quantity": 2,
      "price": 35000,
      "currency": "TRY",
      "total": 70000,
      "customerName": "Ahmet Usta",
      "saleId": "123"
    },
    {
      "id": "purchase-456",
      "type": "purchase",
      "action": "purchase",
      "description": "Alış",
      "timestamp": "2025-01-19T14:20:00Z",
      "quantity": 5,
      "price": 30000,
      "currency": "TRY",
      "total": 150000,
      "supplierName": "ABC Tedarik",
      "purchaseId": "456"
    },
    {
      "id": "stock-789",
      "type": "stock",
      "action": "stock_increase",
      "description": "Stok Artırma",
      "user": "John Doe",
      "timestamp": "2025-01-18T09:15:00Z",
      "changes": {
        "stock": {
          "old": 10,
          "new": 15
        }
      }
    }
  ]
}
```

---

## Employees APIs

### GET /employees

**Query Parameters:** (Same as Customers)

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [
      {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "position": "string",
        "status": "string (active | inactive)",
        "hireDate": "string (YYYY-MM-DD)",
        "salary": "number",
        "username": "string",
        "role": "admin" | "owner" | "staff",
        "customPermissions": {
          "moduleName": {
            "actions": ["string"]
          }
        },
        "ownerId": "string | number"
      }
    ],
    "totalCount": "number",
    "page": "number",
    "pageSize": "number",
    "totalPage": "number",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean"
  }
}
```

**Mock Data Example:**
```json
{
  "id": "3",
  "firstName": "Mehmet",
  "lastName": "Yılmaz",
  "name": "Mehmet Yılmaz",
  "email": "mehmet@example.com",
  "phone": "0532 123 4567",
  "position": "Manager",
  "status": "active",
  "hireDate": "2023-01-15",
  "salary": 25000,
  "ownerId": 2,
  "username": "mehmet.yilmaz",
  "role": "staff",
  "customPermissions": {
    "sales": {
      "actions": ["view", "create", "edit"]
    },
    "customers": {
      "actions": ["view", "create"]
    }
  }
}
```

---

### GET /employees/:id

**Response:** `200 OK` (Single Employee object)

---

### GET /employees/stats

**Response:** `200 OK`
```json
{
  "totalEmployees": "number",
  "activeEmployees": "number",
  "totalDepartments": "number"
}
```

---

### POST /employees

**Request:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "position": "string",
  "status": "string",
  "hireDate": "string",
  "salary": "number",
  "username": "string",
  "password": "string",
  "role": "string",
  "customPermissions": {}
}
```

**Response:** `200 OK` (Employee object with generated `id`)

---

### PUT /employees/:id

**Request:** (Partial Employee object)

**Response:** `200 OK` (Updated Employee object)

---

### DELETE /employees/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

---

### GET /employees/report

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [],
    "total": 0
  }
}
```

**Not:** Employees report endpoint'i henüz tam implement edilmemiş.

---

## Suppliers APIs

### GET /suppliers

**Query Parameters:** (Same as Customers)

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "address": "string",
      "isActive": "boolean",
      "totalOrders": "number",
      "ownerId": "number"
    }
  ],
  "total": "number"
}
```

**Mock Data Example:**
```json
{
  "id": "1",
  "name": "Apple Distribütör",
  "email": "apple@distributor.com",
  "phone": "0212 111 2233",
  "address": "İstanbul, Şişli",
  "isActive": true,
  "totalOrders": 15,
  "ownerId": 2
}
```

---

### GET /suppliers/:id

**Response:** `200 OK` (Single Supplier object)

---

### GET /suppliers/stats

**Response:** `200 OK`
```json
{
  "totalSuppliers": "number",
  "activeSuppliers": "number",
  "totalOrders": "number"
}
```

---

### POST /suppliers

**Request:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "isActive": "boolean"
}
```

**Response:** `200 OK` (Supplier object with generated `id`)

---

### PUT /suppliers/:id

**Request:** (Partial Supplier object)

**Response:** `200 OK` (Updated Supplier object)

---

### DELETE /suppliers/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

---

### GET /suppliers/report

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [],
    "total": 0
  }
}
```

**Not:** Suppliers report endpoint'i henüz tam implement edilmemiş.

---

## Purchases APIs

**Important Notes:**
- **Stock Control**: Alış işlemlerinde stok otomatik olarak artırılır
- **Bulk Purchases**: `items` array ile birden fazla ürün tek seferde alınabilir
- **Stock Tracking**: `trackStock: false` olan ürünler için de stok artırılır (backward compatibility)

### GET /purchases

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [
      {
        "id": "string",
        "supplierId": "string",
        "supplierName": "string",
        "productId": "string (optional - single product purchase)",
        "productName": "string (optional - single product purchase)",
        "quantity": "number (optional - single product purchase)",
        "price": "number (optional - single product purchase)",
        "currency": "TRY" | "USD" | "EUR",
        "total": "number",
        "date": "string (YYYY-MM-DD)",
        "status": "string (completed | pending)",
        "items": [
          {
            "productId": "string",
            "productName": "string",
            "quantity": "number",
            "price": "number",
            "subtotal": "number",
            "currency": "TRY" | "USD" | "EUR"
          }
        ],
        "customFields": [
          {
            "key": "string",
            "label": "string",
            "type": "text" | "number" | "date" | "select" | "boolean",
            "value": "any",
            "options": [{"label": "string", "value": "any"}],
            "isGlobal": "boolean"
          }
        ],
        "ownerId": "number"
      }
    ],
    "totalCount": "number",
    "page": "number",
    "pageSize": "number",
    "totalPage": "number",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean"
  }
}
```

**Mock Data Example (Single Product Purchase):**
```json
{
  "id": "1",
  "supplierId": "1",
  "supplierName": "Apple Distribütör",
  "productId": "1",
  "productName": "iPhone 14 Pro",
  "quantity": 10,
  "price": 24500,
  "currency": "TRY",
  "total": 245000,
  "date": "2025-01-10",
  "status": "completed",
  "ownerId": 2
}
```

**Mock Data Example (Bulk Purchase with Items Array):**
```json
{
  "id": "2",
  "supplierId": "1",
  "supplierName": "Apple Distribütör",
  "currency": "TRY",
  "total": 345000,
  "date": "2025-01-10",
  "status": "completed",
  "items": [
    {
      "productId": "1",
      "productName": "iPhone 14 Pro",
      "quantity": 10,
      "price": 24500,
      "subtotal": 245000,
      "currency": "TRY"
    },
    {
      "productId": "2",
      "productName": "AirPods Pro",
      "quantity": 5,
      "price": 20000,
      "subtotal": 100000,
      "currency": "TRY"
    }
  ],
  "ownerId": 2
}
```

---

### GET /purchases/:id

**Response:** `200 OK` (Single Purchase object)

---

### GET /purchases/stats

**Response:** `200 OK`
```json
{
  "totalPurchases": "number",
  "totalCost": "number",
  "monthlyPurchases": "number",
  "averagePurchaseValue": "number"
}
```

---

### POST /purchases

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "supplierId": "string",
  "productId": "string (optional - for single product purchase, ignored when items array is provided)",
  "quantity": "number (optional - for single product purchase, ignored when items array is provided)",
  "price": "number (optional - for single product purchase, ignored when items array is provided)",
  "currency": "TRY" | "USD" | "EUR",
  "date": "string (YYYY-MM-DD)",
  "status": "string (completed | pending)",
  "items": [
    {
      "productId": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "customFields": [
    {
      "key": "string",
      "label": "string",
      "type": "text" | "number" | "date" | "select" | "boolean",
      "value": "any",
      "options": [{"label": "string", "value": "any"}],
      "isGlobal": "boolean"
    }
  ]
}
```

**Not:** 
- When `items` array is provided, multiple products can be purchased in a single purchase
- When `items` is provided, `productId`, `quantity`, and `price` fields are ignored
- `total` is automatically calculated: `sum(items[i].quantity * items[i].price)`
- Stock is automatically increased for each product in the purchase

**Response:** `201 Created`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "supplierId": "string",
    "supplierName": "string",
    "productId": "string",
    "productName": "string",
    "quantity": "number",
    "price": "number",
    "currency": "TRY" | "USD" | "EUR",
    "total": "number",
    "date": "string (YYYY-MM-DD)",
    "status": "string (completed | pending)",
    "items": [],
    "ownerId": "number"
  }
}
```

---

### PUT /purchases/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:** (Partial Purchase object)
```json
{
  "supplierId": "string",
  "productId": "string",
  "quantity": "number",
  "price": "number",
  "currency": "TRY" | "USD" | "EUR",
  "date": "string (YYYY-MM-DD)",
  "status": "string (completed | pending)",
  "items": [
    {
      "productId": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "customFields": []
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "supplierId": "string",
    "supplierName": "string",
    "productId": "string",
    "productName": "string",
    "quantity": "number",
    "price": "number",
    "currency": "TRY" | "USD" | "EUR",
    "total": "number",
    "date": "string (YYYY-MM-DD)",
    "status": "string (completed | pending)",
    "items": [],
    "ownerId": "number"
  }
}
```

---

### DELETE /purchases/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

**Not:** Purchase silindiğinde, stok otomatik olarak azaltılır.

---

### GET /purchases/report

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [],
    "total": 0
  }
}
```

**Not:** Purchases report endpoint'i henüz tam implement edilmemiş.

---

## Expenses APIs

### GET /expenses

**Query Parameters:** (Same as Customers)

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "amount": "number",
      "currency": "TRY" | "USD" | "EUR",
      "type": "expense",
      "source": "product_purchase" | "employee_salary" | "manual",
      "expenseTypeId": "string",
      "expenseTypeName": "string",
      "date": "string (YYYY-MM-DD)",
      "description": "string",
      "saleId": "string (optional)",
      "productId": "string (optional)",
      "employeeId": "string (optional)",
      "isSystemGenerated": "boolean",
      "ownerId": "number"
    }
  ],
  "total": "number"
}
```

**Mock Data Example (Manual):**
```json
{
  "id": "1",
  "title": "Ofis Kirası",
  "amount": 5000,
  "currency": "TRY",
  "type": "expense",
  "source": "manual",
  "expenseTypeId": "1",
  "expenseTypeName": "Kira",
  "date": "2025-01-01",
  "description": "Ofis kirası ödemesi",
  "isSystemGenerated": false,
  "ownerId": 2
}
```

**Mock Data Example (System Generated - Product Purchase):**
```json
{
  "id": "expense_product_1",
  "title": "iPhone 14 Pro Alış",
  "amount": 24500,
  "currency": "TRY",
  "type": "expense",
  "source": "product_purchase",
  "date": "2025-01-15",
  "productId": "1",
  "ownerId": 2,
  "isSystemGenerated": true,
  "expenseTypeName": "Ürün Alışı",
  "description": "Ürün: iPhone 14 Pro"
}
```

**Mock Data Example (System Generated - Employee Salary):**
```json
{
  "id": "expense_salary_3",
  "title": "Mehmet Yılmaz Maaşı",
  "amount": 25000,
  "currency": "TRY",
  "type": "expense",
  "source": "employee_salary",
  "date": "2025-01-15",
  "employeeId": "3",
  "ownerId": 2,
  "isSystemGenerated": true,
  "expenseTypeName": "Maaş",
  "description": "Çalışan: Mehmet Yılmaz"
}
```

**Not:** Expenses endpoint'i sistem tarafından oluşturulan giderleri de içerir:
- Ürün alımlarından otomatik oluşturulan giderler (ürün fiyatının %70'i)
- Çalışan maaşlarından otomatik oluşturulan giderler
- Manuel olarak eklenen giderler

---

### GET /expenses/:id

**Response:** `200 OK` (Single Expense object)

---

### GET /expenses/stats

**Response:** `200 OK`
```json
{
  "totalTransactions": "number",
  "totalExpenses": "number",
  "monthlyExpenses": "number",
  "expensesFromProducts": "number",
  "expensesFromSalaries": "number",
  "expensesFromManual": "number",
  "expenseTypes": "number"
}
```

---

### POST /expenses

**Request:**
```json
{
  "title": "string",
  "amount": "number",
  "currency": "TRY" | "USD" | "EUR",
  "expenseTypeId": "string",
  "date": "string",
  "description": "string",
  "employeeId": "string (optional)"
}
```

**Response:** `200 OK` (Expense object with generated `id`)

---

### PUT /expenses/:id

**Request:** (Partial Expense object)

**Response:** `200 OK` (Updated Expense object)

---

### DELETE /expenses/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

---

### GET /expenses/report

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [],
    "total": 0
  }
}
```

**Not:** Expenses report endpoint'i henüz tam implement edilmemiş.

---

## Revenue APIs

### GET /revenue

**Query Parameters:** (Same as Customers)

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "amount": "number",
      "source": "sales" | "manual",
      "revenueTypeId": "string",
      "revenueTypeName": "string",
      "date": "string (YYYY-MM-DD)",
      "description": "string",
      "saleId": "string (optional)",
      "employeeId": "string (optional)",
      "isSystemGenerated": "boolean",
      "ownerId": "number"
    }
  ],
  "total": "number"
}
```

**Mock Data Example (Manual):**
```json
{
  "id": "1",
  "title": "Nakit Satış Geliri",
  "amount": 50000,
  "source": "manual",
  "revenueTypeId": "1",
  "revenueTypeName": "Nakit Gelir",
  "date": "2025-01-15",
  "description": "Nakit satış geliri",
  "isSystemGenerated": false,
  "ownerId": 2
}
```

**Mock Data Example (System Generated - Sales):**
```json
{
  "id": "revenue_sale_1",
  "title": "Satış",
  "amount": 35000,
  "source": "sales",
  "date": "2025-01-15",
  "saleId": "1",
  "employeeId": "3",
  "ownerId": 2,
  "isSystemGenerated": true,
  "revenueTypeName": "Satış",
  "description": "Satış: Ahmet Usta"
}
```

**Not:** Revenue endpoint'i sistem tarafından oluşturulan gelirleri de içerir:
- Satışlardan otomatik oluşturulan gelirler (status: "completed" olan satışlar)
- Manuel olarak eklenen gelirler

---

### GET /revenue/:id

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "title": "string",
    "amount": "number",
    "source": "sales" | "manual",
    "revenueTypeId": "string",
    "revenueTypeName": "string",
    "date": "string (YYYY-MM-DD)",
    "description": "string",
    "saleId": "string (optional)",
    "employeeId": "string (optional)",
    "isSystemGenerated": "boolean",
    "ownerId": "number"
  }
}
```

---

### GET /revenue/stats

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "totalTransactions": "number",
    "totalRevenue": "number",
    "monthlyRevenue": "number",
    "revenueFromSales": "number",
    "revenueFromManual": "number",
    "revenueTypes": "number"
  }
}
```

---

### POST /revenue

**Request:**
```json
{
  "title": "string",
  "amount": "number",
  "revenueTypeId": "string",
  "date": "string",
  "description": "string",
  "employeeId": "string (optional)"
}
```

**Response:** `200 OK` (Revenue object with generated `id`)

---

### PUT /revenue/:id

**Request:** (Partial Revenue object)

**Response:** `200 OK` (Updated Revenue object)

---

### DELETE /revenue/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

---

### GET /revenue/report

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [],
    "total": 0
  }
}
```

**Not:** Revenue report endpoint'i henüz tam implement edilmemiş.

---

## Income APIs

**Not:** Income API, Revenue API'ye benzer ancak gelir takibi için ayrı bir modüldür. Income ve Revenue farklı modüllerdir.

### GET /income

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "amount": "number",
        "currency": "TRY" | "USD" | "EUR",
        "source": "sales" | "manual",
        "incomeTypeId": "string",
        "incomeTypeName": "string",
        "date": "string (YYYY-MM-DD)",
        "description": "string",
        "saleId": "string (optional)",
        "employeeId": "string (optional)",
        "isSystemGenerated": "boolean",
        "ownerId": "number"
      }
    ],
    "totalCount": "number",
    "page": "number",
    "pageSize": "number",
    "totalPage": "number",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean"
  }
}
```

---

### GET /income/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "title": "string",
    "amount": "number",
    "currency": "TRY" | "USD" | "EUR",
    "source": "sales" | "manual",
    "incomeTypeId": "string",
    "incomeTypeName": "string",
    "date": "string (YYYY-MM-DD)",
    "description": "string",
    "saleId": "string (optional)",
    "employeeId": "string (optional)",
    "isSystemGenerated": "boolean",
    "ownerId": "number"
  }
}
```

---

### GET /income/stats

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "totalTransactions": "number",
    "totalIncome": "number",
    "monthlyIncome": "number",
    "incomeFromSales": "number",
    "incomeFromManual": "number",
    "incomeTypes": "number"
  }
}
```

---

### POST /income

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "title": "string",
  "amount": "number",
  "currency": "TRY" | "USD" | "EUR",
  "incomeTypeId": "string",
  "date": "string (YYYY-MM-DD)",
  "description": "string",
  "employeeId": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "title": "string",
    "amount": "number",
    "currency": "TRY" | "USD" | "EUR",
    "source": "manual",
    "incomeTypeId": "string",
    "incomeTypeName": "string",
    "date": "string (YYYY-MM-DD)",
    "description": "string",
    "employeeId": "string (optional)",
    "isSystemGenerated": false,
    "ownerId": "number"
  }
}
```

---

### PUT /income/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:** (Partial Income object)
```json
{
  "title": "string",
  "amount": "number",
  "currency": "TRY" | "USD" | "EUR",
  "incomeTypeId": "string",
  "date": "string (YYYY-MM-DD)",
  "description": "string",
  "employeeId": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "title": "string",
    "amount": "number",
    "currency": "TRY" | "USD" | "EUR",
    "source": "sales" | "manual",
    "incomeTypeId": "string",
    "incomeTypeName": "string",
    "date": "string (YYYY-MM-DD)",
    "description": "string",
    "saleId": "string (optional)",
    "employeeId": "string (optional)",
    "isSystemGenerated": "boolean",
    "ownerId": "number"
  }
}
```

---

### DELETE /income/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

---

### GET /income/report

**Query Parameters:** (Same as Customers)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [],
    "total": 0
  }
}
```

**Not:** Income report endpoint'i henüz tam implement edilmemiş.

---

## Reports APIs

### GET /reports

**Query Parameters:** (Same as Customers)

**Response:** `200 OK`
```json
{
  "items": [],
  "total": 0
}
```

**Not:** Reports module henüz tam implement edilmemiş.

---

### GET /reports/:id

**Response:** `200 OK` (Report object)

---

### GET /reports/stats

**Response:** `200 OK`
```json
{
  "totalReports": 0,
  "monthlyReports": 0
}
```

---

### POST /reports

**Request:** (Report object)

**Response:** `200 OK` (Report object with generated `id`)

---

### PUT /reports/:id

**Request:** (Partial Report object)

**Response:** `200 OK` (Updated Report object)

---

### DELETE /reports/:id

**Response:** `204 No Content`
```json
{
  "message": "OperationSuccessful"
}
```

---

## Modules APIs

Modules endpoint'i, uygulamadaki modüllerin listesini ve konfigürasyonunu döner.

### GET /modules

Tüm modülleri listeler.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
[
  {
    "id": "sales",
    "name": "Satış Yönetimi"
  },
  {
    "id": "customers",
    "name": "Müşteri Yönetimi"
  },
  {
    "id": "expenses",
    "name": "Gelir / Gider Takibi"
  },
  {
    "id": "reports",
    "name": "Raporlama"
  }
]
```

**Not:** Bu endpoint, kullanıcının package'ına göre filtrelenmiş modülleri dönebilir. Backend'de package bazlı filtreleme yapılmalı.

---

### GET /modules/:id

Belirli bir modülün detayını döner.

**Response:** `200 OK`
```json
{
  "id": "sales",
  "name": "Satış Yönetimi",
  "description": "Satış işlemlerini yönetmek için",
  "icon": "cash-outline",
  "route": "Sales",
  "permissions": {
    "actions": ["view", "create", "edit", "delete"],
    "fields": ["category", "price"],
    "notifications": ["dailyReport"]
  }
}
```

---

## Form Templates APIs

Form Templates sistemi, her modül için özelleştirilebilir form şablonları oluşturmayı sağlar. Bu sistem, sektörden bağımsız bir yapı sunar ve her modülde farklı form yapıları oluşturulmasına olanak tanır.

### Form Template Yapısı

```typescript
interface FormTemplate {
  id: string;
  module: string;                    // 'stock', 'customers', 'sales', etc.
  name: string;                     // Template name
  description?: string;
  baseFields: DynamicField[];        // Standard fields for the form
  customFields: DynamicField[];      // Custom fields specific to this template
  isActive: boolean;                 // Whether this template is active
  isDefault: boolean;                // Whether this is the default template
  order: number;                     // Display order
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface FormTemplateConfig {
  module: string;
  name: string;
  description?: string;
  baseFields: DynamicField[];
  customFields: DynamicField[];
  isActive?: boolean;
  isDefault?: boolean;
  order?: number;
}

interface DynamicField {
  name: string;
  labelKey?: string;
  label?: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: any;
}
```

### GET /form-templates/:module

Belirli bir modül için tüm form template'lerini listeler.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `module`: string - Modül adı (örn: 'stock', 'customers', 'sales', 'suppliers', 'purchases', 'expenses', 'revenue', 'employees')

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": [
    {
      "id": "1",
      "module": "stock",
      "name": "Hızlı Ürün Formu",
      "description": "Hızlı ürün ekleme için basit form",
      "baseFields": [
        {
          "name": "name",
          "labelKey": "name",
          "type": "text",
          "required": true
        },
        {
          "name": "price",
          "labelKey": "price",
          "type": "number",
          "required": true
        }
      ],
      "customFields": [],
      "isActive": true,
      "isDefault": true,
      "order": 1,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "2",
      "module": "stock",
      "name": "Detaylı Ürün Formu",
      "description": "Tüm alanları içeren detaylı form",
      "baseFields": [
        {
          "name": "name",
          "labelKey": "name",
          "type": "text",
          "required": true
        },
        {
          "name": "sku",
          "labelKey": "sku",
          "type": "text"
        },
        {
          "name": "category",
          "labelKey": "category",
          "type": "text"
        },
        {
          "name": "price",
          "labelKey": "price",
          "type": "number",
          "required": true
        },
        {
          "name": "stock",
          "labelKey": "stock",
          "type": "number"
        }
      ],
      "customFields": [
        {
          "name": "warranty_period",
          "labelKey": "warranty_period",
          "type": "number"
        }
      ],
      "isActive": true,
      "isDefault": false,
      "order": 2,
      "createdAt": "2025-01-15T11:00:00Z",
      "updatedAt": "2025-01-15T11:00:00Z"
    }
  ]
}
```

**Not:** Response array veya paginated olabilir. Frontend her iki formatı desteklemelidir.

---

### GET /form-templates/:module/:id

Belirli bir form template'i ID ile getirir.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `module`: string - Modül adı
- `id`: string | number - Template ID

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "1",
    "module": "stock",
    "name": "Hızlı Ürün Formu",
    "description": "Hızlı ürün ekleme için basit form",
    "baseFields": [
      {
        "name": "name",
        "labelKey": "name",
        "type": "text",
        "required": true
      },
      {
        "name": "price",
        "labelKey": "price",
        "type": "number",
        "required": true
      }
    ],
    "customFields": [],
    "isActive": true,
    "isDefault": true,
    "order": 1,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### POST /form-templates/:module

Yeni form template oluşturur.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `module`: string - Modül adı

**Request:**
```json
{
  "name": "Yeni Şablon",
  "description": "Açıklama (opsiyonel)",
  "baseFields": [
    {
      "name": "name",
      "labelKey": "name",
      "type": "text",
      "required": true
    },
    {
      "name": "price",
      "labelKey": "price",
      "type": "number",
      "required": true
    }
  ],
  "customFields": [],
  "isActive": true,
  "isDefault": false,
  "order": 1
}
```

**Response:** `201 Created`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "3",
    "module": "stock",
    "name": "Yeni Şablon",
    "description": "Açıklama (opsiyonel)",
    "baseFields": [
      {
        "name": "name",
        "labelKey": "name",
        "type": "text",
        "required": true
      },
      {
        "name": "price",
        "labelKey": "price",
        "type": "number",
        "required": true
      }
    ],
    "customFields": [],
    "isActive": true,
    "isDefault": false,
    "order": 1,
    "createdAt": "2025-01-15T12:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z",
    "createdBy": "2",
    "updatedBy": "2"
  }
}
```

**Not:** 
- `module` field'ı path parametresinden alınır, request body'de gönderilse de path parametresi kullanılır
- Her modül için sadece bir template `isDefault: true` olabilir
- Eğer yeni template `isDefault: true` olarak oluşturulursa, o modüldeki diğer default template'in `isDefault` değeri `false` yapılmalıdır

---

### PUT /form-templates/:module/:id

Mevcut form template'i günceller.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `module`: string - Modül adı
- `id`: string | number - Template ID

**Request:** (Partial FormTemplateConfig object)
```json
{
  "name": "Güncellenmiş Şablon Adı",
  "description": "Güncellenmiş açıklama",
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "1",
    "module": "stock",
    "name": "Güncellenmiş Şablon Adı",
    "description": "Güncellenmiş açıklama",
    "baseFields": [
      // ... existing baseFields
    ],
    "customFields": [
      // ... existing customFields
    ],
    "isActive": true,
    "isDefault": true,
    "order": 1,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T13:00:00Z",
    "updatedBy": "2"
  }
}
```

**Not:**
- Partial update desteklenir (sadece gönderilen field'lar güncellenir)
- `baseFields` ve `customFields` güncellenebilir
- Eğer `isDefault: true` yapılırsa, o modüldeki diğer default template'in `isDefault` değeri `false` yapılmalıdır

---

### DELETE /form-templates/:module/:id

Form template'i siler.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `module`: string - Modül adı
- `id`: string | number - Template ID

**Response:** `204 No Content` veya `200 OK`
```json
{
  "message": "OperationSuccessful"
}
```

**Not:** 
- Default template silinemez (önce başka bir template'i default yapmak gerekir)
- Silme işlemi soft delete olabilir (`isActive: false` yapılabilir)

---

### POST /form-templates/:module/:id/clone

Mevcut form template'i klonlar (kopyalar).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `module`: string - Modül adı
- `id`: string | number - Klonlanacak template ID

**Request:**
```json
{
  "newName": "Klonlanmış Şablon"
}
```

**Response:** `201 Created`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "4",
    "module": "stock",
    "name": "Klonlanmış Şablon",
    "description": "Hızlı ürün ekleme için basit form",
    "baseFields": [
      // ... cloned baseFields
    ],
    "customFields": [
      // ... cloned customFields
    ],
    "isActive": true,
    "isDefault": false,
    "order": 3,
    "createdAt": "2025-01-15T14:00:00Z",
    "updatedAt": "2025-01-15T14:00:00Z"
  }
}
```

**Not:**
- Klonlanan template'in `isDefault` değeri her zaman `false` olur
- Klonlanan template'in `order` değeri, listedeki son template'in order'ından bir fazla olur

---

### POST /form-templates/:module/:id/set-default

Form template'i varsayılan (default) olarak işaretler.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `module`: string - Modül adı
- `id`: string | number - Template ID

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "2",
    "module": "stock",
    "name": "Detaylı Ürün Formu",
    "description": "Tüm alanları içeren detaylı form",
    "baseFields": [
      // ... baseFields
    ],
    "customFields": [
      // ... customFields
    ],
    "isActive": true,
    "isDefault": true,
    "order": 2,
    "createdAt": "2025-01-15T11:00:00Z",
    "updatedAt": "2025-01-15T15:00:00Z",
    "updatedBy": "2"
  }
}
```

**Not:**
- Bu işlem, o modüldeki diğer default template'in `isDefault` değerini otomatik olarak `false` yapar
- Her modül için sadece bir template default olabilir
- Default template, form oluşturma ekranlarında varsayılan olarak kullanılır

---

### Desteklenen Modüller

Form Templates sistemi şu modüller için kullanılabilir:

- `stock` - Ürün/Stok modülü
- `customers` - Müşteri modülü
- `suppliers` - Tedarikçi modülü
- `sales` - Satış modülü
- `purchases` - Alış modülü
- `expenses` - Gider modülü
- `revenue` - Gelir modülü
- `employees` - Çalışan modülü

---

### Database Yapısı

#### Form Templates Table

```sql
CREATE TABLE form_templates (
    id VARCHAR(50) PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_fields JSON NOT NULL,           -- DynamicField[] array
    custom_fields JSON NOT NULL,         -- DynamicField[] array
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    owner_id INT NOT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_module_owner (module, owner_id),
    INDEX idx_module_default (module, owner_id, is_default),
    UNIQUE KEY unique_module_default (module, owner_id, is_default)  -- Her modül için sadece bir default
);
```

**Not:**
- `base_fields` ve `custom_fields` JSON formatında saklanır
- `is_default` field'ı için unique constraint, her modül ve owner kombinasyonu için sadece bir default template olmasını sağlar
- Owner bazlı filtreleme yapılır (admin `owner_id: null` ile tüm veriyi görebilir)

---

### Kullanım Senaryoları

1. **Hızlı Ürün Ekleme Formu:** Sadece temel alanları (isim, fiyat) içeren basit form
2. **Detaylı Ürün Formu:** Tüm alanları (SKU, kategori, stok, özel alanlar) içeren kapsamlı form
3. **Sektöre Özel Formlar:** Her sektör için özelleştirilmiş form şablonları
4. **A/B Test Formları:** Farklı form yapılarını test etmek için klonlama

---

## Dashboard APIs

### GET /dashboard/owner/store-summary

**Query Parameters:**
- `period`: "day" | "week" | "month" | "year" | "all" (default: "all")

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "sales": "number",
  "expenses": "number",
  "total": "number"
}
```

**Example:**
```
GET /dashboard/owner/store-summary?period=month
```

---

### GET /dashboard/owner/employee-summary

**Query Parameters:**
- `employeeId`: number (optional) - Belirli bir çalışan için, yoksa tüm çalışanlar
- `period`: "day" | "week" | "month" | "year" | "all" (default: "all")

**Response:** `200 OK`
```json
{
  "sales": "number",
  "expenses": "number",
  "total": "number",
  "employeeId": "number (optional)",
  "productSales": [
    {
      "productId": "string | number",
      "productName": "string",
      "quantity": "number",
      "totalAmount": "number"
    }
  ],
  "productCount": "number"
}
```

**Example:**
```
GET /dashboard/owner/employee-summary?employeeId=3&period=month
```

---

### GET /dashboard/owner/top-products

**Query Parameters:**
- `period`: "day" | "week" | "month" | "year" | "all" (default: "all")
- `limit`: number (default: 10)

**Response:** `200 OK`
```json
{
  "products": [
    {
      "productId": "string | number",
      "productName": "string",
      "quantity": "number",
      "totalAmount": "number"
    }
  ],
  "totalCount": "number"
}
```

**Example:**
```
GET /dashboard/owner/top-products?period=month&limit=10
```

---

## Common Types

### GridRequest (Query Parameters for List Endpoints)

```typescript
interface GridRequest {
  page: number;                    // 1-based page number
  pageSize: number;                // Items per page
  search?: string;                  // General search query (alternative: q)
  filters?: Record<string, string>; // Field-specific filters
  orderColumn?: string;             // Column name to sort by
  orderDirection?: "asc" | "desc"; // Sort direction (lowercase)
}
```

**Query String Format:**
```
?page=1&pageSize=20&search=term&orderColumn=name&orderDirection=asc&filters[status]=active
```

**Alternative Query String Format (with q):**
```
?page=1&pageSize=20&q=term&orderColumn=name&orderDirection=desc&filters[status]=active
```

---

### BaseControllerResponse

Tüm API response'ları `BaseControllerResponse<T>` formatında döner:

```typescript
interface BaseControllerResponse {
  message: string;        // İşlem mesajı (örn: "OperationSuccessful")
  errorMeta?: any;         // Hata durumunda dinamik error metadata (sadece hata response'larında)
}

interface BaseControllerResponse<T> extends BaseControllerResponse {
  data?: T;                // Response data (başarılı response'larda)
}
```

**Not:** `statusCode` field'ı backend'de `JsonIgnore` ile işaretlenmiştir ve response body'de yer almaz. HTTP response status code kullanılır:
- **200-299**: Başarılı response'lar (data içerir)
- **400-499**: Client errors (errorMeta içerebilir)
- **500+**: Server errors (errorMeta içerebilir)

### PaginatedData (List Response'lar için)

List endpoint'leri `PaginatedData<T>` formatında döner:

```typescript
interface PaginatedData<T> {
  items: T[];              // Sayfalı item'lar
  totalCount: number;      // Toplam kayıt sayısı
  page: number;            // Mevcut sayfa numarası (1-based)
  pageSize: number;       // Sayfa başına kayıt sayısı
  totalPage: number;      // Toplam sayfa sayısı
  hasNextPage: boolean;    // Sonraki sayfa var mı?
  hasPreviousPage: boolean; // Önceki sayfa var mı?
}
```

**Örnek List Response:**
```json
{
  "message": "OperationSuccessful",
  "data": {
    "items": [...],
    "totalCount": 100,
    "page": 1,
    "pageSize": 20,
    "totalPage": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### Authentication & Authorization

**Token Format (Mock):**
- Access Token: `mock-access-token-{userId}`
- Refresh Token: `mock-refresh-token-{userId}`

**Owner ID Extraction:**
- Token'dan user ID çıkarılır
- Admin kullanıcılar: `ownerId: null` - tüm veriyi görür
- Owner kullanıcılar: `ownerId: user.id` - sadece kendi verilerini görür
- Staff kullanıcılar: `ownerId: user.ownerId` - bağlı oldukları owner'ın verilerini görür

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

---

### Error Responses

Tüm hata response'ları `BaseControllerResponse` formatında döner. HTTP status code hatayı belirtir:

**400 Bad Request (Validation Error):**
```json
{
  "message": "Validation failed. Please check your input.",
  "errorMeta": {
    // Dinamik error metadata (API'ye göre değişir)
    // Örnek: validation errors, field-specific errors, etc.
  }
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid credentials" | "Unauthorized",
  "errorMeta": {
    // Opsiyonel: ek hata bilgileri
  }
}
```

**403 Forbidden:**
```json
{
  "message": "Access forbidden. You do not have permission.",
  "errorMeta": {
    // Opsiyonel: ek hata bilgileri
  }
}
```

**404 Not Found:**
```json
{
  "message": "Not found" | "Endpoint not found",
  "errorMeta": {
    // Opsiyonel: ek hata bilgileri
  }
}
```

**500 Internal Server Error:**
```json
{
  "message": "Server error. Please try again later.",
  "errorMeta": {
    // Opsiyonel: ek hata bilgileri (production'da hassas bilgiler içermemeli)
  }
}
```

**Not:** 
- `errorMeta` field'ı dinamik bir yapıdır ve API'ye göre değişebilir
- Başarılı response'larda (200-299) `errorMeta` field'ı bulunmaz
- Client error'lar (400-499) ve server error'lar (500+) için `errorMeta` opsiyoneldir

---

## Notes for Backend Implementation

1. **Owner Filtering:** Tüm entity'lerde `ownerId` field'ı ile filtreleme yapılmalı. Admin `ownerId: null` ile tüm veriyi görebilir.

2. **System Generated Data:**
   - Expenses: Product purchases ve employee salaries otomatik oluşturulur
   - Revenue: Completed sales otomatik oluşturulur
   - Bu veriler silinemez veya düzenlenemez (`isSystemGenerated: true`)

3. **ID Types:**
   - Products ve Employees: `id` string olarak normalize edilir
   - Diğer entity'ler: string veya number olabilir

4. **Pagination:**
   - `page` 1-based (ilk sayfa = 1)
   - `pageSize` varsayılan: 20
   - Response'ta `items` ve `total` dönülür

5. **Search:**
   - `search` veya `q` parametresi ile genel arama yapılır
   - Tüm primitive field'lar (string, number, boolean) üzerinde arama yapılır

6. **Filtering:**
   - `filters[key]=value` formatında query parametreleri ile filtrelenir (örn: `filters[status]=active`)
   - Exact match yapılır

7. **Sorting:**
   - `orderColumn`: Sıralanacak column adı (camelCase)
   - `orderDirection`: "asc" veya "desc" (lowercase)

8. **Date Format:**
   - Tüm tarihler ISO formatında: `YYYY-MM-DD`

9. **Currency:**
   - Products için: `TRY`, `USD`, `EUR` desteklenir

10. **Stats Endpoints:**
    - Her module için `/resource/stats` endpoint'i var
    - Owner bazlı filtreleme yapılır

---

## Expense Types APIs

### GET /expense-types

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": [
    {
      "id": "string",
      "name": "string",
      "ownerId": "number"
    }
  ]
}
```

**Mock Data:**
```json
[
  { "id": "1", "name": "Kira", "ownerId": 2 },
  { "id": "2", "name": "Elektrik", "ownerId": 2 },
  { "id": "3", "name": "Su", "ownerId": 2 },
  { "id": "4", "name": "İnternet", "ownerId": 2 },
  { "id": "5", "name": "Telefon", "ownerId": 2 },
  { "id": "6", "name": "Temizlik", "ownerId": 2 },
  { "id": "7", "name": "Ekipman", "ownerId": 2 },
  { "id": "8", "name": "Kırtasiye", "ownerId": 2 },
  { "id": "9", "name": "Nakliye", "ownerId": 2 },
  { "id": "10", "name": "Pazarlama", "ownerId": 2 },
  { "id": "11", "name": "Personel", "ownerId": 2 },
  { "id": "12", "name": "Vergi", "ownerId": 2 },
  { "id": "13", "name": "Sigorta", "ownerId": 2 },
  { "id": "14", "name": "Bakım", "ownerId": 2 },
  { "id": "15", "name": "Danışmanlık", "ownerId": 2 }
]
```

**Not:** Response'ta owner'a ait tüm expense type'lar döner (sistem default + user created).

---

### GET /expense-types/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "name": "string",
    "ownerId": "number"
  }
}
```

---

### POST /expense-types

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "string"
}
```

**Response:** `201 Created`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "name": "string",
    "ownerId": "number"
  }
}
```

---

### PUT /expense-types/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "id": "string",
    "name": "string",
    "ownerId": "number"
  }
}
```

---

### DELETE /expense-types/:id

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful"
}
```

**Not:** Eğer expense type kullanılmışsa (expenses tablosunda referans varsa), silinememeli veya soft delete yapılmalı.

---

### GET /expense-types/stats

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "totalTypes": "number",
    "totalExpenseAmount": "number"
  }
}
```

---

## Permissions System

Permissions sistemi, kullanıcılara modül bazında yetki verme ve kısıtlama yapmayı sağlar. Sistem **3 katmanlı** bir yapı kullanır:

1. **Role-based Permissions (Base):** Her role için temel permission'lar
2. **Package-based Module Filtering:** Paket bazında hangi modüllere erişim olduğu
3. **Custom User Permissions:** Kullanıcıya özel permission'lar (role'den bağımsız)

### Permission Yapısı

Her permission 3 bileşenden oluşur:

```typescript
interface PermissionDetail {
  actions: string[];      // ["view", "create", "edit", "delete"]
  fields: string[];      // ["category", "price", "group", "phone", etc.]
  notifications: string[]; // ["dailyReport", "lowStock"]
}
```

### Permission Birleştirme Mantığı

Kullanıcının final permission'ları şu şekilde hesaplanır:

```
Final Permissions = Package Filtering + Role Base Permissions + Custom Permissions
```

**Örnek Senaryo:**
- User Role: `staff`
- User Package: `premium` (allowedModules: ["sales", "customers", "expenses", "employees"])
- Role Base Permissions: `staff` role'ünün base permission'ları
- Custom Permissions: User'a özel verilen permission'lar

**Hesaplama:**
1. Package'daki allowedModules filtrelenir
2. Her modül için Role'un base permission'ları alınır
3. User'ın custom permission'ları eklenir (üzerine yazılır, replace değil merge)
4. Final permission'lar oluşturulur

---

### Database Yapısı Önerisi

#### 1. Roles Table

```sql
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Örnek veriler
INSERT INTO roles (id, name) VALUES 
('admin', 'Administrator'),
('owner', 'Business Owner'),
('staff', 'Staff Member'),
('guest', 'Guest User');
```

#### 2. Role Permissions Table

```sql
CREATE TABLE role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    actions JSON NOT NULL,          -- ["view", "create", "edit", "delete"]
    fields JSON NOT NULL,            -- ["category", "price", "group", "phone"]
    notifications JSON NOT NULL,     -- ["dailyReport", "lowStock"]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_module (role_id, module)
);

-- Örnek veriler (Admin role için)
INSERT INTO role_permissions (role_id, module, actions, fields, notifications) VALUES
('admin', 'sales', '["view", "create", "edit", "delete"]', '["category", "price"]', '["dailyReport"]'),
('admin', 'customers', '["view", "create", "edit", "delete"]', '["group", "phone"]', '[]'),
('admin', 'expenses', '["view", "create", "edit", "delete"]', '["expenseType", "amount"]', '[]'),
('admin', 'employees', '["view", "create", "edit", "delete"]', '["role"]', '[]'),
('admin', 'reports', '["view"]', '["dateRange"]', '[]');
```

#### 3. Packages Table

```sql
CREATE TABLE packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Örnek veriler
INSERT INTO packages (id, name, price) VALUES
('free', 'Free Plan', 0.00),
('premium', 'Premium Plan', 99.99),
('gold', 'Gold Plan', 199.99);
```

#### 4. Package Modules Table

```sql
CREATE TABLE package_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    package_id VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_package_module (package_id, module)
);

-- Örnek veriler (Premium package için)
INSERT INTO package_modules (package_id, module) VALUES
('premium', 'sales'),
('premium', 'customers'),
('premium', 'expenses'),
('premium', 'employees');

-- Gold package için (tüm modüller + reports)
INSERT INTO package_modules (package_id, module) VALUES
('gold', 'sales'),
('gold', 'customers'),
('gold', 'expenses'),
('gold', 'reports'),
('gold', 'employees');
```

#### 5. User Custom Permissions Table

```sql
CREATE TABLE user_custom_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module VARCHAR(50) NOT NULL,
    actions JSON NOT NULL,          -- ["view", "create", "edit", "delete"]
    fields JSON NOT NULL,           -- ["category", "price"]
    notifications JSON NOT NULL,    -- ["dailyReport", "lowStock"]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_module (user_id, module)
);

-- Örnek: User ID 3 için custom permissions
INSERT INTO user_custom_permissions (user_id, module, actions, fields, notifications) VALUES
(3, 'sales', '["view", "create", "edit"]', '[]', '[]'),
(3, 'customers', '["view", "create"]', '[]', '[]');
```

### Users Table'a Permission İlgili Field'lar

Users table'ında şu field'lar olmalı:

```sql
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'staff';
ALTER TABLE users ADD COLUMN package_id VARCHAR(50);
ALTER TABLE users ADD FOREIGN KEY (role) REFERENCES roles(id);
ALTER TABLE users ADD FOREIGN KEY (package_id) REFERENCES packages(id);
```

---

### Permission Hesaplama API Endpoint'leri

#### GET /users/:id/permissions

Kullanıcının final (hesaplanmış) permission'larını döner.

**Response:** `200 OK`
```json
{
  "userId": 3,
  "role": "staff",
  "package": "premium",
  "allowedModules": ["sales", "customers", "expenses", "employees"],
  "permissions": {
    "sales": {
      "actions": ["view", "create", "edit"],
      "fields": ["category", "price"],
      "notifications": []
    },
    "customers": {
      "actions": ["view", "create"],
      "fields": ["group"],
      "notifications": []
    },
    "expenses": {
      "actions": [],
      "fields": [],
      "notifications": []
    },
    "employees": {
      "actions": [],
      "fields": [],
      "notifications": []
    }
  }
}
```

**Hesaplama Mantığı:**
1. User'ın `package_id`'sinden `allowedModules` alınır
2. Her `allowedModule` için:
   - Role'un base permission'ları `role_permissions` tablosundan alınır
   - User'ın custom permission'ları `user_custom_permissions` tablosundan alınır
   - İki permission merge edilir (custom permission'lar üzerine yazılır)
   - Final permission oluşturulur

---

#### GET /roles

Tüm rolleri ve base permission'larını döner.

**Response:** `200 OK`
```json
[
  {
    "id": "admin",
    "name": "Administrator",
    "description": "Full system access",
    "permissions": {
      "sales": {
        "actions": ["view", "create", "edit", "delete"],
        "fields": ["category", "price"],
        "notifications": ["dailyReport"]
      },
      "customers": {
        "actions": ["view", "create", "edit", "delete"],
        "fields": ["group", "phone"],
        "notifications": []
      }
    }
  }
]
```

---

#### GET /roles/:id/permissions

Belirli bir role'un permission'larını döner.

**Response:** `200 OK`
```json
{
  "roleId": "staff",
  "permissions": {
    "sales": {
      "actions": ["view", "create"],
      "fields": ["category", "price"],
      "notifications": []
    },
    "customers": {
      "actions": ["view"],
      "fields": ["group"],
      "notifications": []
    }
  }
}
```

---

#### PUT /roles/:id/permissions

Role'un permission'larını günceller.

**Request:**
```json
{
  "permissions": {
    "sales": {
      "actions": ["view", "create", "edit"],
      "fields": ["category", "price"],
      "notifications": ["dailyReport"]
    }
  }
}
```

**Response:** `200 OK` (Updated role permissions)

---

#### GET /packages

Tüm paketleri ve allowedModules'larını döner.

**Response:** `200 OK`
```json
[
  {
    "id": "premium",
    "name": "Premium Plan",
    "price": 99.99,
    "allowedModules": ["sales", "customers", "expenses", "employees"]
  }
]
```

---

#### GET /packages/:id/modules

Belirli bir paketin allowedModules'larını döner.

**Response:** `200 OK`
```json
{
  "packageId": "premium",
  "allowedModules": ["sales", "customers", "expenses", "employees"]
}
```

---

#### PUT /packages/:id/modules

Paketin allowedModules'larını günceller.

**Request:**
```json
{
  "allowedModules": ["sales", "customers", "expenses", "employees", "reports"]
}
```

**Response:** `200 OK` (Updated package modules)

---

#### GET /users/:id/custom-permissions

Kullanıcının custom permission'larını döner.

**Response:** `200 OK`
```json
{
  "userId": 3,
  "customPermissions": {
    "sales": {
      "actions": ["view", "create", "edit"],
      "fields": [],
      "notifications": []
    },
    "customers": {
      "actions": ["view", "create"],
      "fields": [],
      "notifications": []
    }
  }
}
```

---

#### PUT /users/:id/custom-permissions

Kullanıcının custom permission'larını günceller.

**Request:**
```json
{
  "customPermissions": {
    "sales": {
      "actions": ["view", "create", "edit", "delete"],
      "fields": ["category", "price"],
      "notifications": ["dailyReport"]
    },
    "customers": {
      "actions": ["view", "create"],
      "fields": ["group", "phone"],
      "notifications": []
    }
  }
}
```

**Response:** `200 OK` (Updated custom permissions)

**Not:** 
- Bu endpoint tüm custom permission'ları replace eder (merge değil)
- Eğer bir modül için custom permission gönderilmezse, o modül custom permission'larından kaldırılır
- Eğer `null` veya boş object gönderilirse, tüm custom permission'lar silinir

---

#### DELETE /users/:id/custom-permissions/:module

Kullanıcının belirli bir modül için custom permission'larını siler.

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### Permission Validation Mantığı

Backend'de her API endpoint'i için permission kontrolü yapılmalı:

#### Permission Check Flow:

```typescript
// 1. User'ın final permission'larını hesapla
const finalPermissions = calculateUserPermissions(userId);

// 2. İstenen action için kontrol et
const module = 'sales';
const action = 'create';

if (!finalPermissions[module]?.actions.includes(action)) {
  throw new Error('Insufficient permissions');
}

// 3. Eğer field-level permission varsa, onu da kontrol et
const field = 'price';
if (!finalPermissions[module]?.fields.includes(field)) {
  // Field'a erişim yok, bu field'ı response'tan çıkar veya null gönder
}
```

#### Action Permission Mapping:

- `view`: GET list ve GET detail endpoint'leri
- `create`: POST endpoint'leri
- `edit`: PUT endpoint'leri
- `delete`: DELETE endpoint'leri

**Örnek:**
```typescript
// GET /sales endpoint'i için
if (!hasPermission(user, 'sales', 'view')) {
  return 403 Forbidden;
}

// POST /sales endpoint'i için
if (!hasPermission(user, 'sales', 'create')) {
  return 403 Forbidden;
}
```

---

### Permission String Format

Permission string formatı: `{module}:{action}`

**Örnekler:**
- `sales:view`
- `sales:create`
- `sales:edit`
- `sales:delete`
- `stock:manage_global_fields` (özel permission)
- `stock:add_product_custom_fields` (özel permission)

**Tüm Mevcut Modules:**
- `sales`
- `customers`
- `suppliers`
- `expenses`
- `revenue`
- `employees`
- `stock` (veya `products`)
- `purchases`
- `reports`
- `settings`

**Tüm Mevcut Actions:**
- `view` - Liste ve detay görüntüleme
- `create` - Yeni kayıt oluşturma
- `edit` - Mevcut kaydı güncelleme
- `delete` - Kayıt silme
- `manage_global_fields` - Global field yönetimi (stock için özel)
- `add_product_custom_fields` - Ürün custom field ekleme (stock için özel)

---

### Field-Level Permissions

Field-level permissions, kullanıcının hangi field'lara erişebileceğini kontrol eder.

**Mevcut Fields (Module bazında):**
- `sales`: `["category", "price"]`
- `customers`: `["group", "phone"]`
- `expenses`: `["expenseType", "amount"]`
- `employees`: `["role"]`
- `reports`: `["dateRange"]`

**Kullanım Senaryosu:**
- Eğer kullanıcı `sales` modülünde `price` field'ına permission'ı yoksa:
  - API response'ta `price` field'ı `null` veya çıkarılmalı
  - Form'da `price` field'ı gösterilmemeli veya disabled olmalı

---

### Notification Permissions

Notification permissions, kullanıcının hangi notification'ları alabileceğini kontrol eder.

**Mevcut Notifications:**
- `dailyReport` - Günlük rapor bildirimleri
- `lowStock` - Düşük stok uyarıları

**Kullanım Senaryosu:**
- Eğer kullanıcı `sales` modülünde `dailyReport` notification'ı varsa:
  - Kullanıcı günlük satış raporu notification'larını alır

---

### Permission Calculation Pseudocode

```sql
-- Kullanıcının final permission'larını hesaplayan stored procedure veya function

-- 1. Package'dan allowedModules al
SELECT module FROM package_modules WHERE package_id = user.package_id;

-- 2. Her allowedModule için:
FOR EACH allowedModule:
  -- 2a. Role'un base permission'larını al
  SELECT actions, fields, notifications 
  FROM role_permissions 
  WHERE role_id = user.role AND module = allowedModule;
  
  -- 2b. User'ın custom permission'larını al
  SELECT actions, fields, notifications 
  FROM user_custom_permissions 
  WHERE user_id = user.id AND module = allowedModule;
  
  -- 2c. Merge et (custom üzerine yazılır, ancak array merge edilir)
  finalPermissions[allowedModule] = {
    actions: merge(roleActions, customActions),      -- Unique merge
    fields: merge(roleFields, customFields),          -- Unique merge
    notifications: merge(roleNotifications, customNotifications) -- Unique merge
  };
ENDFOR

-- 3. Final permission'ları döndür
RETURN finalPermissions;
```

---

### Employees API'sinde Custom Permissions

Employees endpoint'i, kullanıcıların custom permission'larını yönetmek için kullanılır.

#### Employees Response'a Custom Permissions Eklenmeli:

```json
{
  "id": "3",
  "firstName": "Mehmet",
  "lastName": "Yılmaz",
  "email": "mehmet@example.com",
  "username": "mehmet.yilmaz",
  "role": "staff",
  "customPermissions": {
    "sales": {
      "actions": ["view", "create", "edit"],
      "fields": [],
      "notifications": []
    },
    "customers": {
      "actions": ["view", "create"],
      "fields": [],
      "notifications": []
    }
  }
}
```

#### PUT /employees/:id endpoint'inde Custom Permissions Güncellenebilmeli:

**Request:**
```json
{
  "firstName": "Mehmet",
  "customPermissions": {
    "sales": {
      "actions": ["view", "create", "edit", "delete"],
      "fields": ["category", "price"],
      "notifications": ["dailyReport"]
    }
  }
}
```

---

### Backend Implementation Checklist

- [ ] Roles table oluştur
- [ ] Role_permissions table oluştur
- [ ] Packages table oluştur
- [ ] Package_modules table oluştur
- [ ] User_custom_permissions table oluştur
- [ ] Users table'a `role` ve `package_id` field'ları ekle
- [ ] Permission calculation function/stored procedure yaz
- [ ] GET /users/:id/permissions endpoint'i implement et
- [ ] GET /roles endpoint'i implement et
- [ ] GET /roles/:id/permissions endpoint'i implement et
- [ ] PUT /roles/:id/permissions endpoint'i implement et
- [ ] GET /packages endpoint'i implement et
- [ ] GET /packages/:id/modules endpoint'i implement et
- [ ] PUT /packages/:id/modules endpoint'i implement et
- [ ] GET /users/:id/custom-permissions endpoint'i implement et
- [ ] PUT /users/:id/custom-permissions endpoint'i implement et
- [ ] DELETE /users/:id/custom-permissions/:module endpoint'i implement et
- [ ] Her API endpoint'ine permission check middleware ekle
- [ ] Field-level permission kontrolü ekle (response'da field'ları filtrele)
- [ ] Notification permission kontrolü ekle

---

## Custom Fields System (Products)

### Global Custom Fields vs Product-Specific Custom Fields

Products için iki tür custom field sistemi vardır:

1. **Global Custom Fields (Genel Alanlar):**
   - Tüm ürünlerde kullanılabilir
   - Admin tarafından yönetilir (`stock:manage_global_fields` permission gerekir)
   - Tip belirleme (text, number, date, select, boolean) yapılır
   - Select tipinde options tanımlanır
   - Bir kez oluşturulduktan sonra tüm ürünlerde kullanılabilir

2. **Product-Specific Custom Fields (Ürüne Özel Alanlar):**
   - Sadece belirli bir ürün için geçerlidir
   - Ürün oluştururken/güncellerken eklenir
   - Herkes ekleyebilir (`stock:add_product_custom_fields` permission gerekir)
   - Sadece label ve value içerir (tip belirlenmez, default: text)

### Custom Field Yapısı

```typescript
interface ProductCustomField {
  key: string;                    // Unique identifier (örn: "warranty_period")
  label: string;                   // Görünen ad (örn: "Garanti Süresi")
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  value: any;                      // Field'ın değeri
  options?: Array<{                // Sadece select tipinde
    label: string;
    value: any;
  }>;
  isGlobal?: boolean;              // true: Global field, false/undefined: Product-specific
}
```

### Global Custom Fields API Endpoints

#### GET /products/global-fields

Tüm global custom field'ları listeler.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
[
  {
    "key": "warranty_period",
    "label": "Garanti Süresi (Ay)",
    "type": "number",
    "value": null,
    "isGlobal": true
  },
  {
    "key": "brand",
    "label": "Marka",
    "type": "select",
    "value": null,
    "options": [
      { "label": "Apple", "value": "apple" },
      { "label": "Samsung", "value": "samsung" },
      { "label": "Xiaomi", "value": "xiaomi" }
    ],
    "isGlobal": true
  },
  {
    "key": "has_warranty",
    "label": "Garanti Var mı?",
    "type": "boolean",
    "value": null,
    "isGlobal": true
  }
]
```

---

#### POST /products/global-fields

Yeni global custom field oluşturur.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "key": "warranty_period",
  "label": "Garanti Süresi (Ay)",
  "type": "number",
  "options": null  // Sadece select tipinde gerekli
}
```

**Response:** `200 OK` (Created global field)

---

#### PUT /products/global-fields/:key

Global custom field'ı günceller.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "label": "Garanti Süresi (Yıl)",
  "type": "number",
  "options": null
}
```

**Response:** `200 OK` (Updated global field)

---

#### DELETE /products/global-fields/:key

Global custom field'ı siler.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Not:** Global field silindiğinde, bu field'ı kullanan tüm ürünlerden de kaldırılmalı.

---

### Products API'sinde Custom Fields

#### Product Response'a Custom Fields Eklenmeli:

```json
{
  "id": "1",
  "name": "iPhone 14 Pro",
  "sku": "IPH14P",
  "price": 35000,
  "customFields": [
    {
      "key": "warranty_period",
      "label": "Garanti Süresi (Ay)",
      "type": "number",
      "value": 12,
      "isGlobal": true
    },
    {
      "key": "brand",
      "label": "Marka",
      "type": "select",
      "value": "apple",
      "options": [
        { "label": "Apple", "value": "apple" },
        { "label": "Samsung", "value": "samsung" }
      ],
      "isGlobal": true
    },
    {
      "key": "custom_note",
      "label": "Özel Not",
      "type": "text",
      "value": "Bu ürün özel indirimde",
      "isGlobal": false
    }
  ]
}
```

#### POST /stock veya PUT /stock/:id Request'inde Custom Fields:

**Request:**
```json
{
  "name": "iPhone 14 Pro",
  "price": 35000,
  "customFields": [
    {
      "key": "warranty_period",
      "value": 12,
      "isGlobal": true  // Global field kullanılıyor, mevcut olmalı
    },
    {
      "key": "brand",
      "value": "apple",
      "isGlobal": true  // Global field kullanılıyor, mevcut olmalı
    },
    {
      "key": "custom_note",
      "label": "Özel Not",
      "value": "Bu ürün özel indirimde",
      "isGlobal": false  // Yeni product-specific field
    }
  ]
}
```

---

### Database Yapısı

#### Global Custom Fields Table

```sql
CREATE TABLE product_global_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL,
    type ENUM('text', 'number', 'date', 'select', 'boolean') NOT NULL,
    options JSON,                    -- Sadece select tipinde
    owner_id INT,                    -- Owner bazlı olabilir (null: tüm owner'lar için)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Not:** `owner_id` null ise, global field tüm owner'lar için geçerlidir. Belirli bir owner_id varsa, sadece o owner'ın ürünlerinde kullanılabilir.

#### Product Custom Fields (Many-to-Many)

```sql
CREATE TABLE product_custom_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,  -- Global field key veya product-specific key
    label VARCHAR(200),                -- Product-specific için label
    type VARCHAR(20),                  -- Product-specific için type (default: text)
    value JSON NOT NULL,               -- Field value (herhangi bir tip olabilir)
    is_global BOOLEAN DEFAULT FALSE,   -- Global field mı yoksa product-specific mi?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_field (product_id, field_key)
);
```

**Not:** 
- Eğer `is_global = true` ise, `field_key` `product_global_fields` tablosunda olmalı ve `label` ve `type` global field'dan alınır
- Eğer `is_global = false` ise, `label` ve `type` bu tabloda saklanır (product-specific field)

---

## Expense Types, Revenue Types & Income Types (User Custom Types)

Kullanıcılar kendi expense type, revenue type ve income type'larını oluşturabilir. Bu türler owner bazlıdır.

### Expense Types API

#### GET /expense-types

Tüm expense type'ları listeler (owner bazlı filtreleme yapılır).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
[
  {
    "id": "1",
    "name": "Kira",
    "ownerId": 2
  },
  {
    "id": "2",
    "name": "Elektrik",
    "ownerId": 2
  },
  {
    "id": "15",
    "name": "Özel Gider Türü",
    "ownerId": 2
  }
]
```

**Not:** Response'ta owner'a ait tüm expense type'lar döner (sistem default + user created).

---

#### POST /expense-types

Yeni expense type oluşturur.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Özel Gider Türü"
}
```

**Response:** `200 OK`
```json
{
  "id": "16",
  "name": "Özel Gider Türü",
  "ownerId": 2
}
```

---

#### PUT /expense-types/:id

Expense type'ı günceller.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Güncellenmiş Gider Türü"
}
```

**Response:** `200 OK` (Updated expense type)

---

#### DELETE /expense-types/:id

Expense type'ı siler.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Not:** Eğer expense type kullanılmışsa (expenses tablosunda referans varsa), silinememeli veya soft delete yapılmalı.

---

#### GET /expense-types/stats

Expense type istatistiklerini döner.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "totalTypes": 15,
  "totalExpenseAmount": 125000
}
```

---

### Revenue Types API

**Not:** Revenue type'lar için aynı endpoint'ler kullanılır, ancak `/revenue-types` path'i kullanılır. Revenue Types, Revenue modülü için gelir türlerini temsil eder.

#### GET /revenue-types

Tüm revenue type'ları listeler (owner bazlı filtreleme yapılır).

**Response:** `200 OK`
```json
[
  {
    "id": "1",
    "name": "Nakit Gelir",
    "ownerId": 2
  },
  {
    "id": "2",
    "name": "Kredi Kartı Geliri",
    "ownerId": 2
  },
  {
    "id": "8",
    "name": "Özel Gelir Türü",
    "ownerId": 2
  }
]
```

---

#### POST /revenue-types

Yeni revenue type oluşturur.

**Request:**
```json
{
  "name": "Özel Gelir Türü"
}
```

**Response:** `200 OK`
```json
{
  "id": "9",
  "name": "Özel Gelir Türü",
  "ownerId": 2
}
```

---

#### PUT /revenue-types/:id

Revenue type'ı günceller.

**Request:**
```json
{
  "name": "Güncellenmiş Gelir Türü"
}
```

**Response:** `200 OK` (Updated revenue type)

---

#### DELETE /revenue-types/:id

Revenue type'ı siler.

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

#### GET /revenue-types/stats

Revenue type istatistiklerini döner.

**Response:** `200 OK`
```json
{
  "totalTypes": 8,
  "totalRevenueAmount": 250000
}
```

---

### Income Types API

**Not:** Income type'lar için aynı endpoint'ler kullanılır, ancak `/income-types` path'i kullanılır. Income Types, Income modülü için gelir türlerini temsil eder (Revenue modülünden bağımsız).

#### GET /income-types

Tüm income type'ları listeler (owner bazlı filtreleme yapılır).

**Response:** `200 OK`
```json
[
  {
    "id": "1",
    "name": "Nakit Gelir",
    "ownerId": 2
  },
  {
    "id": "2",
    "name": "Kredi Kartı Geliri",
    "ownerId": 2
  },
  {
    "id": "8",
    "name": "Özel Gelir Türü",
    "ownerId": 2
  }
]
```

---

#### POST /income-types

Yeni income type oluşturur.

**Request:**
```json
{
  "name": "Özel Gelir Türü"
}
```

**Response:** `200 OK`
```json
{
  "id": "9",
  "name": "Özel Gelir Türü",
  "ownerId": 2
}
```

---

#### PUT /income-types/:id

Income type'ı günceller.

**Request:**
```json
{
  "name": "Güncellenmiş Gelir Türü"
}
```

**Response:** `200 OK` (Updated income type)

---

#### DELETE /income-types/:id

Income type'ı siler.

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

#### GET /income-types/stats

Income type istatistiklerini döner.

**Response:** `200 OK`
```json
{
  "totalTypes": 8,
  "totalIncomeAmount": 250000
}
```

---

### Database Yapısı

#### Expense Types Table

```sql
CREATE TABLE expense_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    owner_id INT,                    -- null: sistem default, INT: owner'a özel
    is_system_default BOOLEAN DEFAULT FALSE,  -- Sistem default mu?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_owner_type (owner_id, name)  -- Aynı owner için aynı isim olamaz
);
```

#### Revenue Types Table

```sql
CREATE TABLE revenue_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    owner_id INT,                    -- null: sistem default, INT: owner'a özel
    is_system_default BOOLEAN DEFAULT FALSE,  -- Sistem default mu?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_owner_type (owner_id, name)
);
```

#### Income Types Table

```sql
CREATE TABLE income_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    owner_id INT,                    -- null: sistem default, INT: owner'a özel
    is_system_default BOOLEAN DEFAULT FALSE,  -- Sistem default mu?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_owner_type (owner_id, name)
);
```

**Not:** 
- `owner_id = null` ve `is_system_default = true` olanlar tüm owner'lar için görünür
- `owner_id = X` olanlar sadece o owner'a özeldir
- Owner kendi type'larını oluşturabilir, düzenleyebilir ve silebilir
- Revenue Types ve Income Types farklı modüller için ayrı tablolarda saklanır

---

## Accounting System (Muhasebe Sistemi)

Sistem, bir muhasebe programı gibi çalışarak dükkanın tüm finansal işlemlerini takip eder.

### İşlem Türleri

1. **Alış (Purchase):** Ürün tedarikçiden alınır
2. **Satış (Sale):** Ürün müşteriye satılır
3. **Gelir (Revenue):** Nakit girişi (satışlardan otomatik veya manuel)
4. **Gider (Expense):** Nakit çıkışı (ürün alımından otomatik, maaş, manuel giderler)

### Muhasebe Hesaplamaları

#### 1. Toplam Gelir (Total Revenue)
```
Total Revenue = Sales Revenue (Tamamlanan satışların toplamı) + Manual Revenue
```

#### 2. Toplam Gider (Total Expense)
```
Total Expense = Product Purchase Cost (Ürün alım maliyetleri) + Employee Salaries + Manual Expenses
```

#### 3. Net Kar (Net Profit)
```
Net Profit = Total Revenue - Total Expense
```

#### 4. Stok Değeri (Stock Value)
```
Stock Value = SUM(product.stock * product.price)
```

#### 5. Dönen Varlıklar (Current Assets)
```
Current Assets = Cash + Stock Value + Accounts Receivable
```

### Accounting Reports API

#### GET /accounting/summary

Dükkanın finansal özetini döner.

**Query Parameters:**
- `period`: "day" | "week" | "month" | "year" | "all" (default: "all")
- `startDate`: string (YYYY-MM-DD, optional)
- `endDate`: string (YYYY-MM-DD, optional)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "period": "month",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "revenue": {
    "totalRevenue": 250000,
    "salesRevenue": 200000,        // Tamamlanan satışlardan
    "manualRevenue": 50000         // Manuel eklenen gelirler
  },
  "expenses": {
    "totalExpenses": 150000,
    "productPurchaseCost": 100000,  // Ürün alım maliyetleri
    "employeeSalaries": 30000,      // Çalışan maaşları
    "manualExpenses": 20000         // Manuel eklenen giderler
  },
  "profit": {
    "netProfit": 100000,
    "profitMargin": 40.0            // (Net Profit / Total Revenue) * 100
  },
  "stock": {
    "totalStockValue": 500000,
    "totalProducts": 40,
    "lowStockItems": 5
  },
  "cashflow": {
    "openingBalance": 100000,        // Dönem başı bakiye
    "closingBalance": 200000,        // Dönem sonu bakiye
    "netCashflow": 100000           // Net nakit akışı
  }
}
```

---

#### GET /accounting/detailed-report

Detaylı muhasebe raporu.

**Query Parameters:**
- `period`: "day" | "week" | "month" | "year" | "all"
- `startDate`: string (YYYY-MM-DD)
- `endDate`: string (YYYY-MM-DD)
- `includeTransactions`: boolean (default: false)

**Response:** `200 OK`
```json
{
  "period": "month",
  "summary": {
    // Accounting summary object
  },
  "transactions": [
    {
      "id": "1",
      "type": "sale",
      "date": "2025-01-15",
      "amount": 35000,
      "description": "Satış: iPhone 14 Pro - Ahmet Usta"
    },
    {
      "id": "2",
      "type": "expense",
      "date": "2025-01-10",
      "amount": 24500,
      "description": "Ürün Alımı: iPhone 14 Pro (10 adet)"
    }
  ]
}
```

---

#### GET /accounting/balance-sheet

Bilanço (Balance Sheet).

**Query Parameters:**
- `date`: string (YYYY-MM-DD, default: bugün)

**Response:** `200 OK`
```json
{
  "date": "2025-01-31",
  "assets": {
    "currentAssets": {
      "cash": 200000,
      "stock": 500000,
      "accountsReceivable": 50000,
      "total": 750000
    },
    "fixedAssets": {
      "equipment": 100000,
      "total": 100000
    },
    "totalAssets": 850000
  },
  "liabilities": {
    "currentLiabilities": {
      "accountsPayable": 30000,
      "salariesPayable": 25000,
      "total": 55000
    },
    "totalLiabilities": 55000
  },
  "equity": {
    "capital": 500000,
    "retainedEarnings": 295000,
    "total": 795000
  },
  "totalLiabilitiesAndEquity": 850000
}
```

---

#### GET /accounting/profit-loss

Kar/Zarar (Profit & Loss) raporu.

**Query Parameters:**
- `period`: "day" | "week" | "month" | "year" | "all"
- `startDate`: string (YYYY-MM-DD)
- `endDate`: string (YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "period": "month",
  "revenue": {
    "sales": 200000,
    "manualRevenue": 50000,
    "total": 250000
  },
  "costOfGoodsSold": {
    "productPurchases": 100000,
    "total": 100000
  },
  "grossProfit": 150000,
  "operatingExpenses": {
    "salaries": 30000,
    "manualExpenses": 20000,
    "total": 50000
  },
  "netProfit": 100000,
  "profitMargin": 40.0
}
```

---

### Accounting Transaction Types

Tüm finansal işlemler transaction olarak kaydedilir:

```typescript
interface AccountingTransaction {
  id: string;
  type: 'sale' | 'purchase' | 'revenue' | 'expense' | 'salary' | 'adjustment';
  date: string;
  amount: number;
  description: string;
  relatedEntityId?: string;      // Sale ID, Purchase ID, Expense ID, etc.
  relatedEntityType?: string;     // 'sale', 'purchase', 'expense', etc.
  ownerId: number;
  createdAt: string;
}
```

### Database Yapısı

#### Accounting Transactions Table

```sql
CREATE TABLE accounting_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('sale', 'purchase', 'revenue', 'expense', 'salary', 'adjustment') NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(500),
    related_entity_id VARCHAR(50),
    related_entity_type VARCHAR(50),
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_owner_date (owner_id, date),
    INDEX idx_type (type),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Not:** 
- Her satış, alış, gelir, gider transaction olarak kaydedilir
- Sistem tarafından otomatik oluşturulan transaction'lar (satışlardan gelir, ürün alımlarından gider) `is_system_generated = true` olarak işaretlenir
- Manuel transaction'lar kullanıcı tarafından oluşturulur

---

## Permission Groups (Yetki Grupları)

Staff'lara permission atarken, önceden tanımlanmış permission grupları kullanılabilir. Bu gruplar, benzer yetkilere sahip staff'ları hızlıca yönetmeyi sağlar.

### Permission Group Yapısı

```typescript
interface PermissionGroup {
  id: string;
  name: string;                    // "Arabalı Satıcı", "Dükkan Çalışanı", etc.
  description?: string;
  permissions: Record<string, PermissionDetail>;  // Module bazlı permissions
  ownerId?: number;               // null: sistem default, INT: owner'a özel
  isSystemDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Permission Groups API

#### GET /staff-permission-groups

Tüm permission group'ları listeler.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
[
  {
    "id": "1",
    "name": "Arabalı Satıcı",
    "description": "Dışarıda satış yapan çalışanlar için",
    "permissions": {
      "sales": {
        "actions": ["view", "create", "edit"],
        "fields": ["category", "price"],
        "notifications": []
      },
      "customers": {
        "actions": ["view", "create"],
        "fields": ["group", "phone"],
        "notifications": []
      },
      "reports": {
        "actions": ["view"],
        "fields": [],
        "notifications": []
      }
    },
    "ownerId": 2,
    "isSystemDefault": false
  },
  {
    "id": "2",
    "name": "Dükkan Çalışanı",
    "description": "Dükkan içinde çalışan personel için",
    "permissions": {
      "sales": {
        "actions": ["view", "create"],
        "fields": ["category", "price"],
        "notifications": []
      },
      "customers": {
        "actions": ["view"],
        "fields": ["group"],
        "notifications": []
      },
      "stock": {
        "actions": ["view"],
        "fields": [],
        "notifications": ["lowStock"]
      }
    },
    "ownerId": 2,
    "isSystemDefault": false
  }
]
```

---

#### GET /staff-permission-groups/:id

Belirli bir permission group'u döner.

**Response:** `200 OK` (Single PermissionGroup object)

---

#### POST /staff-permission-groups

Yeni permission group oluşturur.

**Request:**
```json
{
  "name": "Arabalı Satıcı",
  "description": "Dışarıda satış yapan çalışanlar için",
  "permissions": {
    "sales": {
      "actions": ["view", "create", "edit"],
      "fields": ["category", "price"],
      "notifications": []
    },
    "customers": {
      "actions": ["view", "create"],
      "fields": ["group", "phone"],
      "notifications": []
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "3",
  "name": "Arabalı Satıcı",
  "description": "Dışarıda satış yapan çalışanlar için",
  "permissions": {
    // ... permissions object
  },
  "ownerId": 2,
  "isSystemDefault": false,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

---

#### PUT /staff-permission-groups/:id

Permission group'u günceller.

**Request:**
```json
{
  "name": "Güncellenmiş Arabalı Satıcı",
  "permissions": {
    // ... updated permissions
  }
}
```

**Response:** `200 OK` (Updated PermissionGroup)

---

#### DELETE /staff-permission-groups/:id

Permission group'u siler.

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

#### POST /employees/:id/apply-permission-group

Employee'ye permission group'u uygular (hızlıca permission atar).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "permissionGroupId": "string | number"
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "employeeId": "string | number",
    "appliedGroup": {
      "id": "string | number",
      "name": "string"
    },
    "customPermissions": {
      "moduleName": {
        "actions": ["string"],
        "fields": ["string"],
        "notifications": ["string"]
      }
    }
  }
}
```

**Not:** Bu endpoint, permission group'daki permission'ları employee'nin `customPermissions` field'ına kopyalar (merge eder, replace etmez).

---

### Database Yapısı

#### Permission Groups Table

```sql
CREATE TABLE permission_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    permissions JSON NOT NULL,      -- Module bazlı permissions
    owner_id INT,                   -- null: sistem default, INT: owner'a özel
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_owner_group (owner_id, name)  -- Aynı owner için aynı isim olamaz
);
```

**Not:**
- `owner_id = null` ve `is_system_default = true` olanlar tüm owner'lar için görünür
- `owner_id = X` olanlar sadece o owner'a özeldir
- Owner kendi permission group'larını oluşturabilir, düzenleyebilir ve silebilir

---

## Roles & Packages APIs

### GET /roles

Tüm rolleri listeler.

**Response:** `200 OK`
```json
[
  {
    "id": "admin",
    "name": "Administrator",
    "description": "Full system access"
  },
  {
    "id": "owner",
    "name": "Business Owner",
    "description": "Business owner with full access to own data"
  },
  {
    "id": "staff",
    "name": "Staff Member",
    "description": "Staff member with limited access"
  }
]
```

---

### GET /packages

Tüm paketleri listeler.

**Response:** `200 OK`
```json
[
  {
    "id": "free",
    "name": "Free Plan",
    "description": "Basic features",
    "price": 0.00
  },
  {
    "id": "premium",
    "name": "Premium Plan",
    "description": "Advanced features",
    "price": 99.99
  },
  {
    "id": "gold",
    "name": "Gold Plan",
    "description": "All features",
    "price": 199.99
  }
]
```

## Verification APIs

### POST /verification/tc/verify

TC Kimlik doğrulama endpoint'i.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "tcNo": "string (11 digits)",
  "birthDate": "string (YYYY-MM-DD)",
  "fullName": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "valid": "boolean",
    "tcNo": "string",
    "firstName": "string (optional)",
    "lastName": "string (optional)",
    "birthDate": "string (optional, YYYY-MM-DD)",
    "gender": "M | F (optional)",
    "message": "string (optional)"
  }
}
```

**Not:** 
- TC Kimlik doğrulama sonuçları cache'lenir
- Cache key: `tc_{tcNo}_{birthDate}_{fullName}` formatında
- Cache süresi: 24 saat

---

### POST /verification/imei/verify

IMEI doğrulama endpoint'i.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "imei": "string (15 digits)",
  "brand": "string (optional)",
  "model": "string (optional)",
  "serialNumber": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "valid": "boolean",
    "imei": "string",
    "brand": "string (optional)",
    "model": "string (optional)",
    "serialNumber": "string (optional)",
    "status": "active | stolen | blocked | unknown (optional)",
    "message": "string (optional)"
  }
}
```

**Not:** 
- IMEI doğrulama sonuçları cache'lenir
- Cache key: `imei_{imei}` formatında
- Cache süresi: 7 gün

---

## Stock Alert Settings APIs

### GET /stock/alert-settings

Stok uyarı ayarlarını getirir.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "enabled": "boolean",
    "threshold": "number",
    "reminderFrequency": "daily | weekly | monthly",
    "reminderLimit": "number"
  }
}
```

**Not:** Owner bazlı filtreleme yapılır (her owner'ın kendi ayarları vardır).

---

### PUT /stock/alert-settings

Stok uyarı ayarlarını günceller.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "enabled": "boolean",
  "threshold": "number",
  "reminderFrequency": "daily | weekly | monthly",
  "reminderLimit": "number"
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "enabled": "boolean",
    "threshold": "number",
    "reminderFrequency": "daily | weekly | monthly",
    "reminderLimit": "number"
  }
}
```

---

## Employee Verification Settings APIs

### GET /employees/verification-settings

Çalışan doğrulama ayarlarını getirir (TC Kimlik ve IMEI doğrulama).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "tcVerificationEnabled": "boolean",
    "imeiVerificationEnabled": "boolean"
  }
}
```

**Not:** Owner bazlı filtreleme yapılır (her owner'ın kendi ayarları vardır).

---

### PUT /employees/verification-settings

Çalışan doğrulama ayarlarını günceller.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "tcVerificationEnabled": "boolean",
  "imeiVerificationEnabled": "boolean"
}
```

**Response:** `200 OK`
```json
{
  "message": "OperationSuccessful",
  "data": {
    "tcVerificationEnabled": "boolean",
    "imeiVerificationEnabled": "boolean"
  }
}
```

**Son Not:** Bu dokümantasyon, mock servis yapısına göre hazırlanmıştır. Backend implementasyonunda bazı field'lar opsiyonel olabilir veya ek validasyonlar gerekebilir. Mock service kodunu (`src/shared/services/mockService.ts`) referans olarak kullanabilirsiniz.
