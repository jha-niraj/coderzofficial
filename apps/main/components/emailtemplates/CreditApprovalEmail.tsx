import { 
	Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Button 
} from '@react-email/components';

interface CreditApprovalEmailProps {
	userName: string;
	creditsAwarded: number;
	newBalance: number;
	adminNotes?: string;
}

export const CreditApprovalEmail = ({
	userName,
	creditsAwarded,
	newBalance,
	adminNotes
}: CreditApprovalEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>🎉 Your credit request has been approved! {creditsAwarded.toString()} credits added to your account.</Preview>
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
							background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
							borderRadius: '12px',
							padding: '24px',
							color: 'white',
							marginBottom: '24px'
						}}>
							<div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
							<Heading style={{
								color: 'white',
								fontSize: '28px',
								fontWeight: 'bold',
								margin: '0 0 8px 0'
							}}>
								Credit Request Approved!
							</Heading>
							<Text style={{
								color: 'rgba(255, 255, 255, 0.9)',
								fontSize: '16px',
								margin: '0'
							}}>
								Great news! Your LinkedIn sharing reward is ready.
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
							Fantastic news! We&apos;ve reviewed your LinkedIn post about CoderzLab and we&apos;re thrilled to approve your credit request.
						</Text>
					</Section>
					<Section style={{
						backgroundColor: '#f0fdf4',
						border: '2px solid #22c55e',
						borderRadius: '12px',
						padding: '24px',
						marginBottom: '24px',
						textAlign: 'center'
					}}>
						<div style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '16px'
						}}>
							<div style={{ flex: 1 }}>
								<Text style={{
									fontSize: '14px',
									color: '#059669',
									fontWeight: '600',
									margin: '0 0 4px 0',
									textTransform: 'uppercase',
									letterSpacing: '0.5px'
								}}>
									Credits Awarded
								</Text>
								<Text style={{
									fontSize: '32px',
									fontWeight: 'bold',
									color: '#166534',
									margin: '0'
								}}>
									+{creditsAwarded}
								</Text>
							</div>
							<div style={{
								width: '2px',
								height: '60px',
								backgroundColor: '#22c55e',
								margin: '0 20px'
							}}></div>
							<div style={{ flex: 1 }}>
								<Text style={{
									fontSize: '14px',
									color: '#059669',
									fontWeight: '600',
									margin: '0 0 4px 0',
									textTransform: 'uppercase',
									letterSpacing: '0.5px'
								}}>
									New Balance
								</Text>
								<Text style={{
									fontSize: '32px',
									fontWeight: 'bold',
									color: '#166534',
									margin: '0'
								}}>
									{newBalance}
								</Text>
							</div>
						</div>
						<Text style={{
							fontSize: '14px',
							color: '#065f46',
							margin: '0',
							fontStyle: 'italic'
						}}>
							🚀 Ready to power up your coding journey!
						</Text>
					</Section>
					{
						adminNotes && (
							<Section style={{
								backgroundColor: '#eff6ff',
								border: '1px solid #dbeafe',
								borderRadius: '8px',
								padding: '16px',
								marginBottom: '24px'
							}}>
								<Text style={{
									fontSize: '14px',
									color: '#1e40af',
									fontWeight: '600',
									margin: '0 0 8px 0'
								}}>
									📝 Admin Note:
								</Text>
								<Text style={{
									fontSize: '14px',
									color: '#1e3a8a',
									margin: '0',
									lineHeight: '1.5'
								}}>
									{adminNotes}
								</Text>
							</Section>
						)
					}
					<Section style={{ marginBottom: '24px' }}>
						<Text style={{
							fontSize: '18px',
							fontWeight: '600',
							color: '#1f2937',
							marginBottom: '16px'
						}}>
							What can you do with your credits? 🌟
						</Text>
						<div style={{ marginBottom: '12px' }}>
							<Text style={{
								fontSize: '14px',
								color: '#4b5563',
								margin: '0 0 8px 0',
								display: 'flex',
								alignItems: 'center'
							}}>
								🤖 <span style={{ marginLeft: '8px' }}>Generate AI-powered interview questions</span>
							</Text>
							<Text style={{
								fontSize: '14px',
								color: '#4b5563',
								margin: '0 0 8px 0',
								display: 'flex',
								alignItems: 'center'
							}}>
								🐛 <span style={{ marginLeft: '8px' }}>Create and solve debugging challenges</span>
							</Text>
							<Text style={{
								fontSize: '14px',
								color: '#4b5563',
								margin: '0 0 8px 0',
								display: 'flex',
								alignItems: 'center'
							}}>
								💡 <span style={{ marginLeft: '8px' }}>Access premium learning content</span>
							</Text>
							<Text style={{
								fontSize: '14px',
								color: '#4b5563',
								margin: '0 0 8px 0',
								display: 'flex',
								alignItems: 'center'
							}}>
								🎯 <span style={{ marginLeft: '8px' }}>Take advanced skill assessments</span>
							</Text>
						</div>
					</Section>
					<Section style={{ textAlign: 'center', marginBottom: '32px' }}>
						<Button
							href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://coderzlab.com'}/dashboard`}
							style={{
								background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
								color: 'white',
								padding: '16px 32px',
								borderRadius: '8px',
								textDecoration: 'none',
								fontWeight: '600',
								fontSize: '16px',
								border: 'none',
								cursor: 'pointer',
								display: 'inline-block'
							}}
						>
							🚀 Start Using Your Credits
						</Button>
					</Section>
					<Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
					<Section style={{ textAlign: 'center' }}>
						<Text style={{
							fontSize: '14px',
							color: '#6b7280',
							margin: '0 0 8px 0'
						}}>
							Thank you for being part of the CoderzLab community! 🙏
						</Text>
						<Text style={{
							fontSize: '12px',
							color: '#9ca3af',
							margin: '0'
						}}>
							The CoderzLab Team • support@coderzlab.com
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
};

export default CreditApprovalEmail; 