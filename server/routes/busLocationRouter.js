
import express from 'express';
import BusLocation from '../models/BusLocation.js';
import RideSession from '../models/RideSession.js';

const router = express.Router();

// Update bus location (for admin/driver)
router.post('/update', async (req, res) => {
  try {
    const { busId, busName, location, speed, heading, accuracy, driverId } = req.body;
    
    if (!busId || !location || !location.lat || !location.lng) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let busLocation = await BusLocation.findOne({ busId });
    
    if (!busLocation) {
      // Create new bus location record
      busLocation = new BusLocation({
        busId,
        busName: busName || `Bus ${busId}`,
        location: {
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lng)
        },
        speed: speed || 0,
        heading: heading || 0,
        accuracy: accuracy || null,
        driverId: driverId || null,
        activeRides: []
      });
    } else {
      // Update existing location
      await busLocation.updateLocation(
        parseFloat(location.lat),
        parseFloat(location.lng),
        speed || 0,
        heading || 0,
        accuracy || null
      );
      
      if (driverId) busLocation.driverId = driverId;
    }
    
    await busLocation.save();
    
    // Update bus path for all active rides on this bus
    const activeRides = await RideSession.find({ 
      busId, 
      status: 'active' 
    });
    
    const locationPoint = {
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lng),
      timestamp: new Date(),
      speed: speed || 0,
      heading: heading || 0,
      accuracy: accuracy || null
    };
    
    // Add this location to the bus path of all active rides
    for (let ride of activeRides) {
      ride.busPath.push(locationPoint);
      await ride.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Bus location updated',
      location: busLocation.location,
      activeRidesCount: activeRides.length
    });
  } catch (error) {
    console.error('Error updating bus location:', error);
    res.status(500).json({ error: 'Failed to update bus location' });
  }
});

// Get all bus locations
router.get('/all', async (req, res) => {
  try {
    const busLocations = await BusLocation.find({ 
      isActive: true,
      lastUpdated: { $gte: new Date(Date.now() - 600000) } // Last 10 minutes
    }).sort({ lastUpdated: -1 });
    
    res.json(busLocations);
  } catch (error) {
    console.error('Error getting bus locations:', error);
    res.status(500).json({ error: 'Failed to get bus locations' });
  }
});

// Get specific bus location
router.get('/:busId', async (req, res) => {
  try {
    const { busId } = req.params;
    
    const busLocation = await BusLocation.findOne({ 
      busId,
      isActive: true 
    });
    
    if (!busLocation) {
      return res.status(404).json({ error: 'Bus location not found' });
    }
    
    // Get active rides on this bus
    const activeRides = await RideSession.find({ 
      busId, 
      status: 'active' 
    }).select('rideId userName startTime');
    
    res.json({
      ...busLocation.toObject(),
      activeRides
    });
  } catch (error) {
    console.error('Error getting bus location:', error);
    res.status(500).json({ error: 'Failed to get bus location' });
  }
});

// Get nearby buses
router.post('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    const nearbyBuses = await BusLocation.findNearby(
      parseFloat(lat), 
      parseFloat(lng), 
      parseFloat(radius)
    );
    
    res.json(nearbyBuses);
  } catch (error) {
    console.error('Error finding nearby buses:', error);
    res.status(500).json({ error: 'Failed to find nearby buses' });
  }
});

// Set bus as inactive
router.post('/:busId/deactivate', async (req, res) => {
  try {
    const { busId } = req.params;
    
    const busLocation = await BusLocation.findOne({ busId });
    
    if (!busLocation) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    busLocation.isActive = false;
    await busLocation.save();
    
    res.json({ success: true, message: 'Bus deactivated' });
  } catch (error) {
    console.error('Error deactivating bus:', error);
    res.status(500).json({ error: 'Failed to deactivate bus' });
  }
});

export default router;
