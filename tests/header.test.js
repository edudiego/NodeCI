const Page = require('./helpers/page');

let page;

beforeEach( async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach( async ()=>{
  await page.close();
});

test('the header has the correct text', async () => {
  const text = await page.getContentsOf('a.brand-logo');
  expect(text).toBe("Blogster");
});

test('clicking login start the auth flow', async () => {
  await page.click('ul.right a');
  const url = page.url();
  expect(url).toContain('accounts.google.com');
});

test('When signed in, show the logout button', async ()=> {

  await page.login();
  await page.waitFor('a[href="/auth/logout"]');

  const text = await page.getContentsOf('a[href="/auth/logout"]');

  expect(text).toBe("Logout");

});
