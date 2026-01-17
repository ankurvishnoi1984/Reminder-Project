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
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Event Configuration</h1>

      <div className="space-y-4 sm:space-y-6">
        {events?.map((event) => (
          <div key={event.id} className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-bold">{event.eventType}</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={event.isEnabled}
                  onChange={() => handleToggle(event)}
                  className="mr-2"
                />
                Enable
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Channels</label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {['Email', 'WhatsApp', 'SMS'].map((channel) => (
                  <label key={channel} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={event.channels?.includes(channel)}
                      onChange={(e) => {
                        const newChannels = e.target.checked
                          ? [...(event.channels || []), channel]
                          : event.channels.filter(c => c !== channel);
                        handleChannelsChange(event, newChannels);
                      }}
                      className="mr-2"
                    />
                    {channel}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reminder Days</label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {[0, 1, 2, 3, 7].map((day) => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={event.reminderDays?.includes(day)}
                      onChange={(e) => {
                        const newDays = e.target.checked
                          ? [...(event.reminderDays || []), day]
                          : event.reminderDays.filter(d => d !== day);
                        handleReminderDaysChange(event, newDays);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{day === 0 ? 'Same Day' : `${day} Day${day > 1 ? 's' : ''} Before`}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventConfiguration;
