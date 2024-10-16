const { RateLimitError, DMChannel } = require("discord.js");
const fs = require("fs");

const { DiscordClient, Collections } = require("./constants.js");
const Config = require("./config.js");



/******************************************************************************* */
// BRING IN FILES FOR COMMANDS AND INTERACTIONS
// Text Commands
const TextCommandFiles = fs.readdirSync("./TextCommands").filter(file => file.endsWith(".js"));
for ( const File of TextCommandFiles )
{
    const TempCommand = require(`./TextCommands/${File}`);
    Collections.TextCommands.set(TempCommand.Name, TempCommand);
}

// Slash Commands
const SlashCommandFiles = fs.readdirSync("./Interactions/SlashCommands").filter(file => file.endsWith(".js"));
for ( const File of SlashCommandFiles )
{
    const TempCommand = require(`./Interactions/SlashCommands/${File}`);
    Collections.SlashCommands.set(TempCommand.Name, TempCommand);
}

// Context Commands
const ContextCommandFiles = fs.readdirSync("./Interactions/ContextCommands").filter(file => file.endsWith(".js"));
for ( const File of ContextCommandFiles )
{
    const TempCommand = require(`./Interactions/ContextCommands/${File}`);
    Collections.ContextCommands.set(TempCommand.Name, TempCommand);
}

// Buttons
const ButtonFiles = fs.readdirSync("./Interactions/Buttons").filter(file => file.endsWith(".js"));
for ( const File of ButtonFiles )
{
    const TempButton = require(`./Interactions/Buttons/${File}`);
    Collections.Buttons.set(TempButton.Name, TempButton);
}

// Selects
const SelectFiles = fs.readdirSync("./Interactions/Selects").filter(file => file.endsWith(".js"));
for ( const File of SelectFiles )
{
    const TempSelect = require(`./Interactions/Selects/${File}`);
    Collections.Selects.set(TempSelect.Name, TempSelect);
}

// Modals
const ModalFiles = fs.readdirSync("./Interactions/Modals").filter(file => file.endsWith(".js"));
for ( const File of ModalFiles )
{
    const TempModal = require(`./Interactions/Modals/${File}`);
    Collections.Modals.set(TempModal.Name, TempModal);
}








/******************************************************************************* */
// DISCORD - READY EVENT
DiscordClient.once('ready', () => {
    DiscordClient.user.setPresence({ status: 'online' });
    console.log(`${DiscordClient.user.tag} is online and ready!`);
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

// Discord Rate Limit - Only uncomment when debugging
//DiscordClient.rest.on('rateLimited', (RateLimitError) => { return console.log("***DISCORD RATELIMIT HIT: ", RateLimitError); });








/******************************************************************************* */
// DISCORD - MESSAGE CREATE EVENT
const TextCommandHandler = require("./BotModules/Handlers/TextCommandHandler.js");

DiscordClient.on('messageCreate', async (message) => {
    // Partials
    if ( message.partial )
    {
        // Attempt to fetch full object
        try { await message.fetch(); }
        catch (err) { return; }
    }

    // Bots
    if ( message.author.bot ) { return; }

    // System Messages
    if ( message.system || message.author.system ) { return; }

    // DM Channel Messages
    if ( message.channel instanceof DMChannel ) { return; }

    // Safe-guard against Discord Outages
    if ( !message.guild.available ) { return; }



    // Check for (and handle) Commands
    let textCommandStatus = await TextCommandHandler.Main(message);
    if ( textCommandStatus === false )
    {
        // No Command detected
        return;
    }
    else if ( textCommandStatus === null )
    {
        // Prefix was detected, but wasn't a command on the bot
        return;
    }
    else
    {
        // Command failed or successful
        return;
    }
});








/******************************************************************************* */
// DISCORD - INTERACTION CREATE EVENT
const SlashCommandHandler = require("./BotModules/Handlers/SlashCommandHandler.js");
const ContextCommandHandler = require("./BotModules/Handlers/ContextCommandHandler.js");
const ButtonHandler = require("./BotModules/Handlers/ButtonHandler.js");
const SelectHandler = require("./BotModules/Handlers/SelectHandler.js");
const AutocompleteHandler = require("./BotModules/Handlers/AutocompleteHandler.js");
const ModalHandler = require("./BotModules/Handlers/ModalHandler.js");

DiscordClient.on('interactionCreate', async (interaction) => {
    if ( interaction.isChatInputCommand() )
    {
        // Slash Command
        return await SlashCommandHandler.Main(interaction);
    }
    else if ( interaction.isContextMenuCommand() )
    {
        // Context Command
        return await ContextCommandHandler.Main(interaction);
    }
    else if ( interaction.isButton() )
    {
        // Button
        return await ButtonHandler.Main(interaction);
    }
    else if ( interaction.isAnySelectMenu() )
    {
        // Select
        return await SelectHandler.Main(interaction);
    }
    else if ( interaction.isAutocomplete() )
    {
        // Autocomplete
        return await AutocompleteHandler.Main(interaction);
    }
    else if ( interaction.isModalSubmit() )
    {
        // Modal
        return await ModalHandler.Main(interaction);
    }
    else
    {
        // Unknown or unhandled new type of Interaction
        return console.log(`****Unrecognised or new unhandled Interaction type triggered:\n${interaction.type}\n${interaction}`);
    }
});








/******************************************************************************* */
// DISCORD - MESSAGE REACTION ADD EVENT
const StarboardModule = require('./BotModules/StarboardModule.js');

DiscordClient.on('messageReactionAdd', async (reaction, user) => {
    // Ensure full Reaction Object (and that the Message hasn't been deleted)
    if ( reaction.partial )
    {
        try { await reaction.fetch(); }
        catch (err) { return; }
    }

    // If Star Unicode Emoji, pass to Starboard Module, otherwise ignore
    if ( reaction.emoji.name == "⭐" ) { return await StarboardModule.main(reaction, user); }
    else { return; }
});








/******************************************************************************* */

DiscordClient.login(Config.TOKEN);
