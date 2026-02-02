import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import fs from "fs"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Límites aumentados para soportar videos de 2 horas (Aprox 2GB es el límite de WhatsApp Documentos)
const MAX_FILE_SIZE = 2000 * 1024 * 1024 // 2 GB
const VIDEO_NORMAL_LIMIT = 100 * 1024 * 1024 // 100 MB para video normal, si pesa más va por documento

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
            const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${this.key}`;

            console.log(`📡 Iniciando descarga (${format})`);

            const init = await fetch(initUrl, {
                headers: { "User-Agent": this.agent, "Referer": this.referer }
            });

            const data = await init.json();
            if (!data.success) return { error: data.message || "Failed" };

            const id = data.id;
            const progressUrl = `https://p.savenow.to/api/progress?id=${id}`;
            let attempts = 0;
            const maxAttempts = 60; // Aumentado a 60 (2 minutos de espera para videos largos)

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                attempts++;

                const response = await fetch(progressUrl, {
                    headers: { "User-Agent": this.agent, "Referer": this.referer }
                });

                const status = await response.json();

                if (status.progress === 1000) {
                    return {
                        title: data.title || data.info?.title,
                        link: status.download_url
                    };
                }
                console.log(`📊 Procesando: ${status.progress / 10}%`);
            }
            return { error: "Timeout: El video es muy largo y sigue procesándose." };
        } catch (error) {
            return { error: error.message };
        }
    },

    download: async function(link, type = "audio") {
        try {
            const videoId = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            const videoInfo = await yts({ videoId: videoId });

            let result;
            if (type === "audio") {
                result = await this.ytdl(link, "mp3");
            } else {
                // Para videos largos, intentamos 480p o 360p primero para asegurar que WhatsApp lo acepte
                const videoFormats = ["480", "360", "720", "1080"];
                for (const format of videoFormats) {
                    result = await this.ytdl(link, format);
                    if (!result.error) break;
                }
            }

            if (result.error) return { status: false, error: result.error };

            return {
                status: true,
                result: {
                    title: videoInfo.title || result.title,
                    download: result.link,
                    format: type === "audio" ? "mp3" : "mp4"
                }
            };
        } catch (error) {
            return { status: false, error: error.message };
        }
    }
};

// ... (Las demás APIs se mantienen igual como respaldo)
const amScraperApi = {
    name: "AM Scraper API",
    baseUrl: "https://scrapers.hostrta.win/scraper/24",
    download: async (link, type = "audio") => {
        try {
            const response = await axios.get(`${amScraperApi.baseUrl}?url=${encodeURIComponent(link)}`, { timeout: 20000 });
            const data = response.data;
            let downloadUrl = type === "audio" ? (data.audio?.url || data.formats?.find(f => f.mimeType?.includes('audio'))?.url) : (data.video?.url || data.formats?.find(f => f.quality === '360p')?.url);
            
            if (!downloadUrl) return { status: false, error: "No link" };
            return { status: true, result: { title: data.title, download: downloadUrl } };
        } catch (e) { return { status: false, error: e.message }; }
    }
};

async function downloadWithFallback(url, type = 'audio') {
    let result = await savenowApi.download(url, type);
    if (result.status) return result;
    return await amScraperApi.download(url, type);
}

function formatSize(bytes) {
    if (!bytes) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
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

    if (!text?.trim()) return conn.reply(m.chat, `❗ Ingresa el nombre de una canción o video.`, m);
    await m.react('🔍');

    try {
        const search = await yts(text);
        const v = search.all[0];
        if (!v) throw '❗ No resultados.';

        const body = `🎵 *YouTube Play*\n\n📹 *${v.title}*\n⏱️ Duración: ${v.timestamp}\n🔗 ${v.url}\n\n*Elija una opción:*`;
        
        const buttons = [
            { buttonId: `${usedPrefix}ytmp3 ${v.url}`, buttonText: { displayText: '🎧 Audio' } },
            { buttonId: `${usedPrefix}ytmp4 ${v.url}`, buttonText: { displayText: '📽️ Video' } },
            { buttonId: `${usedPrefix}ytmp3doc ${v.url}`, buttonText: { displayText: '💿 Audio Doc' } },
            { buttonId: `${usedPrefix}ytmp4doc ${v.url}`, buttonText: { displayText: '🎥 Video Doc' } }
        ];

        await conn.sendMessage(m.chat, {
            image: { url: v.thumbnail },
            caption: body,
            footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』`,
            buttons: buttons,
            headerType: 4
        }, { quoted: m });
        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        conn.reply(m.chat, `⚠️ Error: ${e.message || e}`, m);
    }
};

async function handleDownload(m, conn, text, command, usedPrefix) {
    if (!text) return;
    await m.react('⏳');

    try {
        let url, title, thumbnail;
        if (/youtube.com|youtu.be/.test(text)) {
            const id = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            const search = await yts({ videoId: id });
            url = search.url;
            title = search.title;
            thumbnail = search.thumbnail;
        } else {
            const search = await yts(text);
            url = search.videos[0].url;
            title = search.videos[0].title;
            thumbnail = search.videos[0].thumbnail;
        }

        const type = command.includes('mp3') ? 'audio' : 'video';
        const dl = await downloadWithFallback(url, type);
        if (!dl.status) throw dl.error;

        const size = await getSize(dl.result.download);
        if (size > MAX_FILE_SIZE) throw `📦 El archivo es demasiado grande (${formatSize(size)}).`;

        const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer());
        const fkontak = { key: { fromMe: false, participant: `0@s.whatsapp.net` }, message: { documentMessage: { title: title, jpegThumbnail: thumbResized } } };

        // LÓGICA DE ENVÍO SEGÚN COMANDO
        if (command === 'ytmp3') {
            await conn.sendMessage(m.chat, { audio: { url: dl.result.download }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });
        } 
        else if (command === 'ytmp4') {
            if (size > VIDEO_NORMAL_LIMIT) {
                await conn.reply(m.chat, `📦 El video pesa ${formatSize(size)}, se enviará como documento para evitar errores.`, m);
                await conn.sendMessage(m.chat, { document: { url: dl.result.download }, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption: title }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { video: { url: dl.result.download }, mimetype: 'video/mp4', caption: title }, { quoted: m });
            }
        } 
        else if (command === 'ytmp3doc') {
            await conn.sendMessage(m.chat, { document: { url: dl.result.download }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: fkontak });
        } 
        else if (command === 'ytmp4doc') {
            await conn.sendMessage(m.chat, { document: { url: dl.result.download }, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption: title }, { quoted: fkontak });
        }

        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        conn.reply(m.chat, `❌ Error: ${e.message || e}`, m);
    }
}

handler.command = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];
export default handler;