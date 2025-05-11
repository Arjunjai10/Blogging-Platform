@echo off
echo Starting Backend Server on Network...
set HOST=192.168.45.44
set PORT=5000
set MONGODB_URI=mongodb+srv://Arjun:arjun@blog.sprt0x7.mongodb.net/
set JWT_SECRET=4e7c89a1b3d5f2e0h6i8j7k9l1m3n5o7p9q0r2s4t6u8v0w2y4z6

node server.js
