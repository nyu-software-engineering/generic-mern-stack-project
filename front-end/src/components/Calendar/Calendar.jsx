import './Calendar.css';
import React, { useState } from 'react';
import { CalendarBlock } from './CalendarBlock';

// Update CalendarBlock to accept and use the isToday prop

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const blanks = Array(firstDayIndex).fill(null);

    //days start from 1 instead of 0
    const days = Array.from(
        { length: totalDays },
        (_, i) => i + 1
    );

    //Combine blank starter cells with actual days
    const calendarCells = [...blanks, ...days];
    
    //Change month -> Use later as prep
    const changeMonth = (offset) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    //month name for header by formatting the current date
    const monthName = currentDate.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="calendar">

            {/* Calendar Header */}
            <div className="calendar-header">
                <h2>{monthName}</h2>

                <div className="calendar-navigation">
                    <button onClick={() => changeMonth(-1)}>
                        &lt;
                    </button>

                    <button onClick={() => changeMonth(1)}>
                        &gt;
                    </button>
                </div>
            </div>
        
            {/* Calendar Grid */}
            <div className="calendar-grid">

                {/* Weekday Labels */}
                {WEEKDAYS.map(day => (
                    <div className="calendar-weekday" key={day}>
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {calendarCells.map((day, index) => (
                    <CalendarBlock
                        key={index}
                        date={day}
                        isToday={
                            day !== null &&
                            day === new Date().getDate() &&
                            month === new Date().getMonth() &&
                            year === new Date().getFullYear()
                        }
                    />
                ))}

            </div>
        </div>
    );
}