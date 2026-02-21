'use client';

import { forwardRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import { CalendarOptions } from '@fullcalendar/core';

// React 19 compatible wrapper for FullCalendar
const FullCalendarWrapper = forwardRef<any, CalendarOptions>((props, ref) => {
  // In React 19, ref is a regular prop, so we need to handle it differently
  const calendarProps = { ...props };
  
  return <FullCalendar {...calendarProps} ref={ref} />;
});

FullCalendarWrapper.displayName = 'FullCalendarWrapper';

export default FullCalendarWrapper;