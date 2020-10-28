import { Wechaty, Message, UrlLink,log,} from 'wechaty'
import { PuppetPadplus } from 'wechaty-puppet-padplus'
import { EventLogger, QRCodeTerminal } from 'wechaty-plugin-contrib'
import { WechatyWeixinOpenAI, } from 'wechaty-weixin-openai'
import { setSchedule, } from './schedule/index'
import { getDay, formatDate,} from './utils/index'
import { getOne, getTXweather, getSweetWord,} from './superagent/index'


// 创建微信每日说定时任务
async function initDay() {
  console.log(`已经设定每日说任务`);
  setSchedule('0 40 0 * * *', async () => {
    console.log('你的贴心小助理开始工作啦！');
    let logMsg;
    let contact = 
      (await bot.Contact.find({ name: 'Jason' })) ||
      (await bot.Contact.find({ alias: 'boss' })); // 获取你要发送的联系人
    let one = await getOne(); //获取每日一句
    let weather = await getTXweather(); //获取天气信息
    let today = await formatDate(new Date()); //获取今天的日期
    let memorialDay = getDay('2009/08/07'); //获取纪念日天数
    let sweetWord = await getSweetWord();
    let str = `${today}\n我们相爱的第${memorialDay}天\n\n元气满满的一天开始啦,要开心噢^_^\n\n今日天气\n${weather.weatherTips}\n${
      weather.todayWeather
    }\n每日一句:<br>${one}<br><br>每日土味情话：<br>${sweetWord}<br><br>————————最爱你的我`;
    try {
      logMsg = str;
      await delay(2000);
      await contact.say(str); // 发送消息
    } catch (e) {
      logMsg = e.message;
    }
    console.log(logMsg);
  });
}

const padplusToken = '你自己的TOKEN'

const puppet = new PuppetPadplus({
  token: padplusToken,
})

const bot = new Wechaty({
  name: 'wwc-agent',
  puppet,
})

bot.use(EventLogger())
bot.use(QRCodeTerminal({ small: true }))

//在Wechaty里面引用和配置插件

const openAIToken = 'nsEPBndLucZKlMPHn932vqWl8K3mq6Q5' //微信开放平台申请
const openAIEncodingAESKey = 'EtbuFcfwDM3HiaNjtyZ323KWxtORD4vGwt4ZfYlMcuAYI'//微信开放平台申请

const preAnswerHook = async (message: Message) => {
  const isCommonMaterial = await processCommonMaterial(message)
  if (isCommonMaterial) {
    return false
  }
}

/**
 * Function to get boss contact
 */
const getBoss = async () => {
    const contact = bot.Contact.load('jason8611272813')
    await contact.sync()
    return contact
  }
  
  const noAnswerHook = async (message: Message) => {
    const room = message.room()
    const from = message.from()

    if (!room) {
      const boss = await getBoss()
      await message.say('你的问题我不会回答，你可以联系我的老板')
      await message.say(boss)
      return;
    }
    const members = await room.memberAll()
    const bossInRoom = members.find(m => m.id === 'jason8611272813')
    if (bossInRoom) {
      await room.say`${bossInRoom}，${from}问的问题我不知道，你帮我回答一下吧。`
    } else {
      const boss = await getBoss()
      await room.say`${from}，你的问题我不会回答，你可以联系我的老板`
      await room.say(boss)
    }
  }
  
/**
 * Use wechaty-weixin-openai plugin here with given config
 */
bot.use(WechatyWeixinOpenAI({
    token: openAIToken,
    encodingAESKey: openAIEncodingAESKey,
    noAnswerHook,
    preAnswerHook,
  })) 
  
const processCommonMaterial = async (message: Message) => {
    const room = message.room()
    // const from = message.from()
    const mentionSelf = await message.mentionSelf()
    const text = message.text()
    let intro = 'Jaon,爱好广泛，广交天下豪杰，上得了九天摘月，下得了五洋捉鳖，俗话说的好，不会烘培的飞行员不是好户外人，不会玩音乐的水族爱好者不是好厨师，不会画画的极限爱好者不是好程序员，这就是我的老板Jason，吼吼吼~~'

  
    if (room !== null && mentionSelf) {
      if (/jason|你老板|你上司/.test(text)) {
        await room.say(intro)
        await room.say(new UrlLink({
            description: '户外贱客 & Fighting,fighting,finghting and finghting，读万卷书，行万里路，学习AND吃，喝，玩，乐',
            thumbnailUrl: '',
            title: 'Jason',
            url: 'http://mp.weixin.qq.com/s?__biz=MzkxODE3MjAyNQ==&mid=100000001&idx=1&sn=d05de320c6fbe6c9f9149a09a4da81ec&chksm=41b4391776c3b001c143ac2c284c58ac8b08de41d95cab682aa5a07022e32096567f5780d5be#rd',
          }))
        return true
      } else if (/户外贱客/.test(text)) {
        await room.say(new UrlLink({
            description: '户外贱客 & Fighting,fighting,finghting and finghting，读万卷书，行万里路，学习AND吃，喝，玩，乐',
            thumbnailUrl: '',
            title: 'Jason',
            url: 'http://mp.weixin.qq.com/s?__biz=MzkxODE3MjAyNQ==&mid=100000001&idx=1&sn=d05de320c6fbe6c9f9149a09a4da81ec&chksm=41b4391776c3b001c143ac2c284c58ac8b08de41d95cab682aa5a07022e32096567f5780d5be#rd',
          }))
        return true
      }
    }
    return false
}

// 登录
async function onLogin(user) {
  console.log(`贴心小助理${user}登录了`);
  // 登陆后创建定时任务
  await initDay();
}

bot.on('login', onLogin);


bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
