import { useEffect, useMemo, useRef, useState } from "react";

function RecipeForm({
  title,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  showCancel = false,
  resetAfterSubmit = false,
}) {
  const [recipeTitle, setRecipeTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [cuisines, setCuisines] = useState([]);
  const [cuisinesLoading, setCuisinesLoading] = useState(true);
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [cuisineError, setCuisineError] = useState("");
  const [time, setTime] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const cuisineDropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadCuisines = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/cusins");
        if (!res.ok) {
          throw new Error(`Failed to load cuisines: ${res.status}`);
        }

        const data = await res.json();
        if (isMounted) {
          setCuisines(data);
          setCuisineError("");
        }
      } catch (err) {
        console.log(err);
        if (isMounted) {
          setCuisineError("Could not load cuisines.");
        }
      } finally {
        if (isMounted) {
          setCuisinesLoading(false);
        }
      }
    };

    loadCuisines();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cuisineDropdownRef.current &&
        !cuisineDropdownRef.current.contains(event.target)
      ) {
        setCuisineOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  useEffect(() => {
    setRecipeTitle(initialValues?.title || "");
    setIngredients(initialValues?.ingredients || "");
    setSteps(initialValues?.steps || "");
    setCuisine(initialValues?.cuisine || "");
    setCuisineSearch("");
    setTime(initialValues?.time || "");
    setImage(null);
    setExistingImageUrl(initialValues?.imageUrl || "");
    setFormError("");
  }, [initialValues]);

  const filteredCuisines = useMemo(() => {
    const query = cuisineSearch.trim().toLowerCase();

    if (!query) {
      return cuisines;
    }

    return cuisines.filter((item) => item.toLowerCase().includes(query));
  }, [cuisineSearch, cuisines]);

  const hasRequiredFields =
    Boolean(recipeTitle.trim()) &&
    Boolean(ingredients.trim()) &&
    Boolean(steps.trim()) &&
    Boolean(cuisine.trim()) &&
    Number(time) > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasRequiredFields) {
      setFormError("Title, ingredients, steps, cuisine, and time are required.");
      return;
    }

    try {
      setFormError("");
      setSubmitting(true);
      await onSubmit({
        title: recipeTitle,
        ingredients,
        steps,
        cuisine,
        cookingTime: time,
        image,
      });

      if (resetAfterSubmit) {
        setRecipeTitle(initialValues?.title || "");
        setIngredients(initialValues?.ingredients || "");
        setSteps(initialValues?.steps || "");
        setCuisine(initialValues?.cuisine || "");
        setCuisineSearch("");
        setTime(initialValues?.time || "");
        setImage(null);
        setExistingImageUrl(initialValues?.imageUrl || "");
      }
    } catch (err) {
      setFormError(
        err?.response?.data?.message || "Please fill out all required fields.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayPreview = imagePreview || existingImageUrl;

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <h2>{title}</h2>

      {!displayPreview ? (
        <label className="upload-box">
          <span>{existingImageUrl ? "Replace Image" : "Upload Image"}</span>
          <p>Tap to choose a recipe photo</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            hidden
          />
        </label>
      ) : (
        <div className="image-preview">
          <div className="preview-overlay">
            <button
              type="button"
              className="remove-image-button"
              aria-label="Remove image"
              onClick={() => {
                setImage(null);
                setExistingImageUrl("");
              }}
            >
              X
            </button>
          </div>
          <img src={displayPreview} alt="preview" />
        </div>
      )}

      <input
        className="form-input"
        required
        aria-required="true"
        placeholder="Title"
        value={recipeTitle}
        onChange={(e) => setRecipeTitle(e.target.value)}
      />

      <input
        className="form-input"
        required
        aria-required="true"
        placeholder="Ingredients (comma separated)"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <textarea
        className="form-textarea"
        rows={3}
        required
        aria-required="true"
        placeholder="Description / steps (comma separated)"
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
      />

      <div className="cuisine-dropdown" ref={cuisineDropdownRef}>
        <label className="field-label" htmlFor="cuisine-search">
          Cuisine
        </label>
        <button
          type="button"
          id="cuisine-search"
          className="cuisine-dropdown__trigger"
          onClick={() => setCuisineOpen((current) => !current)}
          disabled={cuisinesLoading}
        >
          <span className={cuisine ? "cuisine-dropdown__selected" : ""}>
            {cuisine || (cuisinesLoading ? "Loading cuisines..." : "Select cuisine")}
          </span>
          <span aria-hidden="true">▾</span>
        </button>
        {cuisineOpen && !cuisinesLoading ? (
          <div className="cuisine-dropdown__menu">
            <input
              className="cuisine-dropdown__search"
              type="search"
              value={cuisineSearch}
              onChange={(e) => setCuisineSearch(e.target.value)}
              placeholder="Search cuisine"
              autoComplete="off"
            />
            {filteredCuisines.length > 0 ? (
              filteredCuisines.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="cuisine-dropdown__option"
                  onClick={() => {
                    setCuisine(item);
                    setCuisineSearch("");
                    setCuisineOpen(false);
                  }}
                >
                  {item}
                </button>
              ))
            ) : (
              <div className="cuisine-dropdown__empty">No cuisines found</div>
            )}
          </div>
        ) : null}
      </div>
      {cuisineError ? <p className="hint">{cuisineError}</p> : null}
      {formError ? <p className="hint" role="alert">{formError}</p> : null}

      <input
        className="form-input"
        type="number"
        min="1"
        required
        aria-required="true"
        placeholder="Time (minutes)"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <button
        className="recipe-submit"
        type="submit"
        disabled={submitting || cuisinesLoading || !hasRequiredFields}
      >
        {submitting ? "Saving..." : submitLabel}
      </button>

      {showCancel ? (
        <button type="button" className="home-search__clear" onClick={onCancel}>
          Cancel
        </button>
      ) : null}
    </form>
  );
}

export default RecipeForm;
