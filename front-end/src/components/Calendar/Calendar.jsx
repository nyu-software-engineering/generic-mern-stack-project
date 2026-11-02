import './Calendar.css'
import React, { useState } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed (Jan = 0)

    // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Get total days in the current month
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Generate blank spaces for days of the previous month
    const blanks = Array(firstDayIndex).fill(null);
    // Generate array for the days of the current month [1, 2, 3... totalDays]
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);

    // Combine blanks and days to construct the grid array
    const calendarCells = [...blanks, ...days];

    const changeMonth = (offset) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    return (
    <div>
        {/* Calendar Header Title */}
        

        {/* Grid View */}
        <div>
            {/* Weekday Labels */}
            {WEEKDAYS.map(day => (
            <div key={day}>{day}</div>
            ))}

            {/* Calendar Days */}
            {calendarCells.map((day, index) => (
                <div key={index}>{day}</div>))}
        </div>
    </div>
    );
}