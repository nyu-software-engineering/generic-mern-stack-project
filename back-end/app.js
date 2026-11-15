// import and instantiate express
import express from 'express'; // ES module import style
const app = express(); // instantiate an Express object

import initialSavedHotels from './mockData/hotelList.js';

// use express's builtin body-parser middleware to parse any data included in a request
app.use(express.json()); // decode JSON-formatted incoming POST data
app.use(express.urlencoded({ extended: true })); // decode url-encoded incoming POST data

// make 'public' directory publicly readable with static content
app.use('/static', express.static('public'));

//NOTE: Above code is taken from SWE sample/example code from https://github.com/nyu-software-engineering/express-js-starter-app/blob/master/app.js

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
    imageSrc: hotel.imageSrc || '',
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

// export the express app we created to make it available to other modules
export default app;
