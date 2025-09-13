import { 
  BarChart3, 
  Camera, 
  Map, 
  Sprout, 
  Activity, 
  AlertTriangle,
  FileText,
  Settings,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", path: "/" },
  { icon: Camera, label: "Image Analysis", path: "/image-analysis" },
  { icon: Activity, label: "Sensor Data", path: "/sensor-data" },
  { icon: Sprout, label: "AI Insights", path: "/ai-insights" },
  { icon: AlertTriangle, label: "Alerts", path: "/alerts" },
  { icon: Map, label: "Field Maps", path: "/maps" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--agro-green))] to-[hsl(var(--accent))] flex items-center justify-center">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">AgroLens</span>
        </div>
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.label}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
            <User className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-accent-foreground">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60">Agronomist</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};