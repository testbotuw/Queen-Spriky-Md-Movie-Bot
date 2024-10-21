const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, generateWAMessageFromContent, prepareWAMessageMedia ,generateWAMessageContent,proto, Browsers } = require('@whiskeysockets/baileys');
const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const { File } = require('megajs');
const moment = require('moment-timezone');
const ownerNumber = [`${config.Owner}`];

if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
    const sessdata = config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
        if (err) throw err;
        fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
            console.log("Session downloaded ✅");
        });
    });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

async function connectToWA() {
    const connectDB = require('./lib/mongodb');
    connectDB();
    
    const { readEnv } = require('./lib/database');
    const config = await readEnv();
    const prefix = config.PREFIX;
    console.log("Connecting Queen Spriky MD 👣...");

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    var { version } = await fetchLatestBaileysVersion();
    
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    });

    let work;
    switch (config.MODE) {
        case 'public':
            work = '𝙿𝚄𝙱𝙻𝙸𝙲🌎';
            break;
        case 'private':
            work = '𝙿𝚁𝙸𝚅𝙰𝚃𝙴👤';
            break;
        case 'groups':
            work = '𝙶𝚁𝙾𝚄𝙿 𝙾𝙽𝙻𝚈👥';
            break;
        case 'inbox':
            work = '𝙸𝙽𝙱𝙾𝚇 𝙾𝙽𝙻𝚈🫂';
            break;
        default:
            work = '𝚄𝙽𝙺𝙾𝚆𝙽🛑';
    }

    let autoStatus = config.AUTO_READ_STATUS === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
    let autoVoice = config.AUTO_VOICE === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
    let OWNER_REACT = config.OWNER_REACT === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
    let AutoTyping = config.AutoTyping === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
    let AUTO_READ_CMD = config.AUTO_READ_CMD === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
    let WELCOME = config.WELCOME === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log('😼 Installing Plugins ... ');
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() === ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log('Plugins installed successfully ✅');
            console.log('Bot connected to WhatsApp ✅');
            let up = `🎉 ＱＵＥＥＮ ＳＰＲＩＫＹ ＭＤ
ＣＯＮＮＥＣＴＥＤ...❤️

👑 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐐𝐔𝐄𝐄𝐍 𝐒𝐏𝐑𝐈𝐊𝐘 𝐌𝐃

⚡ 𝙿𝚁𝙴𝙵𝙸𝚇: ${config.PREFIX}
👤 𝙾𝚆𝙽𝙴𝚁: @${ownerNumber}

┃━━━━━━━━━━━━━━━━━━━━━━━┃
┣━💼 *Work Mode* : *${work}*
┣━🔊 *Auto Voice* : *${autoVoice}*
┣━📝 *Auto Status* : *${autoStatus}*
┣━🎯 *Owner React* : *${OWNER_REACT}*
┣━⌨️ *Auto Typing* : *${AutoTyping}*
┣━🛠️ *Auto Read Command* : *${AUTO_READ_CMD}*
┣━🎉 *Welcome* : *${WELCOME}*
┃━━━━━━━━━━━━━━━━━━━━━━━┃

📢 𝗦𝗧𝗔𝗬 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 𝗪𝗜𝗧𝗛 𝗨𝗦 𝗙𝗢𝗥 𝗨𝗣𝗗𝗔𝗧𝗘𝗦!

📺 YouTube Channel:
https://youtube.com/channel/UClgw5nfUPeDIb7vUZa3euMg?si=_0LMxzLnVIKScjUi

📡 Follow Queen Spriky WhatsApp Channel:
https://whatsapp.com/channel/0029VajvrA2ATRSkEnZwMQ0p

💬 WhatsApp Group:
https://chat.whatsapp.com/KQZ2CxCLL5D268bh6bmBMg

💻 Check out our GitHub:
https://github.com/uwtechshow-official/Queen-Spriky-MD

𝚀𝚄𝙴𝙴𝙽 𝚂𝙿𝚁𝙸𝙺𝚈 𝙼𝙳™

> Developed By : Udavin`;
            conn.sendMessage(ownerNumber + "@s.whatsapp.net", {
                image: { url: `https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Connected.jpg?raw=true` },
                caption: up
            });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0];
        if (!mek.message) return;
        
//========================================================================

    const jid = mek.key.remoteJid;
    let messageContent;

    if (mek.message.conversation) {
        messageContent = mek.message.conversation;
    } else if (mek.message.extendedTextMessage) {
        messageContent = mek.message.extendedTextMessage.text;
    } else if (mek.message.reactionMessage) {
        messageContent = mek.message.reactionMessage.text;
    } else {
        messageContent = 'Unknown message type';
    }

    console.log("JID:", jid + "Message:", messageContent);

 //==================================================================================================
        conn.sendButtonMessage = async (jid, buttons, opts = {}) => {

            let header;
            if (opts?.video) {
                var video = await prepareWAMessageMedia({
                    video: {
                        url: opts && opts.video ? opts.video : ''
                    }
                }, {
                    upload: conn.waUploadToServer
                })
                header = {
                    title: opts && opts.header ? opts.header : '',
                    hasMediaAttachment: true,
                    videoMessage: video.videoMessage,
                }
      
            } else if (opts?.image) {
                var image = await prepareWAMessageMedia({
                    image: {
                        url: opts && opts.image ? opts.image : ''
                    }
                }, {
                    upload: conn.waUploadToServer
                })
                header = {
                    title: opts && opts.header ? opts.header : '',
                    hasMediaAttachment: true,
                    imageMessage: image.imageMessage,
                }
      
            } else {
                header = {
                    title: opts && opts.header ? opts.header : '',
                    hasMediaAttachment: false,
                }
            }
            let interactiveMessage;
            if (opts && opts.contextInfo) {
                interactiveMessage = {
                    body: {
                        text: opts && opts.body ? opts.body : ''
                    },
                    footer: {
                        text: opts && opts.footer ? opts.footer : ''
                    },
                    header: header,
                    nativeFlowMessage: {
                        buttons: buttons,
                        messageParamsJson: ''
                    },
                    contextInfo: opts && opts.contextInfo ? opts.contextInfo : ''
                }
            } else {
                interactiveMessage = {
                    body: {
                        text: opts && opts.body ? opts.body : ''
                    },
                    footer: {
                        text: opts && opts.footer ? opts.footer : ''
                    },
                    header: header,
                    nativeFlowMessage: {
                        buttons: buttons,
                        messageParamsJson: ''
                    }
                }
            }
      
            let message = generateWAMessageFromContent(jid, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2,
                        },
                        interactiveMessage: interactiveMessage
                    }
                }
            }, {
      
            })
      
            return await conn.relayMessage(jid, message["message"], {
                messageId: message.key.id
            })
        }

        conn.ev.on('messages.upsert', async (m) => {
            const messages = m.messages || [];
            for (const message of messages) {
                try {
                    if (!message || !message.key || !message.message) continue;
        
                    const type = getContentType(message.message);
                    const btnResponse = (type === 'interactiveResponseMessage') ? message.message.interactiveResponseMessage : null;
        
                    if (btnResponse) {
                        const buttonId = btnResponse.buttonId;
                        console.log(`Button clicked with ID: ${buttonId}`);
                    }
    
                    if (message.message.conversation) {
                        await handleCommands(message.key.remoteJid, message.message.conversation, conn);
                    }
        
                } catch (error) {
                    console.error('Error handling message:', error);
                }
            }
        });

        
    //==================================================================================================

//=================================================================================

        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
            await conn.readMessages([mek.key]);
        }
//=========================================================================================

        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const content = JSON.stringify(mek.message);
        const from = mek.key.remoteJid;
        const quoted = (type === 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null) ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : [];
        const body = (type === 'conversation') ? mek.message.conversation :
                     (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                     (type === 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption :
                     (type === 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : '';

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        const pushname = mek.pushName || 'Sin Nombre';
        const isMe = botNumber.includes(senderNumber);
        const isOwner = ownerNumber.includes(senderNumber) || isMe;
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => { }) : '';
        const groupName = isGroup ? groupMetadata.subject : '';
        const participants = isGroup ? await groupMetadata.participants : [];
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : [];
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
        const isAnti = (teks) => {
            let getdata = teks
            for (let i = 0; i < getdata.length; i++) {
                if (getdata[i] === from) return true
            }
            return false
        }
        const isReact = m.message.reactionMessage ? true : false;

        const reply = (teks) => {
            conn.sendMessage(from, { text: teks }, { quoted: mek });
        };

        conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
            let mime = '';
            let res = await axios.head(url);
            mime = res.headers['content-type'];
            if (mime.split("/")[1] === "gif") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options });
            }
            let type = mime.split("/")[0] + "Message";
            if (mime === "application/pdf") {
                return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options });
            }
            if (mime.split("/")[0] === "image") {
                return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options });
            }
            if (mime.split("/")[0] === "video") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options });
            }
            if (mime.split("/")[0] === "audio") {
                return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options });
            }
        };
//===================================Owner React=========================================

        if (config.OWNER_REACT === "true") {
            if (senderNumber.includes(ownerNumber)) {
                if (isReact) return;
                m.react("🤖");
            }
        }

//===================================Work Type========================================= 

        if (!isOwner && config.MODE === "private") return;
        if (!isOwner && isGroup && config.MODE === "inbox") return;
        if (!isOwner && !isGroup && config.MODE === "groups") return;

//==========================Auto Read============================

if (isCmd && config.AUTO_READ_CMD === "true") {
    await conn.readMessages([mek.key]) 
}

//==========================Auto Typing============================

if (isCmd && config.AutoTyping === "true") {
    await conn.sendPresenceUpdate('composing', from)
}

/*conn.sendButtonMessage = async (jid, buttons, quoted, opts = {}) => {

    let header;
    if (opts?.image) {
        var image = await prepareWAMessageMedia({
            image: {
                url: opts && opts.image ? opts.image : ''
            }
        }, {
            upload: conn.waUploadToServer
        })
        header = {
            title: opts && opts.header ? opts.header : '',
            hasMediaAttachment: true,
            imageMessage: image.imageMessage,
        }

    } else {
        header = {
            title: opts && opts.header ? opts.header : '',
            hasMediaAttachment: false,
        }
    }


    let message = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                },
                interactiveMessage: {
                    body: {
                        text: opts && opts.body ? opts.body : ''
                    },
                    footer: {
                        text: opts && opts.footer ? opts.footer : ''
                    },
                    header: header,
                    nativeFlowMessage: {
                        buttons: buttons,
                        messageParamsJson: ''
                     },
        contextInfo: {
mentionedJid: [ '' ],
groupMentions: [],
forwardingScore: 999,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: '',
newsletterName: "",
serverMessageId: 999
},
externalAdReply: { 
title: '𝘔𝘌𝘋𝘡 𝘔𝘋 2024',
body: 'ᴡᴏʀʟᴅ ʙᴇꜱᴛ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ',
mediaType: 1,
sourceUrl: "https://github.com/" ,
thumbnailUrl: '' ,
renderLargerThumbnail: true,
showAdAttribution: true
              }
                
                    }
                }
            }
        }
    }, {
        quoted: quoted
    })

    conn.relayMessage(jid, message["message"], {
        messageId: message.key.id
    })
}*/

//==================================================================
        const events = require('./command');
        const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;

        if (isCmd) {
            const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
            if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                try {
                    cmd.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
                } catch (e) {
                    console.error("[PLUGIN ERROR] " + e);
                }
            }
        }
             
        events.commands.map(async(command) => {
            if (body && command.on === "body") {
            command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            } else if (mek.q && command.on === "text") {
            command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            } else if (
            (command.on === "image" || command.on === "photo") &&
            mek.type === "imageMessage"
            ) {
            command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            } else if (
            command.on === "sticker" &&
            mek.type === "stickerMessage"
            ) {
            command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
            }});

    });

    function handleCommands(conn, mek, m, context) {
        const { isCmd, command, from, quoted, body } = context;
        const events = require('./command');
        const cmdName = isCmd ? command : false;
    
        try {
            if (isCmd) {
                const cmd =
                    events.commands.find(c => c.pattern === cmdName) ||
                    events.commands.find(c => c.alias && c.alias.includes(cmdName));
    
                if (cmd) {
                    if (cmd.react) {
                        conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                    }
                    cmd.function(conn, mek, m, context);
                }
            }

            events.commands.forEach(async (command) => {
                if (body && command.on === "body") {
                    command.function(conn, mek, m, context);
                } else if (mek.q && command.on === "text") {
                    command.function(conn, mek, m, context);
                } else if (
                    (command.on === "image" || command.on === "photo") &&
                    mek.message?.imageMessage
                ) {
                    command.function(conn, mek, m, context);
                } else if (
                    command.on === "sticker" &&
                    mek.message?.stickerMessage
                ) {
                    command.function(conn, mek, m, context);
                }
            });
        } catch (error) {
            console.error("[HANDLE COMMANDS ERROR] Command: " + cmdName + " | Error: " + error.message);
        }
    }
    
    conn.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };
}

connectToWA();
app.listen(port, () => console.log(`Server running on port ${port}`));
