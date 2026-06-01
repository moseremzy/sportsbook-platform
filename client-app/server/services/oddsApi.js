const axios = require("axios");

const oddsApi = axios.create({
  baseURL: process.env.ODDS_API_BASE_URL,
  timeout: 10000,
});

async function fetchOdds(params) {
  try {
    const response = await oddsApi.get("/odds/multi", {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        ...params,
      },
    });

    console.log(
      "Remaining Requests:",
      response.headers["x-requests-remaining"]
    );

    // API returns a single object, wrap it in an array so syncOdds can use [0]
    const data = response.data;
    
    return Array.isArray(data) ? data : [data];

  } catch (error) {
    console.log(
      "Odds API Error:",
      error.response?.data || error.message
    );
    return [];
  }
}

module.exports = {
  fetchOdds,
};