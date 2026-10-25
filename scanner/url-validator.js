const dns = require('dns').promises;

// Private IP ranges
const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^::1$/,
  /^fd[0-9a-f]{2}:/
];

const RESERVED_IPS = [
  '169.254.169.254', // AWS metadata
  '169.254.169.253', // Azure metadata
  '0.0.0.0',
  'localhost'
];

const VALID_PORTS = [80, 443];

/**
 * Validates URL format and protocol
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Only allow standard ports 80 and 443
    if (parsed.port && !VALID_PORTS.includes(parseInt(parsed.port))) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Checks if IP is in private range
 */
function isPrivateIp(ip) {
  if (RESERVED_IPS.includes(ip)) return true;
  return PRIVATE_IP_RANGES.some(range => range.test(ip));
}

/**
 * Validates URL against SSRF attacks
 */
async function validateSSFR(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Check for private IPs in hostname
    if (isPrivateIp(hostname)) {
      return 'Access to private or reserved IP addresses is not allowed';
    }

    // Resolve hostname to IP and check again
    try {
      const addresses = await dns.resolve4(hostname);
      for (const ip of addresses) {
        if (isPrivateIp(ip)) {
          return 'Hostname resolves to a private IP address';
        }
      }
    } catch (dnsError) {
      // If DNS resolution fails, let it through (external error)
      console.warn(`DNS resolution failed for ${hostname}: ${dnsError.message}`);
    }

    return null; // OK
  } catch (error) {
    return 'Invalid URL';
  }
}

module.exports = { isValidUrl, validateSSFR, isPrivateIp };
