import React, { useState } from "react";
import axios from "axios";

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    teacher_id: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/register/student", formData);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="first_name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="last_name"
        placeholder="Last Name"
        value={formData.last_name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="teacher_id"
        placeholder="Teacher ID"
        value={formData.teacher_id}
        onChange={handleChange}
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Register as Student
      </button>
    </form>
  );
};

export default StudentRegistration;