let handler = async (m, { conn }) => {
    // Lista de links: hasta 10
    const grupos = [
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }, // Grupo 1
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }, // Grupo 2
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }, // Grupo 3
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }, // Grupo 4
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }, // Grupo 5
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }, // Grupo 6
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }, // Grupo 7
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }, // Grupo 8
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }, // Grupo 9
        { link: "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t" }  // Grupo 10
    ];

    let mensaje = `╔══❖ COMUNIDADES DE ${conn.user.name.toUpperCase()} ❖══╗\n`;
    
    // Iteramos los links y sacamos info
    for (let i = 0; i < grupos.length; i++) {
        const g = grupos[i];
        if (!g.link) continue; // Ignorar si no hay link
        
        try {
            // Extraer el código del link
            const code = g.link.split('/').pop();
            
            // Obtener metadata del grupo
            const info = await conn.groupGetInviteInfo(code);
            
            const nombre = info.subject || 'Sin nombre';
            const participantes = info.size || 0;
            const descripcion = info.desc || '';
            
            mensaje += `│ ${i + 1}. ${nombre}\n`;
            mensaje += `│ 🔗 ${g.link}\n`;
            mensaje += `│ 👥 ${participantes} miembros\n`;
            if (descripcion) mensaje += `│ 📝 ${descripcion.substring(0, 50)}${descripcion.length > 50 ? '...' : ''}\n`;
            mensaje += `────────────────────────\n`;
            
        } catch (e) {
            console.log(`❌ Error con link: ${g.link}`, e.message);
            mensaje += `│ ${i + 1}. Link inválido o privado\n`;
            mensaje += `│ 🔗 ${g.link}\n`;
            mensaje += `────────────────────────\n`;
        }
    }
    
    mensaje += `╚════════════════════════════════╝\n📌 ¡Únete a nuestras comunidades!`;
    
    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
}

handler.tags = ['info'];
handler.help = ['grupos'];
handler.command = ['grupos', 'links', 'comunidades'];
handler.group = false;

export default handler;