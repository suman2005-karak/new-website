// import { NavLink, useLocation } from 'react-router-dom';
// import { 
//   LayoutDashboard, 
//   Utensils, 
//   Dumbbell, 
//   Pill, 
//   TrendingUp, 
//   User,
//   Heart,
//   Flower2
// } from 'lucide-react';
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarHeader,
//   useSidebar,
// } from '@/components/ui/sidebar';
// import { cn } from '@/lib/utils';

// const navigation = [
//   {
//     title: 'Dashboard',
//     url: '/dashboard',
//     icon: LayoutDashboard,
//   },
//   {
//     title: 'Nutrition',
//     url: '/nutrition',
//     icon: Utensils,
//   },
//   {
//     title: 'Exercise & Meditation',
//     url: '/exercise',
//     icon: Dumbbell,
//   },
//   {
//     title: 'Medicine Reminders',
//     url: '/medicines',
//     icon: Pill,
//   },
//   {
//     title: 'Progress Tracker',
//     url: '/progress',
//     icon: TrendingUp,
//   },
//   {
//     title: 'Profile & Settings',
//     url: '/profile',
//     icon: User,
//   },
// ];

// export function AppSidebar() {
//   const { open: sidebarOpen } = useSidebar();
//   const location = useLocation();

//   return (
//     <Sidebar variant="sidebar" className="border-r border-border">
//       <SidebarHeader className="border-b border-border p-6">
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
//             <Heart className="h-5 w-5 text-primary-foreground" />
//           </div>
//           {sidebarOpen && (
//             <div className="flex flex-col">
//               <h1 className="text-lg font-bold text-foreground">WellnessHub</h1>
//               <p className="text-xs text-muted-foreground">Your Health Companion</p>
//             </div>
//           )}
//         </div>
//       </SidebarHeader>
      
//       <SidebarContent className="p-4">
//         <SidebarGroup>
//           <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
//             {sidebarOpen ? 'MAIN MENU' : ''}
//           </SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu className="space-y-1">
//               {navigation.map((item) => {
//                 const isActive = location.pathname === item.url;
//                 return (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton asChild isActive={isActive}>
//                       <NavLink
//                         to={item.url}
//                         className={cn(
//                           "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
//                           "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
//                           isActive && "bg-gradient-primary text-primary-foreground shadow-md"
//                         )}
//                       >
//                         <item.icon className="h-4 w-4 flex-shrink-0" />
//                         {sidebarOpen && <span>{item.title}</span>}
//                       </NavLink>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
        
//         {sidebarOpen && (
//           <div className="mt-auto p-4 rounded-lg bg-gradient-calm border border-border/50">
//             <div className="flex items-center gap-2 mb-2">
//               <Flower2 className="h-4 w-4 text-primary" />
//               <span className="text-sm font-medium">Daily Wellness</span>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               "A healthy outside starts from the inside."
//             </p>
//           </div>
//         )}
//       </SidebarContent>
//     </Sidebar>
//   );
// }
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  Dumbbell, 
  Pill, 
  TrendingUp, 
  User,
  Heart,
  Flower2
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navigation = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Nutrition',
    url: '/nutrition',
    icon: Utensils,
  },
  {
    title: 'Exercise & Meditation',
    url: '/exercise',
    icon: Dumbbell,
  },
  {
    title: 'Medicine Reminders',
    url: '/medicines',
    icon: Pill,
  },
  {
    title: 'Progress Tracker',
    url: '/progress',
    icon: TrendingUp,
  },
  {
    title: 'Profile & Settings',
    url: '/profile',
    icon: User,
  },
];

export function AppSidebar() {
  const { open: sidebarOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Handler for logo click - Navigate to dashboard
  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <Sidebar variant="sidebar" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-6">
        {/* ✅ Enhanced Clickable Logo/Name with animations */}
        <div 
          className={cn(
            "flex items-center gap-3 cursor-pointer transition-all duration-200",
            "hover:scale-105 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1 -m-1"
          )}
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLogoClick();
            }
          }}
          aria-label="Go to Dashboard"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary hover:shadow-lg hover:shadow-primary/50 transition-all duration-300">
            <Heart className="h-5 w-5 text-primary-foreground animate-pulse" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground hover:text-primary transition-colors duration-200">
                WellnessHub
              </h1>
              <p className="text-xs text-muted-foreground">Your Health Companion</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
            {sidebarOpen ? 'MAIN MENU' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
                          isActive && "bg-gradient-primary text-primary-foreground shadow-md scale-105"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {sidebarOpen && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {sidebarOpen && (
          <div className="mt-auto p-4 rounded-lg bg-gradient-calm border border-border/50 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-2">
              <Flower2 className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Daily Wellness</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "A healthy outside starts from the inside."
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
