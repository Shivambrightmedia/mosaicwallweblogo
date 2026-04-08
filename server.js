const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the project folder
app.use(express.static(path.join(__dirname)));

/**
 * PROXY API: Handles Cloudinary search to avoid CORS issues
 * This acts as a middleman between the browser and Cloudinary.
 */
app.post('/api/mosaic/search', async (req, res) => {
    try {
        const { cloudName, apiKey, apiSecret, expression } = req.body;

        if (!cloudName || !apiKey || !apiSecret) {
            return res.status(400).json({ error: "Missing Cloudinary credentials." });
        }

        const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;

        console.log(`[Proxy] Fetching resources for cloud: ${cloudName}`);

        const response = await axios.post(url, {
            expression: expression || 'resource_type:image',
            sort_by: [{ created_at: 'desc' }],
            max_results: 500
        }, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("[Proxy Error]", error.message);
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data.error.message : error.message;
        res.status(status).json({ error: message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Mosaic Wall Server running!`);
    console.log(`👉 http://localhost:${PORT}\n`);
});
