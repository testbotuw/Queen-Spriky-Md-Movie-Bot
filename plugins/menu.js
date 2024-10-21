const { generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent , proto} = require('@whiskeysockets/baileys');
const config = require('../config')
const {cmd , commands} = require('../command')
const {sleep} = require('../lib/functions')
const os = require("os")
const {runtime} = require('../lib/functions')


//-----------------------------------------------Menu-----------------------------------------------

cmd({
    pattern: "menu",
    desc: "Show list of available commands.",
    category: "general",
    react: "🧸",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
 
    try {
        let menu = {
            general: '',
            group: '',
            owner: '',
            movie: ''
        };
        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🌟 *Hello ${pushname}, Welcome to Queen Spriky Bot!* 👋

🤖 *Bot Name:* Queen Spriky Movie Bot  
👤 *Owner Name:* Udavin Wijesundara  
🔖 *Prefix:* ${config.PREFIX}  
⏱️ *Uptime:* ${runtime(process.uptime())}  
💾 *RAM Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB  
🖥️ *Host Name:* ${os.hostname()}

═════════════════════════

🌐 *GENERAL COMMANDS* 🌐

${menu.general}

🍿 *MOVIE COMMANDS* 🍿

${menu.movie}

👥 *GROUP COMMANDS* 👥

${menu.group}

👑 *OWNER COMMANDS* 👑

${menu.owner}
═════════════════════════

🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹

> 👨‍💻 *Developer:* Udavin Wijesundara
`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});