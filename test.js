async function runTest() {
    const puppeteer = require('puppeteer');
    const assert = require('assert');
    
    const extensionPath = 'C:/Users/Nils/Documents/MyExtension';
    let extensionPage = null;
    let browser = null;
    
    describe('Extension UI Testing', async function() {
        this.timeout(20000); // default is 2 seconds and that may not be enough to boot browsers and pages.
        before(async function() {
            await boot();
        });
        
        describe('Youtube page', async function() {
            it('Status button', async function() {
                const statusBtn = await page.evaluate(() => {
                    return document.querySelector('.status-btn');
                  });
                  extensionPage.on('console', (message) => {
                    console.log('[Page Console] }');
                  });
                /*assert.ok(inputElement, 'Input is not rendered');
                
                await extensionPage.type('[data-test-input]', 'Gokul Kathirvel');
                await extensionPage.click('[data-test-greet-button]');
                
                const greetMessage  = await extensionPage.$eval('#greetMsg', element => element.textContent)
                assert.equal(greetMessage, 'Hello, Gokul Kathirvel!', 'Greeting message is not shown');*/
            })
        });
        /*
        after(async function() {
            await browser.close();
        });*/
    });
    
    async function boot() {
        browser = await puppeteer.launch({
            headless: false, // extension are allowed only in head-full mode
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`
            ]
        });

        const dummyPage = await browser.newPage();
        await dummyPage.goto('https://www.youtube.com/watch?v=VULO2EL4A3Q');

        const targets = await browser.targets();
        const extensionTarget = targets.find(({ _targetInfo }) => {
            return _targetInfo.title === 'Youtube History Caption Search';
        });
        
        const extensionUrl = extensionTarget._targetInfo.url || '';
        const [,, extensionID] = extensionUrl.split('/');
        const extensionPopupHtml = 'popup.html'
        
        extensionPage = await browser.newPage();
        await extensionPage.goto('chrome-extension://${extensionID}/${extensionPopupHtml}');

        console.log("Extension page opened");

    }
    
}

runTest();
