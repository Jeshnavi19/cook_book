import { useEffect, useMemo, useState } from "react";
import API from "../api";
import { useParams } from "react-router-dom";
import RecipeForm from "../components/RecipeForm";
import "../assets/stylesheets//styles.scss";

const decodeTokenUserId = (token) => {
  if (!token) return "";

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return decoded.id || "";
  } catch {
    return "";
  }
};

function EditRecipe() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = useMemo(
    () => decodeTokenUserId(localStorage.getItem("token")),
    [],
  );

  const createdById = recipe?.createdBy?._id ?? recipe?.createdBy ?? "";
  const isOwner = Boolean(currentUserId && createdById === currentUserId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const saveRecipe = async ({
    title,
    ingredients,
    steps,
    cuisine,
    cookingTime,
    image,
  }) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("steps", steps);
    formData.append("cuisine", cuisine);
    formData.append("cookingTime", cookingTime);

    if (image) {
      formData.append("image", image);
    }

    const res = await API.put(`/recipes/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setRecipe(res.data);
  };

  if (loading) return <p className="page">Loading...</p>;
  if (!recipe) return <p className="page">Recipe not found</p>;

  if (!isOwner) {
    return <p className="page">You can only edit recipes you created.</p>;
  }

  const initialValues = {
    title: recipe.title || "",
    ingredients: (recipe.ingredients || []).join(", "),
    steps: (recipe.steps || []).join(", "),
    cuisine: recipe.cuisine || "",
    time: recipe.cookingTime?.toString() || "",
    imageUrl: recipe.image ? `http://localhost:5050${recipe.image}` : "",
  };

  return (
    <div className="create-recipe page">
      <RecipeForm
        title="Edit Recipe"
        initialValues={initialValues}
        submitLabel="Save Changes"
        onSubmit={saveRecipe}
      />
    </div>
  );
}

export default EditRecipe;
