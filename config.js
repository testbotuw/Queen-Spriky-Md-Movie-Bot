const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || '46kC0b4J#3tLFceZmER7vCllIybyGLKIZUumk_fNyU3cDTZwu7C4', // Enter Your Session ID
    PREFIX: process.env.PREFIX || '.',
    AUTO_READ_CMD: process.env.AUTO_READ_CMD || 'true',
    MODE: process.env.MODE || 'inbox',
    AutoTyping: process.env.AutoTyping || 'true',
    Owner: process.env.OwnerNumber || '94722777000',    // Enter Your Owner Number
    BotNumber: process.env.BotNumber || '94758900210',    // Enter Your Bot Number
};
