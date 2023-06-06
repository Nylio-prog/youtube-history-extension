const puppeteer = require('puppeteer');
const assert = require('assert');
let browser, page;

const puppeteerArgs = [
    `--disable-extensions-except=${__dirname}`,
    `--load-extension=${__dirname}`,
    '--disable-features=DialMediaRouteProvider',
];

describe('Extension', async() => {

    beforeEach(async function () {
        browser = await puppeteer.launch({
            headless: false,
            args: puppeteerArgs
        });
        [page] = await browser.pages();
        await page.waitForTimeout(200); //Waiting page to load

        const targets = browser.targets();

        const extensionTarget = targets.find(target => target.type() === 'service_worker');
    
        const partialExtensionUrl = extensionTarget.url() || '';
        const [, , extensionId] = partialExtensionUrl.split('/');
    
        const extensionUrl = `chrome-extension://${extensionId}/popup.html`;
    
        await page.goto(extensionUrl, {waitUntil: ['domcontentloaded', "networkidle2"], timeout: 0});
    
        await page.waitForXPath("/html/head/title");
    });

    afterEach(async function() {
        await browser.close();
      });

    it('Title name', (async () => {
  
        const titleSelector = await page.$x("/html/head/title");

        const title = await page.evaluate(el => el.textContent, titleSelector[0])
        assert.equal(title, 'Youtube History Caption Search');
    }));

    it('Toggle switch class name', (async () => {
        const toggleSelector = await page.$x('/html/body/div/label/span');

        const toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector[0]);
        assert.equal(toggleClass, 'slider');

    }));

    it('Toggle switch', (async () => {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, null);

        await toggleSelector.evaluate(b => b.click());

        toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, 'active');

    }));

    it('Activating status button', async () => {
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, null);
      
        const youtubeURL = 'https://www.youtube.com/watch?v=VULO2EL4A3Q&';
      
        const ytbPage = await browser.newPage();
        await ytbPage.goto(youtubeURL, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });
      
        await ytbPage.waitForSelector('img.ytp-button.status-btn');
      
        var statusBtnSelector = 'img.ytp-button.status-btn';
      
        // Check if it's red and has the right title at first
        var statusBtnStyle = await ytbPage.$eval(statusBtnSelector, el => el.getAttribute('style'));
        assert.equal(statusBtnStyle, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');
      
        var statusBtnTitle = await ytbPage.$eval(statusBtnSelector, el => el.getAttribute('title'));
        assert.equal(statusBtnTitle, 'Video not stored, click to store');
      
        await toggleSelector.evaluate(b => b.click());
      
        toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, 'active');
      
        await ytbPage.waitForTimeout(3000); // Waiting for the video to download
      
        // Check if it's green and has the right title
        statusBtnStyle = await ytbPage.$eval(statusBtnSelector, el => el.getAttribute('style'));
        assert.equal(statusBtnStyle, 'filter: invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%);');
      
        statusBtnTitle = await ytbPage.$eval(statusBtnSelector, el => el.getAttribute('title'));
        assert.equal(statusBtnTitle, 'Video stored, click to delete');
      
      });
      

    it('Activating and deactivating status btn', (async () => {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, null);

        const youtubeURL = 'https://www.youtube.com/watch?v=VULO2EL4A3Q&';

        const ytbPage = await browser.newPage();
        await ytbPage.goto(youtubeURL, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });

        await ytbPage.waitForXPath('//img[@class="ytp-button status-btn"]');

        const [statusBtnSelector] = await ytbPage.$x('//img[@class="ytp-button status-btn"]');

        // Check if it's red and has the right title at first
        var statusBtnStyle = await ytbPage.evaluate(el => el.getAttribute('style'), statusBtnSelector);
        assert.equal(statusBtnStyle, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');

        var statusBtnTitle = await ytbPage.evaluate(el => el.getAttribute('title'), statusBtnSelector);
        assert.equal(statusBtnTitle, 'Video not stored, click to store');

        await toggleSelector.evaluate(b => b.click());

        toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, 'active');

        await ytbPage.waitForTimeout(3000); //Waiting for the video to download

        // Check if it's green and has the right title
        statusBtnStyle = await ytbPage.evaluate(el => el.getAttribute('style'), statusBtnSelector);
        assert.equal(statusBtnStyle, 'filter: invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%);');

        statusBtnTitle = await ytbPage.evaluate(el => el.getAttribute('title'), statusBtnSelector);
        assert.equal(statusBtnTitle, 'Video stored, click to delete');

        await statusBtnSelector.evaluate(b => b.click()); //Deactivate the extension

        await ytbPage.waitForTimeout(1000); //Waiting for the video to remove

        // Check if it's red since we deleted it
        var statusBtnStyle = await ytbPage.evaluate( el => el.getAttribute('style'), statusBtnSelector);
        assert.equal(statusBtnStyle, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');

        var statusBtnTitle = await ytbPage.evaluate(el => el.getAttribute('title'), statusBtnSelector);
        assert.equal(statusBtnTitle, 'Video not stored, click to store');

    }));

    it('2 new youtube and then activating', (async () => {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, null);

        const youtubeURL1 = 'https://www.youtube.com/watch?v=VULO2EL4A3Q&';
        const youtubeURL2 = 'https://www.youtube.com/watch?v=_W8Aeq3FCzE';
        
        const ytbPage1 = await browser.newPage();
        await ytbPage1.goto(youtubeURL1, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });
        await ytbPage1.waitForXPath('//img[@class="ytp-button status-btn"]');
        const [statusBtnSelector1] = await ytbPage1.$x('//img[@class="ytp-button status-btn"]');

        const ytbPage2 = await browser.newPage();
        await ytbPage2.goto(youtubeURL2, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });
        await ytbPage2.waitForXPath('//img[@class="ytp-button status-btn"]');
        const [statusBtnSelector2] = await ytbPage2.$x('//img[@class="ytp-button status-btn"]');

        // Check if it's red
        var statusBtnStyle1 = await ytbPage1.evaluate(el => el.getAttribute('style'), statusBtnSelector1);
        assert.equal(statusBtnStyle1, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');
        var statusBtnStyle2 = await ytbPage2.evaluate(el => el.getAttribute('style'), statusBtnSelector2);
        assert.equal(statusBtnStyle2, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');

        await toggleSelector.evaluate(b => b.click()); //Activate on second page

        toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, 'active');

        await ytbPage1.waitForTimeout(3000); //Waiting for the video to download on page 1
        await ytbPage2.waitForTimeout(3000); //Waiting for the video to download on page 2

        // Check if it's green
        statusBtnStyle1 = await ytbPage1.evaluate(el => el.getAttribute('style'), statusBtnSelector1);
        assert.equal(statusBtnStyle1, 'filter: invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%);');

        statusBtnStyle2 = await ytbPage2.evaluate(el => el.getAttribute('style'), statusBtnSelector2);
        assert.equal(statusBtnStyle2, 'filter: invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%);');

    }));

    it('Activate then open a new tab', (async () => {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, null);

        await toggleSelector.evaluate(b => b.click()); //Activate

        toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, 'active');

        const youtubeURL1 = 'https://www.youtube.com/watch?v=VULO2EL4A3Q&';
        
        const ytbPage1 = await browser.newPage();
        await ytbPage1.goto(youtubeURL1, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });
        await ytbPage1.waitForXPath('//img[@class="ytp-button status-btn"]');
        const [statusBtnSelector1] = await ytbPage1.$x('//img[@class="ytp-button status-btn"]');

        await ytbPage1.waitForTimeout(3000); //Waiting for the video to download on page 1

        // Check if it's green
        statusBtnStyle1 = await ytbPage1.evaluate(el => el.getAttribute('style'), statusBtnSelector1);
        assert.equal(statusBtnStyle1, 'filter: invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%);');

    }));

    it('Open a new tab without activating', (async () => {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, null);

        const youtubeURL1 = 'https://www.youtube.com/watch?v=VULO2EL4A3Q&';
        
        const ytbPage1 = await browser.newPage();
        await ytbPage1.goto(youtubeURL1, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });
        await ytbPage1.waitForXPath('//img[@class="ytp-button status-btn"]');
        const [statusBtnSelector1] = await ytbPage1.$x('//img[@class="ytp-button status-btn"]');

        //Check it's red
        var statusBtnStyle1 = await ytbPage1.evaluate(el => el.getAttribute('style'), statusBtnSelector1);
        assert.equal(statusBtnStyle1, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');
        
    }));

    it('Open a new tab without activating and then activating', (async () => {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, null);

        const youtubeURL1 = 'https://www.youtube.com/watch?v=VULO2EL4A3Q&';
        
        const ytbPage1 = await browser.newPage();
        await ytbPage1.goto(youtubeURL1, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });
        await ytbPage1.waitForXPath('//img[@class="ytp-button status-btn"]');
        const [statusBtnSelector1] = await ytbPage1.$x('//img[@class="ytp-button status-btn"]');

        //Check it's red
        var statusBtnStyle1 = await ytbPage1.evaluate(el => el.getAttribute('style'), statusBtnSelector1);
        assert.equal(statusBtnStyle1, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');
        
        //Activating
        await toggleSelector.evaluate(b => b.click()); 

        toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, 'active');

        await ytbPage1.waitForTimeout(3000); //Waiting for the video to download on page 1

        // Check if it's green
        statusBtnStyle1 = await ytbPage1.evaluate(el => el.getAttribute('style'), statusBtnSelector1);
        assert.equal(statusBtnStyle1, 'filter: invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%);');

    }));

});