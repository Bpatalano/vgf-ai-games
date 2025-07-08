#!/bin/bash
# Server Manager for AI Starter Kit Games

GAMES_DIR="/Users/shriya/Downloads/ai-starter-kit-main/games"
SERVER_PID_FILE="/Users/shriya/Downloads/ai-starter-kit-main/.server.pid"
SERVER_LOG_FILE="/Users/shriya/Downloads/ai-starter-kit-main/.server.log"

# Function to check if server is running
check_server() {
    if [ -f "$SERVER_PID_FILE" ]; then
        PID=$(cat "$SERVER_PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "✅ Server is running (PID: $PID)"
            echo "🌐 Games available at:"
            echo "   - Dino Run: http://localhost:8080/dino-run/dino-voice-working.html"
            echo "   - Bop-It: http://localhost:8080/bop-it/index.html"
            return 0
        else
            echo "❌ Server PID file exists but process is not running"
            rm -f "$SERVER_PID_FILE"
            return 1
        fi
    else
        echo "❌ Server is not running"
        return 1
    fi
}

# Function to start server
start_server() {
    if check_server > /dev/null 2>&1; then
        echo "⚠️  Server is already running"
        check_server
        return 0
    fi
    
    echo "🚀 Starting server in $GAMES_DIR..."
    cd "$GAMES_DIR"
    
    # Start server in background and capture PID
    nohup python3 -m http.server 8080 > "$SERVER_LOG_FILE" 2>&1 &
    SERVER_PID=$!
    
    # Save PID to file
    echo "$SERVER_PID" > "$SERVER_PID_FILE"
    
    # Wait a moment for server to start
    sleep 2
    
    # Verify server started successfully
    if ps -p "$SERVER_PID" > /dev/null 2>&1; then
        echo "✅ Server started successfully (PID: $SERVER_PID)"
        echo "🌐 Games available at:"
        echo "   - Dino Run: http://localhost:8080/dino-run/dino-voice-working.html"
        echo "   - Bop-It: http://localhost:8080/bop-it/index.html"
        echo "📝 Server logs: $SERVER_LOG_FILE"
    else
        echo "❌ Failed to start server"
        rm -f "$SERVER_PID_FILE"
        return 1
    fi
}

# Function to stop server
stop_server() {
    if [ -f "$SERVER_PID_FILE" ]; then
        PID=$(cat "$SERVER_PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "🛑 Stopping server (PID: $PID)..."
            kill "$PID"
            rm -f "$SERVER_PID_FILE"
            echo "✅ Server stopped"
        else
            echo "❌ Server process not found"
            rm -f "$SERVER_PID_FILE"
        fi
    else
        echo "❌ Server PID file not found"
    fi
}

# Function to restart server
restart_server() {
    echo "🔄 Restarting server..."
    stop_server
    sleep 1
    start_server
}

# Function to show server status and logs
status_server() {
    check_server
    if [ -f "$SERVER_LOG_FILE" ]; then
        echo ""
        echo "📝 Recent server logs:"
        tail -10 "$SERVER_LOG_FILE"
    fi
}

# Main script logic
case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        status_server
        ;;
    check)
        check_server
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|check}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the games server"
        echo "  stop    - Stop the games server"
        echo "  restart - Restart the games server"
        echo "  status  - Show server status and logs"
        echo "  check   - Quick check if server is running"
        echo ""
        echo "Games will be available at:"
        echo "  - Dino Run: http://localhost:8080/dino-run/dino-voice-working.html"
        echo "  - Bop-It: http://localhost:8080/bop-it/index.html"
        exit 1
        ;;
esac