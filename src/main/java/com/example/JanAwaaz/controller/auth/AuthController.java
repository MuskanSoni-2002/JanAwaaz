package com.example.JanAwaaz.controller.auth;
import com.example.JanAwaaz.dto.LoginRequestDto;
import com.example.JanAwaaz.dto.RegisterRequestDto;
import com.example.JanAwaaz.dto.RegisterResponseDto;
import com.example.JanAwaaz.service.auth.AuthService;
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
}
