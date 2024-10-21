const { SinhalaSub } = require('@sl-code-lords/movie-api');
const { cmd, commands } = require('../command');
const { PixaldrainDL } = require("pixaldrain-sinhalasub");
const path = require('path');
const fs = require('fs');


cmd({
    pattern: "movie",
    desc: "Search for a movie",
    category: "movie",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const input = q.trim();
        if (!input) return reply("Please provide a movie or TV show name to search.");
        
        const result = await SinhalaSub.get_list.by_search(input);
        if (!result.status || result.results.length === 0) return reply("No results found.");

        let message = "*Search Results:*\n\n";
        result.results.forEach((item, index) => {
            message += `${index + 1}. ${item.title}\nType: ${item.type}\nLink: ${item.link}\n\n`;
        });
        await conn.sendMessage(from, { text: message }, { quoted: mek });
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`Error: ${e.message}`);
    }
});

cmd({
    pattern: "moviedl",
    desc: "Get movie download links.",
    category: "movie",
    react: "🎥",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const link = q.trim();
        
        const result = await SinhalaSub.movie(link);
        if (!result.status) return reply("Movie details not found.");

        const movie = result.result;
        let message = `*${movie.title}*\n\n`;
        message += `Release Date: ${movie.release_date}\n`;
        message += `IMDb Rating: ${movie.IMDb_Rating}\n`;
        message += `Director: ${movie.director.name}\n\n`;
        message += `*© 𝚀𝚄𝙴𝙴𝙽 𝚂𝙿𝚁𝙸𝙺𝚈 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝙱𝙾𝚃*`;


        const imageUrl = movie.images && movie.images.length > 0 ? movie.images[0] : null;

        await conn.sendMessage(from, {image: { url: imageUrl },caption: message}, { quoted: mek });

        const quality = "SD 480p";
        
        const directLink = await PixaldrainDL(link, quality, "direct");
        
        if (directLink) {
            await conn.sendMessage(from, {
                document: { url:directLink },
                mimetype: 'video/mp4',
                fileName: `${movie.title}.mp4`,
                caption: "*© 𝚀𝚄𝙴𝙴𝙽 𝚂𝙿𝚁𝙸𝙺𝚈 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝙱𝙾𝚃*"
            }, { quoted: mek });
        } else {
            reply("Could not find the 480p download link. Please check the URL or try a different movie.");
        }
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`Error: ${e.message}`);
    }
});


cmd({
    pattern: "recentmovies",
    desc: "Get recently added movies.",
    category: "movie",
    react: "🆕",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const page = 1;
        const result = await SinhalaSub.get_list.by_recent_movies(page);
        if (!result.status || result.results.length === 0) return reply("No recent movies found.");

        let message = "*Recently Added Movies:*\n\n";
        result.results.forEach((item, index) => {
            message += `${index + 1}. ${item.title}\nLink: ${item.link}\n\n`;
        });

        message += "_*© 𝚀𝚄𝙴𝙴𝙽 𝚂𝙿𝚁𝙸𝙺𝚈 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝙱𝙾𝚃*_";

        await conn.sendMessage(from, { text: message }, { quoted: mek });
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`Error: ${e.message}`);
    }
});
