export const getTickets = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/tickets', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch tickets');
  return await response.json();
};

export const submitTicket = async (ticketData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ticketData)
  });
  if (!response.ok) throw new Error('Failed to submit ticket');
  return await response.json();
};

export const updateTicket = async (ticketId, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update ticket');
  return await response.json();
}; 