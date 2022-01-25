describe('Homepage', () => {
  it('should show heading', async () => {
    await browser.url(`/`);

    await expect(
      $('h1=Find assured suppliers of digital social care records')
    ).toBeExisting();
  });
});
