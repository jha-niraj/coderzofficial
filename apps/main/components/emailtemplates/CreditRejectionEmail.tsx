import { 
    Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Button 
} from '@react-email/components';

interface CreditRejectionEmailProps {
    userName: string;
    requestedCredits: number;
    adminNotes?: string;
}

export const CreditRejectionEmail: React.FC<CreditRejectionEmailProps> = ({
    userName,
    requestedCredits,
    adminNotes
}) => {
    return (
        <Html>
            <Head />
            <Preview>Credit request update - We need a bit more from you to approve your request</Preview>
            <Body style={{
                backgroundColor: '#f8fafc',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif'
            }}>
                <Container style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            borderRadius: '12px',
                            padding: '24px',
                            color: 'white',
                            marginBottom: '24px'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚠️</div>
                            <Heading style={{
                                color: 'white',
                                fontSize: '28px',
                                fontWeight: 'bold',
                                margin: '0 0 8px 0'
                            }}>
                                Credit Request Update
                            </Heading>
                            <Text style={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '16px',
                                margin: '0'
                            }}>
                                We need a bit more to approve your request
                            </Text>
                        </div>
                    </Section>
                    <Section style={{ marginBottom: '24px' }}>
                        <Text style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '16px'
                        }}>
                            Hi {userName}! 👋
                        </Text>
                        <Text style={{
                            fontSize: '16px',
                            lineHeight: '1.6',
                            color: '#4b5563',
                            margin: '0 0 16px 0'
                        }}>
                            Thank you for submitting your credit request for <strong>{requestedCredits} credits</strong>.
                            After reviewing your LinkedIn post, we need a bit more information to approve your request.
                        </Text>
                    </Section>
                    <Section style={{
                        backgroundColor: '#fef3c7',
                        border: '2px solid #f59e0b',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <Text style={{
                            fontSize: '16px',
                            color: '#92400e',
                            fontWeight: '600',
                            margin: '0 0 12px 0'
                        }}>
                            📝 What we need from you:
                        </Text>
                        <Text style={{
                            fontSize: '15px',
                            color: '#78350f',
                            margin: '0',
                            lineHeight: '1.6'
                        }}>
                            {adminNotes || "Please ensure your LinkedIn post is public, mentions @CoderzLab, and includes our template content. You can resubmit your request once these requirements are met."}
                        </Text>
                    </Section>
                    <Section style={{ marginBottom: '24px' }}>
                        <Text style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '16px'
                        }}>
                            Requirements for approval: ✅
                        </Text>
                        <div style={{ marginBottom: '12px' }}>
                            <Text style={{
                                fontSize: '14px',
                                color: '#4b5563',
                                margin: '0 0 8px 0',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                🔗 <span style={{ marginLeft: '8px' }}>Post must be public and accessible</span>
                            </Text>
                            <Text style={{
                                fontSize: '14px',
                                color: '#4b5563',
                                margin: '0 0 8px 0',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                🏷️ <span style={{ marginLeft: '8px' }}>Include @CoderzLab mention in your post</span>
                            </Text>
                            <Text style={{
                                fontSize: '14px',
                                color: '#4b5563',
                                margin: '0 0 8px 0',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                📝 <span style={{ marginLeft: '8px' }}>Use our provided template or create similar content</span>
                            </Text>
                            <Text style={{
                                fontSize: '14px',
                                color: '#4b5563',
                                margin: '0 0 8px 0',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                🎯 <span style={{ marginLeft: '8px' }}>Share genuine experience about CoderzLab</span>
                            </Text>
                        </div>
                    </Section>
                    <Section style={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #dbeafe',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '24px'
                    }}>
                        <Text style={{
                            fontSize: '16px',
                            color: '#1e40af',
                            fontWeight: '600',
                            margin: '0 0 12px 0'
                        }}>
                            💡 What to do next:
                        </Text>
                        <Text style={{
                            fontSize: '14px',
                            color: '#1e3a8a',
                            margin: '0 0 8px 0',
                            lineHeight: '1.5'
                        }}>
                            1. Update your LinkedIn post to meet the requirements above
                        </Text>
                        <Text style={{
                            fontSize: '14px',
                            color: '#1e3a8a',
                            margin: '0 0 8px 0',
                            lineHeight: '1.5'
                        }}>
                            2. Submit a new credit request with the updated post URL
                        </Text>
                        <Text style={{
                            fontSize: '14px',
                            color: '#1e3a8a',
                            margin: '0',
                            lineHeight: '1.5'
                        }}>
                            3. We&apos;ll review it within 24 hours and approve your credits!
                        </Text>
                    </Section>
                    <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://coderzlab.com'}/purchase`}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    padding: '14px 24px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'inline-block',
                                    marginBottom: '8px'
                                }}
                            >
                                📝 Submit New Request
                            </Button>
                            <Button
                                href="https://linkedin.com"
                                style={{
                                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                                    color: 'white',
                                    padding: '14px 24px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'inline-block',
                                    marginBottom: '8px'
                                }}
                            >
                                🔗 Edit LinkedIn Post
                            </Button>
                        </div>
                    </Section>
                    <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
                    <Section style={{ textAlign: 'center' }}>
                        <Text style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: '0 0 8px 0'
                        }}>
                            We appreciate your support in sharing CoderzLab! 🙏
                        </Text>
                        <Text style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            margin: '0 0 4px 0'
                        }}>
                            Questions? Reply to this email or contact us at support@coderzlab.com
                        </Text>
                        <Text style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            margin: '0'
                        }}>
                            The CoderzLab Team
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default CreditRejectionEmail; 