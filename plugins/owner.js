const { exec } = require('child_process');
const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');

//-----------------------------------------------Leave Group-----------------------------------------------

cmd({
    pattern: "leavegc",
    desc: "Make the bot leave the group.",
    category: "owner",
    react: "👤",
    filename: __filename
},
async (conn, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) return reply('You are not authorized to use this command.');
        await conn.groupLeave(from);
        return await conn.sendMessage(from, {
            text: "Bot has left the group."
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`Error: ${e.message}`);
    }
});

//-----------------------------------------------Set Bio Of Bot-----------------------------------------------

cmd({
    pattern: "setbio",
    desc: "Set bot's profile bio.",
    react: "👤",
    use: '.setbio <New Bio>',
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, reply,isOwner }) => {
    try {
        if (!isOwner) return reply('You are not authorized to use this command.');
        if (args.length === 0) return reply('Please provide a bio text.');
        const bio = args.join(' ');
        await conn.updateProfileStatus(bio);
        return await reply('Profile bio updated successfully.');
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`Error: ${e.message}`);
    }
});

//-----------------------------------------------Join Group By Link-----------------------------------------------

cmd({
    pattern: "join",
    desc: "Joins group by link",
    react: "👥",
    category: "owner",
    use: '<group link.>'
},
async (conn, mek, m, { from, q, reply, isOwner }) => {
    if (!isOwner) return reply('You are not authorized to use this command.');
    try {
        if (!q) return reply('Please provide a Group Link.');
        if (!q.includes("whatsapp.com")) return reply("Invalid link, please provide a valid WhatsApp Group Link!");
        let result = q.split("https://chat.whatsapp.com/")[1];
        await conn.groupAcceptInvite(result);
        reply("🟩 Joined Group");
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply('Error joining group!');
    }
});

//-----------------------------------------------Shut Down Bot-----------------------------------------------

cmd({
    pattern: "shutdown",
    desc: "Shutdown the bot.",
    category: "owner",
    react: "🛑",
    filename: __filename
},
async (conn, mek, m, { from, reply, isOwner }) => {
    if (!isOwner) return reply('You are not authorized to use this command.');
    reply("🛑 Shutting down...").then(() => process.exit());
});

//-----------------------------------------------Broadcast Message-----------------------------------------------

cmd({
    pattern: "broadcast",
    desc: "Broadcast a message to all groups.",
    category: "owner",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, isOwner }) => {
    if (!isOwner) return reply('You are not authorized to use this command.');
    if (args.length === 0) return reply("📢 Please provide the message.");

    const message = args.join(' ');
    const groups = Object.keys(await conn.groupFetchAllParticipating());

    for (const groupId of groups) {
        await conn.sendMessage(groupId, { text: message }, { quoted: mek });
    }

    reply("📢 Message sent to all groups.");
});

//-----------------------------------------------Clear All Chats-----------------------------------------------

cmd({
    pattern: "clearchats",
    desc: "Clear all chats from the bot.",
    category: "owner",
    react: "🧹",
    filename: __filename
},
async (conn, mek, m, { from, reply, isOwner }) => {
    if (!isOwner) return reply('You are not authorized to use this command.');
    try {
        const chats = conn.chats.all();
        for (const chat of chats) {
            await conn.modifyChat(chat.jid, 'delete');
        }
        reply("🧹 Cleared all chats successfully.");
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});

cmd({
    pattern: "block",
    desc: "Block a user.",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply('You are not authorized to use this command.');
    if (!quoted) return reply("*❌ Please reply to the user you want to block.*");

    const user = quoted.sender;
    try {
        await conn.updateBlockStatus(user, 'block');
        reply(`*🚫 User ${user} blocked successfully.*`);
    } catch (error) {
        reply(`*❌ Error blocking user: ${error.message}*`);
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblock a user.",
    category: "owner",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply('You are not authorized to use this command.');
    if (!quoted) return reply("*❌ Please reply to the user you want to unblock.*");

    const user = quoted.sender;
    try {
        await conn.updateBlockStatus(user, 'unblock');
        reply(`*✅ User ${user} unblocked successfully.*`);
    } catch (error) {
        reply(`❌ Error unblocking user: ${error.message}`);
    }
});