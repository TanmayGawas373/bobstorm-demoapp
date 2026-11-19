#!/bin/sh
set -e
mkdir -p /data
python -c "
import sys
sys.path.insert(0, '/app')
from app import init_db
init_db()
print('DB initialised.')
"
exec flask run --host=0.0.0.0 --port=5000
