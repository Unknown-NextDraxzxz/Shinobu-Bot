let handler = async (m, { conn, usedPrefix }) => {
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length;
  let libreria = 'Baileys';
  let vs = '1.3';
  let userId = m.sender;

  let infoText = `╭─━━━━━━━━━━━━━━━─╮
│ ꕤ ¡Hola @${userId.split('@')[0]} 𝖬𝗂 𝗇𝗈𝗆𝖻𝗋𝖾 𝖾𝗌 ${botname}
╰─━━━━━━━━━━━━━━━─╯

╭─═⊰ ❀ 𝐄𝐒𝐓𝐀𝐃𝐎 𝐀𝐂𝐓𝐈𝐕𝐎
│ ➣ Estado: ${(conn.user.jid == global.conn.user.jid ? '❍ Premium' : '❒ Prem-Bot')}
│ ➢ Users: ${totalreg.toLocaleString()}
│ ➣ Comandos: ${totalCommands}
│ ➢ Librería » ${libreria}
│ ➣ Servidor: Oculto
│ ➢ Ping: Online 
│ ➣ Version: ${vs}
│ ➢ Modo: ${(conn.user.jid == global.conn.user.jid ? 'Privado' : 'Publico')}
╰───────────────╯

𝗎𝗌𝖺 #code 𝗈 #qr 𝗉𝖺𝗋𝖺 𝗏𝗈𝗅𝗏𝖾𝗋𝗍𝖾 
𝖲𝗎𝖻-𝖡𝗈𝗍 𝖽𝖾 𝖲𝗁𝗂𝗇𝗈𝖻𝗎


┏━━━━━━━━━━━━━━┓
*💰 ECONOMY*  
┗━━━━━━━━━━━━━━┛
ꕤ #w / #work / #trabajar
> Ganar coins trabajando  

ꕤ #slut / #prostituirse
> Ganar coins prostituyéndote  

ꕤ *#coinflip / #flip / #cf* + [cantidad] [cara/cruz]
> Apostar coins en cara o cruz  

ꕤ *#crime / #crimen*
> Ganar coins rápido  

ꕤ *#roulette / #rt* + [red/black] [cantidad]
> Apostar coins en la ruleta  

ꕤ *#casino / #apostar / #slot* + [cantidad]
> Apostar coins en el casino  

ꕤ *#balance / #bal / #bank* + <usuario>
> Ver cuantos coins tienes en el banco  

ꕤ *#deposit / #dep / #depositar / #d* + [cantidad] | all
> Depositar tus coins en el banco  

ꕤ *#withdraw / #with / #retirar* + [cantidad] | all
> Retirar tus coins del banco  

ꕤ *#economyinfo / #einfo*
> Ver tu información de economía  

ꕤ *#givecoins / #pay / #coinsgive* + [usuario] [cantidad]
> Dar coins a un usuario  

ꕤ *#miming / #minar / #mine*
> Realizar trabajos de minería y ganar coins  

ꕤ *#daily / #diario*
> Reclamar tu recompensa diaria  

ꕤ *#cofre / #coffer*
> Reclamar tu cofre diario  

ꕤ *#weekly / #semanal*
> Reclamar tu recompensa semanal  

ꕤ *#monthly / #mensual*
> Reclamar tu recompensa mensual  

ꕤ *#steal / #robar / #rob* + [@mencion]
> Intentar robar coins a un usuario  

ꕤ *#economyboard / #eboard / #baltop* + <pagina>
> Ver el ranking económico del grupo  

ꕤ *#aventura / #adventure*
> Aventuras para ganar coins y exp  

ꕤ *#curar / #heal*
> Curar salud para salir de aventuras  

ꕤ *#cazar / #hunt*
> Cazar animales para ganar coins y exp  

ꕤ *#fish / #pescar*
> Ganar coins y exp pescando  

ꕤ *#mazmorra / #dungeon*
> Explorar mazmorras para ganar coins y exp  

┏━━━━━━━━━━━━━━┓
*DOWNLOAD*  
┗━━━━━━━━━━━━━━┛
ꕤ *#tiktok / #tt* + [Link] / [busqueda]
> Descargar un video de TikTok  

ꕤ *#estados*
> Descarga estados de whatsapp  

ꕤ *#mediafire / #mf* + [Link]
> Descargar un archivo de MediaFire  

ꕤ *#mega / #mg* + [Link]
> Descargar un archivo de MEGA  

ꕤ *#play / play2 / ytmp3 / ytmp4 / ytmp3doc / ytmp4doc* + [Cancion] / [Link]
> Descargar una canción o vídeo de YouTube  

ꕤ *#facebook / #fb* + [Link]
> Descargar un video de Facebook  

ꕤ *#twitter / #x* + [Link]
> Descargar un video de Twitter/X  

ꕤ *#mods / #mod* + [nombre]
> Descargar un mods para minecraft  

ꕤ *#ig / #instagram* + [Link]
> Descargar un reel de Instagram  

ꕤ *#pinterest / #pin* + [busqueda] / [Link]
> Buscar y descargar imágenes de Pinterest  

ꕤ *#image / #imagen* + [busqueda]
> Buscar y descargar imágenes de Google  

ꕤ *#apk / #modapk* + [busqueda]
> Descargar un APK de Aptoide  

ꕤ *#ytsearch / #search* + [busqueda]
> Buscar videos de YouTube  

┏━━━━━━━━━━━━━━┓
*GACHA*  
┗━━━━━━━━━━━━━━┛
ꕤ *#buycharacter / #buychar / #buyc* + [nombre]
> Comprar un personaje en venta  

ꕤ *#charimage / #waifuimage / #cimage / #wimage* + [nombre]
> Ver una imagen aleatoria de un personaje  

ꕤ *#charinfo / #winfo / #waifuinfo* + [nombre]
> Ver información de un personaje  

ꕤ *#claim / #c / #reclamar* + {citar personaje}
> Reclamar un personaje  

ꕤ *#delclaimmsg*
> Restablecer el mensaje al reclamar un personaje  

ꕤ *#deletewaifu / #delwaifu / #delchar* + [nombre]
> Eliminar un personaje reclamado  

ꕤ *#favoritetop / #favtop*
> Ver el top de personajes favoritos  

ꕤ *#gachainfo / #ginfo / #infogacha*
> Ver tu información de gacha  

ꕤ *#giveallharem* + [@usuario]
> Regalar todos tus personajes a otro usuario  

ꕤ *#givechar / #givewaifu / #regalar* + [@usuario] [nombre]
> Regalar un personaje a otro usuario  

ꕤ *#robwaifu / #robarwaifu* + [@usuario]
> Robar un personaje a otro usuario  

ꕤ *#harem / #waifus / #claims* + <@usuario>
> Ver tus personajes reclamados  

ꕤ *#haremshop / #tiendawaifus / #wshop* + <pagina>
> Ver los personajes en venta  

ꕤ *#removesale / #removerventa* + [precio] [nombre]
> Eliminar un personaje en venta  

ꕤ *#rollwaifu / #rw / #roll*
> Waifu o husbando aleatorio  

ꕤ *#sell / #vender* + [precio] [nombre]
> Poner un personaje a la venta  

ꕤ *#serieinfo / #ainfo / #animeinfo* + [nombre]
> Información de un anime  

ꕤ *#serielist / #slist / #animelist*
> Listar series del bot  

ꕤ *#setclaimmsg / #setclaim* + [mensaje]
> Modificar el mensaje al reclamar un personaje  

ꕤ *#trade / #intercambiar* + [Tu personaje] / [Personaje 2]
> Intercambiar un personaje con otro usuario  

ꕤ *#vote / #votar* + [nombre]
> Votar por un personaje para subir su valor  

ꕤ *#waifusboard / #waifustop / #topwaifus / #wtop* + [número]
> Ver el top de personajes con mayor valor  

┏━━━━━━━━━━━━━━┓
*SOCKETS*  
┗━━━━━━━━━━━━━━┛
ꕤ *#qr / #code*
> Crear un Sub-Bot con un código QR/Code  

ꕤ *#bots / #botlist*
> Ver el número de bots activos  

ꕤ *#status / #estado*
> Ver el estado del bot  

ꕤ *#p / #ping*
> Medir tiempo de respuesta  

ꕤ *#join* + [Invitación]
> Unir al bot a un grupo  

ꕤ *#leave / #salir*
> Salir de un grupo  

ꕤ *#logout*
> Cerrar sesión del bot  

ꕤ *#setpfp / #setimage*
> Cambiar la imagen de perfil  

ꕤ *#setstatus* + [estado]
> Cambiar el estado del bot  

ꕤ *#setusername* + [nombre]
> Cambiar el nombre de usuario  

┏━━━━━━━━━━━━━━┓
*UTILITIES*  
┗━━━━━━━━━━━━━━┛
ꕤ *#help / #menu*
> Ver el menú de comandos  

ꕤ *#sc / #script*
> Link del repositorio oficial del Bot  

ꕤ *#sug / #suggest*
> Sugerir nuevas funciones al desarrollador  

ꕤ *#reporte / #reportar*
> Reportar fallas o problemas del bot  

ꕤ *#calcular / #cal*
> Calcular tipos de ecuaciones  

ꕤ *#delmeta*
> Restablecer el pack y autor por defecto para tus stickers  

ꕤ *#getpic / #pfp* + [@usuario]
> Ver la foto de perfil de un usuario  

ꕤ *#say* + [texto]
> Repetir un mensaje  

ꕤ *#setmeta* + [autor] | [pack]
> Establecer el pack y autor por defecto para tus stickers  

ꕤ *#sticker / #s / #wm* + {citar una imagen/video}
> Convertir una imagen/video a sticker  

ꕤ *#toimg / #img* + {citar sticker}
> Convertir un sticker/imagen a imagen  

ꕤ *#brat / #bratv / #qc / #emojimix*
> Crear stickers con texto  

ꕤ *#gitclone* + [Link]
> Descargar un repositorio de Github  

ꕤ *#enhance / #remini / #hd*
> Mejorar calidad de una imagen  

ꕤ *#letra / #style*
> Cambiar la fuente de las letras  

ꕤ *#read / #readviewonce*
> Ver imágenes viewonce  

ꕤ *#ss / #ssweb*
> Ver el estado de una página web  

ꕤ *#translate / #traducir / #trad*
> Traducir palabras a otros idiomas  

ꕤ *#ia / #gemini*
> Preguntar a ChatGPT  

ꕤ *#tourl / #catbox*
> Convertir imagen/video a URL  

ꕤ *#wiki / #wikipedia*
> Investigar temas a través de Wikipedia  

ꕤ *#dalle / #flux*
> Crear imágenes con texto mediante IA  

ꕤ *#npmdl / #nmpjs*
> Descargar paquetes de NPMJS  

ꕤ *#google*
> Realizar búsquedas por Google  

┏━━━━━━━━━━━━━━┓
*PROFILES*  
┗━━━━━━━━━━━━━━┛
ꕤ *#leaderboard / #lboard / #top* + <pagina>
> Top de usuarios con más experiencia  

ꕤ *#level / #lvl* + <@Mencion>
> Ver tu nivel y experiencia actual  

ꕤ *#marry / #casarse* + <@Mencion>
> Casarte con alguien  

ꕤ *#profile* + <@Mencion>
> Ver tu perfil  

ꕤ *#setbirth* + [fecha]
> Establecer tu fecha de cumpleaños  

ꕤ *#setdescription / #setdesc* + [Descripcion]
> Establecer tu descripción  

ꕤ *#setgenre* + Hombre | Mujer
> Establecer tu género  

ꕤ *#delgenre / #delgenero*
> Eliminar tu género  

ꕤ *#delbirth* + [fecha]
> Borrar tu fecha de cumpleaños  

ꕤ *#divorce*
> Divorciarte de tu pareja  

ꕤ *#setfavourite / #setfav* + [Personaje]
> Establecer tu claim favorito  

ꕤ *#deldescription / #deldesc*
> Eliminar tu descripción  

ꕤ *#prem / #vip*
> Comprar membresía premium  

┏━━━━━━━━━━━━━━┓
*GROUPS*  
┗━━━━━━━━━━━━━━┛
ꕤ *#tag / #hidetag / #invocar / #tagall* + [mensaje]
> Envía un mensaje mencionando a todos los usuarios del grupo  

ꕤ *#detect / #alertas* + [enable/disable]
> Activar/desactivar las alertas de promote/demote  

ꕤ *#setting / #config* 
> Activa/desactiva y ve las opciones activas o desactivadas  

ꕤ *#antilink / #antienlace* + [enable/disable]
> Activar/desactivar el antienlace  

ꕤ *#bot* + [enable/disable]
> Activar/desactivar al bot  

ꕤ *#close / #cerrar*
> Cerrar el grupo para administradores  

ꕤ *#demote* + <@usuario> | {mencion}
> Descender a un usuario de administrador  

ꕤ *#economy* + [enable/disable]
> Activar/desactivar los comandos de economía  

ꕤ *#gacha* + [enable/disable]
> Activar/desactivar los comandos de Gacha y Games  

ꕤ *#welcome / #bienvenida* + [enable/disable]
> Activar/desactivar la bienvenida y despedida  

ꕤ *#setbye* + [texto]
> Establecer un mensaje de despedida personalizado  

ꕤ *#setprimary* + [@bot]
> Establece un bot como primario del grupo  

ꕤ *#setwelcome* + [texto]
> Establecer un mensaje de bienvenida personalizado  

ꕤ *#kick* + <@usuario> | {mencion}
> Expulsar a un usuario del grupo  

ꕤ *#open / #abrir*
> Abrir el grupo para todos los usuarios  

ꕤ *#promote* + <@usuario> | {mencion}
> Ascender a un usuario a administrador  

ꕤ *#add / #añadir / #agregar* + {número}
> Invitar a un usuario a tu grupo  

ꕤ *admins / admin* + [texto]
> Mencionar a los admins para solicitar ayuda  

ꕤ *#restablecer / #revoke*
> Restablecer enlace del grupo  

ꕤ *#addwarn / #warn* + <@usuario> | {mencion}
> Advertir a un usuario  

ꕤ *#unwarn / #delwarn* + <@usuario> | {mencion}
> Quitar advertencias de un usuario  

ꕤ *#advlist / #listadv*
> Ver lista de usuarios advertidos  

ꕤ *#inactivos / #kickinactivos*
> Ver y eliminar a usuarios inactivos  

ꕤ *#listnum / #kicknum* [texto]
> Eliminar usuarios con prefijo de país  

ꕤ *#stopkicknum*
> Parar el kicknum cuando necesites  

ꕤ *#gpbanner / #groupimg*
> Cambiar la imagen del grupo  

ꕤ *#gpname / #groupname* [texto]
> Cambiar el nombre del grupo  

ꕤ *#gpdesc / #groupdesc* [texto]
> Cambiar la descripción del grupo  

ꕤ *#del / #delete* + {citar un mensaje}
> Eliminar un mensaje  

ꕤ *#linea / #listonline*
> Ver lista de usuarios en línea  

ꕤ *#gp / #infogrupo*
> Ver la información del grupo  

ꕤ *#link*
> Ver enlace de invitación del grupo  

┏━━━━━━━━━━━━━━┓
*ANIME*  
┗━━━━━━━━━━━━━━┛
ꕤ *#angry / #enojado* + <mencion>
> Estar enojado  

ꕤ *#bath / #bañarse* + <mencion>
> Bañarse  

ꕤ *#bite / #morder* + <mencion>
> Muerde a alguien  

ꕤ *#bleh / #lengua* + <mencion>
> Sacar la lengua  

ꕤ *#blush / #sonrojarse* + <mencion>
> Sonrojarte  

ꕤ *#bored / #aburrido* + <mencion>
> Estar aburrido  

ꕤ *#clap / #aplaudir* + <mencion>
> Aplaudir  

ꕤ *#coffee / #cafe / #café* + <mencion>
> Tomar café  

ꕤ *#cry / #llorar* + <mencion>
> Llorar por algo o alguien  

ꕤ *#cuddle / #acurrucarse* + <mencion>
> Acurrucarse  

ꕤ *#dance / #bailar* + <mencion>
> Sacate los pasitos prohibidos  

ꕤ *#dramatic / #drama* + <mencion>
> Drama  

ꕤ *#drunk / #borracho* + <mencion>
> Estar borracho  

ꕤ *#eat / #comer* + <mencion>
> Comer algo delicioso  

ꕤ *#facepalm / #palmada* + <mencion>
> Darte una palmada en la cara  

ꕤ *#happy / #feliz* + <mencion>
> Salta de felicidad  

ꕤ *#hug / #abrazar* + <mencion>
> Dar un abrazo  

ꕤ *#impregnate / #preg / #preñar / #embarazar* + <mencion>
> Embarazar a alguien  

ꕤ *#kill / #matar* + <mencion>
> Toma tu arma y mata a alguien  

ꕤ *#kiss / #muak* + <mencion>
> Dar un beso  

ꕤ *#kisscheek / #beso* + <mencion>
> Beso en la mejilla  

ꕤ *#laugh / #reirse* + <mencion>
> Reírte de algo o alguien  

ꕤ *#lick / #lamer* + <mencion>
> Lamer a alguien  

ꕤ *#love / #amor / #enamorado / #enamorada* + <mencion>
> Sentirse enamorado  

ꕤ *#pat / #palmadita / #palmada* + <mencion>
> Acaricia a alguien  

ꕤ *#poke / #picar* + <mencion>
> Picar a alguien  

ꕤ *#pout / #pucheros* + <mencion>
> Hacer pucheros  

ꕤ *#punch / #pegar / #golpear* + <mencion>
> Dar un puñetazo  

ꕤ *#run / #correr* + <mencion>
> Correr  

ꕤ *#sad / #triste* + <mencion>
> Expresar tristeza  

ꕤ *#scared / #asustado / #asustada* + <mencion>
> Estar asustado  

ꕤ *#seduce / #seducir* + <mencion>
> Seducir a alguien  

ꕤ *#shy / #timido / #timida* + <mencion>
> Sentir timidez  

ꕤ *#slap / #bofetada* + <mencion>
> Dar una bofetada  

ꕤ *#sleep / #dormir* + <mencion>
> Tumbarte a dormir  

ꕤ *#smoke / #fumar* + <mencion>
> Fumar  

ꕤ *#spit / #escupir* + <mencion>
> Escupir  

ꕤ *#step / #pisar* + <mencion>
> Pisar a alguien  

ꕤ *#think / #pensar* + <mencion>
> Pensar en algo  

ꕤ *#walk / #caminar* + <mencion>
> Caminar  

ꕤ *#wink / #guiñar* + <mencion>
> Guiñar el ojo  

ꕤ *#cringe / #avergonzarse* + <mencion>
> Sentir vergüenza ajena  

ꕤ *#smug / #presumir* + <mencion>
> Presumir con estilo  

ꕤ *#smile / #sonreir* + <mencion>
> Sonreír con ternura  

ꕤ *#highfive / #5* + <mencion>
> Chocar los cinco  

ꕤ *#bully / #bullying* + <mencion>
> Molestar a alguien  

ꕤ *#handhold / #mano* + <mencion>
> Tomarse de la mano  

ꕤ *#wave / #ola / #hola* + <mencion>
> Saludar con la mano  

ꕤ *#waifu*
> Buscar una waifu aleatoria  

ꕤ *#ppcouple / #ppcp*
> Genera imágenes para amistades o parejas



┏━━━━━━━━━━━━━━┓
*🔞 NSFW*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos NSFW  

╰┈➤ 🔞 *#danbooru / #dbooru* + [Tags]
        ╰┈➤ Buscar imágenes en Danbooru  
╰┈➤ 🔞 *#gelbooru / #gbooru* + [Tags]
        ╰┈➤ Buscar imágenes en Gelbooru  
╰┈➤ 🔞 *#rule34 / #r34* + [Tags]
        ╰┈➤ Buscar imágenes en Rule34  
╰┈➤ 🎥 *#xvideos / #xvideosdl* + [Link]
        ╰┈➤ Descargar un video de Xvideos  
╰┈➤ 🎥 *#xnxx / #xnxxdl* + [Link]
        ╰┈➤ Descargar un video de Xnxx  
╰┈➤ 💦 *#mamada*  
        ╰┈➤ manda un video de mamando `;

  let buttons = [
      { buttonId: usedPrefix + 'code', buttonText: { displayText: '🤖 Sup-Bot' }, type: 1 }
  ];

  // URL de la imagen o video (cambia por tu propia URL)
  let mediaUrl = 'https://cdn.russellxz.click/a1dfd509.jpg'; // Cambia esto por tu imagen
  // let mediaUrl = 'https://example.com/video.mp4'; // O usa un video

  try {
    // Intenta enviar con imagen
    await conn.sendMessage(m.chat, {
      image: { url: mediaUrl },
      caption: infoText,
      footer: "𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍",
      buttons: buttons,
      headerType: 4,
      mentions: [userId]
    }, { quoted: m });
  } catch {
    // Si falla, envía sin imagen (método alternativo)
    let buttonMessage = {
      text: infoText,
      footer: "𝖲𝗁𝗂𝗇𝗈𝖻𝗎 - 𝖡𝗈𝗍",
      buttons: buttons,
      headerType: 1,
      mentions: [userId]
    };
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
  }
};

handler.help = ['menu2'];
handler.tags = ['main'];
handler.command = ['menú2', 'menu2', 'help2'];

export default handler;