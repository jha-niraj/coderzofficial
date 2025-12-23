'use client';

import { useState, useEffect } from 'react';
import {
    Settings, Shield, Bell, Globe, Save, RefreshCw,
    Lock, Zap
} from 'lucide-react';
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Switch } from '@repo/ui/components/ui/switch';
import { 
    Tabs, TabsContent, TabsList, TabsTrigger 
} from '@repo/ui/components/ui/tabs';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@repo/ui/components/ui/select';
import { Separator } from '@repo/ui/components/ui/separator';
import toast from '@repo/ui/components/ui/sonner';
import EmptyState from '../_components/empty-state';
import { 
    getAdminSettings, updateAdminSettings, getSystemHealth, type AdminSettings 
} from '@/actions/settingsadmin.action';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<AdminSettings>({
        general: {
            siteName: '',
            siteDescription: '',
            siteUrl: '',
            adminEmail: '',
            timezone: 'UTC',
            language: 'en',
            maintenanceMode: false,
            registrationEnabled: true
        },
        security: {
            twoFactorEnabled: false,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requireSpecialChars: true,
            apiRateLimit: 100,
            sslEnabled: true
        },
        notifications: {
            emailNotifications: true,
            newUserSignup: true,
            challengeCreated: true,
            paymentReceived: true,
            systemErrors: true,
            slackWebhook: '',
            discordWebhook: ''
        },
        platform: {
            maxChallengesPerUser: 10,
            defaultChallengeTimeLimit: 60,
            maxParticipantsPerChallenge: 100,
            allowPublicChallenges: true,
            autoApprovePublicChallenges: false,
            creditExchangeRate: 0.01,
            referralBonus: 300,
            newUserBonus: 250
        },
        integrations: {
            stripeEnabled: false,
            stripePublishableKey: '',
            stripeSecretKey: '',
            paypalEnabled: false,
            googleAnalytics: '',
            hotjarEnabled: false,
            sentryDsn: '',
            cloudinaryEnabled: false
        }
    });
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showApiKeys, setShowApiKeys] = useState(false);
    const [systemHealth, setSystemHealth] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [settingsRes, healthRes] = await Promise.all([
                getAdminSettings(),
                getSystemHealth()
            ]);

            if (settingsRes.success && settingsRes.data) {
                setSettings(settingsRes.data);
            }

            if (healthRes.success && healthRes.data) {
                setSystemHealth(healthRes.data);
            }

            setIsLoading(false);
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateAdminSettings(settings);
        setIsSaving(false);

        if (res.success) {
            toast.success('Settings saved successfully!');
        } else {
            toast.error(res.error || 'Failed to save settings');
        }
    };

    const handleGeneralChange = (field: keyof AdminSettings['general'], value: any) => {
        setSettings(prev => ({
            ...prev,
            general: { ...prev.general, [field]: value }
        }));
    };

    const handleSecurityChange = (field: keyof AdminSettings['security'], value: any) => {
        setSettings(prev => ({
            ...prev,
            security: { ...prev.security, [field]: value }
        }));
    };

    const handleNotificationChange = (field: keyof AdminSettings['notifications'], value: any) => {
        setSettings(prev => ({
            ...prev,
            notifications: { ...prev.notifications, [field]: value }
        }));
    };

    const handlePlatformChange = (field: keyof AdminSettings['platform'], value: any) => {
        setSettings(prev => ({
            ...prev,
            platform: { ...prev.platform, [field]: value }
        }));
    };

    const handleIntegrationChange = (field: keyof AdminSettings['integrations'], value: any) => {
        setSettings(prev => ({
            ...prev,
            integrations: { ...prev.integrations, [field]: value }
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
                    <p className="text-muted-foreground">
                        Configure platform settings, security, and integrations.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {
                            isSaving ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )
                        }
                        Save Changes
                    </Button>
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="platform">Platform</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                General Settings
                            </CardTitle>
                            <CardDescription>
                                Basic platform configuration and branding
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        value={settings.general.siteName}
                                        onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siteUrl">Site URL</Label>
                                    <Input
                                        id="siteUrl"
                                        value={settings.general.siteUrl}
                                        onChange={(e) => handleGeneralChange('siteUrl', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">Site Description</Label>
                                <Textarea
                                    id="siteDescription"
                                    value={settings.general.siteDescription}
                                    onChange={(e) => handleGeneralChange('siteDescription', e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="adminEmail">Admin Email</Label>
                                    <Input
                                        id="adminEmail"
                                        type="email"
                                        value={settings.general.adminEmail}
                                        onChange={(e) => handleGeneralChange('adminEmail', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select
                                        value={settings.general.timezone}
                                        onValueChange={(value) => handleGeneralChange('timezone', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">EST</SelectItem>
                                            <SelectItem value="Europe/London">GMT</SelectItem>
                                            <SelectItem value="Asia/Tokyo">JST</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Maintenance Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Temporarily disable access to the platform
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.general.maintenanceMode}
                                        onCheckedChange={(value: boolean) => handleGeneralChange('maintenanceMode', value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>User Registration</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow new users to register on the platform
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.general.registrationEnabled}
                                        onCheckedChange={(value: boolean) => handleGeneralChange('registrationEnabled', value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>
                                Configure authentication and security policies
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        value={settings.security.sessionTimeout}
                                        onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                    <Input
                                        id="maxLoginAttempts"
                                        type="number"
                                        value={settings.security.maxLoginAttempts}
                                        onChange={(e) => handleSecurityChange('maxLoginAttempts', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                                    <Input
                                        id="passwordMinLength"
                                        type="number"
                                        value={settings.security.passwordMinLength}
                                        onChange={(e) => handleSecurityChange('passwordMinLength', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apiRateLimit">API Rate Limit (per hour)</Label>
                                    <Input
                                        id="apiRateLimit"
                                        type="number"
                                        value={settings.security.apiRateLimit}
                                        onChange={(e) => handleSecurityChange('apiRateLimit', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Two-Factor Authentication</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Require 2FA for admin accounts
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.security.twoFactorEnabled}
                                        onCheckedChange={(value: boolean) => handleSecurityChange('twoFactorEnabled', value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Require Special Characters</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Passwords must contain special characters
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.security.requireSpecialChars}
                                        onCheckedChange={(value: boolean) => handleSecurityChange('requireSpecialChars', value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>SSL/HTTPS Enforcement</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Force HTTPS for all connections
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.security.sslEnabled}
                                        onCheckedChange={(value: boolean) => handleSecurityChange('sslEnabled', value)}
                                    />
                                </div>
                            </div>
                            {
                                settings.security.sslEnabled && (
                                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                SSL Certificate Active
                                            </span>
                                        </div>
                                    </div>
                                )
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Settings
                            </CardTitle>
                            <CardDescription>
                                Configure email and webhook notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enable email notifications for admin events
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.notifications.emailNotifications}
                                        onCheckedChange={(value: boolean) => handleNotificationChange('emailNotifications', value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>New User Signup</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notify when a new user registers
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.notifications.newUserSignup}
                                        onCheckedChange={(value: boolean) => handleNotificationChange('newUserSignup', value)}
                                        disabled={!settings.notifications.emailNotifications}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Challenge Created</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notify when a new challenge is created
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.notifications.challengeCreated}
                                        onCheckedChange={(value: boolean) => handleNotificationChange('challengeCreated', value)}
                                        disabled={!settings.notifications.emailNotifications}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Payment Received</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notify when payments are processed
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.notifications.paymentReceived}
                                        onCheckedChange={(value: boolean) => handleNotificationChange('paymentReceived', value)}
                                        disabled={!settings.notifications.emailNotifications}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>System Errors</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notify when system errors occur
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.notifications.systemErrors}
                                        onCheckedChange={(value: boolean) => handleNotificationChange('systemErrors', value)}
                                        disabled={!settings.notifications.emailNotifications}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                                    <Input
                                        id="slackWebhook"
                                        placeholder="https://hooks.slack.com/services/..."
                                        value={settings.notifications.slackWebhook}
                                        onChange={(e) => handleNotificationChange('slackWebhook', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                                    <Input
                                        id="discordWebhook"
                                        placeholder="https://discord.com/api/webhooks/..."
                                        value={settings.notifications.discordWebhook}
                                        onChange={(e) => handleNotificationChange('discordWebhook', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="platform" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Platform Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure challenge limits and platform behavior
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxChallenges">Max Challenges per User</Label>
                                    <Input
                                        id="maxChallenges"
                                        type="number"
                                        value={settings.platform.maxChallengesPerUser}
                                        onChange={(e) => handlePlatformChange('maxChallengesPerUser', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="defaultTimeLimit">Default Time Limit (minutes)</Label>
                                    <Input
                                        id="defaultTimeLimit"
                                        type="number"
                                        value={settings.platform.defaultChallengeTimeLimit}
                                        onChange={(e) => handlePlatformChange('defaultChallengeTimeLimit', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxParticipants">Max Participants per Challenge</Label>
                                    <Input
                                        id="maxParticipants"
                                        type="number"
                                        value={settings.platform.maxParticipantsPerChallenge}
                                        onChange={(e) => handlePlatformChange('maxParticipantsPerChallenge', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="creditRate">Credit Exchange Rate ($)</Label>
                                    <Input
                                        id="creditRate"
                                        type="number"
                                        step="0.001"
                                        value={settings.platform.creditExchangeRate}
                                        onChange={(e) => handlePlatformChange('creditExchangeRate', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="referralBonus">Referral Bonus (credits)</Label>
                                    <Input
                                        id="referralBonus"
                                        type="number"
                                        value={settings.platform.referralBonus}
                                        onChange={(e) => handlePlatformChange('referralBonus', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Allow Public Challenges</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Users can create public challenges
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.platform.allowPublicChallenges}
                                        onCheckedChange={(value: boolean) => handlePlatformChange('allowPublicChallenges', value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Auto-approve Public Challenges</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically approve public challenges without review
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.platform.autoApprovePublicChallenges}
                                        onCheckedChange={(value: boolean) => handlePlatformChange('autoApprovePublicChallenges', value)}
                                        disabled={!settings.platform.allowPublicChallenges}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="integrations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Third-party Integrations
                            </CardTitle>
                            <CardDescription>
                                Configure payment providers and external services
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EmptyState icon={Zap} title="Coming Soon" description="This feature will be available soon." />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 