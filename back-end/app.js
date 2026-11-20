// import and instantiate express
import express from 'express' // ES module import style
import session from 'express-session'
const app = express() // instantiate an Express object

import initialSavedHotels from './mockData/savedHotels.js';
import stayedHotels from './mockData/stayedHotels.js';

// use express's builtin body-parser middleware to parse any data included in a request
app.use(express.json()); // decode JSON-formatted incoming POST data
app.use(express.urlencoded({ extended: true })); // decode url-encoded incoming POST data

// make 'public' directory publicly readable with static content
app.use('/static', express.static('public'));

//NOTE: Above code is taken from SWE sample/example code from https://github.com/nyu-software-engineering/express-js-starter-app/blob/master/app.js

 // ===== USER AUTHENTICATION =====

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'hotel-planner-local-development-only',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Mock user for development and testing only
const mockUser = {
    id: "1",
    email: "test@hotelplanner.com",
    password: "password123"
};

// Login API
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        });
    }

    if (email !== mockUser.email || password !== mockUser.password) {
        return res.status(401).json({
            error: "Invalid email or password"
        });
    }

    req.session.regenerate((err) => {
        if (err) {
            return res.status(500).json({
                error: "Unable to create login session"
            });
        }

        req.session.userId = mockUser.id;

        return res.json({
            message: "Login successful",
            user: {
                id: mockUser.id,
                email: mockUser.email
            }
        });
    });
});

// Check authentication status
app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    return res.json({
        authenticated: true,
        user: {
            id: mockUser.id,
            email: mockUser.email
        }
    });
});

// Logout API
app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                error: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");
        return res.json({
            message: "Logged out successfully"
        });
    });
});

// ===== USER AUTHENTICATION END =====

// ===== SAVED HOTELS =====

// this is mock data, it is stored in the mock data folder
let savedHotels = initialSavedHotels.map((hotel) => ({ ...hotel }));

app.get('/api/saved', (req, res) => {
  //get all saved hotels
  res.json(savedHotels);
});

app.post('/api/saved', (req, res) => {
  //update hotels in saved list
  const hotel = req.body || {};
  if (!hotel.id || !hotel.name) {
    const body = { error: 'hotel must have an id and name' };
    res.status(400);
    res.json(body);
    return;
  }

  const alreadySaved = savedHotels.find((h) => h.id === String(hotel.id));
  if (alreadySaved) {
    res.json(alreadySaved);
    return;
  }

  const newHotel = {
    id: String(hotel.id),
    name: hotel.name || '',
    location: hotel.location || '',
    date: hotel.date || '',
    description: hotel.description || '',
    imageSrc: hotel.imageSrc || '', //should change this later to match an image source for google places
  };
  savedHotels.push(newHotel);
  res.status(200);
  res.json(newHotel);
});

app.post('/api/saved/:id', (req, res) => {
  //update specific hotel details
  const hotel = savedHotels.find((h) => h.id === req.params.id);
  if (!hotel) {
    const body = { error: 'Saved hotel not found' };
    res.status(404);
    res.json(body);
    return;
  }

  const { description } = req.body || {};
  if (typeof description !== 'string') {
    const body = { error: 'description must be string type' };
    res.status(400);
    res.json(body);
    return;
  }

  hotel.description = description;
  res.json(hotel);
});

app.delete('/api/saved/:id', (req, res) => {
  const hotel = savedHotels.find((h) => h.id === req.params.id);
  if (!hotel) {
    const body = { error: 'Saved hotel not found' };
    res.status(404);
    res.json(body);
    return;
  }

  savedHotels = savedHotels.filter((h) => h.id !== req.params.id);
  const body = { message: 'Deleted', id: req.params.id };
  res.json(body);
});
// ===== SAVED HOTELS END =====

// ===== PROFILE =====
app.get('/api/profile/stays', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "Not authenticated"
    });
  }

  const userStays = stayedHotels.filter((stay) => stay.userId === req.session.userId);
  return res.json(userStays);
});
// ===== PROFILE END =====

// export the express app we created to make it available to other modules
export default app;
