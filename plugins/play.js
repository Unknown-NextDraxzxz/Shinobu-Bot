import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import fs from "fs"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MAX_FILE_SIZE = 1000 * 1024 * 1024 // 1 GB para permitir películas
const AUDIO_DOC_THRESHOLD = 30 * 1024 * 1024 // 30 MB

async function resizeImage(buffer, size = 300) {
    try {
        const image = await Jimp.read(buffer)
        return await image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
    } catch {
        return buffer
    }
}

// =================== API SAVENOW/Y2DOWN CORRECTA ===================
const savenowApi = {
    name: "Savenow/Y2Down API",
    key: "dfcb6d76f2f6a9894gjkege8a4ab232222",
    agent: "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
    referer: "https://y2down.cc/enSB/",

    ytdl: async function(url, format) {
        try {
            // FIX 1: Se añadió &allow_extended_duration=1
            const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${this.key}&allow_extended_duration=1`;

            console.log(`📡 Iniciando descarga con formato: ${format}`);

            const init = await fetch(initUrl, {
                headers: {
                    "User-Agent": this.agent,
                    "Referer": this.referer
                }
            });

            const data = await init.json();

            if (!data.success) {
                return { error: data.message || "Failed to start download" };
            }

            const id = data.id;
            const progressUrl = `https://p.savenow.to/api/progress?id=${id}`;
            let attempts = 0;
            const maxAttempts = 150; // Más intentos para videos largos

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                attempts++;

                console.log(`⏳ Verificando progreso... (${attempts}/${maxAttempts})`);

                const response = await fetch(progressUrl, {
                    headers: {
                        "User-Agent": this.agent,
                        "Referer": this.referer
                    }
                });

                const status = await response.json();

                if (status.progress === 1000) {
                    console.log(`✅ Progreso completado!`);
                    // FIX 2: Validar que el link exista
                    const dLink = status.download_url || (status.alternative_download_urls && status.alternative_download_urls[0]);
                    if (!dLink) return { error: "No se encontró enlace de descarga final" };

                    return {
                        title: data.title || data.info?.title || "Video",
                        image: data.info?.image,
                        video: data.info?.title,
                        link: dLink
                    };
                }

                console.log(`📊 Progreso actual: ${status.progress / 10}%`);
            }

            return { error: "Timeout waiting for download" };
        } catch (error) {
            console.error("Error en ytdl:", error.message);
            return { error: error.message };
        }
    },

    download: async function(link, type = "audio") {
        try {
            const videoId = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (!videoId) return { status: false, error: "ID de video no válido" };

            const videoInfo = await yts({ videoId: videoId });

            let format, result;

            if (type === "audio") {
                format = "mp3";
                result = await this.ytdl(link, format);
                if (result.error) result = await this.ytdl(link, "m4a");
            } else {
                const videoFormats = ["720", "360", "480", "240", "144"];
                for (const f of videoFormats) {
                    console.log(`🎬 Intentando video en ${f}p...`);
                    result = await this.ytdl(link, f);
                    if (!result.error) break;
                }
            }

            if (!result || result.error) return { status: false, error: result?.error || "Error desconocido" };

            return {
                status: true,
                result: {
                    title: result.title || videoInfo.title || "Sin título",
                    format: type === "audio" ? "mp3" : "mp4",
                    download: result.link,
                    thumbnail: result.image || videoInfo.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                }
            };
        } catch (error) {
            return { status: false, error: error.message };
        }
    }
};

// =================== OTRAS APIS (Restauradas) ===================
const amScraperApi = {
    name: "AM Scraper API",
    baseUrl: "https://scrapers.hostrta.win/scraper/24",
    download: async (link, type = "audio") => {
        try {
            const videoId = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (!videoId) return { status: false, error: "ID inválido" };
            const videoInfo = await yts({ videoId: videoId });
            const response = await axios.get(`${amScraperApi.baseUrl}?url=${encodeURIComponent(link)}`, { timeout: 15000 });
            if (!response.data || response.data.error) return { status: false, error: "Error en AM" };
            
            let downloadUrl = type === "audio" ? response.data.audio?.url : response.data.video?.url;
            if (!downloadUrl) return { status: false, error: "No URL" };

            return { status: true, result: { title: videoInfo.title, download: downloadUrl, format: type === "audio" ? "mp3" : "mp4", thumbnail: videoInfo.thumbnail }};
        } catch (e) { return { status: false, error: e.message }; }
    }
};

const backupApi = {
    name: "Backup API",
    baseUrl: "https://youtube-downloader-api.vercel.app",
    download: async (link, type = "audio") => {
        try {
            const response = await axios.get(`${backupApi.baseUrl}/info?url=${encodeURIComponent(link)}`, { timeout: 10000 });
            if (!response.data?.success) return { status: false, error: "API error" };
            const videoInfo = response.data.data;
            let downloadUrl = type === "audio" ? videoInfo.formats.find(f => f.hasAudio && !f.hasVideo)?.url : videoInfo.formats.find(f => f.hasVideo && f.hasAudio)?.url;
            return { status: true, result: { title: videoInfo.title, download: downloadUrl, format: type === "audio" ? "mp3" : "mp4", thumbnail: videoInfo.thumbnails?.[0]?.url }};
        } catch (e) { return { status: false, error: e.message }; }
    }
};

async function downloadWithFallback(url, type = 'audio') {
    let result = await savenowApi.download(url, type);
    if (result.status) return result;
    result = await amScraperApi.download(url, type);
    if (result.status) return result;
    return await backupApi.download(url, type);
}

function formatSize(bytes) {
    if (!bytes) return 'Desconocido';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
    return `${bytes.toFixed(2)} ${units[i]}`;
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

    if (!text?.trim()) {
        return conn.reply(m.chat, `❗ Ingresa el nombre de una canción o video.\n\n📝 Ejemplo: *${usedPrefix + command} Bad Bunny*`, m);
    }

    await m.react('🔍');
    try {
        const search = await yts(text);
        const video = search.all?.[0];
        if (!video) throw '❗ No se encontraron resultados.';

        const body = `╭━━━━━━━━━━━━━╮\n│ 🎵 *YouTube Play*\n╰━━━━━━━━━━━━━╯\n\n📹 *${video.title}*\n\n👤 Canal: ${video.author.name}\n⏱️ Duración: ${video.timestamp}\n🔗 Link: ${video.url}\n\n*Elige una opción:*`;

        const buttons = [
            { buttonId: `${usedPrefix}ytmp3 ${video.url}`, buttonText: { displayText: '🎧 Audio' } },
            { buttonId: `${usedPrefix}ytmp4 ${video.url}`, buttonText: { displayText: '📽️ Video' } },
            { buttonId: `${usedPrefix}ytmp3doc ${video.url}`, buttonText: { displayText: '💿 Audio Doc' } },
            { buttonId: `${usedPrefix}ytmp4doc ${video.url}`, buttonText: { displayText: '🎥 Video Doc' } }
        ];

        await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption: body,
            footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
            buttons: buttons,
            headerType: 4
        }, { quoted: m });

        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        return conn.reply(m.chat, `⚠️ Error: ${e.message || e}`, m);
    }
};

async function handleDownload(m, conn, text, command, usedPrefix) {
    if (!text?.trim()) return;
    await m.react('⏳');

    try {
        const id = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        if (!id) throw '❌ URL inválida';

        const search = await yts({ videoId: id });
        // FIX 3: Limpiar el título para evitar error toString de Baileys
        const rawTitle = search.title || "video";
        const title = rawTitle.replace(/[^\w\s]/gi, '').substring(0, 50); 
        const thumbnail = search.thumbnail;

        await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮\n│ ⏳ *DESCARGANDO...*\n╰━━━━━━━━━━━━━╯\n\n📹 *${rawTitle}*\n\n📄 _Formato: ${command.includes('doc') ? 'Documento' : 'Multimedia'}_\n⚡ _Procesando..._\n\n*『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』*`, m);

        const type = command.includes('mp4') ? 'video' : 'audio';
        const dl = await downloadWithFallback(text, type);

        if (!dl.status || !dl.result.download) throw dl.error || '❌ Error al descargar';

        const size = await getSize(dl.result.download);
        const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300);

        const fkontak = { key: { fromMe: false, participant: "0@s.whatsapp.net" }, message: { documentMessage: { title: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』`, jpegThumbnail: thumbResized }}};

        if (command === 'ytmp4doc') {
            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'video/mp4',
                fileName: `${title}.mp4`,
                caption: `🎬 *${rawTitle}*`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak });
        } else if (command === 'ytmp3doc') {
            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak });
        } else if (command === 'ytmp3') {
            await conn.sendMessage(m.chat, { audio: { url: dl.result.download }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: fkontak });
        } else {
            await conn.sendMessage(m.chat, { video: { url: dl.result.download }, mimetype: 'video/mp4', caption: `🎬 *${rawTitle}*` }, { quoted: fkontak });
        }

        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        return conn.reply(m.chat, `❌ Error: ${e.message || e}`, m);
    }
}

handler.help = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];
handler.tags = ['descargas'];
handler.command = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];

export default handler;