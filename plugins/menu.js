const { generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent , proto} = require('@whiskeysockets/baileys');
const config = require('../config')
const {readEnv} = require('../lib/database')
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
        const config = await readEnv();
        let menu = {
            general: '',
            download: '',
            group: '',
            owner: '',
            search: '',
            ai: '',
            games: '',
            tools: '',
            random: '',
            premium: '',
            news: '',
            anime: '',
            movie: ''
        };
        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🌟 *Hello ${pushname}, Welcome to Queen Spriky Bot!* 👋

🤖 *Bot Name:* Queen Spriky Bot  
👤 *Owner Name:* Udavin Wijesundara  
🔖 *Prefix:* ${config.PREFIX}  
⏱️ *Uptime:* ${runtime(process.uptime())}  
💾 *RAM Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB  
🖥️ *Host Name:* ${os.hostname()}

═════════════════════════

🌐 *GENERAL COMMANDS* 🌐

${menu.general}

📥 *DOWNLOAD COMMANDS* 📥

${menu.download}

💎 *PREMIUM COMMANDS* 💎

${menu.premium}

🍿 *MOVIE COMMANDS* 🍿

${menu.movie}

👥 *GROUP COMMANDS* 👥

${menu.group}

👑 *OWNER COMMANDS* 👑

${menu.owner}

🔍 *SEARCH COMMANDS* 🔎

${menu.search}

🤖 *AI COMMANDS* 🤖

${menu.ai}

🎮 *GAMES COMMANDS* 🎮

${menu.games}

🛠️ *TOOLS COMMANDS* ⚒️

${menu.tools}

📰 *NEWS COMMANDS* 📰

${menu.news}

🎲 *RANDOM COMMANDS* 🎲

${menu.random}

⛩️ *ANIME COMMANDS* ⛩️

${menu.anime}

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

//-----------------------------------------------Menu2-----------------------------------------------

cmd({
    pattern: "menu2",
    desc: "Show list of available commands.",
    category: "general",
    react: "🧸",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, sender,
    senderNumber, botNumber2, botNumber, pushname, isMe, isOwner,
    groupMetadata, groupName, participants, groupAdmins, isBotAdmins,
    isAdmins, reply
}) => {
    const rows = [
        { header: "", title: "GENERAL MENU", description: "General menu", id: '.generalmenu' },
        { header: "", title: "DOWNLOAD MENU", description: "Download Menu", id: '.downloadmenu' },
        { header: "", title: "PREMIUM MENU", description: "Premium Menu", id: '.premiummenu' },
        { header: "", title: "MOVIE MENU", description: "Movie Menu", id: '.moviemenu' },
        { header: "", title: "GROUP MENU", description: "Group Menu", id: '.groupmenu' },
        { header: "", title: "OWNER MENU", description: "Owner Menu", id: '.ownermenu' },
        { header: "", title: "SEARCH MENU", description: "Search Menu", id: '.searchmenu' },
        { header: "", title: "AI MENU", description: "AI Menu", id: '.aimenu' },
        { header: "", title: "GAMES MENU", description: "Games Menu", id: '.gamesmenu' },
        { header: "", title: "TOOL MENU", description: "Tool Menu", id: '.toolmenu' },
        { header: "", title: "NEWS MENU", description: "News Menu", id: '.newsmenu' },
        { header: "", title: "RANDOM MENU", description: "Random Menu", id: '.randommenu' },
        { header: "", title: "ANIME MENU", description: "Anime Menu", id: '.animemenu' }
    ];

    var buttons = [
        {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: "Follow Our WhatsApp Channel", 
                url: "https://whatsapp.com/channel/0029VajvrA2ATRSkEnZwMQ0p", 
                merchant_url: "https://whatsapp.com/channel/0029VajvrA2ATRSkEnZwMQ0p"
            }),
        },
        {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
                title: 'Select Menu', 
                sections: [{ title: '', highlight_label: '', rows: rows }]
            }),
        }
    ];

    let opts = {
        image: 'https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true',
        header: '',
        footer: '*© 𝚀𝚄𝙴𝙴𝙽 𝚂𝙿𝚁𝙸𝙺𝚈 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝙱𝙾𝚃*',
        body: `🌟 *Hello ${pushname}, Welcome to Queen Spriky Bot!* 👋\n\n` +
            `🤖 *Bot Name:* Queen Spriky Bot  \n` +
            `👤 *Owner Name:* Udavin Wijesundara  \n` +
            `🔖 *Prefix:* ${config.PREFIX}  \n` +
            `⏱️ *Uptime:* ${runtime(process.uptime())}  \n` +
            `💾 *RAM Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB  \n` +
            `🖥️ *Host Name:* ${os.hostname()}\n\n` +
            `═════════════════════════`
    };

    try {
        await conn.sendButtonMessage(from, buttons, opts);
    } catch (error) {
        console.error('Error: ', error);
        reply('Error');
    }
});

cmd({
    pattern: "generalmenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            general: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🌐 *GENERAL COMMANDS* 🌐\n\n${menu.general}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "downloadmenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            download: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `📥 *DOWNLOAD COMMANDS* 📥\n\n${menu.download}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "premiummenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            premium: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `💎 *PREMIUM COMMANDS* 💎\n\n${menu.premium}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "moviemenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            movie: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🍿 *MOVIE COMMANDS* 🍿\n\n${menu.movie}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "groupmenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            group: ''

        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `👥 *GROUP COMMANDS* 👥\n\n${menu.group}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "ownermenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            owner: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `👑 *OWNER COMMANDS* 👑\n\n${menu.owner}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "searchmenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            search: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🔍 *SEARCH COMMANDS* 🔍\n\n${menu.search}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "aimenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            ai: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🤖 *AI COMMANDS* 🤖\n\n${menu.ai}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "gamesmenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            games: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🎮 *GAMES COMMANDS* 🎮\n\n${menu.games}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "toolsmenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            tools: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🛠️ *TOOLS COMMANDS* 🛠️\n\n${menu.tools}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "randommenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            random: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🎲 *RANDOM COMMANDS* 🎲\n\n${menu.random}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "newsmenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            news: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `📰 *NEWS COMMANDS* 📰\n\n${menu.news}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});

cmd({
    pattern: "animmenu",
    category: "general",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q }) => {
 
    try {
        const config = await readEnv();
        let menu = {
            anime: ''
        };

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `*Command:* ${config.PREFIX}${commands[i].pattern}\n*Description:* ${commands[i].desc || 'No description available'}\n*Use:* ${commands[i].use || 'Just type the command'}\n\n`;
            }
        }

        let madeMenu = `🍥 *ANIME COMMANDS* 🍥\n\n${menu.anime}\n═════════════════════════\n🌹 *Thank you for using Queen Spriky WhatsApp Bot!*🌹\n> 👨‍💻 *Developer:* Udavin Wijesundara`;

        await conn.sendMessage(from, { image: { url: "https://github.com/uwtechshow-official/Spriky-Database/blob/main/Logo/Menu.jpg?raw=true" }, caption: madeMenu }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`${e}`);
    }
});