import React, { useState, useEffect, ChangeEvent } from "react";
import { FaTrash } from "react-icons/fa";
import { MdAddCircleOutline } from "react-icons/md";
import Swal from "sweetalert2";

interface Expense {
  id: number;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const storedExpenses = localStorage.getItem("expenses");
    return storedExpenses ? JSON.parse(storedExpenses) : [];
  });

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: "",
    amount: 0,
    description: "",
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const addExpense = () => {
    if (!newExpense.category || !newExpense.amount) {
      return Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Category and Amount are required.",
      });
    }
    const expense: Expense = {
      id: Date.now(),
      category: newExpense.category,
      amount: newExpense.amount,
      description: newExpense.description || "",
      date: new Date().toISOString(),
    };
    setExpenses([...expenses, expense]);
    setNewExpense({ category: "", amount: 0, description: "" });
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Expense added successfully.",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const deleteExpense = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setExpenses(expenses.filter((expense) => expense.id !== id));
        Swal.fire({
          title: "Deleted!",
          text: "Your expense has been deleted.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const previousMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() !== currentMonth ||
      expenseDate.getFullYear() !== currentYear
    );
  });

  const totalExpense = currentMonthExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  const formatDateToDDMMYY = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-500 py-10 px-4 sm:px-8 text-white">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-xl text-gray-800">
        <h1 className="text-4xl font-bold mb-8 text-center text-indigo-600">
          Monthly Expense Tracker
        </h1>
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newExpense.category || ""}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={newExpense.amount || 0}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="description"
            placeholder="Description (optional)"
            value={newExpense.description || ""}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addExpense}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-lg flex items-center justify-center gap-2"
          >
            <MdAddCircleOutline size={20} /> Add Expense
          </button>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Current Month Expenses</h2>
        <div className="h-64 overflow-y-auto">
          {currentMonthExpenses.length === 0 ? (
            <p className="text-gray-500">No expenses added yet.</p>
          ) : (
            <ul className="space-y-4">
              {currentMonthExpenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm"
                >
                  <div>
                    <span className="font-semibold">{expense.category}</span> -
                    ₹{expense.amount}
                    {expense.description && (
                      <span className="text-gray-500">
                        {" "}
                        ({expense.description})
                      </span>
                    )}
                  </div>

                  <span>{formatDateToDDMMYY(expense.date)}</span>

                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-500 hover:text-red-600 flex items-center"
                  >
                    <FaTrash size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <h3 className="text-xl font-semibold mt-6 text-indigo-600">
          Total Expense: ₹{totalExpense}
        </h3>
        <h2 className="text-2xl font-semibold mt-10">Expense History</h2>
        {previousMonthExpenses.length === 0 ? (
          <p className="text-gray-500">No previous expenses found.</p>
        ) : (
          <ul className="space-y-4 mt-4">
            {previousMonthExpenses.map((expense) => (
              <li
                key={expense.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm"
              >
                <div>
                  <span className="font-semibold">{expense.category}</span> - ₹
                  {expense.amount}
                  {expense.description && (
                    <span className="text-gray-500">
                      {" "}
                      ({expense.description})
                    </span>
                  )}
                  <span className="text-gray-400">
                    {" "}
                    - {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
