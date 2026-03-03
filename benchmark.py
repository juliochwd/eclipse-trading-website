import asyncio
from playwright.async_api import async_playwright
import time
import subprocess

async def main():
    # Start local server
    server = subprocess.Popen(["python", "-m", "http.server", "8000"])

    # Wait for server to start
    await asyncio.sleep(2)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Open page
        await page.goto("http://localhost:8000/index.html")

        # Inject benchmark function
        result = await page.evaluate("""() => {
            return new Promise(resolve => {
                // Find the elements

                // We will measure how long it takes to execute animateOnScroll 1000 times
                // Or simulate scroll events

                const start = performance.now();
                for (let i = 0; i < 1000; i++) {
                    // Try to trigger the event listener instead to be more realistic,
                    // but calling the function directly is easier if we have access to it.
                    // Since animateOnScroll is not globally exposed, we will just copy its logic.

                    const elements = document.querySelectorAll('.feature-card, .pricing-card, .step, .performance-card');
                    elements.forEach(element => {
                        const elementTop = element.getBoundingClientRect().top;
                        const elementVisible = 150;
                        if (elementTop < window.innerHeight - elementVisible) {
                            element.style.opacity = '1';
                            element.style.transform = 'translateY(0)';
                        }
                    });
                }
                const end = performance.now();
                resolve(end - start);
            });
        }""")

        print(f"Baseline Time for 1000 executions: {result:.2f}ms")

        await browser.close()

    server.terminate()

asyncio.run(main())
