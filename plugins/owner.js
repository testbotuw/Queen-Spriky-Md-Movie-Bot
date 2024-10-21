const { exec } = require('child_process');
const { cmd, commands } = require('../command');
const EnvVar = require('../lib/mongodbenv');
const fs = require('fs');
const {readEnv} = require('../lib/database')
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

//-----------------------------------------------212 Number Block-----------------------------------------------

cmd({
    on: "body"
},
async (conn, mek, m, { from, body, isOwner }) => {
    const config = await readEnv();
    if (config.AUTO_BLock_212 === true) {
        if (m.sender.startsWith('212')) {
            await conn.updateBlockStatus(m.sender, 'block');
            await conn.sendMessage(from, { text: `User ${m.sender} has been blocked.` }, { quoted: mek });
            return;
        }
    }
});

//-----------------------------------------------212 Number Auto Remove-----------------------------------------------

cmd({
    on: "group"
},
async (conn, mek, m, { from, body, isOwner }) => {
    if (config.AUTO_KICK_212 === true) {
        if (m.isGroup && m.sender.startsWith('212')) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            await conn.sendMessage(from, { text: `User ${m.sender} has been removed from the group.` }, { quoted: mek });
            return;
        }
    }
});

//-----------------------------------------------Save or Retrieve Status-----------------------------------------------
cmd({
    pattern: 'save',
    desc: 'Saves media from a status or message to your device.',
    category: 'media',
    react: '💾',
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        const senderNumber = m.sender;
        const isGroup = m.isGroup || false;

        if (!m.quoted) {
            return reply("Please reply to a status or message with media that you want to save.");
        }

        const quotedMsg = m.quoted;

        const mediaType = quotedMsg.type || quotedMsg.mtype;
        let mediaData;
        let fileExtension = '';
        let mimeType = '';

        switch (mediaType) {
            case 'imageMessage':
                mediaData = await quotedMsg.download() || await conn.downloadMediaMessage(quotedMsg);
                fileExtension = 'jpg';
                mimeType = 'image/jpeg';
                break;
            case 'videoMessage':
                mediaData = await quotedMsg.download() || await conn.downloadMediaMessage(quotedMsg);
                fileExtension = 'mp4';
                mimeType = 'video/mp4';
                break;
            case 'audioMessage':
                mediaData = await quotedMsg.download() || await conn.downloadMediaMessage(quotedMsg);
                fileExtension = 'ogg';
                mimeType = 'audio/ogg';
                break;
            case 'documentMessage':
                mediaData = await quotedMsg.download() || await conn.downloadMediaMessage(quotedMsg);
                fileExtension = quotedMsg.fileName ? quotedMsg.fileName.split('.').pop() : 'bin';
                mimeType = quotedMsg.mimetype || 'application/octet-stream';
                break;
            default:
                return reply("The replied message does not contain supported media. Please reply to an image, video, audio, or document.");
        }

        if (!mediaData) {
            return reply("Failed to download the media.");
        }

        const mediaDir = path.join(__dirname, 'media');
        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir);
        }

        const filename = `🌟Queen Spriky MD🌟 | ${Date.now()}.${fileExtension}`;

        const filePath = path.join(mediaDir, filename);
        fs.writeFileSync(filePath, mediaData);

        await conn.sendMessage(from, { document: fs.readFileSync(filePath), mimetype: mimeType, fileName: filename }, { quoted: m });

        reply(`*✅ Status Saved*`);
        console.log('Media saved successfully');
    } catch (e) {
        console.error('Error executing media saver command:', e);
        reply('⚠️ An error occurred while saving the media.');
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

cmd({
    pattern: "fullpp",
    desc: "Change the bot's profile picture",
    category: "owner",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, quoted, botNumber }) => {
    if (!isOwner) {
        if (!isOwner) return reply('You are not authorized to use this command.');
    }
    if (!quoted || !quoted.imageMessage) {
        return reply('❌ Please reply to an image to set it as the profile picture.');
    }

    try {
        let media = await conn.downloadAndSaveMediaMessage(quoted);
        const { img } = await generateProfilePicture(media);
        await conn.query({
            tag: 'iq',
            attrs: {
                to: botNumber,
                type: 'set',
                xmlns: 'w:profile:picture'
            },
            content: [{
                tag: 'picture',
                attrs: {
                    type: 'image'
                },
                content: img
            }]
        });
        fs.unlinkSync(media);
        reply("*✅ Bot Profile Picture Updated Successfully!*");

    } catch (err) {
        reply(`❌ Error: ${err.message}`);
    }
});

cmd({
  pattern: "updatecmd",
  react: "🧞",
  desc: "Update commands.",
  category: "owner",
  filename: __filename
},
async (conn, mek, m, {reply}) => {
  try {
    if (!isOwner) return reply("Only bot owners can use this command.");
    
    const pluginsDir = path.join(__dirname, '../plugins');
    const files = fs.readdirSync(pluginsDir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(pluginsDir, file);
        require(filePath);
        console.log(`Loaded ${file}`);
      }
    }
    
    reply("Commands updated successfully.");
  } catch (e) {
    console.log(e);
    reply(`Error updating commands: ${e.message}`);
  }
});