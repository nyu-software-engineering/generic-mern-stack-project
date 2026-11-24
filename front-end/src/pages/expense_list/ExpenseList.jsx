import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png"
import { getCurrentUser } from "../login/authApi"
import {
  createRecurringBill,
  getHouseholdExpenses,
  settleExpense,
} from "./expenseApi"
import "./ExpenseList.css"

const EMPTY_FORM = {
  name: "",
  description: "",
  amount: "",
  frequency: "monthly",
}

const ExpenseList = () => {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const householdId = currentUser?.householdId

  const [expenses, setExpenses] = useState([])
  const [members, setMembers] = useState([])
  const [selectedExpenseId, setSelectedExpenseId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [pageError, setPageError] = useState("")
  const [settlementError, setSettlementError] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [settlingExpenseId, setSettlingExpenseId] = useState(null)

  const selectedExpense = expenses.find(
    (expense) => expense.id === selectedExpenseId,
  )

  const unpaidExpenses = expenses.filter(
    (expense) => !expense.paidByMemberIds.includes(currentUser?.id),
  )

  const memberName = (memberId) => {
    const member = members.find((currentMember) => currentMember.id === memberId)

    return member
      ? `${member.firstName} ${member.lastName}`
      : "Unknown member"
  }

  useEffect(() => {
    if (!householdId) {
      setLoading(false)
      return
    }

    const fetchExpenses = async () => {
      try {
        const data = await getHouseholdExpenses(householdId)
        setExpenses(data.expenses)
        setMembers(data.members)
      } catch {
        setPageError("Could not load household expenses. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [householdId])

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setCreating(true)
    setFormErrors({})
    setPageError("")

    try {
      const result = await createRecurringBill(householdId, formData)

      if (result.errors) {
        setFormErrors(result.errors)
        return
      }

      if (result.error) {
        setPageError(result.error)
        return
      }

      setExpenses((currentExpenses) => [...currentExpenses, result.bill])
      setSelectedExpenseId(result.bill.id)
      setFormData(EMPTY_FORM)
    } catch {
      setPageError("Could not create the recurring bill. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const handleSettle = async (expenseId) => {
    setSettlingExpenseId(expenseId)
    setSettlementError("")

    try {
      const result = await settleExpense(
        householdId,
        expenseId,
        currentUser.id,
      )

      if (result.error) {
        setSettlementError(result.error)
        return
      }

      setExpenses((currentExpenses) =>
        currentExpenses.map((expense) =>
          expense.id === result.expense.id ? result.expense : expense,
        ),
      )
    } catch {
      setSettlementError("Could not settle this expense. Please try again.")
    } finally {
      setSettlingExpenseId(null)
    }
  }

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

        <button className="backButton" onClick={() => navigate("/household")}>
          Back
        </button>
      </header>

      <h1>Household Expenses</h1>

      {pageError && <p className="expense-error">{pageError}</p>}

      <div className="expense-list">
        <h1>Expenses</h1>

        {loading ? (
          <p>Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p>There are currently no expenses available.</p>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <button
                type="button"
                onClick={() => setSelectedExpenseId(expense.id)}
              >
                {expense.name}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="expenses-to-be-settled">
        <h1>Expenses to Be Settled</h1>

        {settlementError && (
          <p className="expense-error">{settlementError}</p>
        )}

        {loading ? (
          <p>Loading expenses...</p>
        ) : unpaidExpenses.length === 0 ? (
          <p>You have no expenses to settle.</p>
        ) : (
          unpaidExpenses.map((expense) => (
            <div key={expense.id} className="expense-item expense-to-settle">
              <button
                type="button"
                onClick={() => setSelectedExpenseId(expense.id)}
              >
                {expense.name}
              </button>

              <button
                type="button"
                className="settleExpenseButton"
                disabled={settlingExpenseId === expense.id}
                onClick={() => handleSettle(expense.id)}
              >
                {settlingExpenseId === expense.id ? "Settling..." : "Settle"}
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
              <strong>Description:</strong>{" "}
              {selectedExpense.description || "No description provided."}
            </p>
            <p>
              <strong>Price:</strong> ${Number(selectedExpense.amount).toFixed(2)}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              {selectedExpense.kind === "recurring"
                ? "Recurring Bill"
                : "One-Time Expense"}
            </p>

            {selectedExpense.frequency && (
              <p>
                <strong>Frequency:</strong> {selectedExpense.frequency}
              </p>
            )}

            <h2>Members Who Have Paid</h2>

            {selectedExpense.paidByMemberIds.length === 0 ? (
              <p>No members have settled this expense yet.</p>
            ) : (
              <ul className="paidMembersList">
                {selectedExpense.paidByMemberIds.map((memberId) => (
                  <li key={memberId}>{memberName(memberId)}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p>No expense has been selected.</p>
        )}
      </div>

      <div className="log-new-expense">
        <h1>Log New Expense</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="expenseName">Expense Name</label>
            <input
              id="expenseName"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter expense name"
            />
            {formErrors.name && (
              <p className="field-error">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="expenseDescription">Description</label>
            <textarea
              id="expenseDescription"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter expense description"
            />
          </div>

          <div>
            <label htmlFor="expenseAmount">Price</label>
            <input
              id="expenseAmount"
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter expense price"
            />
            {formErrors.amount && (
              <p className="field-error">{formErrors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="expenseFrequency">Frequency</label>
            <select
              id="expenseFrequency"
              name="frequency"
              value={formData.frequency}
              disabled
            >
              <option value="monthly">Monthly</option>
            </select>
            {formErrors.frequency && (
              <p className="field-error">{formErrors.frequency}</p>
            )}
          </div>

          <button type="submit" disabled={creating}>
            {creating ? "Submitting..." : "Submit Expense"}
          </button>
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
  )
}

export default ExpenseList