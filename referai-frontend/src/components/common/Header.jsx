import Avatar from "./Avatar";

const PAGE_TITLES = {
  opportunities: "Find Referrers",
  jobs:          "Browse Jobs",
  profile:       "Profile",
};

const THEMES = [
  { id: "light",    label: "Light",    color: "#15535f" },
  { id: "sand",     label: "Sand",     color: "#d97706" },
  { id: "forest",   label: "Forest",   color: "#059669" },
  { id: "dark",     label: "Dark",     color: "#5ec0c8" },
  { id: "midnight", label: "Midnight", color: "#89b4fa" },
  { id: "violet",   label: "Violet",   color: "#c4b5fd" },
];

const Header = ({ currentPage, user, onLogout, theme, onSetTheme }) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-app bg-[var(--surface)]/85 px-4 backdrop-blur-md md:px-8">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Refer<span className="text-[var(--primary)]">In</span></p>
        <h1 className="font-display text-base font-semibold text-main md:text-lg">{PAGE_TITLES[currentPage] ?? currentPage}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme swatches */}
        <div className="hidden items-center gap-1.5 sm:flex" title="Switch theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSetTheme(t.id)}
              title={t.label}
              aria-label={`${t.label} theme`}
              className="h-4 w-4 rounded-full transition-transform hover:scale-125"
              style={{
                background: t.color,
                boxShadow: theme === t.id ? `0 0 0 2px var(--surface), 0 0 0 3.5px ${t.color}` : "none",
              }}
            />
          ))}
        </div>

        <div className="hidden h-5 w-px bg-[var(--border)] sm:block" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold leading-tight text-main">{user?.name || "User"}</p>
            <p className="font-mono text-[10px] capitalize text-muted">{user?.role || "student"}</p>
          </div>
          <Avatar src={user?.avatar} name={user?.name} size={34} />
        </div>

        <button onClick={onLogout} className="btn-secondary px-3 py-1.5 text-xs">Sign out</button>
      </div>
    </header>
  );
};

export default Header;
