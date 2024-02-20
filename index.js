const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,        
    ]
});

client.once('ready', () => {
    console.log('Bot está online!');
});



client.on('messageCreate', msg => {

    if(msg.content.toLowerCase() === 'ola'  && !msg.author.bot){
    msg.reply('Seja bem-vindo! Como posso ajudar?')
    } else if (msg.content.toLowerCase() === 'oi') {
    msg.reply('Seja bem-vindo! Como posso ajudar?')
    } else if (msg.content.toLowerCase() === 'e ai'){
    msg.reply('Seja bem-vindo! Como posso ajudar?')
    }

});

client.on('guildMemberAdd', member => {
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'chat-geral');
    if (!welcomeChannel) return;
    welcomeChannel.send(`Bem-vindo ao servidor, ${member}! Fique à vontade para explorar o servidor e se apresentar.`);
});



const queue = new Map();

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild ) return;
    if (message.content.startsWith('!play')) return;

    const args = message.content.split(' ');
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("Você precisa estar em um canal de voz para tocar música.");
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.reply("Preciso de permissões para entrar e falar no seu canal de voz!");
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        };

        queue.set(message.guild.id, queueContruct);
        queueContruct.songs.push(song);

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} foi adicionado à fila!`);
    };

})

function play(guild, song) {
const serverQueue = queue.get(guild.id);
if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
}

const stream = ytdl(song.url, { filter: 'audioonly' });
const resource = createAudioResource(stream);
const player = createAudioPlayer();

player.play(resource);
serverQueue.connection.subscribe(player);

player.on(AudioPlayerStatus.Idle, () => {
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0]);
});

serverQueue.textChannel.send(`Começando a tocar: **${song.title}**`);
}

client.login('MTIwOTIzMTUzNzQ5NzcwNjUyNg.Gybid2.xpzpIZETMo81d7m3ELlWy8XNYuKryfcEQxa2eI');