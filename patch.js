const fs = require('fs');
const content = fs.readFileSync('script.js', 'utf8');

const targetStr = `    // Add parallax effect to gradient orbs
    window.addEventListener('mousemove', function(e) {
        const orbs = document.querySelectorAll('.gradient-orb');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = (window.innerWidth / 2 - e.clientX) / speed;
            const y = (window.innerHeight / 2 - e.clientY) / speed;

            orb.style.transform = \`translate(\${x}px, \${y}px)\`;
        });
    });`;

const replacementStr = `    // Add parallax effect to gradient orbs
    const orbs = document.querySelectorAll('.gradient-orb');
    window.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = (window.innerWidth / 2 - e.clientX) / speed;
            const y = (window.innerHeight / 2 - e.clientY) / speed;

            orb.style.transform = \`translate(\${x}px, \${y}px)\`;
        });
    });`;

if (!content.includes(targetStr)) {
    console.error("Target string not found in script.js");
    process.exit(1);
}

const newContent = content.replace(targetStr, replacementStr);
fs.writeFileSync('script.js', newContent);
console.log("Patched script.js successfully");
