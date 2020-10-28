import * as cheerio from 'cheerio'
import * as superagent from 'superagent'

const ONE = 'http://wufazhuce.com/'; // ONE的web版网站
const TXHOST = 'http://api.tianapi.com/txapi/'; // 天行host

function req(url,method, params, data, cookies) {
  return new Promise(function (resolve,reject) {
    superagent(method, url)
      .query(params)
      .send(data)
      .set('Content-Type','application/x-www-form-urlencoded')
      .end(function (err, response) {
        if (err) {
        reject(err)
        }
        resolve(response)
      })
    })
}

async function getOne() {
  // 获取每日一句
  try {
    let res = await req(ONE, 'GET');
    let $ = cheerio.load(res.text);
    let todayOneList = $('#carousel-one .carousel-inner .item');
    let todayOne = $(todayOneList[0])
      .find('.fp-one-cita')
      .text()
      .replace(/(^\s*)|(\s*$)/g, '');
    return todayOne;
  } catch (err) {
    console.log('错误', err);
    return err;
  }
}

async function getTXweather() {
  // 获取天行天气
  let url = TXHOST + 'tianqi/';
  try {
    let res = await req(url, 'GET', {
      key: '',//需要自己去天行申请，地址https://www.tianapi.com/signup.html?source=474284281
      city: 'Arlington'
    });
    let content = JSON.parse(res.text);
    if (content.code === 200) {
      let todayInfo = content.newslist[0];
      let obj = {
        weatherTips: todayInfo.tips,
        todayWeather:`阿林顿今天${todayInfo.weather}\n温度:${todayInfo.lowest}/${todayInfo.highest}
        \n${todayInfo.wind}风： ${todayInfo.windspeed}\n紫外线指数:${todayInfo.uv_index}\n湿度 
        ${todayInfo.humidity}`
      };
      console.log('获取天行天气成功', obj);
      return obj;
    } else {
      console.log('获取接口失败', content.code);
    }
  } catch (err) {
    console.log('获取接口失败', err);
  }
}


async function getSweetWord() {
  // 获取土味情话
  let url = TXHOST + 'saylove/';
  try {
    let res = await req(url, 'GET', { key: '' });
    let content = JSON.parse(res.text);
    if (content.code === 200) {
      let sweet = content.newslist[0].content;
      let str = sweet.replace('\r\n', '<br>');
      return str;
    } else {
      console.log('获取接口失败', content.msg);
    }
  } catch (err) {
    console.log('获取接口失败', err);
  }
}

export { getOne, getTXweather, getSweetWord, };