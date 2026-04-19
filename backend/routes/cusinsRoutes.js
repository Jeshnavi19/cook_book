const router = require("express").Router();

const cuisines = [
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

  "Others",
];

router.get("/", (req, res) => {
  res.json(cuisines);
});

module.exports = router;
