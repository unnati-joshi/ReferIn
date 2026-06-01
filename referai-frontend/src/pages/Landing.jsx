import Logo from "../components/common/Logo";

const Landing = ({ onAuth, theme, onToggleTheme }) => {
  return (
    <div className="page-bg">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="group">
          <Logo size={40} wordClassName="text-xl" className="[&_span:first-child]:transition-transform group-hover:[&_span:first-child]:-rotate-6" />
        </button>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-muted md:flex">
          <a href="#how" className="transition-colors hover:text-main">How it works</a>
          <a href="#features" className="transition-colors hover:text-main">Features</a>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onToggleTheme} className="btn-secondary px-3 py-2 text-sm" aria-label="Toggle theme">
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button onClick={() => onAuth("login")} className="hidden px-4 py-2 text-sm font-bold text-main sm:block">
            Log in
          </button>
          <button onClick={() => onAuth("signup")} className="btn-primary px-4 py-2 text-sm">
            Sign up
          </button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-10 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-16">
          <div className="flex flex-col justify-center">
            <p className="reveal mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-app bg-[var(--surface)] px-3 py-1 text-sm font-semibold text-muted shadow-[var(--shadow)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Referrals ranked by real fit
            </p>
            <h1 className="reveal reveal-1 max-w-4xl font-display text-5xl font-semibold leading-[1.0] tracking-tight text-main md:text-[5.2rem]">
              Find the person who can <span className="italic text-[var(--primary-strong)]">refer</span> you in.
            </h1>
            <p className="reveal reveal-2 mt-6 max-w-2xl text-lg leading-8 text-muted">
              Paste a job description. ReferIn ranks employees at that company by how well their background fits the role, drafts a tailored intro, and keeps track of everyone you've reached out to.
            </p>
            <div className="reveal reveal-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => onAuth("signup")} className="btn-primary px-6 py-4 text-base">
                Create account
              </button>
              <button onClick={() => onAuth("login")} className="btn-secondary px-6 py-4 text-base">
                Log in
              </button>
            </div>
          </div>

          <div className="surface card-hover reveal reveal-4 overflow-hidden p-4">
            <div className="rounded-lg border border-app soft p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-main">Stripe Backend Engineer</p>
                  <p className="text-sm text-muted">Referrer match</p>
                </div>
                <span className="badge badge-green">Ready</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["95", "Match score"],
                  ["6", "Shared skills"],
                  ["3", "Mutual paths"],
                ].map(([value, label]) => (
                  <div key={label} className="surface-flat p-4">
                    <p className="stat-num text-3xl text-main">{value}</p>
                    <p className="mt-1 text-sm text-muted">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 surface-flat p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-black text-main">Skill overlap</p>
                  <span className="badge badge-blue">Top match</span>
                </div>
                <div className="space-y-3">
                  <Progress label="Distributed systems" value="96%" />
                  <Progress label="API reliability" value="91%" />
                  <Progress label="Network fit" value="94%" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="surface-flat p-4">
                  <p className="text-sm font-black text-main">Best referrer</p>
                  <p className="mt-1 text-sm text-muted">Rahul Subramanian, Staff SWE</p>
                </div>
                <div className="surface-flat p-4">
                  <p className="text-sm font-black text-main">Intro draft</p>
                  <p className="mt-1 text-sm text-muted">Tailored to the role</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-y border-app bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-main">
              From a job posting to a warm intro, in three steps.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                ["01", "Paste the job", "Drop in any job description. We pull out the role, company, and the skills that matter."],
                ["02", "Pick a referrer", "See employees at that company ranked by how well their background fits, with your shared skills highlighted."],
                ["03", "Send and track", "Send a tailored intro in a click. ReferIn remembers who you've contacted so you never message the same person twice."],
              ].map(([num, title, body]) => (
                <div key={num} className="surface-flat card-hover p-6">
                  <span className="font-mono text-sm font-medium text-[var(--primary)]">{num}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-main">{title}</h3>
                  <p className="mt-2 leading-7 text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature title="Fit-ranked referrers" body="Live results from GitHub and AI, scored by how relevant each person's background is to the role you want." />
            <Feature title="Tailored intros" body="Get a ready-to-send message draft built from the job description and your own profile and skills." />
            <Feature title="No duplicate outreach" body="Every request is tracked, so you can see who you've already reached out to and skip them next time." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
          <div className="surface flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center"
               style={{ background: "linear-gradient(140deg, rgb(from var(--primary) r g b / 0.08), transparent 70%)" }}>
            <div>
              <p className="eyebrow">Free to use</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-main">Find your referrer for the next role.</h2>
            </div>
            <button onClick={() => onAuth("signup")} className="btn-primary px-6 py-4">
              Create account
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

const Progress = ({ label, value }) => (
  <div>
    <div className="mb-1 flex justify-between text-sm">
      <span className="font-semibold text-muted">{label}</span>
      <span className="stat-num text-main">{value}</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]">
      <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: value }} />
    </div>
  </div>
);

const Feature = ({ title, body }) => (
  <div className="surface-flat card-hover p-6">
    <h3 className="font-display text-xl font-semibold text-main">{title}</h3>
    <p className="mt-3 leading-7 text-muted">{body}</p>
  </div>
);

export default Landing;
