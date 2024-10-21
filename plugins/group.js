const config = require('../config');
const { cmd, commands } = require('../command');
const { default: makeWASocket, useMultiFileAuthState, WA_DEFAULT_EPHEMERAL, jidNormalizedUser, proto, getDevice, generateWAMessageFromContent, fetchLatestBaileysVersion, makeInMemoryStore, getContentType, generateForwardMessageContent, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys')
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const fs = require('fs');
const{readEnv}=require('../lib/database');

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

//-----------------------------------------------Requests-----------------------------------------------
cmd({
    pattern: "requests",
    desc: "View pending join requests",
    use: ".requests",
    react: "📝",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    if (!m.isGroup) return reply('only for groups');
    if (!isBotAdmins) return reply(`I can't do that. give group admin`);
    if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);
    const botNumber = conn.user.jid;
    const groupMetadata = await conn.groupMetadata(from);
    const isBotAdmin = groupMetadata.participants.some(participant => participant.jid === botNumber && participant.admin);

    if (!isBotAdmin) {
        return await reply("I'm not an admin in this group.");
    }

    try {
        const requests = await conn.groupRequestParticipantsList(from);
        if (requests.length === 0) {
            return await reply("No pending join requests.");
        }

        let msg = "Pending Join Requests:\n\n";
        requests.forEach((request, index) => {
            msg += `${index + 1}. @${request.jid.split("@")[0]}\n`;
        });
        return await reply(msg, { mentions: requests.map(r => r.jid) });
    } catch (error) {
        console.error('Error retrieving join requests:', error);
        return await reply("Failed to retrieve join requests. Please try again later.");
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


//-----------------------------------------------HideTag-----------------------------------------------
cmd({
    pattern: "hidetag",
    desc: "Tags all members of the group without showing their numbers",
    category: "group",
    filename: __filename,
    use: '<text>',
}, async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        if (!m.isGroup) return reply('only for groups');
        if (!isBotAdmins) return reply(`I can't do that. give group admin`);
        if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);

        const text = args.length > 0 ? args.join(' ') : 'Hiding tags for all members';
        await conn.sendMessage(from, {
            text: text,
            mentions: participants.map(p => p.id),
        });

    } catch (error) {
        console.error(error);
        reply('An error occurred while sending hidden tags.');
    }
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

//-----------------------------------------------Approve-----------------------------------------------
cmd({
    pattern: ".approve",
    desc: "Automatically approve Specific Country users in the waiting list",
    react: "✅",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, isBotAdmins, isAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("This command is only for groups.");
        if (!isBotAdmins) return reply("I need to be a group admin to perform this action.");
        if (!isAdmins) return reply("You must be an admin to use this command.");

        const groupJid = mek.key.remoteJid;
        const response = await conn.groupRequestParticipantsList(groupJid);
        
        if (response.length === 0) {
            return reply("No participants are in the waiting list.");
        }
        const toAddUsers = response.filter(user => user.jid.startsWith(config.AUTO_ADD_Country_Code));

        if (toAddUsers.length === 0) {
            return reply("No +94 users found in the waiting list.");
        }

        const userJids = toAddUsers.map(user => user.jid);
        const approveResponse = await conn.groupRequestParticipantsUpdate(
            groupJid, 
            userJids,
            "approve"
        );

        console.log(approveResponse);
        reply(`Approved the following +94 users:\n${userJids.join("\n")}`);

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

//-----------------------------------------------Common----------------------------------------------------
cmd({
    pattern: "common",
    desc: "Find common participants between two groups.",
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, q, reply, isGroup
}) => {
    try {
        if (!m.isGroup) return reply('only for groups');
        if (!isBotAdmins) return reply(`I can't do that. give group admin`);
        if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);
        
        if (!q) return await reply("Provide the JID of another group to compare");

        const group1 = from;
        const group2 = q.trim();

        const [metadata1, metadata2] = await Promise.all([
            conn.groupMetadata(group1),
            conn.groupMetadata(group2)
        ]);

        const participants1 = new Set(metadata1.participants.map(p => p.id));
        const participants2 = new Set(metadata2.participants.map(p => p.id));

        const commonParticipants = [...participants1].filter(p => participants2.has(p));

        if (commonParticipants.length === 0) {
            return await reply("No common participants found between the two groups");
        }

        let commonList = "*Common Participants:*\n";
        commonParticipants.forEach((participant, index) => {
            commonList += `${index + 1}. @${participant.split("@")[0]}\n`;
        });

        return await conn.sendMessage(from, { 
            text: commonList,
            mentions: commonParticipants 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`Error: ${e.message}`);
    }
});

//Group Open Close Times Functions
function adjustTime(time) {
    const [hour, minute] = time.split(':').map(Number);
    return moment.tz({ hour, minute }, TIMEZONE)
        .subtract(5, 'hours')
        .subtract(30, 'minutes')
        .format('HH:mm');
}
const readGroupTimes = () => {
    if (!fs.existsSync(dbFilePath)) {
        fs.writeFileSync(dbFilePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(dbFilePath));
};
const saveGroupTimes = (data) => {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};
cmd({
    pattern: "opentime",
    desc: "Set daily open time for the group or reset",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, isBotAdmins, isAdmins, reply }) => {

    if (!isGroup) return reply('This Commmand is only for groups.');
    if (!isBotAdmins) return reply('Sorry bot is not an admin.');
    if (!isAdmins) return reply('You are not an admin for use this command.');

    // Reset open time
    if (args[0] === 'reset') {
        const groupTimes = readGroupTimes();
        if (!groupTimes[from]?.openTimes) return reply('*There Is No Open Time For Group*');
        
        delete groupTimes[from].openTimes;
        saveGroupTimes(groupTimes);
        return reply('*Group Open Time Reset. 🔄*');
    }

    // Check if time is provided
    if (args.length < 1) {
        return reply(`Group Open Sucess🔓
        \nSet group open time:
        .opentime HH:MM,HH:MM...
        \nReset group open time:
        .opentime reset
        \nGroup Time details:
        .grouptimelist
        \n*Queen Spriky MD*`);
    }

    const openTimes = args[0].split(',');
    openTimes.forEach((openTime) => {
        const adjustedOpenTime = adjustTime(openTime);
        const [adjustedHour, adjustedMinute] = adjustedOpenTime.split(':').map(Number);
        const openCron = `0 ${adjustedMinute} ${adjustedHour} * * *`;
        schedule.cancelJob(`openGroup_${from}_${openTime}`);
        schedule.scheduleJob(`openGroup_${from}_${openTime}`, openCron, async () => {
            await conn.groupSettingUpdate(from, 'not_announcement');
            await conn.sendMessage(from, {
                text: `*Group Open Time: ${openTime}. 🔓*\n${sensitiveData.footerText}`
            });
        });
    });
    const groupTimes = readGroupTimes();
    groupTimes[from] = { openTimes: args[0], ...groupTimes[from] };
    saveGroupTimes(groupTimes);
    
    reply(`*Group Open Time: ${args[0]}. ⏰*`);
});

// Command to set or reset the daily close time for a group
cmd({
    pattern: "closetime",
    desc: "Set daily close time for the group or reset",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, isBotAdmins, isAdmins, reply }) => {

    if (!isGroup) return reply('This Commmand is only for groups.');
    if (!isBotAdmins) return reply('Sorry bot is not an admin.');
    if (!isAdmins) return reply('You are not an admin for use this command.');
    if (args[0] === 'reset') {
        const groupTimes = readGroupTimes();
        if (!groupTimes[from]?.closeTimes) return reply('*There Is No Close Time For Group*');
        
        delete groupTimes[from].closeTimes;
        saveGroupTimes(groupTimes);
        return reply('*Group Close Time Reset. 🔄*');
    }
    if (args.length < 1) {
        return reply(`Group Close Sucess🔒
        \nSet group close time:
        .closetime HH:MM,HH:MM...
        \nReset group close time:
        .closetime reset
        \nGroup Time details:
        .grouptimelist
        \n*Queen Spriky MD*`);
    }

    const closeTimes = args[0].split(',');
    closeTimes.forEach((closeTime) => {
        const adjustedCloseTime = adjustTime(closeTime);
        const [adjustedHour, adjustedMinute] = adjustedCloseTime.split(':').map(Number);
        const closeCron = `0 ${adjustedMinute} ${adjustedHour} * * *`;
        schedule.cancelJob(`closeGroup_${from}_${closeTime}`);
        schedule.scheduleJob(`closeGroup_${from}_${closeTime}`, closeCron, async () => {
            await conn.groupSettingUpdate(from, 'announcement');
            await conn.sendMessage(from, {
                text: `*Group Close Time: ${closeTime}. 🔒*\n${sensitiveData.footerText}`
            });
        });
    });
    const groupTimes = readGroupTimes();
    groupTimes[from] = { closeTimes: args[0], ...groupTimes[from] };
    saveGroupTimes(groupTimes);
    
    reply(`*Group Close Time: ${args[0]}. ⏰*`);
});

//-----------------------------------------------Group Open/Clostime List--------------------------------------------------
cmd({
    pattern: "grouptimelist",
    desc: "List group open and close times",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {

    if (!m.isGroup) return reply('only for groups');
    if (!isBotAdmins) return reply(`I can't do that. give group admin`);
    if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);

    const groupTimes = readGroupTimes();
    if (!groupTimes[from]) return reply('*There Is No Group Time ❌*');

    const { openTimes, closeTimes } = groupTimes[from];
    const message = `*Group Time List:*\nOpen Times: ${openTimes ? openTimes : 'Not set'}\nClose Times: ${closeTimes ? closeTimes : 'Not set'}`;
    reply(message);
});


//-----------------------------------------------Welcome-----------------------------------------------

const WelcomeSettings = {
    welcomeEnabled: false,
    welcomeAlertEnabled: false,
    welcomeMessages: {},
    listenerRegistered: false
};

const loadWelcomeMessages = () => {
    if (fs.existsSync('./database/groupwelcome.json')) {
        WelcomeSettings.welcomeMessages = JSON.parse(fs.readFileSync('./database/groupwelcome.json'));
    } else {
        WelcomeSettings.welcomeMessages = {};
    }
};

const saveWelcomeMessages = () => {
    fs.writeFileSync('./database/groupwelcome.json', JSON.stringify(WelcomeSettings.welcomeMessages, null, 2));
};
const sendWelcomeMessage = async (conn, groupId, participants) => {
    const groupMetadata = await conn.groupMetadata(groupId);
    const groupName = groupMetadata.subject;
    const mentions = participants.map(participant => participant);
    
    const welcomeText = WelcomeSettings.welcomeMessages[groupId] || 'Welcome to the group!';
    const welcomeMessage = `Hey!\n${mentions.map(memberId => `@${memberId.split('@')[0]}`).join('\n')}
Welcome to the group *${groupName}* 🎉\nDont Foget To Checkout The Group Discription\n\n*Queen Spriky MD*`;

    await conn.sendMessage(groupId, { text: welcomeMessage, mentions });
};
const sendPrivateWelcomeAlert = async (conn, groupId, memberId) => {
    const groupMetadata = await conn.groupMetadata(groupId);
    const groupName = groupMetadata.subject;
    const groupDescription = groupMetadata.desc || 'No description available';
    
    const privateAlertMessage = `Hey @${memberId.split('@')[0]},
Welcome to *${groupName}* 🎉
Group Description : ${groupDescription}
*Queen Spriky MD*`;

    await conn.sendMessage(memberId, { text: privateAlertMessage, mentions: [memberId] });
};
const registerGroupWelcomeListener = conn => {
    if (WelcomeSettings.listenerRegistered) return;
    WelcomeSettings.listenerRegistered = true;

    conn.ev.on('group-participants.update', async update => {
        const { id, participants, action } = update;
        if (action === 'add') {
            if (WelcomeSettings.welcomeEnabled) {
                await sendWelcomeMessage(conn, id, participants);
            }
            if (WelcomeSettings.welcomeAlertEnabled) {
                participants.forEach(async participant => {
                    await sendPrivateWelcomeAlert(conn, id, participant);
                });
            }
        }
    });
};

//-----------------------------------------------Welcome On-----------------------------------------------
cmd({
    pattern: "welcomeon",
    react: "🎉",
    desc: "Enable welcome messages for new group members",
    category: "group",
    use: '.welcomeon',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply('This Commmand is only for groups.');
        if (!isBotAdmins) return reply('Sorry bot is not an admin.');
        if (!isAdmins) return reply('You are not an admin for use this command.');
        
        WelcomeSettings.welcomeEnabled = true;
        registerGroupWelcomeListener(conn);
        reply('Group welcome messages have been enabled! 🎉');
    } catch (e) {
        reply('Error enabling welcome messages. ⚠️');
        console.log(e);
    }
});

//-----------------------------------------------Welcome Off-----------------------------------------------
cmd({
    pattern: "welcomeoff",
    react: "❌",
    desc: "Disable welcome messages for new group members",
    category: "group",
    use: '.welcomeoff',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply('This Commmand is only for groups.');
        if (!isBotAdmins) return reply('Sorry bot is not an admin.');
        if (!isAdmins) return reply('You are not an admin for use this command.');
        
        WelcomeSettings.welcomeEnabled = false;
        reply('Group welcome messages have been disabled! ❌');
    } catch (e) {
        reply('Error disabling welcome messages. ⚠️');
        console.log(e);
    }
});

//-----------------------------------------------Welcome Alert-----------------------------------------------
cmd({
    pattern: "welcomealerton",
    react: "🔔",
    desc: "Enable welcome alerts for new group members",
    category: "group",
    use: '.welcomealerton',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply('This Commmand is only for groups.');
        if (!isBotAdmins) return reply('Sorry bot is not an admin.');
        if (!isAdmins) return reply('You are not an admin for use this command.');
        
        WelcomeSettings.welcomeAlertEnabled = true;
        registerGroupWelcomeListener(conn);
        reply('Private welcome alerts have been enabled! 🔔');
    } catch (e) {
        reply('Error enabling welcome alerts. ⚠️');
        console.log(e);
    }
});

//-----------------------------------------------Disable Welcome Alert-----------------------------------------------
cmd({
    pattern: "welcomealertoff",
    react: "🔕",
    desc: "Disable welcome alerts for new group members",
    category: "group",
    use: '.welcomealertoff',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply('This Commmand is only for groups.');
        if (!isBotAdmins) return reply('Sorry bot is not an admin.');
        if (!isAdmins) return reply('You are not an admin for use this command.');
        
        WelcomeSettings.welcomeAlertEnabled = false;
        reply('Private welcome alerts have been disabled! 🔕');
    } catch (e) {
        reply('Error disabling welcome alerts. ⚠️');
        console.log(e);
    }
});

//-----------------------------------------------Accept All-----------------------------------------------
cmd({
    pattern: "acceptall",
    desc: "Accept all users' group joining requests",
    react: "💐",
    use: '.acceptall',
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { args, reply }) => {
    try {
        if (!m.isGroup) return reply('only for groups');
        if (!isBotAdmins) return reply(`I can't do that. give group admin`);
        if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);

        const metadata = await conn.groupMetadata(m.chat);
        const mems = metadata.participants.map(v => v.id);
        let replyArray = [];
        let approved = 0;
        let users = [];
        const requestList = await conn.groupRequestParticipantsList(m.chat);
        
        if (args.length > 0) {
            users = args.map(i => i.trim());
        } else {
            if (requestList.length < 1) return reply("_No pending requests._");
            users = requestList.map(r => r.jid);
        }

        for (const i of users) {
            const userId = i.split("@")[0];
            if (!requestList.map(v => v.jid).includes(i)) {
                replyArray.push(`❌ *@${userId}* is not in the request list!`);
            } else if (mems.includes(i)) {
                replyArray.push(`☑️ *@${userId}* is already a member of the group!`);
            } else {
                try {
                    await conn.groupRequestParticipantsUpdate(m.chat, [i], "approve");
                    approved++;
                    await delay(1000);
                } catch (error) {
                    replyArray.push(`❌ Error approving *@${userId}*: ${error.message}`);
                }
            }
        }

        const finalReply = `${replyArray.join("\n\n")}\n\n${approved < 1 ? "" : `✅ Accepted \`${approved}\` pending requests..!`}`;
        reply(finalReply.trim(), { mentions: users });
    } catch (error) {
        console.error(error);
        reply(`Error: ${error.message}`);
    }
});

//-----------------------------------------------Reject All-----------------------------------------------
cmd({
    pattern: "rejectall",
    alias: ['declineall'],
    desc: "Reject all users' group joining requests",
    react: "💐",
    use: '.rejectall',
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { args, reply }) => {
    try {
        if (!m.isGroup) return reply('only for groups');
        if (!isBotAdmins) return reply(`I can't do that. give group admin`);
        if (!isAdmins) return reply(`You Must Be Admin For Use This Command`);

        const metadata = await conn.groupMetadata(m.chat);
        const mems = metadata.participants.map(v => v.id);
        let replyArray = [];
        let rejected = 0;
        let users = [];
        const requestList = await conn.groupRequestParticipantsList(m.chat);

        if (args.length > 0) {
            users = args.map(i => i.trim());
        } else {
            if (requestList.length < 1) return reply("_No pending requests to decline._");
            users = requestList.map(r => r.jid);
        }

        for (const i of users) {
            const userId = i.split("@")[0];
            if (!requestList.map(v => v.jid).includes(i)) {
                replyArray.push(`❌ *@${userId}* is not in the request list!`);
            } else if (mems.includes(i)) {
                replyArray.push(`☑️ *@${userId}* is already a member of the group!`);
            } else {
                try {
                    await conn.groupRequestParticipantsUpdate(m.chat, [i], "reject");
                    rejected++;
                    await delay(1000);
                } catch (error) {
                    replyArray.push(`❌ Error rejecting *@${userId}*: _${error.message}_`);
                }
            }
        }

        const finalReply = `${replyArray.join("\n\n")}\n\n${rejected < 1 ? "" : `🗑️ Rejected \`${rejected}\` pending requests..!`}`;
        reply(finalReply.trim(), { mentions: users });
    } catch (error) {
        console.error(error);
        reply(`Error: ${error.message}`);
    }
});

//---------------------------------------------------------------Active Members-----------------------------------------------------
cmd({
    pattern: "active",
    desc: "To check active users in group",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, isGroup, reply }) => {
    if (!isGroup) return reply("_*This command is for groups only.*_");
    
    try {
        const data = await conn.store.groupStatus(from, "active");
        let activeUsers = Array.isArray(data)
            ? `*Total Active Users ${data.length}*\n\n` + data.map(item => 
              `*Name: ${item.pushName}*\n*Number: ${item.jid.split("@")[0]}*\n*Total Messages: ${item.messageCount}*\n\n`).join("")
            : "_*No active users found.*_";
        
        await conn.sendMessage(from, [{ name: "quick_reply", display_text: "Inactive users", id: "inactive" }],
            { body: "", footer: "\n*JARVIS-MD*", title: activeUsers.trim() }, "button");
    } catch (error) {
        console.error(error);
        reply('Failed to fetch active users.');
    }
});

//---------------------------------------------------------------Inactive Members-----------------------------------------------------
cmd({
    pattern: "inactive",
    desc: "To check inactive users in group",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, isGroup, reply }) => {
    if (!isGroup) return reply("_*This command is for groups only.*_");
    
    try {
        const data = await conn.store.groupStatus(from, "disactive");
        let inactiveUsers = Array.isArray(data) 
            ? `*Total Inactive Users ${data.length}*\n\n` + data.map((item, index) => 
              `*${index + 1}. User: @${item.jid.split("@")[0]}*\n*Role: ${item.role}*\n\n`).join("")
            : "_*No inactive users found.*_";
        
        await conn.sendMessage(from, inactiveUsers.trim(), { mentions: data.map(a => a.jid) || [] });
    } catch (error) {
        console.error(error);
        reply('Failed to fetch inactive users.');
    }
});

//----------------------------------------------------------------------Get Pic-------------------------------------------------------------
cmd({
    pattern: "getpic",
    desc: "Get the group profile picture.",
    category: "group",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply('This command can only be used in a group.')

        const groupPic = await conn.getProfilePicture(from)
        await conn.sendMessage(from, { image: { url: groupPic }, caption: 'Group Profile Picture' })
    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
})