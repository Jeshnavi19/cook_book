import { useState, useEffect, useMemo, useRef } from "react";
import API from "../api";
import { Link, useSearchParams } from "react-router-dom";
import {
  formatRecipeTime,
  getIngredientPreview,
  getRecipeCreatorLabel,
} from "../utils/recipeCard";
import "../assets/stylesheets//styles.scss";

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [visibleCounts, setVisibleCounts] = useState({});
  const [searchParams] = useSearchParams();
  const favoritesRef = useRef(null);
  const searchQuery = searchParams.get("q") || "";
  const currentUserId = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return "";

    try {
      const payload = token.split(".")[1];
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(normalized));
      return decoded.id || "";
    } catch {
      return "";
    }
  }, []);
  const favoriteRecipeIds = new Set(
    favorites
      .map((favorite) => favorite.recipeId?._id ?? favorite.recipeId)
      .filter(Boolean),
  );

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

  const fetchFavorites = async () => {
    try {
      const fav = await API.get("/favorites");
      setFavorites(fav.data);
    } catch {
      setFavorites([]);
    }
  };




  const fetchRecipes = async (query = "") => {
    try {
      const url = query.trim()
        ? `/recipes/search?q=${encodeURIComponent(query.trim())}`
        : "/recipes";
      const res = await API.get(url);

      setRecipes(res.data);
      setVisibleCounts({});
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRecipes(searchQuery);
    fetchFavorites();
  }, [searchQuery]);

  const addFavorite = async (id) => {
    try {
      await API.post("/favorites", { recipeId: id });
      await fetchFavorites();
    } catch (err) {
      if (err.response?.status === 409) {
        await fetchFavorites();
        return;
      }

      if (err.response?.status === 401 || err.response?.status === 403) {
        return;
      }

      console.error("Could not save recipe", err);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await API.delete(`/favorites/${favoriteId}`);
      await fetchFavorites();
    } catch {
      console.error("Could not remove favorite");
    }
  };

  const grouped = recipes.reduce((acc, recipe) => {
    if (!acc[recipe.cuisine]) acc[recipe.cuisine] = [];
    acc[recipe.cuisine].push(recipe);
    return acc;
  }, {});

  const cuisineSections = Object.entries(grouped).map(([cuisine, recipes]) => {
    const visibleCount = visibleCounts[cuisine] ?? 4;
    const visibleRecipes = recipes.slice(0, visibleCount);

    return {
      cuisine,
      recipes,
      visibleRecipes,
      hasMore: recipes.length > visibleRecipes.length,
    };
  });

  const showMoreRecipes = (cuisine) => {
    setVisibleCounts((current) => ({
      ...current,
      [cuisine]: (current[cuisine] ?? 4) + 4,
    }));
  };

  const isRecipeOwner = (recipe) => {
    const recipeOwnerId = recipe.createdBy?._id ?? recipe.createdBy ?? "";
    return Boolean(currentUserId && recipeOwnerId === currentUserId);
  };

  const scrollFavorites = (direction) => {
    if (!favoritesRef.current) return;

    const { clientWidth } = favoritesRef.current;
    favoritesRef.current.scrollBy({
      left: direction === "next" ? clientWidth : -clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-text">
          <h1>Recipe Book</h1>
          <p>Create your own recipes</p>
          <Link to="/create">
            <button>Create Recipe</button>
          </Link>
        </div>
      </div>

      {/* =====================
          FAVORITES SECTION
      ===================== */}
      <section className="favorites-section">
        <h2 className="section-title">Your Favorites</h2>

        {favorites.length === 0 ? (
          <div className="favorites-empty-state">
            <div className="favorites-empty-state__badge">No saved recipes</div>
            <h3>Start collecting recipes you love</h3>
            <p>
              Save recipes from the Explore section and they’ll appear here for
              quick access.
            </p>
          </div>
        ) : searchQuery.trim() && filteredFavorites.length === 0 ? (
          <div className="favorites-empty-state">
            <div className="favorites-empty-state__badge">No matches</div>
            <h3>No favorites match "{searchQuery.trim()}"</h3>
            <p>Try a different search term or clear the search box.</p>
          </div>
        ) : (
          <div className="favorites-slider">
            <button
              type="button"
              className="favorites-slider__control favorites-slider__control--prev"
              onClick={() => scrollFavorites("prev")}
              aria-label="Scroll favorites left"
            >
              ‹
            </button>

            <div className="favorites-slider__viewport" ref={favoritesRef}>
              {filteredFavorites.map((f) => {
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
              })}
            </div>

            <button
              type="button"
              className="favorites-slider__control favorites-slider__control--next"
              onClick={() => scrollFavorites("next")}
              aria-label="Scroll favorites right"
            >
              ›
            </button>
          </div>
        )}
      </section>

      {/* =====================
          GROUPED BY CUISINE
      ===================== */}
      <h2 className="section-title">
        {searchQuery.trim() ? `Search results for "${searchQuery.trim()}"` : "Explore by Cuisine"}
      </h2>

      {recipes.length === 0 ? (
        <div className="home-empty-state">
          <h3>No recipes found</h3>
          <p>Try another search term or clear the search box.</p>
        </div>
      ) : (
        cuisineSections.map(({ cuisine, recipes, visibleRecipes, hasMore }) => (
          <div key={cuisine}>
            <h3 className="section-title">{cuisine}</h3>

            <div className="home-cuisine-grid">
              {visibleRecipes.map((r) => {
                const ingredientPreview = getIngredientPreview(r.ingredients);

                return (
                <div
                  className={`recipe-card ${
                    recipes.length === 1 ? "recipe-card--single" : ""
                  } ${
                    recipes.length > 1 ? "recipe-card--compact" : ""
                  }`}
                  style={
                    recipes.length === 1 ? { gridColumn: "1 / -1" } : undefined
                  }
                  key={r._id}
                >
                  <div className="recipe-card__visual">
                    <Link to={`/recipe/${r._id}`} className="recipe-card__media">
                      {r.image ? (
                        <img
                          src={`http://localhost:5050${r.image}`}
                          alt={r.title}
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
                      title={getRecipeCreatorLabel(r)}
                    >
                      {getRecipeCreatorLabel(r)}
                    </div>
                  </div>

                  <div className="recipe-card__body">
                    <div className="recipe-card__header">
                      <div className="recipe-card__title-row">
                        <h3>{r.title}</h3>
                        <span className="recipe-card__time-pill">
                          {formatRecipeTime(r.cookingTime)}
                        </span>
                      </div>
                      <p>{r.cuisine}</p>
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
                      <Link to={`/recipe/${r._id}`}>
                        <button>View</button>
                      </Link>

                      {isRecipeOwner(r) ? (
                        <Link to={`/edit/${r._id}`}>
                          <button type="button">Edit</button>
                        </Link>
                      ) : null}

                      <button
                        type="button"
                        className="recipe-card__save-button"
                        onClick={() => addFavorite(r._id)}
                        disabled={favoriteRecipeIds.has(r._id)}
                      >
                        {favoriteRecipeIds.has(r._id) ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="home-cuisine-grid__more">
                <button
                  type="button"
                  className="home-cuisine-grid__more-button"
                  onClick={() => showMoreRecipes(cuisine)}
                >
                  Show more
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Home;
