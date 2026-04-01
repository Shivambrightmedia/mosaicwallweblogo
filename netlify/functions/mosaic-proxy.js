const axios = require('axios');

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { cloudName, apiKey, apiSecret, expression } = JSON.parse(event.body);

        if (!cloudName || !apiKey || !apiSecret) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing Cloudinary credentials" })
            };
        }

        const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;

        const response = await axios.post(url, {
            expression,
            sort_by: [{ created_at: 'desc' }],
            max_results: 50
        }, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };

    } catch (err) {
        console.error("Cloudinary Search Error:", err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Cloudinary Search Failed", details: err.message })
        };
    }
};
