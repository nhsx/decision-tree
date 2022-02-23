const assert = require('assert');

describe('Homepage', () => {
  it('should show heading', async () => {
    await browser.url(`/`);

    await expect(
      $('h1=Find assured suppliers of digital social care records')
    ).toBeExisting();
  });

  it('can complete form and see results', async () => {
    await browser.url(`/`);

    await $('a=Filter suppliers').click();

    await $('input[name="care-setting"][value="domiciliary"]').click();
    await $('a=Continue').click();

    await $('input[name="hardware"][value="no"]').click();
    await $('a=Continue').click();

    await $('input[name="capabilities"][value="work-offline"]').click();
    await $('input[name="work-offline"][value="view-care-records"]').click();
    await $('a=Continue').click();

    const text = await $('h1').getText();

    assert.ok(text.match(/^[0-9]+ of [0-9]+ suppliers match your criteria$/));
  });

  it('can skip form and see all suppliers', async () => {
    await browser.url(`/`);

    await $('a=Go straight to all suppliers').click();

    const text = await $('h1').getText();

    assert.equal(text, 'All assured suppliers of digital social care records');
  });
});
