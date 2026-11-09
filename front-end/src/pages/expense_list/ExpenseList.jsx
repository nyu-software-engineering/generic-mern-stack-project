import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import "./ExpenseList.css";
import axios from "axios";

const ExpenseList = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const selectedExpense = expenses.find(
    (expense) => expense.id === selectedExpenseId
  );

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_EXPENSES_API_URL);
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();
    const trimmedPrice = formData.price.trim();

    if (!trimmedName || !trimmedDescription || !trimmedPrice) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(
        import.meta.env.VITE_EXPENSES_API_URL,
        {
          name: trimmedName,
          description: trimmedDescription,
          price: trimmedPrice,
        }
      );

      setExpenses((prevExpenses) => [...prevExpenses, response.data]);
      setSelectedExpenseId(response.data.id);
      setFormData({
        name: "",
        description: "",
        price: "",
      });
    } catch (error) {
      console.error("Could not add the expense", error);
      alert("There was an error saving the expense.");
    }
  };

  return (
    <div className="expense-list-container">
      <header className="header">
        <button
          type="button"
          className="logoButton"
          onClick={() => navigate("/home")}
        >
          <img
            src={SplitLeaseLogo}
            alt="SplitLease Logo"
            className="headerLogo"
          />
        </button>

        <button
          className="backButton"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </header>

      <h1>Household Expenses</h1>

      <div className="expense-list">
        <h1>My Expenses</h1>

        {expenses.length === 0 ? (
          <p>There are currently no expenses available.</p>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <button
                type="button"
                onClick={() => setSelectedExpenseId(expense.id)}
              >
                {expense.expense_name}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="expense-details">
        <h1>Expense Details</h1>

        {selectedExpense ? (
          <div>
            <p>
              <strong>Name:</strong> {selectedExpense.name}
            </p>
            <p>
              <strong>Description:</strong> {selectedExpense.description}
            </p>
            <p>
              <strong>Price:</strong> ${selectedExpense.price}
            </p>
          </div>
        ) : (
          <p>No expense has been selected.</p>
        )}
      </div>

      <div className="log-new-expense">
        <h1>Log New Expense</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Expense Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter expense name"
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter expense description"
            />
          </div>

          <div>
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter expense price"
            />
          </div>

          <button type="submit">Submit Expense</button>
        </form>
      </div>

      <div className="actionButtons">
        <button
          className="monthlyActivityButton"
          type="button"
          onClick={() => navigate("/monthly-activity")}
        >
          See Monthly Activity
        </button>
      </div>
    </div>
  );
};

export default ExpenseList;