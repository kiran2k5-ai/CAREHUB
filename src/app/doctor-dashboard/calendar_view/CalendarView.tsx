'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Basic styling
import '../../doctor-dashboard/calendar_view/CalendarView.css';
import { User, Video, IndianRupee } from 'lucide-react'; // Example if you're using Lucide


export default function CalendarView() {
  const [events, setEvents] = useState<any[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const formatted = data.data.map((apt: any) => {
            const start = new Date(`${apt.date} ${apt.time}`);
            const end = new Date(start.getTime() + 30 * 60000);
            return {
              id: apt.id,
              title: `Dr. ${apt.doctorName} - ${apt.reason}`,
              start: start.toISOString(),
              end: end.toISOString(),
              extendedProps: {
                description: `${apt.reason} (${apt.consultationType})`,
                doctor: apt.doctorName,
                fee: apt.consultationFee,
              },
            };
          });
          setEvents(formatted);
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to load appointments');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error while fetching appointments.');
      });
  }, []);

  const handleEventDrop = (info: EventDropArg) => {
    console.log('Event dropped to:', info.event.start);
    // Optional: update API here
  };

  const handleReschedule = (eventId: any) => {
    alert(`🔁 Reschedule clicked for event ${eventId}`);
    // You can open a modal here to select new date/time
  };

  const handleCancel = (eventId: any) => {
    alert(`❌ Cancel clicked for event ${eventId}`);
    // You can confirm and call cancel API here
  };
  const renderEventContent = (onReschedule: Function, onCancel: Function) => (arg: any) => {
  const { event } = arg;

  return (
    <Tippy
      content={
        <div className="p-4 bg-white rounded-lg shadow-lg w-64 text-sm text-gray-800">
          <div className="font-semibold text-base flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-blue-600" />
            Dr. {event.extendedProps.doctor}
          </div>
          <div className="text-gray-600 mb-1 flex items-center gap-1">
            <Video className="w-4 h-4 text-gray-500" />
            {event.extendedProps.description}
          </div>
          <div className="text-gray-800 mb-4 flex items-center gap-1">
            <IndianRupee className="w-4 h-4 text-yellow-500" />
            <strong>₹{event.extendedProps.fee}</strong>
          </div>
          <div className="flex justify-between gap-2">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md transition text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onReschedule(event.id);
              }}
            >
              Reschedule
            </button>
            <button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-md transition text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(event.id);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      }
      interactive={true}
      theme="light"
      placement="top"
      delay={[100, 0]}
    >
      <div className="cursor-pointer">{event.title}</div>
    </Tippy>
  );
};


  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">🗓️ Doctor Calendar View</h1>

      {status === 'loading' && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded shadow">
          ⏳ Loading appointments...
        </div>
      )}
      {status === 'error' && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded shadow">
          ❌ {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
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
          editable={true}
          selectable={true}
          eventDrop={handleEventDrop}
          eventContent={renderEventContent(handleReschedule, handleCancel)}
        />
      </div>
    </div>
  );
}

// 👇 Helper to render event with tooltip
const renderEventContent = (onReschedule: Function, onCancel: Function) => (arg: any) => {
  const { event } = arg;
  return (
    <Tippy
      content={
        <div className="text-left">
          <div className="font-semibold mb-1">🧑‍⚕️ {event.extendedProps.doctor}</div>
          <div className="text-sm text-gray-600 mb-2">{event.extendedProps.description}</div>
          <div className="text-sm mb-2">💰 Fee: ₹{event.extendedProps.fee}</div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onReschedule(event.id);
              }}
            >
              Reschedule
            </button>
            <button
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(event.id);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      }
      interactive={true}
      delay={[300, 0]}
      placement="top"
    >
      <div className="cursor-pointer">{event.title}</div>
    </Tippy>
  );
};
