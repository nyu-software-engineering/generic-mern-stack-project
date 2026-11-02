import { IconButton, Page, PagePlaceholder, Calendar } from '../../components'

/**
 * Upcoming screen.
 * Owner: Ryan · Issues: #76
 * Wireframe: ux-design/prototype/upcoming.png
 *
 * Calendar plus 'This week' list. Load with api.getEvents(); use EventCard.
 */
export default function Upcoming() {
  return (
    <Page title="Upcoming" action={<IconButton icon="plus" label="Add event" variant="primary" to="/events/new" />}>
      <PagePlaceholder owner="Ryan" issues={[76]} wireframe="upcoming.png" />
      <Calendar /> 
    </Page>
  )
}
