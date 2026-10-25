const { isValidUrl, isPrivateIp } = require('../url-validator');

describe('URL Validator', () => {
  describe('isValidUrl', () => {
    test('accepts valid HTTP URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    test('accepts valid HTTPS URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    test('accepts URL with path', () => {
      expect(isValidUrl('https://example.com/page')).toBe(true);
    });

    test('rejects FTP URL', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
    });

    test('rejects malformed URL', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });

    test('rejects URL with custom port', () => {
      expect(isValidUrl('https://example.com:8080')).toBe(false);
    });

    test('accepts standard ports', () => {
      expect(isValidUrl('http://example.com:80')).toBe(true);
      expect(isValidUrl('https://example.com:443')).toBe(true);
    });
  });

  describe('isPrivateIp', () => {
    test('detects loopback', () => {
      expect(isPrivateIp('127.0.0.1')).toBe(true);
      expect(isPrivateIp('127.0.0.2')).toBe(true);
    });

    test('detects 10.0.0.0/8', () => {
      expect(isPrivateIp('10.0.0.1')).toBe(true);
      expect(isPrivateIp('10.255.255.255')).toBe(true);
    });

    test('detects 172.16.0.0/12', () => {
      expect(isPrivateIp('172.16.0.1')).toBe(true);
      expect(isPrivateIp('172.31.255.255')).toBe(true);
    });

    test('detects 192.168.0.0/16', () => {
      expect(isPrivateIp('192.168.0.1')).toBe(true);
      expect(isPrivateIp('192.168.255.255')).toBe(true);
    });

    test('detects metadata endpoints', () => {
      expect(isPrivateIp('169.254.169.254')).toBe(true);
    });

    test('accepts public IPs', () => {
      expect(isPrivateIp('8.8.8.8')).toBe(false);
      expect(isPrivateIp('1.1.1.1')).toBe(false);
    });
  });
});
