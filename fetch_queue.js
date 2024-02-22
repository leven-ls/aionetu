const axios = require('axios');

async function fetchData() {
    try {
        const response = await axios.post('http://127.0.0.1:3000/api/update_queue');
        console.log(response.data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// 每秒抓取一次
setInterval(fetchData, 1000);

