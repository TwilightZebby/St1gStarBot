const { ChatInputCommandInteraction, ChatInputApplicationCommandData, AutocompleteInteraction, ApplicationCommandType, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType, EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");
const fs = require('fs');
const { DiscordClient, Collections } = require("../../constants.js");
const LocalizedErrors = require("../../JsonFiles/errorMessages.json");
const LocalizedStrings = require("../../JsonFiles/stringMessages.json");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "settings",

    // Command's Description
    Description: `View or Edit the Starboard Settings`,

    // Command's Category
    Category: "MANAGEMENT",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 30,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "view": 15,
        "edit": 30
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",
    
    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "view": "GUILD",
        "edit": "GUILD"
    },



    /**
     * Returns data needed for registering Slash Command onto Discord's API
     * @returns {ChatInputApplicationCommandData}
     */
    registerData()
    {
        /** @type {ChatInputApplicationCommandData} */
        const Data = {};

        Data.name = this.Name;
        Data.description = this.Description;
        Data.type = ApplicationCommandType.ChatInput;
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageGuild;
        Data.dmPermission = false;
        Data.options = [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "view",
                description: "View the current Starboard Settings"
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "edit",
                description: "Edit the Starboard Settings",
                options: [
                    {
                        type: ApplicationCommandOptionType.Channel,
                        channel_types: [ChannelType.GuildText],
                        name: "channel",
                        description: "The Text Channel where the Starboard will be posted in",
                        required: false
                    },
                    {
                        type: ApplicationCommandOptionType.Integer,
                        min_value: 3,
                        max_value: 50,
                        name: "minimum-stars",
                        description: "The minimum number of Stars needed for a Message to be added to the Starboard",
                        required: false
                    }
                ]
            }
        ];

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} slashCommand 
     */
    async execute(slashCommand)
    {
        // Get Subcommand used
        const SubcommandUsed = slashCommand.options.getSubcommand(true);
        switch (SubcommandUsed)
        {
            case "view":
                return await viewSettings(slashCommand);

            case "edit":
                return await editSettings(slashCommand);
        }
    },



    /**
     * Handles given Autocomplete Interactions for any Options in this Slash CMD that uses it
     * @param {AutocompleteInteraction} autocompleteInteraction 
     */
    async autocomplete(autocompleteInteraction)
    {
        //.
    }
}








/**
* Handles the "/settings view" Subcommand
* @param {ChatInputCommandInteraction} slashCommand 
*/
async function viewSettings(slashCommand)
{
    // Grab Guild ID and refetch JSON
    const GuildId = slashCommand.guildId;
    const StarboardSettings = require('../../JsonFiles/HiddenJsonFiles/starboardConfig.json');
    const GuildStarboardSettings = StarboardSettings[`${GuildId}`];

    // No Settings found for Guild
    if ( !GuildStarboardSettings ) { return await slashCommand.reply({ ephemeral: true, content: `The Starboard hasn't been set up for this Server yet!
Please use the </settings edit:${slashCommand.commandId}> Slash Command to set up the Starboard.` }); }

    // Settings are found for Guild, construct into Embed and display
    const SettingsEmbed = new EmbedBuilder().setColor(Colors.Orange).setTitle(`Starboard Settings for ${slashCommand.guild.name}`)
    .setDescription(`*Use </settings edit:${slashCommand.commandId}> to edit them*`)
    .addFields(
        { name: `Channel`, value: `<#${GuildStarboardSettings["CHANNEL_ID"]}>`, inline: true },
        { name: `Minimum Stars Required`, value: `${GuildStarboardSettings["MINIMUM_STARS"]}`, inline: true }
    );

    return await slashCommand.reply({ ephemeral: true, embeds: [SettingsEmbed] });
}
 


/**
 * Handles the "/settings edit" Subcommand
 * @param {ChatInputCommandInteraction} slashCommand 
 */
async function editSettings(slashCommand)
{
    // Grab values and data
    const GuildId = slashCommand.guildId;
    const StarboardSettings = require('../../JsonFiles/HiddenJsonFiles/starboardConfig.json');
    const InputChannel = slashCommand.options.getChannel("channel");
    const InputMinimumStars = slashCommand.options.getInteger("minimum-stars");

    // Ensure *something* was given
    if ( InputChannel == null && InputMinimumStars == null ) { return await slashCommand.reply({ ephemeral: true, content: `You didn't set any new Setting values! Please try using this Command again, ensuring at least one value is set.` }); }

    // Update based on given Inputs
    const GuildStarboardSettings = StarboardSettings[`${GuildId}`];
    let newSettings = {};

    if ( !GuildStarboardSettings )
    {
        if ( InputChannel != null )
        {
            // Ensure Bot has Permissions to send in that Channel
            /** @type {PermissionsBitField} */
            const BotPermissions = InputChannel.permissionsFor(DiscordClient.user.id);
            if ( !BotPermissions.has(PermissionFlagsBits.ViewChannel) && !BotPermissions.has(PermissionFlagsBits.SendMessages) )
            {
                return await slashCommand.reply({ ephemeral: true, content: `Sorry, but I cannot assign the <#${InputChannel.id}> Channel as the Starboard since I do not have either the "View Channel" and/or the "Send Messages" Permissions for that Channel.` });
            }
        }

        newSettings = {
            "CHANNEL_ID": InputChannel == null ? null : InputChannel.id,
            "MINIMUM_STARS": InputMinimumStars,
            "STARBOARDED_MESSAGES": []
        };
    }
    else
    {
        // Copy current
        newSettings = GuildStarboardSettings;
        // Update if changed
        if ( InputChannel != null )
        {
            // Ensure Bot has Permissions to send in that Channel
            /** @type {PermissionsBitField} */
            const BotPermissions = InputChannel.permissionsFor(DiscordClient.user.id);
            if ( !BotPermissions.has(PermissionFlagsBits.ViewChannel) && !BotPermissions.has(PermissionFlagsBits.SendMessages) )
            {
                return await slashCommand.reply({ ephemeral: true, content: `Sorry, but I cannot assign the <#${InputChannel.id}> Channel as the Starboard since I do not have either the "View Channel" and/or the "Send Messages" Permissions for that Channel.` });
            }
            else { newSettings["CHANNEL_ID"] = InputChannel.id; }
        }
        if ( InputMinimumStars != null ) { newSettings["MINIMUM_STARS"] = InputMinimumStars; }
    }

    // Update saved Settings
    StarboardSettings[`${GuildId}`] = newSettings;
    fs.writeFile('./JsonFiles/HiddenJsonFiles/starboardConfig.json', JSON.stringify(StarboardSettings, null, 4), async (err) => {
        if ( err ) { return await slashCommand.reply({ ephemeral: true, content: `Sorry, something went wrong while trying to save your updated Starboard Setting(s)... Please try again later` }); }
    });

    // Respond to User
    return await slashCommand.reply({ ephemeral: true, content: `✅ Successfully updated your Starboard Settings!` });
}
