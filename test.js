const puppeteer = require('puppeteer');
const assert = require('assert');
let browser, page;

const puppeteerArgs = [
    `--disable-extensions-except=${__dirname}`,
    `--load-extension=${__dirname}`,
    '--disable-features=DialMediaRouteProvider',
    '--mute-audio'
];

describe('Extension', async function() {    

    before(async function () {
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

    after(async function() {
        await browser.close();
      });

    it('Title name', async function() {
  
        const titleSelector = await page.$x("/html/head/title");

        const title = await page.evaluate(el => el.textContent, titleSelector[0])
        assert.equal(title, 'Youtube History Caption Search');
    });

    it('Toggle switch class name', async function() {
        const toggleSelector = await page.$x('/html/body/div/label/span');

        const toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector[0]);
        assert.equal(toggleClass, 'slider');

    });

    it('Toggle switch', async function() {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, null);

        await toggleSelector.evaluate(b => b.click());

        toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, 'active');

        const extension_enabled = await page.evaluate(() => {
            return new Promise((resolve) => {
            chrome.storage.local.get('extension_enabled', (result) => {
                resolve(result.extension_enabled);
            });
            });
        });
        assert.equal(extension_enabled, '1');

    });

    it('Activating deactivating status button + storage', async () => {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        await toggleSelector.evaluate(b => b.click());

        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, '');
      
        const youtubeURL = 'https://www.youtube.com/watch?v=C7OQHIpDlvA';
      
        const ytbPage = await browser.newPage();
        await ytbPage.goto(youtubeURL, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });
        await ytbPage.bringToFront();
      
        await ytbPage.waitForXPath('//img[@class="ytp-button status-btn"]');
        
        var [statusBtnSelector] = await ytbPage.$x('//img[@class="ytp-button status-btn"]');
      
        // Check if it's red and has the right title at first
        var statusBtnStyle = await ytbPage.evaluate(el => el.getAttribute('style'), statusBtnSelector);
        assert.equal(statusBtnStyle, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');
      
        var statusBtnTitle = await ytbPage.evaluate(el => el.getAttribute('title'), statusBtnSelector);
        assert.equal(statusBtnTitle, 'Video not stored, click to store');
      
        await toggleSelector.evaluate(b => b.click());
      
        toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, 'active');
      
        await ytbPage.waitForTimeout(3000); // Waiting for the video to download

        var [statusBtnSelector] = await ytbPage.$x('//img[@class="ytp-button status-btn"]');

        // Check if it's green and has the right title
        var statusBtnStyle = await ytbPage.evaluate( el => el.getAttribute('style'), statusBtnSelector);
        assert.equal(statusBtnStyle, 'filter: invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%);');
      
        var statusBtnTitle = await ytbPage.evaluate(el => el.getAttribute('title'), statusBtnSelector);
        assert.equal(statusBtnTitle, 'Video stored, click to delete');

        //Checking that it stored well
        const stored_vid = await page.evaluate(() => {
            return new Promise((resolve) => {
            chrome.storage.local.get('history_videos', (result) => {
                resolve(result.history_videos);
            });
            });
        });

        const testString = '"[{"id":"C7OQHIpDlvA","url":"https://www.youtube.com/watch?v=C7OQHIpDlvA","duration":60,"title":"The Wait  - 1 Minute Short Film | Award Winning","channel":"Morphine","captions":["00:00","yeah bro we got away to this a pen and","00:02","make is over yeah I\'ll see you","00:06","later in like two months","00:31","[Music]"],"recentDateWatched":"2023-06-10T18:24:49.816Z"}]"'.split('"recentDateWatched"')[0];
        assert.equal(stored_vid.split('"recentDateWatched"')[0], testString);

        var [statusBtnSelector] = await ytbPage.$x('//img[@class="ytp-button status-btn"]');
        await statusBtnSelector.evaluate(b => b.click()); //Click on status btn to remove vid
        await ytbPage.waitForTimeout(1000); //Waiting for the video to remove

        // Check if it's red since we deleted it
        var statusBtnStyle = await ytbPage.evaluate( el => el.getAttribute('style'), statusBtnSelector);
        assert.equal(statusBtnStyle, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');

        var statusBtnTitle = await ytbPage.evaluate(el => el.getAttribute('title'), statusBtnSelector);
        assert.equal(statusBtnTitle, 'Video not stored, click to store');

        //Checking that it stored well
        const delete_vid = await page.evaluate(() => {
            return new Promise((resolve) => {
            chrome.storage.local.get('history_videos', (result) => {
                resolve(result.history_videos);
            });
            });
        });

        const emptyArrayString = '[]'; 
        assert.equal(delete_vid, emptyArrayString);

        await ytbPage.close();

        await toggleSelector.evaluate(b => b.click());

        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
            assert.equal(toggleClass, '');

    });

    it('2 new youtube and then activating', async function() {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, '');

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

        await ytbPage2.close();
        await ytbPage1.close();

        await toggleSelector.evaluate(b => b.click());

        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
            assert.equal(toggleClass, '');

    });

    it('Activate then open a new tab', async function() {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, '');

        await toggleSelector.evaluate(b => b.click()); //Activate

        toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, 'active');

        const youtubeURL1 = 'https://www.youtube.com/watch?v=s7qbW83Pdbc';
        
        const ytbPage1 = await browser.newPage();
        await ytbPage1.goto(youtubeURL1, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });
        await ytbPage1.waitForXPath('//img[@class="ytp-button status-btn"]');
        const [statusBtnSelector1] = await ytbPage1.$x('//img[@class="ytp-button status-btn"]');

        await ytbPage1.waitForTimeout(3000); //Waiting for the video to download on page 1

        // Check if it's green
        statusBtnStyle1 = await ytbPage1.evaluate(el => el.getAttribute('style'), statusBtnSelector1);
        assert.equal(statusBtnStyle1, 'filter: invert(58%) sepia(64%) saturate(2319%) hue-rotate(78deg) brightness(114%) contrast(131%);');

        await ytbPage1.close();

        await toggleSelector.evaluate(b => b.click());

        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
            assert.equal(toggleClass, '');

    });

    it('Open a new tab without activating', async function() {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, '');

        const youtubeURL1 = 'https://www.youtube.com/watch?v=HXL5npG5yGQ';
        
        const ytbPage1 = await browser.newPage();
        await ytbPage1.goto(youtubeURL1, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 0 });
        await ytbPage1.waitForXPath('//img[@class="ytp-button status-btn"]');
        const [statusBtnSelector1] = await ytbPage1.$x('//img[@class="ytp-button status-btn"]');

        //Check it's red
        var statusBtnStyle1 = await ytbPage1.evaluate(el => el.getAttribute('style'), statusBtnSelector1);
        assert.equal(statusBtnStyle1, 'filter: invert(12%) sepia(78%) saturate(7358%) hue-rotate(2deg) brightness(97%) contrast(116%);');
        
        await ytbPage1.close();

        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
            assert.equal(toggleClass, '');
    });

    it('Open a new tab without activating and then activating', async function() {
        
        const [toggleSelector] = await page.$x('//*[@id="toggleButton"]');
        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
        assert.equal(toggleClass, '');

        const youtubeURL1 = 'https://www.youtube.com/watch?v=2I3zVgTNTQk';
        
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

        await ytbPage1.close();

        await toggleSelector.evaluate(b => b.click());

        var toggleClass = await page.evaluate(el => el.getAttribute('class'), toggleSelector);
            assert.equal(toggleClass, '');
    });

});