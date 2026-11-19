# ShopSmart — Vulnerable Demo App

> **⚠️ WARNING:** This application is **intentionally insecure**. It is designed as a target for security scanning tools (e.g. `pip-audit`, CodeGuard). **Never deploy to production.**

---

## Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Frontend | React 18 + Vite + React Router + Axios |
| Backend  | Flask 1.0 + SQLite              |
| Infra    | Docker Compose                  |

---

## Quick Start

```bash
podman compose up --build
```

> **Podman note:** `podman compose` is a drop-in replacement for `docker compose`.
> Install it with:
> ```bash
> pip install podman-compose   # or: sudo dnf install podman-compose
> ```
> You may also need to log in to the Red Hat registry once (free account):
> ```bash
> podman login registry.redhat.io
> ```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000       |
| Backend  | http://localhost:5000       |

---

## Demo Flow

```
Search Product  →  Add To Cart  →  Update Quantity
     →  Checkout  →  View Orders  →  Admin YAML Import
```

1. Open **http://localhost:3000**
2. Browse or search for a product on `/products`
3. Click **Add to Cart**, adjust quantities on `/cart`
4. Proceed to **Checkout** — fill name + email → Place Order
5. View placed orders on `/orders`
6. Go to `/admin` → paste YAML → **Import Products**

---

## Pages

| Route           | Description               |
|-----------------|---------------------------|
| `/`             | Home / featured products  |
| `/products`     | Browse, search, filter    |
| `/product/:id`  | Product detail            |
| `/cart`         | Cart management           |
| `/checkout`     | Checkout form             |
| `/orders`       | Order history             |
| `/wishlist`     | Saved wishlist            |
| `/admin`        | YAML product import       |

---

## Seed Data

- **20 products** across 7 categories: Electronics, Footwear, Sports, Kitchen, Bags, Home, Accessories, Stationery
- **5 sample orders** pre-loaded on first boot

---

## Intentional Vulnerabilities

### 1. Unsafe YAML Deserialization (Critical)
```python
# backend/app.py  — POST /api/admin/import
data = yaml.load(raw)          # ← should be yaml.safe_load()
```
Exploitable with a crafted YAML payload containing `!!python/object/apply`.

### 2. SQL Injection (High)
```python
# backend/app.py  — GET /api/products?search=
sql = f"SELECT * FROM products WHERE name LIKE '%{search}%'"
```
Example: `?search=' OR '1'='1`

### 3. Flask Debug Mode (Medium)
```python
app.run(debug=True, port=5000)   # exposes Werkzeug interactive debugger
```

### 4. Hardcoded Secret Key (High)
```python
app.config['SECRET_KEY'] = 'demo-super-secret-key'
```

### 5. Vulnerable Dependencies (High / Medium)

```
Flask==1.0          CVE-2018-1000656 (DoS via malformed JSON)
Jinja2==2.10        CVE-2019-10906  (sandbox escape)
PyYAML==5.1         CVE-2020-14343  (arbitrary code exec)
requests==2.19.1    CVE-2018-18074  (credential leak via redirect)
urllib3==1.23       CVE-2018-20060  (header injection)
```

---

## Scanning for Vulnerabilities

```bash
# Option A — run inside the backend container:
podman exec -it shopsmart-backend pip-audit -r /app/requirements.txt

# Option B — run locally in a venv:
pip install pip-audit
pip-audit -r shopsmart/backend/requirements.txt
```

Expected output — multiple HIGH/CRITICAL findings matching the pinned versions above.

---

## Project Structure

```
shopsmart/
├── backend/
│   ├── app.py              # Flask application (all routes + intentional vulns)
│   ├── requirements.txt    # Pinned vulnerable dependencies
│   ├── entrypoint.sh       # DB init + flask run
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── context/
│   │   │   ├── CartContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProductCard.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Products.jsx
│   │       ├── ProductDetail.jsx
│   │       ├── Cart.jsx
│   │       ├── Checkout.jsx
│   │       ├── Orders.jsx
│   │       ├── Wishlist.jsx
│   │       └── Admin.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```
