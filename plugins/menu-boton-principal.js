let handler = async (m, { conn, usedPrefix }) => {
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length;
  let libreria = 'Baileys';
  let vs = '1.3';
  let userId = m.sender;
  
  let infoText = `╭─━━━━━━━━━━━━━━━─╮
│ ꕤ ¡Hola @${userId.split('@')[0]} 𝖬𝗂 𝗇𝗈𝗆𝖻𝗋𝖾 𝖾𝗌 ${botname}
╰─━━━━━━━━━━━━━━━─╯

╭─═⊰ ❀ 𝐄𝐒𝐓𝐀𝐃𝐎 𝐀𝐂𝐓𝐈𝐕𝐎
│ ➣ Estado: ${(conn.user.jid == global.conn.user.jid ? '❍ Premium' : '❒ Prem-Bot')}
│ ➢ Users: ${totalreg.toLocaleString()}
│ ➣ Comandos: ${totalCommands}
│ ➢ Librería » ${libreria}
│ ➣ Servidor: Oculto
│ ➢ Ping: Online
│ ➣ Version: ${vs}
│ ➢ Modo: ${(conn.user.jid == global.conn.user.jid ? 'Privado' : 'Publico')}
╰───────────────╯

*𝖢𝗋𝖾𝖺𝖽𝗈𝗋┆𝖬𝖺𝗒𝖾𝗋𝗌*
Selecciona una opción:`;

  let buttons = [
    { buttonId: usedPrefix + 'menu2', buttonText: { displayText: '𝗆𝖾𝗇𝗎' }, type: 1 },
    { buttonId: usedPrefix + 'nuevos', buttonText: { displayText: '𝖺𝖼𝗍𝗎𝖺𝗅𝗂𝗓𝖺𝖼𝗂𝗈𝗇𝖾𝗌' }, type: 1 },
    { buttonId: usedPrefix + 'code', buttonText: { displayText: '𝖲𝗎𝖻-𝖡𝗈𝗍' }, type: 1 },
    { buttonId: usedPrefix + 'creador', buttonText: { displayText: 'C𝗋𝖾𝖺𝖽𝗈𝗋' }, type: 1 },
    { buttonId: usedPrefix + 'menu+', buttonText: { displayText: '𝗆𝖾𝗇𝗎 +18' }, type: 1 }
  ];
  
  // URL de la imagen o video (cambia por tu propia URL)
  let mediaUrl = 'https://cdn.russellxz.click/a1dfd509.jpg'; // Cambia esto por tu imagen
  // let mediaUrl = 'https://example.com/video.mp4'; // O usa un video
  
  try {
    // Intenta enviar con imagen
    await conn.sendMessage(m.chat, {
      image: { url: mediaUrl },
      caption: infoText,
      footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
      buttons: buttons,
      headerType: 4,
      mentions: [userId]
    }, { quoted: m });
  } catch {
    // Si falla, envía sin imagen (método alternativo)
    let buttonMessage = {
      text: infoText,
      footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
      buttons: buttons,
      headerType: 1,
      mentions: [userId]
    };
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menú', 'menu', 'help'];

export default handler;