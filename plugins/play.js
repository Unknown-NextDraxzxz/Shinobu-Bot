import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import fs from "fs"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MAX_FILE_SIZE = 1800 * 1024 * 1024 // 1.8 GB
const savenow_api_key = "dfcb6d76f2f6a9894gjkege8a4ab232222"

async function resizeImage(buffer, size = 300) {
    try {
        const image = await Jimp.read(buffer)
        return await image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
    } catch { return buffer }
}

const savenowApi = {
    name: "Savenow/Y2Down",
    ytdl: async function(url, format) {
        try {
            const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${savenow_api_key}&allow_extended_duration=1`;
            const init = await fetch(initUrl, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://y2down.cc/" } });
            const data = await init.json();
            if (!data.success) return { error: data.message };

            const progressUrl = `https://p.savenow.to/api/progress?id=${data.id}`;
            for (let i = 0; i < 150; i++) {
                await new Promise(r => setTimeout(r, 4000));
                const res = await fetch(progressUrl);
                const status = await res.json();
                console.log(`📊 Savenow [${format}p]: ${status.progress / 10}%`);
                if (status.progress === 1000) return { link: status.download_url || status.alternative_download_urls?.[0] };
            }
            return { error: "Timeout Savenow" };
        } catch (e) { return { error: e.message }; }
    }
};

const amScraperApi = {
    name: "AM Scraper",
    download: async (link, type = "audio") => {
        try {
            const res = await axios.get(`https://scrapers.hostrta.win/scraper/24?url=${encodeURIComponent(link)}`, { timeout: 20000 });
            const dLink = type === "audio" ? res.data.audio?.url : (res.data.video?.url || res.data.formats?.find(f => f.quality === '360p')?.url);
            if (!dLink) return { status: false, error: "API AM no devolvió link" };
            return { status: true, link: dLink };
        } catch (e) { return { status: false, error: e.message }; }
    }
};

async function downloadWithFallback(url, type, isLong) {
    console.log(`🔍 Iniciando descarga. ¿Video Largo?: ${isLong ? 'SÍ' : 'NO'}`);
    
    // Si es largo, forzamos 360p para evitar errores 404 de la API
    const qualities = isLong ? ["360", "480"] : ["720", "360", "480"];
    
    for (const q of qualities) {
        const res = await savenowApi.ytdl(url, type === 'audio' ? 'mp3' : q);
        if (res.link) return { status: true, link: res.link };
    }

    console.log("⚠️ Savenow falló, probando AM Scraper...");
    const resAM = await amScraperApi.download(url, type);
    return resAM;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (['ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'].includes(command)) return await handleDownload(m, conn, text, command, usedPrefix);
    if (!text?.trim()) return conn.reply(m.chat, `❗ Ingresa un nombre o link.`, m);

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
        const id = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        const search = await yts({ videoId: id });
        const title = (search.title || "video").replace(/[^\w\s]/gi, '').substring(0, 40);
        
        // Verificamos si dura más de 30 minutos (1800 segundos)
        const isLong = search.seconds > 1800;

        await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮\n│ ⏳ *DESCARGANDO...*\n╰━━━━━━━━━━━━━╯\n\n📹 *${search.title}*\n\n_Optimizando para archivo pesado..._\n_Calidad ajustada para evitar errores._`, m);

        const type = command.includes('mp4') ? 'video' : 'audio';
        const dl = await downloadWithFallback(text, type, isLong);
        
        if (!dl.status && !dl.link) throw dl.error || "No se pudo obtener el link.";

        const fkontak = { key: { fromMe: false, participant: "0@s.whatsapp.net" }, message: { conversation: `Asta-Bot` }};
        const finalLink = dl.link;

        const docOptions = {
            document: { url: finalLink },
            mimetype: type === 'video' ? 'video/mp4' : 'audio/mpeg',
            fileName: `${title}.${type === 'video' ? 'mp4' : 'mp3'}`,
            caption: `🎬 *${search.title}*`
        };

        if (command.includes('doc')) {
            await conn.sendMessage(m.chat, docOptions, { quoted: fkontak });
        } else if (type === 'audio') {
            await conn.sendMessage(m.chat, { audio: { url: finalLink }, mimetype: 'audio/mpeg' }, { quoted: fkontak });
        } else {
            await conn.sendMessage(m.chat, { video: { url: finalLink }, mimetype: 'video/mp4', caption: docOptions.caption }, { quoted: fkontak });
        }
        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        conn.reply(m.chat, `❌ Error: ${e.message || e}`, m);
    }
}

handler.command = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];
export default handler;