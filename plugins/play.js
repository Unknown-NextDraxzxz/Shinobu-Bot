import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import fs from "fs"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MAX_FILE_SIZE = 1500 * 1024 * 1024 // 1.5 GB
const AUDIO_DOC_THRESHOLD = 30 * 1024 * 1024 

async function resizeImage(buffer, size = 300) {
    try {
        const image = await Jimp.read(buffer)
        return await image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
    } catch { return buffer }
}

const savenowApi = {
    name: "Savenow/Y2Down API",
    key: "dfcb6d76f2f6a9894gjkege8a4ab232222",
    agent: "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
    referer: "https://y2down.cc/enSB/",

    ytdl: async function(url, format) {
        try {
            const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${this.key}&allow_extended_duration=1`;
            const init = await fetch(initUrl, { headers: { "User-Agent": this.agent, "Referer": this.referer } });
            const data = await init.json();
            if (!data.success) return { error: data.message };

            const id = data.id;
            const progressUrl = `https://p.savenow.to/api/progress?id=${id}`;
            let attempts = 0;
            const maxAttempts = 150; 

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                attempts++;
                const response = await fetch(progressUrl, { headers: { "User-Agent": this.agent, "Referer": this.referer } });
                const status = await response.json();
                console.log(`📊 Progreso Savenow: ${status.progress / 10}%`);

                if (status.progress === 1000) {
                    const mainLink = status.download_url;
                    const altLink = status.alternative_download_urls?.[0];
                    
                    // Verificación rápida del link para evitar el 404
                    try {
                        await axios.head(mainLink, { timeout: 5000 });
                        return { title: data.title || "Video", link: mainLink };
                    } catch {
                        if (altLink) return { title: data.title || "Video", link: altLink };
                        return { error: "El servidor de la API generó un enlace roto (404)." };
                    }
                }
            }
            return { error: "Timeout" };
        } catch (error) { return { error: error.message }; }
    },

    download: async function(link, type = "audio") {
        const videoId = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        if (!videoId) return { status: false, error: "ID inválido" };
        const videoInfo = await yts({ videoId: videoId });
        let result;

        if (type === "audio") {
            result = await this.ytdl(link, "mp3");
        } else {
            // Bajamos la calidad a 360p si es película para asegurar que el servidor no lo borre
            const qualities = ["360", "480", "720"];
            for (const q of qualities) {
                console.log(`🎬 Intentando ${q}p...`);
                result = await this.ytdl(link, q);
                if (!result.error) break;
            }
        }

        if (!result || result.error) return { status: false, error: result?.error };
        return { status: true, result: { title: videoInfo.title, download: result.link, thumbnail: videoInfo.thumbnail } };
    }
};

const amScraperApi = {
    name: "AM Scraper API",
    baseUrl: "https://scrapers.hostrta.win/scraper/24",
    download: async (link, type = "audio") => {
        try {
            const res = await axios.get(`${amScraperApi.baseUrl}?url=${encodeURIComponent(link)}`, { timeout: 15000 });
            const data = res.data;
            const dLink = type === "audio" ? data.audio?.url : data.video?.url;
            if (!dLink) return { status: false, error: "No link" };
            return { status: true, result: { title: data.title || "Video", download: dLink } };
        } catch { return { status: false, error: "Error AM" }; }
    }
};

async function downloadWithFallback(url, type = 'audio') {
    let res = await savenowApi.download(url, type);
    if (res.status) return res;
    console.log("⚠️ Savenow falló, probando AM Scraper...");
    return await amScraperApi.download(url, type);
}

async function getSize(url) {
    try {
        const res = await axios.head(url, { timeout: 8000 });
        return parseInt(res.headers['content-length'], 10) || 0;
    } catch { return 0; } // Si da 404 aquí, devolvemos 0 para que no explote el bot
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (['ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'].includes(command)) return await handleDownload(m, conn, text, command, usedPrefix);
    if (!text?.trim()) return conn.reply(m.chat, `❗ Ingresa nombre o link.`, m);

    await m.react('🔍');
    try {
        const search = await yts(text);
        const video = search.all[0];
        const body = `╭━━━━━━━━━━━━━╮\n│ 🎵 *YouTube Play*\n╰━━━━━━━━━━━━━╯\n\n📹 *${video.title}*\n⏱️ Duración: ${video.timestamp}\n\n*Elige una opción:*`;
        const buttons = [
            { buttonId: `${usedPrefix}ytmp3 ${video.url}`, buttonText: { displayText: '🎧 Audio' } },
            { buttonId: `${usedPrefix}ytmp4 ${video.url}`, buttonText: { displayText: '📽️ Video' } },
            { buttonId: `${usedPrefix}ytmp3doc ${video.url}`, buttonText: { displayText: '💿 Audio Doc' } },
            { buttonId: `${usedPrefix}ytmp4doc ${video.url}`, buttonText: { displayText: '🎥 Video Doc' } }
        ];
        await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: body, footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`, buttons: buttons, headerType: 4 }, { quoted: m });
        await m.react('✅');
    } catch { await m.react('❌'); }
};

async function handleDownload(m, conn, text, command, usedPrefix) {
    if (!text?.trim()) return;
    await m.react('⏳');
    try {
        const videoId = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        const search = await yts({ videoId: videoId });
        const title = (search.title || "video").replace(/[^\w\s]/gi, '').substring(0, 40);

        await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮\n│ ⏳ *DESCARGANDO...*\n╰━━━━━━━━━━━━━╯\n\n📹 *${search.title}*\n\n_Procesando archivo pesado..._`, m);

        const type = command.includes('mp4') ? 'video' : 'audio';
        const dl = await downloadWithFallback(text, type);
        if (!dl.status) throw dl.error;

        const size = await getSize(dl.result.download);
        if (size > 1000 * 1024 * 1024) throw "⚠️ El archivo supera 1GB, WhatsApp podría rechazarlo.";

        const fkontak = { key: { fromMe: false, participant: "0@s.whatsapp.net" }, message: { conversation: `Asta-Bot` }};

        const docOptions = {
            document: { url: dl.result.download },
            mimetype: type === 'video' ? 'video/mp4' : 'audio/mpeg',
            fileName: `${title}.${type === 'video' ? 'mp4' : 'mp3'}`,
            caption: `🎬 *${search.title}*`
        };

        if (command.includes('doc')) {
            await conn.sendMessage(m.chat, docOptions, { quoted: fkontak });
        } else if (type === 'audio') {
            await conn.sendMessage(m.chat, { audio: { url: dl.result.download }, mimetype: 'audio/mpeg' }, { quoted: fkontak });
        } else {
            await conn.sendMessage(m.chat, { video: { url: dl.result.download }, mimetype: 'video/mp4', caption: docOptions.caption }, { quoted: fkontak });
        }
        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        conn.reply(m.chat, `❌ Error: ${e.message || e}`, m);
    }
}

handler.command = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];
export default handler;