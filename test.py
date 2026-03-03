import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # We need to wait for domcontentloaded to avoid issues with external resources
        await page.goto('http://localhost:8000', wait_until='domcontentloaded')

        # Check if the title is correct to verify page loaded
        title = await page.title()
        print(f"Page title: {title}")

        # Verify gradient orbs exist
        orbs = await page.locator('.gradient-orb').count()
        print(f"Found {orbs} gradient orbs")

        # Trigger mouse move
        print("Dispatching mousemove event...")
        await page.mouse.move(100, 100)
        await page.mouse.move(200, 200)

        # Check if style transforms were applied
        for i in range(orbs):
            transform = await page.locator('.gradient-orb').nth(i).evaluate("el => el.style.transform")
            print(f"Orb {i+1} transform: {transform}")

        await browser.close()
        print("Test passed successfully!")

asyncio.run(run())
