import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const UsersTable = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortField, setSortField] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await axios.delete(`/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const handleSort = (field) => {
    setSortDirection((current) => {
      if (sortField === field) {
        return current === "asc" ? "desc" : "asc";
      }
      return "asc";
    });
    setSortField(field);
  };

  const getSortedUsers = () => {
    return users
      .filter((user) =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const multiplier = sortDirection === "asc" ? 1 : -1;
        return multiplier * a[sortField].localeCompare(b[sortField]);
      });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Users</h2>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link to="/recipes/new" className="btn btn-success">
          Add New User
        </Link>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th
                onClick={() => handleSort("first_name")}
                style={{ cursor: "pointer" }}
              >
                First Name{" "}
                {sortField === "first_name" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("last_name")}
                style={{ cursor: "pointer" }}
              >
                Last Name{" "}
                {sortField === "last_name" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("email")}
                style={{ cursor: "pointer" }}
              >
                Email{" "}
                {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("role")}
                style={{ cursor: "pointer" }}
              >
                Role{" "}
                {sortField === "role" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedUsers().map((user) => (
              <tr key={user.id}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-warning me-2"
                    // onClick={() => handleEdit(user.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
