import { Link } from 'react-router-dom'
import { formatTime } from '../../utils/format'
import { DateTile } from '../DateTile/DateTile'
import './EventCard.css'

/**
 * One event (deadline, interview, follow-up) in a list: date tile, title, "company · position" and time.
 * Used on Home (Next up), Upcoming and Application Details. Several in a row get dividers automatically
 * when placed inside <Card padding="none">.
 *
 * @param event        an event object from the api
 * @param application  the related application (for the "company · position" line), optional
 * @param to           where tapping goes (default: the edit event page)
 *
 * @example
 * <Card padding="none">
 *   {events.map((event) => <EventCard key={event.id} event={event} application={byId[event.applicationId]} />)}
 * </Card>
 */
export function EventCard({ event, application, to }) {
  return (
    <Link to={to ?? `/events/${event.id}`} className="event-card">
      <DateTile date={event.date} />
      <span className="event-card__text">
        <span className="event-card__title">{event.title}</span>
        {application && (
          <span className="event-card__meta">
            {application.company} · {application.position}
          </span>
        )}
      </span>
      <span className="event-card__time">{formatTime(event.time)}</span>
    </Link>
  )
}
