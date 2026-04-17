package com.example.JanAwaaz.service.auth;

import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import io.jsonwebtoken.JwtException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PasswordResetService {

    @Autowired private JwtService jwtService;
    @Autowired private JavaMailSender mailSender;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private CitizenRepository citizenRepository;
    @Autowired private OfficerRepository officerRepository;
    @Autowired private AdminRepository adminRepository;

    @Value("${app.reset-password.token-expiry-minutes:15}")
    private long tokenExpiryMinutes;

    @Value("${app.reset-password.base-url:http://localhost:3000}")
    private String baseUrl;

    /**
     * Looks up the email across all user tables, generates a short-lived
     * JWT reset token, and emails the reset link to the user.
     * Always returns a generic message to avoid email enumeration.
     */
    public void forgotPassword(String email) {
        boolean exists = citizenRepository.findByEmail(email).isPresent()
                || officerRepository.findByEmail(email).isPresent()
                || adminRepository.findByEmail(email).isPresent();

        if (!exists) {
            // Return silently — do not reveal whether the email is registered
            return;
        }

        String token = jwtService.generatePasswordResetToken(email, tokenExpiryMinutes);
        String resetLink = baseUrl + "/reset-password?token=" + token;

        sendResetEmail(email, resetLink);
    }

    /**
     * Validates the JWT reset token, then updates the password for whichever
     * user (Citizen / Officer / Admin) owns the email in the token.
     */
    public void resetPassword(String token, String newPassword) {
        String email;
        try {
            email = jwtService.extractEmailFromResetToken(token);
        } catch (JwtException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        String encoded = passwordEncoder.encode(newPassword);

        boolean updated = tryUpdateCitizen(email, encoded)
                || tryUpdateOfficer(email, encoded)
                || tryUpdateAdmin(email, encoded);

        if (!updated) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private boolean tryUpdateCitizen(String email, String encodedPassword) {
        return citizenRepository.findByEmail(email).map(citizen -> {
            citizen.setPassword(encodedPassword);
            citizenRepository.save(citizen);
            return true;
        }).orElse(false);
    }

    private boolean tryUpdateOfficer(String email, String encodedPassword) {
        return officerRepository.findByEmail(email).map(officer -> {
            officer.setPassword(encodedPassword);
            officerRepository.save(officer);
            return true;
        }).orElse(false);
    }

    private boolean tryUpdateAdmin(String email, String encodedPassword) {
        return adminRepository.findByEmail(email).map(admin -> {
            admin.setPassword(encodedPassword);
            adminRepository.save(admin);
            return true;
        }).orElse(false);
    }

    private void sendResetEmail(String to, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("JanAwaaz — Reset Your Password");
            helper.setText(buildEmailBody(resetLink), true);
            mailSender.send(message);
        } catch (MessagingException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send reset email");
        }
    }

    private String buildEmailBody(String resetLink) {
        return "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:auto\">"
                + "<h2 style=\"color:#1a73e8\">JanAwaaz Password Reset</h2>"
                + "<p>You requested a password reset. Click the button below to set a new password.</p>"
                + "<p>This link expires in <strong>" + tokenExpiryMinutes + " minutes</strong>.</p>"
                + "<a href=\"" + resetLink + "\" "
                + "style=\"display:inline-block;padding:12px 24px;background:#1a73e8;"
                + "color:#fff;text-decoration:none;border-radius:6px;font-weight:bold\">"
                + "Reset Password</a>"
                + "<p style=\"margin-top:24px;color:#888;font-size:12px\">"
                + "If you did not request this, please ignore this email.</p>"
                + "</div>";
    }
}
