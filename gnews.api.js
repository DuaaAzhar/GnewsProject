const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const port = 3000;

const apiKey = '00234d65ce4d37d300926ac10768494a';
// Initialize a cache with a TTL (time to live) of 30 minutes
const cache = new NodeCache({ stdTTL: 1800 });

// Find a news article by title or author
app.get('/api/news/find', async (req, res) => {
    const { title, author, keyword } = req.query;

    const field = title ? 'title' : (author ? 'author' : 'keyword');

    const value = title ?? author ?? keyword;

    // Check if data is cached
    const cacheKey = `news-${field}-${value}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json(cachedData);
    }

    // Fetch data from GNews API
    try {
        const response = await axios.get(`https://gnews.io/api/v4/search?q=${value}&apikey=${apiKey}`);

        const articles = response.data.articles;

        // Cache the fetched data
        cache.set(cacheKey, articles);

        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching news articles.' });
    }
});

// Fetch N news articles
app.get('/api/news/:count', async (req, res) => {
    const { count } = req.params;

    // Check if data is cached
    const cacheKey = `news-${count}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json(cachedData);
    }

    // Fetch data from GNews API
    try {
        const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
            params: {
                token: apiKey,
                lang: 'en',
                max: count,
            },
        });

        const articles = response.data.articles;

        // Cache the fetched data
        cache.set(cacheKey, articles);

        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching news articles.' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
