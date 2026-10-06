import { UserCheck, GitBranch, Award, CheckCircle2, Code2, Cpu, ShieldCheck } from 'lucide-react';

export default function StudentProfile({ onAddLedgerEntry }) {
  const handleVerifySkill = () => {
    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'GITHUB_SKILL_REVIEW_SYNC',
        actor: 'Student (Team Alpha)',
        hash: '0x' + Math.random().toString(16).slice(2, 12) + 'gh44'
      });
    }
  };

  const skills = [
    { name: 'Python & AI Engineering', level: '92%', status: 'Verified via GitHub AST' },
    { name: 'Cryptographic Ledgers', level: '88%', status: 'Verified via Commits' },
    { name: 'Systems Architecture', level: '85%', status: 'Verified via Deliverables' },
    { name: 'React & Frontend', level: '95%', status: 'Verified via Workspace' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCheck className="text-emerald-400 w-6 h-6" />
          Student Profile & Verified Skill Evidence
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          OAuth-linked developer profile with automated GitHub skill reviews and tamper-evident audit records.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6 shadow-lg space-y-4 col-span-1">
          <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl">
            SA
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Saathwi B K</h3>
            <p className="text-xs font-mono text-gray-500">CSE Branch • East Point College</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-800 font-mono text-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <GitBranch className="w-4 h-4" /> GitHub OAuth: <span className="text-white">Connected</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> DigiLocker: <span className="text-white">Level 3 Verified</span>
            </div>
          </div>

          <button
            onClick={handleVerifySkill}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold py-2 rounded-lg text-xs transition font-mono shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            Sync GitHub Skill Evidence
          </button>
        </div>

        {/* Skill Metrics Panel */}
        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6 shadow-lg space-y-4 col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono uppercase text-gray-500 flex items-center gap-2 mb-4">
              <Code2 className="w-4 h-4 text-emerald-400" /> Verified Skill Radar Metrics
            </h3>

            <div className="space-y-4">
              {skills.map((skill, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-300">{skill.name}</span>
                    <span className="text-emerald-400">{skill.level}</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: skill.level }}></div>
                  </div>
                  <div className="text-[10px] font-mono text-gray-500">{skill.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-lg flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All skill scores backed by automated AST and commit frequency analysis.</span>
          </div>
        </div>
      </div>
    </div>
  );
}