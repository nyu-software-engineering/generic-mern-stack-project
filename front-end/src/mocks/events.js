
import { faker } from '@faker-js/faker'
import { mockUsers } from './users'

// Create one fake event
const createMockEvent = () => {
  const id = faker.string.uuid()
  const startHour = faker.number.int({ min: 9, max: 18 })

  const activities = {
    Sports: ['Basketball Meetup', 'Soccer Match', 'Volleyball Game'],
    Music: ['Live Concert', 'Karaoke Night', 'Jazz Show'],
    Gaming: ['Gaming Tournament', 'Board Game Night'],
    Food: ['Pizza Party', 'Cooking Class', 'Brunch'],
    Social: ['Coffee Meetup', 'Community Picnic']
  }

  const category = faker.helpers.arrayElement(Object.keys(activities))
  const title = faker.helpers.arrayElement(activities[category])

  const organizer = faker.helpers.arrayElement(mockUsers)

  const attendees = faker.helpers.shuffle(
    mockUsers.filter(user => user.id !== organizer.id)
  ).slice(0, faker.number.int({ min: 3, max: 8 }))

  return {
    id: id,
    title: title,
    description: faker.lorem.paragraph(),
    date: faker.date.soon({ days: 30 }).toLocaleDateString('en-US'),
    startTime: `${startHour}:00`,
    endTime: `${startHour + 2}:00`,
    location: faker.location.city(),
    category: category,
    organizer: organizer.name,
    organizerId: organizer.id,
    capacity: faker.number.int({ min: 12, max: 25 }),
    attendeeIds: attendees.map(user => user.id),
    imageUrl: `https://image.msar.me/unsplash/random?query=${encodeURIComponent(title)}&orientation=landscape`
  }
}

export const mockEvent = createMockEvent()
