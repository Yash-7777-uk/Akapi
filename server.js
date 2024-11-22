const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import CORS package
const app = express();
const fs = require('fs');
const path = require('path');

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Dynamic token handler function
function getToken(tokenFileName) {
    const tokenPath = path.join(__dirname, 'tokens', `${tokenFileName}.js`);
    if (fs.existsSync(tokenPath)) {
        const token = require(tokenPath);
        return token.value; // Assuming token file exports an object with 'value'
    } else {
        throw new Error('Token file not found');
    }
}

// Function to forward requests to the original API
async function forwardRequest(req, res, endpointUrl) {
    const { tokenFileName } = req.params;

    try {
        const token = getToken(tokenFileName);

        // Define headers with dynamic token
        const headers = {
            "Accept": "application/json",
            "origintype": "web",
            "token": token,
            "usertype": "2",
            "Content-Type": "application/x-www-form-urlencoded"
        };

        // Forward request to the original API
        const response = await axios.get(endpointUrl, { headers });

        // Send the original API response back to the client
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// (Endpoints remain the same...)
// Endpoints
app.get('/api/:tokenFileName/my-batch', async (req, res) => {
    const url = 'https://spec.apnikaksha.net/api/v2/my-batch';
    await forwardRequest(req, res, url);
});

app.get('/api/:tokenFileName/batch-subject/:batch_id', async (req, res) => {
    const url = `https://spec.apnikaksha.net/api/v2/batch-subject/${req.params.batch_id}`;
    await forwardRequest(req, res, url);
});

app.get('/api/:tokenFileName/batch-topic/:subject_id', async (req, res) => {
    const { subject_id } = req.params;
    const { type } = req.query; // class or notes
    const url = `https://spec.apnikaksha.net/api/v2/batch-topic/${subject_id}?type=${type}`;
    await forwardRequest(req, res, url);
});

app.get('/api/:tokenFileName/batch-notes/:batch_id', async (req, res) => {
    const { batch_id } = req.params;
    const { subjectId, topicId } = req.query;
    const url = `https://spec.apnikaksha.net/api/v2/batch-notes/${batch_id}?subjectId=${subjectId}&topicId=${topicId}`;
    await forwardRequest(req, res, url);
});

app.get('/api/:tokenFileName/batch-detail/:batch_id', async (req, res) => {
    const { batch_id } = req.params;
    const { subjectId, topicId } = req.query;
    const url = `https://spec.apnikaksha.net/api/v2/batch-detail/${batch_id}?subjectId=${subjectId}&topicId=${topicId}`;
    await forwardRequest(req, res, url);
});

app.get('/api/:tokenFileName/livestreamToken/:vid_id', async (req, res) => {
    const { vid_id } = req.params;
    const url = `https://spec.apnikaksha.net/api/v2/livestreamToken?base=web&module=batch&type=brightcove&vid=${vid_id}`;
    await forwardRequest(req, res, url);
});

// Server listen
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});