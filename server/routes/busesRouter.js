
import express from 'express';
import Bus from '../models/Bus.js';

const router = express.Router();

// Get all buses
router.get('/', async (req, res) => {
  try {
    const { routeId } = req.query;
    
    let query = {};
    if (routeId) {
      query.route = routeId;
    }
    
    const buses = await Bus.find(query).populate('route');
    res.json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ error: 'Failed to fetch buses' });
  }
});

// Create a new bus
router.post('/', async (req, res) => {
  try {
    const { name, route, capacity } = req.body;
    
    if (!name || !route || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newBus = new Bus({
      name,
      route,
      capacity: parseInt(capacity),
    });
    
    await newBus.save();
    
    res.status(201).json(newBus);
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(500).json({ error: 'Failed to create bus' });
  }
});

// Update a bus
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, route, capacity } = req.body;
    
    if (!name || !route || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const updatedBus = await Bus.findByIdAndUpdate(
      id,
      {
        name,
        route,
        capacity: parseInt(capacity),
      },
      { new: true }
    );
    
    if (!updatedBus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    res.json(updatedBus);
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(500).json({ error: 'Failed to update bus' });
  }
});

// Delete a bus
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Bus.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({ error: 'Failed to delete bus' });
  }
});

export default router;
