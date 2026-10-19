import {
  Shield,
  UserCheck,
  Lock,
  FileText,
  Key,
  HeartHandshake,
} from "lucide-react";

const ICONS = {
  shield: Shield,
  "user-check": UserCheck,
  lock: Lock,
  "file-text": FileText,
  key: Key,
  "heart-handshake": HeartHandshake,
};

export default function InfoSection({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary">{title}</h3>
        <span className="text-lg leading-none text-slate-400">⋯</span>
      </div>
      {children}
    </div>
  );
}