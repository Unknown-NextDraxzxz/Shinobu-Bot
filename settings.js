import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

//BETA: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
global.botNumber = "" //Ejemplo: 573218138672

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = [
"51939260696",
"51971285104"
]

global.suittag = ["51939260696"] 
global.prems = ["51939260696"]
global.mayers = ["51939260696"]

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = "Baileys Multi Device"
global.vs = "^1.3"
global.nameqr = "sʜɪɴᴏʙᴜ - ʙᴏᴛ"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.AstaJadibts = true

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.prefix = new RegExp('^[#!./-]?')
global.sinprefix = false 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.prefix = new RegExp('^[#!./-]?')
global.botname = "𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍"
global.textbot = "sʜɪɴᴏʙᴜ - ʙᴏᴛ • Powered By ᴍᴀʏᴇʀs"
global.dev = "Powered By ᴍᴀʏᴇʀs"
global.author = "sʜɪɴᴏʙᴜ - ʙᴏᴛ • Powered By ᴍᴀʏᴇʀs"
global.etiqueta = "ᴍᴀʏᴇʀs"
global.currency = "¥enes"
global.banner = "https://github.com/Fer280809/Asta_bot/blob/main/lib%2Fcatalogo.jpg"
global.icono = "https://github.com/Fer280809/Asta_bot/blob/main/lib%2Fcatalogo.jpg"
global.catalogo = fs.readFileSync('./lib/catalogo.jpg')

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.group = "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t"
global.community = "https://chat.whatsapp.com/DI8aRRIXmmRKC3cUn9R0Hv?mode=gi_t"
global.channel = "https://whatsapp.com/channel/0029Vb5l5w1CHDyjovjN8s2V"
global.github = "https://github.com/"
global.gmail = "support@gmail.com"
global.ch = {
ch1: "120363401983007420@newsletter"
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.APIs = {
xyro: { url: "https://xyro.site", key: null },
yupra: { url: "https://api.yupra.my.id", key: null },
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
zenzxz: { url: "https://api.zenzxz.my.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
adonix: { url: "https://api-adonix.ultraplus.click", key: 'Destroy-xyz' }
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings.js'"))
import(`${file}?update=${Date.now()}`)
})
