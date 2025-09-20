#!/bin/bash

echo "Starting Crypto Price Alert Assistant..."
echo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Running setup..."
    python3 start.py
    if [ $? -ne 0 ]; then
        echo "Setup failed. Please check the errors above."
        exit 1
    fi
fi

echo "Starting backend server..."
gnome-terminal --title="Backend Server" -- bash -c "source venv/bin/activate && python app.py; exec bash" &

echo "Waiting for backend to start..."
sleep 3

echo "Starting frontend server..."
gnome-terminal --title="Frontend Server" -- bash -c "npm start; exec bash" &

echo
echo "✅ Both servers are starting..."
echo "🌐 Frontend will be available at http://localhost:3000"
echo "🔧 Backend API will be available at http://localhost:5000"
echo
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap 'echo "Stopping servers..."; exit 0' INT
wait
