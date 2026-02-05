import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import fs from "fs"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB
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
            const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${this.key}`;

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
            const maxAttempts = 30;

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000));
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
                    return {
                        title: data.title || data.info?.title,
                        image: data.info?.image,
                        video: data.info?.title,
                        link: status.download_url,
                        alternatives: status.alternative_download_urls || []
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
            if (!videoId) {
                return { status: false, error: "ID de video no válido" };
            }

            const videoInfo = await yts({ videoId: videoId });

            let format, result;

            if (type === "audio") {
                format = "mp3";
                result = await this.ytdl(link, format);

                if (result.error) {
                    console.log(`❌ MP3 falló, intentando M4A...`);
                    result = await this.ytdl(link, "m4a");
                }
            } else {
                const videoFormats = ["720", "360", "480", "240", "144", "1080"];

                for (const format of videoFormats) {
                    console.log(`🎬 Intentando video en ${format}p...`);
                    result = await this.ytdl(link, format);

                    if (!result.error) {
                        console.log(`✅ Video encontrado en ${format}p`);
                        break;
                    }

                    console.log(`❌ ${format}p no disponible`);
                }
            }

            if (result.error) {
                return { status: false, error: result.error };
            }

            return {
                status: true,
                result: {
                    title: result.title || videoInfo.title || "Sin título",
                    author: videoInfo.author?.name || "Desconocido",
                    views: videoInfo.views || "0",
                    timestamp: videoInfo.timestamp || "0:00",
                    ago: videoInfo.ago || "Desconocido",
                    format: type === "audio" ? "mp3" : "mp4",
                    download: result.link,
                    thumbnail: result.image || videoInfo.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                }
            };
        } catch (error) {
            console.error("Savenow API Error:", error.message);
            return { status: false, error: error.message };
        }
    }
};

// =================== API AM SCRAPER ===================
const amScraperApi = {
    name: "AM Scraper API",
    baseUrl: "https://scrapers.hostrta.win/scraper/24",

    download: async (link, type = "audio") => {
        try {
            const videoId = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (!videoId) {
                return { status: false, error: "ID de video no válido" };
            }

            const videoInfo = await yts({ videoId: videoId });

            const response = await axios.get(`${amScraperApi.baseUrl}?url=${encodeURIComponent(link)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://scrapers.hostrta.win/'
                },
                timeout: 15000
            });

            if (!response.data || response.data.error) {
                return { status: false, error: response.data?.error || "Error en AM Scraper" };
            }

            const data = response.data;
            let downloadUrl = null;
            let formatType = null;

            if (type === "audio") {
                if (data.audio && data.audio.url) {
                    downloadUrl = data.audio.url;
                    formatType = "mp3";
                } else if (data.formats) {
                    const audioFormat = data.formats.find(f => 
                        f.mimeType && (f.mimeType.includes('audio/mp4') || f.mimeType.includes('audio/mpeg'))
                    );
                    downloadUrl = audioFormat?.url;
                    formatType = "mp3";
                }
            } else {
                if (data.video && data.video.url) {
                    downloadUrl = data.video.url;
                    formatType = "mp4";
                } else if (data.formats) {
                    const qualityOrder = ["720", "480", "360", "240"];

                    for (const quality of qualityOrder) {
                        const videoFormat = data.formats.find(f => 
                            f.quality === `${quality}p` || 
                            (f.mimeType && f.mimeType.includes('video/mp4') && f.qualityLabel === `${quality}p`)
                        );

                        if (videoFormat) {
                            downloadUrl = videoFormat.url;
                            formatType = "mp4";
                            break;
                        }
                    }

                    if (!downloadUrl) {
                        const anyVideo = data.formats.find(f => 
                            f.mimeType && f.mimeType.includes('video/mp4')
                        );
                        downloadUrl = anyVideo?.url;
                        formatType = "mp4";
                    }
                }
            }

            if (!downloadUrl) {
                return { status: false, error: "Formato no disponible en AM Scraper" };
            }

            return {
                status: true,
                result: {
                    title: videoInfo.title || data.title || "Sin título",
                    author: videoInfo.author?.name || data.author || "Desconocido",
                    views: videoInfo.views || data.views || "0",
                    timestamp: videoInfo.timestamp || data.duration || "0:00",
                    ago: videoInfo.ago || data.uploadDate || "Desconocido",
                    format: formatType || (type === "audio" ? "mp3" : "mp4"),
                    download: downloadUrl,
                    thumbnail: videoInfo.thumbnail || 
                             data.thumbnail || 
                             `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                }
            };
        } catch (error) {
            console.error("AM Scraper API Error:", error.message);
            return { status: false, error: error.message };
        }
    }
};

// =================== API de respaldo ===================
const backupApi = {
    name: "YouTube Downloader API",
    baseUrl: "https://youtube-downloader-api.vercel.app",

    download: async (link, type = "audio") => {
        try {
            const response = await axios.get(`${backupApi.baseUrl}/info?url=${encodeURIComponent(link)}`, {
                timeout: 10000
            });

            if (!response.data || !response.data.success) {
                return { status: false, error: "No se pudo obtener información" };
            }

            const videoInfo = response.data.data;
            let downloadUrl = null;

            if (type === "audio") {
                const audioFormats = videoInfo.formats.filter(f => 
                    f.mimeType && f.mimeType.includes('audio') && f.hasAudio
                );
                const bestAudio = audioFormats.sort((a, b) => b.bitrate - a.bitrate)[0];
                downloadUrl = bestAudio?.url;
            } else {
                const videoFormats = videoInfo.formats.filter(f => 
                    f.hasVideo && f.hasAudio && (f.qualityLabel === "720p" || f.qualityLabel === "480p")
                );
                const bestVideo = videoFormats[0] || 
                                 videoInfo.formats.find(f => f.hasVideo && f.hasAudio);
                downloadUrl = bestVideo?.url;
            }

            if (!downloadUrl) {
                return { status: false, error: "Formato no disponible" };
            }

            return {
                status: true,
                result: {
                    title: videoInfo.title || "Sin título",
                    author: videoInfo.author?.name || "Desconocido",
                    views: videoInfo.viewCount || "0",
                    timestamp: videoInfo.lengthSeconds || 0,
                    ago: videoInfo.uploadDate || "Desconocido",
                    format: type === "audio" ? "mp3" : "mp4",
                    download: downloadUrl,
                    thumbnail: videoInfo.thumbnails?.[videoInfo.thumbnails.length - 1]?.url || 
                              `https://i.ytimg.com/vi/${videoInfo.videoId}/hqdefault.jpg`
                }
            };
        } catch (error) {
            console.error("Backup API Error:", error.message);
            return { status: false, error: error.message };
        }
    }
};

// Función principal de descarga con fallback
async function downloadWithFallback(url, type = 'audio') {
    console.log(`🔍 Intentando descargar: ${url}`);

    console.log(`🔄 Intentando con Savenow API...`);
    let result = await savenowApi.download(url, type);
    if (result.status) {
        console.log(`✅ Descarga exitosa con Savenow API`);
        return result;
    }

    console.log(`❌ Savenow API falló: ${result.error}, intentando AM Scraper...`);

    result = await amScraperApi.download(url, type);
    if (result.status) {
        console.log(`✅ Descarga exitosa con AM Scraper API`);
        return result;
    }

    console.log(`❌ AM Scraper falló: ${result.error}, intentando API de respaldo...`);

    result = await backupApi.download(url, type);
    if (result.status) {
        console.log(`✅ Descarga exitosa con Backup API`);
        return result;
    }

    console.log(`❌ Todas las APIs fallaron`);
    return {
        status: false,
        error: "No se pudo descargar el contenido. Intenta con otro video o prueba más tarde."
    };
}

function formatSize(bytes) {
    if (!bytes || isNaN(bytes)) return 'Desconocido';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    bytes = Number(bytes);
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}

async function getSize(url) {
    try {
        const res = await axios.head(url, {
            timeout: 10000,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            }
        });
        return parseInt(res.headers['content-length'], 10) || 0;
    } catch {
        return 0;
    }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Si es comando de descarga directa
    if (['ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'].includes(command)) {
        return await handleDownload(m, conn, text, command, usedPrefix);
    }

    // Comando play principal
    if (!text?.trim()) {
        return conn.reply(m.chat, `❗ Ingresa el nombre de una canción o video.\n\n📝 Ejemplo: *${usedPrefix + command} Bad Bunny Tití Me Preguntó*`, m);
    }

    await m.react('🔍');

    try {
        const search = await yts(text);
        const videoInfo = search.all?.[0];

        if (!videoInfo) {
            throw '❗ No se encontraron resultados.';
        }

        const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;
        const vistas = views?.toLocaleString?.() || 'Desconocido';

        const cleanTitle = title.substring(0, 100);
        const cleanAuthor = author.name.substring(0, 50);

        const body = `╭━━━━━━━━━━━━━╮
│ ꕤ *YouTube Play*
╰━━━━━━━━━━━━━╯

✎ *${cleanTitle}*

✧ Canal: ${cleanAuthor}
◎ Vistas: ${vistas}
❀ Duración: ${timestamp}
⌗ Publicado: ${ago}
➢ Link: ${url}

*Elige una opción:*`;

        const buttons = [
            { buttonId: `${usedPrefix}ytmp3 ${url}`, buttonText: { displayText: '𝖠𝗎𝖽𝗂𝗈' } },
            { buttonId: `${usedPrefix}ytmp4 ${url}`, buttonText: { displayText: '𝖵𝗂𝖽𝖾𝗈' } },
            { buttonId: `${usedPrefix}ytmp3doc ${url}`, buttonText: { displayText: '𝖠𝗎𝖽𝗂𝗈 𝖣𝗈𝖼' } },
            { buttonId: `${usedPrefix}ytmp4doc ${url}`, buttonText: { displayText: '𝖵𝗂𝖽𝖾𝗈 𝖣𝗈𝖼' } }
        ];

        try {
            await conn.sendMessage(m.chat, {
                image: { url: thumbnail },
                caption: body,
                footer: `𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍`,
                buttons: buttons,
                viewOnce: true,
                headerType: 4
            }, { quoted: m });
        } catch (e1) {
            try {
                await conn.sendButton(m.chat, body, `𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍`, thumbnail, buttons, m);
            } catch (e2) {
                try {
                    await conn.sendFile(m.chat, thumbnail, 'thumbnail.jpg', body + `\n\n*Comandos disponibles:*\n• ${usedPrefix}ytmp3 ${url}\n• ${usedPrefix}ytmp4 ${url}\n• ${usedPrefix}ytmp3doc ${url}\n• ${usedPrefix}ytmp4doc ${url}`, m);
                } catch (e3) {
                    await conn.reply(m.chat, body + `\n\n*Usa estos comandos:*\n• ${usedPrefix}ytmp3 ${url}\n• ${usedPrefix}ytmp4 ${url}\n• ${usedPrefix}ytmp3doc ${url}\n• ${usedPrefix}ytmp4doc ${url}`, m);
                }
            }
        }

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        return conn.reply(m.chat, typeof e === 'string' ? e : `⚠️ Error: ${e.message}`, m);
    }
};

async function handleDownload(m, conn, text, command, usedPrefix) {
    if (!text?.trim()) {
        return conn.reply(m.chat, `❌ Ingresa una URL o nombre.\n\n✎ Ejemplo: *${usedPrefix + command} Bad Bunny*`, m);
    }

    await m.react('⏳');

    try {
        let url, title, thumbnail, author;

        // Si es URL directa
        if (/youtube.com|youtu.be/.test(text)) {
            const id = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (!id) throw '❌ URL inválida';

            const search = await yts({ videoId: id });
            url = `https://www.youtube.com/watch?v=${id}`;
            title = search.title || "Sin título";
            thumbnail = search.thumbnail;
            author = search.author?.name || "Desconocido";

        } else {
            // Si es búsqueda
            const search = await yts(text);
            if (!search.videos.length) throw "❌ No se encontraron resultados";

            const videoInfo = search.videos[0];
            url = videoInfo.url;
            title = videoInfo.title;
            thumbnail = videoInfo.thumbnail;
            author = videoInfo.author?.name || "Desconocido";
        }

        console.log(`🎯 Descargando: ${title}`);

        const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300);

        // ========== YTMP3 - ENVIAR SIEMPRE COMO AUDIO REPRODUCIBLE ==========
        if (command === 'ytmp3') {
            await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮
│ ✎ *DESCARGANDO...*
╰━━━━━━━━━━━━━╯

✧ *${title}*

❍ 𝖯𝗋𝗈𝖼𝖾𝗌𝖺𝗇𝖽𝗈 𝖺𝗎𝖽𝗂𝗈...
➢ 𝖤𝗌𝗉𝖾𝗋𝖺 𝗎𝗇 𝗆𝗈𝗆𝖾𝗇𝗍𝗈...

*𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍*`, m);

            const dl = await downloadWithFallback(url, 'audio');
            if (!dl.status) throw dl.error || '❌ Error al descargar';

            const size = await getSize(dl.result.download);
            console.log(`📦 Tamaño: ${formatSize(size)}`);

            const fkontak = {
                key: { fromMe: false, participant: "0@s.whatsapp.net" },
                message: {
                    documentMessage: {
                        title: `✎「 ${title} 」Ꮺ`,
                        fileName: `Descargas 𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍`,
                        jpegThumbnail: thumbResized
                    }
                }
            };

            // NUEVA ESTRATEGIA: Enviar siempre como AUDIO NORMAL (no PTT, no documento)
            // Esto garantiza que sea reproducible directamente en WhatsApp
            await conn.sendMessage(m.chat, {
                audio: { url: dl.result.download },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                // NO usar ptt: true
                // Esto hace que se envíe como mensaje de audio reproducible
            }, { quoted: fkontak });

            console.log('✅ Audio enviado como mensaje reproducible');

            await m.react('✅');
            return;
        }

        // ========== YTMP4 - Video ==========
        if (command === 'ytmp4') {
            await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮
│ ✎ *𝖣𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝗇𝖽𝗈...*
╰━━━━━━━━━━━━━╯

✧ *${title}*

❍ 𝖯𝗋𝗈𝖼𝖾𝗌𝖺𝗇𝖽𝗈 𝗏𝗂𝖽𝖾𝗈...
➢ 𝖯𝗎𝖾𝖽𝖾 𝗍𝖺𝗋𝖽𝖺𝗋 𝗎𝗇𝗈𝗌 𝗆𝗂𝗇𝗎𝗍𝗈𝗌...

*𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍*`, m);

            const dl = await downloadWithFallback(url, 'video');
            if (!dl.status) throw dl.error || '❌ Error al descargar';

            const size = await getSize(dl.result.download);
            console.log(`📦 Tamaño: ${formatSize(size)}`);

            const fkontak = {
                key: { fromMe: false, participant: "0@s.whatsapp.net" },
                message: {
                    documentMessage: {
                        title: `✎「 ${title} 」Ꮺ`,
                        fileName: `Descargas 𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍`,
                        jpegThumbnail: thumbResized
                    }
                }
            };

            if (size > 200 * 1024 * 1024) {
                throw `📦 Video muy grande (${formatSize(size)}).\n\n💡 Usa: *${usedPrefix}ytmp4doc ${url}*`;
            }

            await conn.sendMessage(m.chat, {
                video: { url: dl.result.download },
                mimetype: 'video/mp4',
                caption: `✎ *${title}*`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak });

            await m.react('✅');
            return;
        }

        // ========== YTMP3DOC - Audio como documento ==========
        if (command === 'ytmp3doc') {
            await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮
│ ✎ *DESCARGANDO...*
╰━━━━━━━━━━━━━╯

✧ *${title}*

❍ 𝖥𝗈𝗋𝗆𝖺𝗍𝗈: 𝖣𝗈𝖼𝗎𝗆𝖾𝗇𝗍𝗈 𝖬𝖯𝟥
ꕤ 𝖯𝗋𝗈𝖼𝖾𝗌𝖺𝗇𝖽𝗈 𝖺𝗎𝖽𝗂𝗈...
➢ 𝖠𝗀𝗎𝖺𝗋𝖽𝖺 𝗎𝗇 𝗆𝗈𝗆𝖾𝗇𝗍𝗈...

*𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍*`, m);

            const dl = await downloadWithFallback(url, 'audio');
            if (!dl.status) throw dl.error || '❌ Error al descargar';

            const size = await getSize(dl.result.download);

            const fkontak = {
                key: { fromMe: false, participant: "0@s.whatsapp.net" },
                message: {
                    documentMessage: {
                        title: `✎「 ${title} 」Ꮺ`,
                        fileName: `Descargas 𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍`,
                        jpegThumbnail: thumbResized
                    }
                }
            };

            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                caption: `${title}`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak });

            await m.react('✅');
            return;
        }

        // ========== YTMP4DOC - Video como documento ==========
        if (command === 'ytmp4doc') {
            await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮
│ ✎ *DESCARGANDO...*
╰━━━━━━━━━━━━━╯

✧ *${title}*

❍ 𝖥𝗈𝗋𝗆𝖺𝗍𝗈: 𝖣𝗈𝖼𝗎𝗆𝖾𝗇𝗍𝗈 𝖬𝖯𝟦
ꕤ 𝖯𝗋𝗈𝖼𝖾𝗌𝖺𝗇𝖽𝗈 𝗏𝗂𝖽𝖾𝗈...
➢ 𝖠𝗋𝖼𝗁𝗂𝗏𝗈𝗌 𝗀𝗋𝖺𝗇𝖽𝖾𝗌 𝗉𝗎𝖾𝖽𝖾𝗇 𝗍𝖺𝗋𝖽𝖺𝗋...

*𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍*`, m);

            const dl = await downloadWithFallback(url, 'video');
            if (!dl.status) throw dl.error || '❌ Error al descargar';

            const size = await getSize(dl.result.download);

            if (size > 600 * 1024 * 1024) {
                throw `📦 Video muy grande (${formatSize(size)}).\n\n⚠️ El archivo supera los 600 MB, no puedo enviarlo.`;
            }

            const fkontak = {
                key: { fromMe: false, participant: "0@s.whatsapp.net" },
                message: {
                    documentMessage: {
                        title: `✎「 ${title} 」Ꮺ`,
                        fileName: `Descargas 𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍`,
                        jpegThumbnail: thumbResized
                    }
                }
            };

            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'video/mp4',
                fileName: `${title}.mp4`,
                jpegThumbnail: thumbResized,
                caption: `✎ *${title}*`
            }, { quoted: fkontak });

            await m.react('✅');
            return;
        }

    } catch (e) {
        await m.react('❌');
        console.error('❌ Error:', e);
        return conn.reply(m.chat, typeof e === 'string' ? e : `❌ Error: ${e.message}`, m);
    }
}

handler.help = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];
handler.tags = ['descargas'];
handler.command = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];
handler.register = false;
handler.group = false;

export default handler;