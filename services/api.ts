// API Service for communicating with backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Helper function to make authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// ============ AUTH APIs ============
export const authAPI = {
  signup: async (email: string, password: string, institutionName: string) => {
    return authFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, institutionName }),
    });
  },

  login: async (email: string, password: string, institutionName: string) => {
    return authFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, institutionName }),
    });
  },

  getProfile: async () => {
    return authFetch("/auth/profile");
  },

  updateProfile: async (data: {
    username?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    return authFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getInstitutions: async () => {
    return authFetch("/institutions");
  },
};

// ============ USER APIs (Admin only) ============
export const userAPI = {
  createUser: async (
    email: string,
    role: string,
    department?: string,
    classLevel?: string
  ) => {
    return authFetch("/users", {
      method: "POST",
      body: JSON.stringify({ email, role, department, classLevel }),
    });
  },

  getUsers: async () => {
    return authFetch("/users");
  },

  deleteUser: async (userId: string) => {
    return authFetch(`/users/${userId}`, {
      method: "DELETE",
    });
  },

  getAnalytics: async () => {
    return authFetch("/analytics");
  },
};

// ============ EVENT APIs ============
export const eventAPI = {
  createEvent: async (eventData: {
    title: string;
    description: string;
    eventDate: string;
    location: string;
    targetAudienceType: string;
    targetAudienceValue?: string;
  }) => {
    return authFetch("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  getEvents: async (filter?: string) => {
    const queryParam = filter ? `?filter=${filter}` : "";
    return authFetch(`/events${queryParam}`);
  },

  getEventById: async (eventId: string) => {
    return authFetch(`/events/${eventId}`);
  },

  updateEvent: async (eventId: string, eventData: any) => {
    return authFetch(`/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  },

  deleteEvent: async (eventId: string) => {
    return authFetch(`/events/${eventId}`, {
      method: "DELETE",
    });
  },

  registerForEvent: async (eventId: string) => {
    return authFetch(`/events/${eventId}/register`, {
      method: "POST",
    });
  },

  submitFeedback: async (eventId: string, rating: number, comment: string) => {
    return authFetch(`/events/${eventId}/feedback`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    });
  },
};
