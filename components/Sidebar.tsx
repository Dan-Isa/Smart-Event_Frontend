import React, { useContext, useState } from "react";
import { AuthContext } from "../App";
import { User, UserRole, Notification } from "../types";
import Modal from "./Modal";
import { authAPI } from "../services/api";

// Mock Notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "student-uid",
    message: "Event 'Mid-term seminar' has been updated.",
    link: "/events/1",
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: "2",
    userId: "student-uid",
    message: "New event 'Career Fair 2024' is available.",
    link: "/events/2",
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: "3",
    userId: "student-uid",
    message: "Your registration for 'Guest Lecture' is confirmed.",
    link: "/events/3",
    isRead: true,
    createdAt: new Date(),
  },
];

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-primary-200 hover:text-white"
        aria-label="Open notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-800 font-bold border-b">
            Notifications
          </div>
          {mockNotifications.map((n) => (
            <a
              key={n.id}
              href="#"
              className={`block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 ${
                !n.isRead ? "font-semibold" : ""
              }`}
            >
              <p>{n.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {n.createdAt.toLocaleTimeString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateUser } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords
    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword && !currentPassword) {
      setError("Current password is required to change password");
      return;
    }

    setLoading(true);

    try {
      // Prepare update data
      const updateData: any = {};

      if (username && username !== user?.username) {
        updateData.username = username;
      }

      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      // Call API to update profile
      await authAPI.updateProfile(updateData);

      // Update local user state
      if (updateData.username) {
        updateUser({ username: updateData.username });
      }

      setSuccess("Profile updated successfully!");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Change Password
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:bg-primary-300"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Sidebar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <aside className="w-64 bg-primary-800 text-white flex flex-col p-4 space-y-6">
        <div className="text-center py-4 border-b border-primary-700">
          <h1 className="font-bold text-2xl">SmartEvents</h1>
          <p className="text-sm text-primary-300">{user.institution}</p>
        </div>

        <div className="flex-1">
          {/* Navigation links can be added here if needed */}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="font-semibold">{user.username || user.email}</p>
              <p className="text-primary-200 text-sm capitalize">{user.role}</p>
            </div>
            <NotificationBell />
          </div>

          {(user.role === UserRole.STUDENT ||
            user.role === UserRole.LECTURER) && (
            <button
              onClick={() => setProfileModalOpen(true)}
              className="w-full bg-primary-700 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 focus:outline-none"
            >
              Edit Profile
            </button>
          )}

          <button
            onClick={logout}
            className="w-full bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-500 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </aside>
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
