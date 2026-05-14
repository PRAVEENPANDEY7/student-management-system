package org.studentmanagementsystem.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtUtil {

    private final Map<String, TokenRecord> tokens = new ConcurrentHashMap<>();
    private final long expiration;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiration}") long expiration) {
        this.expiration = expiration;
    }

    public String extractUsername(String token) {
        TokenRecord record = tokens.get(token);
        if (record == null || record.expiresAt().isBefore(Instant.now())) {
            tokens.remove(token);
            throw new IllegalArgumentException("Invalid or expired token");
        }
        return record.username();
    }

    private Boolean isTokenExpired(String token) {
        TokenRecord record = tokens.get(token);
        return record == null || record.expiresAt().isBefore(Instant.now());
    }

    public String generateToken(UserDetails userDetails) {
        String rawToken = userDetails.getUsername() + ":" + UUID.randomUUID();
        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(rawToken.getBytes(StandardCharsets.UTF_8));
        tokens.put(token, new TokenRecord(userDetails.getUsername(), Instant.now().plusMillis(expiration)));
        return token;
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        return tokens.containsKey(token)
                && extractUsername(token).equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    private record TokenRecord(String username, Instant expiresAt) {
    }
}
