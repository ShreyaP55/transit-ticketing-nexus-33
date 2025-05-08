
import express from 'express';
import Station from '../models/Station.js';

const router = express.Router();

// Get all stations
router.get('/', async (req, res) => {
  try {
    const { routeId, busId } = req.query;
    let query = {};
    
    if (routeId) query.routeId = routeId;
    if (busId) query.busId = busId;
    
    const stations = await Station.find(query)
      .populate('routeId')
      .populate('busId');
    
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// Create station
router.post('/', async (req, res) => {
  try {
    const { routeId, busId, name, latitude, longitude, fare, location } = req.body;
    
    if (!routeId || !busId || !name || !latitude || !longitude || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newStation = new Station({
      routeId,
      busId,
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      fare: parseFloat(fare),
      location
    });
    
    await newStation.save();
    res.status(201).json(newStation);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ error: 'Failed to create station' });
  }
});

// Update station
router.put('/:id', async (req, res) => {
  try {
    const { routeId, busId, name, latitude, longitude, fare, location } = req.body;
    
    if (!routeId || !busId || !name || !latitude || !longitude || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const updatedStation = await Station.findByIdAndUpdate(
      req.params.id,
      {
        routeId,
        busId,
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        fare: parseFloat(fare),
        location
      },
      { new: true }
    );
    
    if (!updatedStation) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    res.json(updatedStation);
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(500).json({ error: 'Failed to update station' });
  }
});

// Delete station
router.delete('/:id', async (req, res) => {
  try {
    const deletedStation = await Station.findByIdAndDelete(req.params.id);
    
    if (!deletedStation) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ error: 'Failed to delete station' });
  }
});

export default router;
