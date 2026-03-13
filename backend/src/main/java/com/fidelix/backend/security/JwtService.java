package com.fidelix.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

  private final SecretKey key;
  private final String issuer;
  private final long expiryMinutes;

  public JwtService(
      @Value("${fidelix.jwt.secret}") String secret,
      @Value("${fidelix.jwt.issuer}") String issuer,
      @Value("${fidelix.jwt.expiryMinutes}") long expiryMinutes
  ) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.issuer = issuer;
    this.expiryMinutes = expiryMinutes;
  }

  public String createToken(String username, String fullName, String role) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(expiryMinutes * 60);

    return Jwts.builder()
        .issuer(issuer)
        .subject(username)
        .claims(Map.of("fullName", fullName, "role", role))
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public JwtClaims parse(String token) {
    var jws = Jwts.parser()
        .verifyWith(key)
        .requireIssuer(issuer)
        .build()
        .parseSignedClaims(token);

    var c = jws.getPayload();
    return new JwtClaims(
        c.getSubject(),
        String.valueOf(c.get("fullName")),
        String.valueOf(c.get("role"))
    );
  }

  public record JwtClaims(String username, String fullName, String role) {}
}