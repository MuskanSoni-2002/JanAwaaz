package com.example.JanAwaaz.config;

import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import com.example.JanAwaaz.service.auth.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtFilterTest {
    private static final String TEST_JWT_SECRET = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void stableCitizenSubjectAuthenticatesUsingCurrentEmail() throws Exception {
        CitizenRepository citizenRepository = mock(CitizenRepository.class);
        OfficerRepository officerRepository = mock(OfficerRepository.class);
        AdminRepository adminRepository = mock(AdminRepository.class);
        JwtService jwtService = new JwtService(TEST_JWT_SECRET);

        Citizen citizen = new Citizen();
        citizen.setCitizenId(7L);
        citizen.setEmail("new@example.com");
        citizen.setRole(UserRole.CITIZEN);
        citizen.setActive(true);

        when(citizenRepository.findById(7L)).thenReturn(Optional.of(citizen));

        TestJwtFilter jwtFilter = new TestJwtFilter();
        ReflectionTestUtils.setField(jwtFilter, "jwtService", jwtService);
        ReflectionTestUtils.setField(jwtFilter, "citizenRepository", citizenRepository);
        ReflectionTestUtils.setField(jwtFilter, "officerRepository", officerRepository);
        ReflectionTestUtils.setField(jwtFilter, "adminRepository", adminRepository);

        String token = jwtService.generateToken(
                jwtService.buildSubject(UserRole.CITIZEN, 7L),
                "ROLE_CITIZEN"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/citizens/me");
        request.addHeader("Authorization", "Bearer " + token);

        jwtFilter.invokeFilter(
                request,
                new MockHttpServletResponse(),
                (req, res) -> { }
        );

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals("new@example.com", authentication.getName());
        assertEquals("ROLE_CITIZEN", authentication.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void invalidStableSubjectDoesNotAuthenticate() throws Exception {
        CitizenRepository citizenRepository = mock(CitizenRepository.class);
        OfficerRepository officerRepository = mock(OfficerRepository.class);
        AdminRepository adminRepository = mock(AdminRepository.class);
        JwtService jwtService = new JwtService(TEST_JWT_SECRET);

        when(citizenRepository.findById(99L)).thenReturn(Optional.empty());

        TestJwtFilter jwtFilter = new TestJwtFilter();
        ReflectionTestUtils.setField(jwtFilter, "jwtService", jwtService);
        ReflectionTestUtils.setField(jwtFilter, "citizenRepository", citizenRepository);
        ReflectionTestUtils.setField(jwtFilter, "officerRepository", officerRepository);
        ReflectionTestUtils.setField(jwtFilter, "adminRepository", adminRepository);

        String token = jwtService.generateToken(
                jwtService.buildSubject(UserRole.CITIZEN, 99L),
                "ROLE_CITIZEN"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/citizens/me");
        request.addHeader("Authorization", "Bearer " + token);

        jwtFilter.invokeFilter(
                request,
                new MockHttpServletResponse(),
                (req, res) -> { }
        );

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    private static class TestJwtFilter extends JwtFilter {
        void invokeFilter(
                MockHttpServletRequest request,
                MockHttpServletResponse response,
                jakarta.servlet.FilterChain filterChain
        ) throws jakarta.servlet.ServletException, IOException {
            doFilterInternal(request, response, filterChain);
        }
    }
}
