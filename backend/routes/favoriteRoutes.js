const router = require("express").Router();
const Favorite = require("../models/favorite");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ message: "recipeId is required" });
    }

    const existing = await Favorite.findOne({
      userId: req.user.id,
      recipeId,
    });

    if (existing) {
      return res.status(409).json({ message: "Recipe already saved" });
    }

    const fav = await Favorite.create({
      userId: req.user.id,
      recipeId,
    });

    res.status(201).json(fav);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Recipe already saved" });
    }

    console.error(err);
    res.status(500).json({ message: "Error saving recipe" });
  }
});

router.get("/", auth, async (req, res) => {
  const favs = await Favorite.find({ userId: req.user.id }).populate({
    path: "recipeId",
    populate: {
      path: "createdBy",
      select: "name",
    },
  });
  res.json(favs);
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Favorite.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "Favorite removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing favorite" });
  }
});

module.exports = router;
