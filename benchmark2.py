import asyncio
from playwright.async_api import async_playwright
import time
import subprocess

async def main():
    server = subprocess.Popen(["python", "-m", "http.server", "8000"])
    await asyncio.sleep(2)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto("http://localhost:8000/index.html")

        # Test uncached
        uncached = await page.evaluate("""() => {
            return new Promise(resolve => {
                const start = performance.now();
                for (let i = 0; i < 1000; i++) {
                    const elements = document.querySelectorAll('.feature-card, .pricing-card, .step, .performance-card');
                    elements.forEach(element => {
                        const elementTop = element.getBoundingClientRect().top;
                        const elementVisible = 150;
                        if (elementTop < window.innerHeight - elementVisible) {
                            // nothing
                        }
                    });
                }
                const end = performance.now();
                resolve(end - start);
            });
        }""")

        # Test cached
        cached = await page.evaluate("""() => {
            return new Promise(resolve => {
                const elements = document.querySelectorAll('.feature-card, .pricing-card, .step, .performance-card');
                const start = performance.now();
                for (let i = 0; i < 1000; i++) {
                    elements.forEach(element => {
                        const elementTop = element.getBoundingClientRect().top;
                        const elementVisible = 150;
                        if (elementTop < window.innerHeight - elementVisible) {
                            // nothing
                        }
                    });
                }
                const end = performance.now();
                resolve(end - start);
            });
        }""")

        print(f"Uncached Time: {uncached:.2f}ms")
        print(f"Cached Time: {cached:.2f}ms")
        print(f"Improvement: {(uncached - cached) / uncached * 100:.2f}%")

        await browser.close()

    server.terminate()

asyncio.run(main())
