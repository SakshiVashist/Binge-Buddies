const express = require("express");
const router = express.Router();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// ----------------------
// Helper
// ----------------------
async function tmdbFetch(endpoint) {

  try {
    const res = await fetch(
      `${BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${API_KEY}`
    );
    if (!res.ok) {
      throw new Error("TMDB request failed");

    }
    return await res.json();


  } catch (err) {
    throw err;
  }

}

// ----------------------
// ROUTES
// ----------------------

// Trending
router.get("/trending", async (req, res) => {
  const data = await tmdbFetch("/trending/movie/week");
  res.json(data);
});

// Movie details
router.get("/movie/:id", async (req, res) => {
  const data = await tmdbFetch(`/movie/${req.params.id}`);
  res.json(data);
});

// TV details (ADDED FOR TV SHOW LOGGING SUPPORT)
router.get("/tv/:id", async (req, res) => {
  try {
    const data = await tmdbFetch(`/tv/${req.params.id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch TV details" });
  }
});

// Platforms
router.get("/watch-providers/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    const data = await tmdbFetch(`/${type}/${id}/watch/providers?region=SG`);

    if (!data || !data.results) {

      return res.json({});
    }
    res.json(data.results?.SG || {});
  } catch (err) {

    res.status(500).json({ message: "Failed to fetch platform availability" });
  }
});


// Search
router.get("/search", async (req, res) => {
  const query = req.query.q;

  const data = await tmdbFetch(
    `/search/multi?query=${encodeURIComponent(query)}`
  );

  res.json(data);
});

// Recommendations
router.get("/movie/:id/recommendations", async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/recommendations`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch movie recommendations" });
  }
});

router.get("/tv/:id/recommendations", async (req, res) => {
  try {

    const data = await tmdbFetch(`/tv/${req.params.id}/recommendations`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch TV recommendations" });
  }
});

// Discover by genre
router.get("/discover/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const queryString = Object.entries(req.query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(Array.isArray(value) ? value[0] : value)}`)
      .join("&");

    const data = await tmdbFetch(`/discover/${type}?${queryString}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch discover results" });
  }
});

// Genre list
router.get("/genre/:type/list", async (req, res) => {
  try {
    const data = await tmdbFetch(`/genre/${req.params.type}/list`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch genre list" });
  }
});

module.exports = router;