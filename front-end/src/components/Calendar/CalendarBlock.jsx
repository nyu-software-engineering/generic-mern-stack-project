import './Calendar.css';
import React from 'react';

export function CalendarBlock({ date, isToday = false }) {
    if (date === null) {
        {/* empty calendar cell*/}
        return <div className="calendar-empty" />;
    }

    return (
        <div
            className={`calendar-block ${isToday ? 'calendar-block--today' : ''}`}
        >
            <span className="calendar-block-day">
                {date}
            </span>
            {isToday && <span className="calendar-block-today-indicator"/>}
        </div>
    );
}