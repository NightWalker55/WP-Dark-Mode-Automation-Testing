import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { expect } from 'chai';

dotenv.config();

const WP_URL = process.env.WP_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_PASSWORD = process.env.WP_PASSWORD;

describe('WP Dark Mode Plugin Tests', function() {
  this.timeout(30000); 

  let browser, page;

  before(async () => {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();
  });

  after(async () => {
    await browser.close();
  });


  //WordPress Login

  it('Log in to WordPress', async () => {
    await page.goto(`${WP_URL}/wp-login.php`);

    
    await page.fill('#user_login', WP_USERNAME);
    await page.fill('#user_pass', WP_PASSWORD);
    await page.click('#wp-submit');

   
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    const currentURL = page.url();
    console.log('Current URL:', currentURL);
    expect(currentURL).to.include('/wp-admin/');

    const loginError = await page.$('.login-error');
    if (loginError) {
      console.error('Login failed. Error message:', await page.textContent('.login-error'));
    }
  });


  //WP Dark Mode Active Check
  it('Check if WP Dark Mode Plugin is active, install if not', async () => {
    await page.goto(`${WP_URL}/wp-admin/plugins.php`);
  
    await page.waitForSelector('tr[data-slug="wp-dark-mode"]');
  
    const isActive = await page.$('tr[data-slug="wp-dark-mode"] .deactivate');
    if (isActive) {
      console.log('WP Dark Mode plugin is already active.');
    } else {
      
      await page.click('a.upload');
      await page.setInputFiles('#pluginzip', 'path-to-your-plugin-zip');
      await page.click('#install-plugin-submit');
  
      await page.waitForSelector('tr[data-slug="wp-dark-mode"] .activate a');
      await page.click('tr[data-slug="wp-dark-mode"] .activate a');
    }
  });

  //Enable Admin Dashboard

  it('Enable Admin Dashboard Dark Mode', async () => {
    await page.goto(`${WP_URL}/wp-admin/admin.php?page=wp-dark-mode-settings`);
    await page.check('input[name="wp_dark_mode_admin_dark"]');
    await page.click('#submit');
  });

  //Validate Admin Dashboard

  it('Validate Dark Mode is working on Admin Dashboard', async () => {
    const backgroundColor = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    expect(backgroundColor).to.not.equal('rgb(255, 255, 255)'); // Ensure it's not white
  });

  // 5. Customize Floating Switch Style
  it('Customize the Floating Switch Style', async () => {
    await page.goto(`${WP_URL}/wp-admin/admin.php?page=wp-dark-mode-settings&tab=customize`);
    await page.selectOption('select[name="wp_dark_mode_switch_style"]', 'floating-style-2'); // Change style
    await page.click('#submit');
  });

  // 6. Switch Customization - Select Custom Switch size & scale it to 220
  it('Switch Customization - Custom Switch size and scale to 220', async () => {
    await page.goto(`${WP_URL}/wp-admin/admin.php?page=wp-dark-mode-settings&tab=customize`);
    await page.fill('input[name="wp_dark_mode_switch_scale"]', '220'); // Set size
    await page.click('#submit');
  });

  // 7. Change the Floating Switch Position to Left
  it('Change Floating Switch Position to Left', async () => {
    await page.goto(`${WP_URL}/wp-admin/admin.php?page=wp-dark-mode-settings&tab=customize`);
    await page.selectOption('select[name="wp_dark_mode_switch_position"]', 'left'); // Change position to left
    await page.click('#submit');
  });

  // 8. Disable Keyboard Shortcut from Accessibility Settings
  it('Disable Keyboard Shortcut from Accessibility Settings', async () => {
    await page.goto(`${WP_URL}/wp-admin/admin.php?page=wp-dark-mode-settings&tab=accessibility`);
    await page.uncheck('input[name="wp_dark_mode_keyboard_shortcut"]'); // Disable keyboard shortcut
    await page.click('#submit');
  });

  // 9. Enable Page-Transition Animation & Change Animation Effect
  it('Enable Page-Transition Animation & Change Animation Effect', async () => {
    await page.goto(`${WP_URL}/wp-admin/admin.php?page=wp-dark-mode-settings&tab=animation`);
    await page.check('input[name="wp_dark_mode_enable_animation"]'); // Enable Page-Transition Animation
    await page.selectOption('select[name="wp_dark_mode_page_transition"]', 'animation-style-2'); // Change animation effect
    await page.click('#submit');
  });

  // 10. Validate Dark Mode is working on Front End
  it('Validate Dark Mode is working on the Front End', async () => {
    await page.goto(WP_URL); // Visit the front-end page
    const isDarkModeEnabled = await page.evaluate(() => document.body.classList.contains('wp-dark-mode-enabled'));
    expect(isDarkModeEnabled).to.be.true; // Ensure dark mode is active
  });

});

