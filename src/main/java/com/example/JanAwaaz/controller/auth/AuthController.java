package com.example.JanAwaaz.controller.auth;
import com.example.JanAwaaz.dto.auth.ForgotPasswordRequestDto;
import com.example.JanAwaaz.dto.auth.LoginRequestDto;
import com.example.JanAwaaz.dto.auth.RegisterRequestDto;
import com.example.JanAwaaz.dto.auth.RegisterResponseDto;
import com.example.JanAwaaz.dto.auth.ResetPasswordRequestDto;
import com.example.JanAwaaz.service.auth.AuthService;
import com.example.JanAwaaz.service.auth.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> registerCitizen(@Valid @RequestBody RegisterRequestDto registerRequestDto){
        return new ResponseEntity<>(authService.registerCitizen(registerRequestDto), HttpStatus.CREATED);
    }

    @PostMapping("/login/citizen")
    public ResponseEntity<String> loginCitizen(@Valid @RequestBody LoginRequestDto loginRequestDto){
            return ResponseEntity.ok(authService.loginCitizen(loginRequestDto));
    }

    @PostMapping("/login/officer")
    public ResponseEntity<String> loginOfficer(@Valid @RequestBody LoginRequestDto loginRequestDto){
            return ResponseEntity.ok(authService.loginOfficer(loginRequestDto));
    }

    @PostMapping("/login/admin")
    public ResponseEntity<String> loginAdmin(@Valid @RequestBody LoginRequestDto loginRequestDto){
        return ResponseEntity.ok(authService.loginAdmin(loginRequestDto));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        passwordResetService.forgotPassword(request.email());
        // Always return the same message to prevent email enumeration
        return ResponseEntity.ok("If that email is registered, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok("Password has been reset successfully.");
    }
}
