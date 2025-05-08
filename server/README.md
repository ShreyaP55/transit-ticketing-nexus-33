
# Transit App Backend Server

This is the backend server for the Transit Application.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Start the production server:
   ```
   npm start
   ```

## API Endpoints

### Buses
- GET `/api/buses` - Get all buses
- GET `/api/buses?routeId=123` - Get buses by route ID
- POST `/api/buses` - Create a new bus
- PUT `/api/buses/:id` - Update a bus
- DELETE `/api/buses/:id` - Delete a bus

More endpoints will be added for other resources.
