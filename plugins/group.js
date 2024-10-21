const config = require('../config');
const { cmd, commands } = require('../command');
const { default: makeWASocket, useMultiFileAuthState, WA_DEFAULT_EPHEMERAL, jidNormalizedUser, proto, getDevice, generateWAMessageFromContent, fetchLatestBaileysVersion, makeInMemoryStore, getContentType, generateForwardMessageContent, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys')
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const fs = require('fs');

const TIMEZONE = 'Asia/Colombo';
const dbFilePath = './database/groupopen.json';

//-----------------------------------------------Admins-----------------------------------------------
cmd({
    pattern: "admins",
    desc: "Get a list of group admins.",
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        const groupMetadata = await conn.groupMetadata(from);
        const admins = groupMetadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(admin => `@${admin.id.split('@')[0]}`)
            .join('\n');

        return await conn.sendMessage(from, {
            text: `*Group Admins:*\n\n${admins}`,
            mentions: groupMetadata.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(admin => admin.id)
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        return await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e.message}`);
    }
});

//-----------------------------------------------Group Desc-----------------------------------------------

cmd({
    pattern: "groupdesc",
    desc: "Change the group description.",
    use: '.groupdesc <New Description>',
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, {
    from, args, quoted, body, isCmd, command, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        if (!m.isGroup) return reply('only for groups');
        if (!isBotAdmins) return reply(`I can't do that. give group admin`);
        if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);

        if (args.length === 0) return reply('Please provide a new group description.');

        const newDesc = args.join(' '); // Join all arguments as the new description
        await conn.groupUpdateDescription(from, newDesc);

        return await conn.sendMessage(from, {
            text: `Group description has been updated to:\n\n${newDesc}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        return await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e.message}`);
    }
});

//-----------------------------------------------------------Get Group Info-------------------------------------------------------------
cmd({
    pattern: "groupinfo",
    desc: "Get information about the group.",
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        const groupMetadata = await conn.groupMetadata(from);
        const groupInfo = `
*Group Name:* ${groupMetadata.subject}
*Group Description:* ${groupMetadata.desc || 'No description'}
*Members:* ${groupMetadata.participants.length}
*Created At:* ${new Date(groupMetadata.creation * 1000).toLocaleString()}
        `;
        return await conn.sendMessage(from, {
            text: groupInfo
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        return await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e.message}`);
    }
});

//-----------------------------------------------Get Group Invite Link-----------------------------------------------
cmd({
    pattern: "grouplink",
    desc: "Get the group's invite link.",
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        const inviteLink = await conn.groupInviteCode(from);
        return await conn.sendMessage(from, {
            text: `*Here is your group's invite link:* https://chat.whatsapp.com/${inviteLink}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        return await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e.message}`);
    }
});

//-----------------------------------------------Group Name Change-----------------------------------------------
cmd({
    pattern: "gname",
    desc: "Change the group name",
    use: ".gname <New Group Name>",
    react: "✏️",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, groupMetadata, args, reply }) => {
    if (!m.isGroup) return reply('only for groups');
    if (!isBotAdmins) return reply(`I can't do that. give group admin`);
    if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);

    const botNumber = conn.user.jid;
    const isBotAdmin = groupMetadata.participants.some(participant => participant.jid === botNumber && participant.admin);
    
    if (!isBotAdmin) {
        return await reply("I'm not an admin in this group.");
    }
    const newName = args.join(" ");
    if (!newName) {
        return await reply("Please provide a new group name.");
    }
    try {
        await conn.groupUpdateSubject(from, newName);
        return await reply(`Group name changed to "${newName}" successfully!`);
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } })
    } catch (error) {
        console.error('Error changing group name:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        return await reply("Failed to change the group name. Please try again later.");
    }
});

//---------------------------------------------Tag All --------------------------------------------
cmd({
    pattern: "tagall",
    desc: "Tags all members of the group",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!m.isGroup) return reply('only for groups');
        if (!isBotAdmins) return reply(`I can't do that. give group admin`);
        if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);

        const groupMetadata = await conn.groupMetadata(from);
        const { participants } = groupMetadata;
        let tags = '';
        for (const participant of participants) {
            const { id } = participant;
            tags += `@${id.split('@')[0]} `;
        }
        const tagMessage = args.length > 0 ? args.join(' ') : '*Hello everyone*';
        const messageStr = `
╭───────────◯
${tagMessage}

${tags}
╰───────────◯\n*Queen Spriky MD*
        `;
        await conn.sendMessage(from, {
            text: messageStr,
            mentions: participants.map(p => p.id),
        });

    } catch (error) {
        console.error(error);
        reply('An error occurred while tagging members.');
    }
});

//-----------------------------------------------Promote-----------------------------------------------

cmd({
  pattern: "promote",
  react: "👥",
  desc: "Promote member to admin",
  category: "group",
  use: '.promote',
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
        if (!m.isGroup) return reply('only for groups');
        if (!isBotAdmins) return reply(`I can't do that. give group admin`);
        if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);

  let users = mek.mentionedJid ? mek.mentionedJid : mek.quoted ? mek.quoted.sender : q.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await conn.groupParticipantsUpdate(mek.chat, [users], 'promote');
  reply('You are now an admin! 🥳');
});

//---------------------------------------------Kick--------------------------------------------

cmd({
    pattern: "kick",
    desc: "Kicks replied/quoted user from group.",
    react: "👥",
    category: "group",
    filename: __filename,
    use: '<quote|reply|number>',
},           
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        if (!m.isGroup) return reply('This command is only for groups.');
        if (!isBotAdmins) return reply(`I can't do that. Please make me a group admin.`);
        if (!isAdmins) return reply(`You must be an admin to use this command.`);
    
        const user = quoted ? quoted.sender : null;
        if (!user) return reply('Please reply to a user to kick them.');

        await conn.groupParticipantsUpdate(m.chat, [user], "remove");
        reply(`${user} has been kicked out of the group!`);
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply('Error occurred while trying to kick the user.');
    }
});

  //---------------------------------------------Demote Admin--------------------------------------------

  cmd({
    pattern: "demote",
    desc: "demote admin to a member",
    react: "👥",
    category: "group",
    use: '.demote',
    filename: __filename
},
async (conn, mek, m, { from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {                   
    try {
        if (!m.isGroup) return reply('only for groups');
        if (!isBotAdmins) return reply(`I can't do that. give group admin`);
        if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);
                                  
        let users = mek.mentionedJid ? mek.mentionedJid[0] : mek.quoted ? mek.quoted.sender : q.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await conn.groupParticipantsUpdate(mek.chat, [users], 'demote')
            .then((res) => reply(jsonformat(res)))
            .catch((err) => reply(jsonformat(err)));

        await conn.sendMessage(from, { text: 'Done' }, { quoted: mek }); 
    } catch (e) {
    }
});

//-----------------------------------------------ADD-----------------------------------------------
cmd({
    pattern: "add",
    desc: "Add a member to the group",
    react: "👥",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, isBotAdmins, isAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("Only for groups.");
        if (!isBotAdmins) return reply("I can't do that. give group admin");
        if (!isAdmins) return reply("You Must Be Admin For Use This Command");

        const userToAdd = args[0] + '@s.whatsapp.net'; // Phone number format should be in international format

        if (!userToAdd) return reply("Please provide a user to add.");

        await conn.groupParticipantsUpdate(mek.key.remoteJid, [userToAdd], 'add');

        reply("User Added Successfully");

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e}`);
    }
});

//-----------------------------------------------Mute-----------------------------------------------
cmd({
    pattern: "mute",
    desc: "Mute the group",
    react: "👥",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, isBotAdmins, isAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("Only for groups.");
        if (!isBotAdmins) return reply("I can't do that. give group admin");
        if (!isAdmins) return reply("You Must Be Admin For Use This Command");

        await conn.groupSettingUpdate(mek.key.remoteJid, 'announcement');

        reply("Group Muted");

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e}`);
    }
});

//-----------------------------------------------Unmute-----------------------------------------------
cmd({
    pattern: "unmute",
    desc: "Unmute the group",
    react: "👥",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, isBotAdmins, isAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("Only for groups.");
        if (!isBotAdmins) return reply("I can't do that. give group admin");
        if (!isAdmins) return reply("You Must Be Admin For Use This Command");

        await conn.groupSettingUpdate(mek.key.remoteJid, 'not_announcement');

        reply("Group Unmuted");

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e}`);
    }
});

//-----------------------------------------------Unlock-----------------------------------------------
cmd({
    pattern: "unlock",
    desc: "Allow all participants to modify the group's settings",
    react: "🔓",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, isBotAdmins, isAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("This command is only for groups.");
        if (!isBotAdmins) return reply("I need to be a group admin to perform this action.");
        if (!isAdmins) return reply("You must be an admin to use this command.");

        await conn.groupSettingUpdate(mek.key.remoteJid, 'unlocked');

        reply("Group settings unlocked. All participants can modify the group's settings.");

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e}`);
    }
});

//-----------------------------------------------Lock-----------------------------------------------
cmd({
    pattern: "lock",
    desc: "Only allow admins to modify the group's settings",
    react: "🔒",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, isBotAdmins, isAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("This command is only for groups.");
        if (!isBotAdmins) return reply("I need to be a group admin to perform this action.");
        if (!isAdmins) return reply("You must be an admin to use this command.");

        await conn.groupSettingUpdate(mek.key.remoteJid, 'locked');

        reply("Group settings locked. Only admins can modify the group's settings.");

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e}`);
    }
});

//-----------------------------------------------Vote-----------------------------------------------
cmd({
    pattern: "vote",
    desc: "Create a poll in the group.",
    react: "🗳️",
    category: "group",
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, quoted, body, command, q, reply
}) => {
    try {
        if (!m.isGroup) return reply('only for groups');
        if (!isBotAdmins) return reply(`I can't do that. give group admin`);
        if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);
        
        const parts = q.split("|").map(part => part.trim());
        
        if (parts.length < 3) {
            return await reply("Usage: .vote Question | Option1 | Option2 | Option3...\nMinimum 2 options are required.");
        }

        const question = parts[0];
        const options = parts.slice(1);

        if (options.length > 12) {
            return await reply("You can only have up to 12 options in a poll.");
        }

        await conn.sendMessage(from, {
            poll: {
                name: question,
                values: options,
                selectableCount: 1,
            }
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`Error: ${e.message}`);
    }
});