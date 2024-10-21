const { updateEnv, readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');
const EnvVar = require('../lib/mongodbenv');
cmd({
    pattern: "settings",
    alias: ["setting","s"],
    desc: "Check bot online or not.",
    category: "owner",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return;

        const config = await readEnv();

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
        let autoreact = config.AUTO_REACT === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
        let AI_CHAT_BOT = config.AI_CHAT_BOT === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
        let OWNER_REACT = config.OWNER_REACT === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
        let autoBioEnabled = config.autoBioEnabled === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
        let AutoTyping = config.AutoTyping === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
        let AUTO_READ_CMD = config.AUTO_READ_CMD === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
        let AUTO_BLock_212 = config.AUTO_BLock_212 === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
        let AUTO_KICK_212 = config.AUTO_KICK_212 === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';
        let WELCOME = config.WELCOME === 'true' ? '♻️ 𝙾𝙽' : '🚫 𝙾𝙵𝙵';

        const vv = await conn.sendMessage(from, {
            image: { url: 'https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Settings.jpg?raw=true' },
            caption: `┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃       ⚙️ *QUEEN SPRIKY MD BOT SETTINGS* ⚙️
┃━━━━━━━━━━━━━━━━━━━━━━━┃
┣━💼 *Work Mode* : *${work}*
┣━🔊 *Auto Voice* : *${autoVoice}*
┣━📝 *Auto Status* : *${autoStatus}*
┣━💬 *Auto React* : *${autoreact}*
┣━🤖 *AI Chat Bot* : *${AI_CHAT_BOT}*
┣━🎯 *Owner React* : *${OWNER_REACT}*
┣━📋 *Auto Bio* : *${autoBioEnabled}*
┣━⌨️ *Auto Typing* : *${AutoTyping}*
┣━🛠️ *Auto Read Command* : *${AUTO_READ_CMD}*
┃━━━━━━━━━━━━━━━━━━━━━━━┃
┃      🔗  *CUSTOMIZE YOUR SETTINGS* ⤵️
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃       🔧 *OPTIONS MENU* 🔧
┃━━━━━━━━━━━━━━━━━━━━━━━┃

┣━ *_WORK MODE_* ⤵️
┃   ┣ 1.1 🔹 *Public Work*
┃   ┣ 1.2 🔹 *Private Work*
┃   ┣ 1.3 🔹 *Group Only*
┃   ┗ 1.4 🔹 *Inbox Only*

┣━ *_AUTO VOICE_* ⤵️
┃   ┣ 2.1 🔊 *Auto Voice On*
┃   ┗ 2.2 🔕 *Auto Voice Off*

┣━ *_AUTO STATUS SEEN_* ⤵️
┃   ┣ 3.1 👁️‍🗨️ *Auto Read Status On*
┃   ┗ 3.2 👁️❌ *Auto Read Status Off*

┣━ *_AUTO REACT_* ⤵️
┃   ┣ 4.1 😊 *Auto React On*
┃   ┗ 4.2 😐 *Auto React Off*

┣━ *_AI CHAT BOT_* ⤵️
┃   ┣ 5.1 🤖 *AI Chat Bot On*
┃   ┗ 5.2 🛑 *AI Chat Bot Off*

┣━ *_AUTO BIO_* ⤵️
┃   ┣ 6.1 ✍️ *Auto Bio On*
┃   ┗ 6.2 ✍️❌ *Auto Bio Off*

┣━ *_24/7 NEWS SERVICE_* ⤵️
┃   ┣ 7.1 📰 *Activate News Service*
┃   ┗ 7.2 🛑 *Deactivate News Service*
┃   ┗ 7.3 🔍 *Check News Service Status*

┣━ *_PREMIUM_* ⤵️
┃   ┣ 8.1 🌟 *Activate Premium*
┃   ┗ 8.2 🌟❌ *Deactivate Premium*
┃   ┗ 8.3 🔍 *Check Premium Status*

┣━ *_AUTO TYPING_* ⤵️
┃   ┣ 9.1 📝 *Activate Auto Typing*
┃   ┗ 9.2 📝❌ *Deactivate Auto Typing*

┣━ *_AUTO COMMAND READ_* ⤵️
┃   ┣ 10.1 🖊️ *Activate Auto Command Read*
┃   ┗ 10.2 🖊️❌ *Deactivate Auto Command Read*

┣━ *_AUTO BLOCK 212_* ⤵️
┃   ┣ 11.1 🚫 *Activate Block 212*
┃   ┗ 11.2 🚫❌ *Deactivate Block 212*

┣━ *_AUTO KICK 212_* ⤵️
┃   ┣ 12.1 👢 *Activate Auto Kick 212*
┃   ┗ 12.2 👢❌ *Deactivate Auto Kick 212*

┣━ *_WELCOME & GOODBYE_* ⤵️
┃   ┣ 13.1 🎉 *Activate Welcome/Goodbye*
┃   ┗ 13.2 🎉❌ *Deactivate Welcome/Goodbye*

┣━ *_OWNER REACT_* ⤵️
┃   ┣ 14.1 🎯 *Activate Owner React*
┃   ┗ 14.2 🎯❌ *Deactivate Owner React*

┗━━━━━━━━━━━━━━━━━━━━━━━┛
`
        }, { quoted: mek });

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const selectedOption = msg.message.extendedTextMessage.text.trim();

            if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === vv.key.id) {
                switch (selectedOption) {
                    case '1.1':
                        if (!isOwner) return;
                        reply('.update MODE:public');
                        reply('.restart');
                        break;
                    case '1.2':
                        if (!isOwner) return;
                        reply('.update MODE:private');
                        reply('.restart');
                        break;
                    case '1.3':
                        if (!isOwner) return;
                        reply('.update MODE:groups');
                        reply('.restart');
                        break;
                    case '1.4':
                        if (!isOwner) return;
                        reply('.update MODE:inbox');
                        reply('.restart');
                        break;

                    case '2.1':
                        if (!isOwner) return;
                        reply('.update AUTO_VOICE:true');
                        break;
                    case '2.2':
                        if (!isOwner) return;
                        reply('.update AUTO_VOICE:false');
                        break;

                    case '3.1':
                        if (!isOwner) return;
                        reply('.update AUTO_READ_STATUS:true');
                        break;
                    case '3.2':
                        if (!isOwner) return;
                        reply('.update AUTO_READ_STATUS:false');
                        break;

                    case '4.1':
                        if (!isOwner) return;
                        reply('.update AUTO_REACT:true');
                        break;
                    case '4.2':
                        if (!isOwner) return;
                        reply('.update AUTO_REACT:false');
                        break;

                    case '5.1':
                        if (!isOwner) return;
                        reply('.update AI_CHAT_BOT:true');
                        break;
                    case '5.2':
                        if (!isOwner) return;
                        reply('.update AI_CHAT_BOT:false');
                        break;

                    case '6.1':
                        if (!isOwner) return;
                        reply('.update autoBioEnabled:true');
                        break;  
                    case '6.2':
                        if (!isOwner) return;
                        reply('.update autoBioEnabled:false');
                        break;

                    case '7.1':
                        if (!isOwner) return;
                        reply('.sprikynews');
                        break;
                    case '7.2':
                        if (!isOwner) return;
                        reply('.stopsprikynews');
                        break; 
                    case '7.3':
                        if (!isOwner) return;
                        reply('.checksprikynews');
                        break;

                    case '8.1':
                        if (!isOwner) return;
                        reply('.primium');
                        break;
                    case '8.2':
                        if (!isOwner) return;
                        reply('.removepremium');
                        break; 
                    case '8.3':
                        if (!isOwner) return;
                        reply('.ispremium');
                        break;

                    case '9.1':
                        if (!isOwner) return;
                        reply('.update AutoTyping:true');
                        break;
                    case '9.2':
                        if (!isOwner) return;
                        reply('.update AutoTyping:false');
                        break;

                    case '10.1':
                        if (!isOwner) return;
                        reply('.update AUTO_READ_CMD:true');
                        break;
                    case '10.2':
                        if (!isOwner) return;
                        reply('.update AUTO_READ_CMD:false');
                        break;

                    case '11.1':
                        if (!isOwner) return;
                        reply('.update AUTO_BLock_212:true');
                        break;
                        case '11.2':
                        if (!isOwner) return;
                        reply('.update AUTO_BLock_212:false');
                        break;

                    case '12.1':
                        if (!isOwner) return;
                        reply('.update AUTO_KICK_212:true');
                        break;
                    case '12.2':
                        if (!isOwner) return;
                        reply('.update AUTO_KICK_212:false');
                        break;

                    case '13.1':
                        if (!isOwner) return;
                        reply('.update WELCOME:true');
                        break;
                    case '13.2':
                        if (!isOwner) return;
                        reply('.update WELCOME:false');
                        break;

                    case '14.1':
                        if (!isOwner) return;
                        reply('.update OWNER_REACT:true');
                        break;
                    case '14.2':
                        if (!isOwner) return;
                        reply('.update OWNER_REACT:false');
                        break;
                    default:
                        reply("Invalid option. Please select a valid option🔴");
                }
            }
        });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});