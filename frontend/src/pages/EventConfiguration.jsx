import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { toast } from 'react-toastify';

const EventConfiguration = () => {
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery('events', async () => {
    const response = await api.get('/events');
    return response.data;
  });

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/events/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
        toast.success('Event updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update event');
      }
    }
  );

  const handleToggle = (event) => {
    updateMutation.mutate({
      id: event.id,
      data: { isEnabled: !event.isEnabled }
    });
  };

  const handleChannelsChange = (event, channels) => {
    updateMutation.mutate({
      id: event.id,
      data: { channels }
    });
  };

  const handleReminderDaysChange = (event, days) => {
    updateMutation.mutate({
      id: event.id,
      data: { reminderDays: days }
    });
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
  <div className="space-y-8">
    {/* Page Title */}
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Event Configuration
      </h1>
      <p className="text-slate-500 text-sm mt-1">
        Configure reminder channels and timing for each event.
      </p>
    </div>

    <div className="space-y-6">
      {events?.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {event.eventType}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage notification behavior
              </p>
            </div>

            {/* Modern Toggle */}
            <button
              onClick={() => handleToggle(event)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                event.isEnabled
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  event.isEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Channels */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Channels
              </h3>

              <div className="flex flex-wrap gap-3">
                {["Email", "WhatsApp", "SMS"].map((channel) => {
                  const checked = event.channels?.includes(channel);

                  return (
                    <button
                      key={channel}
                      onClick={() => {
                        const newChannels = checked
                          ? event.channels.filter((c) => c !== channel)
                          : [...(event.channels || []), channel];
                        handleChannelsChange(event, newChannels);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition
                        ${
                          checked
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                      {channel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reminder Days */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Reminder Days
              </h3>

              <div className="flex flex-wrap gap-3">
                {[0, 1, 2, 3, 7].map((day) => {
                  const checked = event.reminderDays?.includes(day);
                  const label =
                    day === 0
                      ? "Same Day"
                      : `${day} Day${day > 1 ? "s" : ""} Before`;

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = checked
                          ? event.reminderDays.filter((d) => d !== day)
                          : [...(event.reminderDays || []), day];
                        handleReminderDaysChange(event, newDays);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition
                        ${
                          checked
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
};

export default EventConfiguration;
