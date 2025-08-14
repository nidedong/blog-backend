import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Link,
  Row,
  Column,
} from '@react-email/components';

interface VerificationEmailProps {
  captcha: string;
  validityMinutes?: number;
  supportEmail?: string;
  companyName?: string;
}

const RegisterCaptchaEmail = ({
  captcha,
  validityMinutes = 5,
  supportEmail,
  companyName,
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head>
        <title>您的验证码 - {companyName}</title>
      </Head>
      <Preview>您的【{companyName}】注册账号验证码</Preview>

      <Body style={main}>
        <Container style={container}>
          {/* 头部Logo */}
          <Section style={header}>
            <Heading as="h1" style={logoText}>
              {companyName}
            </Heading>
          </Section>

          {/* 主要内容 */}
          <Section style={content}>
            <Heading as="h2" style={title}>
              您好!
            </Heading>

            <Text style={paragraph}>
              您正在尝试注册账号或执行敏感操作，请输入以下验证码完成验证：
            </Text>

            {/* 验证码展示区 */}
            <Section style={codeContainer}>
              <Row>
                {captcha.split('').map((char, index) => (
                  <Column key={index} style={codeCell}>
                    <Text style={codeText}>{char}</Text>
                  </Column>
                ))}
              </Row>
            </Section>

            <Text style={paragraph}>
              此验证码将在 <strong>{validityMinutes}分钟</strong> 后失效。
            </Text>

            <Text style={paragraph}>
              如果您没有请求此验证码，请忽略此邮件或联系支持团队。
            </Text>
          </Section>

          <Hr style={divider} />

          {/* 页脚 */}
          <Section style={footer}>
            <Text style={footerText}>
              如有任何问题，请联系我们的支持团队:{' '}
              <Link href={`mailto:${supportEmail}`} style={footerLink}>
                {supportEmail}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// 样式定义
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '40px',
};

const header = {
  marginBottom: '30px',
  textAlign: 'center' as const,
};

const logoText = {
  color: '#333333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  marginBottom: '30px',
};

const title = {
  color: '#333333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
};

const paragraph = {
  color: '#666666',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 20px 0',
};

const codeContainer = {
  backgroundColor: '#f8f8f8',
  borderRadius: '4px',
  margin: '25px 0',
  padding: '10px',
  textAlign: 'center' as const,
};

const codeCell = {
  display: 'inline-block',
  width: '40px',
  height: '60px',
  margin: '0 5px',
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textAlign: 'center' as const,
  verticalAlign: 'middle',
};

const codeText = {
  color: '#333333',
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '60px',
  margin: '0',
};

const divider = {
  border: 'none',
  borderTop: '1px solid #eaeaea',
  margin: '30px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#999999',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 10px 0',
};

const footerLink = {
  color: '#999999',
  textDecoration: 'underline',
};
export default RegisterCaptchaEmail;
