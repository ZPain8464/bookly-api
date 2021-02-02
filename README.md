# Bookly - API

A scheduling and event planning app for teams and professionals.

Live version: (https://bookly-app.vercel.app/)

## Introduction

Bookly makes it easy for business owners and professionals to quickly create and
update events. Once you've created an account, you can add team members to your
team via email invitations. Once a user accepts your invite, you'll see them in
your roster and you can add them to specific events.

## Technologies

- Node and Express
  - Authentication via JWT
  - RESTful API
- Testing
  - Supertest (integration)
  - Mocha and Chai (unit)
- Database
  - PosgreSQL
  - Knex.js

## Production

Deployed via Heroku

## API Endpoints

### Users Router

```
- /api/users
- - GET - gets user
- - POST - creates new user
```

#### Users/:id

```
- /api/users/:id
- - GET - gets users by id
- - PATCH - updates user's profile information
```

#### Users/unregistered-user/sign-up

```
- /api/users/unregistered-user/sign-up
- - GET - when a user invites a team member, they must submit a valid email address. If the invitation is sent successfully, a temporary account with the team member's email is created, and credentials will change after the invited team member updates their password.
```

#### Users/update-password/:id

```
- /api/users/update-password/:id
- - PATCH - updates invited team members's password after they have successfully registered
```

#### Users/registered-user/invite/find-user

```
- /api/users/registered-user/invite/find-user
- - GET - finds users by their email address. Necessary for initing current team members to your events.
```

### Auth Router

```
- /api/auth/login
- - POST - logs in user
```

### Emails Router

```
- /api/emails
- - POST - Sends an invittion email to users to join your team as a team member
```

#### Emails/event-invite

```
- /api/emails/event-invite
- - POST - Sends an invitation email to your team members to join an event
```

### Events Router

```
- /api/events
- - GET - Retrieves events you've created with your team_id
- - POST - creates a new event
```

#### Events/:id

```
- /api/events/:id
- - GET - Gets events by id
- - DELETE - Deletes events by id
- - PATCH - Updates events by id
```

#### Events/team-members/:id

```
- /api/events/team-members/:id
- - GET - Gets events you've joined as a team member with your team_member "team_id"
```

### Teams

```
- /api/teams
- - GET - Gets your team by your creator_id
- - POST - Creates a default team for each user upon successfully registering an account
```

### TeamMembers Router

```
- /api/team-members
- - GET - Gets your team members invited by you with your team_id
- - POST - Creates a new team member connected to your team by team_id
```

#### TeamMembers/:user_id

```
- /api/team-members/:user_id
- - GET - Gets team_members by team_id
```

#### TeamMemmbers/join-event/:user_id

```
- /api/team-members/join-event/:user_id
- - PATCH - Adds team member to your event once they've accepted your event invite
```
