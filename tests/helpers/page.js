const puppeteer = require('puppeteer');

const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page, browser);

    return new Proxy( customPage, {
      get: function(target, prop){
        return target[prop] || page[prop] || browser[prop];
      }
    });
  }
  constructor(page, browser) {
    this.page = page;
    this.browser = browser;
  }
  close() {
    this.browser.close();
  }
  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('localhost:3000/blogs');
  }
  async getContentsOf(selector) {
    return await this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;