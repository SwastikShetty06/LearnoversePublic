// A simple Express server for the Learnoverse assignment.
// It connects to MongoDB, fetches video IDs, enriches them with YouTube API data,
// and sends the result to the client.

const express = require('express');
const { MongoClient } = require('mongodb');
const axios = require('axios');
require('dotenv').config(); // Loads environment variables from a .env file

const app = express();
const port = 3000;

// Environment variables for sensitive data
const mongoUri = process.env.MONGO_URI;
const youtubeApiKey = process.env.YOUTUBE_API_KEY;

let db;

// Connect to MongoDB once when the server starts
MongoClient.connect(mongoUri)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('learnoverse'); // Use the 'learnoverse' database
  })
  .catch(error => console.error('Failed to connect to MongoDB', error));

// The main endpoint for the client to fetch video data
app.get('/videos', async (req, res) => {
  try {
    // 1. Fetch video IDs from MongoDB
    const videosCollection = db.collection('videos');
    const videoDocs = await videosCollection.find({}).toArray();
    const videoIds = videoDocs.map(doc => doc.videoId).join(',');

    // 2. Enrich with data from YouTube Data API
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${youtubeApiKey}`;
    const response = await axios.get(youtubeApiUrl);
    const youtubeItems = response.data.items;

    // 3. Format the data for the client to match what the app expects
    const enrichedVideos = youtubeItems.map(item => ({
      videoId: item.id, // FIX: Renamed 'id' to 'videoId'
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle, // FIX: Renamed 'channel' to 'channelTitle'
      thumbnail: item.snippet.thumbnails.high.url,
      duration: item.contentDetails.duration, 
    }));

    res.json(enrichedVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

