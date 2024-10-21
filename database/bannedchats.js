/*const fs = require('fs');

let bannedChats = [];
if (fs.existsSync('bannedChats.json')) {
    bannedChats = JSON.parse(fs.readFileSync('bannedChats.json'));
}
const saveBannedChats = () => {
    fs.writeFileSync('bannedChats.json', JSON.stringify(bannedChats));
};
const banChat = (chatId) => {
    if (!bannedChats.includes(chatId)) {
        bannedChats.push(chatId);
        saveBannedChats();
    }
};
const unbanChat = (chatId) => {
    bannedChats = bannedChats.filter(chat => chat !== chatId);
    saveBannedChats();
};
const isBanned = (chatId) => bannedChats.includes(chatId);

module.exports = {
    banChat,
    unbanChat,
    isBanned,
    bannedChats
};
*/