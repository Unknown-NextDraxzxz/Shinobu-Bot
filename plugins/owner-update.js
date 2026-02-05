import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

let handler = async (m, { conn, usedPrefix, text }) => {
  // 1. Verificar si es owner
  if (!global.owner.includes(m.sender.split('@')[0])) {
    return m.reply('🚫 Este comando solo está disponible para el owner.');
  }

  const rama = text.trim() || 'main';

  try {
    await m.react('🕒');
    const { sendMessage } = conn;
    
    // Mensaje de inicio
    let { key } = await sendMessage(m.chat, { text: `🔄 *Actualizando bot desde rama: ${rama}...*` }, { quoted: m });

    // 2. Ejecutar comandos de Git de forma secuencial
    // git fetch: busca cambios
    // git reset: descarta cambios locales que causen conflicto
    // git pull: descarga los cambios reales
    const comando = `git fetch --all && git reset --hard origin/${rama} && git pull origin ${rama}`;
    
    await execAsync(comando);

    // 3. Verificar si hubo cambios en las dependencias
    try {
        // Opcional: Si quieres que intente instalar librerías nuevas automáticamente
        // await execAsync('npm install'); 
    } catch (e) {
        console.error("Error al instalar dependencias:", e);
    }

    // 4. Mensaje de éxito
    await sendMessage(m.chat, { 
      text: `✎ *𝖠𝖼𝗍𝗎𝖺𝗅𝗂𝗓𝖺𝖼𝗂𝗈́𝗇 𝖤𝗑𝗂𝗍𝗈𝗌𝖺*\n\nꕤ *Rama:* \`${rama}\`\n\nEl bot se reiniciará en 5 segundos para aplicar los cambios. Si no vuelve, hazlo manualmente.`,
      edit: key 
    });

    await m.react('✅');

    // 5. Forzar el reinicio del proceso
    // Esto hace que el hosting (o el comando 'npm start') detecte que el bot se apagó y lo inicie de nuevo
    setTimeout(() => {
        process.exit(0);
    }, 5000);

  } catch (error) {
    console.error(error);
    await m.react('❌');
    return m.reply(`❌ *ERROR AL ACTUALIZAR*\n\n\`\`\`${error.message}\`\`\`\n\nIntenta ejecutar en la consola del hosting:\n\`git pull origin ${rama}\``);
  }
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['actualizar', 'update', 'upgrade'];
handler.owner = true;

export default handler;