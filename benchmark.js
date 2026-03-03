const fs = require('fs');
const { JSDOM } = require('jsdom');

// Mock HTML content based on index.html
const html = `
<!DOCTYPE html>
<html>
<body>
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="gradient-orb orb-3"></div>
</body>
</html>
`;

const dom = new JSDOM(html);
const document = dom.window.document;
const window = dom.window;

// Baseline: DOM query inside the function
function baseline() {
    let sumX = 0;
    // Simulating multiple mousemove events
    for (let i = 0; i < 10000; i++) {
        const e = { clientX: 100 + i % 100, clientY: 200 + i % 100 };
        const orbs = document.querySelectorAll('.gradient-orb');

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = (1920 / 2 - e.clientX) / speed;
            const y = (1080 / 2 - e.clientY) / speed;
            sumX += x + y;
        });
    }
    return sumX;
}

// Optimized: DOM query outside the function
const cachedOrbs = document.querySelectorAll('.gradient-orb');
function optimized() {
    let sumX = 0;
    // Simulating multiple mousemove events
    for (let i = 0; i < 10000; i++) {
        const e = { clientX: 100 + i % 100, clientY: 200 + i % 100 };

        cachedOrbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = (1920 / 2 - e.clientX) / speed;
            const y = (1080 / 2 - e.clientY) / speed;
            sumX += x + y;
        });
    }
    return sumX;
}

function runBenchmark() {
    console.log("Running baseline benchmark...");
    const startBaseline = process.hrtime.bigint();
    baseline();
    const endBaseline = process.hrtime.bigint();
    const baselineTime = Number(endBaseline - startBaseline) / 1e6; // in ms
    console.log(`Baseline time: ${baselineTime.toFixed(2)} ms`);

    console.log("Running optimized benchmark...");
    const startOptimized = process.hrtime.bigint();
    optimized();
    const endOptimized = process.hrtime.bigint();
    const optimizedTime = Number(endOptimized - startOptimized) / 1e6; // in ms
    console.log(`Optimized time: ${optimizedTime.toFixed(2)} ms`);

    const improvement = ((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2);
    console.log(`Improvement: ${improvement}% faster`);
}

runBenchmark();
