import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'react-email';

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export function WelcomeEmail() {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Koyomi!</Preview>
      <Body style={{ margin: 'auto', backgroundColor: '#FAF7F2', padding: '40px 16px', fontFamily: 'sans-serif' }}>
        <Container style={{ margin: '40px auto', width: '464px', overflow: 'hidden', borderRadius: '6px', backgroundColor: '#FFFFFF' }}>
          <Section style={{ height: '255px', width: '100%', backgroundColor: '#1A1A1A', textAlign: 'center' as const }}>
            <Heading style={{ margin: '70px 0 0 0', textAlign: 'center' as const, fontSize: '48px', fontWeight: 'bold', color: '#FFFFFF' }}>
              Welcome!
            </Heading>
          </Section>
          <Section style={{ padding: '32px' }}>
            <Heading as="h2" style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#1A1A1A' }}>
              Thanks for signing up.
            </Heading>
            <Text style={{ margin: '24px 0', fontSize: '16px', color: '#4A4A4A' }}>
              Go to your studio dashboard to configure your availability and ink queue.
            </Text>
            <Button
              href={baseUrl + '/app'}
              style={{ borderRadius: '6px', backgroundColor: '#2B4C7E', padding: '12px 20px', fontWeight: '500', color: '#FFFFFF', textDecoration: 'none' }}
            >
              Open Dashboard
            </Button>
          </Section>
        </Container>
        <Container style={{ margin: '16px auto', textAlign: 'center' as const }}>
          <Text style={{ margin: '0', fontSize: '12px', color: '#888888' }}>Not interested in receiving this email?</Text>
          <Link style={{ fontSize: '12px', color: '#2B4C7E', textDecoration: 'underline' }} href={baseUrl + '/account'}>
            Manage notification preferences.
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;