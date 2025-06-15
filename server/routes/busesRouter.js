import express from 'express';
import mongoose from 'mongoose';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';

const router = express.Router();

// Get all buses
router.get('/', async (req, res) => {
  try {
    const { routeId } = req.query;
    
    let query = {};
    if (routeId) {
      query.route = routeId;
    }
    
    const buses = await Bus.find(query);
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
    
    console.log('Creating bus with data:', { name, route, capacity });
    
    if (!name || !route || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate that route is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(route)) {
      return res.status(400).json({ error: 'Invalid route ID format' });
    }

    // Check if route exists
    const existingRoute = await Route.findById(route);
    if (!existingRoute) {
      return res.status(400).json({ error: 'Route not found' });
    }

    // Validate capacity is a positive number
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive number' });
    }
    
    const newBus = new Bus({
      name: name.trim(),
      route: route,
      capacity: capacityNum,
    });
    
    const savedBus = await newBus.save();
    console.log('Bus created successfully:', savedBus);
    
    res.status(201).json(savedBus);
  } catch (error) {
    console.error('Error creating bus:', error);
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ error: `A bus with this ${field} already exists.` });
    }
    
    res.status(500).json({ error: 'Failed to create bus' });
  }
});

// Update a bus
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, route, capacity } = req.body;
    
    console.log('Updating bus with data:', { id, name, route, capacity });
    
    if (!name || !route || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate that id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid bus ID format' });
    }

    // Validate that route is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(route)) {
      return res.status(400).json({ error: 'Invalid route ID format' });
    }

    // Check if route exists
    const existingRoute = await Route.findById(route);
    if (!existingRoute) {
      return res.status(400).json({ error: 'Route not found' });
    }

    // Validate capacity is a positive number
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive number' });
    }
    
    const updatedBus = await Bus.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        route: route,
        capacity: capacityNum,
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedBus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    console.log('Bus updated successfully:', updatedBus);
    res.json(updatedBus);
  } catch (error) {
    console.error('Error updating bus:', error);
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ error: `A bus with this ${field} already exists.` });
    }
    
    res.status(500).json({ error: 'Failed to update bus' });
  }
});

// Delete a bus
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting bus with id:', id);
    
    // Validate that id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid bus ID format' });
    }
    
    const result = await Bus.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    console.log('Bus deleted successfully:', result);
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({ error: 'Failed to delete bus' });
  }
});

export default router;
