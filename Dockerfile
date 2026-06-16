# ===================================
# BACKEND (prod + dev via DJANGO_ENV)
# ===================================
FROM python:3.12.13-slim-trixie AS backend

WORKDIR /apps/backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY apps/backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY apps/backend/ .

# Single entrypoint handles both dev and prod via DJANGO_ENV
RUN printf '#!/bin/sh\nset -e\n\
    echo "Running migrations..."\n\
    python manage.py migrate --noinput\n\
    if [ "$DJANGO_ENV" = "production" ]; then\n\
    echo "Collecting static files..."\n\
    python manage.py collectstatic --noinput\n\
    echo "Starting Gunicorn..."\n\
    exec gunicorn core.wsgi:application \\\n\
    --bind 0.0.0.0:8000 \\\n\
    --workers 4 \\\n\
    --timeout 120\n\
    else\n\
    echo "Starting Django development server..."\n\
    exec python manage.py runserver 0.0.0.0:8000\n\
    fi\n' > entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["./entrypoint.sh"]


# ===================================
# FRONTEND BUILD STAGE
# ===================================
FROM node:18-alpine AS frontend-builder

WORKDIR /apps/web-app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web-app/package.json ./apps/web-app/package.json


RUN pnpm install --frozen-lockfile

COPY apps/web-app/ ./apps/web-app/

RUN pnpm run build



# ===================================
# NGINX 
# ===================================
FROM nginx:alpine AS nginx

RUN apk add --no-cache gettext && \
    rm /etc/nginx/conf.d/default.conf

# Copy built React app from builder
COPY --from=frontend-builder /apps/web-app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
