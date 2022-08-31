A simple Starboard Discord Bot, made as an updated version of the one found in Dr1fterX's St1gBot on his Discord Server.

## Features

- `/settings` Command to configure or view basic Starboard Settings
- Buttons on Starboarded Messages to link back to the original Message
- Supports Spoiler-marked Attachments (won't show them on Starboard!)
- Ability to prevent Users from adding a Star Reaction to their own Messages
    - *As long as the Bot has the "Manage Messages" Permission*

## Commands

> **Note**
> The Default Member Permissions on the Commands can be overridden using Discord's Desktop or Web Browser Clients, by going to Server Settings > Integrations > [Click on Bot's Name].
> Members cannot use or even see Commands they do not have Permission for.

### `/settings view`
> **Note**
> Requires "Manage Server" Permission by default

- Allows the User to view the current Starboard Settings

### `/settings edit`
> **Note**
> Requires the "Manage Server" Permission by default

- Allows changing the Starboard Settings
- Settings are as follows:
    - `channel` - Sets which Text Channel is designated as the "Starboard Channel"
    - `minimum-stars` - Sets the minimum number of Star Reactions needed for a Message to be posted to the Starboard
