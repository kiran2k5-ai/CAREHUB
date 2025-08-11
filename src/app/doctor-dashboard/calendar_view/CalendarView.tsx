'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';

export default function CalendarView() {
  const [events, setEvents] = useState([
    {
      title: 'Consultation - John Doe',
      start: '2025-08-12T10:00:00',
      end: '2025-08-12T11:00:00',
    },
    {
      title: 'Follow-up - Jane Smith',
      start: '2025-08-13T14:00:00',
      end: '2025-08-13T14:30:00',
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Doctor Calendar View</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          height="auto"
          editable={false}
          selectable={true}
        />
      </div>
    </div>
  );
}
