const axios = require("axios");

const eventsApi = axios.create({
  baseURL: process.env.ODDS_API_BASE_URL,
  timeout: 10000,
});

async function fetchEvents(params) {
  try {
    const response = await eventsApi.get("/events", {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        ...params,
      },
    });

    console.log(
      "Remaining Requests:",
      response.headers["x-requests-remaining"]
    );

    return response.data;

  } catch (error) {

    console.error(
      "Odds API Error:",
      error.response?.data || error.message
    );

    return [];
  }

}

module.exports = {
  fetchEvents,
};