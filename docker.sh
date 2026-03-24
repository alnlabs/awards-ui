#!/bin/bash

# Set compose file based on APP_ENV
if [ "$APP_ENV" = "prod" ]; then
  COMPOSE_FILE="docker-compose.prod.yml"
else
  COMPOSE_FILE="docker-compose.dev.yml"
fi

echo "🌍 Environment: ${APP_ENV:-dev} (using $COMPOSE_FILE)"

print_help() {
  echo ""
  echo "Usage: ./docker.sh [command]"
  echo ""
  echo "Commands:"
  echo "  init      Initialize environment (.env, install deps)"
  echo "  start     Start container (background)"
  echo "  stop      Stop container"
  echo "  restart   Restart container"
  echo "  logs      View logs"
  echo "  status    Show container status"
  echo "  reset     Stop & remove container + volumes"
  echo ""
}

case "$1" in
  init)
    echo "🚀 Initializing frontend environment..."
    if [ ! -f .env ]; then
      if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
      else
        echo "VITE_API_BASE_URL=http://localhost:4100/api/v1" > .env
        echo "✅ Created default .env"
      fi
    else
      echo "ℹ️  .env already exists"
    fi
    
    # Create docker directory if it doesn't exist (though it should)
    mkdir -p docker
    
    chmod +x docker.sh 2>/dev/null || true
    echo "✅ Setup completed!"
    ;;

  start)
    echo "🚀 Starting frontend container..."
    docker compose -f $COMPOSE_FILE up --build -d
    echo "✅ Started in background"
    echo "💡 URL: http://localhost:4200"
    ;;

  stop)
    echo "🛑 Stopping frontend container..."
    docker compose -f $COMPOSE_FILE down
    echo "✅ Stopped"
    ;;

  restart)
    echo "🔄 Restarting frontend container..."
    docker compose -f $COMPOSE_FILE down
    docker compose -f $COMPOSE_FILE up --build -d
    echo "✅ Restarted"
    ;;

  logs)
    docker compose -f $COMPOSE_FILE logs -f ui
    ;;

  status)
    docker compose -f $COMPOSE_FILE ps
    ;;

  reset)
    echo "⚠️  Removing container and volumes..."
    docker compose -f $COMPOSE_FILE down -v
    echo "✅ Reset completed"
    ;;

  *)
    print_help
    ;;
esac
