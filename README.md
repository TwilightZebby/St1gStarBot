A simple Starboard Discord Bot, made as an updated version of the one found in Dr1fterX's St1gBot on his Discord Server.

---

## Features

- `/settings` Command to configure or view basic Starboard Settings
- Buttons on Starboarded Messages to link back to the original Message
- Supports Spoiler-marked Attachments (won't show them on Starboard!)
- Ability to prevent Users from adding a Star Reaction to their own Messages
    - *As long as the Bot has the "Manage Messages" Permission*

---

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

---

# How to register the Slash Command

1. Go into `./deployCommands.js` and uncomment the relevant line
2. Use `node deployCommands.js` in your command line/terminal

# How to UNregister (remove from Discord) the Slash Command

1. Go to `./deployCommands.js` and uncomment the relevant line
2. Make sure you are unregistering the Command from the Scope it was previously registered to.
  - For instance: Trying to unregister it globally when it is registered to a specific Server will fail.
  - Do **NOT** add anything in the empty Array in the `.set()` method. The empty Array is used as a shortcut for "unregister ALL Application Commands for this Bot".
3. Use `node deployCommands.js` in your command line/terminal

---

# Configuration File

- `ErrorLogChannelID` - Currently unused
- `ErrorLogGuildID` - Used in `./deployCommands.js` for (un)registering Slash Command to/from the specific Server
- `BotDevID` - Used in the Text Command Permissions System
