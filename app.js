// app.jsx
import React, { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import "./styles.css";

export default function App() {
  // creo el estado principal del tema (claro/oscuro)
  const [theme, setTheme] = useState("light");

  return (
    <ThemeProvider value={{ theme, setTheme }}>
      <UserProvider>
        <div className={`app ${theme}`}>
          <Sidebar />
          <Main />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

// contexts/ThemeContext.jsx
import React, { createContext, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ThemeContext.Provider;
export const useTheme = () => useContext(ThemeContext);

// contexts/UserContext.jsx
import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);

  return (
    <UserContext.Provider value={{ users, setUsers, selectedUserIndex, setSelectedUserIndex }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

// components/Sidebar.jsx
import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
import UserList from "./UserList";
import UserForm from "./UserForm";
import UserInfo from "./UserInfo";

export default function Sidebar() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <aside className="sidebar card">
      <h2>Usuarios</h2>
      <UserList />
      <UserForm />
      <UserInfo />
      <button onClick={toggleTheme} style={{ marginTop: "auto" }}>
        🌙/☀️ Tema
      </button>
    </aside>
  );
}

// components/UserList.jsx
import React from "react";
import { useUser } from "../contexts/UserContext";

export default function UserList() {
  const { users, selectedUserIndex, setSelectedUserIndex } = useUser();

  return (
    <ul id="userList">
      {users.length === 0 ? (
        <li>No hay usuarios</li>
      ) : (
        users.map((user, index) => (
          <li
            key={index}
            onClick={() => setSelectedUserIndex(index)}
            style={{ cursor: "pointer", fontWeight: selectedUserIndex === index ? "bold" : "normal" }}
          >
            {user.name}
          </li>
        ))
      )}
    </ul>
  );
}

// components/UserForm.jsx
import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";

export default function UserForm() {
  const { users, setUsers } = useUser();
  const [newUser, setNewUser] = useState("");

  const addUser = () => {
    if (!newUser.trim()) return;
    setUsers([...users, { name: newUser.trim(), tasks: [] }]);
    setNewUser("");
  };

  return (
    <>
      <input
        type="text"
        value={newUser}
        onChange={(e) => setNewUser(e.target.value)}
        placeholder="Nuevo usuario..."
      />
      <button onClick={addUser}>Añadir Usuario</button>
    </>
  );
}

// components/UserInfo.jsx
import React from "react";
import { useUser } from "../contexts/UserContext";

export default function UserInfo() {
  const { users, selectedUserIndex, setSelectedUserIndex } = useUser();

  if (selectedUserIndex === null) return null;

  const user = users[selectedUserIndex];
  const completed = user.tasks.filter((t) => t.completed).length;

  return (
    <div id="userInfo">
      <hr />
      <p id="userName">{user.name}</p>
      <p id="userStats">Tareas: {completed} / {user.tasks.length} completadas</p>
      <button onClick={() => setSelectedUserIndex(null)}>Deseleccionar</button>
    </div>
  );
}

// components/Main.jsx
import React from "react";
import { useUser } from "../contexts/UserContext";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";

export default function Main() {
  const { users, selectedUserIndex } = useUser();

  const user = users[selectedUserIndex];

  return (
    <main className="main">
      <div className="card">
        <h1 id="mainTitle">
          {user ? `Tareas de ${user.name}` : "Selecciona un usuario"}
        </h1>
        {user && (
          <div id="taskSection">
            <TaskList tasks={user.tasks} />
            <TaskForm />
          </div>
        )}
      </div>
    </main>
  );
}

// components/TaskList.jsx
import React from "react";
import { useUser } from "../contexts/UserContext";

export default function TaskList({ tasks }) {
  const { users, setUsers, selectedUserIndex } = useUser();

  const toggle = (index) => {
    const updated = [...users];
    updated[selectedUserIndex].tasks[index].completed = !updated[selectedUserIndex].tasks[index].completed;
    setUsers(updated);
  };

  const del = (index) => {
    const updated = [...users];
    updated[selectedUserIndex].tasks.splice(index, 1);
    setUsers(updated);
  };

  const edit = (index) => {
    const newText = prompt("Editar tarea:", tasks[index].text);
    if (newText !== null && newText.trim() !== "") {
      const updated = [...users];
      updated[selectedUserIndex].tasks[index].text = newText.trim();
      setUsers(updated);
    }
  };

  if (tasks.length === 0) return <p>No hay tareas</p>;

  return (
    <ul id="taskList">
      {tasks.map((task, index) => (
        <li key={index} className={task.completed ? "completed" : ""}>
          <span onClick={() => toggle(index)}>{task.text}</span>
          <div className="actions">
            <button onClick={() => edit(index)}>✏️</button>
            <button onClick={() => del(index)}>🗑️</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// components/TaskForm.jsx
import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";

export default function TaskForm() {
  const { users, setUsers, selectedUserIndex } = useUser();
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;
    const updated = [...users];
    updated[selectedUserIndex].tasks.push({ text: newTask.trim(), completed: false });
    setUsers(updated);
    setNewTask("");
  };

  return (
    <>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Nueva tarea..."
      />
      <button onClick={addTask}>Añadir Tarea</button>
    </>
  );
}
