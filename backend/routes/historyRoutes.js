const router = require("express").Router();
const History = require("../models/searchHistory");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const entry = await History.create({
    userId: req.user.id,
    searchQuery: req.body.query,
  });
  res.json(entry);
});

router.get("/", auth, async (req, res) => {
  const history = await History.find({ userId: req.user.id });
  res.json(history);
});

module.exports = router;
