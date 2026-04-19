const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = require("../middleware/auth");


router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    res.json(user);
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email});
    if (!user) return res.status(400).json("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json("Wrong password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, name: user.name });
});

router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user.id).select("name email");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
    });
});

module.exports = router;
