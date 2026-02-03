import moment from 'moment-timezone'

let handler = async (m, { conn, args }) => {
    // Evitar envío duplicado
    if (m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20)) {
        return
    }

    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let user = global.db.data.users[userId]
    let name = conn.getName(userId)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
    
    // URL de la imagen del menú
    let menuImage = 'https://cdn.russellxz.click/a1dfd509.jpg'
    
    let txt = `✎Ꮺ *${botname}* Ꮺ
   
╭─━━━━━━━━━━━━━━━─╮
│ ꕤ ¡Hola @${userId.split('@')[0]}!
╰─━━━━━━━━━━━━━━━─╯

╭─═⊰ ❀ 𝐄𝐒𝐓𝐀𝐃𝐎 𝐀𝐂𝐓𝐈𝐕𝐎
│ ➢ Estado: ${(conn.user.jid == global.conn.user.jid ? '❍ Premium ' : '❒ prem-Bot')}
│ ➣ Activo: ${uptime}
│ ➢ Users: ${totalreg}
│ ➣ Comandos: ${totalCommands}
│ ➢ Fecha: ${moment().tz('America/Mexico_City').format('DD/MM/YYYY')}
│ ➣ Hora: ${moment().tz('America/Mexico_City').format('HH:mm:ss')}
│ ➢ Servidor: Oculto
│ ➣ Ping: Online 
│ ➢ Memoria: Oculta
│ ➣ Modo: Privado 
╰───────────────╯                                                                                                                                                                                                                                                                                                                                                                                                                    

═══ 𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖣𝖤 𝖮𝖶𝖭𝖤𝖱 ═══

◎ *𝖦𝖤𝖲𝖳𝖨𝖮́𝖭 𝖮𝖶𝖭𝖤𝖱𝖲*
• #addowner • #delowner
• #codigo

◎ *𝖠𝖱𝖢𝖧𝖨𝖵𝖮𝖲*
• #backup • #copia
• #cleanfiles • #dsowner
• #cleartmp • #vaciartmp
• #deletefile

◎ *𝖤𝖢𝖮𝖭𝖮𝖬𝖨́𝖠*
• #addcoins • #añadircoin
• #userpremium • #addprem
• #delprem • #remove
• #addexp • #añadirxp
• #removecoin • #quitarcoin
• #deletedatauser • #resetuser
• #removexp • #quitarxp

◎ *𝖢𝖮𝖬𝖴𝖭𝖨𝖢𝖠𝖢𝖨𝖮́𝖭*
• #bcgc • #let
• #reunion • #meeting

◎ *𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖣𝖤 𝖡𝖠𝖭𝖤𝖮𝖲*
┌─ ◍ 𝖲𝗈𝗅𝗈 𝖭𝗎𝗅𝗅:
│ • #banned [usuario] [tiempo] [razón]
│ • #unban [usuario]
├─ ◍ 𝖳𝗈𝖽𝗈𝗌 𝗅𝗈𝗌 𝗎𝗌𝗎𝖺𝗋𝗂𝗈𝗌:
│ • #horaban
└─ ◍ 𝖮𝗐𝗇𝖾𝗋𝗌:
  • #checkban [usuario]
  • #banlist
  • #block [usuario]
  • #unblock [usuario]
  • #blocklist

*𝖤𝗃𝖾𝗆𝗉𝗅𝗈𝗌 𝖽𝖾 𝗎𝗌𝗈:*
• #banned @user 7d Spam
• #banned 521234567890 2h 30m Mal comportamiento
• #banned @user Permanente
• #unban @user
• #horaban (ver tu tiempo de baneo)

◎ *𝖠𝖣𝖬𝖨𝖭 𝖠𝖴𝖳𝖮*
• #autoadmin

◎ *𝖦𝖱𝖴𝖯𝖮𝖲*
• #newgc • #creargc
• #grouplist • #listgroup
• #join • #invite
• #leave • #salir

◎ *𝖶𝖤𝖡*
• #get • #fetch
• #plugin • #getplugin

◎ *𝖢𝖮𝖭𝖥𝖨𝖦𝖴𝖱𝖠𝖢𝖨𝖮́𝖭*
• #prefix • #resetprefix
• #reiniciar • #restart
• #setbanner • #setavatar
• #setimage2 • #setpfp2
• #setmoneda • #setname
• #setbio2 • #setstatus2
• #update

◎ *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖢𝖴𝖲𝖳𝖮𝖬*
• #addcmd • #setcmd
• #delcmd • #cmdlist
• #listcmd • #editarplugin
• #subirplugin • #eliminarplugin
• #saveplugin • #svp
• #descargarplugins • #descargarplugin 

╭────────────────────
│ ◍ Usa con responsabilidad
│ ◍ Sistema de baneos mejorado
│ ◍ Soporta baneos temporales
╰────── ◍ 𝖮𝖶𝖭𝖤𝖱 ◍
`

    try {
        // Enviar solo una vez con validación
        await conn.sendMessage(m.chat, {
            image: { url: menuImage },
            caption: txt,
            mentions: [userId]
        }, { quoted: m })
    } catch (error) {
        console.error('Error al enviar la imagen:', error)
        await conn.sendMessage(m.chat, { 
            text: txt,
            mentions: [userId]
        }, { quoted: m })
    }
}

handler.help = ['mods']
handler.tags = ['main']
handler.command = ['dev', 'owners']
handler.rowner = true

export default handler

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}