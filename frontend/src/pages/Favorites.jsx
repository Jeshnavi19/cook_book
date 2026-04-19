import { useEffect, useMemo, useState } from "react";
import API from "../api";
import { Link, useSearchParams } from "react-router-dom";
import {
  formatRecipeTime,
  getIngredientPreview,
  getRecipeCreatorLabel,
} from "../utils/recipeCard";
import "../assets/stylesheets//styles.scss";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const fetchFavorites = async () => {
    const res = await API.get("/favorites");
    setFavorites(res.data);
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await API.delete(`/favorites/${favoriteId}`);
      await fetchFavorites();
    } catch {
      console.error("Could not remove favorite");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const filteredFavorites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return favorites;
    }

    return favorites.filter((favorite) => {
      const recipe = favorite.recipeId || {};
      const haystack = [
        recipe.title,
        recipe.cuisine,
        Array.isArray(recipe.ingredients)
          ? recipe.ingredients.join(" ")
          : recipe.ingredients,
        Array.isArray(recipe.steps) ? recipe.steps.join(" ") : recipe.steps,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [favorites, searchQuery]);

  return (
    <div className="page favorites-page">
      <h2>{searchQuery.trim() ? `Favorite search for "${searchQuery.trim()}"` : "Favorites"}</h2>

      <div className="favorites-grid">
        {filteredFavorites.length === 0 ? (
          <div className="home-empty-state">
            <h3>No favorites found</h3>
            <p>Try another search term or clear the search box.</p>
          </div>
        ) : (
          filteredFavorites.map((f) => {
            const ingredientPreview = getIngredientPreview(
              f.recipeId.ingredients,
            );

            return (
              <div className="recipe-card" key={f._id}>
                <button
                  type="button"
                  className="favorite-remove"
                  onClick={() => removeFavorite(f._id)}
                  aria-label={`Remove ${f.recipeId.title} from favorites`}
                  title="Remove favorite"
                >
                  🗑️
                </button>
                <div className="recipe-card__visual">
                  <Link
                    to={`/recipe/${f.recipeId._id}`}
                    className="recipe-card__media"
                  >
                    {f.recipeId.image ? (
                      <img
                        src={`http://localhost:5050${f.recipeId.image}`}
                        alt={f.recipeId.title}
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
                    title={getRecipeCreatorLabel(f.recipeId)}
                  >
                    {getRecipeCreatorLabel(f.recipeId)}
                  </div>
                </div>

                <div className="recipe-card__body">
                  <div className="recipe-card__header">
                    <div className="recipe-card__title-row">
                      <h3>{f.recipeId.title}</h3>
                      <span className="recipe-card__time-pill">
                        {formatRecipeTime(f.recipeId.cookingTime)}
                      </span>
                    </div>
                    <p>{f.recipeId.cuisine}</p>
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
                    <Link to={`/recipe/${f.recipeId._id}`}>
                      <button>View</button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Favorites;
