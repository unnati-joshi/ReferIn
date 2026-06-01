import Avatar from "./Avatar";
import { LogoMark } from "./Logo";

const navByRole = {
  employee: [
    { id: "opportunities", label: "Opportunities", hint: "Find referrers for a role", icon: "M12 2 3 7v6c0 5 9 9 9 9s9-4 9-9V7z" },
    { id: "jobs",          label: "Browse Jobs",   hint: "Search job listings",      icon: "M3 7h18v13H3zM8 7V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" },
    { id: "profile",       label: "Profile",       hint: "Skills, resume, preferences", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0" },
  ],
};

const Sidebar = ({ setPage, currentPage, user }) => {
  const navItems = navByRole[user?.role] || navByRole.employee;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-app bg-[var(--surface)] px-4 py-6 lg:flex lg:flex-col">
      {/* Brand */}
      <div className="mb-9 flex items-center gap-3 px-2">
        <LogoMark size={38} />
        <div>
          <p className="font-display text-base font-semibold tracking-tight text-main">Refer<span className="text-[var(--primary)]">In</span></p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Referral intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition-all ${
                active
                  ? "bg-[rgb(from_var(--primary)_r_g_b_/_0.1)]"
                  : "text-muted hover:bg-[var(--surface-soft)] hover:text-main"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--primary)]" />
              )}
              <svg
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-[var(--primary)]" : "text-faint group-hover:text-muted"}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d={item.icon} />
              </svg>
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${active ? "text-[var(--primary)]" : ""}`}>{item.label}</span>
                <span className="mt-0.5 block text-[10px] text-muted">{item.hint}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer card */}
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] p-3">
        <div className="flex items-center gap-2.5">
          <Avatar src={user?.avatar} name={user?.name} size={32} />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-main">{user?.name || "Student"}</p>
            <p className="truncate text-[10px] text-muted">{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
