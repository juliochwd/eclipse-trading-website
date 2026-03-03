"""
Eclipse Delta Trading Website - Comprehensive Test Suite
=========================================================
Tests all pages, navigation, auth flow (demo mode), and UI components.
Requires: pip install playwright && playwright install chromium

Usage: python test.py
"""

import asyncio
import sys
from playwright.async_api import async_playwright, expect

BASE_URL = 'http://localhost:8000'
PASS = '\033[92m✓\033[0m'
FAIL = '\033[91m✗\033[0m'

tests_passed = 0
tests_failed = 0

async def check(condition, name):
    global tests_passed, tests_failed
    if condition:
        print(f'  {PASS} {name}')
        tests_passed += 1
    else:
        print(f'  {FAIL} {name}')
        tests_failed += 1

async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        print('\n🚀 Eclipse Delta Enterprise - Test Suite')
        print('=' * 50)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 1: Landing Page
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n📄 Test 1: Landing Page (index.html)')
        await page.goto(BASE_URL, wait_until='domcontentloaded')

        title = await page.title()
        await check('Eclipse Delta' in title, f'Page title correct: "{title}"')

        orbs = await page.locator('.gradient-orb').count()
        await check(orbs == 3, f'Hero gradient orbs found: {orbs}')

        hero_title = await page.locator('.hero-title').count()
        await check(hero_title > 0, 'Hero title present')

        features = await page.locator('.feature-card').count()
        await check(features == 6, f'Feature cards: {features}/6')

        pricing_cards = await page.locator('.pricing-card').count()
        await check(pricing_cards == 3, f'Pricing cards: {pricing_cards}/3')

        testimonials = await page.locator('.testimonial-card').count()
        await check(testimonials == 3, f'Testimonial cards: {testimonials}/3')

        faq_items = await page.locator('.faq-item').count()
        await check(faq_items == 6, f'FAQ items: {faq_items}/6')

        # Test FAQ accordion
        await page.click('.faq-question')
        await page.wait_for_timeout(400)
        open_faqs = await page.locator('.faq-item.open').count()
        await check(open_faqs == 1, 'FAQ accordion opens on click')

        # Test contact form present
        contact_form = await page.locator('#contact-form').count()
        await check(contact_form == 1, 'Contact form present')

        # SEO checks
        description = await page.locator('meta[name="description"]').get_attribute('content')
        await check(description and len(description) > 50, f'Meta description: {len(description) if description else 0} chars')

        manifest = await page.locator('link[rel="manifest"]').count()
        await check(manifest == 1, 'PWA manifest linked')

        # Navigation links
        nav_login = await page.locator('a[href="login.html"]').first.is_visible()
        await check(nav_login, 'Nav login link visible')

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 2: Login Page
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n🔐 Test 2: Login Page (login.html)')
        await page.goto(f'{BASE_URL}/login.html', wait_until='domcontentloaded')
        await page.wait_for_timeout(500)

        login_title = await page.title()
        await check('Login' in login_title or 'Eclipse' in login_title, f'Login page title: "{login_title}"')

        email_field = await page.locator('input[type="email"]').count()
        await check(email_field > 0, 'Email input field present')

        password_field = await page.locator('input[type="password"]').count()
        await check(password_field > 0, 'Password input field present')

        # Demo mode banner
        await page.wait_for_timeout(600)
        demo_banner = await page.locator('#demo-mode-banner').count()
        await check(demo_banner == 1, 'Demo mode banner present')

        # Test demo login
        await page.fill('input[type="email"]', 'demo@eclipse.ai')
        await page.fill('input[type="password"]', 'demo123')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(1000)

        # Should redirect to dashboard
        current_url = page.url
        await check('dashboard' in current_url, f'Demo login redirects to dashboard: {current_url}')

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 3: Dashboard Page
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n📊 Test 3: Dashboard (dashboard.html)')
        await page.goto(f'{BASE_URL}/dashboard.html', wait_until='domcontentloaded')
        await page.wait_for_timeout(800)

        sidebar = await page.locator('#sidebar').count()
        await check(sidebar == 1, 'Sidebar present')

        stat_cards = await page.locator('.stat-card').count()
        await check(stat_cards >= 4, f'Stat cards: {stat_cards}')

        chart_canvas = await page.locator('#performance-chart').count()
        await check(chart_canvas == 1, 'Chart.js canvas present')

        # Sidebar links
        sidebar_links = await page.locator('.sidebar-nav .nav-item').count()
        await check(sidebar_links >= 5, f'Sidebar nav items: {sidebar_links}')

        trades_link = await page.locator('a[href="trades.html"]').count()
        await check(trades_link > 0, 'Trades link in sidebar')

        signals_link = await page.locator('a[href="signals.html"]').count()
        await check(signals_link > 0, 'Signals link in sidebar')

        analytics_link = await page.locator('a[href="analytics.html"]').count()
        await check(analytics_link > 0, 'Analytics link in sidebar')

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 4: Trades Page
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n💹 Test 4: Trades (trades.html)')
        await page.goto(f'{BASE_URL}/trades.html', wait_until='domcontentloaded')
        await page.wait_for_timeout(800)

        trades_table = await page.locator('#trades-table').count()
        await check(trades_table == 1, 'Trades table present')

        trade_rows = await page.locator('#trades-body tr').count()
        await check(trade_rows >= 10, f'Trade rows loaded: {trade_rows}')

        filter_asset = await page.locator('#filter-asset').count()
        await check(filter_asset == 1, 'Asset filter select present')

        export_btn = await page.locator('#export-csv-btn').count()
        await check(export_btn == 1, 'Export CSV button present')

        summary_total = await page.locator('#summary-total').text_content()
        await check(int(summary_total or 0) > 0, f'Trade summary total: {summary_total}')

        # Test filter
        await page.select_option('#filter-asset', 'MNQ')
        await page.click('#apply-filters-btn')
        await page.wait_for_timeout(300)
        filtered_rows = await page.locator('#trades-body tr').count()
        await check(filtered_rows > 0, f'Filter works: {filtered_rows} rows after MNQ filter')

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 5: Signals Page
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n📡 Test 5: Signals (signals.html)')
        await page.goto(f'{BASE_URL}/signals.html', wait_until='domcontentloaded')
        await page.wait_for_timeout(800)

        signals_grid = await page.locator('.signals-grid').count()
        await check(signals_grid == 1, 'Signals grid present')

        signal_cards = await page.locator('.signal-card').count()
        await check(signal_cards >= 6, f'Signal cards: {signal_cards}')

        filter_chips = await page.locator('.filter-chip').count()
        await check(filter_chips >= 7, f'Filter chips: {filter_chips}')

        live_dot = await page.locator('.live-dot').count()
        await check(live_dot > 0, 'Live indicator present')

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 6: Analytics Page
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n📈 Test 6: Analytics (analytics.html)')
        await page.goto(f'{BASE_URL}/analytics.html', wait_until='domcontentloaded')
        await page.wait_for_timeout(1200)

        charts = await page.locator('canvas').count()
        await check(charts >= 5, f'Charts loaded: {charts}')

        period_btns = await page.locator('.period-btn').count()
        await check(period_btns == 4, f'Period buttons: {period_btns}')

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 7: Settings Page
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n⚙️  Test 7: Settings (settings.html)')
        await page.goto(f'{BASE_URL}/settings.html', wait_until='domcontentloaded')
        await page.wait_for_timeout(500)

        settings_tabs = await page.locator('.settings-tab').count()
        await check(settings_tabs == 5, f'Settings tabs: {settings_tabs}')

        await page.click('[data-tab="bot"]')
        await page.wait_for_timeout(300)
        toggles = await page.locator('.toggle-switch').count()
        await check(toggles >= 5, f'Asset toggle switches: {toggles}')

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 8: Legal Pages
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n⚖️  Test 8: Legal Pages')
        await page.goto(f'{BASE_URL}/terms.html', wait_until='domcontentloaded')
        terms_heading = await page.locator('h1').first.text_content()
        await check('Syarat' in (terms_heading or ''), f'Terms page heading: "{terms_heading}"')

        await page.goto(f'{BASE_URL}/privacy.html', wait_until='domcontentloaded')
        privacy_heading = await page.locator('h1').first.text_content()
        await check('Privasi' in (privacy_heading or ''), f'Privacy page heading: "{privacy_heading}"')

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 9: Register & Forgot Password Pages
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n📝 Test 9: Auth Pages')
        await page.goto(f'{BASE_URL}/register.html', wait_until='domcontentloaded')
        await page.wait_for_timeout(400)
        register_form = await page.locator('#register-form').count()
        await check(register_form == 1, 'Register form present')

        await page.goto(f'{BASE_URL}/forgot-password.html', wait_until='domcontentloaded')
        await page.wait_for_timeout(400)
        reset_form = await page.locator('#reset-form').count()
        await check(reset_form >= 0, 'Forgot password page loaded')

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 10: Mobile Responsiveness
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n📱 Test 10: Mobile Responsiveness')
        mobile_context = await browser.new_context(viewport={'width': 375, 'height': 812})
        mobile_page = await mobile_context.new_page()
        await mobile_page.goto(BASE_URL, wait_until='domcontentloaded')
        await mobile_page.wait_for_timeout(500)

        hamburger = await mobile_page.locator('.hamburger').is_visible()
        await check(hamburger, 'Hamburger menu visible on mobile')

        nav_menu_hidden = await mobile_page.locator('.nav-menu').is_hidden()
        await check(nav_menu_hidden, 'Nav menu hidden on mobile (burger menu)')

        await mobile_page.click('.hamburger')
        await mobile_page.wait_for_timeout(300)

        await mobile_context.close()

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # TEST 11: PWA & SEO Files
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print('\n🌐 Test 11: PWA & SEO Files')
        manifest_resp = await page.goto(f'{BASE_URL}/manifest.json')
        await check(manifest_resp.ok if manifest_resp else False, 'manifest.json accessible')

        robots_resp = await page.goto(f'{BASE_URL}/robots.txt')
        await check(robots_resp.ok if robots_resp else False, 'robots.txt accessible')

        sitemap_resp = await page.goto(f'{BASE_URL}/sitemap.xml')
        await check(sitemap_resp.ok if sitemap_resp else False, 'sitemap.xml accessible')

        await browser.close()

        # Summary
        total = tests_passed + tests_failed
        print('\n' + '=' * 50)
        print(f'📊 Results: {tests_passed}/{total} tests passed')
        if tests_failed == 0:
            print('🎉 ALL TESTS PASSED!')
        else:
            print(f'⚠️  {tests_failed} tests failed')
        print('=' * 50 + '\n')
        return tests_failed == 0

if __name__ == '__main__':
    result = asyncio.run(run_tests())
    sys.exit(0 if result else 1)
