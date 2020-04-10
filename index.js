const Discord = require('discord.js')
const Dclient = new Discord.Client()
var cfg = {
    "tts_channel_id" : "", // text channel id to speech 
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
const play_tts = (channel)=>{
    if(status.isPlay) return;
    let Link = qeue.shift()
    if(status.isConnect){
        console.log("load")
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
Dclient.on('ready', () => {
    console.log("hello")
    Channels["tts"] = Dclient.channels.get(cfg["tts_channel_id"]) 
    Dclient.on('message', (msg) => {
        if(msg.author.bot) return;

        if(msg.channel.id == Channels["tts"].id){
            let voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel){ msg.channel.send('Вне войс канала доступ к ***tts*** запрещен.').then((m)=>{m.delete(10000);msg.delete(10000)}); return}
            let Link = getTTSLink(`${msg.author.username} говорит ${msg.content}`)
            qeue.push(Link)
            play_tts(voiceChannel)
        }
    })
})
Dclient.login(cfg["bot_token"])