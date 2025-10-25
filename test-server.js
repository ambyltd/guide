const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// CORS simple
app.use(cors({
  origin: ['http://localhost:8100', 'http://localhost:3000']
}));

app.use(express.json());

// Route test simple
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Test server running',
    timestamp: new Date().toISOString()
  });
});

// Route attractions mockée
app.get('/api/attractions', (req, res) => {
  console.log('GET /api/attractions appelé avec query:', req.query);
  
  const mockAttractions = [
    {
      _id: '1',
      name: 'Basilique Notre-Dame de la Paix',
      description: 'La plus grande basilique au monde',
      category: 'Monument',
      location: {
        type: 'Point',
        coordinates: [-5.2893, 6.8203]
      },
      images: ['https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800'],
      rating: 4.8,
      active: true
    },
    {
      _id: '2', 
      name: 'Parc National de Taï',
      description: 'Forêt primaire classée UNESCO',
      category: 'Nature',
      location: {
        type: 'Point',
        coordinates: [-7.3520, 5.8450]
      },
      images: ['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800'],
      rating: 4.9,
      active: true
    }
  ];

  res.json({
    success: true,
    data: mockAttractions,
    count: mockAttractions.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📡 Test: http://localhost:${PORT}/api/attractions`);
});