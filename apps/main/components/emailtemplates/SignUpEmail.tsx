import { 
    Html, Body, Head, Heading, Hr, Container, Preview, Section, Text 
} from '@react-email/components';

interface WelcomeEmailProps {
    username: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
    username
}) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Our Platform</Preview>
            <Body style={{ backgroundColor: '#ffffff' }}>
                <Container>
                    <Section>
                        <Heading>Welcome, {username}!</Heading>
                        <Text>We&apos;re excited to have you on board.</Text>
                        <Text>
                            Get started by exploring our platform and discovering all the features we offer.
                        </Text>
                        <Hr />
                        <Text>
                            If you have any questions, feel free to reach out to our support team.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default WelcomeEmail;