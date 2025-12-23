import { 
    Avatar, AvatarImage, AvatarFallback 
} from "@repo/ui/components/ui/avatar";
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { 
    Calendar, Mail, Phone, MapPin, Github, Linkedin, Twitter, Globe, User, Key, 
    Clock, GraduationCap, Heart, Code 
} from 'lucide-react'
import { Separator } from "@repo/ui/components/ui/separator";
import { getUserDetailsById } from "@/actions/admin.action";

export default async function MenteeDetails(props: { params: Promise<{ userid: string }> }) {
    const params = await props.params;

    const {
        userid
    } = params;

    const user = await getUserDetailsById(userid, "Student");

    return (
        <div className="container mx-auto py-10">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={user.image} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left">
                            <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
                            <CardDescription className="text-xl mt-2">{user.tagline}</CardDescription>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <Badge variant="secondary">{user.role}</Badge>
                                {user.emailVerified && <Badge variant="secondary">Verified</Badge>}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">About Me</h2>
                        <p className="text-gray-600">{user.aboutme}</p>
                    </section>

                    <Separator />

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <span>{user.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <span>{user.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-gray-500" />
                                <span>Born in {user.yearofbirth}</span>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Education & Work</h2>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-gray-500" />
                            <span>{user.college}</span>
                        </div>
                    </section>

                    <Separator />

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Interests & Skills</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-gray-500" /> Interests
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.interests.map((interest: string) => (
                                        <Badge key={interest} variant="outline">{interest}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    <Code className="h-5 w-5 text-gray-500" /> Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map((skill: string) => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Social Media</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                                <Github className="h-5 w-5" />
                                {user.github}
                            </a>
                            <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                                <Linkedin className="h-5 w-5" />
                                {user.linkedin}
                            </a>
                            <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                                <Twitter className="h-5 w-5" />
                                {user.twitter}
                            </a>
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                                <Globe className="h-5 w-5" />
                                {user.website}
                            </a>
                        </div>
                    </section>

                    <Separator />

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-gray-500" />
                                <span>User ID: {user.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-gray-500" />
                                <span>Role: {user.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-500" />
                                <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </section>
                </CardContent>
            </Card>
        </div>
    )
}