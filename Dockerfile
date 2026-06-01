# ===================================
# BACKEND STAGE
# ===================================
FROM python:3.11.4-slim-buster AS backend

WORKDIR /app/backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY apps/backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy backend code
COPY apps/backend/ .

# Create entrypoint script
RUN echo '#!/bin/sh\n\
python manage.py migrate --noinput\n\
if [ "$DJANGO_ENV" = "production" ]; then\n\
    gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4\n\
else\n\
    python manage.py runserver 0.0.0.0:8000\n\
fi' > entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]


# ===================================
# FRONTEND BUILD STAGE
# ===================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY apps/frontend/ .

# Build the app
RUN pnpm run build


# ===================================
# FRONTEND PRODUCTION STAGE
# ===================================
FROM nginx:alpine AS frontend

# Copy built files from builder stage
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


# ===================================
# DEVELOPMENT BACKEND (with hot reload)
# ===================================
FROM python:3.11.4-slim-buster AS backend-dev

WORKDIR /app/backend

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY apps/backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# ===================================
# DEVELOPMENT FRONTEND
# ===================================
FROM node:18-alpine AS frontend-dev

WORKDIR /app/frontend

RUN npm install -g pnpm

COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml* ./
RUN pnpm install

CMD ["pnpm", "run", "dev"]