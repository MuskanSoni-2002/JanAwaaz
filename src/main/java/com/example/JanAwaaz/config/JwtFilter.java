package com.example.JanAwaaz.config;

import com.example.JanAwaaz.service.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.example.JanAwaaz.model.Admin;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private static final java.util.Set<String> PUBLIC_ENDPOINTS = java.util.Set.of(
            "/register",
            "/login/citizen",
            "/login/officer",
            "/login/admin"
    );

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private CitizenRepository citizenRepository;

    @Autowired
    private OfficerRepository officerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return PUBLIC_ENDPOINTS.contains(path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username;
        try {
            username = jwtService.extractUsername(token);
        } catch (RuntimeException ex) {
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            AuthenticatedPrincipal principal = resolvePrincipal(username);
            if (principal != null && jwtService.isTokenValidForSubject(token, principal.subject())) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                principal.email(),
                                null,
                                java.util.List.of(new SimpleGrantedAuthority("ROLE_" + principal.role().name()))
                        );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                filterChain.doFilter(request, response);
                return;
            }

            if (looksLikeStableSubject(username)) {
                filterChain.doFilter(request, response);
                return;
            }

            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (UsernameNotFoundException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean looksLikeStableSubject(String subject) {
        return subject != null && subject.contains(":");
    }

    private AuthenticatedPrincipal resolvePrincipal(String subject) {
        String[] parts = subject.split(":", 2);
        if (parts.length != 2) {
            return null;
        }

        Long userId;
        try {
            userId = Long.parseLong(parts[1]);
        } catch (NumberFormatException ex) {
            return null;
        }

        UserRole role;
        try {
            role = UserRole.valueOf(parts[0]);
        } catch (IllegalArgumentException ex) {
            return null;
        }

        return switch (role) {
            case CITIZEN -> citizenRepository.findById(userId)
                    .filter(citizen -> Boolean.TRUE.equals(citizen.getActive()))
                    .map(citizen -> new AuthenticatedPrincipal(
                            citizen.getEmail(),
                            role,
                            jwtService.buildSubject(role, citizen.getCitizenId())
                    ))
                    .orElse(null);
            case OFFICER -> officerRepository.findById(userId)
                    .filter(officer -> Boolean.TRUE.equals(officer.getActive()))
                    .map(officer -> new AuthenticatedPrincipal(
                            officer.getEmail(),
                            role,
                            jwtService.buildSubject(role, officer.getOfficerId())
                    ))
                    .orElse(null);
            case ADMIN -> adminRepository.findById(userId)
                    .filter(admin -> Boolean.TRUE.equals(admin.getActive()))
                    .map(admin -> new AuthenticatedPrincipal(
                            admin.getEmail(),
                            role,
                            jwtService.buildSubject(role, admin.getAdminId())
                    ))
                    .orElse(null);
        };
    }

    private record AuthenticatedPrincipal(String email, UserRole role, String subject) {
    }
}
