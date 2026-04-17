package com.example.JanAwaaz.service.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Jwts;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    private final Key signInKey;

    public JwtService(@Value("${app.jwt.secret}") String secretKey) {
        this.signInKey = Keys.hmacShaKeyFor(resolveKeyBytes(secretKey));
    }

    public String generateToken(String username, String role){
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(signInKey)
                .compact();
    }

    /**
     * Generates a short-lived JWT used exclusively for password reset.
     * Embeds purpose=password-reset so it cannot be used as an auth token.
     */
    public String generatePasswordResetToken(String email, long expiryMinutes) {
        return Jwts.builder()
                .setSubject(email)
                .addClaims(Map.of("purpose", "password-reset"))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiryMinutes * 60 * 1000))
                .signWith(signInKey)
                .compact();
    }

    /**
     * Validates the reset token and returns the email embedded in it.
     * Throws JwtException (or its subclasses) if invalid / expired.
     */
    public String extractEmailFromResetToken(String token) {
        Claims claims = extractAllClaims(token);
        if (!"password-reset".equals(claims.get("purpose", String.class))) {
            throw new JwtException("Not a password-reset token");
        }
        return claims.getSubject();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signInKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private byte[] resolveKeyBytes(String secretKey) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secretKey);
        } catch (IllegalArgumentException ex) {
            keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes long");
        }

        return keyBytes;
    }
}
