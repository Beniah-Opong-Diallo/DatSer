import { User, Building2, Users, Database, Palette, Zap, HelpCircle, ClipboardList, LayoutDashboard, TrendingUp, Monitor, AlertTriangle } from 'lucide-react'

// Main Application Views
export const APP_VIEWS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'View Analytics', icon: TrendingUp },
    { id: 'admin', label: 'Admin Panel', icon: Users },
    { id: 'exec', label: 'Executive Attendance', icon: Monitor, requiresExec: true },
    { id: 'settings', label: 'Settings', icon: Zap }
]

// Settings Page Sections
export const SETTINGS_SECTIONS = [
    {
        id: 'account',
        label: 'Account',
        icon: User,
        color: 'blue',
        content: 'Manage your profile picture, email address, full name, password, and personal account settings. Update your avatar, change your email, modify your display name, and secure your account with password changes.',
        keywords: 'profile email avatar name personal information password security login sign in'
    },
    {
        id: 'workspace',
        label: 'Workspace',
        icon: Building2,
        color: 'purple',
        content: 'Configure your workspace name, organization settings, and ministry information. Set up your church or organization name and manage workspace preferences.',
        keywords: 'organization company ministry name settings workspace configuration'
    },
    {
        id: 'team',
        label: 'Team & Sharing',
        icon: Users,
        color: 'green',
        content: 'Add team members, invite collaborators, manage permissions, and control access to your workspace. Share your data with trusted team members and manage user roles.',
        keywords: 'collaborators sharing access members users permissions invitations team management'
    },
    {
        id: 'data',
        label: 'Data Management',
        icon: Database,
        color: 'orange',
        content: 'Export member data, import CSV files, backup your information, and manage member databases. Download attendance records, member lists, and save your data securely.',
        keywords: 'export import backup members data storage csv download upload database'
    },
    {
        id: 'appearance',
        label: 'Appearance',
        icon: Palette,
        color: 'pink',
        content: 'Customize theme, colors, and display settings. Switch between dark and light modes, adjust visual preferences, and personalize your interface.',
        keywords: 'theme dark light colors display visual interface'
    },
    {
        id: 'accessibility',
        label: 'Accessibility',
        icon: Zap,
        color: 'yellow',
        content: 'Command Menu settings. Enable or disable quick navigation with keyboard shortcuts.',
        keywords: 'command menu keyboard shortcuts navigation'
    },
    {
        id: 'help',
        label: 'Help Center',
        icon: HelpCircle,
        color: 'cyan',
        content: 'Get help and support, read documentation, view tutorials, and find answers to frequently asked questions. Learn how to use all features and troubleshoot issues.',
        keywords: 'support documentation tutorial guide FAQ help instructions getting started'
    },
    {
        id: 'activity',
        label: 'Activity Log',
        icon: ClipboardList,
        color: 'indigo',
        content: 'View a history of actions taken in your workspace. Monitor member additions, deletions, updates, and other important events.',
        keywords: 'audit logs history updates tracking activity actions events'
    },
    {
        id: 'developer',
        label: 'Developer Mode',
        icon: Monitor,
        color: 'cyan',
        requiresDeveloper: true,
        content: 'Open risky flows quickly, test interaction-heavy controls, and use the in-app sandbox before shipping changes.',
        keywords: 'developer dev qa testing sandbox smoke launchers debug preflight'
    },
    {
        id: 'danger',
        label: 'Danger Zone',
        icon: AlertTriangle,
        color: 'red',
        danger: true,
        content: 'Delete your account, remove all data, and perform destructive actions. Permanently erase your account and all associated information.',
        keywords: 'delete remove account danger destructive reset erase data clean slate'
    }
]
