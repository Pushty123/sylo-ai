import { Link } from 'react-router-dom';
import { 
  Menu, Check, Building2, User, Users, Briefcase, 
  GraduationCap, Network, LayoutDashboard, ArrowRight,
  BookOpen, Calendar, MessageSquare
} from 'lucide-react';
import SyloLogo from './SyloLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-emerald-200">
      
      {/* Top Navbar */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-emerald-600"><SyloLogo /></div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Sylo AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="bg-[#0b1b28] hover:bg-[#0f2537] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition">
            Get Started
          </Link>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-emerald-50/50 to-white text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100/60 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          One ecosystem for universities & industry
        </div>
        
        <h1 className="text-[40px] md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
          Where academia meets<br className="hidden md:block" />
          industry, <span className="text-emerald-600">work happens.</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed px-2">
          Sylo AI is the collaboration platform that brings universities, students, faculty, alumni, and industry partners into one connected ecosystem — for job placements, projects, mentorship, and real engagement.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4">
          <Link to="/auth" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-emerald-600/20">
            Get Started →
          </Link>
          <button className="flex-1 bg-white border-2 border-gray-100 text-gray-800 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition">
            See How It Works
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-20 max-w-3xl mx-auto text-left border-t border-gray-100 pt-10 px-4">
          <div>
            <div className="text-4xl font-extrabold text-emerald-600 mb-1">9</div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-500 tracking-widest leading-tight">COLLABORATION<br/>MODULES</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-emerald-600 mb-1">5</div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-500 tracking-widest leading-tight">CONNECTED<br/>ROLES</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-emerald-600 mb-1">1</div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-500 tracking-widest leading-tight">SHARED<br/>ECOSYSTEM</div>
          </div>
        </div>
      </section>

      {/* Roles / Connects Section */}
      <section className="py-16 px-4 bg-[#f8fafc]">
        <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-6 text-center">One Ecosystem Connects</h3>
        <p className="text-center font-bold text-gray-800 mb-8">Five roles — one shared network</p>
        
        <div className="max-w-md mx-auto space-y-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-emerald-100/50 p-3 rounded-xl"><Building2 className="w-6 h-6 text-emerald-700" /></div>
            <div>
              <div className="font-bold text-gray-900">Universities</div>
              <div className="text-sm text-gray-500">Administer & approve</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-emerald-100/50 p-3 rounded-xl"><User className="w-6 h-6 text-emerald-700" /></div>
            <div>
              <div className="font-bold text-gray-900">Students</div>
              <div className="text-sm text-gray-500">Learn & apply</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-emerald-100/50 p-3 rounded-xl"><GraduationCap className="w-6 h-6 text-emerald-700" /></div>
            <div>
              <div className="font-bold text-gray-900">Faculty</div>
              <div className="text-sm text-gray-500">Supervise & guide</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-emerald-100/50 p-3 rounded-xl"><Network className="w-6 h-6 text-emerald-700" /></div>
            <div>
              <div className="font-bold text-gray-900">Alumni</div>
              <div className="text-sm text-gray-500">Mentor & refer</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-emerald-100/50 p-3 rounded-xl"><Briefcase className="w-6 h-6 text-emerald-700" /></div>
            <div>
              <div className="font-bold text-gray-900">Industry</div>
              <div className="text-sm text-gray-500">Hire & collaborate</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem (Dark Section) */}
      <section className="py-24 px-4 bg-[#0b1622] text-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-emerald-400 font-bold tracking-widest text-xs mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-emerald-400"></span> THE PROBLEM
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-[1.15]">
            Collaboration happens today — just not in one place.
          </h2>
          <p className="text-gray-400 mb-12 text-lg">
            Academic-industry engagement is valuable but scattered. The work exists; the infrastructure doesn't.
          </p>
          
          <div className="space-y-4">
            <div className="bg-[#122333] border border-gray-800 p-6 md:p-8 rounded-3xl">
              <div className="text-emerald-400 font-mono text-sm font-bold mb-3">01</div>
              <h4 className="text-xl font-bold mb-2">Disconnected systems</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Placements, projects, and outreach live in email threads, spreadsheets, and inboxes that never talk to each other.</p>
            </div>
            
            <div className="bg-[#122333] border border-gray-800 p-6 md:p-8 rounded-3xl">
              <div className="text-emerald-400 font-mono text-sm font-bold mb-3">02</div>
              <h4 className="text-xl font-bold mb-2">Students can't find the door</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Relevant opportunities exist, but students hear about them late, indirectly, or not at all.</p>
            </div>

            <div className="bg-[#122333] border border-gray-800 p-6 md:p-8 rounded-3xl">
              <div className="text-emerald-400 font-mono text-sm font-bold mb-3">03</div>
              <h4 className="text-xl font-bold mb-2">No institutional view</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Universities have no single picture of who is engaging with their students, or with what outcome.</p>
            </div>

            <div className="bg-[#122333] border border-gray-800 p-6 md:p-8 rounded-3xl">
              <div className="text-emerald-400 font-mono text-sm font-bold mb-3">04</div>
              <h4 className="text-xl font-bold mb-2">Industry starts from zero</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Companies want academic talent but have no structured way in — so engagement stays ad-hoc.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions By Role */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-emerald-600 font-bold tracking-widest text-xs mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-emerald-600"></span> SOLUTIONS BY ROLE
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-12 leading-[1.15] text-gray-900">
            Built around what each participant actually needs.
          </h2>

          <div className="space-y-6">
            
            {/* Student Card */}
            <div className="bg-white border border-gray-200 p-8 rounded-[2rem] shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">For Students</h3>
              <p className="text-gray-600 mb-8">From your first hardware sprint to venture backing.</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Learn with curated R&D statements</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Build with corporate sponsored funding</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Connect with senior industry mentors</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Launch your career or spinout venture</span></li>
              </ul>
              <Link to="/student" className="inline-flex items-center gap-2 font-bold text-emerald-700 hover:text-emerald-800 transition">
                Launch Student Suite <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* University Card */}
            <div className="bg-white border border-gray-200 p-8 rounded-[2rem] shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">For Universities</h3>
              <p className="text-gray-600 mb-8">Institutional command console to elevate graduate rankings and handle private enterprise contracts.</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Automated ABET & FERPA compliance</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Faculty lab supervisory workflows</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Joint institutional IP safeguards</span></li>
              </ul>
              <Link to="/admin" className="inline-flex items-center gap-2 font-bold text-emerald-700 hover:text-emerald-800 transition">
                Campus Administration <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Industry Card */}
            <div className="bg-white border border-gray-200 p-8 rounded-[2rem] shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">For Industry</h3>
              <p className="text-gray-600 mb-8">Accelerate core technical initiatives with university laboratories while pre-hiring emerging talent.</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Milestone escrow fund release</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Live code & benchmark inspection</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-700">Zero recruiter fee candidate acquisition</span></li>
              </ul>
              <Link to="/sponsor" className="inline-flex items-center gap-2 font-bold text-emerald-700 hover:text-emerald-800 transition">
                Corporate Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}