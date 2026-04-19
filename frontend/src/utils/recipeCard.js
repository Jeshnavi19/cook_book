const normalizeIngredients = (ingredients) => {
  if (Array.isArray(ingredients)) {
    return ingredients.map((item) => `${item}`.trim()).filter(Boolean);
  }

  if (typeof ingredients === "string") {
    return ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const getIngredientPreview = (ingredients, limit = 3) => {
  const items = normalizeIngredients(ingredients);
  const preview = items.slice(0, limit);
  const remainingCount = Math.max(items.length - preview.length, 0);

  return {
    preview,
    hasMore: remainingCount > 0,
    remainingCount,
  };
};

export const formatRecipeTime = (time) => {
  const minutes = Number(time);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "";
  }

  return `${minutes} min${minutes === 1 ? "" : "s"}`;
};

export const getRecipeCreatorLabel = (recipe) => {
  const creatorName =
    recipe?.createdByName?.trim() || recipe?.createdBy?.name?.trim();

  if (creatorName) {
    return `Created by ${creatorName}`;
  }

  const token = localStorage.getItem("token");
  const storedName =
    localStorage.getItem("name") || localStorage.getItem("userName") || "";

  if (!token || !storedName) {
    return "Created by Unknown";
  }

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    const currentUserId = decoded.id || "";
    const creatorId = recipe?.createdBy?._id ?? recipe?.createdBy ?? "";

    if (currentUserId && creatorId && currentUserId === creatorId.toString()) {
      return `Created by ${storedName}`;
    }
  } catch {  }

  return "Created by Unknown";
};
