import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RulesPage() {
    return (
        <div className="container py-12">
            <div className="mb-12 text-center">
                <h1 className="mb-4 text-4xl font-bold text-[#1A202C]">Contest Rules</h1>
                <p className="mx-auto max-w-2xl text-lg text-[#718096]">
                    The fine print that keeps our contests fair, fun, and slightly less chaotic than a keyboard with stuck Ctrl+Z
                    keys.
                </p>
            </div>
            <div className="mx-auto max-w-4xl">
                <Tabs defaultValue="general" className="space-y-8">
                    <TabsList className="flex w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
                        <TabsTrigger
                            value="general"
                            className="rounded-full border border-[#00C4B4] bg-transparent px-4 py-2 data-[state=active]:bg-[#00C4B4] data-[state=active]:text-white"
                        >
                            General Rules
                        </TabsTrigger>
                        <TabsTrigger
                            value="submission"
                            className="rounded-full border border-[#00C4B4] bg-transparent px-4 py-2 data-[state=active]:bg-[#00C4B4] data-[state=active]:text-white"
                        >
                            Submission Guidelines
                        </TabsTrigger>
                        <TabsTrigger
                            value="judging"
                            className="rounded-full border border-[#00C4B4] bg-transparent px-4 py-2 data-[state=active]:bg-[#00C4B4] data-[state=active]:text-white"
                        >
                            Judging Criteria
                        </TabsTrigger>
                        <TabsTrigger
                            value="prizes"
                            className="rounded-full border border-[#00C4B4] bg-transparent px-4 py-2 data-[state=active]:bg-[#00C4B4] data-[state=active]:text-white"
                        >
                            Prizes & Recognition
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-[#00C4B4]">Participation Rules</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-[#1A202C]">• All participants must register with a valid GitHub account.</p>
                                <p className="text-[#1A202C]">
                                    • Projects must be built during the contest period (7 days). Pre-existing projects are not allowed.
                                </p>
                                <p className="text-[#1A202C]">
                                    • You may use open-source libraries and frameworks, but the core functionality must be your original
                                    work.
                                </p>
                                <p className="text-[#1A202C]">
                                    • Teams of up to 3 people are allowed. All team members must be registered.
                                </p>
                                <p className="text-[#1A202C]">• One submission per person/team per contest.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-[#00C4B4]">Code of Conduct</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-[#1A202C]">
                                    • Be respectful to other participants. Harassment or offensive behavior will result in
                                    disqualification.
                                </p>
                                <p className="text-[#1A202C]">
                                    • Do not attempt to manipulate the voting system. We monitor for suspicious activity.
                                </p>
                                <p className="text-[#1A202C]">
                                    • Projects must not contain inappropriate, offensive, or illegal content.
                                </p>
                                <p className="text-[#1A202C]">• Constructive feedback is encouraged, destructive criticism is not.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="submission" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-[#00C4B4]">Submission Requirements</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-[#1A202C]">
                                    • All submissions must include a GitHub repository link with your code.
                                </p>
                                <p className="text-[#1A202C]">• Your repository must include a README.md with:</p>
                                <ul className="ml-6 list-disc space-y-2 text-[#1A202C]">
                                    <li>Project description and purpose</li>
                                    <li>Technologies used</li>
                                    <li>Installation/setup instructions</li>
                                    <li>Screenshots or demo GIFs</li>
                                    <li>Team members (if applicable)</li>
                                </ul>
                                <p className="text-[#1A202C]">• A live demo URL is highly recommended but optional.</p>
                                <p className="text-[#1A202C]">
                                    • Submissions must be received before the deadline. Late submissions will not be accepted.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-[#00C4B4]">Technical Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-[#1A202C]">• Your code should be well-documented and follow best practices.</p>
                                <p className="text-[#1A202C]">
                                    • Projects should be complete and functional, not just concepts or mockups.
                                </p>
                                <p className="text-[#1A202C]">
                                    • If your project requires specific environment variables or setup, provide clear instructions.
                                </p>
                                <p className="text-[#1A202C]">• Consider browser/device compatibility if building web applications.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="judging" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-[#00C4B4]">Voting System</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-[#1A202C]">• Community voting accounts for 70% of the final score.</p>
                                <p className="text-[#1A202C]">
                                    • Each registered user gets one vote per project (you can like multiple projects).
                                </p>
                                <p className="text-[#1A202C]">• You cannot vote for your own project.</p>
                                <p className="text-[#1A202C]">• Voting opens after the submission deadline and lasts for 3 days.</p>
                                <p className="text-[#1A202C]">• Expert judges&apos; evaluation accounts for 30% of the final score.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-[#00C4B4]">Judging Criteria</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-[#1A202C]">Projects are evaluated based on:</p>
                                <ul className="ml-6 list-disc space-y-2 text-[#1A202C]">
                                    <li>
                                        <strong>Innovation (25%)</strong>: Originality and creativity of the solution
                                    </li>
                                    <li>
                                        <strong>Technical Implementation (25%)</strong>: Code quality, architecture, and technical
                                        complexity
                                    </li>
                                    <li>
                                        <strong>Design & UX (20%)</strong>: User interface, experience, and accessibility
                                    </li>
                                    <li>
                                        <strong>Relevance to Theme (15%)</strong>: How well the project addresses the contest theme
                                    </li>
                                    <li>
                                        <strong>Completeness (15%)</strong>: Functionality and polish of the final product
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="prizes" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-[#00C4B4]">Prizes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-[#1A202C]">
                                    • <strong>1st Place</strong>: $500 Amazon gift card, featured interview on our blog, and exclusive
                                    Coderz trophy
                                </p>
                                <p className="text-[#1A202C]">
                                    • <strong>2nd Place</strong>: $250 Amazon gift card and Coderz swag pack
                                </p>
                                <p className="text-[#1A202C]">
                                    • <strong>3rd Place</strong>: $100 Amazon gift card and Coderz digital badge
                                </p>
                                <p className="text-[#1A202C]">
                                    • <strong>Honorable Mentions</strong>: Digital badges and recognition in our Hall of Fame
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-[#00C4B4]">Recognition</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-[#1A202C]">
                                    • All winners and honorable mentions will be featured in our Hall of Fame.
                                </p>
                                <p className="text-[#1A202C]">
                                    • Top projects may be featured on our social media channels and newsletter.
                                </p>
                                <p className="text-[#1A202C]">
                                    • Exceptional projects may receive mentorship opportunities with industry experts.
                                </p>
                                <p className="text-[#1A202C]">
                                    • All participants receive a participation certificate and contest badge for their portfolio.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
