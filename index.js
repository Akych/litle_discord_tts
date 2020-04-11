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
/*
oksana
jane	
omazh	
zahar	
ermil	
silaerkan	
erkanyavas	
alyss	
nick	
*/
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


const command = (msgcontent) =>{
    let arr = msgcontent.split(" ");
    let cmd = arr.shift()
    let text = arr.join(' ');
    text = text.trim()
    console.log(cmd,"has",text)
}

Dclient.on('ready', () => {
    let old_user_id 
    let old_user_time 

    console.log("Login in")
    Channels["tts"] = Dclient.channels.get(cfg["tts_channel_id"]) 
    Dclient.on('message', (msg) => {
        if(msg.author.bot) return;
        if(msg.channel.id == Channels["tts"].id){
            command(msg.content)
            let voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel){ msg.channel.send('Вне войс канала доступ к ***tts*** запрещен.').then((m)=>{m.delete(10000);msg.delete(10000)}); return}
            
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