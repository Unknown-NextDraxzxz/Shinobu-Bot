import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MAX_FILE_SIZE = 2000 * 1024 * 1024 // 2 GB (Límite máximo de WhatsApp)

async function resizeImage(buffer, size = 300) {
    try {
        const image = await Jimp.read(buffer)
        return await image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
    } catch { return buffer }
}

// =================== API 1: SAVENOW (Para videos cortos/medios) ===================
const savenowApi = {
    key: "dfcb6d76f2f6a9894gjkege8a4ab232222",
    ytdl: async function(url, format) {
        try {
            const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${this.key}`;
            const init = await fetch(initUrl, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://y2down.cc/" } });
            const data = await init.json();
            if (!data.success) return { error: "API Limit" };

            const id = data.id;
            let attempts = 0;
            while (attempts < 60) { // 3 minutos de espera para videos largos
                await new Promise(res => setTimeout(res, 3000));
                const res = await fetch(`https://p.savenow.to/api/progress?id=${id}`);
                const status = await res.json();
                if (status.progress === 1000) return { title: data.info?.title, link: status.download_url };
                if (status.progress < 0) break;
                attempts++;
            }
            return { error: "Timeout" };
        } catch { return { error: "Error de conexión" }; }
    }
};

// =================== API 2: API DE RESPALDO (Mejor para videos largos) ===================
const alternativeApi = {
    download: async (url, type) => {
        try {
            // Usamos una instancia de axios con un timeout más largo para videos pesados
            const res = await axios.get(`https://api.zenkey.my.id/api/download/ytmp4?url=${encodeURIComponent(url)}`, { timeout: 30000 });
            if (res.data.status && res.data.result) {
                return { status: true, result: { download: res.data.result.url || res.data.result.download } };
            }
            return { status: false };
        } catch { return { status: false }; }
    }
};

async function downloadWithFallback(url, type = 'audio') {
    console.log(`📡 Procesando ${type} para: ${url}`);
    
    // Intento 1: Savenow
    let format = type === 'audio' ? 'mp3' : '360'; // 360p para asegurar que videos de 2h no pesen 5GB
    let res = await savenowApi.ytdl(url, format);
    if (!res.error) return { status: true, result: { download: res.link } };

    // Intento 2: API Alternativa
    let res2 = await alternativeApi.download(url, type);
    if (res2.status) return res2;

    return { status: false, error: "No se pudo procesar este video largo. Las APIs gratuitas tienen límites con películas." };
}

async function getSize(url) {
    try {
        const res = await axios.head(url, { timeout: 10000 });
        return parseInt(res.headers['content-length'], 10) || 0;
    } catch { return 0; }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (['ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'].includes(command)) {
        return await handleDownload(m, conn, text, command, usedPrefix);
    }

    if (!text?.trim()) return conn.reply(m.chat, `✨ *Ejemplo:* ${usedPrefix + command} Apocalypto película`, m);

    await m.react('🔍');
    try {
        const search = await yts(text);
        const v = search.all[0];
        if (!v) throw '❌ No se encontró el video.';

        const body = `╭━━━〔 𝕬𝖘𝖙𝖆-𝕭𝖔𝖙 〕━━━╮
┃ 📽️ *TITULO:* ${v.title}
┃ ⏱️ *DURACIÓN:* ${v.timestamp}
┃ 🔗 *LINK:* ${v.url}
╰━━━━━━━━━━━━━━╯
*Elija una opción:*`;

        const buttons = [
            { buttonId: `${usedPrefix}ytmp3 ${v.url}`, buttonText: { displayText: '🎧 Audio' } },
            { buttonId: `${usedPrefix}ytmp4 ${v.url}`, buttonText: { displayText: '📽️ Video' } },
            { buttonId: `${usedPrefix}ytmp3doc ${v.url}`, buttonText: { displayText: '💿 Audio Doc' } },
            { buttonId: `${usedPrefix}ytmp4doc ${v.url}`, buttonText: { displayText: '🎥 Video Doc' } }
        ];

        await conn.sendMessage(m.chat, {
            image: { url: v.thumbnail },
            caption: body,
            footer: '『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡',
            buttons: buttons,
            headerType: 4
        }, { quoted: m });
        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        conn.reply(m.chat, `⚠️ Error: ${e}`, m);
    }
};

async function handleDownload(m, conn, text, command, usedPrefix) {
    if (!text) return;
    const urlMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const url = urlMatch ? urlMatch[0] : null;
    
    if (!url) return conn.reply(m.chat, '❌ URL no válida.', m);
    
    await m.react('⏳');
    try {
        const videoInfo = await yts({ videoId: urlMatch[1] });
        const title = videoInfo.title || 'Video';
        
        // Avisar si el video es muy largo
        if (videoInfo.seconds > 7200) { // Más de 2 horas
            await conn.reply(m.chat, '⏳ El video es muy largo (más de 2 horas). El procesamiento puede tardar hasta 5 minutos. Por favor espera...', m);
        }

        const type = command.includes('mp3') ? 'audio' : 'video';
        const dl = await downloadWithFallback(url, type);
        
        if (!dl.status) throw dl.error;

        const size = await getSize(dl.result.download);
        const thumbResized = await resizeImage(await (await fetch(videoInfo.thumbnail)).buffer());
        
        // Configuración de contacto para el diseño
        const fkontak = { key: { fromMe: false, participant: `0@s.whatsapp.net` }, message: { documentMessage: { title: title, jpegThumbnail: thumbResized } } };

        if (command === 'ytmp3') {
            await conn.sendMessage(m.chat, { audio: { url: dl.result.download }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });
        } else if (command === 'ytmp4') {
            await conn.sendMessage(m.chat, { video: { url: dl.result.download }, mimetype: 'video/mp4', caption: `🎬 *${title}*` }, { quoted: m });
        } else if (command === 'ytmp3doc') {
            await conn.sendMessage(m.chat, { document: { url: dl.result.download }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: fkontak });
        } else if (command === 'ytmp4doc') {
            await conn.sendMessage(m.chat, { document: { url: dl.result.download }, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption: `🎬 *${title}*` }, { quoted: fkontak });
        }

        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        conn.reply(m.chat, `❌ *Error:* El servidor no pudo procesar este archivo tan grande. Intenta con un video más corto o intenta de nuevo en unos minutos.\n\nDetalle: ${e.message || e}`, m);
    }
}

handler.command = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];
export default handler;