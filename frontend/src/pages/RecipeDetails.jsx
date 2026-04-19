import { useEffect, useMemo, useState } from "react";
import API from "../api";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentUserId = useMemo(
    () => decodeTokenUserId(localStorage.getItem("token")),
    [],
  );

  const createdById = recipe?.createdBy?._id ?? recipe?.createdBy ?? "";
  const isOwner = Boolean(currentUserId && createdById === currentUserId);

  const addFavorite = async () => {
    if (isSaved || saving) return;

    setSaving(true);

    try {
      await API.post("/favorites", { recipeId: id });
      setIsSaved(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setIsSaved(true);
        return;
      }

      if (err.response?.status === 401 || err.response?.status === 403) {
        return;
      }

      console.error("Could not save recipe", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecipe = async () => {
    if (deleting) return;

    setDeleting(true);

    try {
      await API.delete(`/recipes/${id}`);
      navigate("/myrecipies");
    } catch (err) {
      console.log(err);
      console.error(err.response?.data?.message || "Could not delete recipe");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeRes, favoritesRes] = await Promise.all([
          API.get(`/recipes/${id}`),
          API.get("/favorites").catch(() => ({ data: [] })),
        ]);

        setRecipe(recipeRes.data);

        const saved = favoritesRes.data.some(
          (favorite) => (favorite.recipeId?._id ?? favorite.recipeId) === id,
        );

        setIsSaved(saved);
      } catch (err) {
        console.log(err);
        console.error("Error loading recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="page">Loading...</p>;
  if (!recipe) return <p className="page">Recipe not found</p>;

  return (
    <div className="page">
      {recipe.image ? (
        <img
          src={`http://localhost:5050${recipe.image}`}
          alt={recipe.title}
          className="details-img"
        />
      ) : (
        <div className="details-img details-img--placeholder" aria-label="No image">
          <span>No image</span>
        </div>
      )}

      <div className="card">
        <h2>{recipe.title}</h2>

        <p>
          <strong>Cuisine:</strong> {recipe.cuisine}
        </p>
        <p>
          <strong>Time:</strong> {recipe.cookingTime} mins
        </p>

        <div className="section">
          <h3>Ingredients</h3>
          <ul className="list">
            {recipe.ingredients.map((i, index) => (
              <li key={index}>{i}</li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h3>Steps</h3>
          <ol className="list">
            {recipe.steps.map((s, index) => (
              <li key={index}>{s}</li>
            ))}
          </ol>
        </div>

        {isOwner ? (
          <div className="recipe-actions">
            <Link to={`/edit/${recipe._id}`}>
              <button type="button" className="recipe-action-btn edit-btn">
                Edit Recipe
              </button>
            </Link>
            <button
              type="button"
              className="recipe-action-btn delete-btn"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Recipe"}
            </button>
          </div>
        ) : null}

        <button
          className="recipe-action-btn favorite-btn"
          onClick={addFavorite}
          disabled={isSaved || saving}
        >
          {isSaved ? "Saved" : saving ? "Saving..." : "Save to Favorites"}
        </button>

        {showDeleteConfirm ? (
          <div
            className="recipe-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recipe-delete-title"
          >
            <button
              type="button"
              className="recipe-delete-modal__backdrop"
              aria-label="Cancel delete"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div className="recipe-delete-modal__content">
              <h3 id="recipe-delete-title">Do you want to delete recipe?</h3>
              <p>This action cannot be undone.</p>
              <div className="recipe-delete-modal__actions">
                <button
                  type="button"
                  className="recipe-delete-modal__button recipe-delete-modal__button--danger"
                  onClick={deleteRecipe}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  className="recipe-delete-modal__button recipe-delete-modal__button--cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default RecipeDetails;
