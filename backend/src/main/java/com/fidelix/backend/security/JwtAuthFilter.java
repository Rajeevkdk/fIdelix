package com.fidelix.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String auth = request.getHeader("Authorization");
    if (auth != null && auth.startsWith("Bearer ")) {
      String token = auth.substring("Bearer ".length());
      try {
        var claims = jwtService.parse(token);
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + claims.role()));
        var authentication = new UsernamePasswordAuthenticationToken(claims, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
      } catch (Exception ignored) {
        // invalid token -> proceed unauthenticated
      }
    }
    String path = request.getServletPath();

if (path.equals("/api/auth/login") || path.startsWith("/api/public/") || path.equals("/api/health")) {
  filterChain.doFilter(request, response);
  return;
}

    filterChain.doFilter(request, response);
  }
}