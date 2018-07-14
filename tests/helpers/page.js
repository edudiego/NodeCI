const puppeteer = require('puppeteer');

const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
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
    await this.page.goto('http://localhost:3000/blogs');
  }
  async getContentsOf(selector) {
    return await this.page.$eval(selector, el => el.innerHTML);
  }
  get(path) {
    return this.page.evaluate(_path_ => {
      return fetch(_path_, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type' : 'application/json'
        }
      }).then( res => res.json() );
    }, path);
  }
  post(path, body) {
    return this.page.evaluate( (_path_, _body_) => {
      return fetch(_path_, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: _body_
      }).then( res => res.json() );
    }, path, body);
  }
}

module.exports = CustomPage;