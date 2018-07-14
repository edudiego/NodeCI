const Page = require('./helpers/page');

let page;

beforeEach( async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach( async () => {
  await page.close();
});

describe('When logged in', async() => {

  beforeEach( async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('Can se blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toBe("Blog Title");
  });

  describe('And using valid inputs', async() => {

    beforeEach( async () => {
      await page.type('.title input', 'My title');
      await page.type('.content input', 'My content');
      await page.click('form button');
    });

    test('Submitting takes us to the review screen', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toBe("Please confirm your entries");
    });

    test('Saving takes us to the blog index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toBe("My title");
      expect(content).toBe("My content");
    });
  });

  describe('And using invalid inputs', async() => {

    beforeEach( async () => {
      await page.click('form button');
    });

    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toBe("You must provide a value");
      expect(contentError).toBe("You must provide a value");
    });
  });

});


describe('User is not signed in', async() => {

  test('User cannot create blog posts', async () => {

    const result = await page.post('api/blogs', {
      body: JSON.stringify({ title: 'My Title', content: 'My Content' })
    });

    expect(result.error).toBe('You must log in!');
  });

  test('User cannot retrieve a list of', async () => {

    const result = await page.get('api/blogs');
    expect(result.error).toBe('You must log in!');
  });
});

// A comment to trigger a build?
