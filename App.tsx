import React, { useState, useEffect, useMemo } from "react";
import { User, UserRole, Event } from "./types";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import Sidebar from "./components/Sidebar";
import { authAPI, eventAPI, userAPI } from "./services/api";

export const AuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    institution: string
  ) => Promise<void>;
  signup: (
    email: string,
    password: string,
    institution: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await authAPI.getProfile();
          const userData = response.user;
          setUser({
            uid: userData.id,
            email: userData.email,
            username: userData.username,
            role: userData.role as UserRole,
            institution: userData.institution,
            department: userData.department,
            class: userData.class_level,
          });
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("authToken");
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Load events when user logs in
  useEffect(() => {
    if (user) {
      loadEvents();
      if (user.role === UserRole.ADMIN) {
        loadUsers();
      }
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const response = await eventAPI.getEvents();
      // Convert backend date strings to Date objects
      const eventsWithDates = response.events.map((e: any) => ({
        ...e,
        date: new Date(e.event_date),
        creatorName: e.creator_name,
        targetAudience: {
          type: e.target_audience_type,
          value: e.target_audience_value,
        },
        registrations: [],
        feedback: [],
      }));
      setEvents(eventsWithDates);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      const usersData = response.users.map((u: any) => ({
        uid: u.id,
        email: u.email,
        username: u.username,
        role: u.role as UserRole,
        institution: user!.institution,
        department: u.department,
        class: u.class_level,
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const signup = async (
    email: string,
    password: string,
    institutionName: string
  ) => {
    try {
      const response = await authAPI.signup(email, password, institutionName);
      localStorage.setItem("authToken", response.token);
      setUser({
        uid: response.user.id,
        email: response.user.email,
        username: response.user.username,
        role: response.user.role as UserRole,
        institution: response.user.institution,
      });
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    }
  };

  const login = async (
    email: string,
    password: string,
    institutionName: string
  ) => {
    try {
      const response = await authAPI.login(email, password, institutionName);
      localStorage.setItem("authToken", response.token);
      setUser({
        uid: response.user.id,
        email: response.user.email,
        username: response.user.username,
        role: response.user.role as UserRole,
        institution: response.user.institution,
        department: response.user.department,
        class: response.user.classLevel,
      });
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const logout = () => {
    setUser(null);
    setEvents([]);
    setUsers([]);
    localStorage.removeItem("authToken");
  };

  const updateUser = async (updatedUserInfo: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedUserInfo };
      setUser(updatedUser);
    }
  };

  const addEvent = async (event: Omit<Event, "id">) => {
    try {
      await eventAPI.createEvent({
        title: event.title,
        description: event.description,
        eventDate: event.date.toISOString(),
        location: event.location,
        targetAudienceType: event.targetAudience.type,
        targetAudienceValue: event.targetAudience.value,
      });
      await loadEvents(); // Reload events
    } catch (error: any) {
      alert(error.message || "Failed to create event");
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await eventAPI.deleteEvent(eventId);
      await loadEvents(); // Reload events
    } catch (error: any) {
      alert(error.message || "Failed to delete event");
    }
  };

  const addUser = async (
    newUser: Pick<User, "email" | "role" | "department" | "class">
  ) => {
    try {
      await userAPI.createUser(
        newUser.email,
        newUser.role,
        newUser.department,
        newUser.class
      );
      await loadUsers(); // Reload users
    } catch (error: any) {
      alert(error.message || "Failed to create user");
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === user?.uid) {
      alert("You cannot delete your own account.");
      return;
    }
    try {
      await userAPI.deleteUser(userId);
      await loadUsers(); // Reload users
    } catch (error: any) {
      alert(error.message || "Failed to delete user");
    }
  };

  const authContextValue = useMemo(
    () => ({ user, loading, login, signup, logout, updateUser }),
    [user, loading]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {!user ? (
        <LoginPage />
      ) : (
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {user.role === UserRole.ADMIN && (
              <AdminDashboard
                events={events}
                users={users}
                addEvent={addEvent}
                deleteEvent={deleteEvent}
                deleteUser={deleteUser}
                addUser={addUser}
              />
            )}
            {user.role === UserRole.LECTURER && (
              <LecturerDashboard
                events={events}
                addEvent={addEvent}
                deleteEvent={deleteEvent}
              />
            )}
            {user.role === UserRole.STUDENT && (
              <StudentDashboard events={events} />
            )}
          </main>
        </div>
      )}
    </AuthContext.Provider>
  );
}
