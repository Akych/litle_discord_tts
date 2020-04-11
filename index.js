const Discord = require('discord.js')
const Dclient = new Discord.Client()
var cfg = {
    "tts_channel_id" : "697885963959009370", // text channel id to speech 
    "bot_token" : "", // bot tocken
}
const getTTSLink = (text, speeker = "zahar")=>{
    return `http://tts.voicetech.yandex.net/tts?format=mp3&quality=lo&platform=web&application=translate&lang=ru_RU&speaker=${speeker}&speed=0.9&emotion=neutral&text=${encodeURIComponent(text)}//////////////////` // \\ need to fix lose ends voice
}
var Channels= {}
var qeue = new Array()
var status = {
    "isConnect" : false,
    "isPlay" : false,
    "connection" : null
}

// id : speeker
var speek_custom = {
    "259963475000950785" : "nick",
    "243085229147815936" : "ermil",
}

Date.inSeconds = function() { return Math.floor((new Date().getTime())/1000) }

const play_tts = (channel)=>{
    if(status.isPlay) return;
    let Link = qeue.shift()
    if(status.isConnect){
        dispatcher =  status.connection.playStream(Link,{seek: 0, volume: 0.5})
        status.isPlay = true
        dispatcher.on("end", ()=>{
            status.isPlay = false
            if(qeue.length > 0){
                play_tts(channel);
            }
        });
    }else{
        channel.join().then(connection => {
            status.isConnect = true
            status.connection = connection
            dispatcher =  connection.playStream(Link,{seek: 0, volume: 0.5})
            status.isPlay = true
            dispatcher.on("end", ()=>{
                status.isPlay = false
                if(qeue.length > 0){
                    play_tts(channel);
                }
            });
        })
    }
}



/*
oksana
jane	
omazh	
alyss
silaerkan


zahar	
ermil	
erkanyavas	
nick	
*/


const voices = {
    1 : "oksana",
    2 : "jane",
    3 : "omazh",
    4 : "alyss",
    5 : "silaerkan",

    6 : "zahar",
    7 : "ermil",
    8 : "erkanyavas",
    9 : "nick"
}


const prefix = "@"
const commands = {
    "voice" : (text,channel,author)=>{
        if(!voices[text]){ channel.send(`Не удалось найти голос с индексом **${text}** используйте от 1 до 9`); return}
        channel.send("Голос установлен - "+voices[text])
        speek_custom[author.id] = voices[text]
    }
}

const command = (msgcontent,channel,author) =>{
    let arr = msgcontent.split(" ");
    let cmd = arr.shift()
    cmd = cmd.slice(1)
    let text = arr.join(' ');
    text = text.trim()
    if(!commands[cmd]){channel.send("Неизвестная команда - "+cmd); return;}
    commands[cmd](text,channel,author)
}

Dclient.on('ready', () => {
    let old_user_id 
    let old_user_time 

    console.log("Login in")
    Channels["tts"] = Dclient.channels.get(cfg["tts_channel_id"]) 
    Dclient.on('message', (msg) => {
        if(msg.author.bot) return;
        if(msg.channel.id == Channels["tts"].id){
            let voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel){ msg.channel.send('Вне войс канала доступ к ***tts*** запрещен.').then((m)=>{m.delete(10000);msg.delete(10000)}); return}
            
            if(msg.content.startsWith(prefix)){
                command(msg.content, msg.channel || Channels["tts"],msg.author)
                return
            }

            let totts_msg;
            if(old_user_time > Date.inSeconds()){
                if(old_user_id != msg.author.id){
                    old_user_id = msg.author.id
                    old_user_time = Date.inSeconds() + 10
                    totts_msg = `${msg.author.username} говорит /${msg.content}`
                }else{
                    old_user_time = Date.inSeconds() + 10
                    totts_msg = msg.content
                }
            }else{
                old_user_id = msg.author.id
                old_user_time = Date.inSeconds() + 10
                totts_msg = `${msg.author.username} говорит /${msg.content}`
            }

            let Link = getTTSLink(totts_msg,speek_custom[msg.author.id])
            qeue.push(Link)
            play_tts(voiceChannel)
        }
    })
})
Dclient.login(cfg["bot_token"])