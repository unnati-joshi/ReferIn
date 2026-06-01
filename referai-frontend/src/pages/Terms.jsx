import { LogoMark } from "../components/common/Logo";

const SECTIONS = [
  {
    h: "1. Acceptance of terms",
    p: "By creating a ReferIn account or using the service, you agree to these Terms. If you do not agree, do not create an account or use ReferIn.",
  },
  {
    h: "2. What ReferIn does",
    p: "ReferIn helps you find employees who may be able to refer you to a role. It parses job descriptions, ranks potential referrers by how well their public background fits the role, drafts an introductory message, and lets you track the requests you send. ReferIn does not employ these people, does not control their responses, and does not guarantee a referral, interview, or job.",
  },
  {
    h: "3. Your account",
    p: "You are responsible for the accuracy of the information on your profile and for keeping your login details secure. Provide a real email and phone number; we use the phone number for verification. You must be old enough to enter a binding contract in your jurisdiction.",
  },
  {
    h: "4. Acceptable use",
    p: "Use ReferIn to support your own genuine job search. Do not use it to spam, harass, or mass-message people, to scrape or resell data, or to misrepresent your identity or qualifications. Outreach you send is your responsibility; be respectful and honest.",
  },
  {
    h: "5. Your content and data",
    p: "When you upload a resume or fill in your profile, you grant ReferIn permission to process that content to provide the service (for example, extracting skills and drafting messages). Your uploaded resume and profile belong to you, and you can edit or remove that information from your profile at any time.",
  },
  {
    h: "6. Third-party information",
    p: "Referrer and job results are drawn from public sources and third-party providers (such as public GitHub profiles and job-search APIs). This information may be incomplete or out of date, and is provided as-is. Always verify a person's details before reaching out.",
  },
  {
    h: "7. No guarantee of outcomes",
    p: "Match scores and rankings are estimates to help you prioritize, not promises. ReferIn does not guarantee that any referrer will respond, that a referral will be made, or that you will be hired.",
  },
  {
    h: "8. Limitation of liability",
    p: "ReferIn is provided on a best-effort basis without warranties of any kind. To the extent permitted by law, ReferIn is not liable for any indirect or consequential loss arising from your use of the service or from interactions with referrers or employers.",
  },
  {
    h: "9. Changes to these terms",
    p: "We may update these Terms as the product evolves. Continued use after an update means you accept the revised Terms.",
  },
  {
    h: "10. Contact",
    p: "Questions about these Terms can be raised through your account or with the team operating this ReferIn instance.",
  },
];

const Terms = ({ onClose, onAgree }) => (
  <div className="page-bg fixed inset-0 z-50 overflow-y-auto animate-fade-in">
    <header className="sticky top-0 z-10 border-b border-app bg-[var(--surface)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <LogoMark size={34} />
          <span className="font-display text-lg font-semibold tracking-tight text-main">
            Refer<span className="text-[var(--primary)]">In</span>
          </span>
        </div>
        <button onClick={onClose} className="btn-secondary px-3.5 py-2 text-sm">Close</button>
      </div>
    </header>

    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-main">Terms &amp; Conditions</h1>
      <p className="mt-3 text-sm text-muted">
        Please read these terms before creating an account. They describe what ReferIn does and the basis on which you may use it.
      </p>

      <div className="mt-8 space-y-7">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-semibold text-main">{s.h}</h2>
            <p className="mt-2 leading-7 text-muted">{s.p}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-app pt-6 sm:flex-row">
        {onAgree && (
          <button onClick={onAgree} className="btn-primary px-6 py-3 text-sm">
            I agree, continue
          </button>
        )}
        <button onClick={onClose} className="btn-secondary px-6 py-3 text-sm">Back</button>
      </div>
    </main>
  </div>
);

export default Terms;
