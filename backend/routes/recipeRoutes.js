const router = require("express").Router();
const Recipe = require("../models/recipe");
const User = require("../models/user");
const auth = require("../middleware/auth");


const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const cuisines  = [
  "American",
  "British",
  "Irish",
  "French",
  "Italian",
  "Spanish",
  "Portuguese",
  "German",
  "Dutch",
  "Belgian",
  "Swiss",
  "Austrian",
  "Scandinavian",
  "Eastern European",

  "Indian",
  "Pakistani",
  "Bangladeshi",
  "Chinese",
  "Japanese",
  "Korean",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malaysian",
  "Filipino",
  "Sri Lankan",
  "Nepali",

  "Middle Eastern",
  "Arabic",
  "Turkish",
  "Persian",
  "Lebanese",
  "Israeli",
  "Greek",
  "Mediterranean",

  "Mexican",
  "Brazilian",
  "Argentine",
  "Peruvian",
  "Colombian",
  "Chilean",
  "Cuban",
  "Venezuelan",

  "Moroccan",
  "Ethiopian",
  "Egyptian",
  "Nigerian",
  "South African",

  "Caribbean",
  "Jamaican",
  "Hawaiian",

  "Tex-Mex",
  "Indo-Chinese",
  "Pan-Asian",
  "Continental",
  "Fusion",

  "Others"
];

router.get("/cusins", (req, res) => {
  res.json(cuisines);
});

const parseList = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const hasRequiredFields = (body) => {
  const title = (body.title || "").trim();
  const ingredients = parseList(body.ingredients || "");
  const steps = parseList(body.steps || "");
  const cuisine = (body.cuisine || "").trim();
  const cookingTime = Number(body.cookingTime);

  return (
    Boolean(title) &&
    ingredients.length > 0 &&
    steps.length > 0 &&
    Boolean(cuisine) &&
    Number.isFinite(cookingTime) &&
    cookingTime > 0
  );
};




router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    if (!hasRequiredFields(req.body)) {
      return res.status(400).json({
        message:
          "Title, ingredients, steps, cuisine, and time are required.",
      });
    }

    const user = await User.findById(req.user.id).select("name");

    const recipe = await Recipe.create({
      title: req.body.title.trim(),
      ingredients: parseList(req.body.ingredients),
      steps: parseList(req.body.steps),
      cuisine: req.body.cuisine.trim(),
      cookingTime: Number(req.body.cookingTime),
      image: req.file ? `/uploads/${req.file.filename}` : "",
      createdByName: user?.name || "",
      createdBy: req.user.id,
    });

    res.json(recipe);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error creating recipe");
  }
});

router.get("/", async (req, res) => {
  const recipes = await Recipe.find().populate("createdBy", "name");
  res.json(recipes);
});

router.get("/search", async (req, res) => {
  const q = req.query.q || "";

  if (!q) {
    const recipes = await Recipe.find();
    return res.json(recipes);
  }

  const recipes = await Recipe.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { ingredients: { $regex: q, $options: "i" } },
      { cuisine: { $regex: q, $options: "i" } },
      { steps: { $regex: q, $options: "i" } },
    ],
  }).populate("createdBy", "name");

  res.json(recipes);
});

router.get("/mine", auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ createdBy: req.user.id }).populate(
      "createdBy",
      "name",
    );
    res.json(recipes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error loading your recipes" });
  }
});

router.get("/:id", async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).populate(
    "createdBy",
    "name",
  );
  res.json(recipe);
});

router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!hasRequiredFields(req.body)) {
      return res.status(400).json({
        message:
          "Title, ingredients, steps, cuisine, and time are required.",
      });
    }

    const updated = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title.trim(),
        ingredients: parseList(req.body.ingredients),
        steps: parseList(req.body.steps),
        cuisine: req.body.cuisine.trim(),
        cookingTime: Number(req.body.cookingTime),
        image: req.file ? `/uploads/${req.file.filename}` : recipe.image,
        createdByName: recipe.createdByName || "",
      },
      { new: true },
    );

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating recipe" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json("Deleted");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting recipe" });
  }
});

module.exports = router;
