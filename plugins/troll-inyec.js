const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = async (m, { conn, command }) => {
    
    if (command == 'hack') {
        let { key } = await conn.sendMessage(m.chat, { text: 'Iniciando protocolo...' })
        const pasos = [
            '🔍 Conectando a proxy local...',
            '🌐 Accediendo a IP: 192.168.1.254',
            '🔓 Saltando firewall de WhatsApp...',
            '📩 Extrayendo mensajes recientes...',
            '📸 Capturando cámara frontal...',
            '📍 Ubicación obtenida: [40.4167, -3.7032]',
            '✅ Datos enviados a servidor remoto.'
        ]
        for (let texto of pasos) {
            await delay(1200)
            await conn.sendMessage(m.chat, { text: texto, edit: key })
        }
    }

    if (command == 'loading') {
        let { key } = await conn.sendMessage(m.chat, { text: 'Cargando...' })
        for (let i = 0; i <= 100; i += 20) {
            let carga = '█'.repeat(i / 10) + '░'.repeat(10 - (i / 10))
            await delay(1000)
            await conn.sendMessage(m.chat, { text: `Descargando recursos: [${carga}] ${i}%`, edit: key })
        }
    }

    if (command == 'dino') {
        let { key } = await conn.sendMessage(m.chat, { text: '🦖' })
        let frames = [
            '🦖', '🦖 🌵', '🦖  🌵', '🦖   🌵', '🦖    🌵', '🦖     🌵', '🦖🌵', '🦖💥', '💀'
        ]
        for (let f of frames) {
            await delay(800)
            await conn.sendMessage(m.chat, { text: f, edit: key })
        }
    }
}

handler.command = ['hack', 'loading', 'dino']
export default handler