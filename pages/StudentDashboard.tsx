import React, { useState, useContext, useEffect } from "react";
import Modal from "../components/Modal";
import { AuthContext } from "../App";
import { Event, AudienceType } from "../types";
import { eventAPI } from "../services/api";

interface StudentDashboardProps {
  events: Event[];
}

const EventCard: React.FC<{
  event: Event;
  onRegister: () => void;
  onFeedback: () => void;
  isRegistered: boolean;
  isPast: boolean;
  isRegistering: boolean;
}> = ({
  event,
  onRegister,
  onFeedback,
  isRegistered,
  isPast,
  isRegistering,
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between h-full">
    <div>
      <h3 className="text-xl font-bold text-primary-800">{event.title}</h3>
      <p className="text-gray-500 text-sm mt-1">
        📅 {event.date.toLocaleDateString()} at{" "}
        {event.date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p className="text-gray-600 mt-1 text-sm">📍 {event.location}</p>
      <p className="text-gray-600 mt-1 text-sm">
        👤 Hosted by: {event.creatorName}
      </p>
      <p className="text-gray-700 mt-3">{event.description}</p>
      <div className="mt-3">
        <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
          {event.targetAudience.type === AudienceType.GENERAL
            ? "Open to All"
            : event.targetAudience.type === AudienceType.DEPARTMENT
            ? `${event.targetAudience.value} Department`
            : `${event.targetAudience.value} Class`}
        </span>
      </div>
    </div>
    <div className="mt-4">
      {isPast ? (
        <button
          onClick={onFeedback}
          className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 flex items-center justify-center"
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
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          Give Feedback
        </button>
      ) : isRegistered ? (
        <button
          disabled
          className="w-full bg-green-500 text-white px-4 py-2 rounded-md cursor-not-allowed flex items-center justify-center"
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          Registered
        </button>
      ) : (
        <button
          onClick={onRegister}
          disabled={isRegistering}
          className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:bg-primary-300 flex items-center justify-center"
        >
          {isRegistering ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Registering...
            </>
          ) : (
            <>
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
              Register
            </>
          )}
        </button>
      )}
    </div>
  </div>
);

const StudentDashboard: React.FC<StudentDashboardProps> = ({ events }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(() => {
    const registered = events
      .filter(
        (event) => event.is_registered === "1" || event.is_registered === true
      )
      .map((event) => event.id);
    return new Set(registered);
  });

  useEffect(() => {
    const registered = events
      .filter(
        (event) => event.is_registered === "1" || event.is_registered === true
      )
      .map((event) => event.id);
    setRegisteredEvents(new Set(registered));
  }, [events]);

  const [registeringEventId, setRegisteringEventId] = useState<string | null>(
    null
  );
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleRegister = async (eventId: string) => {
    setRegisteringEventId(eventId);

    try {
      await eventAPI.registerForEvent(eventId);
      setRegisteredEvents((prev) => new Set(prev).add(eventId));
      alert(
        "Successfully registered for the event! Check your email for confirmation."
      );
    } catch (error: any) {
      alert(error.message || "Failed to register for event");
    } finally {
      setRegisteringEventId(null);
    }
  };

  const handleFeedback = (event: Event) => {
    setSelectedEvent(event);
    setFeedbackModalOpen(true);
  };

  const now = new Date();
  const upcomingEvents = events.filter((e) => e.date > now);
  const pastEvents = events.filter((e) => e.date <= now);

  // Filter events based on user's department and class
  const relevantEvents = upcomingEvents.filter((event) => {
    const aud = event.targetAudience;
    if (aud.type === AudienceType.GENERAL) return true;
    if (aud.type === AudienceType.DEPARTMENT && aud.value === user?.department)
      return true;
    if (aud.type === AudienceType.CLASS && aud.value === user?.class)
      return true;
    return false;
  });

  const relevantPastEvents = pastEvents.filter((event) => {
    const aud = event.targetAudience;
    if (aud.type === AudienceType.GENERAL) return true;
    if (aud.type === AudienceType.DEPARTMENT && aud.value === user?.department)
      return true;
    if (aud.type === AudienceType.CLASS && aud.value === user?.class)
      return true;
    return false;
  });

  return (
    <>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-1">
              {user?.department && `${user.department} Department`}
              {user?.class && ` • ${user.class}`}
            </p>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "upcoming"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Upcoming Events ({relevantEvents.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "past"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Past Events ({relevantPastEvents.length})
              </button>
            </nav>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "upcoming" &&
              relevantEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={() => handleRegister(event.id)}
                  onFeedback={() => handleFeedback(event)}
                  isRegistered={registeredEvents.has(event.id)}
                  isPast={false}
                  isRegistering={registeringEventId === event.id}
                />
              ))}
            {activeTab === "past" &&
              relevantPastEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={() => {}}
                  onFeedback={() => handleFeedback(event)}
                  isRegistered={false}
                  isPast={true}
                  isRegistering={false}
                />
              ))}
          </div>

          {((activeTab === "upcoming" && relevantEvents.length === 0) ||
            (activeTab === "past" && relevantPastEvents.length === 0)) && (
            <div className="text-center py-12 bg-white rounded-lg shadow col-span-full">
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
                No events to show
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no {activeTab} events available for you at this time.
              </p>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false);
          setSelectedEvent(null);
        }}
        title={`Feedback for ${selectedEvent?.title}`}
      >
        <FeedbackForm
          eventId={selectedEvent?.id || ""}
          onClose={() => {
            setFeedbackModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      </Modal>
    </>
  );
};

const FeedbackForm: React.FC<{ eventId: string; onClose: () => void }> = ({
  eventId,
  onClose,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5");
      return;
    }

    if (!comment.trim()) {
      setError("Please provide a comment");
      return;
    }

    setSubmitting(true);

    try {
      await eventAPI.submitFeedback(eventId, rating, comment);
      alert("Thank you for your feedback!");
      onClose();
    } catch (error: any) {
      setError(error.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating (1-5 stars)
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${
                  star <= rating
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating} {rating === 1 ? "star" : "stars"}
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700"
        >
          Your Feedback
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
          placeholder="Tell us about your experience at this event..."
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:bg-primary-300"
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
};

export default StudentDashboard;
