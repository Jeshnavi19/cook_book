import API from "../api";
import RecipeForm from "../components/RecipeForm";
import "../assets/stylesheets//styles.scss";

function CreateRecipe() {
  const handleCreate = async ({
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

    await API.post("/recipes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  return (
    <div className="create-recipe page">
      <RecipeForm
        title="Create Recipe"
        submitLabel="Create"
        onSubmit={handleCreate}
        initialValues={{}}
        resetAfterSubmit
      />
    </div>
  );
}

export default CreateRecipe;
