import React, { useState, useContext, useEffect } from "react";
import Modal from "../components/Modal";
import { AuthContext } from "../App";
import { Event, AudienceType, Registration } from "../types";
import EventForm from "../components/EventForm";
import { eventAPI } from "../services/api";

interface LecturerDashboardProps {
  events: Event[];
  addEvent: (event: Omit<Event, "id" | "registrations" | "feedback">) => void;
  deleteEvent: (eventId: string) => void;
}

const EventCard: React.FC<{
  event: Event;
  onManage: () => void;
  onViewRegistrations: () => void;
  onDelete: () => void;
  registrationCount: number;
}> = ({
  event,
  onManage,
  onViewRegistrations,
  onDelete,
  registrationCount,
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
    <div className="flex-grow">
      <h3 className="text-xl font-bold text-primary-800">{event.title}</h3>
      <p className="text-gray-500 text-sm">{event.date.toLocaleString()}</p>
      <p className="text-gray-600 text-sm mt-1">📍 {event.location}</p>
      <p className="text-gray-700 mt-2">{event.description}</p>
      <div className="mt-2">
        <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
          {event.targetAudience.type === AudienceType.GENERAL
            ? "General"
            : event.targetAudience.type === AudienceType.DEPARTMENT
            ? `Dept: ${event.targetAudience.value}`
            : `Class: ${event.targetAudience.value}`}
        </span>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t flex justify-between items-center">
      <span className="text-sm font-semibold text-gray-600">
        {registrationCount} Registered
      </span>
      <div className="space-x-3">
        <button
          onClick={onViewRegistrations}
          className="text-sm text-primary-600 hover:underline"
        >
          View Registrations
        </button>
        <button
          onClick={onManage}
          className="text-sm text-gray-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const LecturerDashboard: React.FC<LecturerDashboardProps> = ({
  events,
  addEvent,
  deleteEvent,
}) => {
  const { user } = useContext(AuthContext);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isRegistrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const handleViewRegistrations = async (event: Event) => {
    setSelectedEvent(event);
    setRegistrationsModalOpen(true);
    setLoadingRegistrations(true);

    try {
      // Fetch event details with registrations
      const response = await eventAPI.getEventById(event.id);
      if (response.event.registrations) {
        // Map backend registrations to frontend format
        const mappedRegistrations = response.event.registrations.map(
          (reg: any) => ({
            studentId: reg.student_id || reg.id,
            studentName: reg.username || reg.email.split("@")[0],
            studentEmail: reg.email,
            registeredAt: new Date(reg.registered_at),
          })
        );
        setRegistrations(mappedRegistrations);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error("Error loading registrations:", error);
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleCreateEvent = (
    eventData: Omit<Event, "id" | "registrations" | "feedback">
  ) => {
    addEvent(eventData);
    setCreateModalOpen(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      await deleteEvent(eventId);
    }
  };

  // Filter events: show lecturer's own events
  const myEvents = events.filter((event) => event.creator_id === user?.uid);

  return (
    <>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
              <p className="text-gray-600 mt-1">
                Create and manage your events
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 shadow-sm flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Event
            </button>
          </div>

          {myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onManage={() => {
                    /* Can implement edit functionality later */
                  }}
                  onViewRegistrations={() => handleViewRegistrations(event)}
                  onDelete={() => handleDeleteEvent(event.id)}
                  registrationCount={event.registration_count || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No events yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first event.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Event
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Event"
      >
        <EventForm
          onSubmit={handleCreateEvent}
          onClose={() => setCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isRegistrationsModalOpen}
        onClose={() => {
          setRegistrationsModalOpen(false);
          setRegistrations([]);
        }}
        title={`Registrations for ${selectedEvent?.title}`}
      >
        <RegisteredStudentsList
          registrations={registrations}
          loading={loadingRegistrations}
        />
      </Modal>
    </>
  );
};

const RegisteredStudentsList: React.FC<{
  registrations: Registration[];
  loading: boolean;
}> = ({ registrations, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {registrations.length === 0 ? (
        <div className="text-center py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="mt-2 text-gray-600">No students have registered yet.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>{registrations.length}</strong>{" "}
              {registrations.length === 1 ? "student has" : "students have"}{" "}
              registered for this event
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {registrations.map((reg, index) => (
              <li key={reg.studentId || index} className="py-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {reg.studentName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">
                      {reg.studentName}
                    </p>
                    <p className="text-sm text-gray-500">{reg.studentEmail}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Registered: {reg.registeredAt.toLocaleDateString()} at{" "}
                      {reg.registeredAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default LecturerDashboard;
