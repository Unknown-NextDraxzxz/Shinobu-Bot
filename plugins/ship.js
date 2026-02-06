const handler = async (m, { conn, participants, command, text }) => {
    const mention = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    const randomValue = Math.floor(Math.random() * 101)

    if (command === 'ship') {
        const ps = participants.map(u => u.id)
        const a = ps[Math.floor(Math.random() * ps.length)]
        const b = ps[Math.floor(Math.random() * ps.length)]
        const msg = `❤️ *MATCHMAKER* ❤️\n\n@${a.split('@')[0]} x @${b.split('@')[0]}\n*Compatibilidad:* ${randomValue}%\n\n¡Hacen una pareja increíble! 💍`
        conn.sendMessage(m.chat, { text: msg, mentions: [a, b] }, { quoted: m })
    }

    if (command === 'gay') {
        const msg = `🏳️‍🌈 *TEST GAY*\n\nEl usuario @${mention.split('@')[0]} es *${randomValue}%* gay.`
        conn.sendMessage(m.chat, { text: msg, mentions: [mention] }, { quoted: m })
    }

    if (command === 'iq') {
        const msg = `🧠 *TEST DE IQ*\n\nEl coeficiente intelectual de @${mention.split('@')[0]} es de: *${randomValue + 50}*`
        conn.sendMessage(m.chat, { text: msg, mentions: [mention] }, { quoted: m })
    }

    if (command === 'suerte') {
        const frases = ['Hoy es tu día de suerte 🍀', 'Mejor no salgas de casa 💀', 'Te espera una sorpresa 🎁', 'Alguien te piensa con amor ❤️', 'Cuidado con lo que deseas ⚠️']
        const res = frases[Math.floor(Math.random() * frases.length)]
        const msg = `🔮 *TU SUERTE*\n\n@${m.sender.split('@')[0]}: ${res}`
        conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })
    }
}

handler.command = ['ship', 'gay', 'iq', 'suerte']
handler.group = true

export default handler