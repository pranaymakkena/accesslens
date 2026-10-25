# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in AccessLens, please email security@accesslens-project.com with:

1. Description of the vulnerability.
2. Steps to reproduce.
3. Potential impact.
4. Suggested fix if available.

**Do not** open a public GitHub issue. We will acknowledge your report within 48 hours and work with you on a fix.

## Security Considerations for Deployment

### URL Scanning

AccessLens scans user-provided URLs. The following security controls are in place:

1. **SSRF Protection**: Private IP ranges, loopback, and cloud metadata endpoints are blocked.
2. **Protocol Restriction**: Only HTTP and HTTPS are allowed.
3. **Port Restriction**: Only standard ports (80, 443) are permitted.
4. **Timeouts**: Scans time out after 30 seconds to prevent long hangs.
5. **Concurrency Limits**: Maximum 3 concurrent scans per scanner instance.
6. **Process Isolation**: Each scan runs in a dedicated browser context.
7. **Error Sanitization**: Internal errors are not exposed to users.

### Known Limitations

1. **DNS Rebinding**: Not fully protected. Implement DNS-over-HTTPS or re-validate IPs on connection.
2. **Advanced Proxy Bypass**: Some bypass techniques may not be covered. Use a dedicated SSRF-safe proxy library in production.
3. **Rate Limiting**: Basic token bucket in frontend; implement per-IP rate limiting in production.

### Recommended Practices

1. **Run Behind a Proxy**: Use a reverse proxy (nginx, HAProxy) with rate limiting.
2. **Use a WAF**: Deploy a Web Application Firewall to detect and block attack patterns.
3. **Monitor Logs**: Watch for repeated scan failures or unusual patterns.
4. **Isolate the Scanner**: Run the Node.js scanner in a sandboxed container (Docker).
5. **Keep Dependencies Updated**: Regularly update axe-core, Playwright, and other dependencies.
6. **Use HTTPS**: Always use HTTPS in production.

## Vulnerability Response

1. We acknowledge reports within 48 hours.
2. We assess the vulnerability severity.
3. We provide a patched version or workaround.
4. We credit the reporter (unless they prefer anonymity).

## Version Support

- **Latest version**: Receives security updates and patches.
- **Older versions**: May receive critical patches only.

Thank you for helping keep AccessLens secure.
