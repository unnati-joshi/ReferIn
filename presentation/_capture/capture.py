"""Headless capture of the ReferIn 'Find referrers' flow against the curated
database fallback (GitHub source disabled). Drives the real React UI via the
Chrome DevTools Protocol so the screenshots are authentic.

Prereqs (started by run_capture.sh):
  - backend on :5000   - vite dev on :5173   - chrome --remote-debugging-port=9222
"""
import os, time, sys
import pychrome

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
os.makedirs(OUT, exist_ok=True)

DEMO_EMAIL = "demo@referin.app"
DEMO_PASS = "referin123"

STRIPE_JD = """Backend Engineer at Stripe

Stripe is looking for a Backend Engineer to build and scale the payment
infrastructure that powers millions of businesses. You will design
distributed systems, build resilient REST and gRPC APIs, and own services
end to end.

What you will do:
- Design and operate distributed payment services at scale
- Build low latency APIs in Go and Python
- Work with PostgreSQL, Redis, and Kafka in production

What we look for:
- Strong fundamentals in distributed systems
- Experience with Go, Python, PostgreSQL, Redis, Kafka, gRPC
- A track record of shipping reliable backend services

Location: Bengaluru, India
"""


def main():
    browser = pychrome.Browser(url="http://127.0.0.1:9222")
    tab = browser.new_tab()
    tab.start()
    tab.Page.enable()
    tab.Runtime.enable()
    tab.DOM.enable()

    def ev(js, await_promise=False):
        r = tab.Runtime.evaluate(expression=js, returnByValue=True,
                                 awaitPromise=await_promise)
        return r.get("result", {}).get("value")

    def wait_for(js, timeout=60, label=""):
        end = time.time() + timeout
        while time.time() < end:
            try:
                if ev(js):
                    return True
            except Exception:
                pass
            time.sleep(0.4)
        raise TimeoutError(f"wait_for timed out: {label or js}")

    # React-safe value setter: native setter + input/change events.
    SET_VALUE = """
    function(sel, val){
      const el = document.querySelector(sel);
      if(!el) return false;
      const proto = el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto,'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    }
    """

    def set_value(sel, val):
        js = f"({SET_VALUE})({sel!r}, {val!r})"
        return ev(js)

    def click_text(text):
        js = """
        (function(t){
          const els = [...document.querySelectorAll('button,a')];
          const el = els.find(e => e.textContent.trim().toLowerCase().startsWith(t.toLowerCase()));
          if(el){ el.click(); return true; }
          return false;
        })(%r)
        """ % text
        return ev(js)

    import base64

    def shoot(name):
        data = tab.Page.captureScreenshot(format="png", captureBeyondViewport=False,
                                          fromSurface=True)
        path = os.path.join(OUT, name)
        with open(path, "wb") as f:
            f.write(base64.b64decode(data["data"]))
        print("  saved", path)

    def scroll_to_results():
        ev("""
           (function(){
             const sec=[...document.querySelectorAll('section')]
               .find(s=>s.className.includes('1fr_420px'));
             if(sec){ window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY - 90); }
           })()
           """)

    print("navigate landing")
    tab.Page.navigate(url="http://localhost:5173")
    wait_for("document.readyState === 'complete'", 30, "page load")
    wait_for("[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Log in')",
             30, "landing rendered")

    print("open login")
    click_text("Log in")
    wait_for("!!document.querySelector('input[type=email]')", 20, "login form")
    time.sleep(0.4)

    print("fill credentials")
    set_value("input[type=email]", DEMO_EMAIL)
    set_value("input[type=password]", DEMO_PASS)
    time.sleep(0.3)
    # Submit is the primary button (the segment toggles are type=button)
    clicked = ev("""
       (function(){
         let b=document.querySelector('form button.btn-primary');
         if(!b) b=[...document.querySelectorAll('form button')]
           .filter(x=>x.getAttribute('type')!=='button')
           .find(x=>x.textContent.trim().toLowerCase().startsWith('log in'));
         if(b){ b.click(); return true; }
         return false;
       })()
       """)
    print("  submit clicked:", clicked)
    time.sleep(1.0)
    err = ev("(document.querySelector('form .text-rose-600')||{}).textContent || ''")
    if err:
        print("  login error:", err)
    wait_for("!!document.querySelector('#job-desc')", 30, "app loaded")
    print("logged in")
    time.sleep(0.6)

    print("paste JD + search")
    set_value("#job-desc", STRIPE_JD)
    time.sleep(0.4)
    click_text("Find referrers")
    # Wait for the parsed job pill + result cards
    wait_for("[...document.querySelectorAll('*')].some(e=>e.textContent.trim()==='From database')",
             90, "db results")
    wait_for("document.querySelectorAll('.stat-num').length > 1", 30, "match cards")
    print("results rendered; waiting for message draft")
    # Wait for the message textarea (not the JD one) to fill in
    try:
        wait_for("""
          (function(){
            const tas=[...document.querySelectorAll('textarea')];
            return tas.some(t=>t.id!=='job-desc' && (t.value||'').length>40);
          })()
        """, 60, "message draft")
    except TimeoutError:
        print("  (message draft slow; capturing anyway)")
    time.sleep(1.2)

    # Fixed framing viewport for slide-ready shots.
    tab.Emulation.setDeviceMetricsOverride(width=1480, height=1150,
                                           deviceScaleFactor=2, mobile=False)
    time.sleep(0.4)

    ev("window.scrollTo(0,0)")
    time.sleep(0.6)
    print("capture search/top view")
    shoot("03-find-search.png")

    scroll_to_results()
    time.sleep(0.6)
    print("capture results + detail panel")
    shoot("03-find-referrers.png")

    tab.stop()
    browser.close_tab(tab)
    print("DONE")


if __name__ == "__main__":
    main()
