---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.
---

# Web Application Testing

To test local web applications, write native Python Playwright scripts.

**Helper Scripts Available**:
- `scripts/with_server.py` - Manages server lifecycle (supports multiple servers)

**Always run scripts with `--help` first** to see usage. DO NOT read the source until you try running the script first and find that a customized solution is abslutely necessary. These scripts can be very large and thus pollute your context window. They exist to be called directly as black-box scripts rather than ingested into your context window.

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Run: python scripts/with_server.py --help
        │        Then use the helper + write simplified Playwright script
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Example: Using with_server.py

To start a server, run `--help` first, then use the helper:

**Single server:**
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
```

**Multiple servers (e.g., backend + frontend):**
```bash
python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_automation.py
```

To create an automation script, include only Playwright logic (servers are managed automatically):
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True) # Always launch chromium in headless mode
    page = browser.new_page()
    page.goto('http://localhost:5173') # Server already running and ready
    page.wait_for_load_state('networkidle') # CRITICAL: Wait for JS to execute
    # ... your automation logic
    browser.close()
```

## Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM**:
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. **Identify selectors** from inspection results

3. **Execute actions** using discovered selectors

## Common Pitfall

❌ **Don't** inspect the DOM before waiting for `networkidle` on dynamic apps
✅ **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

## Best Practices

- **Use bundled scripts as black boxes** - To accomplish a task, consider whether one of the scripts available in `scripts/` can help. These scripts handle common, complex workflows reliably without cluttering the context window. Use `--help` to see usage, then invoke directly. 
- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or IDs
- Add appropriate waits: `page.wait_for_selector()` or `page.wait_for_timeout()`

## Reference Files

- **examples/** - Examples showing common patterns:
  - `element_discovery.py` - Discovering buttons, links, and inputs on a page
  - `static_html_automation.py` - Using file:// URLs for local HTML
  - `console_logging.py` - Capturing console logs during automation

  ## When Things Break

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `net::ERR_CONNECTION_REFUSED` | Server not ready | Increase wait time in with_server.py, port mismatch |
| Selector not found | Page not fully rendered | Add `page.wait_for_selector()` with timeout |
| Blank screenshot | JS failed silently | Capture console logs FIRST, check for errors |
| Stale element reference | DOM re-rendered after query | Re-query the element just before interaction |

# Capture console errors during test
page.on("console", lambda msg: print(f"[{msg.type}] {msg.text}"))
page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))

--timeout 30        # Max seconds to wait for server to respond on port
--health-path "/"   # Endpoint to poll for readiness (default: /)

# Add to best practices:
from playwright.sync_api import expect

expect(page.locator('h1')).to_have_text('Memento Lens')
expect(page.locator('.nudge-toast')).to_be_visible()


# what you'd write using this toolkit

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Capture any JS errors
    page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
    
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    
    # 1. Verify app loaded
    assert page.locator('h1').text_content() == 'Memento Lens'
    
    # 2. Quick Capture: find the mic button
    mic_button = page.locator('button:has-text("Capture")')
    assert mic_button.is_visible()
    
    # 3. If speech unsupported, text fallback should appear
    # (Take screenshot to verify UI state)
    page.screenshot(path='/tmp/initial_state.png')
    
    # 4. Type a memory manually (fallback path)
    text_input = page.locator('input[placeholder*="thought"]')
    text_input.fill("Buy milk at the pharmacy")
    page.keyboard.press('Enter')
    
    # 5. Wait for extraction to complete
    page.wait_for_selector('.memory-card', timeout=10000)
    
    # 6. Verify it appears in feed
    feed_items = page.locator('.memory-card')
    assert feed_items.count() >= 1
    
    # 7. Test simulation panel
    page.locator('select[aria-label*="Location"]').select_option('Pharmacy')
    
    # 8. Nudge should appear
    page.wait_for_selector('.nudge-toast', timeout=5000)
    assert page.locator('.nudge-toast').is_visible()
    
    page.screenshot(path='/tmp/nudge_triggered.png')
    browser.close()