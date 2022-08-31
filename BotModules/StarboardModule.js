const { MessageReaction, User, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel } = require("discord.js");
const fs = require('fs');

module.exports = {
    /**
     * Handles incoming Star Reactions for Starboard
     * @param {MessageReaction} reaction 
     * @param {User} user 
     */
    async main(reaction, user)
    {
        // Ensure User adding Reaction isn't the same User that sent the Message
        if ( reaction.message.author.id === user.id )
        {
            // Attempt to remove Reaction, if we have Permission (MANAGE_MESSAGES) to do so
            try { await reaction.users.remove(user.id); }
            catch (err) { return; }
            return;
        }

        const GuildId = reaction.message.guildId;
        // Refetch JSON, in case of updates via /settings edit
        const StarboardSettings = require('../JsonFiles/HiddenJsonFiles/starboardConfig.json');
        const GuildStarboardSettings = StarboardSettings[`${GuildId}`];

        // If Star Reaction count not more than minimum, ignore
        if ( reaction.count < GuildStarboardSettings["MINIMUM_STARS"] ) { return; }

        // If Message has already been Starboarded, ignore
        if ( GuildStarboardSettings["STARBOARDED_MESSAGES"].includes(reaction.message.id) ) { return; }

        // Making things easier for oneself
        const OriginalMessage = reaction.message;
        const MessageMember = OriginalMessage.member;
        let messageExtras = "";

        // Construct Embed & Link Button for adding Message to Starboard
        const MessageLinkButton = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("View Original").setURL(OriginalMessage.url)
        ]);

        const MessageEmbed = new EmbedBuilder().setColor(MessageMember.displayHexColor)
        .setAuthor({ name: `${MessageMember.displayName}`, iconURL: MessageMember.displayAvatarURL({ extension: 'png' }) })
        .setFooter({ text: `<#${OriginalMessage.channelId}>` })
        .setTimestamp(OriginalMessage.createdAt);
        if ( OriginalMessage.content != null ) { MessageEmbed.setDescription(OriginalMessage.content); }
        if ( OriginalMessage.attachments.size > 0 )
        {
            // If First Attachment is spoilered
            if ( OriginalMessage.attachments.first().spoiler ) { messageExtras += `${messageExtras.length > 1 ? `\n` : ""}- *Contains at least one spoilered Image/Video!*`; }
            // If First Attachment is embeddable media
            else if ( ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(OriginalMessage.attachments.first().contentType) ) { MessageEmbed.setImage(OriginalMessage.attachments.first().url); }
            // Contains other, not embeddable, media
            else { messageExtras += `${messageExtras.length > 1 ? `\n` : ""}- *Contains a(n) ${OriginalMessage.attachments.first().contentType} attachment`; }
        }
        if ( OriginalMessage.stickers.size > 0 ) { messageExtras += `- *Contains ${OriginalMessage.stickers.size} Sticker(s)*`; }
        if ( OriginalMessage.embeds.length > 0 ) { messageExtras += `${messageExtras.length > 1 ? `\n` : ""}- *Contains ${OriginalMessage.embeds.length} Embed(s)*` }
        

        // Fetch Channel for sending
        /** @type {TextChannel} */ // Shut up VSC and let me do things lol
        const StarboardChannel = await OriginalMessage.guild.channels.fetch(GuildStarboardSettings["CHANNEL_ID"]).catch(err => {return;});

        // Send to Starboard!
        await StarboardChannel.send({ embeds: [MessageEmbed], components: [MessageLinkButton] });

        // Add to "already posted" Array
        GuildStarboardSettings["STARBOARDED_MESSAGES"].push(OriginalMessage.id);

        // Update JSON with new Starboarded Message
        StarboardSettings[`${GuildId}`] = GuildStarboardSettings;
        fs.writeFile('./JsonFiles/HiddenJsonFiles/starboardConfig.json', JSON.stringify(StarboardSettings, null, 4), async (err) => {
            if ( err ) { return; }
        });
        return;
    }
}
