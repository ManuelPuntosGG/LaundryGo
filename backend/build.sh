#!/usr/bin/env bash
# Exit on error
set -o errexit

# Upgrade pip to ensure latest wheel & metadata compatibility
pip install --upgrade pip

# Install production dependencies
pip install -r requirements/base.txt

# Collect static files into STATIC_ROOT using WhiteNoise
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate

# Seed initial service rates (Standard, Go, GoFurther)
python manage.py seed_service_rates

# Create default admin superuser if not exists
python manage.py create_admin
