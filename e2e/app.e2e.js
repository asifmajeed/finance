describe('Finance Tracker App', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch app successfully', async () => {
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should display welcome message on home screen', async () => {
    await expect(element(by.text('Welcome to Finance Tracker'))).toBeVisible();
  });

  it('should navigate to Budgets tab', async () => {
    await element(by.text('Budgets')).tap();
    await expect(element(by.id('budgets-screen'))).toBeVisible();
  });

  it('should navigate to Analysis tab', async () => {
    await element(by.text('Analysis')).tap();
    await expect(element(by.id('analysis-screen'))).toBeVisible();
  });

  it('should navigate to Settings tab', async () => {
    await element(by.text('Settings')).tap();
    await expect(element(by.id('settings-screen'))).toBeVisible();
  });
});
