import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({ appointments, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Create an array of days to render (including empty slots for offset)
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Helper to format date as YYYY-MM-DD
  const formatDateString = (y, m, d) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const today = new Date();
  const isToday = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <div className="calendar-container animate-fade-in">
      <div className="calendar-header-nav">
        <h3>{monthNames[month]} {year}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn" style={{ padding: '0.4rem' }} onClick={prevMonth}>
            <ChevronLeft size={20} />
          </button>
          <button className="btn" style={{ padding: '0.4rem 1rem' }} onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
          <button className="btn" style={{ padding: '0.4rem' }} onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-grid" style={{ gridTemplateRows: 'auto' }}>
        {dayNames.map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="calendar-day empty"></div>;

          const dateString = formatDateString(year, month, day);
          const dayAppointments = appointments.filter(a => a.date === dateString);

          return (
            <div key={`day-${day}`} className="calendar-day">
              <span className={`calendar-date-number ${isToday(day) ? 'today' : ''}`}>{day}</span>
              <div className="calendar-events">
                {dayAppointments.map(apt => {
                  let statusClass = 'status-scheduled';
                  if (apt.status === 'Canceled') statusClass = 'status-canceled';
                  if (apt.status === 'No Show') statusClass = 'status-no-show';

                  return (
                    <div 
                      key={apt.id} 
                      className={`calendar-event ${statusClass}`}
                      onClick={() => onEventClick(apt)}
                      title={`${apt.time} - ${apt.patientName} (${apt.reason})`}
                    >
                      {apt.time} {apt.patientName}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
