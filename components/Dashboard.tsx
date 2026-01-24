import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Bell, 
  ArrowRight,
  Target,
  Euro,
  Award,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Zap
} from 'lucide-react';
import { FundingProgram, SchoolProfile } from '../types';

interface DashboardProps {
  profile: SchoolProfile;
  programs: FundingProgram[];
  matchedPrograms: { programId: string; score: number }[];
  onSelectProgram?: (program: FundingProgram) => void;
  onNavigate?: (view: string) => void;
}

// Animated counter hook
const useAnimatedCounter = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);
      
      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    countRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [end, duration]);

  return count;
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; positive: boolean };
}> = ({ title, value, suffix = '', icon, color, trend }) => {
  const animatedValue = useAnimatedCounter(value);
  
  return (
    <div className="bg-white border border-stone-100 p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${color} scale-y-0 group-hover:scale-y-100 transition-transform origin-top`}></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-sm ${color.replace('bg-', 'bg-').replace('-600', '-50')} ${color.replace('bg-', 'text-')}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-mono ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
            <TrendingUp className={`w-3 h-3 ${!trend.positive && 'rotate-180'}`} />
            {trend.positive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold tracking-tight mb-1 font-mono">
        {animatedValue}{suffix}
      </div>
      
      <div className="text-xs font-mono uppercase tracking-widest text-stone-400">
        {title}
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  color: string;
}> = ({ icon, title, description, time, color }) => (
  <div className="flex gap-4 group">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full ${color.replace('bg-', 'bg-').replace('-600', '-100')} ${color.replace('bg-', 'text-')} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="w-px h-full bg-stone-200 my-2"></div>
    </div>
    <div className="flex-grow pb-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className="text-[10px] font-mono text-stone-400 uppercase">{time}</span>
      </div>
      <p className="text-xs text-stone-500 mt-1">{description}</p>
    </div>
  </div>
);

// Deadline Card Component
const DeadlineCard: React.FC<{
  program: FundingProgram;
  daysLeft: number;
  onClick?: () => void;
}> = ({ program, daysLeft, onClick }) => {
  const urgency = daysLeft <= 7 ? 'urgent' : daysLeft <= 30 ? 'soon' : 'normal';
  const urgencyColors = {
    urgent: 'border-red-200 bg-red-50',
    soon: 'border-amber-200 bg-amber-50',
    normal: 'border-stone-100 bg-white'
  };
  const urgencyText = {
    urgent: 'text-red-600',
    soon: 'text-amber-600',
    normal: 'text-stone-600'
  };

  return (
    <div 
      className={`p-4 border ${urgencyColors[urgency]} cursor-pointer hover:shadow-md transition-all group`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-mono uppercase tracking-wide ${urgencyText[urgency]} font-bold`}>
          {daysLeft <= 0 ? 'Abgelaufen' : daysLeft === 1 ? '1 Tag' : `${daysLeft} Tage`}
        </span>
        {urgency === 'urgent' && (
          <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
        )}
      </div>
      <h4 className="font-medium text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
        {program.title}
      </h4>
      <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
        <span>{program.provider}</span>
        <span>•</span>
        <span>{program.budget}</span>
      </div>
    </div>
  );
};

// Quick Action Button
const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
}> = ({ icon, label, description, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-4 p-4 bg-white border border-stone-100 hover:border-black hover:shadow-lg transition-all group w-full text-left"
  >
    <div className="p-2 bg-stone-50 group-hover:bg-black group-hover:text-white transition-colors">
      {icon}
    </div>
    <div className="flex-grow">
      <div className="font-medium text-sm">{label}</div>
      <div className="text-xs text-stone-400">{description}</div>
    </div>
    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  programs,
  matchedPrograms,
  onSelectProgram,
  onNavigate
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate stats
  const totalPrograms = programs.length;
  const highMatchPrograms = matchedPrograms.filter(m => m.score >= 70).length;
  const avgMatchScore = matchedPrograms.length > 0 
    ? Math.round(matchedPrograms.reduce((sum, m) => sum + m.score, 0) / matchedPrograms.length)
    : 0;
  
  // Calculate total potential funding (rough estimate based on budget strings)
  const estimatedFunding = programs.reduce((sum, p) => {
    const match = p.budget.match(/(\d+[\.,]?\d*)/);
    if (match) return sum + parseFloat(match[1].replace(',', '.')) * 1000;
    return sum;
  }, 0);

  // Get upcoming deadlines
  const getDeadlineDays = (deadline: string): number => {
    // Simple parsing for demo - in production would use proper date parsing
    if (deadline.includes('Laufend')) return 365;
    const monthMatch = deadline.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (monthMatch) {
      const deadlineDate = new Date(
        parseInt(monthMatch[3]),
        parseInt(monthMatch[2]) - 1,
        parseInt(monthMatch[1])
      );
      const diffTime = deadlineDate.getTime() - currentTime.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 180; // Default for unclear deadlines
  };

  const upcomingDeadlines = [...programs]
    .map(p => ({ program: p, daysLeft: getDeadlineDays(p.deadline) }))
    .filter(d => d.daysLeft > 0 && d.daysLeft < 180)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  // Mock activity data (in production, this would come from actual user activity)
  const recentActivity = [
    {
      icon: <FileText className="w-4 h-4" />,
      title: 'Profil aktualisiert',
      description: `Schulprofil für ${profile.name || 'Ihre Schule'} wurde gespeichert`,
      time: 'Gerade',
      color: 'bg-blue-600'
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: 'Matching abgeschlossen',
      description: `${highMatchPrograms} Programme mit hoher Übereinstimmung gefunden`,
      time: '5 Min',
      color: 'bg-green-600'
    },
    {
      icon: <Bell className="w-4 h-4" />,
      title: 'Deadline-Erinnerung',
      description: upcomingDeadlines.length > 0 
        ? `${upcomingDeadlines[0]?.program.title} endet bald`
        : 'Keine dringenden Fristen',
      time: '1 Std',
      color: 'bg-amber-600'
    }
  ];

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-12 border-b border-stone-200 pb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-400 mb-3">
          <Sparkles className="w-3 h-3" />
          Dashboard
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          {greeting()}, <br />
          <span className="text-stone-400">{profile.name || 'Willkommen'}.</span>
        </h1>
        <p className="text-lg text-stone-500 font-light max-w-2xl font-serif italic">
          "Ihr Förder-Cockpit auf einen Blick. {highMatchPrograms} Programme warten auf Ihre Bewerbung."
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard
          title="Programme gefunden"
          value={totalPrograms}
          icon={<FileText className="w-5 h-5" />}
          color="bg-blue-600"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Hohe Matches"
          value={highMatchPrograms}
          icon={<Target className="w-5 h-5" />}
          color="bg-green-600"
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Match-Score Ø"
          value={avgMatchScore}
          suffix="%"
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-purple-600"
        />
        <StatCard
          title="Potenzial"
          value={Math.round(estimatedFunding / 1000)}
          suffix="k€"
          icon={<Euro className="w-5 h-5" />}
          color="bg-amber-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Deadlines Column */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Kommende Fristen
            </h2>
            <span className="text-xs font-mono text-stone-400">
              {upcomingDeadlines.length} aktiv
            </span>
          </div>
          
          <div className="space-y-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map(({ program, daysLeft }) => (
                <DeadlineCard
                  key={program.id}
                  program={program}
                  daysLeft={daysLeft}
                  onClick={() => onSelectProgram?.(program)}
                />
              ))
            ) : (
              <div className="p-6 bg-stone-50 border border-stone-100 text-center">
                <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-500">Keine dringenden Fristen</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Letzte Aktivität
            </h2>
          </div>
          
          <div className="bg-white border border-stone-100 p-4">
            {recentActivity.map((activity, index) => (
              <ActivityItem
                key={index}
                icon={activity.icon}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                color={activity.color}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Schnellaktionen
            </h2>
          </div>
          
          <div className="space-y-3">
            <QuickAction
              icon={<FileText className="w-4 h-4" />}
              label="Neuen Antrag starten"
              description="KI-gestützte Antragserstellung"
              onClick={() => onNavigate?.('MATCHING')}
            />
            <QuickAction
              icon={<Target className="w-4 h-4" />}
              label="Matching aktualisieren"
              description="Programme neu abgleichen"
              onClick={() => onNavigate?.('MATCHING')}
            />
            <QuickAction
              icon={<Award className="w-4 h-4" />}
              label="Profil bearbeiten"
              description="Schulprofil optimieren"
              onClick={() => onNavigate?.('PROFILE')}
            />
          </div>
        </div>
      </div>

      {/* Top Matches Preview */}
      {highMatchPrograms > 0 && (
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-400 mb-3">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              Top Empfehlung
            </div>
            
            <h3 className="text-2xl font-bold mb-4">
              {matchedPrograms[0] && programs.find(p => p.id === matchedPrograms[0].programId)?.title}
            </h3>
            
            <p className="text-stone-400 mb-6 max-w-2xl text-sm">
              {matchedPrograms[0] && programs.find(p => p.id === matchedPrograms[0].programId)?.description}
            </p>
            
            <button 
              onClick={() => {
                const program = programs.find(p => p.id === matchedPrograms[0]?.programId);
                if (program) onSelectProgram?.(program);
              }}
              className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors flex items-center gap-2 group"
            >
              Antrag Starten
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
