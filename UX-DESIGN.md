# Doin — UX Design

## Overview

Doin is a social discovery application that helps people connect through shared interests and meet up for activities. These mobile-first wireframes document the proposed MVP experience, from account setup to discovering people, joining events, creating activities, and managing a profile.

## Interactive Prototype
Our Figma prototype shows how someone can move through Doin and complete important tasks, such as creating an account, discovering people with similar interests, and joining or organizing events. The buttons, navigation links, and confirmation screens are intended to demonstrate the experience of using the app.

[View the Doin Interactive Prototype](https://www.figma.com/proto/HJfOjPhssFM3pGJFTmtXnC/Doin---App-Map-Wireframes?node-id=25-385&t=H9fvTGV6YYzhX6hX-1&scaling=min-zoom&content-scaling=fixed&page-id=1%3A6&starting-point-node-id=24%3A71)

The prototype opens in presentation mode, allowing viewers to navigate the designed experience directly in Figma.

## App Map
The app map organizes the major Doin sections and their parent–child relationships. It includes entry and onboarding screens, people discovery and profiles, event discovery and participation, event creation and management, and account/profile screens. The map focuses on the screen hierarchy rather than every possible navigation link.

![App Map](<ux-design/Doin - App Map_Wireframes.png>)

## Wireframes
The screens below follow the current Figma exports in order; the image filenames retain their original numbering. Each image is a separate mobile wireframe; interactive confirmation and filter states are documented alongside the main screens.

### 1. Welcome Screen
The welcome screen introduces Doin as a place to meet people and do activities together. Visitors can choose Create account to register or Log in to access an existing account.

![Welcome Screen](<ux-design/01 Welcome.png>)

### 2. Sign Up Screen
New users create an account by entering their full name, email address, password, and password confirmation. The Continue button progresses registration; an existing user can select Log in instead.

![Sign Up Screen](<ux-design/02 Sign Up.png>)

### 3. Log In Screen
Returning users sign in with an email address and password. The screen includes a Forgot password? link and a route to create an account.

![Log In](<ux-design/03 Log In.png>)

### 4. Interests Onboarding Screen
During onboarding, users choose activities they enjoy, such as coffee, movies, studying, or hiking. Multiple interests can be selected before choosing Next to continue the setup flow.

![Interests Onboarding Screen](<ux-design/04 Interests onboarding.png>)

### 5. Profile Setup Screen
Users can add a profile photo and provide a short bio and location. An optional availability field lets them share when they may be free. Finish setup completes this stage of onboarding.

![Setup Profile Screen](<ux-design/05 Setup Profile.png>)

### 6. Discover People Screen
Users can search for people by interest or name and use interest/location filters to narrow results. The results show preview cards with a person’s name and interests; View profile opens the selected person’s page.

![Discover people Screen](<ux-design/06 Discover People.png>)

### 7. Person Profile Screen
This screen displays another member’s profile photo placeholder, interests, short bio, and shared interests. A user can send a connection request or return to discovery.

![Person Profile Screen](<ux-design/07 Person Profile.png>)

### 8. Events Feed Screen
Users can search events and filter by date, category, or location. Event cards show brief details and a View event action. The Create button starts the event-creation flow.

![Events Feed Screen](<ux-design/08 Events Feed.png>)

### 9. Event Details Screen
The selected event’s cover image placeholder, time, location, host, description, and attendee count are displayed here. The Join event button begins the RSVP process.

![Event Details Screen](<ux-design/09 Event Details.png>)

### 10. Join Event Confirmation Screen
Before joining, users review a summary of the event, including its date, venue, and available spots. Confirm RSVP proceeds, while Cancel backs out without joining.

![Join Event Confirmation Screen](<ux-design/10 Join Event Confirmation.png>)

### 11. Event Joined Screen
After confirming an RSVP, users see a success message indicating that they are going to the event. They can select View my events or Discover more events.

![Event Joined Screen](<ux-design/11 Event Joined.png>)

### 12. Create Event Screen
This form lets a user publish a new event. It includes fields for title, description, date and time, location, capacity, and category, followed by a Publish event button.

![Create Event Screen](<ux-design/12 Create Event.png>)

### 13. My Events Screen
Users can switch between Joined and Hosting to see events they plan to attend or have organized. Selecting an event opens its details, and Create an event begins a new event.

![My Events Screen](<ux-design/14 My Events.png>)

### 14. My Profile Screen
The user’s own profile shows a photo placeholder, name, location, and interests. From here, users can open Edit profile, My events, or Settings.

![My Profile Screen](<ux-design/15 My Profile.png>)

### 15. Edit Profile Screen
Users can change their display name, bio, interests, and location. Save changes applies the updates, while Cancel exits without saving them.

![Edit Profile Screen](<ux-design/16 Profile.png>)

### 16. Event Filters Overlay
This view shows event filters for category, date, and location. Users can select criteria and apply them to the event feed, or clear the filter selections.

![Event Filters Overlay](<ux-design/17 Filters Overlay.png>)

### 17. Event Management Screen
An event host can review attendee information and remaining spots. The screen provides Edit event and Cancel event actions; it also indicates that cancellation requires confirmation.

![Event Management Screen](<ux-design/18 Event management.png>)

### 18. Leave Event Confirmation Dialog
This confirmation state warns that leaving an event will remove the RSVP and make the spot available. Users can choose Leave event to confirm or Keep RSVP to stay enrolled.

![Leave Event Confirmation Dialog](<ux-design/19 Leave Event Confirmation Dialog.png>)

### 19. Cancel Event Confirmation
When a host selects Cancel event, a confirmation dialog should explain that the event will be canceled for all attendees. The host can choose Cancel event to confirm or Keep event to return without canceling. The team still needs to export this wireframe as an individual PNG and add its image below this description.

## Interaction and Layout Notes
- Mobile-first: The designs use the same screen width for all mobile wireframes.
- Navigation: Signed-in screens consistently show the bottom navigation options for People, Events, Connect, and Profile where shown.
- Interaction states: RSVP confirmation and success are shown separately, as are event filters and the leave-event confirmation dialog.
- Visual placeholders: Gray shapes stand in for profile photos and event images, focusing the wireframes on layout and navigation rather than final styling.

## Design Source
The original editable Figma file is stored at [`ux-design/Doin - App Map_Wireframes.fig`](ux-design/Doin - App Map_Wireframes.fig).
