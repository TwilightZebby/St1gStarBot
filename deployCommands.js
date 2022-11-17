const { DiscordClient } = require("./constants.js");
const Config = require("./config.js");

// Bring in Slash Commands for (un)registering
const RegisterCommand = require('./Interactions/SlashCommands/register.js');
const UnregisterCommand = require('./Interactions/SlashCommands/unregister.js');
const SettingsCommand = require('./Interactions/SlashCommands/settings.js');

// Login Bot
DiscordClient.login(Config.TOKEN);

// Wait for Ready
DiscordClient.once('ready', async () => {
    // Register Commands
    //await DiscordClient.application.commands.create(RegisterCommand.registerData(), Config.ErrorLogGuildID);
    //await DiscordClient.application.commands.create(UnregisterCommand.registerData(), Config.ErrorLogGuildID);

    const CommandDataArray = [
        SettingsCommand.registerData()
    ];

    await DiscordClient.application.commands.set(CommandDataArray); // Registers commands globally (for all Servers the Bot is in)

    console.log("Deployed Commands!");
    process.exit();
});






/******************************************************************************* */
// DEBUGGING AND ERROR LOGGING
// Warnings
process.on('warning', (warning) => { return console.warn("***WARNING: ", warning); });
DiscordClient.on('warn', (warning) => { return console.warn("***DISCORD WARNING: ", warning); });

// Unhandled Promise Rejections
process.on('unhandledRejection', (err) => { return console.error("***UNHANDLED PROMISE REJECTION: ", err); });

// Discord Errors
DiscordClient.on('error', (err) => { return console.error("***DISCORD ERROR: ", err); });
