
import { api } from '../../api'
import {
  IconButton,
  Page,
  Calendar,
  SectionHeader,
  Card,
  EventCard,
  EmptyState,
  Button,
  LoadingState,
  ErrorState,
} from '../../components'
import { useApi } from '../../hooks/useApi'
import { todayString } from '../../utils/format'

/**
 * Upcoming screen.
 * Owner: Ryan · Issues: #76
 * Wireframe: ux-design/prototype/upcoming.png
 *
 * Calendar plus 'This week' list.
 */
async function loadUpcoming() {
  const [events, applications] = await Promise.all([
    api.getEvents(),
    api.getApplications(),
  ])

  return { events, applications }
}

export default function Upcoming() {
  const { data, loading, error, reload } = useApi(loadUpcoming, [])

  if (loading && !data) {
    return (
      <Page title="Upcoming">
        <LoadingState />
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Upcoming">
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  const { events, applications } = data

  const applicationsById = Object.fromEntries(
    applications.map((application) => [
      application.id,
      application,
    ])
  )

  // Get events from today through the next 7 days
  const today = todayString()
  const weekEnd = new Date(`${today}T00:00:00`)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const weekEndString = [
    weekEnd.getFullYear(),
    String(weekEnd.getMonth() + 1).padStart(2, '0'),
    String(weekEnd.getDate()).padStart(2, '0'),
  ].join('-')

  const nextUp = events
    .filter(
      (event) =>
        event.date >= today &&
        event.date < weekEndString
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <Page
      title="Upcoming"
      action={
        <IconButton
          icon="plus"
          label="Add event"
          variant="primary"
          to="/events/new"
        />
      }
    >
      <Calendar />

      <section className="home__section">
        <SectionHeader title="This week" />

        {nextUp.length > 0 ? (
          <Card padding="none">
            {nextUp.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                application={
                  applicationsById[event.applicationId]
                }
              />
            ))}
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon="calendar"
              title="Nothing coming up"
              message="Deadlines, interviews and follow-ups you add will show up here."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  to="/events/new"
                >
                  Add event
                </Button>
              }
            />
          </Card>
        )}
      </section>
    </Page>
  )
}
