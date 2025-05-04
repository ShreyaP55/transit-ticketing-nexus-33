
// This file would be implemented on the server-side in a real application
// For this demo, we're showing how the API endpoints would be structured

import { getMongoClient } from '../services/mongoConnect';

export async function GET(request) {
  const routeId = new URL(request.url).searchParams.get('routeId');
  
  try {
    const client = getMongoClient();
    const db = client.db();
    const collection = db.collection('buses');
    
    let query = {};
    if (routeId) {
      query.routeId = routeId;
    }
    
    const buses = await collection
      .find(query)
      .populate('routeId')
      .toArray();
      
    return new Response(JSON.stringify(buses), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch buses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, route, capacity } = data;
    
    if (!name || !route || !capacity) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const client = getMongoClient();
    const db = client.db();
    const collection = db.collection('buses');
    
    const result = await collection.insertOne({
      name,
      routeId: route,
      capacity: parseInt(capacity),
      createdAt: new Date()
    });
    
    return new Response(JSON.stringify({
      _id: result.insertedId,
      name,
      route,
      capacity
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating bus:', error);
    return new Response(JSON.stringify({ error: 'Failed to create bus' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, name, route, capacity } = data;
    
    if (!id || !name || !route || !capacity) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const client = getMongoClient();
    const db = client.db();
    const collection = db.collection('buses');
    
    const result = await collection.updateOne(
      { _id: id },
      { $set: {
        name,
        routeId: route,
        capacity: parseInt(capacity),
        updatedAt: new Date()
      }}
    );
    
    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Bus not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      _id: id,
      name,
      route,
      capacity
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating bus:', error);
    return new Response(JSON.stringify({ error: 'Failed to update bus' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request) {
  try {
    const data = await request.json();
    const { id } = data;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing bus ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const client = getMongoClient();
    const db = client.db();
    const collection = db.collection('buses');
    
    const result = await collection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Bus not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ message: 'Bus deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting bus:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete bus' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
