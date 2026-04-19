import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";
import {
  formatRecipeTime,
  getIngredientPreview,
  getRecipeCreatorLabel,
} from "../utils/recipeCard";
import "../assets/stylesheets//styles.scss";

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        const res = await API.get("/recipes/mine");
        setRecipes(res.data);
      } catch (err) {
        console.log(err);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRecipes();
  }, []);

  const deleteRecipe = async (recipeId) => {
    if (deletingId) return;

    try {
      setDeletingId(recipeId);
      await API.delete(`/recipes/${recipeId}`);
      setRecipes((current) => current.filter((recipe) => recipe._id !== recipeId));
      setPendingDelete(null);
    } catch (err) {
      console.error("Could not delete recipe", err);
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return <p className="page">Loading...</p>;
  }

  return (
    <div className="page my-recipies">
      <h2 className="section-title">My Recipes</h2>

      {recipes.length === 0 ? (
        <div className="home-empty-state">
          <h3>No recipes yet</h3>
          <p>Create your first recipe from the Create page.</p>
        </div>
      ) : (
        <div className="home-cuisine-grid">
          {recipes.map((recipe) => {
            const ingredientPreview = getIngredientPreview(recipe.ingredients);

            return (
              <div className="recipe-card" key={recipe._id}>
                <button
                  type="button"
                  className="favorite-remove"
                  onClick={() => setPendingDelete(recipe)}
                  aria-label={`Delete ${recipe.title}`}
                  title="Delete recipe"
                  disabled={deletingId === recipe._id}
                >
                  🗑️
                </button>
                <div className="recipe-card__visual">
                  <Link
                    to={`/recipe/${recipe._id}`}
                    className="recipe-card__media"
                  >
                    {recipe.image ? (
                      <img
                        src={`http://localhost:5050${recipe.image}`}
                        alt={recipe.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="recipe-card__placeholder">
                        <span>No image</span>
                      </div>
                    )}
                  </Link>

                  <div
                    className="recipe-card__creator"
                    title={getRecipeCreatorLabel(recipe)}
                  >
                    {getRecipeCreatorLabel(recipe)}
                  </div>
                </div>

                <div className="recipe-card__body">
                  <div className="recipe-card__header">
                    <div className="recipe-card__title-row">
                      <h3>{recipe.title}</h3>
                      <span className="recipe-card__time-pill">
                        {formatRecipeTime(recipe.cookingTime)}
                      </span>
                    </div>
                    <p>{recipe.cuisine}</p>
                  </div>

                  <div className="recipe-card__ingredients">
                    <span className="recipe-card__ingredients-label">
                      Ingredients
                    </span>
                    <div className="recipe-card__ingredient-list">
                      {ingredientPreview.preview.map((ingredient) => (
                        <span
                          className="recipe-card__ingredient-chip"
                          key={ingredient}
                        >
                          {ingredient}
                        </span>
                      ))}
                      {ingredientPreview.hasMore ? (
                        <span className="recipe-card__ingredient-more">
                          +{ingredientPreview.remainingCount} more
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="recipe-card__actions">
                    <Link to={`/recipe/${recipe._id}`}>
                      <button>View</button>
                    </Link>
                    <Link to={`/recipe/${recipe._id}?edit=1`}>
                      <button type="button">Edit</button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pendingDelete ? (
        <div
          className="recipe-delete-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="my-recipes-delete-title"
        >
          <button
            type="button"
            className="recipe-delete-modal__backdrop"
            aria-label="Cancel delete"
            onClick={() => setPendingDelete(null)}
          />
          <div className="recipe-delete-modal__content">
            <h3 id="my-recipes-delete-title">Do you want to delete recipe?</h3>
            <p>This action cannot be undone.</p>
            <div className="recipe-delete-modal__actions">
              <button
                type="button"
                className="recipe-delete-modal__button recipe-delete-modal__button--danger"
                onClick={() => deleteRecipe(pendingDelete._id)}
                disabled={deletingId === pendingDelete._id}
              >
                {deletingId === pendingDelete._id ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                className="recipe-delete-modal__button recipe-delete-modal__button--cancel"
                onClick={() => setPendingDelete(null)}
                disabled={deletingId === pendingDelete._id}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MyRecipes;
