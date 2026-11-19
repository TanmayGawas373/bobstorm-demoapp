import sqlite3
import os
import yaml
from flask import Flask, request, jsonify, g
from flask_cors import CORS

# Hardcoded secret key (intentional vulnerability)
app = Flask(__name__)
app.config['SECRET_KEY'] = 'demo-super-secret-key'
CORS(app)

DATABASE = '/data/shopsmart.db'

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    cur = db.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS products (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT NOT NULL,
            category  TEXT NOT NULL,
            price     REAL NOT NULL,
            image     TEXT,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS orders (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            customer   TEXT NOT NULL,
            email      TEXT NOT NULL,
            total      REAL NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id   INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity   INTEGER NOT NULL,
            price      REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS wishlist (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL UNIQUE
        );
    """)

    # Seed products if empty
    count = db.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if count == 0:
        products = [
            ("Wireless Headphones",     "Electronics",   79.99,  "https://picsum.photos/seed/p1/300/200",  "Premium over-ear wireless headphones with 30h battery."),
            ("Mechanical Keyboard",     "Electronics",   129.99, "https://picsum.photos/seed/p2/300/200",  "Tactile RGB mechanical keyboard, TKL layout."),
            ("Running Shoes",           "Footwear",      89.99,  "https://picsum.photos/seed/p3/300/200",  "Lightweight breathable running shoes for all terrains."),
            ("Yoga Mat",                "Sports",        34.99,  "https://picsum.photos/seed/p4/300/200",  "Non-slip eco-friendly 6mm yoga mat."),
            ("Stainless Water Bottle",  "Kitchen",       24.99,  "https://picsum.photos/seed/p5/300/200",  "24oz double-walled insulated water bottle."),
            ("Backpack 30L",            "Bags",          59.99,  "https://picsum.photos/seed/p6/300/200",  "Durable 30L daypack with laptop compartment."),
            ("Noise Cancelling Earbuds","Electronics",   49.99,  "https://picsum.photos/seed/p7/300/200",  "True wireless ANC earbuds with 8h playback."),
            ("Desk Lamp LED",           "Home",          39.99,  "https://picsum.photos/seed/p8/300/200",  "Adjustable colour temperature LED desk lamp."),
            ("Coffee Maker",            "Kitchen",       69.99,  "https://picsum.photos/seed/p9/300/200",  "12-cup programmable drip coffee maker."),
            ("Leather Wallet",          "Accessories",   29.99,  "https://picsum.photos/seed/p10/300/200", "Slim RFID-blocking genuine leather wallet."),
            ("Smart Watch",             "Electronics",   199.99, "https://picsum.photos/seed/p11/300/200", "Fitness smart watch with heart-rate & GPS."),
            ("Resistance Bands Set",    "Sports",        19.99,  "https://picsum.photos/seed/p12/300/200", "Set of 5 resistance bands for home workouts."),
            ("Ceramic Mug Set",         "Kitchen",       22.99,  "https://picsum.photos/seed/p13/300/200", "Set of 4 hand-painted 350ml ceramic mugs."),
            ("Sunglasses Polarised",    "Accessories",   44.99,  "https://picsum.photos/seed/p14/300/200", "UV400 polarised wrap-around sunglasses."),
            ("Portable Charger 20000mAh","Electronics",  39.99,  "https://picsum.photos/seed/p15/300/200", "Dual-port 20000mAh power bank with fast charge."),
            ("Hiking Boots",            "Footwear",      119.99, "https://picsum.photos/seed/p16/300/200", "Waterproof mid-cut hiking boots with Vibram sole."),
            ("Throw Blanket",           "Home",          36.99,  "https://picsum.photos/seed/p17/300/200", "Super-soft 150x200cm fleece throw blanket."),
            ("Notebook Set",            "Stationery",    14.99,  "https://picsum.photos/seed/p18/300/200", "Set of 3 ruled A5 hardcover notebooks."),
            ("Dumbbell Pair 10kg",      "Sports",        54.99,  "https://picsum.photos/seed/p19/300/200", "Rubber hex dumbbell pair, 10kg each."),
            ("Canvas Tote Bag",         "Bags",          16.99,  "https://picsum.photos/seed/p20/300/200", "Reusable large canvas tote with inner pocket."),
        ]
        cur.executemany(
            "INSERT INTO products (name, category, price, image, description) VALUES (?,?,?,?,?)",
            products
        )

    # Seed orders if empty
    count = db.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    if count == 0:
        orders = [
            ("Alice Johnson",   "alice@example.com",   159.98),
            ("Bob Smith",       "bob@example.com",     89.99),
            ("Carol White",     "carol@example.com",   229.97),
            ("David Brown",     "david@example.com",   74.98),
            ("Eva Martinez",    "eva@example.com",     199.99),
        ]
        for o in orders:
            cur.execute(
                "INSERT INTO orders (customer, email, total) VALUES (?,?,?)", o
            )
        order_items = [
            (1, 1,  1, 79.99),
            (1, 2,  1, 129.99),  # wait — that's 209.98; keep simple
            (2, 3,  1, 89.99),
            (3, 11, 1, 199.99),
            (3, 10, 1, 29.99),
            (4, 5,  2, 24.99),
            (5, 11, 1, 199.99),
        ]
        cur.executemany(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)",
            order_items
        )

    db.commit()
    db.close()


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

@app.route('/api/products', methods=['GET'])
def get_products():
    db = get_db()
    search   = request.args.get('search', '')
    category = request.args.get('category', '')

    if search:
        # SQL Injection — intentional vulnerability
        sql = f"SELECT * FROM products WHERE name LIKE '%{search}%'"
        rows = db.execute(sql).fetchall()
    elif category:
        rows = db.execute(
            "SELECT * FROM products WHERE category = ?", (category,)
        ).fetchall()
    else:
        rows = db.execute("SELECT * FROM products").fetchall()

    return jsonify([dict(r) for r in rows])


@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    db  = get_db()
    row = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict(row))


@app.route('/api/categories', methods=['GET'])
def get_categories():
    db   = get_db()
    rows = db.execute("SELECT DISTINCT category FROM products ORDER BY category").fetchall()
    return jsonify([r['category'] for r in rows])


# ---------------------------------------------------------------------------
# Cart (server-side session-less — client holds cart, server validates)
# ---------------------------------------------------------------------------

@app.route('/api/cart/validate', methods=['POST'])
def validate_cart():
    """Given a list of {product_id, quantity} items, return enriched items."""
    items = request.get_json() or []
    db    = get_db()
    result = []
    for item in items:
        pid = item.get('product_id')
        qty = item.get('quantity', 1)
        row = db.execute("SELECT * FROM products WHERE id = ?", (pid,)).fetchone()
        if row:
            result.append({**dict(row), 'quantity': qty})
    return jsonify(result)


# ---------------------------------------------------------------------------
# Wishlist
# ---------------------------------------------------------------------------

@app.route('/api/wishlist', methods=['GET'])
def get_wishlist():
    db   = get_db()
    rows = db.execute(
        "SELECT p.* FROM products p JOIN wishlist w ON p.id = w.product_id"
    ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/wishlist', methods=['POST'])
def add_wishlist():
    data       = request.get_json()
    product_id = data.get('product_id')
    db         = get_db()
    try:
        db.execute("INSERT OR IGNORE INTO wishlist (product_id) VALUES (?)", (product_id,))
        db.commit()
        return jsonify({'status': 'added'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/wishlist/<int:product_id>', methods=['DELETE'])
def remove_wishlist(product_id):
    db = get_db()
    db.execute("DELETE FROM wishlist WHERE product_id = ?", (product_id,))
    db.commit()
    return jsonify({'status': 'removed'})


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

@app.route('/api/orders', methods=['GET'])
def get_orders():
    db   = get_db()
    rows = db.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall()
    orders = []
    for o in rows:
        order = dict(o)
        items = db.execute(
            """SELECT oi.*, p.name, p.image
               FROM order_items oi
               JOIN products p ON p.id = oi.product_id
               WHERE oi.order_id = ?""",
            (order['id'],)
        ).fetchall()
        order['items'] = [dict(i) for i in items]
        orders.append(order)
    return jsonify(orders)


@app.route('/api/orders', methods=['POST'])
def create_order():
    data     = request.get_json()
    customer = data.get('customer', 'Guest')
    email    = data.get('email', '')
    items    = data.get('items', [])
    total    = sum(i['price'] * i['quantity'] for i in items)

    db  = get_db()
    cur = db.execute(
        "INSERT INTO orders (customer, email, total) VALUES (?,?,?)",
        (customer, email, total)
    )
    order_id = cur.lastrowid
    for i in items:
        db.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)",
            (order_id, i['product_id'], i['quantity'], i['price'])
        )
    db.commit()
    return jsonify({'order_id': order_id, 'total': total}), 201


# ---------------------------------------------------------------------------
# Admin — YAML import (unsafe deserialization — intentional vulnerability)
# ---------------------------------------------------------------------------

@app.route('/api/admin/import', methods=['POST'])
def admin_import():
    raw = request.data.decode('utf-8')
    # Unsafe YAML load — intentional vulnerability
    data = yaml.load(raw)
    if not isinstance(data, list):
        return jsonify({'error': 'Expected a list of products'}), 400

    db  = get_db()
    inserted = 0
    for p in data:
        db.execute(
            "INSERT INTO products (name, category, price, image, description) VALUES (?,?,?,?,?)",
            (
                p.get('name', 'Unnamed'),
                p.get('category', 'General'),
                float(p.get('price', 0)),
                p.get('image', ''),
                p.get('description', ''),
            )
        )
        inserted += 1
    db.commit()
    return jsonify({'inserted': inserted})


# ---------------------------------------------------------------------------
# Entry point — debug=True (intentional vulnerability)
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    os.makedirs('/data', exist_ok=True)
    init_db()
    app.run(host='0.0.0.0', debug=True, port=5000)
