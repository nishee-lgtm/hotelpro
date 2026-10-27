# HotelPro – Hotel Management System

A full-stack hotel management web app built with the MERN stack. Guests can browse rooms, book, and pay; admins manage rooms, bookings, check-in and check-out.

## Features
- Register and login with JWT authentication
- Roles: guest, staff, admin
- Browse rooms with availability status
- Book a room for chosen dates, with a date availability check
- My Bookings page with payment
- Admin panel: add, update and delete rooms; check-in, check-out and cancel bookings
- Luxury-themed responsive interface

## Tech Stack
React (Vite), Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt

## Setup

### Requirements
Node.js 16+, MongoDB and Git.

### Backend
```
cd backend
npm install
```
Create a `.env` file inside `backend`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_here
```
Start the server:
```
npm run dev
```

### Frontend
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Creating an admin
Register an account on the site, then open the `users` collection in MongoDB and change that user's `role` to `admin`.

## Author
Nishita Patidar