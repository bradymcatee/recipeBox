import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";

const IngredientsTable = () => {
  const [ingredients, setIngredients] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    category: "",
    price: "",
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await axios.get("http://localhost:9000/ingredients");
      setIngredients(response.data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };
  const deleteIngredients = async (id) => {
    try {
      await axios.delete(`http://localhost:9000/ingredients/${id}`);
      setIngredients(
        ingredients.filter((ingredients) => ingredients.ingredient_id !== id)
      );
    } catch (error) {
      console.log("Error deleting ingredient:", error);
    }
  };
  const handleNewIngredientChange = (event) => {
    setNewIngredient({
      ...newIngredient,
      [event.target.name]: event.target.value,
    });
  };
  const handleIngredientChange = (event) => {
    setCurrentIngredient({
      ...currentIngredient,
      [event.target.name]: event.target.value,
    });
  };
  const saveNewIngredient = () => {
    axios
      .post("http://localhost:9000/ingredients", newIngredient)
      .then((response) => {
        alert("Ingredient added successfully!");
        fetchIngredients();
        setShowCreateModal(false);
      })
      .catch((error) => {
        console.error("Error adding ingredient:", error);
        alert("Failed to add ingredient");
      });
  };
  const saveEditedIngredient = () => {
    axios
      .put(
        `http://localhost:9000/ingredients/${currentIngredient.ingredient_id}`,
        currentIngredient
      )
      .then((response) => {
        alert("Ingredient updated successfully!");
        fetchIngredients();
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating ingredient:", error);
        alert("Failed to update ingredient");
      });
  };
  const openEditModal = (ingredient) => {
    setCurrentIngredient(ingredient);
    setShowEditModal(true);
  };

  return (
    <Fragment>
      <div className="container mt-4">
        <h2>Ingredients</h2>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr key={ingredient.ingredient_id}>
                <td>{ingredient.name}</td>
                <td>{ingredient.category}</td>
                <td>{ingredient.price}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => openEditModal(ingredient)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target={`#deleteModal${ingredient.ingredient_id}`}
                  >
                    Delete
                  </button>
                  <div
                    className="modal"
                    id={`deleteModal${ingredient.ingredient_id}`}
                  >
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h4 className="modal-title">Are you sure?</h4>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                          ></button>
                        </div>
                        <div className="modal-body">
                          Do you really want to delete this ingredient? This
                          process cannot be undone.
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            data-bs-dismiss="modal"
                            onClick={() =>
                              deleteIngredients(ingredient.ingredient_id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="btn btn-success mt-5"
          onClick={() => {
            setCurrentIngredient({
              ingredient_id: null,
              name: "",
              category: "",
              price: "",
            });
            setShowCreateModal(true);
          }}
        >
          Add New Ingredient
        </button>
        <div
          className={`modal ${showCreateModal ? "d-block" : "d-none"}`}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Ingredient</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-3"
                  name="name"
                  placeholder="Ingredient Name"
                  value={newIngredient.name}
                  onChange={handleNewIngredientChange}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  name="category"
                  placeholder="Category"
                  value={newIngredient.category}
                  onChange={handleNewIngredientChange}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  name="price"
                  placeholder="Price"
                  value={newIngredient.price}
                  onChange={handleNewIngredientChange}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveNewIngredient}
                >
                  Save Ingredient
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`modal ${showEditModal ? "d-block" : "d-none"}`}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Ingredient</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="texthttps://www.npmjs.com/package/react-modal#api-documentation"
                  className="form-control mb-3"
                  name="name"
                  placeholder="Ingredient Name"
                  value={currentIngredient.name}
                  onChange={handleIngredientChange}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  name="category"
                  placeholder="Category"
                  value={currentIngredient.category}
                  onChange={handleIngredientChange}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  name="price"
                  placeholder="Price"
                  value={currentIngredient.price}
                  onChange={handleIngredientChange}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveEditedIngredient}
                >
                  Save Ingredient
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default IngredientsTable;
